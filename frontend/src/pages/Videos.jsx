import React, { useState, useRef, useCallback } from 'react'
import { Video, Play, RefreshCw, Lock, Upload, X, ImageIcon, AlertCircle, Clock } from 'lucide-react'
import { generarVideoTexto, generarVideoDesdeImagen } from '../services/videoService.js'
import './PageBase.css'
import './Videos.css'

const duraciones = ['5 segundos']
const plataformas = ['TikTok', 'Instagram Reels', 'YouTube Shorts', 'Facebook']
const estilos = ['Cinematográfico', 'Minimalista', 'Dinámico', 'Lifestyle']

// Convierte el base64 que devuelve el backend en una URL reproducible
function base64AUrl(base64, tipo = 'video/mp4') {
  const binario = atob(base64)
  const bytes = new Uint8Array(binario.length)
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i)
  const blob = new Blob([bytes], { type: tipo })
  return URL.createObjectURL(blob)
}

export default function Videos() {
  const [producto, setProducto]     = useState('')
  const [duracion, setDuracion]     = useState(duraciones[0])
  const [plataforma, setPlataforma] = useState(plataformas[0])
  const [estilo, setEstilo]         = useState('')

  // ── estados de la generación ─────────────────────────────
  const [estado, setEstado] = useState('idle')
  // idle | cargando-modelo | generando | listo | error

  const [mensajeCarga, setMensajeCarga] = useState('')
  const [tiempoEspera, setTiempoEspera] = useState(null)
  const [error, setError]               = useState(null)
  const [videoUrl, setVideoUrl]         = useState(null)   // URL del video generado

  // ── imagen ──────────────────────────────────────────────
  const [imagen, setImagen]   = useState(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  function procesarArchivo(file) {
    if (!file) return
    const validos = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!validos.includes(file.type)) {
      alert('Solo se aceptan archivos .png, .jpg o .webp')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no puede superar los 5 MB')
      return
    }
    const url = URL.createObjectURL(file)
    setImagen({ file, url, name: file.name, size: (file.size / 1024).toFixed(0) + ' KB' })
  }

  function handleInputChange(e) {
    procesarArchivo(e.target.files[0])
    e.target.value = ''
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    procesarArchivo(e.dataTransfer.files[0])
  }, [])

  const handleDragOver  = (e) => { e.preventDefault(); setDragging(true) }
  const handleDragLeave = () => setDragging(false)

  function quitarImagen() {
    if (imagen?.url) URL.revokeObjectURL(imagen.url)
    setImagen(null)
  }

  // ── generar (llamada real al backend) ────────────────────
  async function handleGenerar() {
    if (!producto) return

    // Limpiamos estado anterior
    setError(null)
    setVideoUrl(null)
    setTiempoEspera(null)
    setEstado('generando')
    setMensajeCarga(imagen
      ? 'Enviando imagen a Hugging Face...'
      : 'Enviando prompt a Hugging Face...'
    )

    try {
      const datos = { producto, estilo, plataforma, duracion }
      let resultado

      if (imagen?.file) {
        // Tiene imagen → usamos el endpoint imagen-a-video
        setMensajeCarga('Procesando tu imagen con IA...')
        resultado = await generarVideoDesdeImagen(imagen.file, datos)
      } else {
        // Solo texto → usamos el endpoint texto-a-video
        setMensajeCarga('Generando video desde texto...')
        resultado = await generarVideoTexto(datos)
      }

      // El backend devuelve el video en base64 → lo convertimos a URL
      const url = base64AUrl(resultado.video, resultado.tipo)
      setVideoUrl(url)
      setEstado('listo')

    } catch (err) {
      // El modelo puede estar iniciando (503 de Hugging Face)
      if (err.status === 503 && err.estimated_time) {
        setEstado('cargando-modelo')
        setTiempoEspera(Math.ceil(err.estimated_time))
        setMensajeCarga('El modelo de IA está iniciando...')
      } else {
        setEstado('error')
        setError(err.message || 'Ocurrió un error inesperado')
      }
    }
  }

  function handleReintentar() {
    setEstado('idle')
    setError(null)
    setTiempoEspera(null)
  }

  function handleDescargar() {
    if (!videoUrl) return
    const a = document.createElement('a')
    a.href = videoUrl
    a.download = `adflow-video-${Date.now()}.mp4`
    a.click()
  }

  const generando = estado === 'generando' || estado === 'cargando-modelo'

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Videos IA</h1>
        <p className="page-sub">Crea anuncios de video cinematográficos con IA para tus redes sociales</p>
      </div>

      <div className="gen-grid">
        {/* ── Formulario ── */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 18 }}>Configurar video</div>

          <div className="form-group">
            <label className="form-label">Producto o servicio *</label>
            <input
              className="form-input"
              placeholder="Ej: Crema hidratante premium"
              value={producto}
              onChange={e => setProducto(e.target.value)}
              disabled={generando}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Plataforma</label>
              <select className="form-input form-select" value={plataforma} onChange={e => setPlataforma(e.target.value)} disabled={generando}>
                {plataformas.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Duración</label>
              <select className="form-input form-select" value={duracion} onChange={e => setDuracion(e.target.value)} disabled={generando}>
                {duraciones.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Estilo del video</label>
            <div className="format-grid">
              {estilos.map(s => (
                <button
                  key={s}
                  className={`format-btn ${estilo === s ? 'format-btn--active' : ''}`}
                  onClick={() => setEstilo(s)}
                  disabled={generando}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Carga de imagen */}
          <div className="form-group">
            <label className="form-label">
              Imagen del producto
              <span className="label-optional">opcional</span>
            </label>

            {!imagen ? (
              <div
                className={`vid-upload-zone ${dragging ? 'vid-upload-zone--drag' : ''} ${generando ? 'vid-upload-zone--disabled' : ''}`}
                onDrop={generando ? undefined : handleDrop}
                onDragOver={generando ? undefined : handleDragOver}
                onDragLeave={generando ? undefined : handleDragLeave}
                onClick={generando ? undefined : () => inputRef.current.click()}
              >
                <div className="vid-upload-icon"><Upload size={22} /></div>
                <div className="vid-upload-text">
                  <span className="vid-upload-cta">Haz clic para subir</span> o arrastra aquí
                </div>
                <div className="vid-upload-hint">PNG, JPG, WEBP · máx. 5 MB</div>
                <input ref={inputRef} type="file" accept=".png,.jpg,.jpeg,.webp" style={{ display: 'none' }} onChange={handleInputChange} />
              </div>
            ) : (
              <div className="vid-img-preview">
                <img src={imagen.url} alt={imagen.name} className="vid-img-thumb" />
                <div className="vid-img-info">
                  <div className="vid-img-name">{imagen.name}</div>
                  <div className="vid-img-size">{imagen.size}</div>
                  {!generando && (
                    <button className="vid-img-change" onClick={() => inputRef.current.click()}>
                      Cambiar imagen
                    </button>
                  )}
                  <input ref={inputRef} type="file" accept=".png,.jpg,.jpeg,.webp" style={{ display: 'none' }} onChange={handleInputChange} />
                </div>
                {!generando && (
                  <button className="vid-img-remove" onClick={quitarImagen} title="Quitar imagen">
                    <X size={15} />
                  </button>
                )}
              </div>
            )}
          </div>

          <button
            className="btn btn-primary w-full"
            onClick={handleGenerar}
            disabled={generando || !producto}
            style={{ marginTop: 4 }}
          >
            {generando
              ? <><RefreshCw size={16} className="spin" /> Generando video...</>
              : <><Video size={16} /> {imagen ? 'Generar Video desde imagen' : 'Generar Video'}</>
            }
          </button>

          <div className="info-box" style={{ marginTop: 14 }}>
            <Lock size={13} />
            <span>Los videos duran 5 segundos</span>
          </div>
        </div>

        {/* ── Panel de resultado ── */}
        <div className="card preview-card">
          <div className="card-title" style={{ marginBottom: 18 }}>Vista previa del video</div>

          {/* Idle */}
          {estado === 'idle' && (
            <div className="preview-empty">
              <Video size={40} color="var(--gray-200)" />
              <p>Tu video aparecerá aquí</p>
              <span>Configura el video y haz clic en Generar</span>
            </div>
          )}

          {/* Generando */}
          {estado === 'generando' && (
            <div className="preview-empty">
              <div className="loading-ring" />
              <p>Generando tu video...</p>
              <span>{mensajeCarga}</span>
              <span className="vid-hf-note">
                Hugging Face puede tardar 1–3 minutos en el plan gratuito
              </span>
            </div>
          )}

          {/* Modelo iniciando (503) */}
          {estado === 'cargando-modelo' && (
            <div className="preview-empty">
              <div className="vid-warm-icon"><Clock size={28} color="var(--yellow)" /></div>
              <p>El modelo está iniciando</p>
              <span>Hugging Face está cargando el modelo de IA.</span>
              {tiempoEspera && (
                <span className="vid-hf-note">Tiempo estimado: ~{tiempoEspera} segundos</span>
              )}
              <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={handleGenerar}>
                <RefreshCw size={14} /> Reintentar ahora
              </button>
            </div>
          )}

          {/* Error */}
          {estado === 'error' && (
            <div className="preview-empty">
              <AlertCircle size={36} color="var(--red)" />
              <p style={{ color: 'var(--red)' }}>Error al generar</p>
              <span className="vid-error-msg">{error}</span>
              <button className="btn btn-outline" style={{ marginTop: 12 }} onClick={handleReintentar}>
                Volver a intentarlo
              </button>
            </div>
          )}

          {/* Video listo */}
          {estado === 'listo' && videoUrl && (
            <div className="video-result">
              {/* Reproductor real */}
              <video
                className="vid-player"
                src={videoUrl}
                controls
                autoPlay
                loop
                playsInline
              />

              {imagen && (
                <div className="vid-used-img">
                  <ImageIcon size={13} />
                  Generado con tu imagen: <strong>{imagen.name}</strong>
                </div>
              )}

              <div className="preview-actions">
                <button className="btn btn-outline" onClick={handleGenerar}>
                  <RefreshCw size={14} /> Regenerar
                </button>
                <button className="btn btn-primary" onClick={handleDescargar}>
                  <Video size={14} /> Descargar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
