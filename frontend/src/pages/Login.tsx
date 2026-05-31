import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../i18n'

export default function Login() {
  const { t, locale, setLocale } = useTranslation()
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [langOpen, setLangOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) { setError(t('login.required')); return }
    setLoading(true)
    setError('')
    try {
      if (isRegister) {
        await register(email.trim(), password, name.trim())
      } else {
        await login(email.trim(), password)
      }
      navigate('/')
    } catch (err: any) {
      setError(err?.response?.data?.error || t('login.failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Top bar with language selector */}
      <div className="flex justify-end items-center gap-3 px-6 py-4">
        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:border-gray-300 transition shadow-sm"
          >
            <span>{locale === 'ar' ? '🇸🇦' : '🇺🇸'}</span>
            <span>{locale === 'ar' ? 'العربية' : 'English'}</span>
            <svg className={`w-3.5 h-3.5 transition ${langOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {langOpen && (
            <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button
                onClick={() => { setLocale('en'); setLangOpen(false) }}
                className={`flex items-center gap-2 px-4 py-2 text-sm w-full text-left hover:bg-blue-50 transition ${locale === 'en' ? 'text-blue-600 font-medium' : 'text-gray-600'}`}
              >
                <span>🇺🇸</span> English
              </button>
              <button
                onClick={() => { setLocale('ar'); setLangOpen(false) }}
                className={`flex items-center gap-2 px-4 py-2 text-sm w-full text-left hover:bg-blue-50 transition ${locale === 'ar' ? 'text-blue-600 font-medium' : 'text-gray-600'}`}
              >
                <span>🇸🇦</span> العربية
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hero section */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg mb-4">
              <span className="text-white text-2xl font-bold">Q</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{t('brand.name')}</h1>
            <p className="text-gray-500 mt-1 text-sm">{t('brand.tagline')}</p>
          </div>

          {/* Login / Register card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-1">
              {isRegister ? t('login.registerTitle') : t('login.title')}
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              {isRegister ? '' : t('login.welcome')}
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700 flex items-center gap-2">
                <span>✕</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('login.nameLabel')}</label>
                  <input value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
                    placeholder={t('login.namePlaceholder')} />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('login.emailLabel')}</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
                  placeholder={t('login.emailPlaceholder')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('login.passwordLabel')}</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
                  placeholder={t('login.passwordPlaceholder')} />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2 shadow-sm">
                {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {isRegister ? t('login.registerBtn') : t('login.loginBtn')}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                {isRegister ? t('login.haveAccount') : t('login.noAccount')}{' '}
                <button onClick={() => { setIsRegister(!isRegister); setError('') }}
                  className="text-blue-600 hover:text-blue-800 font-medium transition">
                  {isRegister ? t('login.loginLink') : t('login.registerLink')}
                </button>
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-6">
            {t('footer.rights')}
          </p>
        </div>
      </div>
    </div>
  )
}
