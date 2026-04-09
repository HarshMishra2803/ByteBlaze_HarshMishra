'use client';

import styles from './LanguageToggle.module.css';

export default function LanguageToggle({ language, onChange }) {
  return (
    <div className={styles.toggle} id="language-toggle">
      <button
        className={`${styles.option} ${language === 'en' ? styles.active : ''}`}
        onClick={() => onChange('en')}
        id="lang-en"
      >
        🇬🇧 EN
      </button>
      <button
        className={`${styles.option} ${language === 'hi' ? styles.active : ''}`}
        onClick={() => onChange('hi')}
        id="lang-hi"
      >
        🇮🇳 HI
      </button>
    </div>
  );
}
