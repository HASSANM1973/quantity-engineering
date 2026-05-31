import { useEffect, useState } from 'react'
import { elementApi } from '../../api/client'
import type { Element, CalcResult, ElementType } from '../../types'
import { ELEMENT_TYPES, ELEMENT_DIMENSIONS, AISC_SHAPES, STRING_DIMENSIONS } from '../../types'
import QuantityDisplay from '../Quantities/QuantityDisplay'
import SimpleGantt from '../Gantt/SimpleGantt'
import BendingSchedule from '../Quantities/BendingSchedule'
import ConfirmDialog from '../ui/ConfirmDialog'
import Toast from '../ui/Toast'
import Spinner from '../ui/Spinner'
import { useTranslation } from '../../i18n'

interface Props {
  floorId: number
  floorName: string
}

const isSteelType = (t: ElementType) => t === 'steel_beam' || t === 'steel_column' || t === 'steel_connection'

export default function ElementList({ floorId, floorName }: Props) {
  const { t } = useTranslation()
  const [elements, setElements] = useState<Element[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedType, setSelectedType] = useState<ElementType>('foundation')
  const [elementName, setElementName] = useState('')
  const [count, setCount] = useState('1')
  const [dimensions, setDimensions] = useState<Record<string, number>>({})
  const [shapeName, setShapeName] = useState('W12x26')
  const [calcResult, setCalcResult] = useState<CalcResult | null>(null)
  const [activeElement, setActiveElement] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Element | null>(null)
  const [saving, setSaving] = useState(false)
  const [countError, setCountError] = useState<string | null>(null)
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' })

  const refresh = () => {
    setLoading(true)
    elementApi.list().then((res) => {
      setElements(res.data.filter((e) => e.floor === floorId))
      setLoading(false)
    })
  }

  useEffect(() => { refresh() }, [floorId])

  const typeDims = ELEMENT_DIMENSIONS[selectedType]
  useEffect(() => {
    const defaults: Record<string, number> = {}
    typeDims.forEach((d) => { defaults[d.key] = d.default })
    setDimensions(defaults)
    setCalcResult(null)
    setCountError(null)
  }, [selectedType])

  const validateCount = (val: string): string | null => {
    const n = Number(val)
    if (val === '' || isNaN(n) || n < 1) return t('element.countMin')
    if (n > 10000) return t('element.countTooLarge')
    if (!Number.isInteger(n)) return t('element.countInteger')
    return null
  }

  const handleCalculate = async () => {
    const err = validateCount(count)
    if (err) { setCountError(err); return }
    setCountError(null)
    const payload = { ...dimensions }
    if (isSteelType(selectedType)) {
      payload['shape_name'] = shapeName as any
    }
    try {
      const res = await elementApi.calculate({
        element_type: selectedType,
        dimensions: payload,
        count: Number(count) || 1,
      })
      setCalcResult(res.data)
    } catch {
      setToast({ visible: true, message: t('element.calcFailed'), type: 'error' })
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = { ...dimensions }
      if (isSteelType(selectedType)) {
        payload['shape_name'] = shapeName as any
      }
      const res = await elementApi.create({
        floor: floorId,
        element_type: selectedType,
        name: elementName || ELEMENT_TYPES.find((et) => et.value === selectedType)?.label || '',
        count: Number(count) || 1,
        dimensions: payload,
        concrete_grade: 'C30',
      })
      await elementApi.saveQuantities(res.data.id)
      setShowForm(false)
      setCalcResult(null)
      setElementName('')
      setCount('1')
      setToast({ visible: true, message: t('element.saved'), type: 'success' })
      refresh()
    } catch {
      setToast({ visible: true, message: t('element.saveFailed'), type: 'error' })
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await elementApi.delete(deleteTarget.id)
      refresh()
      setToast({ visible: true, message: t('element.deleted'), type: 'success' })
    } catch {
      setToast({ visible: true, message: t('element.deleteFailed'), type: 'error' })
    } finally { setDeleteTarget(null) }
  }

  const buildQuantityResult = (el: Element): CalcResult => {
    const result: CalcResult = {}
    const types = ['concrete', 'rebar', 'formwork', 'steel_beam', 'steel_column', 'bolts', 'plate', 'weld']
    types.forEach((mat) => {
      const q = el.quantities?.find((q) => q.material_type === mat)
      if (q) (result as any)[mat] = { value: q.value, unit: q.unit, spec_reference: q.spec_reference }
    })
    return result
  }

  if (loading) return <Spinner text={t('element.loading')} />

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
        title={t('element.deleteTitle')}
        message={t('element.deleteConfirmMsg', { name: deleteTarget?.name ?? '' })}
        confirmLabel={t('common.delete')}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{floorName} — {t('element.title')}</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition shadow-sm"
        >
          {showForm ? t('common.cancel') : t('element.add')}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6 animate-slide-up">
          <h4 className="font-semibold text-gray-700 mb-4">{t('element.formTitle')}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1.5 font-medium">{t('element.typeLabel')}</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as ElementType)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ELEMENT_TYPES.map((et) => (
                  <option key={et.value} value={et.value}>{et.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1.5 font-medium">{t('element.nameLabel')}</label>
              <input value={elementName} onChange={(e) => setElementName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder={t('element.namePlaceholder')} />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1.5 font-medium">
                {t('element.countLabel')} <span className="text-red-500">*</span>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {typeDims.map((dim) => {
              const stringOpts = STRING_DIMENSIONS[selectedType]?.find((s) => s.key === dim.key)
              return (
                <div key={dim.key}>
                  <label className="block text-xs text-gray-600 mb-1.5 font-medium">{dim.label}</label>
                  {dim.key === 'shape_name' ? (
                    <select
                      value={shapeName}
                      onChange={(e) => setShapeName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {AISC_SHAPES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  ) : stringOpts ? (
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
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-slide-up">
              <QuantityDisplay result={calcResult} />
              {calcResult.bending_schedule && <BendingSchedule bars={calcResult.bending_schedule} />}
            </div>
          )}
        </div>
      )}

      {elements.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="text-5xl mb-4 text-gray-300">🔩</div>
          <p className="text-gray-400">{t('element.empty')}</p>
        </div>
      ) : (
        <div className="space-y-3 animate-slide-up">
          {elements.map((el) => {
            const qtyResult = buildQuantityResult(el)
            return (
              <div key={el.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition hover:shadow-md">
                <div
                  className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => setActiveElement(activeElement === el.id ? null : el.id)}
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-semibold text-gray-800">{el.name}</span>
                    <span className="text-gray-400 text-sm">({el.count} {t('element.count_unit')})</span>
                    <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{el.element_type}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {el.quantities && el.quantities.length > 0 && (
                      <span className="text-sm text-gray-500 font-mono">
                        {el.quantities.find((q) => q.material_type === 'concrete')?.value?.toFixed(2) ?? ''}
                        {el.quantities.find((q) => q.material_type === 'steel_beam')?.value?.toFixed(2) ?? ''}
                        {el.quantities.find((q) => q.material_type === 'steel_column')?.value?.toFixed(2) ?? ''}
                      </span>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(el) }} className="text-red-300 text-xs hover:text-red-500 transition px-1">✕</button>
                  </div>
                </div>

                {activeElement === el.id && (
                  <div className="border-t border-gray-100 px-4 py-4 bg-gray-50 animate-slide-up">
                    {el.quantities && el.quantities.length > 0 ? (
                      <>
                        <QuantityDisplay result={qtyResult} />
                        <SimpleGantt element={el} />
                      </>
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
            )
          })}
        </div>
      )}
    </div>
  )
}
