import { useAnimatedNumber } from '../hooks/useAnimatedNumber';

interface MacroCardProps {
  label: string
  value: number
  unit: string
  accent: string
  max?: number
}

export function MacroCard({ label, value, unit, accent, max }: MacroCardProps) {
  const animated = useAnimatedNumber(Math.round(value))
  const pct = max ? Math.min((value / max) * 100, 100) : 0

  return (
    <div className="stat-card" style={{ '--accent': accent } as React.CSSProperties}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">
        {animated}
        <span className="stat-unit">{unit}</span>
      </div>
      {max !== undefined && (
        <div className="macro-bar-container">
          <div className="macro-bar-track">
            <div
              className="macro-bar-fill"
              style={{ width: `${pct}%`, '--accent': accent } as React.CSSProperties}
            />
          </div>
        </div>
      )}
    </div>
  )
}