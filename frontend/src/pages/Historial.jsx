import React, { useState } from 'react'
import { Image, Search, Filter } from 'lucide-react'
import './PageBase.css'

const items = [
  { nombre: 'Summer Sale 2024', tipo: 'Imagen', plataforma: 'Facebook', fecha: 'Hace 2 días' },
  { nombre: 'Video Promo Relojes', tipo: 'Video', plataforma: 'TikTok', fecha: 'Hace 3 días' },
  { nombre: 'Lead Gen B2B', tipo: 'Imagen', plataforma: 'LinkedIn', fecha: 'Hace 5 días' },
  { nombre: 'Retargeting Q1', tipo: 'Imagen', plataforma: 'Google', fecha: 'Hace 6 días' },
  { nombre: 'Promo Navidad', tipo: 'Video', plataforma: 'Instagram', fecha: 'Hace 1 sem.' },
  { nombre: 'Flash Sale 50%', tipo: 'Imagen', plataforma: 'Facebook', fecha: 'Hace 1 sem.' },
  { nombre: 'Nuevo Producto X', tipo: 'Imagen', plataforma: 'Instagram', fecha: 'Hace 2 sem.' },
  { nombre: 'Campaña Email B2C', tipo: 'Imagen', plataforma: 'Google', fecha: 'Hace 2 sem.' },
]

const colores = [
  'linear-gradient(135deg,#0F1F4B,#1A3A7A)',
  'linear-gradient(135deg,#065F46,#059669)',
  'linear-gradient(135deg,#7C3AED,#4F46E5)',
  'linear-gradient(135deg,#B45309,#D97706)',
  'linear-gradient(135deg,#1E293B,#334155)',
  'linear-gradient(135deg,#BE123C,#E11D48)',
  'linear-gradient(135deg,#0369A1,#0EA5E9)',
  'linear-gradient(135deg,#166534,#16A34A)',
]

export default function Historial() {
  const [busqueda, setBusqueda] = useState('')
  const filtrados = items.filter(i =>
    i.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Historial y Galería</h1>
        <p className="page-sub">Todos tus anuncios y videos generados en un solo lugar</p>
      </div>

      <div className="card">
        <div className="gallery-toolbar">
          <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
            <input
              className="form-input"
              style={{ paddingLeft: 32 }}
              placeholder="Buscar anuncios..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
          <button className="btn btn-outline"><Filter size={14} /> Filtrar</button>
        </div>

        <div className="hist-grid">
          {filtrados.map((item, i) => (
            <div key={i} className="hist-item">
              <div className="hist-thumb" style={{ background: colores[i % colores.length] }}>
                {item.tipo === 'Video'
                  ? <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>▶ Video</span>
                  : <Image size={24} color="rgba(255,255,255,0.25)" />
                }
              </div>
              <div className="hist-info">
                <div className="hist-name">{item.nombre}</div>
                <div className="hist-meta">{item.tipo} · {item.plataforma} · {item.fecha}</div>
              </div>
            </div>
          ))}
        </div>

        {filtrados.length === 0 && (
          <div className="empty-state">
            <Image size={40} color="var(--gray-200)" />
            <h3>Sin resultados</h3>
            <p>No encontramos anuncios que coincidan con tu búsqueda.</p>
          </div>
        )}
      </div>
    </div>
  )
}
