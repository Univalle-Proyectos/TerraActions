import request from "supertest";
import app from "../src/app";
import { describe, it, expect } from "vitest";

describe("GET /api", () => {
  it("debería responder 200", async () => {
    const res = await request(app).get("/api");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Hola desde Express!");
  });
});
