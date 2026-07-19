import React, { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Sparkles, Image, MessageSquare,
  ShoppingCart, CreditCard, Settings, HelpCircle, Bell,
  Search, ChevronDown, Zap, Package
} from 'lucide-react'
import './Layout.css'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/inventario', icon: Package, label: 'Inventario' },
  { to: '/campanas', icon: Sparkles, label: 'Campañas Inteligentes' },
  { to: '/galeria', icon: Image, label: 'Galería' },
  { to: '/whatsapp', icon: MessageSquare, label: 'WhatsApp Ventas' },
  { to: '/historial', icon: ShoppingCart, label: 'Historial Ventas' },
  { to: '/planes', icon: CreditCard, label: 'Planes' },
]

export default function Layout() {
  const [searchVal, setSearchVal] = useState('')

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Zap size={18} color="#fff" />
          </div>
          <div>
            <div className="logo-name">AdNova.ai</div>
            <div className="logo-sub">CFO de Bolsillo</div>
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

      <div className="main-area">
        <header className="topbar">
          <div className="search-bar">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar campañas, productos o ventas..."
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
                <span className="user-name">AdFlow User</span>
                <span className="user-role">CFO Plan</span>
              </div>
              <ChevronDown size={14} color="var(--gray-400)" />
            </div>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
