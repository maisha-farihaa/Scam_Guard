import { Link, useLocation } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'

function NavLink({ to, label }: { to: string; label: string }) {
  const { pathname } = useLocation()
  const active = pathname === to
  return (
    <Link
      to={to}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-bg-input text-text-primary'
          : 'text-text-secondary hover:text-text-primary'
      }`}
    >
      {label}
    </Link>
  )
}

export default function Navbar() {
  const { lang, setLang, t } = useLanguage()
  const { user, signOut } = useAuth()

  return (
    <nav className="flex items-center justify-between px-6 md:px-10 py-4 border-b border-border">
      <Link to="/" className="flex items-center gap-2">
        <ShieldCheck className="text-brand" size={22} strokeWidth={2.2} />
        <span className="font-extrabold tracking-tight text-lg">SCAM SHIELD</span>
      </Link>

      <div className="hidden md:flex items-center gap-1">
        <NavLink to="/" label={t('checker')} />
        <NavLink to="/history" label={t('history')} />
        <NavLink to="/report" label={t('report')} />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center bg-bg-input border border-border rounded-full p-0.5 text-xs font-semibold">
          <button
            onClick={() => setLang('en')}
            className={`px-2.5 py-1 rounded-full transition-colors ${
              lang === 'en' ? 'bg-brand text-black' : 'text-text-secondary'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLang('bn')}
            className={`px-2.5 py-1 rounded-full transition-colors bn ${
              lang === 'bn' ? 'bg-brand text-black' : 'text-text-secondary'
            }`}
          >
            বাং
          </button>
        </div>

        {user ? (
          <button
            onClick={signOut}
            className="text-sm font-medium border border-border-strong rounded-lg px-3 py-1.5 hover:bg-bg-input transition-colors"
          >
            {t('signOut')}
          </button>
        ) : (
          <Link
            to="/login"
            className="text-sm font-medium border border-border-strong rounded-lg px-3 py-1.5 hover:bg-bg-input transition-colors"
          >
            {t('signIn')}
          </Link>
        )}
      </div>
    </nav>
  )
}
