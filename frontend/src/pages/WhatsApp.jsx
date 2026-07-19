import React, { useState, useEffect } from 'react'
import { MessageSquare, Send, Plus, Zap, ShoppingCart, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react'
import './PageBase.css'
import './WhatsApp.css'

const mensajesEjemplo = [
  { tipo: 'out', texto: '¡Hola! 👋 Soy el asistente de ventas. ¿En qué puedo ayudarte hoy?', hora: '10:30' },
  { tipo: 'in', texto: 'Hola, quiero comprar el producto que me enviaron', hora: '10:31' },
]

const secuencias = [
  { nombre: 'Bienvenida nuevos clientes', estado: 'Activo', enviados: 142, tasa: '68%' },
  { nombre: 'Seguimiento de carrito abandonado', estado: 'Activo', enviados: 87, tasa: '42%' },
  { nombre: 'Re-engagement 30 días', estado: 'Pausado', enviados: 0, tasa: '—' },
]

export default function WhatsApp() {
  const [mensaje, setMensaje] = useState('')
  const [chat, setChat] = useState(mensajesEjemplo)
  const [productos, setProductos] = useState([])
  const [selectedProducto, setSelectedProducto] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [trackingCode, setTrackingCode] = useState('')
  const [ultimaVenta, setUltimaVenta] = useState(null)
  const [registrando, setRegistrando] = useState(false)

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(d => setProductos(d))
      .catch(() => {})
  }, [])

  async function handleRegistrarVenta() {
    if (!selectedProducto) return
    setRegistrando(true)

    const body = {
      productoId: parseInt(selectedProducto),
      cantidad,
      precioAplicado: productos.find(p => p.id === parseInt(selectedProducto))?.precioVenta || 0,
      origen: 'WhatsApp',
    }
    if (trackingCode.trim()) body.codigoTrackingWhatsapp = trackingCode.trim()

    try {
      const res = await fetch('/api/sales/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)

      setUltimaVenta(json)
      setChat(prev => [
        ...prev,
        { tipo: 'in', texto: `✅ Compra registrada: ${cantidad} unidad(es)`, hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        { tipo: 'out', texto: json.roas ? `¡Gracias! 🎉 ROAS calculado: ${json.roas}x` : '¡Gracias por tu compra! 🎉', hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ])
    } catch (err) {
      setChat(prev => [
        ...prev,
        { tipo: 'in', texto: `❌ Error: ${err.message}`, hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ])
    } finally {
      setRegistrando(false)
    }
  }

  function handleEnviarMensaje() {
    if (!mensaje.trim()) return
    setChat(prev => [
      ...prev,
      { tipo: 'out', texto: mensaje, hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ])
    setMensaje('')
    setTimeout(() => {
      setChat(prev => [
        ...prev,
        { tipo: 'in', texto: '¡Gracias por tu mensaje! Un asesor te atenderá en breve.', hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ])
    }, 1000)
  }

  const productoSeleccionado = productos.find(p => p.id === parseInt(selectedProducto))

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">WhatsApp — Ventas y Tracking</h1>
        <p className="page-sub">Registra ventas desde el simulador y calcula el ROAS de tus campañas en tiempo real</p>
      </div>

      <div className="simple-page">
        <div className="stats-row">
          {[
            { label: 'Ventas registradas', value: ultimaVenta ? '1' : '0', color: 'green', detail: 'última sesión' },
            { label: 'ROAS última venta', value: ultimaVenta?.roas ? `${ultimaVenta.roas}x` : '—', color: 'blue', detail: ultimaVenta?.roas ? 'Retorno positivo' : 'Sin datos' },
            { label: 'Tracking activo', value: trackingCode ? 'Sí' : 'No', color: trackingCode ? 'green' : 'yellow', detail: trackingCode || 'Sin código' },
            { label: 'Stock restante', value: productoSeleccionado ? `${productoSeleccionado.stockActual - (ultimaVenta ? cantidad : 0)}` : '—', color: 'blue', detail: productoSeleccionado?.nombre || 'Selecciona producto' },
          ].map((s, i) => (
            <div key={i} className={`stat-card stat-card--${s.color}`}>
              <div className="stat-value">{s.value} <span>{s.detail}</span></div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="wa-grid">
          <div className="card">
            <div className="card-title" style={{ marginBottom: 14 }}>Registrar venta</div>
            <div className="form-group">
              <label className="form-label">Producto</label>
              <select className="form-input form-select" value={selectedProducto} onChange={e => setSelectedProducto(e.target.value)}>
                <option value="">Seleccionar...</option>
                {productos.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} — ${p.precioVenta} (Stock: {p.stockActual})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Cantidad</label>
                <input
                  type="number"
                  className="form-input"
                  min="1"
                  value={cantidad}
                  onChange={e => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Precio unitario</label>
                <input
                  className="form-input"
                  value={`$${productoSeleccionado?.precioVenta || 0}`}
                  disabled
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">
                Código tracking (opcional)
                <span style={{ fontSize: 11, color: 'var(--gray-400)', marginLeft: 6 }}>
                  — Vincula a campaña para calcular ROAS
                </span>
              </label>
              <input
                className="form-input"
                placeholder="Ej: CAMP-LIQUIDACION-001"
                value={trackingCode}
                onChange={e => setTrackingCode(e.target.value)}
              />
            </div>
            <button
              className="btn btn-primary w-full"
              onClick={handleRegistrarVenta}
              disabled={registrando || !selectedProducto}
            >
              {registrando
                ? <><div className="loading-ring" style={{ width: 16, height: 16 }} /> Registrando...</>
                : <><ShoppingCart size={14} /> Registrar venta</>
              }
            </button>
            {ultimaVenta && (
              <div className="info-box" style={{ marginTop: 10, background: '#F0FDF4', borderColor: '#BBF7D0', color: '#16A34A' }}>
                <TrendingUp size={14} /> Venta registrada {ultimaVenta.roas ? `· ROAS: ${ultimaVenta.roas}x` : ''}
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 14 }}>Simulador de respuestas</div>
            <div className="wa-phone-mock">
              {chat.map((m, i) => (
                <div key={i} className={`wa-msg wa-msg--${m.tipo}`}>
                  {m.texto.split('\n').map((line, j) => <div key={j}>{line}</div>)}
                  <div className="wa-time">{m.hora}</div>
                </div>
              ))}
            </div>
            <div className="wa-input-row">
              <input
                className="form-input"
                placeholder="Escribe un mensaje de prueba..."
                value={mensaje}
                onChange={e => setMensaje(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleEnviarMensaje()}
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary" onClick={handleEnviarMensaje}><Send size={14} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
