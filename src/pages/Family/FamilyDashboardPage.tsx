import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import styles from '../../styles/Dashboard.module.css'
import { useTranslation } from 'react-i18next'
import { useTripStore } from '../../store/tripStore'

export default function FamilyDashboardPage() {
  const navigate = useNavigate()
  const { status, lastLocation } = useTripStore()
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>{t('familyEyebrow')}</p>
            <h1>
              {t('namaskar', { name: user?.name?.split(' ')[0] || t('friend') })}
            </h1>
            <p className={styles.muted}>
              {t('familySubtitle')}
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
            <button className={styles.outlineButton} onClick={() => navigate('/notifications')}>🔔 {t('notifications')}</button>
            <button className={styles.outlineButton} onClick={() => navigate('/profile')}>⚙️ {t('profileSettings')}</button>
          </div>
        </header>

        <section className={styles.hero}>
          <div>
            <span className={styles.badge}>{t('familyCenter')}</span>
            <h2>{t('familyHeroTitle')}</h2>
            <p>
              {t('familyHeroBody')}
            </p>

            <button
              className={styles.primaryButton}
              onClick={() => navigate('/family/tracking')}
            >
              {t('viewTracking')}
            </button>
          </div>

          <div className={styles.heroIcon} aria-hidden="true">
            🛟
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <h2>{t('connectedTrip')}</h2>
            <span className={styles.muted}>{t('demoTrip')}</span>
          </div>

          <div className={styles.stats}>
            <article className={styles.statCard}>
              <span>{t('tripStatus')}</span>
              <strong>{t('tripStatus_' + status)}</strong>
              <small>{t('waitingDeparture')}</small>
            </article>

            <article className={styles.statCard}>
              <span>{t('lastLocation')}</span>
              <strong>{status === 'IDLE' ? t('unavailable') : lastLocation}</strong>
              <small>{t('updatesDuringTrip')}</small>
            </article>

            <article className={styles.statCard}>
              <span>{t('beaconStatus')}</span>
              <strong>{status === 'IDLE' ? t('offline') : status === 'LORA_RELAY' ? 'LoRa · Demo' : status === 'CONNECTIVITY_WEAK' ? 'GSM weak · Demo' : 'GSM · Demo'}</strong>
              <small>{t('demoConnectivity')}</small>
            </article>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <h2>{t('familyTools')}</h2>
          </div>

          <div className={styles.actions}>
            <button
              className={styles.actionCard}
              onClick={() => navigate('/family/tracking')}
            >
              <span className={styles.actionIcon}>📍</span>
              <strong>{t('trackTrip')}</strong>
              <small>{t('trackingBody')}</small>
              <span className={styles.actionLink}>{t('openTracking')}</span>
            </button>

            <button
              className={styles.actionCard}
              onClick={() => navigate('/notifications')}
            >
              <span className={styles.actionIcon}>🔔</span>
              <strong>{t('safetyNotifications')}</strong>
              <small>{t('notificationsBody')}</small>
              <span className={styles.actionLink}>{t('viewAlerts')}</span>
            </button>
          </div>
        </section>

        <nav className={styles.bottomNav} aria-label="Family navigation">
          <button className={styles.activeNav} onClick={() => navigate('/family')}>
            {t('home')}
          </button>
          <button onClick={() => navigate('/family/tracking')}>
            {t('tracking')}
          </button>
          <button onClick={() => navigate('/notifications')}>
            {t('alerts')}
          </button>
        </nav>
      </div>
    </main>
  )
}