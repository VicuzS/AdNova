import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import {
  TrendingUp, TrendingDown, Video, ArrowRight,
  MoreVertical, AlertTriangle, ExternalLink, DollarSign,
  Package, Percent, ShieldAlert
} from 'lucide-react'
import './Dashboard.css'

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <div className="tooltip-label">{label}</div>
        <div className="tooltip-value">{payload[0].value.toLocaleString()} Conversiones</div>
      </div>
    )
  }
  return null
}

const dataSemana = [
  { dia: 'Lun', conversiones: 620 },
  { dia: 'Mar', conversiones: 780 },
  { dia: 'Mié', conversiones: 690 },
  { dia: 'Jue', conversiones: 910 },
  { dia: 'Vie', conversiones: 1050 },
  { dia: 'Sáb', conversiones: 1180 },
  { dia: 'Dom', conversiones: 1240 },
]

const dataMes = [
  { dia: '01', conversiones: 320 }, { dia: '03', conversiones: 480 },
  { dia: '05', conversiones: 560 }, { dia: '07', conversiones: 440 },
  { dia: '09', conversiones: 670 }, { dia: '11', conversiones: 720 },
  { dia: '13', conversiones: 590 }, { dia: '15', conversiones: 800 },
  { dia: '17', conversiones: 870 }, { dia: '19', conversiones: 940 },
  { dia: '21', conversiones: 1020 }, { dia: '23', conversiones: 980 },
  { dia: '25', conversiones: 1100 }, { dia: '27', conversiones: 1180 },
  { dia: '30', conversiones: 1240 },
]

function IconoAlerta({ alerta }) {
  if (alerta.includes('Stock Muerto')) return <Package size={16} />
  if (alerta.includes('Margen')) return <Percent size={16} />
  return <ShieldAlert size={16} />
}

export default function Dashboard() {
  const [periodo, setPeriodo] = useState('30')
  const [metricas, setMetricas] = useState(null)
  const [cargando, setCargando] = useState(true)
  const navigate = useNavigate()
  const data = periodo === '7' ? dataSemana : dataMes

  useEffect(() => {
    fetch('/api/dashboard/metrics')
      .then(r => r.json())
      .then(d => { setMetricas(d); setCargando(false) })
      .catch(() => setCargando(false))
  }, [])

  return (
    <div className="dashboard">
      <div className="dash-header">
        <div>
          <h1 className="dash-title">CFO de Bolsillo</h1>
          <p className="dash-sub">Business Intelligence para tu PYME — Alertas y métricas en tiempo real.</p>
        </div>
      </div>

      <div className="dash-grid">
        <div className="dash-main">
          {/* ── Tarjetas de métricas económicas ── */}
          {metricas && (
            <div className="metricas-eco">
              <div className="card metrica-card">
                <div className="metrica-icono metrica-icono--verde">
                  <DollarSign size={20} />
                </div>
                <div className="metrica-info">
                  <span className="metrica-label">Ventas Totales</span>
                  <span className="metrica-valor">${metricas.ventasTotales.toLocaleString()}</span>
                </div>
              </div>
              <div className="card metrica-card">
                <div className="metrica-icono metrica-icono--azul">
                  <Percent size={20} />
                </div>
                <div className="metrica-info">
                  <span className="metrica-label">Margen Promedio</span>
                  <span className="metrica-valor">{metricas.margenPromedio}%</span>
                </div>
              </div>
              <div className="card metrica-card">
                <div className="metrica-icono metrica-icono--rojo">
                  <Package size={20} />
                </div>
                <div className="metrica-info">
                  <span className="metrica-label">Capital Inmovilizado</span>
                  <span className="metrica-valor">${metricas.capitalInmovilizado.toLocaleString()}</span>
                </div>
              </div>
              <div className="card metrica-card">
                <div className="metrica-icono metrica-icono--ambar">
                  <ShieldAlert size={20} />
                </div>
                <div className="metrica-info">
                  <span className="metrica-label">Alertas Activas</span>
                  <span className="metrica-valor">{metricas.aiInsights?.length || 0}</span>
                </div>
              </div>
            </div>
          )}

          {cargando && <p className="text-muted" style={{padding:'1rem'}}>Cargando métricas...</p>}

          {/* ── AI Insights ── */}
          {metricas?.aiInsights?.length > 0 && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <ShieldAlert size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                  AI Insights — Alertas Financieras
                </div>
              </div>
              <div className="insights-lista">
                {metricas.aiInsights.map((insight, i) => (
                  <div key={i} className={`insight-item insight-item--${insight.alerta.includes('Stock') ? 'rojo' : 'ambar'}`}>
                    <div className="insight-icono">
                      <IconoAlerta alerta={insight.alerta} />
                    </div>
                    <div className="insight-cuerpo">
                      <div className="insight-titulo">
                        <strong>{insight.producto}</strong>
                        <span className="insight-badge">{insight.alerta}</span>
                      </div>
                      <p className="insight-detalle">{insight.detalle}</p>
                      <p className="insight-sugerencia">
                        <strong>Sugerencia:</strong> {insight.sugerencia}
                      </p>
                      <span className="insight-estrategia">{insight.estrategia}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gráfica conversiones */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Conversiones</div>
                <div className="card-sub">Tasa de éxito de campañas activas</div>
              </div>
              <div className="period-toggle">
                <button
                  className={`period-btn ${periodo === '7' ? 'period-btn--active' : ''}`}
                  onClick={() => setPeriodo('7')}
                >7 días</button>
                <button
                  className={`period-btn ${periodo === '30' ? 'period-btn--active' : ''}`}
                  onClick={() => setPeriodo('30')}
                >30 días</button>
              </div>
            </div>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1A56DB" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#1A56DB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="conversiones"
                    stroke="#1A56DB"
                    strokeWidth={2.5}
                    fill="url(#gradBlue)"
                    dot={false}
                    activeDot={{ r: 5, fill: '#1A56DB', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="dash-side">
          <div className="card side-card">
            <div className="side-card-icon side-card-icon--blue">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>
            <div className="side-trend side-trend--down">
              <TrendingDown size={12} /> -0.2%
            </div>
            <div className="side-label">Créditos de Anuncios IA</div>
            <div className="side-value">
              14<span className="side-value-total">/50</span>
              <span className="side-value-unit"> USADOS</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill progress-fill--blue" style={{ width: '28%' }} />
            </div>
          </div>

          <div className="card side-card side-card--warn">
            <div className="side-card-icon side-card-icon--yellow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div className="side-label">Mensajes de WhatsApp</div>
            <div className="side-value">
              82<span className="side-value-total">/100</span>
              <span className="side-value-unit"> USADOS</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill progress-fill--yellow" style={{ width: '82%' }} />
            </div>
            <div className="side-warn">
              <AlertTriangle size={12} /> Queda poco saldo disponible
            </div>
          </div>

          <div className="card side-card plan-card">
            <div className="plan-label">Plan Actual</div>
            <div className="plan-name-row">
              <span className="plan-name">Básico</span>
              <span className="plan-badge">ACTIVO</span>
            </div>
            <ul className="plan-features">
              <li>✓ 50 créditos de anuncios IA</li>
              <li>✓ 100 mensajes WhatsApp</li>
              <li>✓ Galería e historial</li>
              <li>✗ Videos Pro (bloqueado)</li>
            </ul>
            <button
              className="btn btn-primary w-full"
              onClick={() => navigate('/planes')}
            >
              Mejorar Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
