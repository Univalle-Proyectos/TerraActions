import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { login, perfil } from '../../Controllers/AuthController';
import { supabase } from '../../src/Config/supabase';
import * as jwtUtils from '../../src/utils/jwt';

vi.mock('../../src/Config/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock('../../src/utils/jwt', () => ({
  generateToken: vi.fn(),
}));

describe('AuthController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let statusMock: any;
  let jsonMock: any;

  beforeEach(() => {
    vi.clearAllMocks();
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    
    mockRequest = {
      body: {},
    };

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };
  });

  describe('login', () => {
    it('debería retornar error 400 si falta usuario o password', async () => {
      mockRequest.body = { usuario: 'test' };

      await login(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Usuario y contraseña requeridos',
      });
    });

    it('debería retornar error 401 si el usuario no existe', async () => {
      mockRequest.body = { usuario: 'test', password: 'test123' };

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' },
            }),
          }),
        }),
      });

      (supabase.from as any) = mockFrom;

      await login(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Usuario no encontrado',
      });
    });

    it('debería retornar error 401 si la contraseña es incorrecta', async () => {
      mockRequest.body = { usuario: 'testuser', password: 'wrongpass' };

      const mockClienteData = {
        ci_cliente: '12345',
        id_persona: 1,
        usuario: 'testuser',
        password: 'correctpass',
      };

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockClienteData,
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as any) = mockFrom;

      await login(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Contraseña incorrecta',
      });
    });

    it('debería retornar token 200 si las credenciales son correctas', async () => {
      mockRequest.body = { usuario: 'papen', password: 'papen' };

      const mockClienteData = {
        ci_cliente: '10369742',
        id_persona: 289,
        usuario: 'papen',
        password: 'papen',
      };

      const mockToken = 'mock-jwt-token-123';

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockClienteData,
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as any) = mockFrom;
      vi.mocked(jwtUtils.generateToken).mockReturnValue(mockToken);

      await login(mockRequest as Request, mockResponse as Response);

      expect(jwtUtils.generateToken).toHaveBeenCalledWith({
        ci_cliente: '10369742',
        usuario: 'papen',
      });
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({ token: mockToken });
    });

    it('debería retornar error 500 si hay un error en el servidor', async () => {
      mockRequest.body = { usuario: 'testuser', password: 'test123' };

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockRejectedValue(new Error('Database error')),
          }),
        }),
      });

      (supabase.from as any) = mockFrom;

      await login(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Error en el servidor',
      });
    });
  });

  describe('perfil', () => {
    it('debería retornar los datos del usuario autenticado', async () => {
      const mockUser = {
        ci_cliente: '12345',
        usuario: 'testuser',
      };

      (mockRequest as any).user = mockUser;

      await perfil(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        mensaje: 'Ruta protegida',
        cliente: mockUser,
      });
    });
  });
});