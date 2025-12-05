import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../../Middlewares/authMiddleWare';
import * as jwtUtils from '../../src/utils/jwt';

vi.mock('../../src/utils/jwt');

describe('authMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let statusMock: any;
  let jsonMock: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    mockNext = vi.fn();

    mockRequest = {
      headers: {},
    };

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };
  });

  it('debería retornar 401 si no hay header de autorización', async () => {
    mockRequest.headers = {};

    authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Token no proporcionado',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('debería retornar 401 si el formato del token es inválido', async () => {
    mockRequest.headers = {
      authorization: 'InvalidFormat',
    };

    authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Token no proporcionado',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('debería retornar 401 si el token es inválido', async () => {
    mockRequest.headers = {
      authorization: 'Bearer invalid_token',
    };

    vi.mocked(jwtUtils.verifyToken).mockReturnValue(null);

    authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(jwtUtils.verifyToken).toHaveBeenCalledWith('invalid_token');
    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Token inválido',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('debería llamar a next() si el token es válido', async () => {
    const mockPayload = {
      ci_cliente: '12345',
      usuario: 'testuser',
    };

    mockRequest.headers = {
      authorization: 'Bearer valid_token',
    };

    vi.mocked(jwtUtils.verifyToken).mockReturnValue(mockPayload);

    authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(jwtUtils.verifyToken).toHaveBeenCalledWith('valid_token');
    expect((mockRequest as any).user).toEqual(mockPayload);
    expect(mockNext).toHaveBeenCalled();
    expect(statusMock).not.toHaveBeenCalled();
  });

  it('debería manejar errores inesperados', async () => {
    mockRequest.headers = {
      authorization: 'Bearer valid_token',
    };

    vi.mocked(jwtUtils.verifyToken).mockImplementation(() => {
      throw new Error('Unexpected error');
    });

    authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Token inválido',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
});