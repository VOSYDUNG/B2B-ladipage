import { Button } from '../../../shared/ui/Button';
import { PRODUCTS, REWARDS, TIERS } from '../model/config';
import type { CampaignState, Locale } from '../model/types';
import { translate } from '../model/translations';
import styles from './CompletionStep.module.css';

interface CompletionStepProps {
  locale: Locale;
  state: CampaignState;
  onWhatsApp: () => void;
  onClose: () => void;
  onReset: () => void;
}

export function CompletionStep({ locale, state, onWhatsApp, onClose, onReset }: CompletionStepProps) {
  const t = (key: string) => translate(locale, key);
  const tier = TIERS.find((item) => item.id === state.selectedTierId);
  const reward = REWARDS.find((item) => item.id === state.spin?.rewardId);
  const sample = PRODUCTS.find((item) => item.id === state.spin?.sampleProductId);
  return (
    <div className={styles.card}>
      <div className={styles.icon}>✓</div>
      <h2>{t('complete.title')}</h2>
      <p>{t('complete.description')}</p>
      <div className={styles.summary}>
        <div><span>{locale === 'vi' ? 'Khách hàng' : 'ລູກຄ້າ'}</span><strong>{state.registration?.fullName ?? '—'}</strong></div>
        <div><span>{locale === 'vi' ? 'Cơ sở' : 'ສະຖານປະກອບການ'}</span><strong>{state.registration?.businessName ?? '—'}</strong></div>
        <div><span>{locale === 'vi' ? 'Bậc mục tiêu' : 'ຂັ້ນເປົ້າໝາຍ'}</span><strong>{tier ? (locale === 'vi' ? tier.nameVi : tier.nameLo) : '—'}</strong></div>
        <div><span>{locale === 'vi' ? 'Quyền lợi UAT' : 'ສິດ UAT'}</span><strong>{reward ? (locale === 'vi' ? reward.nameVi : reward.nameLo) : '—'}{sample ? ` — ${sample.name}` : ''}</strong></div>
      </div>
      <div className={styles.actions}>
        <Button type="button" fullWidth onClick={onWhatsApp}>{t('complete.whatsapp')}</Button>
        <Button type="button" variant="secondary" fullWidth onClick={onClose}>{t('common.close')}</Button>
        <Button type="button" variant="ghost" fullWidth onClick={onReset}>{locale === 'vi' ? 'XÓA PHIÊN UAT' : 'ລຶບ SESSION UAT'}</Button>
      </div>
    </div>
  );
}
