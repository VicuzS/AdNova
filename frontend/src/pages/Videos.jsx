import React, { useState } from 'react'
import { Video, Play, RefreshCw, Lock, Sparkles } from 'lucide-react'
import './PageBase.css'

const duraciones = ['15 segundos', '30 segundos', '60 segundos']
const plataformas = ['TikTok', 'Instagram Reels', 'YouTube Shorts', 'Facebook']

export default function Videos() {
  const [producto, setProducto] = useState('')
  const [duracion, setDuracion] = useState(duraciones[0])
  const [plataforma, setPlataforma] = useState(plataformas[0])
  const [generando, setGenerando] = useState(false)
  const [generado, setGenerado] = useState(false)

  function handleGenerar() {
    if (!producto) return
    setGenerando(true)
    setGenerado(false)
    setTimeout(() => { setGenerando(false); setGenerado(true) }, 3000)
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Videos IA</h1>
        <p className="page-sub">Crea anuncios de video cinematográficos con IA para tus redes sociales</p>
      </div>

      <div className="gen-grid">
        <div className="card">
          <div className="card-title" style={{ marginBottom: 18 }}>Configurar video</div>

          <div className="form-group">
            <label className="form-label">Producto o servicio *</label>
            <input
              className="form-input"
              placeholder="Ej: Crema hidratante premium"
              value={producto}
              onChange={e => setProducto(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Plataforma</label>
              <select className="form-input form-select" value={plataforma} onChange={e => setPlataforma(e.target.value)}>
                {plataformas.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Duración</label>
              <select className="form-input form-select" value={duracion} onChange={e => setDuracion(e.target.value)}>
                {duraciones.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Estilo del video</label>
            <div className="format-grid">
              {['Cinematográfico', 'Minimalista', 'Dinámico', 'Lifestyle'].map(s => (
                <button key={s} className="format-btn">{s}</button>
              ))}
            </div>
          </div>

          <button
            className="btn btn-primary w-full"
            onClick={handleGenerar}
            disabled={generando || !producto}
            style={{ marginTop: 8 }}
          >
            {generando
              ? <><RefreshCw size={16} className="spin" /> Generando video...</>
              : <><Video size={16} /> Generar Video</>
            }
          </button>

          <div className="info-box" style={{ marginTop: 14 }}>
            <Lock size={13} />
            <span>Los videos de 30s y 60s requieren plan Pro o superior</span>
          </div>
        </div>

        <div className="card preview-card">
          <div className="card-title" style={{ marginBottom: 18 }}>Vista previa del video</div>
          {!generado && !generando && (
            <div className="preview-empty">
              <Video size={40} color="var(--gray-200)" />
              <p>Tu video aparecerá aquí</p>
              <span>Configura el video y haz clic en Generar</span>
            </div>
          )}
          {generando && (
            <div className="preview-empty">
              <div className="loading-ring" />
              <p>Generando tu video...</p>
              <span>Esto puede tardar unos segundos</span>
            </div>
          )}
          {generado && (
            <div className="video-result">
              <div className="video-mock">
                <Play size={40} color="rgba(255,255,255,0.8)" fill="rgba(255,255,255,0.8)" />
                <div className="video-overlay-text">
                  <div className="video-title-mock">{producto}</div>
                  <div className="video-sub-mock">Anuncio generado por IA • {duracion} • {plataforma}</div>
                </div>
              </div>
              <div className="preview-actions">
                <button className="btn btn-outline"><RefreshCw size={14} /> Regenerar</button>
                <button className="btn btn-primary"><Video size={14} /> Descargar</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
