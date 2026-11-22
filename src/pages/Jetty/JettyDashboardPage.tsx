import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../store/authStore'
import {
  getJettyOverview,
  updateJettyResponse,
  type JettyOverviewTrip,
} from '../../services/tripApi'
import { getProfile, updateProfile } from '../../services/authApi'
import styles from './JettyDashboard.module.css'

const time = (value: string | null) => value ? new Date(value).toLocaleString() : '—'

export default function JettyDashboardPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const [trips, setTrips] = useState<JettyOverviewTrip[]>([])
  const [error, setError] = useState('')
  const [configured, setConfigured] = useState(false)
  const [radiusKm, setRadiusKm] = useState(25)
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')

  const loadTrips = async () => {
    try {
      const result = await getJettyOverview()
      setTrips(result.trips)
      setConfigured(result.configured)
      setRadiusKm(result.radiusKm)
      setError('')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to load jetty overview')
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      void loadTrips()
      void getProfile().then((result) => {
        setLatitude(result.user.latitude?.toString() || '')
        setLongitude(result.user.longitude?.toString() || '')
        setRadiusKm(result.user.nearbyRadiusKm)
      }).catch(() => undefined)
    })
    const token = localStorage.getItem('matsya-api-token')
    const events = token ? new EventSource(`/api/realtime/events?token=${encodeURIComponent(token)}`) : null
    events?.addEventListener('trip:update', () => void loadTrips())
    const fallback = window.setInterval(() => void loadTrips(), 30000)
    return () => {
      window.clearInterval(fallback)
      events?.close()
    }
  }, [])

  const setResponse = async (
    tripId: string,
    status: 'ACKNOWLEDGED' | 'FAMILY_CONTACTED' | 'RESOLVED',
  ) => {
    try {
      const result = await updateJettyResponse(tripId, status)
      setTrips((current) => current.map((trip) =>
        trip.id === tripId ? { ...trip, jettyResponse: result.response } : trip,
      ))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to update response')
    }
  }

  const emergencies = trips.filter((trip) =>
    trip.status === 'SOS_SENT' || trip.status === 'EMERGENCY_ACTIVE',
  )
  const returned = trips.filter((trip) => trip.status === 'SAFE_RETURN')

  const saveVicinity = async () => {
    const lat = Number(latitude)
    const lng = Number(longitude)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setError('Enter valid jetty coordinates')
      return
    }
    try {
      await updateProfile({ latitude: lat, longitude: lng, nearbyRadiusKm: radiusKm })
      setConfigured(true)
      setError('')
      await loadTrips()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to save jetty location')
    }
  }

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Browser geolocation is unavailable')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6))
        setLongitude(position.coords.longitude.toFixed(6))
        setError('')
      },
      () => setError('Could not access the jetty location'),
    )
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>{t('jettyOperations')}</span>
            <h1>{t('jettyTitle')}</h1>
            <p>{t('jettyWelcome', { name: user?.name || 'Operator' })}</p>
          </div>
          <div className={styles.headerActions}>
            <button onClick={() => navigate('/jetty/notifications')}>{t('notifications')}</button>
            <button onClick={() => navigate('/profile')}>{t('profileSettings')}</button>
            <button onClick={() => { logout(); navigate('/role') }}>{t('logout')}</button>
          </div>
        </header>

        <div className={styles.disclaimer} role="note">{t('jettyDisclaimer')}</div>
        {error && <div className={styles.disclaimer} role="alert">{error}</div>}

        <section className={`${styles.hero} ${emergencies.length ? styles.heroDanger : ''}`} aria-live="polite">
          <span className={styles.pill}>
            {emergencies.length ? t('jettyActiveAlert') : t('jettyMonitoring')}
          </span>
          <h2>{emergencies.length ? t('jettySOSReceived') : t('jettyNoAlerts')}</h2>
          <p>{emergencies.length ? t('jettySOSSummary') : t('jettyStandby')}</p>
        </section>

        <div className={styles.stats}>
          <article><small>Nearby fishermen</small><strong>{String(trips.length).padStart(2, '0')}</strong></article>
          <article><small>{t('jettyAlertStatus')}</small><strong>{String(emergencies.length).padStart(2, '0')} active</strong></article>
          <article><small>{t('tripLastUpdate')}</small><strong>{time(trips[0]?.lastUpdatedAt || null)}</strong></article>
        </div>

        <div className={styles.columns}>
          <section className={styles.panel}>
            <h3>Nearby fishermen</h3>
            <div className={styles.vicinityForm}>
              <label>Latitude<input value={latitude} onChange={(event) => setLatitude(event.target.value)} inputMode="decimal" /></label>
              <label>Longitude<input value={longitude} onChange={(event) => setLongitude(event.target.value)} inputMode="decimal" /></label>
              <label>Radius (km)<input type="number" min={1} max={500} value={radiusKm} onChange={(event) => setRadiusKm(Number(event.target.value))} /></label>
              <button type="button" className={styles.secondary} onClick={useMyLocation}>Use my location</button>
              <button type="button" className={styles.primary} onClick={() => void saveVicinity}>Save vicinity</button>
            </div>
            {!configured && <p className={styles.hint}>Set the jetty location to filter fishermen by distance. Until then, only active emergencies are shown.</p>}
            {trips.length === 0 ? (
              <p className={styles.hint}>No active fisherman trips.</p>
            ) : (
              trips.map((trip) => (
                <article className={styles.fishermanCard} key={trip.id}>
                  <div>
                    <strong>{trip.fisherman.name}</strong>
                    <span>{trip.fisherman.boatName || 'Boat not provided'} · {trip.fisherman.village || 'Village unavailable'}</span>
                  </div>
                  <div>
                    <b>{t('tripStatus_' + trip.status)}</b>
                    <small>{trip.lastLocation} · {trip.battery}% battery</small>
                    {trip.distanceKm != null && <small>{trip.distanceKm} km away · {trip.locationStale ? 'Location stale' : 'Location recent'}</small>}
                  </div>
                </article>
              ))
            )}
            <p className={styles.hint}>Jetty overview shows active registered trips. Precise nearby filtering requires beacon GPS and jetty coordinates.</p>
          </section>

          <section className={styles.panel}>
            <h3>{t('jettyResponseActions')}</h3>
            {emergencies.length === 0 ? (
              <p className={styles.hint}>{t('jettyWaiting')}</p>
            ) : emergencies.map((trip) => (
              <article className={styles.incident} key={trip.id}>
                <h4>{trip.fisherman.name} · {trip.fisherman.boatName || 'Boat unavailable'}</h4>
                <p>{trip.lastLocation}</p>
                <div className={styles.status}>{t('jettyResponse_' + trip.jettyResponse.status)}</div>
                <button
                  className={styles.primary}
                  disabled={trip.jettyResponse.status !== 'PENDING'}
                  onClick={() => void setResponse(trip.id, 'ACKNOWLEDGED')}
                >
                  {t('jettyAcknowledge')}
                </button>
                <button
                  className={styles.secondary}
                  disabled={trip.jettyResponse.status !== 'ACKNOWLEDGED'}
                  onClick={() => void setResponse(trip.id, 'FAMILY_CONTACTED')}
                >
                  {t('jettyRecordFamily')}
                </button>
                <button
                  className={styles.secondary}
                  disabled={trip.jettyResponse.status === 'RESOLVED'}
                  onClick={() => void setResponse(trip.id, 'RESOLVED')}
                >
                  {t('jettyResolve')}
                </button>
              </article>
            ))}
            <p className={styles.hint}>{t('jettyActionDisclaimer')}</p>
          </section>
        </div>

        <section className={styles.panel}>
          <h3>Additional dashboard tools</h3>
          <div className={styles.headerActions}>
            <button onClick={() => navigate('/jetty/sea')}>Sea conditions</button>
            <button onClick={() => navigate('/jetty/schemes')}>Welfare schemes</button>
            <button onClick={() => navigate('/jetty/notifications')}>Notifications</button>
            <button onClick={() => navigate('/profile')}>Profile</button>
          </div>
        </section>

        {returned.length > 0 && (
          <section className={styles.panel}>
            <h3>{t('jettySafeReturn')}</h3>
            {returned.map((trip) => (
              <p key={trip.id}>{trip.fisherman.name}: {trip.lastLocation} · {time(trip.lastUpdatedAt)}</p>
            ))}
          </section>
        )}
      </div>
    </main>
  )
}
