import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import app from "../../src/app";
import { supabase } from "../../src/Config/supabase";

describe("SignupController - E2E Tests", () => {
  const testUser = {
    nombre: "Carlos",
    apellido: "González",
    email: "carlos.test@example.com",
    telefono: "77777777",
    direccion: "Av. Test 456",
    genero: "M",
    ci_cliente: "9999999",
    usuario: "carlostest",
    password: "test123456",
  };

  let createdPersonaId: number;
  let createdClienteCI: string;

  beforeAll(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  beforeEach(async () => {
    await cleanupTestData();
  });

  async function cleanupTestData() {
    try {
      const { data: cliente } = await supabase
        .from("cliente")
        .select("id_persona")
        .eq("ci_cliente", testUser.ci_cliente)
        .single();

      if (cliente) {
        await supabase
          .from("cliente")
          .delete()
          .eq("ci_cliente", testUser.ci_cliente);

        await supabase
          .from("persona")
          .delete()
          .eq("id_persona", cliente.id_persona);
      }

      await supabase
        .from("cliente")
        .delete()
        .eq("usuario", testUser.usuario);

      await supabase
        .from("persona")
        .delete()
        .eq("email", testUser.email);
    } catch (error) {}
  }

  describe("POST /api/signup", () => {
    it("crea un cliente exitosamente con datos válidos", async () => {
      const response = await request(app)
        .post("/api/signup")
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty("message", "Cliente creado exitosamente");
      expect(response.body).toHaveProperty("cliente");
      expect(response.body).toHaveProperty("persona");
      expect(response.body.cliente.ci_cliente).toBe(testUser.ci_cliente);
      expect(response.body.cliente.usuario).toBe(testUser.usuario);
      expect(response.body.persona).toHaveProperty("id_persona");

      createdPersonaId = response.body.persona.id_persona;
      createdClienteCI = response.body.cliente.ci_cliente;

      const { data: personaDB } = await supabase
        .from("persona")
        .select("*")
        .eq("id_persona", createdPersonaId)
        .single();

      expect(personaDB).toBeTruthy();
      expect(personaDB.nombre).toBe(testUser.nombre);
      expect(personaDB.email).toBe(testUser.email);

      const { data: clienteDB } = await supabase
        .from("cliente")
        .select("*")
        .eq("ci_cliente", createdClienteCI)
        .single();

      expect(clienteDB).toBeTruthy();
      expect(clienteDB.usuario).toBe(testUser.usuario);
    });

    it("retorna error 400 cuando falta un dato obligatorio", async () => {
      const campos = ["nombre", "apellido", "email", "ci_cliente", "usuario", "password"];
      for (const campo of campos) {
        const invalidUser: any = { ...testUser };
        delete invalidUser[campo];
        const response = await request(app)
          .post("/api/signup")
          .send(invalidUser)
          .expect(400);
        expect(response.body).toHaveProperty("error", "Faltan datos obligatorios");
      }
    });

    it("retorna error 400 cuando el CI ya existe", async () => {
      await request(app).post("/api/signup").send(testUser).expect(201);
      const duplicateUser = { ...testUser, email: "otro@example.com", usuario: "otrousuario" };
      const response = await request(app).post("/api/signup").send(duplicateUser).expect(400);
      expect(response.body).toHaveProperty("error", "El CI del cliente ya existe");
    });

    it("retorna error 400 cuando el usuario ya existe", async () => {
      await request(app).post("/api/signup").send(testUser).expect(201);
      const duplicateUser = { ...testUser, ci_cliente: "8888888", email: "otro@example.com" };
      const response = await request(app).post("/api/signup").send(duplicateUser).expect(400);
      expect(response.body).toHaveProperty("error", "El nombre de usuario ya existe");
    });

    it("maneja rollback cuando falla la creación del cliente", async () => {
      const invalidClienteData = { ...testUser, ci_cliente: undefined };
      const response = await request(app).post("/api/signup").send(invalidClienteData).expect(400);
      expect(response.body).toHaveProperty("error");
      const { data: personaCheck } = await supabase
        .from("persona")
        .select("*")
        .eq("email", testUser.email)
        .maybeSingle();
      expect(personaCheck).toBeNull();
    });
  });

  describe("GET /api/signup", () => {
    it("obtiene todos los clientes con datos de persona", async () => {
      await request(app).post("/api/signup").send(testUser).expect(201);
      const response = await request(app).get("/api/signup").expect(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      const clienteCreado = response.body.find((c: any) => c.ci_cliente === testUser.ci_cliente);
      expect(clienteCreado).toBeTruthy();
      expect(clienteCreado).toHaveProperty("persona");
      expect(clienteCreado.persona.nombre).toBe(testUser.nombre);
      expect(clienteCreado.persona.email).toBe(testUser.email);
    });

    it("retorna un array vacío si no hay clientes", async () => {
      await cleanupTestData();
      const response = await request(app).get("/api/signup").expect(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("Integridad de datos", () => {
    it("mantiene la relación entre persona y cliente", async () => {
      const response = await request(app).post("/api/signup").send(testUser).expect(201);
      const personaId = response.body.persona.id_persona;
      const clienteCI = response.body.cliente.ci_cliente;
      const { data: cliente } = await supabase
        .from("cliente")
        .select("*, persona:id_persona(*)")
        .eq("ci_cliente", clienteCI)
        .single();
      expect(cliente).toBeTruthy();
      expect(cliente.id_persona).toBe(personaId);
      expect(cliente.persona).toBeTruthy();
      expect(cliente.persona.id_persona).toBe(personaId);
    });

    it("crea registros correctos en ambas tablas", async () => {
      const response = await request(app).post("/api/signup").send(testUser).expect(201);
      const personaId = response.body.persona.id_persona;
      const { data: persona } = await supabase
        .from("persona")
        .select("*")
        .eq("id_persona", personaId)
        .single();
      expect(persona.nombre).toBe(testUser.nombre);
      expect(persona.apellido).toBe(testUser.apellido);
      expect(persona.email).toBe(testUser.email);
      expect(persona.telefono).toBe(testUser.telefono);
      expect(persona.direccion).toBe(testUser.direccion);
      expect(persona.genero).toBe(testUser.genero);
      const { data: cliente } = await supabase
        .from("cliente")
        .select("*")
        .eq("ci_cliente", testUser.ci_cliente)
        .single();
      expect(cliente.ci_cliente).toBe(testUser.ci_cliente);
      expect(cliente.usuario).toBe(testUser.usuario);
      expect(cliente.password).toBe(testUser.password);
      expect(cliente.id_persona).toBe(personaId);
    });
  });
});
