import { Link } from 'react-router-dom'
import { useTranslation } from '../i18n'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-white font-bold text-lg mb-3">{t('brand.name')}</h3>
            <p className="text-sm leading-relaxed">{t('brand.tagline')}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">{t('footer.links')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition">{t('footer.projects')}</Link>
              </li>
              <li>
                <Link to="/projects/new" className="hover:text-white transition">{t('nav.newProject')}</Link>
              </li>
              <li>
                <Link to="/prices" className="hover:text-white transition">{t('footer.prices')}</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">{t('footer.contact')}</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span>📧</span> {t('contact.email')}
              </li>
              <li className="flex items-center gap-2">
                <span>📞</span> {t('contact.phone')}
              </li>
              <li className="flex items-center gap-2">
                <span>📍</span> {t('location.desc')}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 text-center text-sm">
          <p>{t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  )
}
