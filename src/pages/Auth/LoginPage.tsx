import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import styles from './Auth.module.css'
import { useTranslation } from 'react-i18next'

export default function LoginPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { selectedRole, login, user } = useAuthStore()

  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')

  if (user) {
    return <Navigate to={user.role === 'fisherman' ? '/fisherman' : '/family'} replace />
  }

  if (!selectedRole) {
    return <Navigate to="/role" replace />
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!/^[6-9]\d{9}$/.test(phone)) return
    if (!name.trim()) return

    login({
      name: name.trim(),
      phone,
      role: selectedRole,
    })

    navigate(selectedRole === 'fisherman' ? '/fisherman' : '/family', {
      replace: true,
    })
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.brand}>{t('brand')}</div>
        <p className={styles.eyebrow}>{t('welcomeBack')}</p>

        <h1>{t('welcomeAboard')}</h1>
        <p className={styles.description}>
          {t('loginDescription', { role: t(selectedRole === 'fisherman' ? 'fishermanRole' : 'familyRole') })}
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label htmlFor="name">{t('nameLabel')}</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t('enterName')}
            required
            minLength={2}
          />

          <label htmlFor="phone">{t('phoneLabel')}</label>
          <input
            id="phone"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={phone}
            onChange={(event) =>
              setPhone(event.target.value.replace(/\D/g, ''))
            }
            placeholder={t('phoneHint')}
            pattern="[6-9][0-9]{9}"
            required
          />

          <p className={styles.note}>
            {t('demoAccess')}
          </p>

          <button type="submit" className={styles.primary}>
            {t('continueDashboard')}
          </button>
        </form>

        <p className={styles.bottom}>
          {t('newHere')} <Link to="/register">{t('createAccount')}</Link>
        </p>

        <button
          className={styles.textButton}
          onClick={() => navigate('/role')}
          type="button"
        >
          ← {t('changeRole')}
        </button>
      </section>
    </main>
  )
}