import type { BendingBar } from '../../types'
import { useTranslation } from '../../i18n'

export default function BendingSchedule({ bars }: { bars: BendingBar[] }) {
  const { t } = useTranslation()

  return (
    <div className="mt-3 border-t pt-3">
      <h5 className="text-sm font-semibold text-gray-700 mb-2">📋 {t('bending.title')}</h5>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1 text-left">{t('bending.dia')}</th>
              <th className="border px-2 py-1 text-left">{t('bending.usSize')}</th>
              <th className="border px-2 py-1 text-left">{t('bending.count')}</th>
              <th className="border px-2 py-1 text-left">{t('bending.length')}</th>
              <th className="border px-2 py-1 text-left">{t('bending.totalLength')}</th>
              <th className="border px-2 py-1 text-left">{t('bending.weight')}</th>
              <th className="border px-2 py-1 text-left">{t('bending.shape')}</th>
              <th className="border px-2 py-1 text-left">{t('bending.description')}</th>
            </tr>
          </thead>
          <tbody>
            {bars.map((bar, i) => {
              const len = bar.length_m ?? bar.length ?? 0
              const total = bar.total_length_m ?? bar.count * len
              const wt = bar.weight_kg ?? round(total * rebarWeight(bar.dia), 2)
              return (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="border px-2 py-1">{bar.dia}</td>
                  <td className="border px-2 py-1">{bar.us_size ?? usSize(bar.dia)}</td>
                  <td className="border px-2 py-1">{bar.count}</td>
                  <td className="border px-2 py-1">{round(len, 3)}</td>
                  <td className="border px-2 py-1">{round(total, 3)}</td>
                  <td className="border px-2 py-1">{round(wt, 2)}</td>
                  <td className="border px-2 py-1 font-mono">{bar.shape_code}</td>
                  <td className="border px-2 py-1">{bar.shape_desc}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function rebarWeight(dia: number): number {
  const w: Record<number, number> = { 10: 0.617, 12: 0.888, 14: 1.208, 16: 1.578, 18: 1.998, 20: 2.466, 22: 2.984, 25: 3.853, 28: 4.834, 32: 6.313 }
  return w[dia] ?? 0.888
}

function usSize(dia: number): string {
  const s: Record<number, string> = { 10: '#3', 12: '#4', 14: '#5', 16: '#6', 18: '#7', 20: '#8', 22: '#9', 25: '#10', 28: '#11', 32: '#14' }
  return s[dia] ?? `#${dia}`
}

function round(v: number, d: number): number {
  return Math.round(v * 10 ** d) / 10 ** d
}
