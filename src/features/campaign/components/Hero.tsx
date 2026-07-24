import { Button } from '../../../shared/ui/Button';
import type { Locale } from '../model/types';
import { translate } from '../model/translations';
import styles from './Hero.module.css';

interface HeroProps {
  locale: Locale;
  onStart: () => void;
}

export function Hero({ locale, onStart }: HeroProps) {
  const t = (key: string) => translate(locale, key);
  const scrollToPolicy = () => document.getElementById('policy')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section id="top" className={styles.hero} aria-labelledby="hero-title">
      <picture className={styles.media} aria-hidden="true">
        <source media="(max-width: 767px)" srcSet="/images/visual_mobile.webp" type="image/webp" />
        <source media="(max-width: 767px)" srcSet="/images/visual_mobile.png" />
        <source srcSet="/images/visual_desktop.webp" type="image/webp" />
        <img src="/images/visual_desktop.png" alt="" width="1672" height="941" fetchPriority="high" />
      </picture>
      <div className={styles.overlay} />
      <div className={`container ${styles.inner}`}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>{t('hero.eyebrow')}</p>
          <h1 id="hero-title" className={styles.title}>
            <span>{t('hero.title.1')}</span>
            <strong>{t('hero.title.2')}</strong>
            <span>{t('hero.title.3')}</span>
          </h1>
          <p className={styles.description}>{t('hero.description')}</p>
          <div className={styles.actions}>
            <Button type="button" onClick={onStart}>{t('hero.cta')}</Button>
            <Button type="button" variant="secondary" onClick={scrollToPolicy}>{t('hero.secondary')}</Button>
          </div>
          <p className={styles.microcopy}>
            {locale === 'vi'
              ? 'Quà tặng và quyền lợi được NNC xác nhận theo điều kiện chương trình.'
              : 'ຂອງຂວັນ ແລະ ສິດປະໂຫຍດຢືນຢັນຕາມເງື່ອນໄຂໂຄງການ.'}
          </p>
        </div>
      </div>
    </section>
  );
}
