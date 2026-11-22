import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import styles from './SeaConditionsPage.module.css'
import { useEffect, useState } from 'react'
import { getSeaConditions, refreshSeaConditions, type SeaData } from '../../services/dataApi'
import { useAuthStore } from '../../store/authStore'

export default function SeaConditionsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const role = useAuthStore((state) => state.user?.role)
  const dashboardPath = role === 'jetty' ? '/jetty' : '/fisherman'
  const [sea, setSea] = useState<SeaData | null>(null)
  useEffect(() => {
    void getSeaConditions().then(setSea).catch((error) => console.error(error))
  }, [])
  const refresh = async () => {
    try {
      await refreshSeaConditions()
      setSea(await getSeaConditions())
    } catch (error) {
      console.error(error)
    }
  }
  const reading = sea?.reading
  const readings = [
    { icon: '💨', label: t('seaWind'), value: reading ? String(reading.windSpeedKph) : 'Unavailable', unit: 'km/h', detail: t('seaWindDetail') },
    { icon: '🌊', label: t('seaWaves'), value: reading ? String(reading.waveHeightM) : 'Unavailable', unit: 'm', detail: t('seaWavesDetail') },
    { icon: '👁️', label: t('seaVisibility'), value: reading ? String(reading.visibilityKm) : 'Unavailable', unit: 'km', detail: t('seaVisibilityDetail') },
    { icon: '🌤️', label: t('seaSky'), value: reading?.sky || t('seaPartlyCloudy'), unit: '', detail: t('seaSkyDetail') },
  ]
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.topbar}>
          <button className={styles.back} onClick={() => navigate(dashboardPath)} aria-label={t('back')}>← <span>{t('back')}</span></button>
          <span className={styles.brand}>{t('brand')}</span>
          <span className={styles.demo}>{sea?.provenance === 'provider' ? 'Verified provider' : sea?.provenance === 'demo' ? t('seaDemoTag') : 'Unavailable'}</span>
        </header>
        <div className={styles.intro}>
          <span className={styles.eyebrow}>{t('seaEyebrow')}</span>
          <h1>{t('seaPageTitle')}</h1>
          <p>{t('seaPageSubtitle')}</p>
        </div>
        <section className={styles.hero} aria-label={t('seaAdvisoryTitle')}>
          <div className={styles.heroCopy}>
            <span className={styles.heroTag}>◉ {t('seaIllustrative')}</span>
            <h2>{t('seaAdvisoryTitle')}</h2>
            <p>{reading?.advisory || t('seaAdvisoryBody')}</p>
            <span className={styles.heroFoot}>{sea?.stale ? 'Stale data — refresh when available' : reading?.observedAt ? `Last updated ${new Date(reading.observedAt).toLocaleString()}` : t('seaNoLiveData')}</span>
          </div>
          <span className={styles.heroSymbol} aria-hidden="true">🌊</span>
        </section>
        <section className={styles.section}>
          <div className={styles.sectionTitle}><h2>{t('seaAtGlance')}</h2><span>{t('seaSampleValues')}</span></div>
          <div className={styles.grid}>
            {readings.map((item) => (
              <article className={styles.card} key={item.label}>
                <span className={styles.icon} aria-hidden="true">{item.icon}</span>
                <p className={styles.cardLabel}>{item.label}</p>
                <strong className={styles.value}>{item.value} <small>{item.unit}</small></strong>
                <p className={styles.detail}>{item.detail}</p>
              </article>
            ))}
          </div>
        </section>
        <section className={styles.notice}>
          <span className={styles.noticeIcon} aria-hidden="true">⚠️</span>
          <div><h2>{t('seaSafetyTitle')}</h2><p>{t('seaSafetyBody')}</p></div>
        </section>
        <div className={styles.actions}>
          <button className={styles.secondary} onClick={() => navigate(dashboardPath)}>← {t('seaBackDashboard')}</button>
          <button className={styles.secondary} onClick={() => void refresh()}>Refresh sea data</button>
          {role === 'fisherman' && (
            <button className={styles.primary} onClick={() => navigate('/fisherman/trip')}>{t('seaPlanTrip')} →</button>
          )}
        </div>
        <p className={styles.disclaimer}>{t('seaDisclaimer')}</p>
      </div>
    </main>
  )
}
