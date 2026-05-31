import { useEffect, useState } from 'react'
import { costingApi } from '../api/client'
import type { MaterialPrice } from '../types'
import Spinner from '../components/ui/Spinner'
import Toast from '../components/ui/Toast'
import { useTranslation } from '../i18n'
import { useCurrency } from '../context/CurrencyContext'

const ALL_KEY = '__all__'
const CATEGORY_VALUES = [
  ALL_KEY,
  'Concrete & Reinforcement',
  'Steel (AISC)',
  'Masonry',
  'Finishing',
  'Painting',
  'Waterproofing',
  'Insulation',
  'Earthwork',
  'Materials',
]

export default function PricesPage() {
  const { t } = useTranslation()
  const { currency, formatPrice } = useCurrency()
  const [prices, setPrices] = useState<MaterialPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState(ALL_KEY)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [editError, setEditError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' })
  const [showAdd, setShowAdd] = useState(false)
  const [newPrice, setNewPrice] = useState({ material_type: '', unit: '', unit_price: '', category: '' })
  const [addError, setAddError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await costingApi.prices()
      setPrices(res.data)
    } catch (e: any) {
      setError(e?.message || t('prices.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = filter === ALL_KEY ? prices : prices.filter((p) => p.category === filter)
  const grouped = filtered.reduce<Record<string, MaterialPrice[]>>((acc, p) => {
    const cat = p.category || t('prices.defaultCategory')
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(p)
    return acc
  }, {})

  const validatePrice = (val: string): string | null => {
    const n = Number(val)
    if (val === '' || isNaN(n)) return t('prices.priceRequired')
    if (n < 0) return t('prices.priceNegative')
    if (n > 999999999) return t('prices.priceTooLarge')
    return null
  }

  const startEdit = (p: MaterialPrice) => {
    setEditingId(p.id)
    setEditValue(String(p.unit_price))
    setEditError(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditValue('')
    setEditError(null)
  }

  const saveEdit = async (id: number) => {
    const err = validatePrice(editValue)
    if (err) { setEditError(err); return }
    setSaving(true)
    try {
      await costingApi.updatePrice(id, { unit_price: Number(editValue) })
      setPrices((prev) => prev.map((p) => (p.id === id ? { ...p, unit_price: Number(editValue) } : p)))
      setEditingId(null)
      setToast({ visible: true, message: t('prices.saved'), type: 'success' })
    } catch (e: any) {
      setToast({ visible: true, message: e?.message || t('prices.saveFailed'), type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleAdd = async () => {
    const { material_type, unit, unit_price, category } = newPrice
    if (!material_type.trim()) { setAddError(t('prices.materialRequired')); return }
    if (!unit.trim()) { setAddError(t('prices.unitRequired')); return }
    const err = validatePrice(unit_price)
    if (err) { setAddError(err); return }
    setSaving(true)
    setAddError(null)
    try {
      const res = await costingApi.createPrice({ material_type: material_type.trim(), unit: unit.trim(), unit_price: Number(unit_price), category: category.trim() })
      setPrices((prev) => [...prev, res.data])
      setShowAdd(false)
      setNewPrice({ material_type: '', unit: '', unit_price: '', category: '' })
      setToast({ visible: true, message: t('prices.added'), type: 'success' })
    } catch (e: any) {
      setAddError(e?.response?.data?.error?.[0] || e?.response?.data?.error || e?.message || t('prices.addFailed'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Spinner text={t('prices.loading')} />

  return (
    <div>
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />

      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <span className="text-gray-800 font-medium">{t('prices.breadcrumb')}</span>
      </nav>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <h2 className="text-xl font-bold text-gray-800">{t('prices.title')}</h2>
          <div className="flex gap-2">
            <button onClick={() => setShowAdd(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center gap-1.5">
              <span>+</span> {t('prices.addMaterial')}
            </button>
            <button onClick={load} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition text-sm font-medium flex items-center gap-1.5">
              <span>⟳</span> {t('prices.refresh')}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-sm text-red-700 flex items-center gap-2">
            <span>✕</span> {error}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORY_VALUES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                filter === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat === ALL_KEY ? t('prices.filterAll') : cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>{t('prices.empty')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-blue-900 text-white">
                  <th className="px-4 py-3 text-right font-medium">{t('prices.colMaterial')}</th>
                  <th className="px-4 py-3 text-right font-medium">{t('prices.colUnit')}</th>
                  <th className="px-4 py-3 text-right font-medium">{t('prices.colCategory')}</th>
                  <th className="px-4 py-3 text-center font-medium">{t('prices.colPrice', { currency })}</th>
                  <th className="px-4 py-3 text-center font-medium">{t('prices.colAction')}</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(grouped).map(([cat, items]) => (
                  <>
                    <tr key={cat} className="bg-gray-50">
                      <td colSpan={5} className="px-4 py-2 font-semibold text-gray-700 text-sm border-b border-gray-200">
                        {cat}
                      </td>
                    </tr>
                    {items.map((p, i) => (
                      <tr key={p.id} className={`hover:bg-blue-50 transition ${i < items.length - 1 ? 'border-b border-gray-100' : ''}`}>
                        <td className="px-4 py-3 font-medium text-gray-800">{p.material_type}</td>
                        <td className="px-4 py-3 text-gray-500">{p.unit}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{p.category}</td>
                        <td className="px-4 py-3 text-center font-mono">
                          {editingId === p.id ? (
                            <div className="flex flex-col items-center">
                              <input
                                type="number"
                                value={editValue}
                                onChange={(e) => { setEditValue(e.target.value); setEditError(validatePrice(e.target.value)) }}
                                className={`w-28 border rounded-lg px-3 py-1.5 text-center text-sm focus:outline-none focus:ring-2 ${
                                  editError ? 'border-red-300 focus:ring-red-400 bg-red-50' : 'border-gray-300 focus:ring-blue-500'
                                }`}
                                autoFocus
                                onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(p.id); if (e.key === 'Escape') cancelEdit() }}
                              />
                              {editError && <span className="text-red-500 text-[10px] mt-0.5">{editError}</span>}
                            </div>
                          ) : (
                            formatPrice(p.unit_price)
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {editingId === p.id ? (
                            <div className="flex justify-center gap-1">
                              <button
                                onClick={() => saveEdit(p.id)}
                                disabled={saving || !!editError}
                                className="bg-green-600 text-white px-3 py-1.5 text-xs rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-1"
                              >
                                {saving && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                {t('common.save')}
                              </button>
                              <button onClick={cancelEdit} className="text-gray-400 text-xs px-2 py-1 hover:text-gray-600 transition">{t('common.cancel')}</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEdit(p)}
                              className="text-blue-600 text-xs font-medium hover:text-blue-800 transition"
                            >
                              {t('common.edit')}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{t('prices.addTitle')}</h3>

            {addError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">{addError}</div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('prices.colMaterial')} *</label>
                <input value={newPrice.material_type} onChange={(e) => setNewPrice({ ...newPrice, material_type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('prices.colUnit')} *</label>
                <input value={newPrice.unit} onChange={(e) => setNewPrice({ ...newPrice, unit: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="m3, kg, m2..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('prices.colPrice', { currency })} *</label>
                <input type="number" value={newPrice.unit_price} onChange={(e) => setNewPrice({ ...newPrice, unit_price: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('prices.colCategory')}</label>
                <select value={newPrice.category} onChange={(e) => setNewPrice({ ...newPrice, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">{t('common.none')}</option>
                  {CATEGORY_VALUES.filter((c) => c !== ALL_KEY).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => { setShowAdd(false); setAddError(null) }}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition text-sm font-medium">
                {t('common.cancel')}
              </button>
              <button onClick={handleAdd} disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-sm font-medium flex items-center gap-2">
                {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {t('common.add')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
