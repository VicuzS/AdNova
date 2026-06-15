import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import {
  generarDesdeTexto,
  generarDesdeImagen,
  estadoModelo,
} from '../controllers/videoController.js'

const router = Router()

// ── Configuración de multer ───────────────────────────────────────────────
// Guarda el archivo temporalmente en /backend/uploads/
// (se borra automáticamente después de procesarlo)

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')   // la carpeta se crea abajo si no existe
  },
  filename: (req, file, cb) => {
    const nombre = `${Date.now()}-${file.originalname}`
    cb(null, nombre)
  },
})

function filtroArchivo(req, file, cb) {
  const tiposValidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (tiposValidos.includes(file.mimetype)) {
    cb(null, true)
  } else {
    const error = new Error('Tipo de archivo no válido')
    error.code = 'TIPO_NO_VALIDO'
    cb(error, false)
  }
}

const upload = multer({
  storage,
  fileFilter: filtroArchivo,
  limits: { fileSize: 5 * 1024 * 1024 },  // 5 MB máximo
})

// ── Endpoints ─────────────────────────────────────────────────────────────

// Genera video solo con texto/prompt
// POST /api/video/generar
router.post('/generar', generarDesdeTexto)

// Genera video a partir de una imagen del usuario
// POST /api/video/generar-desde-imagen   (multipart/form-data, campo: imagen)
router.post('/generar-desde-imagen', upload.single('imagen'), generarDesdeImagen)

// Consulta si un modelo está listo (warm) antes de lanzar la generación
// GET /api/video/estado/:modelo
router.get('/estado/:modelo', estadoModelo)

export default router
