import { useCallback, useEffect, useState } from 'react'
import { elementApi } from '../../api/client'
import type { Element, CalcResult, ElementType } from '../../types'
import { ELEMENT_TYPES, ELEMENT_DIMENSIONS, STRING_DIMENSIONS } from '../../types'
import QuantityDisplay from '../Quantities/QuantityDisplay'
import ConfirmDialog from '../ui/ConfirmDialog'
import Toast from '../ui/Toast'
import Spinner from '../ui/Spinner'
import { useTranslation } from '../../i18n'

interface Props {
  projectId: number
}

const INFRA_TYPES = ELEMENT_TYPES.filter((t) => t.group === 'Infrastructure')

export default function InfrastructureSection({ projectId }: Props) {
  const { t } = useTranslation()
  const [elements, setElements] = useState<Element[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedType, setSelectedType] = useState<ElementType>('road_pavement')
  const [elementName, setElementName] = useState('')
  const [count, setCount] = useState('1')
  const [dimensions, setDimensions] = useState<Record<string, number>>({})
  const [calcResult, setCalcResult] = useState<CalcResult | null>(null)
  const [activeElement, setActiveElement] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Element | null>(null)
  const [saving, setSaving] = useState(false)
  const [countError, setCountError] = useState<string | null>(null)
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' })

  const refresh = useCallback(() => {
    setLoading(true)
    elementApi.byProject(projectId).then((res) => {
      setElements(res.data)
      setLoading(false)
    })
  }, [projectId])

  useEffect(() => { refresh() }, [refresh])

  const typeDims = ELEMENT_DIMENSIONS[selectedType]
  useEffect(() => {
    if (!typeDims) return
    const defaults: Record<string, number> = {}
    typeDims.forEach((d) => { defaults[d.key] = d.default })
    setDimensions(defaults)
    setCalcResult(null)
    setCountError(null)
  }, [selectedType])

  const validateCount = (val: string): string | null => {
    const n = Number(val)
    if (val === '' || isNaN(n) || n < 1) return t('infra.countMin')
    if (n > 10000) return t('infra.countTooLarge')
    if (!Number.isInteger(n)) return t('infra.countInteger')
    return null
  }

  const handleCalculate = async () => {
    const err = validateCount(count)
    if (err) { setCountError(err); return }
    setCountError(null)
    try {
      const res = await elementApi.calculate({
        element_type: selectedType,
        dimensions,
        count: Number(count) || 1,
      })
      setCalcResult(res.data)
    } catch {
      setToast({ visible: true, message: t('infra.calcFailed'), type: 'error' })
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await elementApi.create({
        project: projectId,
        element_type: selectedType,
        name: elementName || INFRA_TYPES.find((it) => it.value === selectedType)?.label || '',
        count: Number(count) || 1,
        dimensions,
      })
      await elementApi.saveQuantities(res.data.id)
      setShowForm(false)
      setCalcResult(null)
      setElementName('')
      setCount('1')
      setToast({ visible: true, message: t('infra.saved'), type: 'success' })
      refresh()
    } catch {
      setToast({ visible: true, message: t('infra.saveFailed'), type: 'error' })
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await elementApi.delete(deleteTarget.id)
      refresh()
      setToast({ visible: true, message: t('infra.deleted'), type: 'success' })
    } catch {
      setToast({ visible: true, message: t('infra.deleteFailed'), type: 'error' })
    } finally { setDeleteTarget(null) }
  }

  const getFirstQuantity = (el: Element): string => {
    if (!el.quantities || el.quantities.length === 0) return ''
    const q = el.quantities[0]
    return `${q.value?.toFixed(2)} ${q.unit}`
  }

  const buildQuantityResult = (el: Element): CalcResult => {
    const result: CalcResult = {}
    el.quantities?.forEach((q) => {
      (result as any)[q.material_type] = { value: q.value, unit: q.unit, spec_reference: q.spec_reference }
    })
    return result
  }

  if (loading) return <Spinner text={t('infra.loading')} />

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
        title={t('infra.deleteTitle')}
        message={t('infra.deleteConfirmMsg', { name: deleteTarget?.name ?? '' })}
        confirmLabel={t('common.delete')}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-800 text-lg">{t('infra.title')}</h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition shadow-sm"
          >
            {showForm ? t('common.cancel') : t('infra.add')}
          </button>
        </div>

        {showForm && (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-4 animate-slide-up">
            <h4 className="font-semibold text-gray-700 mb-3">{t('infra.formTitle')}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1.5 font-medium">{t('infra.typeLabel')}</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as ElementType)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {INFRA_TYPES.map((it) => (
                    <option key={it.value} value={it.value}>{it.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1.5 font-medium">{t('infra.nameLabel')}</label>
                <input
                  value={elementName}
                  onChange={(e) => setElementName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('infra.namePlaceholder')}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1.5 font-medium">
                  {t('infra.countLabel')} <span className="text-red-500">*</span>
                </label>
                <input
                  value={count}
                  onChange={(e) => { setCount(e.target.value); setCountError(validateCount(e.target.value)) }}
                  type="number"
                  min="1"
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${
                    countError ? 'border-red-300 focus:ring-red-400 bg-red-50' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {countError && <p className="text-red-500 text-[11px] mt-1">{countError}</p>}
              </div>
            </div>

            {typeDims && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {typeDims.map((dim) => {
                  const stringOpts = STRING_DIMENSIONS[selectedType]?.find((s) => s.key === dim.key)
                  return (
                    <div key={dim.key}>
                      <label className="block text-xs text-gray-600 mb-1.5 font-medium">{dim.label}</label>
                      {stringOpts ? (
                        <select
                          value={dimensions[dim.key] ?? stringOpts.options[0].value}
                          onChange={(e) => setDimensions({ ...dimensions, [dim.key]: e.target.value as any })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {stringOpts.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="number"
                          step="0.001"
                          value={dimensions[dim.key] ?? dim.default}
                          onChange={(e) => setDimensions({ ...dimensions, [dim.key]: Number(e.target.value) || 0 })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            <div className="flex gap-2 flex-wrap">
              <button onClick={handleCalculate} className="bg-yellow-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-yellow-700 transition shadow-sm flex items-center gap-1.5">
                {t('common.calculate')}
              </button>
              {calcResult && (
                <button onClick={handleSave} disabled={saving} className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm disabled:opacity-50 flex items-center gap-1.5">
                  {saving && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {t('common.save')}
                </button>
              )}
            </div>

            {calcResult && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 animate-slide-up">
                <QuantityDisplay result={calcResult} />
              </div>
            )}
          </div>
        )}

        {elements.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">{t('infra.empty')}</p>
            <p className="text-xs mt-1">{t('infra.emptyHint')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {elements.map((el) => (
              <div key={el.id} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <div
                  className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-100 transition"
                  onClick={() => setActiveElement(activeElement === el.id ? null : el.id)}
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-semibold text-gray-800 text-sm">{el.name}</span>
                    <span className="text-gray-400 text-xs">({el.count} {el.count > 1 ? t('infra.count_plural') : t('infra.count_singular')})</span>
                    <span className="text-[11px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-medium">{el.element_type.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 font-mono">{getFirstQuantity(el)}</span>
                    <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(el) }} className="text-red-300 text-xs hover:text-red-500 transition px-1">✕</button>
                  </div>
                </div>

                {activeElement === el.id && (
                  <div className="border-t border-gray-200 px-3 py-3 bg-white animate-slide-up">
                    {el.quantities && el.quantities.length > 0 ? (
                      <QuantityDisplay result={buildQuantityResult(el)} />
                    ) : (
                      <button
                        onClick={async () => { await elementApi.saveQuantities(el.id); refresh() }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
                      >
                        {t('common.calculate')}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
