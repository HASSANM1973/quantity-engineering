import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { projectApi } from '../api/client'
import type { Project } from '../types'
import Spinner from '../components/ui/Spinner'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Toast from '../components/ui/Toast'
import HeroSection from '../components/HeroSection'
import { useTranslation } from '../i18n'

type FilterType = '__all__' | 'residential' | 'commercial' | 'infrastructure'
const FILTER_VALUES: FilterType[] = ['__all__', 'residential', 'commercial', 'infrastructure']

export default function Dashboard() {
  const { t } = useTranslation()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('__all__')
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' })

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ visible: true, message, type })
  }

  useEffect(() => {
    projectApi.list().then((res) => {
      setProjects(res.data)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
      showToast(t('dashboard.loadFailed'), 'error')
    })
  }, [])

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter = filterType === '__all__' || p.project_type === filterType
      return matchesSearch && matchesFilter
    })
  }, [projects, searchQuery, filterType])

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await projectApi.delete(deleteTarget.id)
      setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id))
      showToast(t('dashboard.deleted'), 'success')
    } catch {
      showToast(t('dashboard.deleteFailed'), 'error')
    } finally {
      setDeleteTarget(null)
    }
  }

  const typeLabel = (project: Project) => {
    if (project.project_type === 'residential') return t('dashboard.typeResidential')
    if (project.project_type === 'commercial') return t('dashboard.typeCommercial')
    return t('dashboard.typeInfrastructure')
  }

  const filterLabel = (f: FilterType) => {
    if (f === '__all__') return t('dashboard.filterAll')
    return typeLabel({ project_type: f } as Project)
  }

  if (loading) return <Spinner text={t('dashboard.loading')} />

  return (
    <div>
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />
      <ConfirmDialog
        open={deleteTarget !== null}
        title={t('dashboard.deleteConfirmTitle')}
        message={t('dashboard.deleteConfirmMsg', { name: deleteTarget?.name ?? '' })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Hero */}
      <HeroSection projectCount={projects.length} />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: '📋', value: projects.length, label: t('stats.projects'), color: 'from-blue-500 to-blue-600' },
          { icon: '💰', value: '1.2B+', label: t('stats.value'), color: 'from-green-500 to-green-600' },
          { icon: '📍', value: '15+', label: t('stats.cities'), color: 'from-purple-500 to-purple-600' },
          { icon: '🏆', value: '10+', label: t('stats.experience'), color: 'from-orange-500 to-orange-600' },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center animate-slide-up hover:shadow-md transition"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} text-white text-xl mb-3 shadow-sm`}>
              {stat.icon}
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-8">
        <h3 className="text-xl font-bold text-gray-900 text-center mb-8">{t('how.title')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '01', icon: '📝', title: t('how.step1.title'), desc: t('how.step1.desc') },
            { step: '02', icon: '🏗️', title: t('how.step2.title'), desc: t('how.step2.desc') },
            { step: '03', icon: '📊', title: t('how.step3.title'), desc: t('how.step3.desc') },
          ].map((step, i) => (
            <div key={i} className="text-center animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 text-sm font-bold border-2 border-blue-100">
                {step.step}
              </div>
              <div className="text-2xl mb-2">{step.icon}</div>
              <h4 className="font-semibold text-gray-800 mb-1.5">{step.title}</h4>
              <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            to="/projects/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition text-sm font-medium shadow-sm"
          >
            {t('how.viewDocs')} →
          </Link>
        </div>
      </div>

      {/* Success Story */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 p-6 sm:p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-yellow-200 flex items-center justify-center text-2xl shrink-0">
            ⭐
          </div>
          <div className="flex-1 text-center md:text-right">
            <h3 className="font-bold text-gray-900 mb-1">{t('success.title')}</h3>
            <p className="text-gray-600 text-sm italic leading-relaxed mb-2">
              "{t('success.quote')}"
            </p>
            <p className="text-xs text-gray-500">
              — {t('success.company')}، {t('success.role')}
            </p>
          </div>
        </div>
      </div>

      {/* About + Location + Contact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="text-2xl mb-3">ℹ️</div>
          <h4 className="font-semibold text-gray-800 mb-2 text-sm">{t('about.title')}</h4>
          <p className="text-xs text-gray-500 leading-relaxed">{t('about.desc')}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="text-2xl mb-3">📍</div>
          <h4 className="font-semibold text-gray-800 mb-2 text-sm">{t('location.title')}</h4>
          <p className="text-xs text-gray-500 leading-relaxed">{t('location.desc')}</p>
          <p className="text-xs text-gray-400 mt-1">{t('location.detail')}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="text-2xl mb-3">📧</div>
          <h4 className="font-semibold text-gray-800 mb-2 text-sm">{t('contact.title')}</h4>
          <p className="text-xs text-gray-500">{t('contact.email')}</p>
          <p className="text-xs text-gray-500 mt-1">{t('contact.phone')}</p>
        </div>
      </div>

      {/* Projects Section */}
      <div id="projects">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{t('dashboard.title')}</h2>
          <Link
            to="/projects/new"
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition shadow-sm hover:shadow-md text-sm font-medium inline-flex items-center gap-1.5 shrink-0"
          >
            {t('dashboard.newProject')}
          </Link>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 right-3 flex items-center text-gray-400 text-sm">🔍</span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('dashboard.searchPlaceholder')}
              className="w-full border border-gray-300 rounded-xl px-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 bg-white shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 left-3 flex items-center text-gray-400 hover:text-gray-600 text-sm"
              >
                ✕
              </button>
            )}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {FILTER_VALUES.map((f) => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  filterType === f
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filterLabel(f)}
              </button>
            ))}
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center animate-scale-in">
            <div className="text-5xl mb-4 text-gray-300">📋</div>
            <p className="text-gray-500 text-lg mb-2">{t('dashboard.empty')}</p>
            <p className="text-gray-400 text-sm mb-4">{t('dashboard.emptyHint')}</p>
            <Link to="/projects/new" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition inline-block text-sm font-medium">
              {t('dashboard.createFirst')}
            </Link>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center animate-scale-in">
            <div className="text-5xl mb-4 text-gray-300">🔍</div>
            <p className="text-gray-500 text-lg mb-2">{t('dashboard.noResults')}</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project, i) => (
              <div
                key={project.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-5 animate-slide-up border border-gray-100"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 leading-tight">{project.name}</h3>
                  <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium border border-blue-100">
                    {typeLabel(project)}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mb-1 line-clamp-2">{project.description || t('dashboard.noDescription')}</p>
                {project.location && (
                  <p className="text-gray-400 text-xs mb-4 flex items-center gap-1">
                    <span>📍</span> {project.location}
                  </p>
                )}
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <Link
                    to={`/projects/${project.id}`}
                    className="text-blue-600 text-sm font-medium hover:text-blue-800 transition flex items-center gap-1"
                  >
                    {t('dashboard.openProject')}
                  </Link>
                  <button
                    onClick={() => setDeleteTarget(project)}
                    className="text-red-400 text-xs hover:text-red-600 transition px-2 py-1 rounded hover:bg-red-50"
                  >
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
