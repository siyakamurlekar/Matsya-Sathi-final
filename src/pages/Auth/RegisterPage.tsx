import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import styles from './Auth.module.css'
import { useTranslation } from 'react-i18next'
import { register as registerApi } from '../../services/authApi'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { selectedRole, login, user } = useAuthStore()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [village, setVillage] = useState('')
  const [boatName, setBoatName] = useState('')
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

    if (!name.trim() || !/^[6-9]\d{9}$/.test(phone) || !village.trim()) return
    setError('')

    try {
      const result = await registerApi({
        name: name.trim(),
        phone,
        password,
        role: selectedRole,
        village: village.trim(),
        boatName: boatName.trim(),
      })
      localStorage.setItem('matsya-api-token', result.token)
      login({
        name: result.user.name,
        phone: result.user.phone,
        role: result.user.role,
      })
      navigate(result.user.role === 'fisherman' ? '/fisherman' : '/family', { replace: true })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to create account')
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.brand}>{t('brand')}</div>
        <p className={styles.eyebrow}>{t('joinCommunity')}</p>

        <h1>{t('getStarted')}</h1>
        <p className={styles.description}>
          {t('registerDescription', { role: t(selectedRole === 'fisherman' ? 'fishermanRole' : 'familyRole') })}
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label htmlFor="name">{t('fullName')}</label>
          <input
            id="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t('fullNameHint')}
            minLength={2}
            required
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

          <label htmlFor="village">{t('village')}</label>
          <input
            id="village"
            value={village}
            onChange={(event) => setVillage(event.target.value)}
            placeholder={t('villageHint')}
            required
          />

          {selectedRole === 'fisherman' && (
            <>
              <label htmlFor="boat">{t('boatName')}</label>
              <input
                id="boat"
                value={boatName}
                onChange={(event) => setBoatName(event.target.value)}
                placeholder={t('boatHint')}
              />
            </>
          )}

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
            required
          />
          {error && <p role="alert" className={styles.note}>{error}</p>}

          <p className={styles.note}>
            {t('localProfileNote')}
          </p>

          <button type="submit" className={styles.primary}>
            {t('createProfile')}
          </button>
        </form>

        <p className={styles.bottom}>
          {t('alreadyAccount')} <Link to="/login">{t('signIn')}</Link>
        </p>
      </section>
    </main>
  )
}