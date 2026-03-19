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

// Seguridad — Helmet con CSP configurado para producción
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:    ["'self'"],
      connectSrc:    ["'self'", process.env.CORS_ORIGIN || '*'],
      scriptSrc:     ["'self'"],
      styleSrc:      ["'self'", 'https://fonts.googleapis.com', "'unsafe-inline'"],
      fontSrc:       ["'self'", 'https://fonts.gstatic.com'],
      imgSrc:        ["'self'", 'data:'],
      frameSrc:      ["'none'"],
      objectSrc:     ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
    reportOnly: false,
  },
  crossOriginEmbedderPolicy: false, // evita bloqueos con fetch() cross-origin
}));

app.use(cors({
  origin: (origin, callback) => {
    // En producción, rechazar requests sin origin (excepto health check)
    if (!origin) {
      if (process.env.NODE_ENV === 'production') {
        return callback(new Error('CORS: origin requerido en producción'));
      }
      return callback(null, true);
    }
    // Permitir cualquier origen local en desarrollo
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

// Rate limiting estricto para escritura (POST)
const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, message: 'Límite de envíos alcanzado. Intenta en 1 minuto.' }
});

// Rate limiting muy estricto para operaciones privilegiadas (PATCH/DELETE)
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { success: false, message: 'Demasiadas operaciones administrativas. Intenta en 15 minutos.' }
});

// Parseo de cuerpo
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/proposals', proposals);
// Rate limiters aplicados por tipo de operación en el router

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
