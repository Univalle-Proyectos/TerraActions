import { Request, Response } from "express";
import { supabase } from "../src/Config/supabase";
import { PersonaFunc } from "../Models/Persona";

export class PersonaController {
    static async getPersona(req: Request, res: Response): Promise<void> {
        try {
            const { data, error } = await supabase.from("persona").select("*");
            if (error) throw error;
            res.status(200).json(data);
        } catch (e) {
            console.error(e);
            res.status(500).json({ error: "Fallo al obtener personas" });
        }
    }
    

    static async getPersonaById(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const intId = parseInt(id, 10);

        if (isNaN(intId)) {
            res.status(400).json({ error: "ID inválido" });
            return;
        }

        try {
            const { data, error } = await supabase
                .from("persona")
                .select("*")
                .eq("id_persona", intId)
                .single();

            if (error) throw error;
            res.status(200).json(data);
        } catch (e) {
            console.error(e);
            res.status(500).json({ error: "Fallo al obtener persona por ID" });
        }
    }

    static async createPersona(req: Request, res: Response): Promise<void> {
        const np: PersonaFunc = req.body;
        try {
            const { data, error } = await supabase
                .from("persona")
                .insert(np)
                .single();

            if (error) throw error;
            res.status(201).json(data);
        } catch (e) {
            console.error(e);
            res.status(500).json({ error: "Fallo al crear persona" });
        }
    }

    static async updatePersona(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const intId = parseInt(id, 10);
        const pUp: PersonaFunc = req.body;

        if (isNaN(intId)) {
            res.status(400).json({ error: "ID inválido" });
            return;
        }

        try {
            const { data, error } = await supabase
                .from("persona")
                .update(pUp)
                .eq("id_persona", intId)
                .single();

            if (error) throw error;
            res.status(200).json(data);
        } catch (e) {
            console.error(e);
            res.status(500).json({ error: "Fallo al actualizar persona" });
        }
    }

    static async deletePersona(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const intId = parseInt(id, 10);

        if (isNaN(intId)) {
            res.status(400).json({ error: "ID inválido" });
            return;
        }

        try {
            const { error } = await supabase
                .from("persona")
                .delete()
                .eq("id_persona", intId);

            if (error) throw error;
            res.status(200).json({ mensaje: "Persona eliminada exitosamente" });
        } catch (e) {
            console.error(e);
            res.status(500).json({ error: "Fallo al eliminar persona" });
        }
    }
}
