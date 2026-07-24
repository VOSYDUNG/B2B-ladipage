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
  saving?: boolean;
  onSelectTier: (tierId: string) => void;
  onAcknowledge: (value: boolean) => void;
  onUnlockWheel: () => void;
  onBack?: () => void;
}

export function ProgramStep(props: ProgramStepProps) {
  const { locale, selectedTierId, acknowledged, saving, onSelectTier, onAcknowledge, onUnlockWheel } = props;
  const t = (key: string) => translate(locale, key);
  const canContinue = Boolean(acknowledged && !saving);
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
        </div>
      </div>

      {/* Referral CTA Banner */}
      <div className="program-referral-cta-banner" style={{ background: '#062B24', border: '1px solid #10B981', borderRadius: '8px', padding: '1rem', margin: '1rem 0', color: '#FFF' }}>
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          <div style={{ fontSize: '1.8rem' }}>🤝</div>
          <div>
            <h4 style={{ color: '#F0B429', margin: '0 0 0.2rem' }}>
              {locale === 'lo' ? '🔥 ຮັບໂບນັດ 5% ເມື່ອແນະນຳເພື່ອນ' : '🔥 THƯỞNG GIỚI THIỆU 5%'}
            </h4>
            <p style={{ fontSize: '0.85rem', margin: 0, color: 'rgba(255,255,255,0.8)' }}>
              {locale === 'lo'
                ? 'ຮັບ 5% ຂອງບິນທຳອິດເມື່ອເພື່ອນຮ່ວມງານໃຊ້ລະຫັດຂອງທ່ານ.'
                : 'Mở rộng mạng lưới đối tác — nhận ngay 5% giá trị đơn đầu tiên của đồng nghiệp khi họ dùng mã giới thiệu của bạn.'}
            </p>
          </div>
        </div>
      </div>

      <label className={`${shared.checkbox} ${styles.ack}`}>
        <input type="checkbox" checked={acknowledged} onChange={(event: ChangeEvent<HTMLInputElement>) => onAcknowledge(event.target.checked)} />
        <span>{t('program.ack')}</span>
      </label>

      <div className={shared.actions}>
        <Button type="button" disabled={!canContinue} onClick={onUnlockWheel}>
          {saving ? '…' : (locale === 'lo' ? 'ເປີດວົງລໍ້' : 'MỞ KHÓA VÒNG QUAY')}
        </Button>
      </div>
    </div>
  );
}
