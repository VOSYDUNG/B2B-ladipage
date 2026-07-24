import type { Locale } from '../model/types';
import { translate } from '../model/translations';
import styles from './Header.module.css';

interface HeaderProps {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  onOpenWhatsApp: () => void;
}

export function Header({ locale, onLocaleChange, onOpenWhatsApp }: HeaderProps) {
  const t = (key: string) => translate(locale, key);
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <a href="#top" className={styles.brand} aria-label="NNC Pharma">
          <img className={styles.logo} src="/images/nnc-logo-160.webp" alt="" width="36" height="36" />
          <span className={styles.brandText}>
            <strong>NNC PHARMA</strong>
            <span>B2B · Q3 2026 · LAOS</span>
          </span>
        </a>

        <nav className={styles.nav} aria-label="Primary navigation">
          <a href="#products">{t('nav.products')}</a>
          <a href="#policy">{t('nav.policy')}</a>
          <a href="#rewards">{t('nav.rewards')}</a>
        </nav>

        <div className={styles.actions}>
          <div className={styles.languages} aria-label="Language">
            <button className={locale === 'vi' ? styles.active : ''} type="button" onClick={() => onLocaleChange('vi')}>VI</button>
            <button className={locale === 'lo' ? styles.active : ''} type="button" onClick={() => onLocaleChange('lo')}>ລາວ</button>
          </div>
          <button type="button" className={styles.whatsapp} onClick={onOpenWhatsApp}>WhatsApp</button>
        </div>
      </div>
    </header>
  );
}
