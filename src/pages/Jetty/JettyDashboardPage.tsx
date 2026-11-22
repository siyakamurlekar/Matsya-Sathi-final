import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../store/authStore'
import { useTripStore } from '../../store/tripStore'
import { useJettyStore } from '../../store/jettyStore'
import styles from './JettyDashboard.module.css'

const time = (value: string | null) => value ? new Date(value).toLocaleString() : '—'
export default function JettyDashboardPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const { status, lastLocation, lastUpdate, battery } = useTripStore()
  const { response, acknowledgedAt, familyContactedAt, resolvedAt, setResponse } = useJettyStore()
  const emergency = status === 'SOS_SENT' || status === 'EMERGENCY_ACTIVE'
  const returned = status === 'SAFE_RETURN'
  const relay = status === 'LORA_RELAY' || emergency
  const open = emergency && response !== 'RESOLVED'
  return <main className={styles.page}>
    <div className={styles.shell}>
      <header className={styles.header}>
        <div><span className={styles.eyebrow}>{t('jettyOperations')}</span><h1>{t('jettyTitle')}</h1><p>{t('jettyWelcome', { name: user?.name || 'Operator' })}</p></div>
        <div className={styles.headerActions}><button onClick={() => navigate('/profile')}>{t('profileSettings')}</button><button onClick={() => { logout(); navigate('/role') }}>{t('logout')}</button></div>
      </header>
      <div className={styles.disclaimer} role="note">{t('jettyDisclaimer')}</div>
      <section className={`${styles.hero} ${open ? styles.heroDanger : ''}`} aria-live="polite">
        <span className={styles.pill}>{open ? t('jettyActiveAlert') : returned ? t('jettySafeReturn') : t('jettyMonitoring')}</span>
        <h2>{open ? t('jettySOSReceived') : returned ? t('tripStatus_SAFE_RETURN') : t('jettyNoAlerts')}</h2>
        <p>{open ? t('jettySOSSummary') : t('jettyStandby')}</p>
      </section>
      <div className={styles.stats}>
        <article><small>{t('jettyActiveCount')}</small><strong>{open ? '01' : '00'}</strong></article>
        <article><small>{t('jettyAlertStatus')}</small><strong>{emergency ? t('jettyResponse_' + response) : t('jettyNoAlerts')}</strong></article>
        <article><small>{t('tripLastUpdate')}</small><strong>{time(lastUpdate)}</strong></article>
      </div>
      <div className={styles.columns}>
        <section className={styles.panel}>
          <h3>{t('jettyIncidentDetails')}</h3>
          <dl>
            <div><dt>{t('jettyFisherman')}</dt><dd>{t('jettyDemoFisherman')}</dd></div>
            <div><dt>{t('jettyBoat')}</dt><dd>{t('jettyDemoBoat')}</dd></div>
            <div><dt>{t('tripLocation')}</dt><dd>{status === 'IDLE' ? t('tripUnavailable') : lastLocation}</dd></div>
            <div><dt>{t('tripBattery')}</dt><dd>{battery}% · Demo</dd></div>
            <div><dt>{t('jettyDelivery')}</dt><dd>{relay ? t('jettyRelayRoute') : t('jettyAwaitingRelay')}</dd></div>
          </dl>
          <p className={styles.hint}>{t('jettyLocationCaution')}</p>
        </section>
        <section className={styles.panel}>
          <h3>{t('jettyResponseActions')}</h3>
          {emergency || returned ? <>
            <div className={styles.status}>{t('jettyResponse_' + response)}</div>
            <button className={styles.primary} disabled={response !== 'PENDING' || !emergency} onClick={() => setResponse('ACKNOWLEDGED')}>{t('jettyAcknowledge')}</button>
            <button className={styles.secondary} disabled={response !== 'ACKNOWLEDGED' || !emergency} onClick={() => setResponse('FAMILY_CONTACTED')}>{t('jettyRecordFamily')}</button>
            <button className={styles.secondary} disabled={!returned || response === 'RESOLVED'} onClick={() => setResponse('RESOLVED')}>{t('jettyResolve')}</button>
            <p className={styles.hint}>{t('jettyActionDisclaimer')}</p>
          </> : <p className={styles.hint}>{t('jettyWaiting')}</p>}
        </section>
      </div>
      <section className={styles.panel}>
        <h3>{t('jettyTimeline')}</h3>
        <ol className={styles.timeline}>
          <li><b>{t('jettySOSStage')}</b><span>{emergency || returned ? time(lastUpdate) : '—'} · {t('jettyDemo')}</span></li>
          <li><b>{t('jettyRelayStage')}</b><span>{relay ? t('jettyRelayRoute') : t('jettyNotConfirmed')}</span></li>
          <li><b>{t('jettyAckStage')}</b><span>{time(acknowledgedAt)}</span></li>
          <li><b>{t('jettyFamilyStage')}</b><span>{time(familyContactedAt)}</span></li>
          <li><b>{t('jettyResolvedStage')}</b><span>{time(resolvedAt)}</span></li>
        </ol>
        <p className={styles.hint}>{t('jettyTimelineDisclaimer')}</p>
      </section>
    </div>
  </main>
}
