import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import app from "../../src/app";

const autoresMock = [{ id_autor: 1, nombre: "Gabriel García Márquez" }];

vi.mock("../../src/Config/supabase", () => {
  const dataMock = () => Promise.resolve({ data: autoresMock, error: null });

  const chainMock = {
    select: () => chainMock,
    eq: () => chainMock,
    ilike: () => chainMock,
    single: dataMock,
    then: (resolve: any) => dataMock().then(resolve),
  };

  return {
    supabase: {
      from: vi.fn(() => chainMock),
    },
  };
});

describe("AutorController - Read Operations", () => {
  it("debería obtener todos los autores", async () => {
    const res = await request(app).get("/api/autor");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(autoresMock);
  });

  it("debería buscar autores por nombre", async () => {
    const res = await request(app).get("/api/autor/nombre/Gabriel");
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(autoresMock);
  });
});
