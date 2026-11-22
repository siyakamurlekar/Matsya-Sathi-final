import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { login as loginApi } from '../../services/authApi'
import styles from './Auth.module.css'
import { useTranslation } from 'react-i18next'

export default function LoginPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { selectedRole, login, user } = useAuthStore()

  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (user) {
    return <Navigate to={user.role === 'fisherman' ? '/fisherman' : '/family'} replace />
  }

  if (!selectedRole) {
    return <Navigate to="/role" replace />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!/^[6-9]\d{9}$/.test(phone)) return
    setError('')

    try {
      const result = await loginApi({ phone, password, role: selectedRole })
      localStorage.setItem('matsya-api-token', result.token)
      login({
        name: result.user.name,
        phone: result.user.phone,
        role: result.user.role,
      })
      navigate(result.user.role === 'fisherman' ? '/fisherman' : '/family', { replace: true })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to sign in')
    }
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

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            autoComplete="current-password"
            required
          />
          {error && <p role="alert" className={styles.note}>{error}</p>}

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