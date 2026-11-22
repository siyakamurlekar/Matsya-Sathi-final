import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import styles from '../../styles/Dashboard.module.css'
import { useTranslation } from 'react-i18next'
import { useTripStore } from '../../store/tripStore'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { getFamilyLinks, linkFisherman, type FamilyLink } from '../../services/tripApi'

export default function FamilyDashboardPage() {
  const navigate = useNavigate()
  const { status, lastLocation, loadFamily } = useTripStore()
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const [phone, setPhone] = useState('')
  const [links, setLinks] = useState<FamilyLink[]>([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadLinks = useCallback(async () => {
    try {
      const result = await getFamilyLinks()
      setLinks(result.links)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to load linked fishermen')
    }
  }, [])

  useEffect(() => {
    queueMicrotask(() => {
      void loadLinks()
      void loadFamily()
    })
    const token = localStorage.getItem('matsya-api-token')
    const events = token ? new EventSource(`/api/realtime/events?token=${encodeURIComponent(token)}`) : null
    events?.addEventListener('trip:update', () => void loadFamily())
    const timer = window.setInterval(() => void loadFamily(), 30000)
    const refreshOnFocus = () => void loadFamily()
    window.addEventListener('focus', refreshOnFocus)

    return () => {
      window.clearInterval(timer)
      events?.close()
      window.removeEventListener('focus', refreshOnFocus)
    }
  }, [loadFamily, loadLinks])

  const connectFisherman = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setMessage('')
    try {
      const result = await linkFisherman(phone)
      setLinks((current) =>
        current.some((link) => link.fishermanId === result.link.fishermanId)
          ? current
          : [...current, result.link],
      )
      setPhone('')
      setMessage(`Linked with ${result.link.name}`)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to connect fisherman')
    }
  }

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
            <h2>Connected fishermen</h2>
            <span className={styles.muted}>Family links</span>
          </div>

          <div className={styles.linkPanel}>
            <form className={styles.linkForm} onSubmit={connectFisherman}>
              <label htmlFor="fisherman-phone">Fisherman phone number</label>
              <input
                id="fisherman-phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                pattern="[6-9][0-9]{9}"
                value={phone}
                onChange={(event) => setPhone(event.target.value.replace(/\D/g, ''))}
                placeholder="9876543210"
                required
              />
              <button className={styles.primaryButton} type="submit">
                Connect fisherman
              </button>
            </form>

            {message && <p className={styles.successMessage} role="status">{message}</p>}
            {error && <p className={styles.errorMessage} role="alert">{error}</p>}

            {links.length > 0 ? (
              <div className={styles.linkList}>
                {links.map((link) => (
                  <article className={styles.linkCard} key={link.fishermanId}>
                    <div>
                      <strong>{link.name}</strong>
                      <span>{link.phone}</span>
                    </div>
                    {link.boatName && <small>{link.boatName}</small>}
                  </article>
                ))}
              </div>
            ) : (
              <p className={styles.muted}>No fishermen connected yet.</p>
            )}
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