import { useNavigate } from 'react-router-dom'
import { useAuthStore, type UserRole } from '../../store/authStore'
import styles from './RolePage.module.css'
import { useTranslation } from 'react-i18next'

const roles: {
  id: UserRole
  icon: string
  title: string
  description: string
  features: string[]
}[] = [
  {
    id: 'fisherman',
    icon: '⚓',
    title: 'fisherman',
    description: 'fishermanDescription',
    features: ['seaAdvisories', 'safetyBeacon', 'welfareSchemes'],
  },
  {
    id: 'family',
    icon: '🏠',
    title: 'family',
    description: 'familyDescription',
    features: ['tripMonitoring', 'safetyUpdates', 'emergencyAlerts'],
  },
  {
    id: 'jetty', icon: '🛟', title: 'jettyRole', description: 'jettyDescription',
    features: ['jettyFeatureAlerts', 'jettyFeatureRelay', 'jettyFeatureResponse'],
  },
]

export default function RolePage() {
  const navigate = useNavigate()
  const { selectedRole, setSelectedRole } = useAuthStore()
  const { t } = useTranslation()

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logo}>{t('brand')}</div>
        <span>{t('tagline')}</span>
      </header>

      <section className={styles.content}>
        <p className={styles.step}>{t('step2')}</p>

        <h1>{t('chooseRole')}</h1>

        <p className={styles.subtitle}>
          {t('roleHint')}
        </p>

        <div className={styles.grid}>
          {roles.map((role) => (
            <button
              key={role.id}
              type="button"
              className={`${styles.card} ${
                selectedRole === role.id ? styles.selected : ''
              }`}
              onClick={() => setSelectedRole(role.id)}
              aria-pressed={selectedRole === role.id}
            >
              <span className={styles.icon}>{role.icon}</span>

              <h2>{t(role.title)}</h2>
              <p>{t(role.description)}</p>

              <div className={styles.features}>
                {role.features.map((feature) => (
                  <span key={feature}>✓ {t(feature)}</span>
                ))}
              </div>

              <span className={styles.cardAction}>
                {selectedRole === role.id ? t('selected') : t('selectRole')}
              </span>
            </button>
          ))}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.back}
            onClick={() => navigate('/language')}
          >
            ← {t('back')}
          </button>

          <button
            type="button"
            className={styles.continue}
            disabled={!selectedRole}
            onClick={() => navigate('/login')}
          >
            {t('continue')} →
          </button>
        </div>
      </section>
    </main>
  )
}