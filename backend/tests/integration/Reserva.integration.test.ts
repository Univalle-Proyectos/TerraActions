import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { supabase } from '../../src/Config/supabase';

describe('ReservaController - Integration Tests', () => {
    let testLibroId: number;
    let testClienteCi: string;
    let createdReservaIds: number[] = [];

    beforeAll(async () => {
        testClienteCi = '9999bc05';

        const { data: clienteExiste, error: clienteError } = await supabase
            .from('cliente')
            .select('ci_cliente')
            .eq('ci_cliente', testClienteCi)
            .maybeSingle();

        if (clienteError) {
            throw clienteError;
        }

        if (!clienteExiste) {
            throw new Error(`Cliente ${testClienteCi} no existe en la BD.`);
        }

        testLibroId = 3;
    });

    afterAll(async () => {
        for (const reservaId of createdReservaIds) {
            await supabase.from('cli_mul_res').delete().eq('id_reserva', reservaId);
            await supabase.from('detalle_reserva').delete().eq('id_reserva', reservaId);
            await supabase.from('reserva').delete().eq('id_reserva', reservaId);
        }
    });

    beforeEach(() => {
        createdReservaIds = [];
    });

    describe('GET /api/reserva', () => {
        it('debe obtener todas las reservas', async () => {
            const response = await request(app)
                .get('/api/reserva')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });

        it('debe retornar un array aunque esté vacío', async () => {
            const response = await request(app)
                .get('/api/reserva')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe('POST /api/reserva/directa', () => {
        it('debe retornar error 400 cuando falta ci_cliente', async () => {
            const response = await request(app)
                .post('/api/reserva/directa')
                .send({ id_libro: testLibroId })
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('debe retornar error 400 cuando falta id_libro', async () => {
            const response = await request(app)
                .post('/api/reserva/directa')
                .send({ ci_cliente: testClienteCi })
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('debe retornar error 400 con id_libro inexistente', async () => {
            const response = await request(app)
                .post('/api/reserva/directa')
                .send({ ci_cliente: testClienteCi, id_libro: 999999 })
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });
});
