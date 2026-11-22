import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTripStore, type TripStatus } from '../../store/tripStore'
import styles from './Trip.module.css'
import { useEffect } from 'react'

const steps: { status: TripStatus; label: string; detail: string }[] = [
  { status: 'CHECK_IN', label: 'tripCheckIn', detail: 'tripCheckInDesc' },
  { status: 'TRIP_ACTIVE', label: 'tripDepart', detail: 'tripDepartDesc' },
  { status: 'CONNECTIVITY_WEAK', label: 'tripWeak', detail: 'tripWeakDesc' },
  { status: 'LORA_RELAY', label: 'tripRelay', detail: 'tripRelayDesc' },
]
export default function TripPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { status, setStatus, resetDemo, loadCurrent, loading, error, battery, lastLocation } = useTripStore()
  useEffect(() => { void loadCurrent() }, [loadCurrent])
  const index = steps.findIndex((s) => s.status === status)
  const next = status === 'IDLE' || status === 'SAFE_RETURN' ? steps[0] : steps[index + 1]
  const isEmergency = status === 'SOS_SENT' || status === 'EMERGENCY_ACTIVE'
  return <main className={styles.page}><div className={styles.wrap}>
    <div className={styles.top}><button className={styles.back} onClick={() => navigate('/fisherman')}>← {t('back')}</button><span className={styles.eyebrow}>{t('tripDemo')}</span></div>
    <h1 className={styles.title}>{t('tripTitle')}</h1><p className={styles.lead}>{t('tripIntro')}</p>
    <section className={styles.banner}><span className={styles.pill}>{t('tripCurrent')}</span><h2>{t('tripStatus_' + status)}</h2><p>{t('tripSimulation')}</p></section>
    <div className={styles.grid}><article className={styles.card}><small>{t('tripLocation')}</small><strong>{status === 'IDLE' ? t('tripUnavailable') : lastLocation}</strong></article><article className={styles.card}><small>{t('tripConnection')}</small><strong>{status === 'LORA_RELAY' ? 'LoRa · Demo' : status === 'CONNECTIVITY_WEAK' ? 'GSM weak · Demo' : status === 'IDLE' ? t('tripOffline') : 'GSM · Demo'}</strong></article><article className={styles.card}><small>{t('tripBattery')}</small><strong>{battery}% · Demo</strong></article></div>
    <div className={styles.notice}>{t('tripSafetyNotice')}</div>
    {error && <div role="alert" className={styles.notice + ' ' + styles.dangerBox}>{error}</div>}
    <div className={styles.actions}>
      {next && !isEmergency && <button className={styles.btn} disabled={loading} onClick={() => void setStatus(next.status)}>{loading ? 'Updating…' : `${t(next.label)} →`}</button>}
      {status !== 'IDLE' && status !== 'SAFE_RETURN' && !isEmergency && <button className={styles.btn + ' ' + styles.danger} onClick={() => navigate('/sos')}>🆘 {t('tripSOS')}</button>}
      {isEmergency && <button className={styles.btn} onClick={() => setStatus('SAFE_RETURN')}>{t('tripSafeReturn')}</button>}
      {status !== 'IDLE' && status !== 'SAFE_RETURN' && !isEmergency && <button className={styles.btn + ' ' + styles.secondary} onClick={() => setStatus('SAFE_RETURN')}>{t('tripSafeReturn')}</button>}
      <button className={styles.btn + ' ' + styles.secondary} onClick={resetDemo}>{t('tripReset')}</button>
    </div><p className={styles.foot}>{t('tripFamilySync')}</p>
  </div></main>
}
