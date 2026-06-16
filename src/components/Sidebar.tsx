import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Utensils, Apple, BarChart2, Search } from 'lucide-react'

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">f</div>
        <div>
          <div className="logo-text">fitia</div>
        </div>
        <div className="logo-beta">beta</div>
      </div>

      <nav className="sidebar-nav">
        <span className="nav-section-label">Principal</span>

        <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={16} />
          Dashboard
        </NavLink>

        <NavLink to="/registrar" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Utensils size={16} />
          Registrar comida
        </NavLink>

        <NavLink to="/historial" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <BarChart2 size={16} />
          Historial
        </NavLink>

        <span className="nav-section-label" style={{ marginTop: 8 }}>Catálogo</span>

        <NavLink to="/alimentos" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Apple size={16} />
          Alimentos
        </NavLink>

        <NavLink to="/analizar" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Search size={16} />
          Analizar texto
        </NavLink>
      </nav>

    </aside>
  )
}