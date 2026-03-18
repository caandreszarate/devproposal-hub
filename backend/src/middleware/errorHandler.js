const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';

  // Error de validación Mongoose
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const fields = Object.values(err.errors).map(e => e.message);
    message = fields.join(', ');
  }

  // CastError (ID de MongoDB inválido)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'ID no válido';
  }

  // Duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    message = 'Ya existe un registro con ese valor';
  }

  if (process.env.NODE_ENV === 'development') {
    console.error(`[ERROR] ${statusCode} — ${message}`, err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
