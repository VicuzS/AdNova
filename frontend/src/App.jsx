import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Inventario from './pages/Inventario.jsx'
import CampanasInteligentes from './pages/CampanasInteligentes.jsx'
import GaleriaCampanas from './pages/GaleriaCampanas.jsx'
import WhatsApp from './pages/WhatsApp.jsx'
import Historial from './pages/Historial.jsx'
import Planes from './pages/Planes.jsx'
import DetalleProducto from './pages/DetalleProducto.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="inventario" element={<Inventario />} />
        <Route path="campanas" element={<CampanasInteligentes />} />
        <Route path="galeria" element={<GaleriaCampanas />} />
        <Route path="whatsapp" element={<WhatsApp />} />
        <Route path="historial" element={<Historial />} />
        <Route path="planes" element={<Planes />} />
        <Route path="producto/:id" element={<DetalleProducto />} />
      </Route>
    </Routes>
  )
}
