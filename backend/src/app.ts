import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

import multaRouter from '../Routes/MultaRouter';
import reservaRouter from '../Routes/ReservaRouter';
import autorRouter from '../Routes/AutorRouter';
import personaRouter from '../Routes/PersonaRoutes';
import authRouter from '../Routes/authRouter';
import libroRouter from '../Routes/LibroRouter';
import administradorRouter from '../Routes/AdministradorRouter';
import clienteRouter from '../Routes/ClienteRouter';
import stockRouter from '../Routes/StockRouter';
import signUpRouter from '../Routes/signUpRouter';
import libroAutorRouter from '../Routes/LibroAutorRouter'; 

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    process.env.FRONT_SSH_HOST ? `http://${process.env.FRONT_SSH_HOST}` : '',
    process.env.FRONT_SSH_HOST ? `https://${process.env.FRONT_SSH_HOST}` : '',
    process.env.FRONTEND_URL || ''
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use('/api/persona', personaRouter);
app.use('/api/multa', multaRouter);
app.use('/api/reserva', reservaRouter);
app.use('/api/administrador', administradorRouter);
app.use('/api/cliente', clienteRouter);
app.use('/api/autor', autorRouter);
app.use('/api/auth', authRouter);
app.use('/api/libro', libroRouter);
app.use('/api/signup', signUpRouter);
app.use('/api/stock', stockRouter);
app.use('/api/LA', libroAutorRouter);

app.get('/api', (_req, res) => {
  res.json({
    message: "Hola desde Express!",
    status: "ok"
  });
});

export default app;
