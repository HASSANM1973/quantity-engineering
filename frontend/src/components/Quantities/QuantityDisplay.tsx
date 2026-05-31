import type { CalcResult } from '../../types'
import { useTranslation } from '../../i18n'

export default function QuantityDisplay({ result }: { result: CalcResult }) {
  const { t } = useTranslation()

  const materialInfo: Record<string, { label: string; color: string; icon: string }> = {
    concrete: { label: t('qty.concrete'), color: 'bg-gray-200 text-gray-800', icon: '🧱' },
    rebar: { label: t('qty.rebar'), color: 'bg-orange-100 text-orange-800', icon: '🔩' },
    formwork: { label: t('qty.formwork'), color: 'bg-green-100 text-green-800', icon: '🪵' },
    steel_beam: { label: t('qty.steel_beam'), color: 'bg-blue-100 text-blue-800', icon: '🏗️' },
    steel_column: { label: t('qty.steel_column'), color: 'bg-blue-100 text-blue-800', icon: '🏗️' },
    bolts: { label: t('qty.bolts'), color: 'bg-purple-100 text-purple-800', icon: '🔧' },
    plate: { label: t('qty.plate'), color: 'bg-purple-100 text-purple-800', icon: '⬜' },
    weld: { label: t('qty.weld'), color: 'bg-red-100 text-red-800', icon: '🔥' },
  }

  const entries = Object.entries(result).filter(([key]) => key !== 'bending_schedule' && result[key as keyof CalcResult])

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      {entries.map(([key, data]) => {
        const info = materialInfo[key] || { label: key, color: 'bg-gray-100', icon: '📐' }
        const val = data as { value: number; unit: string; spec_reference?: string; details?: any }
        return (
          <div key={key} className={`rounded-lg p-2.5 ${info.color}`}>
            <div className="text-xs opacity-70">{info.icon} {info.label}</div>
            <div className="text-lg font-bold">{val.value.toLocaleString()}</div>
            <div className="text-xs opacity-70">{val.unit}</div>
            <div className="text-[10px] opacity-50 mt-1">{val.spec_reference}</div>
            {val.details && val.details.shape && (
              <div className="text-[10px] opacity-60 mt-1">{val.details.shape}</div>
            )}
          </div>
        )
      })}
    </div>
  )
}
