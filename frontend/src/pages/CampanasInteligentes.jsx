import React, { useState, useEffect, useRef } from 'react'
import { Sparkles, RefreshCw, Image, AlertTriangle, TrendingUp, Package, ShoppingCart, Upload, Camera, Download } from 'lucide-react'
import './PageBase.css'

export default function CampanasInteligentes() {
  const [productos, setProductos] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [estrategia, setEstrategia] = useState('')
  const [cargando, setCargando] = useState(true)
  const [generando, setGenerando] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState('')

  const [generandoBanner, setGenerandoBanner] = useState(false)
  const [productImage, setProductImage] = useState(null)
  const [productImagePreview, setProductImagePreview] = useState(null)
  const [bannerUrl, setBannerUrl] = useState(null)
  const [bannerError, setBannerError] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(d => { setProductos(d); setCargando(false) })
      .catch(() => setCargando(false))
  }, [])

  const selected = productos.find(p => p.id === parseInt(selectedId))

  const estrategiasDisponibles = []
  if (selected?.alertas?.stockMuerto) estrategiasDisponibles.push('Liquidación de Stock')
  if (selected?.alertas?.margenRiesgo) estrategiasDisponibles.push('Optimización de Margen')
  if (!estrategiasDisponibles.length) estrategiasDisponibles.push('Liquidación de Stock', 'Optimización de Margen')

  async function handleGenerar() {
    if (!selectedId || !estrategia) return
    setGenerando(true)
    setError('')
    setResultado(null)
    setBannerUrl(null)
    setBannerError('')

    try {
      const res = await fetch('/api/campaigns/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productoId: parseInt(selectedId), estrategia })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setResultado(json)
    } catch (err) {
      setError(err.message)
    } finally {
      setGenerando(false)
    }
  }

  function handleImageSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setProductImage(file)
    const reader = new FileReader()
    reader.onload = ev => setProductImagePreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  function handleCaptureClick() {
    fileInputRef.current?.click()
  }

  async function handleGenerarBanner() {
    if (!resultado?.campana?.id) return
    setGenerandoBanner(true)
    setBannerError('')
    setBannerUrl(null)

    try {
      const fd = new FormData()
      if (productImage) fd.append('productImage', productImage)
      const res = await fetch(`/api/campaigns/${resultado.campana.id}/generate-banner`, {
        method: 'POST',
        body: fd,
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setBannerUrl(json.imagenGeneradaUrl)
    } catch (err) {
      setBannerError(err.message)
    } finally {
      setGenerandoBanner(false)
    }
  }

  async function handleDownloadBanner() {
    if (!bannerUrl || !resultado?.campana) return
    const c = resultado.campana
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = bannerUrl
    await img.decode()

    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 800
    const ctx = canvas.getContext('2d')

    ctx.drawImage(img, 0, 0, 800, 800)

    const grad = ctx.createLinearGradient(0, 0, 0, 800)
    grad.addColorStop(0, 'rgba(0,0,0,0.55)')
    grad.addColorStop(0.5, 'rgba(0,0,0,0.1)')
    grad.addColorStop(1, 'rgba(0,0,0,0.55)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 800, 800)

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    ctx.fillStyle = '#FCD34D'
    ctx.font = 'bold 96px system-ui, sans-serif'
    ctx.fillText(`${c.descuentoAplicado}% OFF`, 400, 180)

    ctx.fillStyle = 'white'
    ctx.font = 'bold 36px system-ui, sans-serif'
    ctx.fillText(c.copyTexto?.split('.')[0] || c.tipoEstrategia, 400, 310)

    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.font = '18px system-ui, sans-serif'
    ctx.fillText(`Código: ${c.codigoTrackingWhatsapp}`, 400, 660)

    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.font = '14px system-ui, sans-serif'
    ctx.fillText('AdNova.ai — CFO de Bolsillo', 400, 740)

    const link = document.createElement('a')
    link.download = `banner-${c.codigoTrackingWhatsapp}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Campañas Inteligentes</h1>
        <p className="page-sub">Selecciona un producto, revisa su diagnóstico financiero y genera una campaña automatizada</p>
      </div>

      <div className="gen-grid">
        <div className="card">
          <div className="card-title" style={{ marginBottom: 18 }}>Diagnóstico financiero</div>

          <div className="form-group">
            <label className="form-label">Producto</label>
            {cargando ? (
              <p className="text-muted" style={{ fontSize: 13 }}>Cargando productos...</p>
            ) : (
              <select
                className="form-input form-select"
                value={selectedId}
                onChange={e => { setSelectedId(e.target.value); setResultado(null); setEstrategia(''); setBannerUrl(null); setProductImage(null); setProductImagePreview(null) }}
              >
                <option value="">Seleccionar producto...</option>
                {productos.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} (SKU: {p.sku}) — Stock: {p.stockActual}
                  </option>
                ))}
              </select>
            )}
          </div>

          {selected && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="insights-lista">
                {selected.alertas.stockMuerto && (
                  <div className="insight-item insight-item--rojo">
                    <div className="insight-icono"><Package size={16} /></div>
                    <div className="insight-cuerpo">
                      <div className="insight-titulo">
                        <strong>Stock Muerto</strong>
                        <span className="insight-badge">Crítico</span>
                      </div>
                      <p className="insight-detalle">{selected.diasEnAlmacen} días en almacén, {selected.ventasMensuales} venta(s) mensuales</p>
                      <p className="insight-sugerencia"><strong>Sugerencia:</strong> Aplicar descuento del 15% para recuperar liquidez</p>
                    </div>
                  </div>
                )}
                {selected.alertas.margenRiesgo && (
                  <div className="insight-item insight-item--ambar">
                    <div className="insight-icono"><TrendingUp size={16} /></div>
                    <div className="insight-cuerpo">
                      <div className="insight-titulo">
                        <strong>Margen en Riesgo</strong>
                        <span className="insight-badge">Alerta</span>
                      </div>
                      <p className="insight-detalle">Margen actual: {selected.margen}% (umbral mínimo: 20%)</p>
                      <p className="insight-sugerencia"><strong>Sugerencia:</strong> Revisar precio de venta o negociar mejor costo</p>
                    </div>
                  </div>
                )}
                {!selected.alertas.stockMuerto && !selected.alertas.margenRiesgo && (
                  <div className="insight-item" style={{ borderColor: '#BBF7D0', background: '#F0FDF4' }}>
                    <div className="insight-icono" style={{ background: '#DCFCE7', color: '#16A34A' }}><ShoppingCart size={16} /></div>
                    <div className="insight-cuerpo">
                      <div className="insight-titulo"><strong>Producto Saludable</strong></div>
                      <p className="insight-detalle">Margen: {selected.margen}% | {selected.diasEnAlmacen} días en almacén | {selected.ventasMensuales} venta(s) mensuales</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Estrategia</label>
                <select
                  className="form-input form-select"
                  value={estrategia}
                  onChange={e => setEstrategia(e.target.value)}
                >
                  <option value="">Seleccionar estrategia...</option>
                  {estrategiasDisponibles.map(e => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>

              <button
                className="btn btn-primary w-full"
                onClick={handleGenerar}
                disabled={generando || !estrategia}
              >
                {generando
                  ? <><RefreshCw size={16} className="spin" /> Generando campaña...</>
                  : <><Sparkles size={16} /> Generar Campaña</>
                }
              </button>

              {error && (
                <div className="info-box" style={{ background: '#FEF2F2', borderColor: '#FECACA', color: '#DC2626' }}>
                  <AlertTriangle size={14} /> {error}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="card preview-card">
          <div className="card-title" style={{ marginBottom: 18 }}>Vista previa de campaña</div>

          {!resultado && !generando && (
            <div className="preview-empty">
              <Image size={40} color="var(--gray-200)" />
              <p>La campaña aparecerá aquí</p>
              <span>Selecciona un producto, revisa su diagnóstico y genera</span>
            </div>
          )}

          {generando && (
            <div className="preview-empty">
              <div className="loading-ring" />
              <p>Generando campaña...</p>
              <span>La IA está creando el copy y analizando el producto</span>
            </div>
          )}

          {resultado && (
            <div className="preview-result">
              <div className="card" style={{ border: '1px solid var(--gray-100)' }}>
                <div className="card-title" style={{ marginBottom: 8 }}>Copy generado</div>
                <p style={{ fontSize: 13.5, color: 'var(--gray-700)', lineHeight: 1.6 }}>
                  {resultado.campana?.copyTexto}
                </p>
              </div>

              <div className="card" style={{ border: '1px solid var(--gray-100)' }}>
                <div className="card-title" style={{ marginBottom: 8 }}>Detalles</div>
                <div style={{ fontSize: 13, color: 'var(--gray-600)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div><strong>Estrategia:</strong> {resultado.campana?.tipoEstrategia}</div>
                  <div><strong>Descuento:</strong> {resultado.campana?.descuentoAplicado}%</div>
                  <div><strong>Código tracking:</strong> {resultado.campana?.codigoTrackingWhatsapp}</div>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--gray-100)', margin: '16px 0' }} />

              <div className="form-group">
                <label className="form-label">Foto del producto (opcional)</label>
                <p className="text-muted" style={{ fontSize: 12, marginBottom: 8 }}>Sube una foto para que la IA sepa cómo es el producto y genere un banner más preciso</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{ display: 'none' }}
                  onChange={handleImageSelect}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-outline" onClick={handleCaptureClick} style={{ flex: 1 }}>
                    <Camera size={14} /> {productImage ? 'Cambiar foto' : 'Subir foto'}
                  </button>
                </div>
                {productImagePreview && (
                  <div style={{ marginTop: 8 }}>
                    <img
                      src={productImagePreview}
                      alt="Preview"
                      style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}
                    />
                  </div>
                )}
              </div>

              <button
                className="btn btn-primary w-full"
                onClick={handleGenerarBanner}
                disabled={generandoBanner}
              >
                {generandoBanner
                  ? <><RefreshCw size={16} className="spin" /> Generando banner con IA...</>
                  : <><Image size={16} /> Generar Banner Publicitario</>
                }
              </button>

              {bannerError && (
                <div className="info-box" style={{ background: '#FEF2F2', borderColor: '#FECACA', color: '#DC2626', marginTop: 8 }}>
                  <AlertTriangle size={14} /> {bannerError}
                </div>
              )}

              {bannerUrl && (
                <div style={{ marginTop: 12 }}>
                  <label className="form-label">Banner publicitario</label>
                  <div style={{
                    position: 'relative',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: '1px solid var(--gray-200)',
                    marginTop: 4,
                  }}>
                    <img src={bannerUrl} alt="Producto" style={{ width: '100%', display: 'block' }} />
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.05) 60%, rgba(0,0,0,0.5) 100%)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      padding: 24,
                    }}>
                      <div style={{ color: '#FCD34D', fontSize: 64, fontWeight: 800, lineHeight: 1, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                        {resultado.campana.descuentoAplicado}% OFF
                      </div>
                      <div style={{ color: 'white', fontSize: 20, fontWeight: 600, marginTop: 12, textAlign: 'center', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
                        {resultado.campana.copyTexto?.split('.')[0] || resultado.campana.tipoEstrategia}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 'auto', paddingTop: 16 }}>
                        {resultado.campana.codigoTrackingWhatsapp}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 4 }}>
                        AdNova.ai — CFO de Bolsillo
                      </div>
                    </div>
                  </div>
                  <button
                    className="btn btn-outline w-full"
                    style={{ marginTop: 8 }}
                    onClick={handleDownloadBanner}
                  >
                    <Download size={14} /> Descargar banner
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}