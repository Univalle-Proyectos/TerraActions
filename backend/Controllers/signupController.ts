import { Request, Response } from "express";
import { supabase } from "../src/Config/supabase";
import { Cliente } from "../Models/Cliente";
import { PersonaFunc } from "../Models/Persona";

export class SignupController {
  static async signUp(req: Request, res: Response): Promise<void> {
    const personaData: PersonaFunc = {
      nombre: req.body.nombre,
      apellido: req.body.apellido,
      email: req.body.email,
      telefono: req.body.telefono,
      direccion: req.body.direccion,
      genero: req.body.genero
    };

    const clienteData: Omit<Cliente, "idPersona"> = {
      ci_cliente: req.body.ci_cliente,
      usuario: req.body.usuario,
      password: req.body.password
    };

    if (!personaData.nombre || !personaData.apellido || !personaData.email || 
        !clienteData.ci_cliente || !clienteData.usuario || !clienteData.password) {
      res.status(400).json({ error: "Faltan datos obligatorios" });
      return;
    }

    try {
      const { data: existeCI } = await supabase
        .from("cliente")
        .select("ci_cliente")
        .eq("ci_cliente", clienteData.ci_cliente)
        .single();

      if (existeCI) {
        res.status(400).json({ error: "El CI del cliente ya existe" });
        return;
      }

      const { data: existeUsuario } = await supabase
        .from("cliente")
        .select("usuario")
        .eq("usuario", clienteData.usuario)
        .single();

      if (existeUsuario) {
        res.status(400).json({ error: "El nombre de usuario ya existe" });
        return;
      }

      const { data: newPersona, error: personaError } = await supabase
        .from("persona")
        .insert(personaData)
        .select("id_persona")
        .single();

      if (personaError || !newPersona) {
        res.status(400).json({ error: "Error al crear persona", details: personaError?.message || "No se devolvieron datos" });
        return;
      }

      const { data: newCliente, error: clienteError } = await supabase
        .from("cliente")
        .insert({
          ci_cliente: clienteData.ci_cliente,
          id_persona: newPersona.id_persona,
          usuario: clienteData.usuario,
          password: clienteData.password
        })
        .select()
        .single();

      if (clienteError || !newCliente) {
        await supabase.from("persona").delete().eq("id_persona", newPersona.id_persona);
        res.status(400).json({ error: "Error al crear cliente", details: clienteError?.message || "No se devolvieron datos" });
        return;
      }

      res.status(201).json({ message: "Cliente creado exitosamente", cliente: newCliente, persona: newPersona });

    } catch (error) {
      res.status(500).json({ error: "Error en el servidor", details: error instanceof Error ? error.message : String(error) });
    }
  }

  static async getCliente(req: Request, res: Response): Promise<void> {
    try {
      const { data, error } = await supabase
        .from("cliente")
        .select(`*, persona: id_persona (*)`);

      if (error) throw error;
      res.status(200).json(data);
    } catch (e) {
      res.status(500).json({ error: "Fallo al obtener clientes", details: e instanceof Error ? e.message : String(e) });
    }
  }
}
