import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import GeneradorAnuncios from './pages/GeneradorAnuncios.jsx'
import Videos from './pages/Videos.jsx'
import WhatsApp from './pages/WhatsApp.jsx'
import Historial from './pages/Historial.jsx'
import Planes from './pages/Planes.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="generador" element={<GeneradorAnuncios />} />
        <Route path="videos" element={<Videos />} />
        <Route path="whatsapp" element={<WhatsApp />} />
        <Route path="historial" element={<Historial />} />
        <Route path="planes" element={<Planes />} />
      </Route>
    </Routes>
  )
}
