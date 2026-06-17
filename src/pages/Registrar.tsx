import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Send, Zap, ChevronRight } from 'lucide-react';
import { api } from '../api/client';
import type { AnalyzeResult } from '../types/api';
import { useToast } from '../contexts/Toast';
import { cacheInvalidate } from '../utils/cache';

const EXAMPLES = [
  'dos huevos fritos y media palta',
  '150 g de arroz con pollo',
  'un vaso de leche y dos tostadas con mantequilla',
  'ensalada de quinoa con 100g de atún',
]

export function Registrar() {
  const [text, setText] = useState('')
  const [datetime, setDatetime] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"))
  const [notes, setNotes] = useState('')
  const [preview, setPreview] = useState<AnalyzeResult[] | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [saving, setSaving] = useState(false)
  const textRef = useRef<HTMLTextAreaElement>(null)
  const { showToast } = useToast()
  const navigate = useNavigate()

  const handleAnalyze = async () => {
    if (!text.trim()) return
    setAnalyzing(true)
    setPreview(null)
    try {
      const res = await api.analyze(text.trim())
      setPreview(res.results)
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Error al analizar', 'error')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleSave = async () => {
    if (!text.trim()) return
    setSaving(true)
    try {
      const meal = await api.createMeal({ text: text.trim(), datetime, notes })
      cacheInvalidate('dashboard')
      cacheInvalidate('meals')
      showToast('Comida registrada ✓')
      navigate(`/comida/${meal.id}`)
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Error al guardar', 'error')
    } finally {
      setSaving(false)
    }
  }

  const totalKcal = preview?.reduce((s, r) => s + r.kcal, 0) ?? 0
  const totalP = preview?.reduce((s, r) => s + r.protein_g, 0) ?? 0
  const totalC = preview?.reduce((s, r) => s + r.carbs_g, 0) ?? 0
  const totalF = preview?.reduce((s, r) => s + r.fat_g, 0) ?? 0

  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
    <div className="animate-fade" style={{ maxWidth: 660, width: '100%' }}>
      <div className="page-header">
        <div className="page-title">Registrar comida</div>
        <div className="page-subtitle">Describe lo que comiste en lenguaje natural</div>
      </div>

      {/* NLP Terminal */}
      <div className="nlp-terminal" style={{ marginBottom: 20 }}>
        <div className="nlp-terminal-header">
          <div className="terminal-dot red" />
          <div className="terminal-dot yellow" />
          <div className="terminal-dot green" />
          <span className="nlp-prompt">$ analizar_comida</span>
        </div>
        <textarea
          ref={textRef}
          className="nlp-input"
          value={text}
          onChange={e => { setText(e.target.value); setPreview(null) }}
          placeholder="ej: dos huevos fritos con media palta..."
          rows={3}
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleAnalyze()
          }}
        />
        <div className="nlp-actions">
          <span className="nlp-hint">
            {text.length > 0 ? `${text.length} caracteres · Ctrl+Enter para previsualizar` : 'Escribe lo que comiste'}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleAnalyze}
              disabled={!text.trim() || analyzing}
            >
              {analyzing ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <Zap size={13} />}
              Previsualizar
            </button>
          </div>
        </div>
      </div>

      {/* Examples */}
      {!text && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, fontWeight: 600 }}>
            Ejemplos
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {EXAMPLES.map(ex => (
              <button
                key={ex}
                onClick={() => { setText(ex); textRef.current?.focus() }}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  color: 'var(--text-secondary)',
                  fontSize: 13,
                  textAlign: 'left',
                  fontFamily: 'var(--font-mono)',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget
                  el.style.borderColor = 'var(--border-bright)'
                  el.style.color = 'var(--text-primary)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget
                  el.style.borderColor = 'var(--border)'
                  el.style.color = 'var(--text-secondary)'
                }}
              >
                <span>{ex}</span>
                <ChevronRight size={13} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Preview results */}
      {preview && (
        <div className="card animate-fade" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
              Análisis NLP — {preview.length} alimento{preview.length !== 1 ? 's' : ''} detectado{preview.length !== 1 ? 's' : ''}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>
              {Math.round(totalKcal)} kcal total
            </span>
          </div>

          {preview.map((r, i) => (
            <div key={i} className="analyze-result-item">
              <div>
                <div className="analyze-food-name">{r.food_name}</div>
                <div className="analyze-portion">{r.portion_used}</div>
              </div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--text-muted)' }}>
                  <span style={{ color: 'var(--cyan)' }}>P {r.protein_g.toFixed(1)}g</span>
                  <span style={{ color: '#A78BFA' }}>C {r.carbs_g.toFixed(1)}g</span>
                  <span style={{ color: '#F59E0B' }}>G {r.fat_g.toFixed(1)}g</span>
                </div>
                <span className="analyze-kcal">{Math.round(r.kcal)}</span>
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 20, paddingTop: 14, borderTop: '1px solid var(--border)', marginTop: 4 }}>
            {[
              { label: 'Proteínas', val: totalP, color: 'var(--cyan)' },
              { label: 'Carbos', val: totalC, color: '#A78BFA' },
              { label: 'Grasas', val: totalF, color: '#F59E0B' },
            ].map(m => (
              <div key={m.label} style={{ fontSize: 12 }}>
                <span style={{ color: m.color, fontWeight: 600 }}>{m.val.toFixed(1)}g</span>
                {' '}
                <span style={{ color: 'var(--text-muted)' }}>{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      {text.trim() && (
        <div className="card animate-fade" style={{ marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div className="input-group">
              <label className="input-label">Fecha y hora</label>
              <input
                type="datetime-local"
                className="input"
                value={datetime}
                onChange={e => setDatetime(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Notas (opcional)</label>
              <input
                className="input"
                placeholder="ej: almuerzo, snack..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving || !text.trim()}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {saving
              ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Guardando...</>
              : <><Send size={14} /> Guardar comida</>}
          </button>
        </div>
      )}
    </div>
    </div>
  )
}