import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { projectApi, schedulingApi } from '../api/client'
import type { Project, Activity, CPMResult } from '../types'
import Spinner from '../components/ui/Spinner'
import Toast from '../components/ui/Toast'
import { useTranslation } from '../i18n'

export default function SchedulingPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const [project, setProject] = useState<Project | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [cpm, setCpm] = useState<CPMResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' })

  const load = async () => {
    if (!id) { setError(t('schedule.idMissing')); setLoading(false); return }
    setLoading(true)
    setError(null)
    try {
      const [projRes, actRes] = await Promise.all([
        projectApi.get(Number(id)),
        schedulingApi.byProject(Number(id)),
      ])
      setProject(projRes.data)
      setActivities(actRes.data)
    } catch (e: any) {
      const msg = e?.response?.data ? JSON.stringify(e.response.data) : (e?.message || t('schedule.loadFailed'))
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const handleAutoGenerate = async () => {
    if (!id) return
    setGenerating(true)
    setError(null)
    try {
      const res = await schedulingApi.autoGenerate(Number(id))
      setActivities(res.data.activities)
      setCpm(res.data.cpm)
      const projRes = await projectApi.get(Number(id))
      setProject(projRes.data)
      setToast({ visible: true, message: t('schedule.generated', { count: res.data.generated_count }), type: 'success' })
    } catch (e: any) {
      const msg = e?.response?.data ? JSON.stringify(e.response.data) : (e?.message || t('schedule.generateFailed'))
      setError(msg)
    } finally {
      setGenerating(false)
    }
  }

  const handleCompute = async () => {
    if (!id) return
    setGenerating(true)
    setError(null)
    try {
      const res = await schedulingApi.compute(Number(id))
      setActivities(res.data.activities)
      setCpm(res.data.cpm)
      setToast({ visible: true, message: t('schedule.computed'), type: 'success' })
    } catch (e: any) {
      const msg = e?.response?.data ? JSON.stringify(e.response.data) : (e?.message || t('schedule.computeFailed'))
      setError(msg)
    } finally {
      setGenerating(false)
    }
  }

  const maxDay = Math.max(...activities.map((a) => a.early_finish), 1)
  const gridCols = Math.max(20, Math.min(100, maxDay))

  if (loading) return <Spinner text={t('schedule.loading')} />
  if (error) return (
    <div className="text-center py-8">
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 inline-block text-right max-w-md">
        <p className="text-red-700 font-bold mb-1">{t('schedule.errorTitle')}</p>
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <button onClick={load} className="bg-red-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-red-700 transition font-medium">
          {t('schedule.retry')}
        </button>
      </div>
    </div>
  )
  if (!project) return <Spinner text={t('schedule.notFound')} />

  return (
    <div>
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />

      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4 flex-wrap">
        <Link to="/" className="hover:text-blue-600 transition">{t('schedule.breadcrumb')}</Link>
        <span>/</span>
        <Link to={`/projects/${project.id}`} className="hover:text-blue-600 transition">{project.name}</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">{t('schedule.breadcrumbCurrent')}</span>
      </nav>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-800">{t('schedule.title')}</h2>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleAutoGenerate}
              disabled={generating}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {generating && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {generating ? t('schedule.generating') : t('schedule.generate')}
            </button>
            <button
              onClick={handleCompute}
              disabled={generating || activities.length === 0}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {generating && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {t('schedule.compute')}
            </button>
          </div>
        </div>

        {cpm && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
              <div className="text-2xl font-bold text-blue-700">{cpm.project_duration_days}</div>
              <div className="text-xs text-blue-600 mt-1">{t('schedule.duration')}</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
              <div className="text-2xl font-bold text-green-700">{cpm.total_activities}</div>
              <div className="text-xs text-green-600 mt-1">{t('schedule.activitiesCount')}</div>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center border border-red-100">
              <div className="text-2xl font-bold text-red-700">{cpm.critical_path_count}</div>
              <div className="text-xs text-red-600 mt-1">{t('schedule.criticalCount')}</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-100">
              <div className="text-2xl font-bold text-purple-700">{cpm.critical_path.length > 0 ? cpm.critical_path[0] : '-'}</div>
              <div className="text-xs text-purple-600 mt-1">{t('schedule.criticalStart')}</div>
            </div>
          </div>
        )}

        {cpm && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <span className="text-sm font-bold text-yellow-800">{t('schedule.criticalPath')}</span>
            <span className="text-sm text-yellow-700">{cpm.critical_path.join(' → ')}</span>
          </div>
        )}
      </div>

      {activities.length > 0 && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6 overflow-x-auto">
            <h3 className="font-semibold text-gray-800 mb-4">{t('schedule.gantt')}</h3>
            <div className="min-w-[600px]">
              <div className="flex text-[10px] text-gray-400 mb-1" style={{ gap: '0px' }}>
                <div className="w-44 shrink-0" />
                {Array.from({ length: gridCols + 1 }, (_, i) => i)
                  .filter((d) => d % 5 === 0)
                  .map((d) => (
                    <div key={d} className="text-center" style={{ width: `${100 / gridCols}%` }}>{d}</div>
                  ))}
              </div>
              {activities.map((act) => {
                const start = act.early_start
                const dur = act.duration_days
                const leftPct = (start / maxDay) * 100
                const widthPct = (dur / maxDay) * 100
                return (
                  <div key={act.id} className="flex items-center mb-1.5 text-xs">
                    <div className="w-44 shrink-0 text-gray-700 truncate flex items-center gap-1.5 px-1">
                      {act.is_critical && <span className="text-red-500 text-[8px]" title={t('schedule.colCritical')}>⬤</span>}
                      {act.name}
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${act.is_critical ? 'bg-red-400' : 'bg-blue-400'}`}
                        style={{ marginLeft: `${leftPct}%`, width: `${Math.max(widthPct, 2)}%` }}
                      />
                    </div>
                    <div className="w-24 shrink-0 text-right text-gray-500 pr-2 font-mono text-[11px]" dir="ltr">
                      {act.early_start}-{act.early_finish}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 overflow-x-auto">
            <h3 className="font-semibold text-gray-800 mb-4">{t('schedule.activityList')}</h3>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border-b border-gray-200 px-3 py-2.5 text-right font-medium text-gray-700">{t('schedule.colActivity')}</th>
                    <th className="border-b border-gray-200 px-3 py-2.5 text-right font-medium text-gray-700">{t('schedule.colType')}</th>
                    <th className="border-b border-gray-200 px-3 py-2.5 text-center font-medium text-gray-700">{t('schedule.colDuration')}</th>
                    <th className="border-b border-gray-200 px-3 py-2.5 text-center font-medium text-gray-700">{t('schedule.colES')}</th>
                    <th className="border-b border-gray-200 px-3 py-2.5 text-center font-medium text-gray-700">{t('schedule.colEF')}</th>
                    <th className="border-b border-gray-200 px-3 py-2.5 text-center font-medium text-gray-700">{t('schedule.colLS')}</th>
                    <th className="border-b border-gray-200 px-3 py-2.5 text-center font-medium text-gray-700">{t('schedule.colLF')}</th>
                    <th className="border-b border-gray-200 px-3 py-2.5 text-center font-medium text-gray-700">{t('schedule.colFloat')}</th>
                    <th className="border-b border-gray-200 px-3 py-2.5 text-center font-medium text-gray-700">{t('schedule.colCritical')}</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((act) => (
                    <tr key={act.id} className={`transition ${act.is_critical ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                      <td className="border-b border-gray-100 px-3 py-2.5 font-medium text-gray-800">{act.name}</td>
                      <td className="border-b border-gray-100 px-3 py-2.5 text-gray-500">{act.activity_type}</td>
                      <td className="border-b border-gray-100 px-3 py-2.5 text-center font-mono">{act.duration_days}</td>
                      <td className="border-b border-gray-100 px-3 py-2.5 text-center font-mono">{act.early_start}</td>
                      <td className="border-b border-gray-100 px-3 py-2.5 text-center font-mono">{act.early_finish}</td>
                      <td className="border-b border-gray-100 px-3 py-2.5 text-center font-mono">{act.late_start}</td>
                      <td className="border-b border-gray-100 px-3 py-2.5 text-center font-mono">{act.late_finish}</td>
                      <td className="border-b border-gray-100 px-3 py-2.5 text-center font-mono font-semibold">{act.total_float}</td>
                      <td className="border-b border-gray-100 px-3 py-2.5 text-center">
                        {act.is_critical ? <span className="text-red-600 font-bold text-sm">✓</span> : <span className="text-gray-300">-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activities.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="text-5xl mb-4 text-gray-300">📅</div>
          <p className="text-gray-400 mb-2">{t('schedule.empty')}</p>
          <p className="text-gray-400 text-sm mb-4">{t('schedule.emptyHint')}</p>
        </div>
      )}
    </div>
  )
}
