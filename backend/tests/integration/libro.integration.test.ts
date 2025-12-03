import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import express from "express";
import libroRouter from "../../Routes/LibroRouter";
import { supabase } from "../../src/Config/supabase";

vi.mock("../../src/Config/supabase", () => {
  const mockData = [
    { idLibro: 1, titulo: "Test", genero: "Ficción", isbn: "123", sinopsis: "Sinopsis", editorial: "Editorial", fechaPublicacion: new Date() }
  ];

  const single = vi.fn().mockResolvedValue({ data: mockData[0], error: null });
  const eq = vi.fn().mockReturnValue({ single });
  const ilike = vi.fn().mockResolvedValue({ data: mockData, error: null });
  const select = vi.fn().mockReturnValue({ eq, ilike });
  const from = vi.fn().mockReturnValue({ select, eq, ilike });

  return { supabase: { from } };
});

const app = express();
app.use(express.json());
app.use("/libros", libroRouter);

describe("LibroController - Integración", () => {

  it("GET /libros - debe retornar todos los libros", async () => {
    const res = await request(app).get("/libros");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("GET /libros/id/:id - debe retornar un libro por id", async () => {
    const res = await request(app).get("/libros/id/1");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toHaveProperty("idLibro", 1);
  });

  it("GET /libros/titulo/:titulo - debe retornar libros por título", async () => {
    const res = await request(app).get("/libros/titulo/Test");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(res.body.data[0].titulo).toBe("Test");
  });

  it("GET /libros/genero/:genero - debe retornar libros por género", async () => {
    const res = await request(app).get("/libros/genero/Ficción");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(res.body.data[0].genero).toBe("Ficción");
  });

});
