import { Request, Response } from "express";
import { supabase } from "../src/Config/supabase";
import { ReservaFunc } from "../Models/Reserva";

export class ReservaController {
    static async getReservas(req: Request, res: Response): Promise<void> {
        try {
            const { data, error } = await supabase.from("reserva").select("*");
            if (error) throw error;
            res.status(200).json(data);
        } catch (e) {
            console.error(e);
            res.status(500).json({ error: "Fallo al obtener reservas" });
        }
    }


    static async crearReservaDirecta(req: Request, res: Response): Promise<void> {

        const { id_libro, ci_cliente } = req.body;
        if (!id_libro || !ci_cliente) {

            res.status(400).json({
                success: false,
                message: 'Los campos id_libro y ci_cliente son requeridos'
            });
            return;
        }

        try {
            const { data: libroDisponible, error: errorStock } = await supabase
                .from('stock')
                .select('id_stock')
                .eq('id_libro', id_libro)
                .eq('disponibilidad', true)
                .limit(1);

            if (errorStock) throw errorStock;
            if (!libroDisponible || libroDisponible.length === 0) {
                res.status(400).json({
                    success: false,
                    message: 'El libro no está disponible para reserva'
                });
                return;
            }

            const id_stock = libroDisponible[0].id_stock;
            const { data: nuevaReserva, error: errorReserva } = await supabase
                .from('reserva')
                .insert({
                    fec_reserva: new Date(),
                    fec_prestamo:new Date(),
                    fec_limite:new Date()
                })
                .select('id_reserva')
                .single();

            if (errorReserva) throw errorReserva;
            const id_reserva = nuevaReserva.id_reserva;
            const { error: errorDetalle } = await supabase
                .from('detalle_reserva')
                .insert({
                    id_reserva,
                    id_libro
                });

            if (errorDetalle) throw errorDetalle;
            const { error: errorUpdateStock } = await supabase
                .from('stock')
                .update({
                    disponibilidad: false,
                })
                .eq('id_stock', id_stock);

            if (errorUpdateStock) throw errorUpdateStock;
            const { error: errorCliMulRes } = await supabase
                .from('cli_mul_res')
                .insert({
                    ci_cliente,
                    id_reserva
                });

            if (errorCliMulRes) throw errorCliMulRes;
            res.status(201).json({
                success: true,
                message: 'Reserva creada exitosamente',
                data: {
                    id_reserva,
                    id_libro,
                    ci_cliente
                }
            });

        } catch (error) {
            console.error('Error en crearReservaDirecta:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear la reserva',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    static async getLibroStockDisponibles(req: Request, res: Response): Promise<void> {
        try {
            const { data, error } = await supabase
                .from('libro')
                .select('*, stock!inner(*)')
                .eq('stock.disponibilidad', true);

            if (error) throw error;

            res.status(200).json({
                success: true,
                count: data.length,
                data: data
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener libros disponibles',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
        

    }

}