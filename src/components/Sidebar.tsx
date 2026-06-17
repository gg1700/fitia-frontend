import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Utensils, BarChart2, Menu, X } from 'lucide-react'
import { useThemeContext } from '../contexts/ThemeContext'

export function Sidebar() {
  const { theme, toggleTheme } = useThemeContext()
  const isDark = theme === 'dark'
  const [mobileOpen, setMobileOpen] = useState(false)

  const close = () => setMobileOpen(false)

  return (
    <>
      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <button
          id="sidebar-toggle-btn"
          className="mobile-menu-btn"
          onClick={() => setMobileOpen(o => !o)}
          aria-label="Abrir menú"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="mobile-logo">
          <div className="logo-mark" style={{ width: 28, height: 28, fontSize: 14 }}>f</div>
          <span className="logo-text" style={{ fontSize: 17 }}>NutrIA</span>
        </div>
        {/* Spacer to balance the flex row */}
        <div style={{ width: 36 }} />
      </div>

      {/* Overlay (mobile only) */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={close} aria-hidden="true" />
      )}

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-mark">f</div>
          <div>
            <div className="logo-text">NutrIA</div>
          </div>
          <div className="logo-beta">beta</div>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section-label">Principal</span>

          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={close}>
            <LayoutDashboard size={16} />
            Dashboard
          </NavLink>

          <NavLink to="/registrar" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={close}>
            <Utensils size={16} />
            Registrar comida
          </NavLink>

          <NavLink to="/historial" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={close}>
            <BarChart2 size={16} />
            Historial
          </NavLink>
        </nav>

        {/* Theme toggle at the bottom */}
        <div className="sidebar-theme-toggle">
          <span className="theme-label">{isDark ? 'Modo oscuro' : 'Modo claro'}</span>
          <button
            id="theme-toggle-btn"
            className={`theme-switch ${isDark ? 'dark' : 'light'}`}
            onClick={toggleTheme}
            aria-label="Cambiar tema"
            title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            <span className="theme-switch-track">
              <span className="theme-switch-icons">
                <span className="theme-icon sun">☀️</span>
                <span className="theme-icon moon">🌙</span>
              </span>
              <span className="theme-switch-thumb" />
            </span>
          </button>
        </div>
      </aside>
    </>
  )
}