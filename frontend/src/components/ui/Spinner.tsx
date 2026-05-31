import { useTranslation } from '../../i18n'

interface SpinnerProps {
  text?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function Spinner({ text, size = 'md' }: SpinnerProps) {
  const { t } = useTranslation()
  const displayText = text ?? t('spinner.default')
  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6'
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-2">
      <div className={`${sizeClass} border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin`} />
      {displayText && <span className="text-sm text-gray-500">{displayText}</span>}
    </div>
  )
}
