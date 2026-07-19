import React, { useState, useEffect } from 'react'
import { Image, Search, Filter, ShoppingCart, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import './PageBase.css'

export default function Historial() {
  const [ventas, setVentas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetch('/api/sales/history')
      .then(r => r.json())
      .then(d => { setVentas(d); setCargando(false) })
      .catch(() => setCargando(false))
  }, [])

  const filtradas = ventas.filter(v =>
    v.producto?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    v.origen?.toLowerCase().includes(busqueda.toLowerCase()) ||
    v.campana?.tipoEstrategia?.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Historial de Ventas</h1>
        <p className="page-sub">Todas las ventas registradas con origen, campaña y métricas financieras</p>
      </div>

      <div className="card">
        <div className="gallery-toolbar">
          <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
            <input
              className="form-input"
              style={{ paddingLeft: 32 }}
              placeholder="Buscar ventas..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
          <span style={{ fontSize: 12.5, color: 'var(--gray-500)' }}>
            {filtradas.length} venta(s)
          </span>
        </div>

        {cargando ? (
          <div className="empty-state">
            <div className="loading-ring" />
            <p style={{ color: 'var(--gray-500)' }}>Cargando historial...</p>
          </div>
        ) : filtradas.length === 0 ? (
          <div className="empty-state">
            <ShoppingCart size={40} color="var(--gray-200)" />
            <h3>Sin ventas registradas</h3>
            <p>Las ventas aparecerán aquí cuando se registren desde WhatsApp o API.</p>
          </div>
        ) : (
          <table className="campaign-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio aplicado</th>
                <th>Total</th>
                <th>Fecha</th>
                <th>Origen</th>
                <th>Campaña</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map(v => (
                <tr key={v.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/producto/${v.productoId}`)}>
                  <td className="camp-name">{v.producto?.nombre || `ID: ${v.productoId}`}</td>
                  <td>{v.cantidad}</td>
                  <td>${v.precioAplicado}</td>
                  <td className="gastado">${(v.cantidad * v.precioAplicado).toFixed(2)}</td>
                  <td style={{ fontSize: 11.5 }}>{new Date(v.fechaVenta).toLocaleDateString()}</td>
                  <td>{v.origen || '—'}</td>
                  <td>{v.campana?.tipoEstrategia || '—'}</td>
                  <td>
                    <button
                      className="row-action-btn"
                      onClick={(e) => { e.stopPropagation(); navigate(`/producto/${v.productoId}`) }}
                    >
                      <ExternalLink size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
