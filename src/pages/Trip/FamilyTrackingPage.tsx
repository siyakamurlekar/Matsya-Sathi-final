import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTripStore } from '../../store/tripStore'
import styles from './Trip.module.css'
export default function FamilyTrackingPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { status, battery, lastLocation, lastUpdate } = useTripStore()
  const emergency = status === 'SOS_SENT' || status === 'EMERGENCY_ACTIVE'
  return <main className={styles.page}><div className={styles.wrap}>
    <button className={styles.back} onClick={() => navigate('/family')}>← {t('back')}</button>
    <h1 className={styles.title}>{t('tripFamilyTitle')}</h1><p className={styles.lead}>{t('tripFamilyIntro')}</p>
    {emergency && <div role="alert" className={styles.notice + ' ' + styles.dangerBox}>🆘 {t('tripEmergencyBanner')}</div>}
    <section className={styles.banner}><span className={styles.pill}>{t('tripDemo')}</span><h2>{t('tripStatus_' + status)}</h2><p>{t('tripFamilySync')}</p></section>
    <div className={styles.grid}><article className={styles.card}><small>{t('tripLocation')}</small><strong>{status === 'IDLE' ? t('tripUnavailable') : lastLocation}</strong></article><article className={styles.card}><small>{t('tripBattery')}</small><strong>{battery}% · Demo</strong></article><article className={styles.card}><small>{t('tripLastUpdate')}</small><strong>{lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : t('tripUnavailable')}</strong></article></div>
    <div className={styles.notice}>{t('tripSafetyNotice')}</div>
    <button className={styles.btn + ' ' + styles.secondary} onClick={() => navigate('/family')}>{t('back')}</button>
  </div></main>
}
