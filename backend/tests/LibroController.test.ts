import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { LibroController } from "../Controllers/LibroController";
import { Request, Response } from "express";
import { supabase } from "../src/Config/supabase";

describe("LibroController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: any;
  let jsonMock: any;

  beforeEach(() => {
    req = {};
    jsonMock = vi.fn();
    statusMock = vi.fn(() => ({ json: jsonMock }));
    res = { status: statusMock, json: jsonMock };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("getLibro responde 200 con datos", async () => {
    vi.spyOn(supabase, "from").mockReturnValueOnce({
      select: vi.fn().mockResolvedValue({ data: [{ id_libro: 1, titulo: "Libro1" }], error: null })
    } as any);

    await LibroController.getLibro(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith([{ id_libro: 1, titulo: "Libro1" }]);
  });

  it("getLibroId responde 200 con datos de un libro", async () => {
    req.params = { id: "1" };

    vi.spyOn(supabase, "from").mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id_libro: 1, titulo: "Libro1" },
            error: null
          })
        })
      })
    } as any);

    await LibroController.getLibroId(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      data: { id_libro: 1, titulo: "Libro1" },
      message: "Libro obtenido correctamente"
    });
  });

  it("getLibroPorTitulo responde 200 si encuentra libros", async () => {
    req.params = { titulo: "Libro1" };

    vi.spyOn(supabase, "from").mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        ilike: vi.fn().mockResolvedValue({
          data: [{ id_libro: 1, titulo: "Libro1" }],
          error: null
        })
      })
    } as any);

    await LibroController.getLibroPorTitulo(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      data: [{ id_libro: 1, titulo: "Libro1" }],
      message: "Libros encontrados"
    });
  });

  it("getLibroPorGenero responde 404 si no encuentra libros", async () => {
    req.params = { genero: "Fantasía" };

    vi.spyOn(supabase, "from").mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        ilike: vi.fn().mockResolvedValue({ data: [], error: null })
      })
    } as any);

    await LibroController.getLibroPorGenero(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({
      message: "No se encontraron libros del género 'Fantasía'"
    });
  });
});
