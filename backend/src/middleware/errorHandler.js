// Middleware global de errores — siempre va al final en app.js
export function errorHandler(err, req, res, next) {
  console.error('Error:', err.message)

  // Error de multer (archivo demasiado grande)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'La imagen no puede superar los 5 MB' })
  }

  // Error de multer (tipo de archivo no válido)
  if (err.code === 'TIPO_NO_VALIDO') {
    return res.status(400).json({ error: 'Solo se aceptan imágenes .jpg, .png o .webp' })
  }

  if (err.status === 503) {
    return res.status(503).json({
      error: err.message,
      estimated_time: err.estimated_time || 30,
    })
  }

  // Error genérico
  const status = err.status || 500
  res.status(status).json({
    error: err.message || 'Error interno del servidor'
  })
}
