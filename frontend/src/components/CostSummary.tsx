import { useState } from 'react'
import { costingApi } from '../api/client'
import type { CostEstimate } from '../types'
import Toast from './ui/Toast'
import CostChart from './CostChart'
import { useTranslation } from '../i18n'
import { useCurrency } from '../context/CurrencyContext'

interface Props {
  projectId: number
}

export default function CostSummary({ projectId }: Props) {
  const { t } = useTranslation()
  const { formatPrice } = useCurrency()
  const [estimate, setEstimate] = useState<CostEstimate | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [markup, setMarkup] = useState(15)
  const [markupError, setMarkupError] = useState<string | null>(null)
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' })

  const validateMarkup = (val: number): string | null => {
    if (isNaN(val)) return t('cost.markupInvalid')
    if (val < 0) return t('cost.markupMin')
    if (val > 100) return t('cost.markupMax')
    return null
  }

  const handleGenerate = async () => {
    const err = validateMarkup(markup)
    if (err) { setMarkupError(err); return }
    setMarkupError(null)
    setGenerating(true)
    setError(null)
    try {
      const res = await costingApi.generateEstimate(projectId, markup)
      setEstimate(res.data)
      setToast({ visible: true, message: t('cost.generated'), type: 'success' })
    } catch (e: any) {
      const msg = e?.response?.data ? JSON.stringify(e.response.data) : (e?.message || t('cost.generateFailed'))
      setError(msg)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <>
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <h3 className="font-semibold text-gray-800 text-lg">{t('cost.title')}</h3>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">{t('cost.markupLabel')}</label>
            <input
              type="number"
              value={markup}
              onChange={(e) => {
                const v = Number(e.target.value)
                setMarkup(v)
                setMarkupError(validateMarkup(v))
              }}
              className={`w-20 border rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 ${
                markupError ? 'border-red-300 focus:ring-red-400 bg-red-50' : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
          </div>
        </div>

        {markupError && <p className="text-red-500 text-xs mb-3">{markupError}</p>}

        {!estimate ? (
          <>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition text-sm font-medium w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {generating && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {generating ? t('cost.generating') : t('cost.generate')}
            </button>
            {error && <p className="text-red-600 text-xs mt-2 bg-red-50 p-2 rounded">{error}</p>}
          </>
        ) : (
          <div className="animate-slide-up">
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
                <span className="text-gray-500">{t('cost.itemsCount')}</span>
                <span className="font-semibold text-gray-800">{estimate.items.length}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
                <span className="text-gray-500">{t('cost.materialCost')}</span>
                <span className="font-semibold font-mono text-gray-800">{formatPrice(estimate.total_material)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
                <span className="text-gray-500">{t('cost.markup')}</span>
                <span className="font-mono text-gray-700">{estimate.markup_percent}%</span>
              </div>
              <div className="flex justify-between items-center py-2 text-base">
                <span className="text-gray-800 font-bold">{t('cost.total')}</span>
                <span className="font-bold font-mono text-lg text-blue-700">{formatPrice(estimate.total_with_markup)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50 flex items-center gap-1.5"
              >
                {generating && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {t('cost.regenerate')}
              </button>
              <button
                onClick={() => setEstimate(null)}
                className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition text-sm"
              >
                {t('common.hide')}
              </button>
            </div>

            {error && <p className="text-red-600 text-xs mt-2 bg-red-50 p-2 rounded">{error}</p>}
            <CostChart estimate={estimate} />
          </div>
        )}
      </div>
    </>
  )
}
