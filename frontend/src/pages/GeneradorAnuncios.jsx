import React, { useState } from 'react'
import { Sparkles, Upload, RefreshCw, Download, Image } from 'lucide-react'
import './PageBase.css'

const formatos = ['Post cuadrado (1:1)', 'Historia vertical (9:16)', 'Banner horizontal (16:9)', 'Post rectangular (4:5)']
const plataformas = ['Facebook', 'Instagram', 'TikTok', 'Google Ads', 'LinkedIn']
const objetivos = ['Ventas', 'Reconocimiento', 'Tráfico', 'Generación de leads']

export default function GeneradorAnuncios() {
  const [producto, setProducto] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [formato, setFormato] = useState(formatos[0])
  const [plataforma, setPlataforma] = useState(plataformas[0])
  const [objetivo, setObjetivo] = useState(objetivos[0])
  const [generando, setGenerando] = useState(false)
  const [generado, setGenerado] = useState(false)

  function handleGenerar() {
    if (!producto) return
    setGenerando(true)
    setGenerado(false)
    setTimeout(() => {
      setGenerando(false)
      setGenerado(true)
    }, 2200)
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Generador de Anuncios IA</h1>
        <p className="page-sub">Crea anuncios profesionales en segundos con inteligencia artificial</p>
      </div>

      <div className="gen-grid">
        {/* Formulario */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 18 }}>Configurar anuncio</div>

          <div className="form-group">
            <label className="form-label">Nombre del producto *</label>
            <input
              className="form-input"
              placeholder="Ej: Zapatillas deportivas Pro X"
              value={producto}
              onChange={e => setProducto(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Descripción / beneficios</label>
            <textarea
              className="form-input form-textarea"
              placeholder="Describe tu producto, sus beneficios principales y propuesta de valor..."
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
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
              <label className="form-label">Objetivo</label>
              <select className="form-input form-select" value={objetivo} onChange={e => setObjetivo(e.target.value)}>
                {objetivos.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Formato</label>
            <div className="format-grid">
              {formatos.map(f => (
                <button
                  key={f}
                  className={`format-btn ${formato === f ? 'format-btn--active' : ''}`}
                  onClick={() => setFormato(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Imagen del producto (opcional)</label>
            <div className="upload-area">
              <Upload size={22} color="var(--gray-400)" />
              <span>Arrastra una imagen o haz clic para seleccionar</span>
              <span className="upload-hint">PNG, JPG hasta 5MB</span>
            </div>
          </div>

          <button
            className={`btn btn-primary w-full gen-btn ${generando ? 'gen-btn--loading' : ''}`}
            onClick={handleGenerar}
            disabled={generando || !producto}
          >
            {generando
              ? <><RefreshCw size={16} className="spin" /> Generando anuncio...</>
              : <><Sparkles size={16} /> Generar con IA</>
            }
          </button>
          <div className="credits-note">Usará 1 crédito de 36 disponibles</div>
        </div>

        {/* Preview */}
        <div className="card preview-card">
          <div className="card-title" style={{ marginBottom: 18 }}>Vista previa</div>
          {!generado && !generando && (
            <div className="preview-empty">
              <Image size={40} color="var(--gray-200)" />
              <p>Tu anuncio aparecerá aquí</p>
              <span>Completa el formulario y haz clic en Generar</span>
            </div>
          )}
          {generando && (
            <div className="preview-empty">
              <div className="loading-ring" />
              <p>Generando tu anuncio...</p>
              <span>La IA está trabajando en tu diseño</span>
            </div>
          )}
          {generado && (
            <div className="preview-result">
              <div className="ad-preview-mock">
                <div className="ad-header">
                  <div className="ad-brand-dot" />
                  <span className="ad-brand-name">{producto}</span>
                  <span className="ad-sponsored">Patrocinado</span>
                </div>
                <div className="ad-image-area">
                  <Sparkles size={32} color="rgba(255,255,255,0.5)" />
                  <span>Imagen generada por IA</span>
                </div>
                <div className="ad-copy">
                  <div className="ad-headline">¡Descubre {producto}!</div>
                  <div className="ad-desc">{descripcion || 'La mejor opción para ti. Calidad premium al mejor precio. ¡Compra ahora!'}</div>
                  <div className="ad-cta-row">
                    <span className="ad-url">adflow.ai/shop</span>
                    <span className="ad-cta-btn">Comprar ahora</span>
                  </div>
                </div>
              </div>
              <div className="preview-actions">
                <button className="btn btn-outline"><RefreshCw size={14} /> Regenerar</button>
                <button className="btn btn-primary"><Download size={14} /> Descargar</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
