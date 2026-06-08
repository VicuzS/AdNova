import React, { useState } from 'react'
import { MessageSquare, Send, Plus, Zap } from 'lucide-react'
import './PageBase.css'

const mensajesEjemplo = [
  { tipo: 'out', texto: '¡Hola! 👋 Gracias por tu interés en nuestros productos. ¿En qué puedo ayudarte?', hora: '10:30' },
  { tipo: 'in', texto: 'Hola, quiero información sobre el plan premium', hora: '10:31' },
  { tipo: 'out', texto: 'Claro, el plan Premium incluye: ✅ 200 créditos de anuncios IA\n✅ Videos Pro ilimitados\n✅ Soporte prioritario\n\nPrecio: $49/mes. ¿Te interesa?', hora: '10:31' },
  { tipo: 'in', texto: 'Sí, me interesa. ¿Cómo pago?', hora: '10:32' },
]

const secuencias = [
  { nombre: 'Bienvenida nuevos clientes', estado: 'Activo', enviados: 142, tasa: '68%' },
  { nombre: 'Seguimiento de carrito abandonado', estado: 'Activo', enviados: 87, tasa: '42%' },
  { nombre: 'Re-engagement 30 días', estado: 'Pausado', enviados: 0, tasa: '—' },
]

export default function WhatsApp() {
  const [mensaje, setMensaje] = useState('')

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">WhatsApp Automatización</h1>
        <p className="page-sub">Gestiona mensajes automáticos y secuencias de seguimiento</p>
      </div>

      <div className="simple-page">
        {/* Stats */}
        <div className="stats-row">
          {[
            { label: 'Mensajes enviados', value: '82', total: '/ 100', color: 'blue' },
            { label: 'Tasa de apertura', value: '94%', color: 'green' },
            { label: 'Respuestas', value: '61%', color: 'blue' },
            { label: 'Conversiones', value: '23', color: 'green' },
          ].map((s, i) => (
            <div key={i} className={`stat-card stat-card--${s.color}`}>
              <div className="stat-value">{s.value} <span>{s.total || ''}</span></div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="wa-grid">
          {/* Simulador de chat */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 14 }}>Simulador de respuestas</div>
            <div className="wa-phone-mock">
              {mensajesEjemplo.map((m, i) => (
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
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary"><Send size={14} /></button>
            </div>
          </div>

          {/* Secuencias */}
          <div className="card">
            <div className="card-header-row">
              <div className="card-title">Secuencias automáticas</div>
              <button className="btn btn-outline" style={{ fontSize: 12, padding: '6px 12px' }}>
                <Plus size={13} /> Nueva secuencia
              </button>
            </div>
            <div className="seq-list">
              {secuencias.map((s, i) => (
                <div key={i} className="seq-item">
                  <div className="seq-icon"><Zap size={14} color="var(--blue-primary)" /></div>
                  <div className="seq-info">
                    <div className="seq-name">{s.nombre}</div>
                    <div className="seq-meta">{s.enviados} enviados · Tasa de apertura: {s.tasa}</div>
                  </div>
                  <span className={`estado-badge estado-badge--${s.estado === 'Activo' ? 'green' : 'yellow'}`}>
                    {s.estado}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
