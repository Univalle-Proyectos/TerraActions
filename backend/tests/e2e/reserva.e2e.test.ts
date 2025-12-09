import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { supabase } from '../../src/Config/supabase';

describe('ReservaController - E2E Tests', () => {
    let testClienteCi: string;
    let testLibroId: number;
    let createdReservaIds: number[] = [];

    beforeAll(async () => {
        testClienteCi = '9999bc05';
        const { data: clienteExiste } = await supabase
            .from('cliente')
            .select('ci_cliente')
            .eq('ci_cliente', testClienteCi)
            .maybeSingle();

        if (!clienteExiste) throw new Error(`Cliente ${testClienteCi} no existe en la BD.`);
        testLibroId = 17;
    });

    afterAll(async () => {
        for (const id of createdReservaIds) {
            await supabase.from('cli_mul_res').delete().eq('id_reserva', id);
            await supabase.from('detalle_reserva').delete().eq('id_reserva', id);
            await supabase.from('reserva').delete().eq('id_reserva', id);
        }
    });

    beforeEach(() => {
        createdReservaIds = [];
    });

    describe('GET /api/reserva', () => {
        it('debe obtener todas las reservas', async () => {
            const res = await request(app).get('/api/reserva').expect(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    describe('POST /api/reserva/directa', () => {
        it('debe retornar error 400 cuando falta ci_cliente', async () => {
            const res = await request(app).post('/api/reserva/directa').send({ id_libro: testLibroId }).expect(400);
            expect(res.body.success).toBe(false);
        });

        it('debe retornar error 400 cuando falta id_libro', async () => {
            const res = await request(app).post('/api/reserva/directa').send({ ci_cliente: testClienteCi }).expect(400);
            expect(res.body.success).toBe(false);
        });

        it('debe retornar error 400 con id_libro inexistente', async () => {
            const res = await request(app).post('/api/reserva/directa').send({ ci_cliente: testClienteCi, id_libro: 999999 }).expect(400);
            expect(res.body.success).toBe(false);
        });

        it('debe crear una reserva correctamente', async () => {
            const res = await request(app)
                .post('/api/reserva/directa')
                .send({ ci_cliente: testClienteCi, id_libro: testLibroId })
                .expect(201);

            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('id_reserva');
            createdReservaIds.push(res.body.data.id_reserva);
        });
    });
});
