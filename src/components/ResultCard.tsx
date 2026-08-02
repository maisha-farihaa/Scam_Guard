import { useEffect, useState } from 'react'
import {
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  Clock,
  Lock,
  Link2,
  Gift,
  UserX,
  AlertTriangle,
} from 'lucide-react'
import type { DetectionResult, Reason } from '../lib/detectionEngine'

const iconMap: Record<Reason['icon'], typeof Clock> = {
  clock: Clock,
  lock: Lock,
  link: Link2,
  gift: Gift,
  'user-x': UserX,
  'alert-triangle': AlertTriangle,
}

const levelStyles = {
  red: {
    border: 'border-danger-border',
    bg: 'bg-danger-bg',
    barBg: 'bg-danger',
    dot: 'bg-danger',
    text: 'text-danger',
    Icon: ShieldAlert,
  },
  yellow: {
    border: 'border-warning-border',
    bg: 'bg-warning-bg',
    barBg: 'bg-warning',
    dot: 'bg-warning',
    text: 'text-warning',
    Icon: ShieldQuestion,
  },
  green: {
    border: 'border-safe-border',
    bg: 'bg-safe-bg',
    barBg: 'bg-safe',
    dot: 'bg-safe',
    text: 'text-safe',
    Icon: ShieldCheck,
  },
} as const

function useCountUp(target: number, duration = 600) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let start: number | null = null
    let frame: number
    const step = (ts: number) => {
      if (start === null) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      setValue(Math.round(progress * target))
      if (progress < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])
  return value
}

export default function ResultCard({ result }: { result: DetectionResult }) {
  const style = levelStyles[result.level]
  const animatedScore = useCountUp(result.score)
  const { Icon } = style

  return (
    <div
      className={`animate-fadeUp rounded-2xl border ${style.border} ${style.bg} p-6 md:p-7`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center ${style.dot}`}>
            <Icon size={22} className="text-black/80" strokeWidth={2.2} />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${style.text}`}>{result.label}</h2>
            <p className="text-text-secondary text-sm mt-0.5">
              Risk score: <span className="animate-count font-semibold">{animatedScore}</span>/100
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 h-2 rounded-full bg-bg-input overflow-hidden">
        <div
          className={`h-full ${style.barBg} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${animatedScore}%` }}
        />
      </div>

      {result.reasons.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
            Why we flagged this
          </h3>
          <div className="space-y-2.5">
            {result.reasons.map((reason, i) => {
              const ReasonIcon = iconMap[reason.icon]
              return (
                <div
                  key={reason.id}
                  className="animate-fadeUp flex gap-3 bg-bg-card border border-border rounded-xl p-3.5"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <ReasonIcon size={18} className={`${style.text} shrink-0 mt-0.5`} strokeWidth={2} />
                  <div>
                    <p className="text-sm font-medium text-text-primary">{reason.title}</p>
                    <p className="text-sm text-text-secondary mt-0.5">{reason.detail}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
