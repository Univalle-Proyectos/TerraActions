import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import express, { Application } from "express"; 
import libroRouter from "../../Routes/LibroRouter";

let app: Application; 

beforeAll(() => {
  process.env.NODE_ENV = "test";

  app = express();
  app.use(express.json());
  app.use("/libros", libroRouter);
});

describe("E2E - Libros (Supabase real)", () => {

  it("GET /libros - debería retornar todos los libros", async () => {
    const res = await request(app).get("/libros");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("GET /libros/id/:id - debería retornar un libro por ID", async () => {
    const res = await request(app).get("/libros/id/1");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("id_libro");
  });

  it("GET /libros/titulo/:titulo - debería retornar libros por título", async () => {
    const res = await request(app).get("/libros/titulo/a");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("GET /libros/genero/:genero - debería retornar libros por género", async () => {
    const res = await request(app).get("/libros/genero/Ficción");

    expect([200, 404]).toContain(res.status);

    if (res.status === 200) {
      expect(Array.isArray(res.body.data)).toBe(true);
    }
  });

});
