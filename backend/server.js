require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const connectDB  = require('./src/config/db');
const proposals  = require('./src/routes/proposals');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

// Conectar base de datos
connectDB();

// Seguridad — CSP desactivado en desarrollo para permitir fetch desde el frontend
app.use(helmet({
  contentSecurityPolicy: false
}));

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (Postman, curl, mobile apps)
    if (!origin) return callback(null, true);
    // Permitir cualquier origen local (localhost o 127.0.0.1 en cualquier puerto)
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    // Permitir origen configurado en .env para producción
    if (process.env.CORS_ORIGIN && origin === process.env.CORS_ORIGIN) {
      return callback(null, true);
    }
    callback(new Error(`CORS bloqueado: ${origin}`));
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-admin-key'],
  credentials: true
}));

// Rate limiting general
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Demasiadas solicitudes. Intenta en 15 minutos.' }
}));

// Rate limiting estricto para escritura
const writeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10,
  message: { success: false, message: 'Límite de envíos alcanzado. Intenta en 1 minuto.' }
});

// Parseo de cuerpo
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/proposals', writeLimiter, proposals);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'online', timestamp: new Date().toISOString() });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

// Manejo global de errores
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📋 Entorno: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
