import { Request, Response } from 'express';
import { supabase } from '../src/Config/supabase';
import { Cliente } from '../Models/Cliente';
import { generateToken } from '../src/utils/jwt';



export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
      res.status(400).json({ error: 'Usuario y contraseña requeridos' });
      return;
    }

    const { data, error } = await supabase
      .from('cliente')
      .select('*')
      .eq('usuario', usuario)
      .single();

    if (error || !data) {
      res.status(401).json({ error: 'Usuario no encontrado' });
      return;
    }

    const cliente: Cliente = {
      ci_cliente: data.ci_cliente,
      idPersona: data.id_persona,
      usuario: data.usuario,
      password: data.password,
    };

    const passwordValido = password === cliente.password;

    if (!passwordValido) {
      res.status(401).json({ error: 'Contraseña incorrecta' });
      return;
    }

    const token = generateToken({
      ci_cliente: cliente.ci_cliente,
      usuario: cliente.usuario,
    });

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const perfil = async (req: Request, res: Response): Promise<void> => {
  try{
    const user = (req as any).user;
  res.status(200).json({
    mensaje: 'Ruta protegida',
    cliente: user,
  });
  }catch(e){
    res.status(500).json({error:"error en el servidor"})
  }
  
};
