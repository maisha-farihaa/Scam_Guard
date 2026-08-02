import { useState } from 'react'
import { analyzeMessage, EXAMPLE_MESSAGES, type DetectionResult } from '../lib/detectionEngine'
import { checkUrlReputation } from '../lib/safeBrowsing'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import ResultCard from '../components/ResultCard'
import LoadingCard from '../components/LoadingCard'

export default function Checker() {
  const [text, setText] = useState('')
  const [result, setResult] = useState<DetectionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { t } = useLanguage()

  const runCheck = async () => {
    if (!text.trim()) return
    setLoading(true)

    // Give the loading state a moment to render/feel real, then run the
    // client-side engine immediately (instant) and enrich with Safe Browsing.
    const baseResult = analyzeMessage(text)

    const urls = text.match(/(https?:\/\/[^\s]+)|(\bwww\.[^\s]+)/gi) || []
    let finalResult = baseResult
    if (urls.length > 0) {
      const flaggedAny = (
        await Promise.all(urls.map((u) => checkUrlReputation(u)))
      ).some(Boolean)
      if (flaggedAny) {
        const boosted = Math.min(100, baseResult.score + 40)
        finalResult = {
          ...baseResult,
          score: boosted,
          level: boosted >= 66 ? 'red' : boosted >= 31 ? 'yellow' : 'green',
          reasons: [
            {
              id: 'safe-browsing',
              title: 'Flagged by Google Safe Browsing',
              detail: 'This link is on a known list of malicious or phishing sites.',
              weight: 40,
              icon: 'alert-triangle',
            },
            ...baseResult.reasons,
          ],
        }
      }
    }

    setResult(finalResult)
    setLoading(false)

    if (user) {
      await supabase.from('checks').insert({
        user_id: user.id,
        input_text: text,
        risk_level: finalResult.level,
        risk_score: finalResult.score,
        reasons: finalResult.reasons,
      })
    }
  }

  const tryExample = () => {
    const example = EXAMPLE_MESSAGES[Math.floor(Math.random() * EXAMPLE_MESSAGES.length)]
    setText(example)
    setResult(null)
  }

  const clear = () => {
    setText('')
    setResult(null)
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <h1 className="text-5xl font-extrabold tracking-tight mb-3">SCAM SHIELD</h1>
      <p className="text-text-secondary text-lg mb-8">{t('tagline')}</p>

      <div className="bg-bg-card border border-border rounded-2xl p-5">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('placeholder')}
          rows={6}
          className="w-full bg-bg-input border border-border rounded-xl p-4 text-text-primary placeholder:text-text-muted resize-y focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/50 transition-shadow"
        />

        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={runCheck}
            disabled={loading || !text.trim()}
            className="bg-brand hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold px-6 py-2.5 rounded-xl transition-colors"
          >
            {t('checkNow')}
          </button>
          <button
            onClick={tryExample}
            className="border border-border-strong text-text-secondary hover:text-text-primary hover:bg-bg-input px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            {t('tryExample')}
          </button>
          {text && (
            <button
              onClick={clear}
              className="text-text-muted hover:text-text-secondary text-sm font-medium px-2"
            >
              {t('clear')}
            </button>
          )}
        </div>
      </div>

      <div className="mt-6">
        {loading && <LoadingCard />}
        {!loading && result && <ResultCard result={result} />}
      </div>
    </div>
  )
}
