import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, TrendingUp, Clock } from 'lucide-react';
import { api } from '../api/client';
import type { DailyStats, WeeklyStats } from '../types/api';
import { MacroCard } from '../components/MacroCard';
import { cacheGet, cacheSet } from '../utils/cache';

const today = format(new Date(), 'yyyy-MM-dd')

export function Dashboard() {
  const [daily, setDaily] = useState<DailyStats | null>(null)
  const [weekly, setWeekly] = useState<WeeklyStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cached = cacheGet<{ daily: DailyStats; weekly: WeeklyStats }>('dashboard')
    if (cached) {
      setDaily(cached.daily)
      setWeekly(cached.weekly)
      setLoading(false)
    }

    Promise.all([api.getDaily(today), api.getWeekly(today)])
      .then(([d, w]) => {
        setDaily(d)
        setWeekly(w)
        cacheSet('dashboard', { daily: d, weekly: w })
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const maxKcal = weekly
    ? Math.max(...weekly.dias.map(d => d.total_kcal), 1)
    : 1

  return (
    <div className="animate-fade">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
        <div>
          <div className="page-title">
            Buenos días{' '}
            <span style={{ color: 'var(--green)' }}>
              {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
            </span>
          </div>
          <div className="page-subtitle">Resumen nutricional de hoy</div>
        </div>
        <Link to="/registrar" className="btn btn-primary">
          <Plus size={15} />
          Registrar comida
        </Link>
      </div>

      {error && (
        <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', marginBottom: 24, color: '#F87171', fontSize: 14 }}>
          {error}
        </div>
      )}

      {loading && !daily ? (
        <div className="stat-grid">
          {[0,1,2,3].map(i => (
            <div key={i} className="skeleton" style={{ height: 96, animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      ) : daily ? (
        <>
          <div className="stat-grid">
            <MacroCard label="Calorías" value={daily.total_kcal} unit="kcal" accent="var(--green)" max={2200} />
            <MacroCard label="Proteínas" value={daily.total_protein_g} unit="g" accent="var(--cyan)" max={150} />
            <MacroCard label="Carbohidratos" value={daily.total_carbs_g} unit="g" accent="#A78BFA" max={250} />
            <MacroCard label="Grasas" value={daily.total_fat_g} unit="g" accent="#F59E0B" max={70} />
          </div>

          {/* Weekly chart */}
          {weekly && (
            <div className="card" style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TrendingUp size={15} style={{ color: 'var(--green)' }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Últimos 7 días</span>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>kcal / día</span>
              </div>
              <div className="weekly-bars">
                {weekly.dias.map((dia, i) => {
                  const heightPct = (dia.total_kcal / maxKcal) * 100
                  const isToday = dia.fecha === today
                  return (
                    <div
                      key={dia.fecha}
                      className="weekly-bar-wrap"
                      title={`${dia.fecha}: ${dia.total_kcal} kcal`}
                    >
                      <div
                        className={`weekly-bar ${isToday ? 'today' : ''}`}
                        style={{
                          height: `${Math.max(heightPct, 4)}%`,
                          animationDelay: `${i * 0.06}s`
                        }}
                      />
                      <span className="weekly-bar-label">
                        {format(parseISO(dia.fecha), 'EEE', { locale: es }).slice(0, 2)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Today's meals */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Clock size={15} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
                Comidas de hoy
                {daily.total_comidas > 0 && (
                  <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--text-muted)' }}>
                    ({daily.total_comidas})
                  </span>
                )}
              </span>
            </div>

            {daily.comidas.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <Clock size={24} />
                </div>
                <div className="empty-title">Sin comidas registradas</div>
                <div className="empty-desc">Registra tu primera comida del día usando lenguaje natural.</div>
                <Link to="/registrar" className="btn btn-primary">
                  <Plus size={14} />
                  Registrar ahora
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {daily.comidas.map((c, i) => (
                  <Link
                    to={`/comida/${c.id}`}
                    key={c.id}
                    style={{ textDecoration: 'none' }}
                  >
                    <div className="meal-card" style={{ animationDelay: `${i * 0.08}s` }}>
                      <div className="meal-header">
                        <span className="meal-time">{c.hora}</span>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{c.items} item{c.items !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="meal-text">{c.raw_text}</div>
                      <div className="meal-macros">
                        <span className="macro-chip">
                          <span className="dot" style={{ background: 'var(--green)' }} />
                          {c.kcal} kcal
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}