// URL base del backend — en desarrollo apunta a localhost
// Cuando hagas deploy solo cambias esta variable
const API_URL = 'http://localhost:4000'

/**
 * Genera un video solo con texto (sin imagen)
 * @param {{ producto, estilo, plataforma, duracion }} datos
 * @returns {{ video: string (base64), tipo: string, prompt: string }}
 */
export async function generarVideoTexto(datos) {
  const res = await fetch(`${API_URL}/api/video/generar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  })

  const json = await res.json()

  if (!res.ok) {
    // Si el modelo está iniciando (503), lanzamos con info extra
    // para que el componente pueda mostrar el tiempo estimado
    const err = new Error(json.error || 'Error al generar el video')
    err.status = res.status
    err.estimated_time = json.estimated_time
    throw err
  }

  return json
}

/**
 * Genera un video a partir de una imagen subida por el usuario
 * @param {File} imagenFile  — el File del input/drop zone
 * @param {{ producto, estilo, plataforma, duracion }} datos
 * @returns {{ video: string (base64), tipo: string }}
 */
export async function generarVideoDesdeImagen(imagenFile, datos) {
  const formData = new FormData()
  formData.append('imagen', imagenFile)           // campo que espera multer
  formData.append('producto',  datos.producto)
  formData.append('estilo',    datos.estilo || '')
  formData.append('plataforma', datos.plataforma)
  formData.append('duracion',  datos.duracion)

  const res = await fetch(`${API_URL}/api/video/generar-desde-imagen`, {
    method: 'POST',
    body: formData,   // NO pongas Content-Type, el browser lo pone solo con el boundary
  })

  const json = await res.json()

  if (!res.ok) {
    const err = new Error(json.error || 'Error al generar el video')
    err.status = res.status
    err.estimated_time = json.estimated_time
    throw err
  }

  return json
}

/**
 * Consulta si un modelo de Hugging Face ya está warm (listo)
 * útil para mostrar al usuario cuánto tiempo esperar
 * @param {string} modelo  — ej: 'damo-vilab/text-to-video-ms-1.7b'
 * @returns {{ listo: boolean, estimated_time?: number, mensaje: string }}
 */
export async function consultarEstadoModelo(modelo) {
  const modeloCodificado = encodeURIComponent(modelo)
  const res = await fetch(`${API_URL}/api/video/estado/${modeloCodificado}`)
  return res.json()
}
