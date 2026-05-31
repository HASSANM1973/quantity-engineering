import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { projectApi } from '../api/client'
import { PROJECT_TYPES } from '../types'
import Toast from '../components/ui/Toast'
import { useTranslation } from '../i18n'

interface FieldErrors {
  name?: string
  description?: string
  location?: string
}

export default function ProjectNew() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [form, setForm] = useState({ name: '', description: '', location: '', project_type: 'residential' })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' })

  const validate = (): boolean => {
    const e: FieldErrors = {}
    if (!form.name.trim()) e.name = t('newProject.nameRequired')
    else if (form.name.trim().length < 2) e.name = t('newProject.nameMinLength')
    if (form.location.trim() && form.location.trim().length < 2) e.location = t('newProject.locationInvalid')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      const res = await projectApi.create({
        ...form,
        name: form.name.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
      })
      navigate(`/projects/${res.data.id}`)
    } catch {
      setToast({ visible: true, message: t('newProject.createFailed'), type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const inputClass = (field: keyof FieldErrors) =>
    `w-full border rounded-lg px-3 py-2.5 text-sm transition focus:outline-none focus:ring-2 ${
      errors[field]
        ? 'border-red-300 focus:ring-red-400 bg-red-50'
        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-400'
    }`

  return (
    <div className="max-w-2xl mx-auto">
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />

      <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('newProject.title')}</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {t('newProject.nameLabel')} <span className="text-red-500">*</span>
          </label>
          <input
            value={form.name}
            onChange={(e) => { setForm({ ...form, name: e.target.value }); if (errors.name) setErrors({ ...errors, name: undefined }) }}
            className={inputClass('name')}
            placeholder={t('newProject.namePlaceholder')}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('newProject.locationLabel')}</label>
          <input
            value={form.location}
            onChange={(e) => { setForm({ ...form, location: e.target.value }); if (errors.location) setErrors({ ...errors, location: undefined }) }}
            className={inputClass('location')}
            placeholder={t('newProject.locationPlaceholder')}
          />
          {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('newProject.typeLabel')}</label>
          <select
            value={form.project_type}
            onChange={(e) => setForm({ ...form, project_type: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
          >
            {PROJECT_TYPES.map((pt) => (
              <option key={pt.value} value={pt.value}>{pt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('newProject.descriptionLabel')}</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
            placeholder={t('newProject.descriptionPlaceholder')}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center justify-center gap-2"
          >
            {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {saving ? t('newProject.saving') : t('newProject.submit')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
          >
            {t('common.cancel')}
          </button>
        </div>
      </form>
    </div>
  )
}
