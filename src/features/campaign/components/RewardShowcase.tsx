import { Section } from '../../../shared/ui/Section';
import { ACTIVE_REWARDS, PENDING_REWARDS } from '../model/config';
import type { Locale, Reward } from '../model/types';
import { translate } from '../model/translations';
import styles from './RewardShowcase.module.css';

function RewardGroup({ locale, rewards, pending }: { locale: Locale; rewards: Reward[]; pending: boolean }) {
  const t = (key: string) => translate(locale, key);
  return (
    <div>
      <div className={styles.groupHeader}>
        <h3>{pending ? (locale === 'vi' ? 'Giải đặc biệt' : 'ລາງວັນພິເສດ') : (locale === 'vi' ? 'Quyền lợi lượt quay UAT' : 'ສິດໃນການໝູນ UAT')}</h3>
        <span className={`${styles.status} ${pending ? styles.pendingStatus : ''}`}>{t(pending ? 'rewards.pending' : 'rewards.active')}</span>
      </div>
      <div className={styles.grid}>
        {rewards.map((reward) => (
          <article className={`${styles.card} ${pending ? styles.pending : ''}`} key={reward.id}>
            <strong>{locale === 'vi' ? reward.nameVi : reward.nameLo}</strong>
            <span>{pending ? t('rewards.pending') : t('rewards.active')}</span>
          </article>
        ))}
      </div>
    </div>
  );
}

export function RewardShowcase({ locale }: { locale: Locale }) {
  const t = (key: string) => translate(locale, key);
  return (
    <Section id="rewards" tone="surface" eyebrow={t('rewards.eyebrow')} title={t('rewards.title')} description={t('rewards.description')}>
      <div className={styles.groups}>
        <RewardGroup locale={locale} rewards={ACTIVE_REWARDS} pending={false} />
        <RewardGroup locale={locale} rewards={PENDING_REWARDS} pending />
      </div>
    </Section>
  );
}
