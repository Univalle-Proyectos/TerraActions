import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Request, Response } from 'express';
import { ReservaController } from '../../Controllers/ReservaController';

vi.mock('../../src/Config/supabase', () => {
  const mockFrom = vi.fn();
  return {
    supabase: {
      from: mockFrom
    }
  };
});

import { supabase } from '../../src/Config/supabase';

describe('ReservaController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let statusMock: any;
  let jsonMock: any;
  let mockFrom: any;

  beforeEach(() => {
    jsonMock = vi.fn();
    statusMock = vi.fn(() => ({ json: jsonMock }));
    
    mockResponse = {
      status: statusMock,
      json: jsonMock
    };

    mockFrom = supabase.from as any;

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getReservas', () => {
    it('debe retornar todas las reservas exitosamente', async () => {
      const mockData = [
        { id_reserva: 1, fec_reserva: '2024-01-01' },
        { id_reserva: 2, fec_reserva: '2024-01-02' }
      ];

      const mockSelect = vi.fn().mockResolvedValue({
        data: mockData,
        error: null
      });

      mockFrom.mockReturnValue({
        select: mockSelect
      });

      mockRequest = {};

      await ReservaController.getReservas(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockFrom).toHaveBeenCalledWith('reserva');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockData);
    });

    it('debe retornar error 500 cuando falla la consulta', async () => {
      const mockError = new Error('Database error');

      const mockSelect = vi.fn().mockResolvedValue({
        data: null,
        error: mockError
      });

      mockFrom.mockReturnValue({
        select: mockSelect
      });

      mockRequest = {};

      await ReservaController.getReservas(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Fallo al obtener reservas'
      });
    });
  });

  describe('crearReservaDirecta', () => {
    it('debe crear una reserva exitosamente con datos válidos', async () => {
      mockRequest = {
        body: {
          ci_cliente: '10369742',
          id_libro: 1
        }
      };

      const mockStockData = [{ id_stock: 1 }];
      const mockReservaData = { id_reserva: 100 };

      const mockLimit = vi.fn().mockResolvedValue({
        data: mockStockData,
        error: null
      });

      const mockEqDisponibilidad = vi.fn().mockReturnValue({
        limit: mockLimit
      });

      const mockEqLibro = vi.fn().mockReturnValue({
        eq: mockEqDisponibilidad
      });

      const mockSelectStock = vi.fn().mockReturnValue({
        eq: mockEqLibro
      });

      const mockSingle = vi.fn().mockResolvedValue({
        data: mockReservaData,
        error: null
      });

      const mockSelectReserva = vi.fn().mockReturnValue({
        single: mockSingle
      });

      const mockInsertReserva = vi.fn().mockReturnValue({
        select: mockSelectReserva
      });

      const mockInsertDetalle = vi.fn().mockResolvedValue({
        data: null,
        error: null
      });

      const mockEqStock = vi.fn().mockResolvedValue({
        data: null,
        error: null
      });

      const mockUpdateStock = vi.fn().mockReturnValue({
        eq: mockEqStock
      });

      const mockInsertCliMulRes = vi.fn().mockResolvedValue({
        data: null,
        error: null
      });

      let callCount = 0;
      mockFrom.mockImplementation((table: string) => {
        if (table === 'stock' && callCount === 0) {
          callCount++;
          return { select: mockSelectStock };
        }
        if (table === 'reserva') {
          return { insert: mockInsertReserva };
        }
        if (table === 'detalle_reserva') {
          return { insert: mockInsertDetalle };
        }
        if (table === 'stock') {
          return { update: mockUpdateStock };
        }
        if (table === 'cli_mul_res') {
          return { insert: mockInsertCliMulRes };
        }
      });

      await ReservaController.crearReservaDirecta(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: 'Reserva creada exitosamente',
        data: {
          id_reserva: 100,
          id_libro: 1,
          ci_cliente: '10369742'
        }
      });
    });

    it('debe retornar error 400 cuando faltan campos requeridos', async () => {
      mockRequest = {
        body: {
          id_libro: 1
        }
      };

      await ReservaController.crearReservaDirecta(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Los campos id_libro y ci_cliente son requeridos'
      });
    });

    it('debe retornar error 400 cuando el libro no está disponible', async () => {
      mockRequest = {
        body: {
          ci_cliente: '10369742',
          id_libro: 1
        }
      };

      const mockLimit = vi.fn().mockResolvedValue({
        data: [], 
        error: null
      });

      const mockEqDisponibilidad = vi.fn().mockReturnValue({
        limit: mockLimit
      });

      const mockEqLibro = vi.fn().mockReturnValue({
        eq: mockEqDisponibilidad
      });

      const mockSelectStock = vi.fn().mockReturnValue({
        eq: mockEqLibro
      });

      mockFrom.mockReturnValue({
        select: mockSelectStock
      });

      await ReservaController.crearReservaDirecta(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'El libro no está disponible para reserva'
      });
    });

    it('debe retornar error 500 cuando ocurre un error en la base de datos', async () => {
      mockRequest = {
        body: {
          ci_cliente: '10369742',
          id_libro: 1
        }
      };

      const mockError = new Error('Database connection failed');

      const mockLimit = vi.fn().mockResolvedValue({
        data: null,
        error: mockError
      });

      const mockEqDisponibilidad = vi.fn().mockReturnValue({
        limit: mockLimit
      });

      const mockEqLibro = vi.fn().mockReturnValue({
        eq: mockEqDisponibilidad
      });

      const mockSelectStock = vi.fn().mockReturnValue({
        eq: mockEqLibro
      });

      mockFrom.mockReturnValue({
        select: mockSelectStock
      });

      await ReservaController.crearReservaDirecta(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Error al crear la reserva',
        error: 'Database connection failed'
      });
    });
  });

  describe('getLibroStockDisponibles', () => {
    it('debe retornar libros con stock disponible', async () => {
      const mockData = [
        {
          id_libro: 1,
          titulo: 'Libro 1',
          stock: [{ id_stock: 1, disponibilidad: true }]
        },
        {
          id_libro: 2,
          titulo: 'Libro 2',
          stock: [{ id_stock: 2, disponibilidad: true }]
        }
      ];

      const mockEq = vi.fn().mockResolvedValue({
        data: mockData,
        error: null
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq
      });

      mockFrom.mockReturnValue({
        select: mockSelect
      });

      mockRequest = {};

      await ReservaController.getLibroStockDisponibles(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockFrom).toHaveBeenCalledWith('libro');
      expect(mockSelect).toHaveBeenCalledWith('*, stock!inner(*)');
      expect(mockEq).toHaveBeenCalledWith('stock.disponibilidad', true);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockData
      });
    });

    it('debe retornar error 500 cuando falla la consulta', async () => {
      const mockError = new Error('Query failed');

      const mockEq = vi.fn().mockResolvedValue({
        data: null,
        error: mockError
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq
      });

      mockFrom.mockReturnValue({
        select: mockSelect
      });

      mockRequest = {};

      await ReservaController.getLibroStockDisponibles(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Error al obtener libros disponibles',
        error: 'Query failed'
      });
    });

    it('debe retornar array vacío cuando no hay libros disponibles', async () => {
      const mockEq = vi.fn().mockResolvedValue({
        data: [],
        error: null
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq
      });

      mockFrom.mockReturnValue({
        select: mockSelect
      });

      mockRequest = {};

      await ReservaController.getLibroStockDisponibles(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        count: 0,
        data: []
      });
    });
  });
});