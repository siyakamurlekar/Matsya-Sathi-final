import { useState } from 'react'
import styles from './LanguagePage.module.css'
import i18n from '../../i18n'
import { useTranslation } from 'react-i18next'

type LanguageCode = 'kok' | 'en' | 'mr' | 'hi'

interface LanguagePageProps {
  onContinue: (language: LanguageCode) => void
}

const languages: {
  code: LanguageCode
  name: string
  subtitle: string
}[] = [
  {
    code: 'kok',
    name: 'कोंकणी',
    subtitle: 'Konkani',
  },
  {
    code: 'en',
    name: 'English',
    subtitle: 'English',
  },
  {
    code: 'mr',
    name: 'मराठी',
    subtitle: 'Marathi',
  },
  {
    code: 'hi',
    name: 'हिन्दी',
    subtitle: 'Hindi',
  },
]

export default function LanguagePage({
  onContinue,
}: LanguagePageProps) {
  const [selectedLanguage, setSelectedLanguage] =
    useState<LanguageCode>((i18n.language as LanguageCode) || 'kok')

  const { t } = useTranslation()

  return (
    <main className={styles.page}>
      <div className={styles.container}>

        <div className={styles.brand}>
          <span className={styles.brandName}>
            {t('brand')}
          </span>
          <span className={styles.brandTagline}>
            {t('tagline')}
          </span>
        </div>

        <div className={styles.heading}>
          <span className={styles.step}>
            {t('step1')}
          </span>

          <h1>{t('chooseLanguage')}</h1>

          <p>
            {t('languageHint')}
          </p>
        </div>

        <div
          className={styles.languageGrid}
          role="radiogroup"
          aria-label={t('chooseLanguage')}
        >
          {languages.map((language) => (
            <button
              key={language.code}
              type="button"
              role="radio"
              aria-checked={
                selectedLanguage === language.code
              }
              className={`${styles.languageCard} ${
                selectedLanguage === language.code
                  ? styles.selected
                  : ''
              }`}
              onClick={() => {
                setSelectedLanguage(language.code)
                void i18n.changeLanguage(language.code)
                localStorage.setItem('matsya-language', language.code)
              }}
            >
              <div className={styles.languageInfo}>
                <span className={styles.languageName}>
                  {language.name}
                </span>

                <span className={styles.languageSubtitle}>
                  {language.subtitle}
                </span>
              </div>

              <span className={styles.radioIndicator}>
                {selectedLanguage === language.code
                  ? '✓'
                  : ''}
              </span>
            </button>
          ))}
        </div>

        <button
  type="button"
  className={styles.continueButton}
  onClick={() => {
    localStorage.setItem('matsya-language', selectedLanguage)
    void i18n.changeLanguage(selectedLanguage)
    onContinue(selectedLanguage)
  }}
>
  {t('continue')}
  <span aria-hidden="true">→</span>
</button>

        <p className={styles.footer}>
          {t('madeForGoa')}
        </p>

      </div>
    </main>
  )
}