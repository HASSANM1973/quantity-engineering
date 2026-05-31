import { useCallback, useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { projectApi, siteApi, floorApi } from '../api/client'
import type { Project, Site, Floor } from '../types'
import ElementList from '../components/Elements/ElementList'
import InfrastructureSection from '../components/Infrastructure/InfrastructureSection'
import CostSummary from '../components/CostSummary'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Toast from '../components/ui/Toast'
import Spinner from '../components/ui/Spinner'
import { useTranslation } from '../i18n'

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const [project, setProject] = useState<Project | null>(null)
  const [activeSite, setActiveSite] = useState<Site | null>(null)
  const [activeFloor, setActiveFloor] = useState<Floor | null>(null)
  const [showSiteForm, setShowSiteForm] = useState(false)
  const [showFloorForm, setShowFloorForm] = useState(false)
  const [siteName, setSiteName] = useState('')
  const [siteArea, setSiteArea] = useState('')
  const [floorName, setFloorName] = useState('')
  const [floorNumber, setFloorNumber] = useState('')
  const [floorArea, setFloorArea] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'site'; item: Site } | { type: 'floor'; item: Floor } | null>(null)
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' })

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ visible: true, message, type })
  }, [])

  const loadProject = useCallback(async () => {
    if (!id) return
    try {
      const res = await projectApi.get(Number(id))
      setProject(res.data)
    } catch {
      showToast(t('detail.loadFailed'), 'error')
    }
  }, [id, showToast])

  useEffect(() => { loadProject() }, [loadProject])

  const typeLabel = () => {
    if (!project) return ''
    if (project.project_type === 'residential') return t('dashboard.typeResidential')
    if (project.project_type === 'commercial') return t('dashboard.typeCommercial')
    return t('dashboard.typeInfrastructure')
  }

  const addSite = async () => {
    if (!project || !siteName.trim()) { showToast(t('detail.siteRequired'), 'error'); return }
    setSaving(true)
    try {
      const res = await siteApi.create({ project: project.id, name: siteName.trim(), site_area: Number(siteArea) || 0 })
      setProject({ ...project, sites: [...project.sites, res.data] })
      setSiteName(''); setSiteArea(''); setShowSiteForm(false)
      showToast(t('detail.siteAdded'), 'success')
    } catch {
      showToast(t('detail.siteAddFailed'), 'error')
    } finally { setSaving(false) }
  }

  const addFloor = async () => {
    if (!activeSite || !floorName.trim()) { showToast(t('detail.floorRequired'), 'error'); return }
    setSaving(true)
    try {
      await floorApi.create({
        site: activeSite.id,
        name: floorName.trim(),
        floor_number: Number(floorNumber) || 0,
        floor_area: Number(floorArea) || 0,
      })
      await loadProject()
      setFloorName(''); setFloorNumber(''); setFloorArea(''); setShowFloorForm(false)
      showToast(t('detail.floorAdded'), 'success')
    } catch {
      showToast(t('detail.floorAddFailed'), 'error')
    } finally { setSaving(false) }
  }

  const confirmDeleteSite = async () => {
    if (!deleteTarget || deleteTarget.type !== 'site') return
    try {
      await siteApi.delete(deleteTarget.item.id)
      await loadProject()
      if (activeSite?.id === deleteTarget.item.id) { setActiveSite(null); setActiveFloor(null) }
      showToast(t('detail.siteDeleted'), 'success')
    } catch {
      showToast(t('detail.siteDeleteFailed'), 'error')
    } finally { setDeleteTarget(null) }
  }

  const confirmDeleteFloor = async () => {
    if (!deleteTarget || deleteTarget.type !== 'floor') return
    try {
      await floorApi.delete(deleteTarget.item.id)
      await loadProject()
      if (activeFloor?.id === deleteTarget.item.id) setActiveFloor(null)
      showToast(t('detail.floorDeleted'), 'success')
    } catch {
      showToast(t('detail.floorDeleteFailed'), 'error')
    } finally { setDeleteTarget(null) }
  }

  if (!project) return <Spinner text={t('detail.loading')} />

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
        title={deleteTarget?.type === 'site' ? t('detail.deleteSiteTitle') : t('detail.deleteFloorTitle')}
        message={t('detail.deleteConfirmMsg', { name: deleteTarget?.item.name ?? '' })}
        confirmLabel={t('common.delete')}
        variant="danger"
        onConfirm={deleteTarget?.type === 'site' ? confirmDeleteSite : confirmDeleteFloor}
        onCancel={() => setDeleteTarget(null)}
      />

      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4 flex-wrap">
        <Link to="/" className="hover:text-blue-600 transition">{t('detail.breadcrumb')}</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">{project.name}</span>
      </nav>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{project.name}</h2>
            <p className="text-gray-500 text-sm mb-1">{project.description || t('detail.noDescription')}</p>
            <p className="text-gray-400 text-xs flex items-center gap-1">
              {project.location && <><span>📍</span> {project.location} — </>}
              {typeLabel()}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="relative group">
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-sm font-medium shadow-sm">
                {t('detail.reports')}
              </button>
              <div className="absolute left-0 top-full mt-1.5 bg-white border rounded-xl shadow-xl z-10 hidden group-hover:block min-w-48 animate-scale-in">
                {[
                  ['qty-takeoff', '📄', t('detail.reportQty')],
                  ['bending', '📄', t('detail.reportBending')],
                  ['schedule', '📄', t('detail.reportSchedule')],
                  ['boq', '📊', t('detail.reportBoq')],
                  ['boq-prices-excel', '💰', t('detail.reportBoqPrices')],
                  ['boq-prices-pdf', '💰', t('detail.reportBoqPricesPdf')],
                ].map(([path, icon, label]) => (
                  <a
                    key={path}
                    href={`/api/reports/${path}/${project.id}/`}
                    target="_blank"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition first:rounded-t-xl last:rounded-b-xl"
                    rel="noreferrer"
                  >
                    <span>{icon}</span> {label}
                  </a>
                ))}
              </div>
            </div>
            <Link
              to={`/projects/${project.id}/schedule`}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium shadow-sm"
            >
              {t('detail.scheduleLink')}
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sites + Floors Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-800">{t('detail.sitesTitle')}</h3>
              <button onClick={() => setShowSiteForm(true)} className="text-blue-600 text-sm font-medium hover:text-blue-800 transition">{t('detail.addSite')}</button>
            </div>

            {showSiteForm && (
              <div className="space-y-2 mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200 animate-slide-up">
                <input
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder={t('detail.siteName')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => { if (e.key === 'Enter') addSite(); if (e.key === 'Escape') setShowSiteForm(false) }}
                />
                <input
                  value={siteArea}
                  onChange={(e) => setSiteArea(e.target.value)}
                  placeholder={t('detail.siteArea')}
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2">
                  <button onClick={addSite} disabled={saving} className="bg-blue-600 text-white px-4 py-1.5 text-sm rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-1.5">
                    {saving && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    {t('common.save')}
                  </button>
                  <button onClick={() => { setShowSiteForm(false); setSiteName(''); setSiteArea('') }} className="text-gray-500 text-sm hover:text-gray-700 transition px-2">{t('common.cancel')}</button>
                </div>
              </div>
            )}

            {project.sites.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">{t('detail.noSites')}</p>
            ) : (
              <ul className="space-y-1">
                {project.sites.map((site) => (
                  <li key={site.id}>
                    <div
                      className={`flex justify-between items-center px-3 py-2 rounded-lg cursor-pointer text-sm transition ${
                        activeSite?.id === site.id ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'
                      }`}
                      onClick={() => { setActiveSite(site); setActiveFloor(null) }}
                    >
                      <span className="font-medium">{site.name}</span>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: 'site', item: site }) }} className="text-red-300 text-xs hover:text-red-500 transition px-1">✕</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {activeSite && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 animate-slide-up">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-800">{activeSite.name} — {t('detail.floorsTitle')}</h3>
                <button onClick={() => setShowFloorForm(true)} className="text-blue-600 text-sm font-medium hover:text-blue-800 transition">{t('detail.addFloor')}</button>
              </div>

              {showFloorForm && (
                <div className="space-y-2 mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200 animate-slide-up">
                  <input
                    value={floorName}
                    onChange={(e) => setFloorName(e.target.value)}
                    placeholder={t('detail.floorName')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={(e) => { if (e.key === 'Enter') addFloor(); if (e.key === 'Escape') setShowFloorForm(false) }}
                  />
                  <input
                    value={floorNumber}
                    onChange={(e) => setFloorNumber(e.target.value)}
                    placeholder={t('detail.floorNumber')}
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    value={floorArea}
                    onChange={(e) => setFloorArea(e.target.value)}
                    placeholder={t('detail.floorArea')}
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-2">
                    <button onClick={addFloor} disabled={saving} className="bg-blue-600 text-white px-4 py-1.5 text-sm rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-1.5">
                      {saving && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                      {t('common.save')}
                    </button>
                    <button onClick={() => { setShowFloorForm(false); setFloorName(''); setFloorNumber(''); setFloorArea('') }} className="text-gray-500 text-sm hover:text-gray-700 transition px-2">{t('common.cancel')}</button>
                  </div>
                </div>
              )}

              {(!activeSite.floors || activeSite.floors.length === 0) ? (
                <p className="text-gray-400 text-sm text-center py-4">{t('detail.noFloors')}</p>
              ) : (
                <ul className="space-y-1">
                  {[...activeSite.floors].sort((a, b) => a.floor_number - b.floor_number).map((floor) => (
                    <li key={floor.id}>
                      <div
                        className={`flex justify-between items-center px-3 py-2 rounded-lg cursor-pointer text-sm transition ${
                          activeFloor?.id === floor.id ? 'bg-green-50 text-green-800 border border-green-200' : 'hover:bg-gray-50 border border-transparent'
                        }`}
                        onClick={() => setActiveFloor(floor)}
                      >
                        <span className="font-medium">{floor.name}</span>
                        <button onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: 'floor', item: floor }) }} className="text-red-300 text-xs hover:text-red-500 transition px-1">✕</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Infrastructure section */}
          <InfrastructureSection projectId={project.id} />
        </div>

        {/* Elements + Cost Panel */}
        <div className="lg:col-span-2">
          {activeFloor ? (
            <ElementList floorId={activeFloor.id} floorName={activeFloor.name} />
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="text-5xl mb-4 text-gray-300">🏗️</div>
              <p className="text-gray-400">{t('detail.selectHint')}</p>
            </div>
          )}
          <div className="mt-6">
            <CostSummary projectId={project.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
