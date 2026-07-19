import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Package, TrendingUp, DollarSign, Calendar, ShoppingCart, Sparkles, AlertTriangle, RefreshCw } from 'lucide-react'
import './PageBase.css'

export default function DetalleProducto() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [producto, setProducto] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [generando, setGenerando] = useState(false)
  const [resultado, setResultado] = useState(null)

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then(d => { setProducto(d); setCargando(false) })
      .catch(() => setCargando(false))
  }, [id])

  async function generarCampana(estrategia) {
    setGenerando(true)
    setResultado(null)
    try {
      const res = await fetch('/api/campaigns/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productoId: parseInt(id), estrategia })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setResultado(json)
    } catch (err) {
      alert(err.message)
    } finally {
      setGenerando(false)
    }
  }

  if (cargando) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="loading-ring" />
          <p>Cargando producto...</p>
        </div>
      </div>
    )
  }

  if (!producto) {
    return (
      <div className="page">
        <div className="empty-state">
          <Package size={40} color="var(--gray-200)" />
          <h3>Producto no encontrado</h3>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Volver al Dashboard</button>
        </div>
      </div>
    )
  }

  const alertas = []
  if (producto.alertas?.stockMuerto) alertas.push({ tipo: 'Stock Muerto', color: 'rojo', icono: Package })
  if (producto.alertas?.margenRiesgo) alertas.push({ tipo: 'Margen en Riesgo', color: 'ambar', icono: TrendingUp })

  return (
    <div className="page">
      <button
        className="btn btn-outline"
        style={{ marginBottom: 16 }}
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={14} /> Volver
      </button>

      <div className="page-header">
        <h1 className="page-title">{producto.nombre}</h1>
        <p className="page-sub">SKU: {producto.sku} · Creado el {new Date(producto.fechaIngresoAlmacen).toLocaleDateString()}</p>
      </div>

      <div className="metricas-eco" style={{ marginBottom: 20 }}>
        <div className="card metrica-card">
          <div className="metrica-icono metrica-icono--verde"><DollarSign size={20} /></div>
          <div className="metrica-info">
            <span className="metrica-label">Precio Venta</span>
            <span className="metrica-valor">${producto.precioVenta}</span>
          </div>
        </div>
        <div className="card metrica-card">
          <div className="metrica-icono metrica-icono--azul"><TrendingUp size={20} /></div>
          <div className="metrica-info">
            <span className="metrica-label">Margen</span>
            <span className="metrica-valor">{producto.margen}%</span>
          </div>
        </div>
        <div className="card metrica-card">
          <div className="metrica-icono metrica-icono--rojo"><Calendar size={20} /></div>
          <div className="metrica-info">
            <span className="metrica-label">Días en almacén</span>
            <span className="metrica-valor">{producto.diasEnAlmacen}</span>
          </div>
        </div>
        <div className="card metrica-card">
          <div className="metrica-icono metrica-icono--ambar"><ShoppingCart size={20} /></div>
          <div className="metrica-info">
            <span className="metrica-label">Stock</span>
            <span className="metrica-valor">{producto.stockActual}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {alertas.length > 0 && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 12 }}>Alertas activas</div>
              <div className="insights-lista">
                {alertas.map((a, i) => (
                  <div key={i} className={`insight-item insight-item--${a.color}`}>
                    <div className="insight-icono"><a.icono size={16} /></div>
                    <div className="insight-cuerpo">
                      <div className="insight-titulo"><strong>{a.tipo}</strong></div>
                      <p className="insight-sugerencia">Generar campaña de {a.tipo === 'Stock Muerto' ? 'liquidación' : 'optimización'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>Acciones rápidas</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {producto.alertas?.stockMuerto && (
                <button
                  className="btn btn-primary w-full"
                  onClick={() => generarCampana('Liquidación de Stock')}
                  disabled={generando}
                >
                  {generando ? <><RefreshCw size={14} className="spin" /> Generando...</> : <><Sparkles size={14} /> Generar campaña de Liquidación</>}
                </button>
              )}
              {producto.alertas?.margenRiesgo && (
                <button
                  className="btn btn-primary w-full"
                  style={{ background: '#B45309' }}
                  onClick={() => generarCampana('Optimización de Margen')}
                  disabled={generando}
                >
                  {generando ? <><RefreshCw size={14} className="spin" /> Generando...</> : <><Sparkles size={14} /> Generar campaña de Margen</>}
                </button>
              )}
              {alertas.length === 0 && (
                <p className="text-muted" style={{ fontSize: 13 }}>El producto está saludable. No se requieren campañas automáticas.</p>
              )}
            </div>
          </div>

          {resultado && (
            <div className="card preview-result">
              <div className="card-title" style={{ marginBottom: 8 }}>Campaña generada</div>
              {resultado.campana?.imagenGeneradaUrl && (
                <img src={resultado.campana.imagenGeneradaUrl} alt="Banner" style={{ width: '100%', borderRadius: 'var(--radius-md)' }} />
              )}
              <p style={{ fontSize: 13, color: 'var(--gray-700)', lineHeight: 1.5 }}>{resultado.campana?.copyTexto}</p>
              <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>
                <strong>Código tracking:</strong> {resultado.campana?.codigoTrackingWhatsapp}
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>Ventas recientes</div>
          {producto.ventasHistorial?.length > 0 ? (
            <table className="campaign-table">
              <thead>
                <tr>
                  <th>Cant.</th>
                  <th>Precio</th>
                  <th>Fecha</th>
                  <th>Origen</th>
                </tr>
              </thead>
              <tbody>
                {producto.ventasHistorial.map(v => (
                  <tr key={v.id}>
                    <td>{v.cantidad}</td>
                    <td>${v.precioAplicado}</td>
                    <td style={{ fontSize: 11.5 }}>{new Date(v.fechaVenta).toLocaleDateString()}</td>
                    <td>{v.origen}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state" style={{ minHeight: 120 }}>
              <ShoppingCart size={24} color="var(--gray-200)" />
              <p style={{ fontSize: 13 }}>Sin ventas registradas</p>
            </div>
          )}

          {producto.campanas?.length > 0 && (
            <>
              <div className="card-title" style={{ marginTop: 20, marginBottom: 12 }}>Campañas</div>
              {producto.campanas.map(c => (
                <div key={c.id} className="seq-item" style={{ marginBottom: 8 }}>
                  <div className="seq-icon"><Sparkles size={14} /></div>
                  <div className="seq-info">
                    <div className="seq-name">{c.tipoEstrategia}</div>
                    <div className="seq-meta">{c.descuentoAplicado}% desc · {new Date(c.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
