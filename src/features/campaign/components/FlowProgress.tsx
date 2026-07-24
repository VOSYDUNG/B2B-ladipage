import type { CampaignStep, Locale } from '../model/types';
import { translate } from '../model/translations';
import styles from './FlowProgress.module.css';

const steps: Array<{ id: Exclude<CampaignStep, 'browse'>; key: string }> = [
  { id: 'register', key: 'flow.register' },
  { id: 'policy', key: 'flow.policy' },
  { id: 'spin', key: 'flow.spin' },
  { id: 'cart', key: 'flow.cart' },
  { id: 'complete', key: 'flow.complete' },
];

export function FlowProgress({ step, locale }: { step: CampaignStep; locale: Locale }) {
  const activeIndex = Math.max(0, steps.findIndex((item) => item.id === step));
  return (
    <ol className={styles.progress} aria-label="Campaign progress">
      {steps.map((item, index) => (
        <li className={`${styles.item} ${index === activeIndex ? styles.active : ''} ${index < activeIndex ? styles.done : ''}`} key={item.id}>
          <span className={styles.number}>{index < activeIndex ? '✓' : index + 1}</span>
          <span className={styles.label}>{translate(locale, item.key)}</span>
        </li>
      ))}
    </ol>
  );
}
