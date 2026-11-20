import styles from './SplashPage.module.css'

export default function SplashPage() {
  return (
    <main className={styles.splash}>
      <div className={styles.content}>

        <p className={styles.eyebrow}>
          YOUR COMPANION AT SEA
        </p>

        <h1 className={styles.title}>
          Matsya Sathi
        </h1>

        <p className={styles.tagline}>
          Your Safety, Our Priority
        </p>

        <button
          className={styles.continueButton}
          type="button"
        >
          Get Started
        </button>

      </div>
    </main>
  )
}