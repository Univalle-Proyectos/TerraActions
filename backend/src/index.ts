import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import multaRouter from '../Routes/MultaRouter';
import ReservaRouter from '../Routes/ReservaRouter';
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
const PORT = Number(process.env.PORT) || 5000;

// CORS CONFIGURADO
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

// Log de peticiones
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas
app.use('/api/persona', personaRouter);
app.use('/api/multa', multaRouter);
app.use('/api/reserva', ReservaRouter);
app.use('/api/administrador', administradorRouter);
app.use('/api/cliente', clienteRouter);
app.use('/api/autor', autorRouter);
app.use('/api/auth', authRouter);
app.use('/api/libro', libroRouter);
app.use('/api/signup', signUpRouter);
app.use('/api/stock', stockRouter);
app.use('/api/LA', libroAutorRouter);

console.log("Ruta /api/stock cargada correctamente");


app.get('/api', (_req, res) => {
  res.json({ 
    message: "Hola desde Express!",
    status: "ok",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});
// Ruta de health check
app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime(),
    frontendHost: process.env.FRONT_SSH_HOST,
    port: PORT
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Manejo de errores global
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    path: req.path
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en http://0.0.0.0:${PORT}`);
  console.log(`📍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS habilitado para:`);
  console.log(`   - http://localhost:5173 (desarrollo)`);
  if (process.env.FRONT_SSH_HOST) {
    console.log(`   - http://${process.env.FRONT_SSH_HOST} (producción)`);
  }
  console.log(`⏰ Iniciado: ${new Date().toISOString()}`);
});

export default app;
