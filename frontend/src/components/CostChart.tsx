import { useMemo } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'
import { Pie, Bar } from 'react-chartjs-2'
import type { CostEstimate } from '../types'
import { useTranslation } from '../i18n'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

interface Props {
  estimate: CostEstimate
}

const COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
]

export default function CostChart({ estimate }: Props) {
  const { t } = useTranslation()

  const materialData = useMemo(() => {
    const map: Record<string, number> = {}
    estimate.items.forEach((item) => {
      const key = item.material_type || 'other'
      map[key] = (map[key] || 0) + item.total_cost
    })
    return {
      labels: Object.keys(map),
      values: Object.values(map),
    }
  }, [estimate])

  const elementData = useMemo(() => {
    const map: Record<string, number> = {}
    estimate.items.forEach((item) => {
      const key = item.element_name || item.element_type || 'other'
      map[key] = (map[key] || 0) + item.total_cost
    })
    return {
      labels: Object.keys(map),
      values: Object.values(map),
    }
  }, [estimate])

  const pieChart = {
    labels: materialData.labels,
    datasets: [{
      data: materialData.values,
      backgroundColor: COLORS.slice(0, materialData.labels.length),
      borderColor: '#fff',
      borderWidth: 2,
    }],
  }

  const barChart = {
    labels: elementData.labels,
    datasets: [{
      label: t('cost.materialCost'),
      data: elementData.values,
      backgroundColor: COLORS.slice(0, elementData.labels.length),
      borderRadius: 6,
    }],
  }

  const pieOptions = {
    plugins: {
      legend: { position: 'bottom' as const, labels: { boxWidth: 12, padding: 12, font: { size: 11 } } },
      tooltip: { callbacks: { label: (ctx: any) => `${ctx.label}: ${ctx.parsed.toLocaleString()}` } },
    },
    maintainAspectRatio: false,
  }

  const barOptions = {
    indexAxis: 'y' as const,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx: any) => `${ctx.parsed.x.toLocaleString()}` } },
    },
    maintainAspectRatio: false,
    scales: {
      x: { ticks: { font: { size: 10 } } },
      y: { ticks: { font: { size: 10 } } },
    },
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 animate-slide-up">
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">{t('cost.chartByMaterial')}</h4>
        <div className="h-64 flex items-center justify-center">
          {materialData.labels.length > 0 ? (
            <Pie data={pieChart} options={pieOptions} />
          ) : (
            <p className="text-gray-400 text-sm">{t('cost.itemsCount')}: 0</p>
          )}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">{t('cost.chartByElement')}</h4>
        <div className="h-64 flex items-center justify-center">
          {elementData.labels.length > 0 ? (
            <Bar data={barChart} options={barOptions} />
          ) : (
            <p className="text-gray-400 text-sm">{t('cost.itemsCount')}: 0</p>
          )}
        </div>
      </div>
    </div>
  )
}
