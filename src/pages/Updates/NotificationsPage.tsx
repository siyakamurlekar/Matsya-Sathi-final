import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../store/authStore'
import { useTripStore, type TripStatus } from '../../store/tripStore'
import styles from './Updates.module.css'
import { useEffect, useState } from 'react'
import { getNotifications, markAllNotificationsRead, markNotificationRead, type AppNotification } from '../../services/dataApi'

const stages: TripStatus[] = ['CHECK_IN','TRIP_ACTIVE','CONNECTIVITY_WEAK','LORA_RELAY','SOS_SENT','EMERGENCY_ACTIVE','SAFE_RETURN']
const icons: Record<TripStatus, string> = {
  IDLE:'🔔', CHECK_IN:'📋', TRIP_ACTIVE:'🚤', CONNECTIVITY_WEAK:'📶',
  LORA_RELAY:'📡', SOS_SENT:'🆘', EMERGENCY_ACTIVE:'🚨', SAFE_RETURN:'✅',
}
export default function NotificationsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const status = useTripStore((s) => s.status)
  const lastUpdate = useTripStore((s) => s.lastUpdate)
  const emergency = status === 'SOS_SENT' || status === 'EMERGENCY_ACTIVE'
  const visible = status === 'IDLE' ? [] : stages.slice(0, stages.indexOf(status) + 1)
  const home = user?.role === 'family' ? '/family' : '/fisherman'
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  useEffect(() => {
    void getNotifications().then((result) => setNotifications(result.notifications)).catch((error) => console.error(error))
  }, [])
  const acknowledge = async (id: string) => {
    await markNotificationRead(id)
    setNotifications((current) => current.map((item) =>
      item.id === id ? { ...item, read: true, readAt: new Date().toISOString(), deliveryStatus: 'acknowledged' } : item,
    ))
  }
  return <main className={styles.page}><div className={styles.wrap}>
    <div className={styles.top}><button className={styles.back} onClick={() => navigate(home)}>← {t('back')}</button><span className={styles.eyebrow}>{t('updatesEyebrow')}</span></div>
    <h1 className={styles.title}>🔔 {t('updatesTitle')}</h1><p className={styles.lead}>{t('updatesIntro')}</p>
    {notifications.length > 0 && <div className={styles.actions}><button className={styles.button} onClick={() => void markAllNotificationsRead().then(() => setNotifications((current) => current.map((item) => ({ ...item, read: true, deliveryStatus: 'acknowledged' }))))}>Mark all read</button></div>}
    {emergency && <section className={styles.hero} role="alert"><span>{t('tripDemo')}</span><h2>🆘 {t('tripEmergencyBanner')}</h2><p>{t('updatesEmergencyNote')}</p></section>}
    <div className={styles.grid}><section className={styles.card} style={{gridColumn:'1 / -1'}}>
      <h2>{t('updatesActivity')}</h2>
      {notifications.map((notification) => <article className={styles.item} key={notification.id}>
        <span className={styles.icon} aria-hidden="true">{notification.type === 'EMERGENCY' ? '🆘' : notification.type === 'SAFE_RETURN' ? '✅' : '🔔'}</span>
        <div>
          <h3>{notification.title}</h3>
          <p>{notification.message}</p>
          {notification.createdAt && <time className={styles.date} dateTime={notification.createdAt}>{new Date(notification.createdAt).toLocaleString()}</time>}
          <small>{notification.read ? 'Acknowledged' : notification.deliveryStatus}</small>
          {!notification.read && <button className={styles.button} onClick={() => void acknowledge(notification.id)}>Mark read</button>}
        </div>
      </article>)}
      {visible.length === 0 ? <p className={styles.empty}>{t('updatesEmpty')}</p> : [...visible].reverse().map((stage) => <article className={styles.item} key={stage}>
        <span className={styles.icon} aria-hidden="true">{icons[stage]}</span><div><h3>{t('tripStatus_' + stage)}</h3><p>{t('updatesStageNote')}</p>{stage === status && lastUpdate && <time className={styles.date} dateTime={lastUpdate}>{new Date(lastUpdate).toLocaleString()}</time>}</div>
      </article>)}
    </section></div>
    <div className={styles.note}>{t('updatesDemoDisclaimer')}</div>
    <div className={styles.actions}><button className={styles.button} onClick={() => navigate(user?.role === 'family' ? '/family/tracking' : '/fisherman/trip')}>{t('updatesViewTrip')}</button><button className={`${styles.button} ${styles.secondary}`} onClick={() => navigate('/profile')}>{t('profileSettings')}</button></div>
  </div></main>
}
