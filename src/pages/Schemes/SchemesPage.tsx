import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import styles from './Schemes.module.css'
import { useAuthStore } from '../../store/authStore'

type Answer = boolean | null
type Scheme = { id: string; title: string; desc: string; office: string; requires: (a: Answer[]) => boolean }
const questions = ['schemeQGoa', 'schemeQFishing', 'schemeQBoat', 'schemeQInsurance'] as const
const schemes: Scheme[] = [
  { id: 'pmmsy', title: 'schemePMMSY', desc: 'schemePMMSYDesc', office: 'schemeGoaOffice', requires: (a) => a[1] === true && a[2] === true },
  { id: 'goa', title: 'schemeGoa', desc: 'schemeGoaDesc', office: 'schemeGoaOffice', requires: (a) => a[0] === true && a[1] === true },
  { id: 'insurance', title: 'schemeInsurance', desc: 'schemeInsuranceDesc', office: 'schemeInsOffice', requires: (a) => a[1] === true && a[3] === false },
]

export default function SchemesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const role = useAuthStore((state) => state.user?.role)
  const dashboardPath = role === 'jetty' ? '/jetty' : '/fisherman'
  const [tab, setTab] = useState<'browse' | 'quiz'>('browse')
  const [answers, setAnswers] = useState<Answer[]>([null, null, null, null])
  const [showResults, setShowResults] = useState(false)
  const complete = answers.every((a) => a !== null)
  const matches = schemes.filter((scheme) => scheme.requires(answers))
  const shown = tab === 'browse' ? schemes : showResults ? matches : []
  const choose = (index: number, answer: boolean) => {
    setAnswers((old) => old.map((item, i) => i === index ? answer : item))
    setShowResults(false)
  }
  return <main className={styles.page}><div className={styles.wrap}>
    <button type="button" className={styles.back} onClick={() => navigate(dashboardPath)}>← {t('back')}</button>
    <div className={styles.intro}><span className={styles.eyebrow}>{t('schemes')}</span><h1>{t('schemeTitle')}</h1><p>{t('schemeSubtitle')}</p></div>
    <div className={styles.tabs} role="tablist" aria-label={t('schemeTitle')}>
      <button type="button" role="tab" aria-selected={tab === 'browse'} className={tab === 'browse' ? styles.active : ''} onClick={() => setTab('browse')}>{t('schemeBrowseTab')}</button>
      <button type="button" role="tab" aria-selected={tab === 'quiz'} className={tab === 'quiz' ? styles.active : ''} onClick={() => setTab('quiz')}>{t('schemeQuizTab')}</button>
    </div>
    {tab === 'quiz' && !showResults && <section className={styles.quiz}><h2>{t('schemeQuizTitle')}</h2><p>{t('schemeQuizIntro')}</p>
      {questions.map((q, i) => <fieldset className={styles.question} key={q}><legend><span>{String(i + 1).padStart(2, '0')}</span> {t(q)}</legend><div className={styles.choices}>
        {([true, false] as const).map((value) => <button type="button" key={String(value)} aria-pressed={answers[i] === value} className={answers[i] === value ? styles.chosen : ''} onClick={() => choose(i, value)}>{t(value ? 'schemeYes' : 'schemeNo')}</button>)}
      </div></fieldset>)}
      <button type="button" className={styles.primary} disabled={!complete} onClick={() => setShowResults(true)}>{t('schemeResultsButton')} →</button>
    </section>}
    {tab === 'quiz' && showResults && <div className={styles.resultHead}><div><span className={styles.eyebrow}>{t('schemeResults')}</span><h2>{t('schemeSuggested')}</h2></div><button type="button" className={styles.back} onClick={() => setShowResults(false)}>{t('schemeEdit')}</button></div>}
    {tab === 'quiz' && showResults && matches.length === 0 && <p className={styles.empty}>{t('schemeNone')}</p>}
    {shown.length > 0 && <div className={styles.grid}>{shown.map((scheme, i) => <article className={styles.card} key={scheme.id}><span className={styles.cardNumber}>0{i + 1} / {String(shown.length).padStart(2, '0')}</span><h2>{t(scheme.title)}</h2><p>{t(scheme.desc)}</p><div className={styles.detail}><b>{t('schemeDocuments')}</b><span>{t('schemeDocList')}</span></div><div className={styles.detail}><b>{t('schemeOffice')}</b><span>{t(scheme.office)}</span></div><p className={styles.note}>{t('schemeNotApproved')}</p></article>)}</div>}
    <aside className={styles.disclaimer}><strong>ⓘ {t('schemeOfficial')}</strong><p>{t('schemeDisclaimer')} {t('schemeVerify')}</p></aside>
  </div></main>
}
