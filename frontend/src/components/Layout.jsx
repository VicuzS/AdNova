import React, { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Sparkles, Video, MessageSquare,
  Image, CreditCard, Settings, HelpCircle, Bell,
  Search, ChevronDown, Zap
} from 'lucide-react'
import './Layout.css'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/generador', icon: Sparkles, label: 'Generador de Anuncios' },
  { to: '/videos', icon: Video, label: 'Videos IA' },
  { to: '/whatsapp', icon: MessageSquare, label: 'WhatsApp Auto.' },
  { to: '/historial', icon: Image, label: 'Historial y Galería' },
  { to: '/planes', icon: CreditCard, label: 'Planes' },
]

export default function Layout() {
  const [searchVal, setSearchVal] = useState('')

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Zap size={18} color="#fff" />
          </div>
          <div>
            <div className="logo-name">AdNova.ai</div>
            <div className="logo-sub">IA Automatización</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-item--active' : ''}`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <NavLink to="/configuracion" className="nav-item">
            <Settings size={18} />
            <span>Configuración</span>
          </NavLink>
          <NavLink to="/soporte" className="nav-item">
            <HelpCircle size={18} />
            <span>Soporte</span>
          </NavLink>
          <button className="upgrade-btn">
            Mejorar Plan
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="main-area">
        {/* Topbar */}
        <header className="topbar">
          <div className="search-bar">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar campañas, anuncios o analíticas..."
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
            />
          </div>
          <div className="topbar-right">
            <button className="icon-btn notif-btn">
              <Bell size={18} />
              <span className="notif-dot" />
            </button>
            <button className="icon-btn">
              <HelpCircle size={18} />
            </button>
            <div className="user-chip">
              <div className="user-avatar">AU</div>
              <div className="user-info">
                <span className="user-name">AdNova User</span>
                <span className="user-role">Miembro Premium</span>
              </div>
              <ChevronDown size={14} color="var(--gray-400)" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
