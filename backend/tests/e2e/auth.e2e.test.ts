import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { supabase } from '../../src/Config/supabase';

describe('Auth E2E Tests', () => {
  let authToken: string;
  
  const testUsers = {
    valid: {
      usuario: process.env.TEST_USER || 'papen',
      password: process.env.TEST_PASSWORD || 'papen',
      ci_cliente: process.env.TEST_CI || '10369742',
      id_persona: 289
    },
    another: {
      usuario: 'e2e_test_user2',
      password: 'e2e_password456',
      ci_cliente: '77777777',
      id_persona: 777
    }
  };

  beforeAll(async () => {
    console.log('🔧 Configurando datos de prueba...');
    
    await supabase.from('cliente').delete().eq('ci_cliente', testUsers.valid.ci_cliente);
    await supabase.from('cliente').delete().eq('ci_cliente', testUsers.another.ci_cliente);

    const { data: user1, error: error1 } = await supabase.from('cliente').insert({
      ci_cliente: testUsers.valid.ci_cliente,
      id_persona: testUsers.valid.id_persona,
      usuario: testUsers.valid.usuario,
      password: testUsers.valid.password,
    }).select();

    const { data: user2, error: error2 } = await supabase.from('cliente').insert({
      ci_cliente: testUsers.another.ci_cliente,
      id_persona: testUsers.another.id_persona,
      usuario: testUsers.another.usuario,
      password: testUsers.another.password,
    }).select();

    if (error1 || error2) {
      console.error('❌ Error creando usuarios de prueba:', error1 || error2);
    } else {
      console.log('✅ Usuarios de prueba creados:', user1, user2);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    console.log('🧹 Limpiando datos de prueba...');
    await supabase.from('cliente').delete().eq('ci_cliente', testUsers.valid.ci_cliente);
    await supabase.from('cliente').delete().eq('ci_cliente', testUsers.another.ci_cliente);
  });

  describe('Escenario completo de autenticación', () => {
    it('debería rechazar acceso sin autenticación', async () => {
      const response = await request(app)
        .get('/api/auth/perfil');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('debería permitir login con credenciales válidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          usuario: testUsers.valid.usuario,
          password: testUsers.valid.password
        });

      console.log('Login response:', response.status, response.body);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(typeof response.body.token).toBe('string');
      expect(response.body.token.length).toBeGreaterThan(50);

      authToken = response.body.token;
    });

    it('debería acceder a perfil con token válido', async () => {
      const response = await request(app)
        .get('/api/auth/perfil')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('mensaje', 'Ruta protegida');
      expect(response.body).toHaveProperty('cliente');
      expect(response.body.cliente).toHaveProperty('usuario', testUsers.valid.usuario);
      expect(response.body.cliente).toHaveProperty('ci_cliente', testUsers.valid.ci_cliente);
    });

    it('debería rechazar token inválido', async () => {
      const response = await request(app)
        .get('/api/auth/perfil')
        .set('Authorization', 'Bearer token_falso_12345');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('debería rechazar credenciales incorrectas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          usuario: testUsers.valid.usuario,
          password: 'password_incorrecto'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(['Contraseña incorrecta', 'Usuario no encontrado']).toContain(response.body.error);
    });

    it('debería rechazar usuario inexistente', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          usuario: 'usuario_que_no_existe_xyz',
          password: 'cualquier_password'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Usuario no encontrado');
    });
  });

  describe('Validación de campos', () => {
    it('debería rechazar login sin usuario', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'test123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Usuario y contraseña requeridos');
    });

    it('debería rechazar login sin password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          usuario: 'testuser'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Usuario y contraseña requeridos');
    });

    it('debería rechazar login sin credenciales', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Usuario y contraseña requeridos');
    });
  });

  

  describe('Formatos de token inválidos', () => {
    it('debería rechazar token sin Bearer', async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          usuario: testUsers.valid.usuario,
          password: testUsers.valid.password
        });

      const token = loginResponse.body.token;

      const response = await request(app)
        .get('/api/auth/perfil')
        .set('Authorization', token);

      expect(response.status).toBe(401);
    });

    it('debería rechazar token vacío', async () => {
      const response = await request(app)
        .get('/api/auth/perfil')
        .set('Authorization', 'Bearer ');

      expect(response.status).toBe(401);
    });

    it('debería rechazar header malformado', async () => {
      const response = await request(app)
        .get('/api/auth/perfil')
        .set('Authorization', 'InvalidFormat token123');

      expect(response.status).toBe(401);
    });
  });

  describe('Flujo de trabajo realista', () => {
    it('debería completar un flujo típico de usuario', async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          usuario: testUsers.valid.usuario,
          password: testUsers.valid.password
        });

      expect(loginResponse.status).toBe(200);
      const token = loginResponse.body.token;

      const perfilResponse = await request(app)
        .get('/api/auth/perfil')
        .set('Authorization', `Bearer ${token}`);

      expect(perfilResponse.status).toBe(200);
      expect(perfilResponse.body.cliente.usuario).toBe(testUsers.valid.usuario);

      const unauthorizedResponse = await request(app)
        .get('/api/auth/perfil');

      expect(unauthorizedResponse.status).toBe(401);
    });

    it('debería manejar múltiples intentos de login consecutivos', async () => {
      for (let i = 0; i < 3; i++) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            usuario: testUsers.valid.usuario,
            password: testUsers.valid.password
          });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
      }
    });

  });
});