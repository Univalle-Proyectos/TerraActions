import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PersonaController } from "../Controllers/PersonaController";
import { Request, Response } from "express";
import { supabase } from "../src/Config/supabase";

describe("PersonaController", () => {
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

  it("getPersona responde 200 con datos", async () => {
    vi.spyOn(supabase, "from").mockReturnValueOnce({
      select: vi.fn().mockResolvedValue({ data: [{ id_persona: 1, nombre: "Juan" }], error: null })
    } as any);

    await PersonaController.getPersona(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith([{ id_persona: 1, nombre: "Juan" }]);
  });

  it("getPersonaById responde 200 con datos", async () => {
    req.params = { id: "1" };

    vi.spyOn(supabase, "from").mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id_persona: 1, nombre: "Juan" }, error: null })
        })
      })
    } as any);

    await PersonaController.getPersonaById(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({ id_persona: 1, nombre: "Juan" });
  });

  it("createPersona responde 201 con datos insertados", async () => {
    req.body = { nombre: "Pedro" };

    vi.spyOn(supabase, "from").mockReturnValueOnce({
      insert: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { id_persona: 2, nombre: "Pedro" }, error: null })
      })
    } as any);

    await PersonaController.createPersona(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(201);
    expect(jsonMock).toHaveBeenCalledWith({ id_persona: 2, nombre: "Pedro" });
  });

  it("updatePersona responde 200 con datos actualizados", async () => {
    req.params = { id: "2" };
    req.body = { nombre: "Pedro Actualizado" };

    vi.spyOn(supabase, "from").mockReturnValueOnce({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id_persona: 2, nombre: "Pedro Actualizado" }, error: null })
        })
      })
    } as any);

    await PersonaController.updatePersona(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({ id_persona: 2, nombre: "Pedro Actualizado" });
  });

  it("deletePersona responde 200 con mensaje", async () => {
    req.params = { id: "2" };

    vi.spyOn(supabase, "from").mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      })
    } as any);

    await PersonaController.deletePersona(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({ mensaje: "Persona eliminada exitosamente" });
  });

  it("getPersonaById devuelve 400 si ID inválido", async () => {
    req.params = { id: "abc" };

    await PersonaController.getPersonaById(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ error: "ID inválido" });
  });

  it("updatePersona devuelve 400 si ID inválido", async () => {
    req.params = { id: "abc" };
    req.body = { nombre: "Test" };

    await PersonaController.updatePersona(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ error: "ID inválido" });
  });

  it("deletePersona devuelve 400 si ID inválido", async () => {
    req.params = { id: "abc" };

    await PersonaController.deletePersona(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ error: "ID inválido" });
  });
});
