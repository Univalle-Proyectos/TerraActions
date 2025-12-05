import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../../src/app";
import { supabase } from "../../src/Config/supabase";
import { randomUUID } from "crypto";

describe("SignupController - Integration Tests", () => {
  // Generate unique identifiers for this test run to avoid conflicts
  const testId = randomUUID().slice(0, 8);
  
  const testUser = {
    nombre: "Carlos",
    apellido: "González",
    email: `carlos.test.${testId}@example.com`,
    telefono: "77777777",
    direccion: "Av. Test 456",
    genero: "M",
    ci_cliente: `9999${testId.slice(0, 4)}`,
    usuario: `carlostest_${testId}`,
    password: "test123456",
  };

  let createdPersonaId: number | null = null;
  let createdClienteCI: string | null = null;

  beforeAll(async () => {
    // Clean up any existing test data before starting
    await cleanupTestData(testUser.ci_cliente, testUser.usuario, testUser.email);
  });

  afterAll(async () => {
    // Clean up after all tests complete
    if (createdClienteCI) {
      await cleanupTestData(createdClienteCI, testUser.usuario, testUser.email);
    }
  });

  async function cleanupTestData(ci: string, usuario: string, email: string) {
    try {
      // Delete cliente first (child record)
      const { data: cliente } = await supabase
        .from("cliente")
        .select("id_persona")
        .eq("ci_cliente", ci)
        .maybeSingle();

      if (cliente) {
        await supabase
          .from("cliente")
          .delete()
          .eq("ci_cliente", ci);

        await supabase
          .from("persona")
          .delete()
          .eq("id_persona", cliente.id_persona);
      }

      // Clean up by usuario
      const { data: clienteByUsuario } = await supabase
        .from("cliente")
        .select("id_persona")
        .eq("usuario", usuario)
        .maybeSingle();

      if (clienteByUsuario) {
        await supabase
          .from("cliente")
          .delete()
          .eq("usuario", usuario);

        await supabase
          .from("persona")
          .delete()
          .eq("id_persona", clienteByUsuario.id_persona);
      }

      // Clean up by email
      const { data: personaByEmail } = await supabase
        .from("persona")
        .select("id_persona")
        .eq("email", email)
        .maybeSingle();

      if (personaByEmail) {
        await supabase
          .from("cliente")
          .delete()
          .eq("id_persona", personaByEmail.id_persona);

        await supabase
          .from("persona")
          .delete()
          .eq("id_persona", personaByEmail.id_persona);
      }
    } catch (error) {
      // Ignore cleanup errors on first run
      console.log("Cleanup warning:", error);
    }
  }

  describe("POST /api/signup", () => {
    it("debe crear un cliente exitosamente con datos válidos", async () => {
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

      // Verify in database
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

    it("debe retornar error 400 cuando falta el nombre", async () => {
      const uniqueId = randomUUID().slice(0, 8);
      const invalidUser: any = { 
        ...testUser,
        ci_cliente: `8888${uniqueId.slice(0, 4)}`,
        usuario: `user_${uniqueId}`,
        email: `test.${uniqueId}@example.com`
      };
      delete invalidUser.nombre;

      const response = await request(app)
        .post("/api/signup")
        .send(invalidUser)
        .expect(400);

      expect(response.body).toHaveProperty("error", "Faltan datos obligatorios");
    });

    it("debe retornar error 400 cuando falta el apellido", async () => {
      const uniqueId = randomUUID().slice(0, 8);
      const invalidUser: any = { 
        ...testUser,
        ci_cliente: `8889${uniqueId.slice(0, 4)}`,
        usuario: `user_${uniqueId}`,
        email: `test.${uniqueId}@example.com`
      };
      delete invalidUser.apellido;

      const response = await request(app)
        .post("/api/signup")
        .send(invalidUser)
        .expect(400);

      expect(response.body).toHaveProperty("error", "Faltan datos obligatorios");
    });

    it("debe retornar error 400 cuando falta el email", async () => {
      const uniqueId = randomUUID().slice(0, 8);
      const invalidUser: any = { 
        ...testUser,
        ci_cliente: `8890${uniqueId.slice(0, 4)}`,
        usuario: `user_${uniqueId}`,
      };
      delete invalidUser.email;

      const response = await request(app)
        .post("/api/signup")
        .send(invalidUser)
        .expect(400);

      expect(response.body).toHaveProperty("error", "Faltan datos obligatorios");
    });

    it("debe retornar error 400 cuando falta el ci_cliente", async () => {
      const uniqueId = randomUUID().slice(0, 8);
      const invalidUser: any = { 
        ...testUser,
        usuario: `user_${uniqueId}`,
        email: `test.${uniqueId}@example.com`
      };
      delete invalidUser.ci_cliente;

      const response = await request(app)
        .post("/api/signup")
        .send(invalidUser)
        .expect(400);

      expect(response.body).toHaveProperty("error", "Faltan datos obligatorios");
    });

    it("debe retornar error 400 cuando falta el usuario", async () => {
      const uniqueId = randomUUID().slice(0, 8);
      const invalidUser: any = { 
        ...testUser,
        ci_cliente: `8891${uniqueId.slice(0, 4)}`,
        email: `test.${uniqueId}@example.com`
      };
      delete invalidUser.usuario;

      const response = await request(app)
        .post("/api/signup")
        .send(invalidUser)
        .expect(400);

      expect(response.body).toHaveProperty("error", "Faltan datos obligatorios");
    });

    it("debe retornar error 400 cuando falta el password", async () => {
      const uniqueId = randomUUID().slice(0, 8);
      const invalidUser: any = { 
        ...testUser,
        ci_cliente: `8892${uniqueId.slice(0, 4)}`,
        usuario: `user_${uniqueId}`,
        email: `test.${uniqueId}@example.com`
      };
      delete invalidUser.password;

      const response = await request(app)
        .post("/api/signup")
        .send(invalidUser)
        .expect(400);

      expect(response.body).toHaveProperty("error", "Faltan datos obligatorios");
    });

    it("debe retornar error 400 cuando el CI ya existe", async () => {
      const uniqueId = randomUUID().slice(0, 8);
      const firstUser = {
        ...testUser,
        ci_cliente: `7777${uniqueId.slice(0, 4)}`,
        usuario: `first_${uniqueId}`,
        email: `first.${uniqueId}@example.com`,
      };

      // Create first user
      await request(app)
        .post("/api/signup")
        .send(firstUser)
        .expect(201);

      // Try to create duplicate with same CI
      const duplicateUser = {
        ...firstUser,
        email: `second.${uniqueId}@example.com`,
        usuario: `second_${uniqueId}`,
      };

      const response = await request(app)
        .post("/api/signup")
        .send(duplicateUser)
        .expect(400);

      expect(response.body).toHaveProperty("error", "El CI del cliente ya existe");

      // Cleanup
      await cleanupTestData(firstUser.ci_cliente, firstUser.usuario, firstUser.email);
    });

    it("debe retornar error 400 cuando el usuario ya existe", async () => {
      const uniqueId = randomUUID().slice(0, 8);
      const firstUser = {
        ...testUser,
        ci_cliente: `6666${uniqueId.slice(0, 4)}`,
        usuario: `duplicate_${uniqueId}`,
        email: `first.${uniqueId}@example.com`,
      };

      // Create first user
      await request(app)
        .post("/api/signup")
        .send(firstUser)
        .expect(201);

      // Try to create duplicate with same username
      const duplicateUser = {
        ...firstUser,
        ci_cliente: `5555${uniqueId.slice(0, 4)}`,
        email: `second.${uniqueId}@example.com`,
      };

      const response = await request(app)
        .post("/api/signup")
        .send(duplicateUser)
        .expect(400);

      expect(response.body).toHaveProperty("error", "El nombre de usuario ya existe");

      // Cleanup
      await cleanupTestData(firstUser.ci_cliente, firstUser.usuario, firstUser.email);
    });

    it("debe manejar correctamente el rollback cuando falla la creación del cliente", async () => {
      const uniqueId = randomUUID().slice(0, 8);
      const invalidClienteData = {
        ...testUser,
        email: `rollback.${uniqueId}@example.com`,
        ci_cliente: undefined,
      };

      const response = await request(app)
        .post("/api/signup")
        .send(invalidClienteData)
        .expect(400);

      expect(response.body).toHaveProperty("error");

      // Verify no persona was created
      const { data: personaCheck } = await supabase
        .from("persona")
        .select("*")
        .eq("email", invalidClienteData.email)
        .maybeSingle();

      expect(personaCheck).toBeNull();
    });
  });

  describe("GET /api/signup", () => {
    it("debe obtener todos los clientes con sus datos de persona", async () => {
      const uniqueId = randomUUID().slice(0, 8);
      const getTestUser = {
        ...testUser,
        ci_cliente: `4444${uniqueId.slice(0, 4)}`,
        usuario: `gettest_${uniqueId}`,
        email: `gettest.${uniqueId}@example.com`,
      };

      // Create a user first
      await request(app)
        .post("/api/signup")
        .send(getTestUser)
        .expect(201);

      const response = await request(app)
        .get("/api/signup")
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      const clienteCreado = response.body.find(
        (c: any) => c.ci_cliente === getTestUser.ci_cliente
      );

      expect(clienteCreado).toBeTruthy();
      expect(clienteCreado).toHaveProperty("persona");
      expect(clienteCreado.persona.nombre).toBe(getTestUser.nombre);
      expect(clienteCreado.persona.email).toBe(getTestUser.email);

      // Cleanup
      await cleanupTestData(getTestUser.ci_cliente, getTestUser.usuario, getTestUser.email);
    });

    it("debe retornar un array vacío o con datos cuando se consulta", async () => {
      const response = await request(app)
        .get("/api/signup")
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("Validación de integridad de datos", () => {
    it("debe mantener la relación entre persona y cliente", async () => {
      const uniqueId = randomUUID().slice(0, 8);
      const relationUser = {
        ...testUser,
        ci_cliente: `3333${uniqueId.slice(0, 4)}`,
        usuario: `relation_${uniqueId}`,
        email: `relation.${uniqueId}@example.com`,
      };

      const response = await request(app)
        .post("/api/signup")
        .send(relationUser)
        .expect(201);

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

      // Cleanup
      await cleanupTestData(relationUser.ci_cliente, relationUser.usuario, relationUser.email);
    });

    it("debe crear registros con los datos correctos en ambas tablas", async () => {
      const uniqueId = randomUUID().slice(0, 8);
      const dataUser = {
        ...testUser,
        ci_cliente: `2222${uniqueId.slice(0, 4)}`,
        usuario: `data_${uniqueId}`,
        email: `data.${uniqueId}@example.com`,
      };

      const response = await request(app)
        .post("/api/signup")
        .send(dataUser)
        .expect(201);

      const personaId = response.body.persona.id_persona;

      const { data: persona } = await supabase
        .from("persona")
        .select("*")
        .eq("id_persona", personaId)
        .single();

      expect(persona.nombre).toBe(dataUser.nombre);
      expect(persona.apellido).toBe(dataUser.apellido);
      expect(persona.email).toBe(dataUser.email);
      expect(persona.telefono).toBe(dataUser.telefono);
      expect(persona.direccion).toBe(dataUser.direccion);
      expect(persona.genero).toBe(dataUser.genero);

      const { data: cliente } = await supabase
        .from("cliente")
        .select("*")
        .eq("ci_cliente", dataUser.ci_cliente)
        .single();

      expect(cliente.ci_cliente).toBe(dataUser.ci_cliente);
      expect(cliente.usuario).toBe(dataUser.usuario);
      expect(cliente.password).toBe(dataUser.password);
      expect(cliente.id_persona).toBe(personaId);

      // Cleanup
      await cleanupTestData(dataUser.ci_cliente, dataUser.usuario, dataUser.email);
    });
  });
});