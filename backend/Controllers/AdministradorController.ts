import { Request, Response } from "express";
import { supabase } from "../src/Config/supabase";
import { AdministradorFunc } from "../Models/Administrador";



export class AdministradorController {
    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const { data, error } = await supabase.from("administrador").select("*");
            if (error) throw error;
            res.status(200).json(data);
        } catch (e) {
            res.status(500).json({ error: "Error al obtener administradores" });
        }
    }

    static async getById(req: Request, res: Response): Promise<void> {
        const { ci } = req.params;
        try {
            const { data, error } = await supabase
                .from("administrador")
                .select("*")
                .eq("administrador_de_ci", ci)
                .single();
            if (error) throw error;
            res.status(200).json(data);
        } catch (e) {
            res.status(500).json({ error: "No se encontró el administrador" });
        }
    }

    static async create(req: Request, res: Response): Promise<void> {
        const newAdmin: AdministradorFunc = req.body;
        try {
            const { data, error } = await supabase
                .from("administrador")
                .insert(newAdmin)
                .single();
            if (error) throw error;
            res.status(201).json(data);
        } catch (e) {
            res.status(500).json({ error: "No se pudo crear el administrador" });
        }
    }

    static async update(req: Request, res: Response): Promise<void> {
        const { ci } = req.params;
        const updateData: AdministradorFunc = req.body;
        try {
            const { data, error } = await supabase
                .from("administrador")
                .update(updateData)
                .eq("administrador_de_ci", ci);
            if (error) throw error;
            res.status(200).json(data);
        } catch (e) {
            res.status(500).json({ error: "No se pudo actualizar" });
        }
    }

    static async delete(req: Request, res: Response): Promise<void> {
        const { ci } = req.params;
        try {
            const { error } = await supabase
                .from("administrador")
                .delete()
                .eq("administrador_de_ci", ci);
            if (error) throw error;
            res.status(200).json({ mensaje: "Administrador eliminado" });
        } catch (e) {
            res.status(500).json({ error: "No se pudo eliminar" });
        }
    }
}
