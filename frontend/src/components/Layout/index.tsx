import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useTranslation } from '../../i18n'
import { useCurrency, CURRENCY_OPTIONS } from '../../context/CurrencyContext'
import type { CurrencyCode } from '../../context/CurrencyContext'
import { useAuth } from '../../context/AuthContext'
import Footer from '../Footer'

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const { t, locale, setLocale } = useTranslation()
  const { currency, setCurrency } = useCurrency()
  const { user, logout } = useAuth()

  const links = [
    { to: '/', label: t('nav.projects'), icon: '📋' },
    { to: '/projects/new', label: t('nav.newProject'), icon: '➕' },
    { to: '/prices', label: t('nav.prices'), icon: '💰' },
  ]

  const toggleLang = () => {
    setLocale(locale === 'ar' ? 'en' : 'ar')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gradient-to-l from-blue-900 to-blue-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">{t('brand.name')}</h1>
              <span className="hidden sm:inline text-xs text-blue-300 font-medium">{t('brand.tagline')}</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Desktop nav */}
              <nav className="hidden sm:flex gap-1">
                {links.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-3 py-2 rounded-lg transition text-sm ${
                      location.pathname === link.to
                        ? 'bg-blue-700 text-white shadow-sm'
                        : 'text-blue-200 hover:bg-blue-700/60 hover:text-white'
                    }`}
                  >
                    {link.icon} {link.label}
                  </Link>
                ))}
              </nav>
              {/* Currency selector */}
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="bg-blue-700 text-white text-xs rounded-lg px-2 py-1.5 border border-blue-600 focus:outline-none cursor-pointer"
                aria-label={t('nav.currency')}
              >
                {CURRENCY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {user && <span className="hidden sm:inline text-blue-200 text-xs mr-2">{user.name || user.email}</span>}
              {/* Language toggle */}
              <button
                onClick={toggleLang}
                className="bg-blue-700 hover:bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg transition font-medium border border-blue-600"
              >
                {t('nav.language')}
              </button>
              {user && (
                <button onClick={() => { logout(); navigate('/login') }}
                  className="bg-blue-700 hover:bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg transition font-medium border border-blue-600">
                  {t('nav.logout')}
                </button>
              )}
              {/* Mobile hamburger */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="sm:hidden p-2 rounded-lg hover:bg-blue-700/60 transition"
                aria-label={t('nav.projects')}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {menuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
          {/* Mobile menu */}
          {menuOpen && (
            <nav className="sm:hidden mt-3 pb-2 flex flex-col gap-1 animate-slide-up">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-lg transition text-sm ${
                    location.pathname === link.to
                      ? 'bg-blue-700 text-white'
                      : 'text-blue-200 hover:bg-blue-700/60 hover:text-white'
                  }`}
                >
                  {link.icon} {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto w-full p-3 sm:p-4">{children}</main>
      <Footer />
    </div>
  )
}
