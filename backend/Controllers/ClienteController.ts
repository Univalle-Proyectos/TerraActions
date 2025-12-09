import { Request, Response } from "express";
import { Cliente } from "../Models/Cliente";
import { supabase } from "../src/Config/supabase";


export class ClienteController {
  static async getCliente(req: Request, res: Response): Promise<void> {
    try {
      const { data, error } = await supabase.from("cliente").select("*");
      if (error) throw error;
      res.status(200).json(data);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Fallo al obtener clientes" });
    }
  }

  static async getClienteId(req: Request, res: Response): Promise<void> {
    const { ci } = req.params;
    try {
      const { data, error } = await supabase
        .from("cliente")
        .select("*")
        .eq("ci_cliente", ci)
        .single();

      if (error) throw error;
      res.status(200).json(data);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "No se encontró el ci del cliente" });
    }
  }

  static async createCliente(req: Request, res: Response): Promise<void> {
    const nClient: Cliente = req.body;

    try {
      const { data: persona, error: personaError } = await supabase
        .from("persona")
        .select("id_persona")
        .eq("id_persona", nClient.idPersona)
        .single();

      if (personaError || !persona) {
        res.status(400).json({ error: "La persona asociada no existe" });
        return;
      }

      const { data, error } = await supabase
        .from("cliente")
        .insert({
          ci_cliente: nClient.ci_cliente,
          id_persona: nClient.idPersona,
          usuario: nClient.usuario,
          password: nClient.password,
        })
        .single();

      if (error) throw error;
      res.status(201).json({data:data,message:"Persona creada exitosamente"});
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Fallo al crear cliente" });
    }
  }

  static async updateCliente(req: Request, res: Response): Promise<void> {
    const { ci } = req.params;
    const cUp: Cliente = req.body;

    try {
      const { data, error } = await supabase
        .from("cliente")
        .update({
          usuario: cUp.usuario,
          password: cUp.password,
        })
        .eq("ci_cliente", ci);

      if (error) throw error;
      res.status(200).json(data);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Fallo al actualizar el cliente" });
    }
  }

  static async deleteCliente(req: Request, res: Response): Promise<void> {
    const { ci } = req.params;

    try {
      const { error } = await supabase
        .from("cliente")
        .delete()
        .eq("ci_cliente", ci);

      if (error) throw error;
      res.status(200).json({ mensaje: "Cliente eliminado exitosamente" });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Fallo al eliminar cliente" });
    }
  }
}
