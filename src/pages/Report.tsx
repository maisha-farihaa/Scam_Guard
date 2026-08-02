import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

export default function Report() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [text, setText] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!text.trim() || !user) return
    setLoading(true)
    await supabase.from('reports').insert({ user_id: user.id, message_text: text })
    setLoading(false)
    setSubmitted(true)
    setText('')
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <p className="text-text-secondary mb-4">Sign in to report a scam message.</p>
        <Link to="/login" className="text-brand font-medium">
          Sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-14">
      <h1 className="text-2xl font-bold mb-2">{t('report')}</h1>
      <p className="text-text-secondary mb-6">{t('reportPrompt')}</p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t('reportPlaceholder')}
        rows={6}
        className="w-full bg-bg-input border border-border rounded-xl p-4 placeholder:text-text-muted resize-y focus:outline-none focus:ring-2 focus:ring-brand/40"
      />

      <button
        onClick={submit}
        disabled={loading || !text.trim()}
        className="mt-4 bg-brand hover:bg-brand-hover disabled:opacity-40 text-black font-bold px-6 py-2.5 rounded-xl transition-colors"
      >
        {loading ? '...' : t('submitReport')}
      </button>

      {submitted && (
        <p className="text-safe text-sm mt-4 animate-fadeIn">
          Thanks — your report has been submitted for review.
        </p>
      )}
    </div>
  )
}
