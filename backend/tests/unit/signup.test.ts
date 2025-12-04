import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response } from "express";
import { SignupController } from "../../Controllers/signupController";
import { supabase } from "../../src/Config/supabase";

vi.mock("../../src/Config/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe("SignupController - signUp", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: any;
  let jsonMock: any;

  beforeEach(() => {
    jsonMock = vi.fn();
    statusMock = vi.fn(() => ({ json: jsonMock }));

    req = {
      body: {
        nombre: "Juan",
        apellido: "Pérez",
        email: "juan@example.com",
        telefono: "12345678",
        direccion: "Calle 123",
        genero: "M",
        ci_cliente: "12345678",
        usuario: "juanperez",
        password: "password123",
      },
    };

    res = {
      status: statusMock,
      json: jsonMock,
    };

    vi.clearAllMocks();
  });

  it("debe retornar error 400 cuando falta el nombre", async () => {
    req.body!.nombre = undefined;

    await SignupController.signUp(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ error: "Faltan datos obligatorios" });
  });

  it("debe retornar error 400 cuando falta el apellido", async () => {
    req.body!.apellido = undefined;

    await SignupController.signUp(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ error: "Faltan datos obligatorios" });
  });

  it("debe retornar error 400 cuando falta el email", async () => {
    req.body!.email = undefined;

    await SignupController.signUp(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ error: "Faltan datos obligatorios" });
  });

  it("debe retornar error 400 cuando falta el ci_cliente", async () => {
    req.body!.ci_cliente = undefined;

    await SignupController.signUp(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ error: "Faltan datos obligatorios" });
  });

  it("debe retornar error 400 cuando falta el usuario", async () => {
    req.body!.usuario = undefined;

    await SignupController.signUp(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ error: "Faltan datos obligatorios" });
  });

  it("debe retornar error 400 cuando falta el password", async () => {
    req.body!.password = undefined;

    await SignupController.signUp(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ error: "Faltan datos obligatorios" });
  });

  it("debe retornar error 400 cuando el CI ya existe", async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { ci_cliente: "12345678" },
            error: null,
          }),
        }),
      }),
    });

    (supabase.from as any) = mockFrom;

    await SignupController.signUp(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ error: "El CI del cliente ya existe" });
  });

  it("debe retornar error 400 cuando el usuario ya existe", async () => {
    const mockFrom = vi.fn()
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { usuario: "juanperez" },
              error: null,
            }),
          }),
        }),
      });

    (supabase.from as any) = mockFrom;

    await SignupController.signUp(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ error: "El nombre de usuario ya existe" });
  });

  it("debe retornar error 400 cuando falla la creación de persona", async () => {
    const mockFrom = vi.fn()
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      })
      .mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Error al insertar persona" },
            }),
          }),
        }),
      });

    (supabase.from as any) = mockFrom;

    await SignupController.signUp(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      error: "Error al crear persona",
      details: "Error al insertar persona",
    });
  });

  it("debe retornar error 400 cuando no se devuelven datos de persona", async () => {
    const mockFrom = vi.fn()
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      })
      .mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      });

    (supabase.from as any) = mockFrom;

    await SignupController.signUp(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      error: "Error al crear persona",
      details: "No se devolvieron datos",
    });
  });

  it("debe retornar error 400 cuando falla la creación de cliente y eliminar persona", async () => {
    const deletePersonaMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    });

    const mockFrom = vi.fn()
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      })
      .mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id_persona: 1 },
              error: null,
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Error al insertar cliente" },
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        delete: deletePersonaMock,
      });

    (supabase.from as any) = mockFrom;

    await SignupController.signUp(req as Request, res as Response);

    expect(deletePersonaMock).toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      error: "Error al crear cliente",
      details: "Error al insertar cliente",
    });
  });

  it("debe retornar error 400 cuando no se devuelven datos de cliente y eliminar persona", async () => {
    const deletePersonaMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    });

    const mockFrom = vi.fn()
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      })
      .mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id_persona: 1 },
              error: null,
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        delete: deletePersonaMock,
      });

    (supabase.from as any) = mockFrom;

    await SignupController.signUp(req as Request, res as Response);

    expect(deletePersonaMock).toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      error: "Error al crear cliente",
      details: "No se devolvieron datos",
    });
  });

  it("debe retornar error 500 cuando ocurre un error inesperado", async () => {
    const mockFrom = vi.fn().mockImplementation(() => {
      throw new Error("Error inesperado del servidor");
    });

    (supabase.from as any) = mockFrom;

    await SignupController.signUp(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      error: "Error en el servidor",
      details: "Error inesperado del servidor",
    });
  });

  it("debe crear cliente exitosamente cuando todos los datos son válidos", async () => {
    const mockFrom = vi.fn()
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      })
      .mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id_persona: 1 },
              error: null,
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                ci_cliente: "12345678",
                id_persona: 1,
                usuario: "juanperez",
              },
              error: null,
            }),
          }),
        }),
      });

    (supabase.from as any) = mockFrom;

    await SignupController.signUp(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(201);
    expect(jsonMock).toHaveBeenCalledWith({
      message: "Cliente creado exitosamente",
      cliente: {
        ci_cliente: "12345678",
        id_persona: 1,
        usuario: "juanperez",
      },
      persona: { id_persona: 1 },
    });
  });
});