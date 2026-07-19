import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Package, Plus, Edit3, Trash2, Search, AlertTriangle,
  TrendingUp, X, DollarSign, Hash, ExternalLink,
  Upload, Scan, Check, Loader
} from 'lucide-react'
import './PageBase.css'
import './Inventario.css'

const VACIO = { nombre: '', sku: '', costoAdquisicion: '', precioVenta: '', stockActual: '', fotoOriginalUrl: '' }

export default function Inventario() {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(VACIO)
  const [guardando, setGuardando] = useState(false)
  const navigate = useNavigate()

  const [escaner, setEscaner] = useState({ estado: 'idle', productos: [], error: '' })
  const fileInputRef = useRef()
  const [importando, setImportando] = useState(false)

  function cargar() {
    setCargando(true)
    fetch('/api/products')
      .then(r => r.json())
      .then(d => { setProductos(d); setCargando(false) })
      .catch(() => setCargando(false))
  }

  useEffect(cargar, [])

  function abrirNuevo() {
    setForm(VACIO)
    setModal('nuevo')
  }

  function abrirEditar(p) {
    setForm({
      nombre: p.nombre,
      sku: p.sku,
      costoAdquisicion: String(p.costoAdquisicion),
      precioVenta: String(p.precioVenta),
      stockActual: String(p.stockActual),
      fotoOriginalUrl: p.fotoOriginalUrl || '',
    })
    setModal({ tipo: 'editar', id: p.id })
  }

  async function guardar() {
    if (!form.nombre || !form.sku || !form.costoAdquisicion || !form.precioVenta || form.stockActual === '') return
    setGuardando(true)
    try {
      const body = {
        nombre: form.nombre,
        sku: form.sku,
        costoAdquisicion: parseFloat(form.costoAdquisicion),
        precioVenta: parseFloat(form.precioVenta),
        stockActual: parseInt(form.stockActual),
        fotoOriginalUrl: form.fotoOriginalUrl || null,
      }

      const url = modal === 'nuevo' ? '/api/products' : `/api/products/${modal.id}`
      const method = modal === 'nuevo' ? 'POST' : 'PUT'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)

      setModal(null)
      cargar()
    } catch (err) {
      alert(err.message)
    } finally {
      setGuardando(false)
    }
  }

  async function eliminar(id, nombre) {
    if (!confirm(`¿Eliminar "${nombre}"? También se borrarán sus ventas y campañas.`)) return
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      cargar()
    } catch (err) {
      alert(err.message)
    }
  }

  function handleFileSelected(e) {
    const file = e.target.files[0]
    if (!file) return
    setEscaner({ estado: 'escaneando', productos: [], error: '' })

    const formData = new FormData()
    formData.append('invoice', file)

    fetch('/api/inventory/scan-invoice', {
      method: 'POST',
      body: formData,
    })
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          setEscaner({ estado: 'listo', productos: json.data, error: '' })
        } else {
          setEscaner({ estado: 'error', productos: [], error: json.error || 'Error al escanear' })
        }
      })
      .catch(err => setEscaner({ estado: 'error', productos: [], error: err.message }))
  }

  async function confirmarImportacion() {
    if (escaner.productos.length === 0) return
    setImportando(true)
    let fallaron = 0
    for (const p of escaner.productos) {
      try {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: p.nombre,
            sku: p.sku,
            costoAdquisicion: p.costo_adquisicion,
            precioVenta: p.precio_venta_sugerido,
            stockActual: p.cantidad,
          }),
        })
        if (!res.ok) fallaron++
      } catch { fallaron++ }
    }
    setImportando(false)
    setEscaner({ estado: 'idle', productos: [], error: '' })
    cargar()
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function editarResultado(index, campo, valor) {
    setEscaner(prev => {
      const productos = [...prev.productos]
      productos[index] = { ...productos[index], [campo]: valor }
      return { ...prev, productos }
    })
  }

  const filtrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.sku.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Inventario</h1>
          <p className="page-sub">Gestiona tus productos — el sistema calcula automáticamente margen, rotación y alertas</p>
        </div>
        <button className="btn btn-primary" onClick={abrirNuevo}>
          <Plus size={15} /> Nuevo producto
        </button>
      </div>

      {/* ── Escáner de Facturas ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: escaner.estado !== 'idle' ? 16 : 0 }}>
          <div>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Scan size={16} /> Escáner de Facturas con IA
            </div>
            <p className="card-sub" style={{ marginTop: 2 }}>Sube una foto de la factura de tu proveedor y Gemini extrae los productos automáticamente</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={handleFileSelected}
          />
          <button className="btn btn-primary" onClick={() => fileInputRef.current.click()} disabled={escaner.estado === 'escaneando'}>
            {escaner.estado === 'escaneando' ? <><Loader size={14} className="spin" /> Escaneando...</> : <><Upload size={14} /> Subir factura</>}
          </button>
        </div>

        {escaner.estado === 'escaneando' && (
          <div className="empty-state" style={{ minHeight: 100, padding: 20 }}>
            <div className="loading-ring" />
            <p style={{ color: 'var(--gray-500)', fontSize: 13 }}>Gemini está analizando la factura...</p>
          </div>
        )}

        {escaner.estado === 'error' && (
          <div className="info-box" style={{ background: '#FEF2F2', borderColor: '#FECACA', color: '#DC2626' }}>
            <AlertTriangle size={14} /> {escaner.error}
          </div>
        )}

        {escaner.estado === 'listo' && escaner.productos.length > 0 && (
          <div>
            <div style={{ overflowX: 'auto' }}>
              <table className="inv-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>SKU</th>
                    <th>Cantidad</th>
                    <th>Costo unit.</th>
                    <th>Precio venta sugerido</th>
                  </tr>
                </thead>
                <tbody>
                  {escaner.productos.map((p, i) => (
                    <tr key={i}>
                      <td>
                        <input className="form-input" style={{ fontSize: 13, padding: '5px 8px' }} value={p.nombre} onChange={e => editarResultado(i, 'nombre', e.target.value)} />
                      </td>
                      <td>
                        <input className="form-input" style={{ fontSize: 12, fontFamily: 'var(--font-mono)', padding: '5px 8px' }} value={p.sku} onChange={e => editarResultado(i, 'sku', e.target.value)} />
                      </td>
                      <td>
                        <input className="form-input" type="number" style={{ fontSize: 13, padding: '5px 8px', width: 70 }} value={p.cantidad} onChange={e => editarResultado(i, 'cantidad', parseInt(e.target.value) || 0)} />
                      </td>
                      <td className="inv-mono">${p.costo_adquisicion}</td>
                      <td className="inv-mono">${p.precio_venta_sugerido}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, padding: '0 4px' }}>
              <span style={{ fontSize: 12.5, color: 'var(--gray-500)' }}>
                {escaner.productos.length} producto(s) detectados — puedes editar antes de importar
              </span>
              <button className="btn btn-primary" onClick={confirmarImportacion} disabled={importando}>
                {importando ? <><Loader size={14} className="spin" /> Importando...</> : <><Check size={14} /> Importar al inventario</>}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Tabla de inventario ── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
            <input
              className="form-input"
              style={{ paddingLeft: 32 }}
              placeholder="Buscar por nombre o SKU..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
          <span style={{ fontSize: 12.5, color: 'var(--gray-500)' }}>
            {productos.length} producto(s)
          </span>
        </div>

        {cargando ? (
          <div className="empty-state" style={{ minHeight: 200 }}>
            <div className="loading-ring" />
            <p style={{ color: 'var(--gray-500)' }}>Cargando inventario...</p>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="empty-state" style={{ minHeight: 200 }}>
            <Package size={40} color="var(--gray-200)" />
            <h3>{busqueda ? 'Sin resultados' : 'Inventario vacío'}</h3>
            <p>{busqueda ? 'Prueba con otro término de búsqueda.' : 'Agrega tu primer producto o escanea una factura.'}</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="inv-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>SKU</th>
                  <th>Costo</th>
                  <th>Precio</th>
                  <th>Margen</th>
                  <th>Stock</th>
                  <th>Días</th>
                  <th>Alertas</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map(p => (
                  <tr key={p.id} className="inv-row" onClick={() => navigate(`/producto/${p.id}`)}>
                    <td className="inv-nombre">{p.nombre}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{p.sku}</td>
                    <td className="inv-mono">${p.costoAdquisicion}</td>
                    <td className="inv-mono">${p.precioVenta}</td>
                    <td className="inv-mono">
                      <span style={{ color: p.margen < 20 ? 'var(--red)' : 'var(--green)', fontWeight: 600 }}>
                        {p.margen}%
                      </span>
                    </td>
                    <td className="inv-mono">{p.stockActual}</td>
                    <td className="inv-mono">{p.diasEnAlmacen}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {p.alertas?.stockMuerto && <span className="inv-badge inv-badge--red">Stock Muerto</span>}
                        {p.alertas?.margenRiesgo && <span className="inv-badge inv-badge--amber">Margen</span>}
                        {!p.alertas?.stockMuerto && !p.alertas?.margenRiesgo && <span className="inv-badge inv-badge--green">OK</span>}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                        <button className="inv-action" onClick={() => abrirEditar(p)} title="Editar"><Edit3 size={13} /></button>
                        <button className="inv-action inv-action--red" onClick={() => eliminar(p.id, p.nombre)} title="Eliminar"><Trash2 size={13} /></button>
                        <button className="inv-action" onClick={() => navigate(`/producto/${p.id}`)} title="Ver detalle"><ExternalLink size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modal === 'nuevo' ? 'Nuevo producto' : 'Editar producto'}</h2>
              <button className="inv-action" onClick={() => setModal(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Nombre *</label>
                  <input className="form-input" placeholder="Ej: Lámpara LED" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">SKU *</label>
                  <input className="form-input" placeholder="Ej: LED-001" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Costo adquisición ($) *</label>
                  <input className="form-input" type="number" step="0.01" min="0" placeholder="25.00" value={form.costoAdquisicion} onChange={e => setForm({ ...form, costoAdquisicion: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Precio venta ($) *</label>
                  <input className="form-input" type="number" step="0.01" min="0" placeholder="45.00" value={form.precioVenta} onChange={e => setForm({ ...form, precioVenta: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Stock actual *</label>
                  <input className="form-input" type="number" min="0" placeholder="50" value={form.stockActual} onChange={e => setForm({ ...form, stockActual: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">URL imagen (opcional)</label>
                  <input className="form-input" placeholder="https://..." value={form.fotoOriginalUrl} onChange={e => setForm({ ...form, fotoOriginalUrl: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={guardar} disabled={guardando}>
                {guardando ? 'Guardando...' : modal === 'nuevo' ? 'Crear producto' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
