import React from 'react'
import './PageBase.css'

const planes = [
  {
    nombre: 'Básico',
    precio: '$19',
    desc: 'Ideal para empezar a crear anuncios con IA',
    popular: false,
    actual: true,
    features: [
      '50 créditos de anuncios IA',
      '100 mensajes WhatsApp',
      'Historial y galería',
      'Soporte por email',
    ],
    bloqueados: ['Videos Pro', 'Campañas ilimitadas', 'Soporte prioritario'],
  },
  {
    nombre: 'Pro',
    precio: '$49',
    desc: 'Para negocios que quieren escalar su publicidad',
    popular: true,
    actual: false,
    features: [
      '200 créditos de anuncios IA',
      '500 mensajes WhatsApp',
      'Videos Pro (hasta 60s)',
      'Historial ilimitado',
      'Soporte prioritario',
    ],
    bloqueados: ['Campañas ilimitadas'],
  },
  {
    nombre: 'Empresa',
    precio: '$99',
    desc: 'Solución completa para agencias y equipos',
    popular: false,
    actual: false,
    features: [
      'Créditos ilimitados',
      'WhatsApp ilimitado',
      'Videos Pro sin límite',
      'Campañas ilimitadas',
      'Manager dedicado',
      'API access',
    ],
    bloqueados: [],
  },
]

export default function Planes() {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Planes y Precios</h1>
        <p className="page-sub">Escoge el plan que mejor se adapte a tu negocio</p>
      </div>

      <div className="planes-grid">
        {planes.map((plan, i) => (
          <div key={i} className={`plan-card-item ${plan.popular ? 'plan-card-item--popular' : ''}`}>
            {plan.popular && <div className="plan-badge-popular">⭐ MÁS POPULAR</div>}
            <div className="plan-name-item">{plan.nombre}</div>
            <div className="plan-price">{plan.precio}<span>/mes</span></div>
            <div className="plan-desc">{plan.desc}</div>

            <ul className="plan-features-list">
              {plan.features.map((f, j) => <li key={j}>{f}</li>)}
              {plan.bloqueados.map((b, j) => <li key={j} className="disabled">{b}</li>)}
            </ul>

            <button
              className={`btn w-full ${plan.actual ? 'btn-outline' : 'btn-primary'}`}
              disabled={plan.actual}
            >
              {plan.actual ? 'Plan actual' : `Cambiar a ${plan.nombre}`}
            </button>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-title" style={{ marginBottom: 12 }}>Preguntas frecuentes</div>
        {[
          ['¿Puedo cancelar en cualquier momento?', 'Sí, puedes cancelar tu suscripción cuando quieras sin penalizaciones.'],
          ['¿Los créditos no usados se acumulan?', 'No, los créditos se reinician cada mes al renovarse la suscripción.'],
          ['¿Ofrecen prueba gratuita?', 'Sí, todos los planes nuevos incluyen 7 días de prueba gratuita con acceso completo.'],
        ].map(([q, a], i) => (
          <div key={i} style={{ padding: '12px 0', borderBottom: i < 2 ? '1px solid var(--gray-100)' : 'none' }}>
            <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--gray-800)', marginBottom: 4 }}>{q}</div>
            <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>{a}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
