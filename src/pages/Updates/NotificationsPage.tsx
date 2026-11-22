import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../store/authStore'
import styles from './Updates.module.css'
import { useEffect, useState } from 'react'
import { getNotifications, markAllNotificationsRead, markNotificationRead, type AppNotification } from '../../services/dataApi'

export default function NotificationsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const home = user?.role === 'family' ? '/family' : user?.role === 'jetty' ? '/jetty' : '/fisherman'
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  useEffect(() => {
    queueMicrotask(() => {
      void getNotifications().then((result) => setNotifications(result.notifications)).catch((error) => console.error(error))
    })
    const fallback = window.setInterval(() => {
      void getNotifications().then((result) => setNotifications(result.notifications)).catch((error) => console.error(error))
    }, 30000)
    return () => window.clearInterval(fallback)
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
    <div className={styles.grid}><section className={styles.card} style={{gridColumn:'1 / -1'}}>
      <h2>{t('updatesActivity')}</h2>
      {notifications.length === 0 && <p className={styles.empty}>{t('updatesEmpty')}</p>}
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
    </section></div>
    <div className={styles.note}>{t('updatesDemoDisclaimer')}</div>
    <div className={styles.actions}><button className={styles.button} onClick={() => navigate(user?.role === 'family' ? '/family/tracking' : user?.role === 'jetty' ? '/jetty' : '/fisherman/trip')}>{t('updatesViewTrip')}</button><button className={`${styles.button} ${styles.secondary}`} onClick={() => navigate('/profile')}>{t('profileSettings')}</button></div>
  </div></main>
}
