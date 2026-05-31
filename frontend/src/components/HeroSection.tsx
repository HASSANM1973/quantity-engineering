import { Link } from 'react-router-dom'
import { useTranslation } from '../i18n'

export default function HeroSection({ projectCount }: { projectCount: number }) {
  const { t } = useTranslation()

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white mb-8">
      {/* Blueprint grid overlay */}
      <div className="absolute inset-0 blueprint-grid opacity-10" />

      {/* Floating geometric shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute -top-10 -right-10 w-64 h-64 text-blue-400/10 animate-float-slow" viewBox="0 0 100 100" fill="currentColor">
          <polygon points="50,0 100,50 50,100 0,50" />
        </svg>
        <svg className="absolute top-1/3 -left-12 w-40 h-40 text-cyan-400/10 animate-float" viewBox="0 0 100 100" fill="currentColor">
          <circle cx="50" cy="50" r="45" />
        </svg>
        <svg className="absolute bottom-10 right-1/4 w-32 h-32 text-blue-300/10 animate-float-slow" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="50,5 95,35 95,65 50,95 5,65 5,35" />
        </svg>
        <svg className="absolute top-1/2 right-1/3 w-24 h-24 text-white/5 animate-spin-slow" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="10" y="10" width="80" height="80" rx="10" />
          <line x1="10" y1="50" x2="90" y2="50" />
          <line x1="50" y1="10" x2="50" y2="90" />
        </svg>
        {/* Construction icons */}
        <svg className="absolute top-6 left-1/4 w-12 h-12 text-yellow-400/15 animate-float" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l7 3.5v7.64l-7 3.5-7-3.5V7.68l7-3.5z"/>
          <path d="M12 12l-3-1.5v-3l3 1.5v3z"/>
        </svg>
        <svg className="absolute bottom-1/4 left-1/3 w-10 h-10 text-green-400/15 animate-float-slow" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 18c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1h-1V5c0-.55-.45-1-1-1s-1 .45-1 1v5h-2V5c0-.55-.45-1-1-1s-1 .45-1 1v5h-2V5c0-.55-.45-1-1-1s-1 .45-1 1v5H7V5c0-.55-.45-1-1-1S5 4.45 5 5v5H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h17zM6 14h2v2H6v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z"/>
        </svg>
      </div>

      <div className="relative z-10 px-6 py-16 sm:py-24 sm:px-10 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-xs font-medium text-blue-200 mb-6 border border-white/10">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          {projectCount > 0
            ? `${projectCount} ${t('stats.projects')}`
            : t('hero.subtitle')}
        </div>

        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
          {t('brand.name')}
        </h2>
        <p className="text-xl sm:text-2xl text-blue-200 font-medium mb-4">
          {t('hero.subtitle')}
        </p>
        <p className="max-w-2xl mx-auto text-blue-300/80 text-sm sm:text-base mb-8 leading-relaxed">
          {t('hero.description')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/projects/new"
            className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-8 py-3 rounded-xl font-bold text-sm transition shadow-lg hover:shadow-yellow-500/25 inline-flex items-center gap-2"
          >
            <span>+</span> {t('hero.newProject')}
          </Link>
          <a
            href="#projects"
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-xl font-medium text-sm transition border border-white/20 inline-flex items-center gap-2"
          >
            {t('hero.viewProjects')} ↓
          </a>
        </div>
      </div>
    </section>
  )
}
