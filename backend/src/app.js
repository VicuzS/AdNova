import express from 'express'
import cors from 'cors'
import fs from 'fs'
import { config } from './config/env.js'
import videoRoutes from './routes/videoRoutes.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

// ── Crea carpeta temporal para uploads si no existe ───────────────────────
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads')
}

// ── Middlewares globales ──────────────────────────────────────────────────

// CORS: solo permite peticiones desde el frontend
app.use(cors({
  origin: config.frontendUrl,
  methods: ['GET', 'POST'],
}))

// Parseo de JSON (para las rutas que no usan multipart)
app.use(express.json())

// ── Ruta de salud ─────────────────────────────────────────────────────────
// Útil para comprobar que el servidor está corriendo
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    mensaje: 'AdFlow backend corriendo',
    modelos: {
      texto: config.replicate.modelText,
      imagen: config.replicate.modelImg,
    }
  })
})

// ── Rutas de la API ───────────────────────────────────────────────────────
app.use('/api/video', videoRoutes)

// ── Manejo de rutas no encontradas ────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.path}` })
})

// ── Manejo global de errores (siempre al final) ───────────────────────────
app.use(errorHandler)

// ── Arranque ──────────────────────────────────────────────────────────────
app.listen(config.port, () => {
  console.log(`\n AdFlow backend corriendo en http://localhost:${config.port}`)
  console.log(`   Health check: http://localhost:${config.port}/health`)
  console.log(`   Endpoints:`)
  console.log(`     POST /api/video/generar`)
  console.log(`     POST /api/video/generar-desde-imagen`)
  console.log(`     GET  /api/video/estado/:modelo\n`)
})
