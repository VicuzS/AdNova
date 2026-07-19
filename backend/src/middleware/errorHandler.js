export function errorHandler(err, req, res, next) {
  console.error('Error:', err.message)

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'El archivo no puede superar los 5 MB' })
  }

  if (err.status === 503) {
    return res.status(503).json({
      error: err.message,
      estimated_time: err.estimated_time || 30,
    })
  }

  const status = err.status || 500
  res.status(status).json({
    error: err.message || 'Error interno del servidor'
  })
}
