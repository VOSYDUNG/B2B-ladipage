import type { ChangeEvent } from 'react';
import { Button } from '../../../shared/ui/Button';
import { TIERS } from '../model/config';
import { formatKip } from '../model/math';
import type { Locale } from '../model/types';
import { translate } from '../model/translations';
import shared from './FlowShared.module.css';
import styles from './ProgramStep.module.css';

interface ProgramStepProps {
  locale: Locale;
  selectedTierId: string | null;
  acknowledged: boolean;
  saving: boolean;
  onSelectTier: (tierId: string) => void;
  onAcknowledge: (value: boolean) => void;
  onBack: () => void;
  onContinue: () => Promise<void>;
}

export function ProgramStep(props: ProgramStepProps) {
  const { locale, selectedTierId, acknowledged, saving, onSelectTier, onAcknowledge, onBack, onContinue } = props;
  const t = (key: string) => translate(locale, key);
  const canContinue = Boolean(selectedTierId && acknowledged && !saving);
  const formatRange = (min: number, max: number | null) => max
    ? `${formatKip(min, locale)} – <${formatKip(max, locale)}`
    : `≥ ${formatKip(min, locale)}`;

  return (
    <div>
      <header className={shared.header}>
        <h2>{t('program.title')}</h2>
        <p>{t('program.description')}</p>
      </header>

      <div className={styles.grid}>
        {TIERS.map((tier) => (
          <button
            type="button"
            className={`${styles.tier} ${selectedTierId === tier.id ? styles.active : ''}`}
            key={tier.id}
            onClick={() => onSelectTier(tier.id)}
            aria-pressed={selectedTierId === tier.id}
          >
            <span className={styles.name}>{locale === 'vi' ? tier.nameVi : tier.nameLo}</span>
            <span className={styles.range}>{formatRange(tier.minRevenueKip, tier.maxRevenueKip)}</span>
            <span className={styles.total}>{tier.totalBenefitPercent}%</span>
          </button>
        ))}
      </div>

      <div className={styles.preview}>
        <img src="/images/page-1.png" alt={locale === 'vi' ? 'Bản chính sách Q3/2026' : 'ນະໂຍບາຍ Q3/2026'} loading="lazy" />
        <div className={styles.previewText}>
          <strong>{locale === 'vi' ? 'Nguyên tắc cần xác nhận' : 'ຫຼັກການທີ່ຕ້ອງຢືນຢັນ'}</strong>
          <p>{locale === 'vi' ? 'Doanh số của 7 sản phẩm được cộng chung. Giảm ngay 5% trên hóa đơn đủ điều kiện; thưởng cuối quý từ 2% đến 5%. Không áp dụng đồng thời chương trình 30+1.' : 'ຍອດຂາຍ 7 ຜະລິດຕະພັນນັບຮວມ. ຫຼຸດທັນທີ 5% ແລະ ໂບນັດທ້າຍໄຕມາດ 2%–5%. ບໍ່ໃຊ້ຮ່ວມກັບ 30+1.'}</p>
          <button type="button" onClick={() => window.open('/images/page-1.png', '_blank', 'noopener,noreferrer')}>
            {t('policy.view')} ↗
          </button>
        </div>
      </div>

      <label className={`${shared.checkbox} ${styles.ack}`}>
        <input type="checkbox" checked={acknowledged} onChange={(event: ChangeEvent<HTMLInputElement>) => onAcknowledge(event.target.checked)} />
        <span>{t('program.ack')}</span>
      </label>

      <div className={shared.actions}>
        <Button type="button" variant="ghost" onClick={onBack}>{t('common.back')}</Button>
        <Button type="button" disabled={!canContinue} onClick={() => void onContinue()}>{saving ? '…' : t('program.unlock')}</Button>
      </div>
    </div>
  );
}
