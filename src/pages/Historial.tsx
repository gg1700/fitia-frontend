import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Trash2, ChevronRight } from 'lucide-react';
import { api } from '../api/client';
import type { Meal } from '../types/api';
import { useToast } from '../contexts/Toast';
import { cacheGet, cacheSet, cacheInvalidate } from '../utils/cache';

export function Historial() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)
  const [desde, setDesde] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'))
  const [hasta, setHasta] = useState(format(new Date(), 'yyyy-MM-dd'))
  const { showToast } = useToast()

  const load = async () => {
    const key = `meals:${desde}:${hasta}`
    const cached = cacheGet<Meal[]>(key)
    if (cached) { setMeals(cached); setLoading(false) }

    setLoading(true)
    try {
      const res = await api.getMeals({ desde, hasta, limite: 100 })
      setMeals(res.meals)
      cacheSet(key, res.meals)
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Error', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [desde, hasta])

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.preventDefault()
    if (!confirm('¿Eliminar esta comida?')) return
    try {
      await api.deleteMeal(id)
      setMeals(m => m.filter(x => x.id !== id))
      cacheInvalidate('meals')
      cacheInvalidate('dashboard')
      showToast('Comida eliminada')
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Error', 'error')
    }
  }

  // Group by date
  const grouped = meals.reduce((acc, meal) => {
    const d = meal.datetime.slice(0, 10)
    if (!acc[d]) acc[d] = []
    acc[d].push(meal)
    return acc
  }, {} as Record<string, Meal[]>)

  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div className="page-title">Historial</div>
        <div className="page-subtitle">Registro de todas tus comidas</div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="historial-filters">
          <div className="input-group">
            <label className="input-label">Desde</label>
            <input type="date" className="input" value={desde} onChange={e => setDesde(e.target.value)} />
          </div>
          <div className="input-group">
            <label className="input-label">Hasta</label>
            <input type="date" className="input" value={hasta} onChange={e => setHasta(e.target.value)} />
          </div>
        </div>
      </div>

      {loading && meals.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[0,1,2].map(i => (
            <div key={i} className="skeleton" style={{ height: 90, animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      ) : dates.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Calendar size={24} /></div>
          <div className="empty-title">Sin comidas en este período</div>
          <div className="empty-desc">Ajusta el rango de fechas o registra una nueva comida.</div>
        </div>
      ) : (
        dates.map(date => (
          <div key={date} style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'var(--font-mono)' }}>
                {format(parseISO(date), "EEEE d 'de' MMMM", { locale: es })}
              </span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {grouped[date].reduce((s, m) => s + m.total_kcal, 0).toFixed(0)} kcal
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {grouped[date].map((meal, i) => (
                <Link
                  to={`/comida/${meal.id}`}
                  key={meal.id}
                  style={{ textDecoration: 'none' }}
                >
                  <div className="meal-card" style={{ animationDelay: `${i * 0.06}s` }}>
                    <div className="meal-header">
                      <span className="meal-time">
                        {meal.datetime.includes('T')
                          ? meal.datetime.slice(11, 16)
                          : '—'}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {meal.notes && (
                          <span className="tag tag-muted">{meal.notes}</span>
                        )}
                        <button
                          className="btn-icon"
                          onClick={e => handleDelete(meal.id, e)}
                          title="Eliminar"
                        >
                          <Trash2 size={13} style={{ color: '#F87171' }} />
                        </button>
                        <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    </div>
                    <div className="meal-text">{meal.raw_text}</div>
                    <div className="meal-macros">
                      <span className="macro-chip">
                        <span className="dot" style={{ background: 'var(--green)' }} />
                        {meal.total_kcal.toFixed(0)} kcal
                      </span>
                      <span className="macro-chip">
                        <span className="dot" style={{ background: 'var(--cyan)' }} />
                        P {meal.total_protein_g.toFixed(1)}g
                      </span>
                      <span className="macro-chip">
                        <span className="dot" style={{ background: '#A78BFA' }} />
                        C {meal.total_carbs_g.toFixed(1)}g
                      </span>
                      <span className="macro-chip">
                        <span className="dot" style={{ background: '#F59E0B' }} />
                        G {meal.total_fat_g.toFixed(1)}g
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}