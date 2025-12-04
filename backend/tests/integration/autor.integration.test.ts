import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import autorRouter from "../../Routes/AutorRouter";
import { supabase } from "../../src/Config/supabase";

vi.mock("../../src/Config/supabase", () => {
  return {
    supabase: {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
    }
  };
});

const app = express();
app.use(express.json());
app.use("/api/autor", autorRouter);

describe("AutorController Integration Tests", () => {
  const mockAutores = [
    { id_autor: 1, nombre: "Gabriel García Márquez" },
    { id_autor: 2, nombre: "J.K. Rowling" }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /api/autor - should return all authors", async () => {
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: mockAutores, error: null })
    });

    const res = await request(app).get("/api/autor");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockAutores);
  });

  it("GET /api/autor/:id - should return author by ID", async () => {
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockAutores[0], error: null })
        })
      })
    });

    const res = await request(app).get("/api/autor/1");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockAutores[0]);
  });

  it("GET /api/autor/nombre/:nombre - should return authors by name", async () => {
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnValue({
        ilike: vi.fn().mockResolvedValue({ data: [mockAutores[1]], error: null })
      })
    });

    const res = await request(app).get("/api/autor/nombre/Rowling");
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([mockAutores[1]]);
  });

  it("POST /api/autor - should create a new author", async () => {
    const newAuthor = { nombre: "New Author" };
    (supabase.from as any).mockReturnValue({
      insert: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { id_autor: 3, ...newAuthor }, error: null })
      })
    });

    const res = await request(app).post("/api/autor").send(newAuthor);
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id_autor: 3, ...newAuthor });
  });

  it("PUT /api/autor/:id - should update an author", async () => {
    const updatedAuthor = { nombre: "Updated Name" };
    (supabase.from as any).mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [{ id_autor: 1, ...updatedAuthor }], error: null })
      })
    });

    const res = await request(app).put("/api/autor/1").send(updatedAuthor);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id_autor: 1, ...updatedAuthor }]);
  });

  it("DELETE /api/autor/:id - should delete an author", async () => {
    (supabase.from as any).mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      })
    });

    const res = await request(app).delete("/api/autor/1");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ mensaje: "Autor eliminado exitosamente" });
  });
});
 