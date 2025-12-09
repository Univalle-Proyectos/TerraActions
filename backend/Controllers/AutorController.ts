import { Request, Response } from "express";
import { supabase } from "../src/Config/supabase";
import { AutorFunc } from "../Models/Autor";



export class AutorController {
  static async getAutor(req: Request, res: Response): Promise<void> {
    try {
      const { data, error } = await supabase.from("autor").select("*");
      if (error) throw error;
      res.status(200).json(data);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Fallo al obtener los autores" });
    }
  }

  static async getAutorById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const intId = parseInt(id, 10);

    if (isNaN(intId)) {
      res.status(400).json({ error: "ID inválido" });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("autor")
        .select("*")
        .eq("id_autor", intId)
        .single();

      if (error) throw error;

      res.status(200).json(data);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Fallo al obtener autor por ID" });
    }
  }

  static async createAutor(req: Request, res: Response): Promise<void> {
    const nuevoAutor: AutorFunc = req.body;

    try {
      const { data, error } = await supabase
        .from("autor")
        .insert(nuevoAutor)
        .single();

      if (error) throw error;

      res.status(201).json(data);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Fallo al crear autor" });
    }
  }

  static async updateAutor(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const intId = parseInt(id, 10);
    const autorActualizado: AutorFunc = req.body;

    if (isNaN(intId)) {
      res.status(400).json({ error: "ID inválido" });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("autor")
        .update(autorActualizado)
        .eq("id_autor", intId);

      if (error) throw error;

      res.status(200).json(data);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Fallo al actualizar autor" });
    }
  }

  static async deleteAutor(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const intId = parseInt(id, 10);

    if (isNaN(intId)) {
      res.status(400).json({ error: "ID inválido" });
      return;
    }

    try {
      const { error } = await supabase
        .from("autor")
        .delete()
        .eq("id_autor", intId);

      if (error) throw error;

      res.status(200).json({ mensaje: "Autor eliminado exitosamente" });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Fallo al eliminar autor" });
    }
  }

  static async getPorNombre(req: Request, res: Response): Promise<void> {
    const { nombre } = req.params;

    try {
      const { data, error } = await supabase
        .from("autor")
        .select("*")
        .ilike("nombre", `%${nombre}%`);

      if (error) throw error;

      if (!data || data.length === 0) {
        res.status(404).json({
          message: `No se encontraron autores con el nombre "${nombre}"`
        });
      } else {
        res.status(200).json({
          data,
          message: `Autores con el nombre "${nombre}" encontrados`
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Error al buscar autores por nombre"
      });
    }
  }
}
