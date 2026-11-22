import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import styles from '../../styles/Dashboard.module.css'
import { useTranslation } from 'react-i18next'

export default function DashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const { t } = useTranslation()

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>{t('fishermanEyebrow')}</p>
            <h1>
              {t('namaskar', { name: user?.name?.split(' ')[0] || t('fishermanFallback') })}
            </h1>
            <p className={styles.muted}>
              {t('fishermanSubtitle')}
            </p>
          </div>

          <button
            className={styles.outlineButton}
            onClick={() => {
              logout()
              navigate('/role', { replace: true })
            }}
          >
            {t('logout')}
          </button>
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:12}}>
            <button className={styles.outlineButton} onClick={() => navigate('/fisherman/notifications')}>🔔 {t('notifications')}</button>
            <button className={styles.outlineButton} onClick={() => navigate('/profile')}>⚙️ {t('profileSettings')}</button>
          </div>
        </header>

        <section className={styles.hero}>
          <div>
            <span className={styles.badge}>{t('demoBulletin')}</span>
            <h2>{t('seaHeroTitle')}</h2>
            <p>
              {t('seaHeroBody')}
            </p>
            <button
              className={styles.primaryButton}
              onClick={() => navigate('/fisherman/sea')}
            >
              {t('viewSea')}
            </button>
          </div>
          <div className={styles.heroIcon} aria-hidden="true">
            🌊
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <h2>{t('safetyOverview')}</h2>
            <span className={styles.muted}>{t('demoInfo')}</span>
          </div>

          <div className={styles.stats}>
            <article className={styles.statCard}>
              <span>{t('weather')}</span>
              <strong>{t('partlyCloudy')}</strong>
              <small>{t('illustrative')}</small>
            </article>

            <article className={styles.statCard}>
              <span>{t('wind')}</span>
              <strong>12 km/h</strong>
              <small>{t('demoReading')}</small>
            </article>

            <article className={styles.statCard}>
              <span>{t('beacon')}</span>
              <strong>{t('notConnected')}</strong>
              <small>{t('hardwarePending')}</small>
            </article>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <h2>{t('whatToDo')}</h2>
          </div>

          <div className={styles.actions}>
            <button
              className={styles.actionCard}
              onClick={() => navigate('/fisherman/trip')}
            >
              <span className={styles.actionIcon}>🚤</span>
              <strong>{t('startTrip')}</strong>
              <small>{t('tripCardBody')}</small>
              <span className={styles.actionLink}>{t('openTrip')}</span>
            </button>

            <button
              className={styles.actionCard}
              onClick={() => navigate('/fisherman/schemes')}
            >
              <span className={styles.actionIcon}>📋</span>
              <strong>{t('schemes')}</strong>
              <small>{t('schemesBody')}</small>
              <span className={styles.actionLink}>{t('exploreSchemes')}</span>
            </button>

            <button
              className={styles.actionCard}
              onClick={() => navigate('/fisherman/sea')}
            >
              <span className={styles.actionIcon}>🌊</span>
              <strong>{t('seaConditions')}</strong>
              <small>{t('seaCardBody')}</small>
              <span className={styles.actionLink}>{t('viewBulletin')}</span>
            </button>

            <button
              className={`${styles.actionCard} ${styles.sosCard}`}
              onClick={() => navigate('/sos')}
            >
              <span className={styles.actionIcon}>🆘</span>
              <strong>{t('emergencySOS')}</strong>
              <small>{t('sosBody')}</small>
              <span className={styles.actionLink}>{t('openSOS')}</span>
            </button>
          </div>
        </section>

        <nav className={styles.bottomNav} aria-label="Fisherman navigation">
          <button className={styles.activeNav} onClick={() => navigate('/fisherman')}>
            {t('home')}
          </button>
          <button onClick={() => navigate('/fisherman/sea')}>🌊 {t('sea')}</button>
          <button onClick={() => navigate('/fisherman/trip')}>🚤 {t('trip')}</button>
          <button onClick={() => navigate('/fisherman/schemes')}>📋 {t('schemesShort')}</button>
        </nav>
      </div>
    </main>
  )
}