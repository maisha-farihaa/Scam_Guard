import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

interface CheckRow {
  id: string
  input_text: string
  risk_level: 'red' | 'yellow' | 'green'
  risk_score: number
  checked_at: string
}

const dotColor = { red: 'bg-danger', yellow: 'bg-warning', green: 'bg-safe' } as const

export default function History() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [rows, setRows] = useState<CheckRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    supabase
      .from('checks')
      .select('id, input_text, risk_level, risk_score, checked_at')
      .order('checked_at', { ascending: false })
      .then(({ data }) => {
        setRows((data as CheckRow[]) || [])
        setLoading(false)
      })
  }, [user])

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <p className="text-text-secondary mb-4">Sign in to see your check history.</p>
        <Link to="/login" className="text-brand font-medium">
          Sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-14">
      <h1 className="text-2xl font-bold mb-6">{t('history')}</h1>

      {loading && <p className="text-text-secondary">Loading...</p>}
      {!loading && rows.length === 0 && <p className="text-text-secondary">{t('noHistory')}</p>}

      <div className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.id}
            className="bg-bg-card border border-border rounded-xl p-4 flex items-start gap-3"
          >
            <span className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${dotColor[row.risk_level]}`} />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-text-primary line-clamp-2">{row.input_text}</p>
              <p className="text-xs text-text-muted mt-1">
                {new Date(row.checked_at).toLocaleString()} · {row.risk_score}/100
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
