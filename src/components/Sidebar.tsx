import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Utensils, BarChart2 } from 'lucide-react';
import { useThemeContext } from '../contexts/ThemeContext';

export function Sidebar() {
  const { theme, toggleTheme } = useThemeContext()
  const isDark = theme === 'dark'

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
  )
}