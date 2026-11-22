import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../store/authStore'
import i18n from '../../i18n'
import styles from './Updates.module.css'
import { updateProfile } from '../../services/authApi'

const languages = [{code:'kok',label:'कोंकणी · Konkani'},{code:'en',label:'English'},{code:'mr',label:'मराठी · Marathi'},{code:'hi',label:'हिन्दी · Hindi'}]
export default function ProfilePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const login = useAuthStore((s) => s.login)
  const logout = useAuthStore((s) => s.logout)
  const [name, setName] = useState(user?.name || '')
  const [saved, setSaved] = useState(false)
  const home = user?.role === 'family' ? '/family' : user?.role === 'jetty' ? '/jetty' : '/fisherman'
  const notificationsPath = user?.role === 'family'
    ? '/family/notifications'
    : user?.role === 'jetty'
      ? '/jetty/notifications'
      : '/fisherman/notifications'
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user || !name.trim()) return
    try {
      const result = await updateProfile({ name: name.trim() })
      login({ ...user, name: result.user.name })
      setSaved(true)
    } catch (error) {
      console.error(error)
    }
  }
  const switchLanguage = (code: string) => { localStorage.setItem('matsya-language',code); void i18n.changeLanguage(code) }
  return <main className={styles.page}><div className={styles.wrap}>
    <div className={styles.top}><button className={styles.back} onClick={() => navigate(home)}>← {t('back')}</button><span className={styles.eyebrow}>{t('profileEyebrow')}</span></div>
    <h1 className={styles.title}>⚙️ {t('profileSettings')}</h1><p className={styles.lead}>{t('profileIntro')}</p>
    <div className={styles.grid}><section className={styles.card}><h2>{t('profileAccount')}</h2>
      <span className={styles.tag}>{t(user?.role === 'family' ? 'family' : user?.role === 'jetty' ? 'jettyRole' : 'fisherman')}</span>
      <form onSubmit={save}><div className={styles.field}><label htmlFor="profile-name">{t('fullName')}</label><input id="profile-name" value={name} onChange={(e) => {setName(e.target.value);setSaved(false)}} required minLength={2}/></div>
      <div className={styles.field}><label htmlFor="profile-phone">{t('phoneLabel')}</label><input id="profile-phone" value={user?.phone || ''} readOnly /></div>
      <button className={styles.button} type="submit">{t('profileSave')}</button>{saved && <p role="status" className={styles.empty}>{t('profileSaved')}</p>}</form>
    </section><section className={styles.card}><h2>{t('profileLanguage')}</h2><p className={styles.empty}>{t('profileLanguageHelp')}</p>
      <div className={styles.field}><label htmlFor="profile-language">{t('chooseLanguage')}</label><select id="profile-language" value={i18n.resolvedLanguage || i18n.language} onChange={(e) => switchLanguage(e.target.value)}>{languages.map((l) => <option value={l.code} key={l.code}>{l.label}</option>)}</select></div>
      <div className={styles.divider}/><h2>{t('profileQuickLinks')}</h2><div className={styles.actions}><button className={`${styles.button} ${styles.secondary}`} onClick={() => navigate(notificationsPath)}>🔔 {t('updatesTitle')}</button><button className={`${styles.button} ${styles.secondary}`} onClick={() => navigate(home)}>{t('home')}</button></div>
    </section></div>
    <div className={styles.note}>{t('profileDemoNote')}</div>
    <div className={styles.actions}><button className={`${styles.button} ${styles.secondary}`} onClick={() => {logout();navigate('/role',{replace:true})}}>{t('logout')}</button></div>
  </div></main>
}
