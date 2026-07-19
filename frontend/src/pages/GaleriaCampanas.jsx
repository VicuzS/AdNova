import React, { useState, useEffect } from 'react'
import { Image, Search, ExternalLink, Tag, Calendar, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import './PageBase.css'

export default function GaleriaCampanas() {
  const [campanas, setCampanas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetch('/api/sales/history')
      .then(r => r.json())
      .then(() => {
        return fetch('/api/dashboard/metrics')
      })
      .then(r => r.json())
      .then(() => {
        return fetch('/api/products')
      })
      .then(r => r.json())
      .then(productos => {
        const promesas = productos.map(p =>
          fetch(`/api/sales/history?productoId=${p.id}`).then(r => r.json())
        )
        return Promise.all(promesas).then(() => productos)
      })
      .then(() => {
        fetch('/api/campaigns/list')
          .then(r => r.json())
          .then(d => { setCampanas(d); setCargando(false) })
          .catch(() => setCargando(false))
      })
      .catch(() => setCargando(false))
  }, [])

  useEffect(() => {
    fetch('/api/campaigns/list')
      .then(r => r.json())
      .then(d => { setCampanas(d); setCargando(false) })
      .catch(() => setCargando(false))
  }, [])

  async function handleDelete(id, e) {
    e.stopPropagation()
    if (!confirm('¿Eliminar esta campaña?')) return
    try {
      const res = await fetch(`/api/campaigns/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setCampanas(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  const filtradas = campanas.filter(c =>
    c.producto?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.tipoEstrategia?.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Galería de Campañas</h1>
        <p className="page-sub">Tus campañas generadas con IA — banners y copies publicitarios</p>
      </div>

      <div className="card">
        <div className="gallery-toolbar">
          <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
            <input
              className="form-input"
              style={{ paddingLeft: 32 }}
              placeholder="Buscar campañas..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        {cargando ? (
          <div className="empty-state">
            <div className="loading-ring" />
            <p style={{ color: 'var(--gray-500)' }}>Cargando campañas...</p>
          </div>
        ) : filtradas.length === 0 ? (
          <div className="empty-state">
            <Image size={40} color="var(--gray-200)" />
            <h3>Sin campañas aún</h3>
            <p>Genera tu primera campaña desde Campañas Inteligentes.</p>
            <button className="btn btn-primary" onClick={() => navigate('/campanas')}>
              Ir a Campañas Inteligentes
            </button>
          </div>
        ) : (
          <div className="hist-grid">
            {filtradas.map(c => (
              <div key={c.id} className="hist-item" onClick={() => navigate(`/producto/${c.productoId}`)}>
                <div
                  className="hist-thumb"
                  style={{
                    background: c.imagenGeneradaUrl
                      ? `url(${c.imagenGeneradaUrl}) center/cover`
                      : 'linear-gradient(135deg, #0F1F4B, #1A3A7A)'
                  }}
                >
                  {!c.imagenGeneradaUrl && <Image size={24} color="rgba(255,255,255,0.25)" />}
                </div>
                <div className="hist-info">
                  <div className="hist-name">{c.producto?.nombre || 'Producto'}</div>
                  <div className="hist-meta">
                    {c.tipoEstrategia} · {c.descuentoAplicado ? `${c.descuentoAplicado}% desc` : 'Sin descuento'}
                  </div>
                  <div style={{ marginTop: 6, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {c.copyTexto && (
                      <span style={{
                        fontSize: 11, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 3
                      }}>
                        <Tag size={10} /> Copy generado
                      </span>
                    )}
                    {c.codigoTrackingWhatsapp && (
                      <span style={{
                        fontSize: 11, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 3
                      }}>
                        <Calendar size={10} /> Tracking activo
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    <button
                      className="btn btn-outline"
                      style={{ fontSize: 11, padding: '4px 10px', flex: 1 }}
                      onClick={(e) => { e.stopPropagation(); navigate(`/producto/${c.productoId}`) }}
                    >
                      <ExternalLink size={11} /> Ver producto
                    </button>
                    <button
                      className="btn"
                      style={{ fontSize: 11, padding: '4px 10px', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}
                      onClick={(e) => handleDelete(c.id, e)}
                      title="Eliminar campaña"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
