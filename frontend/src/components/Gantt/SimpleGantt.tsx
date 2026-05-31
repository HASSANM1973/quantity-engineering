import type { Element } from '../../types'
import { useTranslation } from '../../i18n'

const ELEMENT_DURATIONS: Record<string, { days_per_unit: number }> = {
  foundation: { days_per_unit: 0.05 },
  column: { days_per_unit: 0.08 },
  beam: { days_per_unit: 0.06 },
  solid_slab: { days_per_unit: 0.04 },
  ribbed_slab: { days_per_unit: 0.05 },
  retaining_wall: { days_per_unit: 0.06 },
  stairs: { days_per_unit: 0.10 },
  steel_beam: { days_per_unit: 0.5 },
  steel_column: { days_per_unit: 0.5 },
}

interface Activity {
  name: string
  duration_days: number
  start_day: number
  end_day: number
}

function buildSchedule(element: Element, t: (key: string, params?: Record<string, string | number>) => string): Activity[] {
  const concreteQty = element.quantities?.find((q) => q.material_type === 'concrete')
  const rebarQty = element.quantities?.find((q) => q.material_type === 'rebar')
  const formworkQty = element.quantities?.find((q) => q.material_type === 'formwork')
  const steelBeamQty = element.quantities?.find((q) => q.material_type === 'steel_beam')
  const steelColQty = element.quantities?.find((q) => q.material_type === 'steel_column')

  const isSteel = !!steelBeamQty || !!steelColQty
  const dur = ELEMENT_DURATIONS[element.element_type] || { days_per_unit: 0.05 }

  let day = 0
  let activities: Activity[]

  if (isSteel) {
    const steelQty = steelBeamQty ?? steelColQty!
    const erectDays = Math.max(1, Math.ceil(steelQty.value * dur.days_per_unit))
    activities = [
      { name: t('gantt.prepare'), duration_days: erectDays, start_day: day, end_day: (day += erectDays) },
      { name: t('gantt.erect'), duration_days: Math.max(1, Math.ceil(erectDays * 0.4)), start_day: day, end_day: (day += Math.max(1, Math.ceil(erectDays * 0.4))) },
    ]
  } else {
    const concreteDays = concreteQty ? Math.max(1, Math.ceil(concreteQty.value * dur.days_per_unit)) : 2
    const rebarDays = rebarQty ? Math.max(1, Math.ceil(concreteDays * 0.7)) : 1
    const formworkDays = formworkQty ? Math.max(1, Math.ceil(concreteDays * 0.5)) : 1
    activities = [
      { name: t('gantt.formwork'), duration_days: formworkDays, start_day: day, end_day: (day += formworkDays) },
      { name: t('gantt.rebar'), duration_days: rebarDays, start_day: day, end_day: (day += rebarDays) },
      { name: t('gantt.pour'), duration_days: concreteDays, start_day: day, end_day: (day += concreteDays) },
      { name: t('gantt.cure'), duration_days: Math.max(1, Math.ceil(concreteDays * 0.5)), start_day: day, end_day: (day += Math.max(1, Math.ceil(concreteDays * 0.5))) },
    ]
  }

  return activities
}

export default function SimpleGantt({ element }: { element: Element }) {
  const { t } = useTranslation()
  const activities = buildSchedule(element, t)
  const totalDays = activities[activities.length - 1]?.end_day || 1

  return (
    <div className="mt-3 border-t pt-3">
      <h5 className="text-sm font-semibold text-gray-700 mb-2">{t('gantt.title')}</h5>
      <div className="space-y-1">
        {activities.map((act) => {
          const widthPct = (act.duration_days / totalDays) * 100
          return (
            <div key={act.name} className="flex items-center gap-2 text-xs">
              <span className="w-24 text-gray-600 text-left">{act.name}</span>
              <div className="flex-1 bg-gray-200 rounded h-5 relative overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded"
                  style={{ width: `${widthPct}%` }}
                />
                <span className="absolute inset-0 flex items-center px-1.5 text-[10px] text-white font-medium">
                  {t('gantt.day')} {act.start_day + 1} - {act.end_day}
                </span>
              </div>
              <span className="w-16 text-gray-500">{act.duration_days} {t('gantt.day')}</span>
            </div>
          )
        })}
      </div>
      <p className="text-[10px] text-gray-400 mt-1">{t('gantt.total', { days: totalDays })}</p>
    </div>
  )
}
