import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import express from "express";
import autorRouter from "../../Routes/AutorRouter";
import { supabase } from "../../src/Config/supabase";

const app = express();
app.use(express.json());
app.use("/api/autor", autorRouter);

describe("AutorController E2E Tests - GET Endpoints", () => {
  let testAuthorId: number;

  beforeAll(async () => {
    const { data, error } = await supabase
      .from("autor")
      .insert({ nombre: "E2E Test Author" })
      .select()
      .single();

    if (error) throw new Error(error.message);
    testAuthorId = data.id_autor;
  });

  afterAll(async () => {
    await supabase.from("autor").delete().eq("id_autor", testAuthorId);
  });

  it("GET /api/autor - should return all authors", async () => {
    const res = await request(app).get("/api/autor");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((a: any) => a.id_autor === testAuthorId)).toBe(true);
  });

  it("GET /api/autor/nombre/:nombre - should return authors by name", async () => {
    const res = await request(app).get("/api/autor/nombre/Test");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0].nombre).toBe("E2E Test Author");
  });
});
