import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTripStore } from '../../store/tripStore'
import styles from './Trip.module.css'
export default function SOSPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { status, setStatus } = useTripStore()
  const active = status === 'SOS_SENT' || status === 'EMERGENCY_ACTIVE'
  return <main className={styles.page}><div className={styles.wrap}>
    <button className={styles.back} onClick={() => navigate('/fisherman/trip')}>← {t('back')}</button>
    <h1 className={styles.title}>🆘 {t('tripSOS')}</h1><p className={styles.lead}>{t('tripSOSIntro')}</p>
    <div role="alert" className={styles.notice + ' ' + styles.dangerBox}>{t('tripSOSDisclaimer')}</div>
    <section className={styles.banner}><span className={styles.pill}>{t('tripDemo')}</span><h2>{active ? t('tripEmergencyBanner') : t('tripSOSConfirm')}</h2><p>{t('tripSOSDescription')}</p></section>
    <div className={styles.actions}>
      {!active ? <button className={styles.btn + ' ' + styles.danger} onClick={() => setStatus('EMERGENCY_ACTIVE')}>{t('tripSendSOS')}</button> : <button className={styles.btn} disabled>{t('tripEmergencyBanner')}</button>}
      <button className={styles.btn + ' ' + styles.secondary} onClick={() => navigate('/fisherman/trip')}>{t('tripBackTrip')}</button>
    </div>
  </div></main>
}
