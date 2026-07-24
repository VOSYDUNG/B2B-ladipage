import { useMemo, useState, type CSSProperties } from 'react';
import { Button } from '../../../shared/ui/Button';
import { PRODUCTS, REWARDS } from '../model/config';
import { chooseSampleProduct, chooseWeightedReward } from '../model/math';
import type { Locale, SpinResult } from '../model/types';
import { translate } from '../model/translations';
import shared from './FlowShared.module.css';
import styles from './WheelStep.module.css';

interface WheelStepProps {
  locale: Locale;
  spin: SpinResult | null;
  saving: boolean;
  onBack: () => void;
  onSaveSpin: (spin: SpinResult) => Promise<void>;
  onContinue: () => void;
}

export function WheelStep({ locale, spin, saving, onBack, onSaveSpin, onContinue }: WheelStepProps) {
  const t = (key: string) => translate(locale, key);
  const [rotation, setRotation] = useState(spin ? 1800 : 0);
  const [spinning, setSpinning] = useState(false);
  const reward = useMemo(() => REWARDS.find((item) => item.id === spin?.rewardId), [spin]);
  const sampleProduct = useMemo(() => PRODUCTS.find((item) => item.id === spin?.sampleProductId), [spin]);

  const startSpin = () => {
    if (spinning || spin) return;
    const selected = chooseWeightedReward(REWARDS);
    const sampleProductId = selected.id === 'sample-product' ? chooseSampleProduct() : undefined;
    const sectorCenter = selected.wheelIndex * 60 + 30;
    const nextRotation = rotation + 5 * 360 + (360 - sectorCenter);
    setSpinning(true);
    setRotation(nextRotation);
    window.setTimeout(() => {
      void onSaveSpin({ rewardId: selected.id, sampleProductId, createdAt: new Date().toISOString() }).finally(() => setSpinning(false));
    }, 4300);
  };

  return (
    <div>
      <header className={shared.header}>
        <h2>{t('wheel.title')}</h2>
        <p>{t('wheel.description')}</p>
      </header>
      <div className={styles.layout}>
        <div className={styles.wheelStage}>
          <div className={styles.pointer} aria-hidden="true" />
          <div className={styles.wheel} style={{ '--rotation': `${rotation}deg` } as CSSProperties} aria-label={t('wheel.title')}>
            {REWARDS.map((item, index) => (
              <span
                key={item.id}
                className={`${styles.segmentLabel} ${item.status === 'pending' ? styles.pending : ''}`}
                style={{ transform: `rotate(${index * 60 + 30}deg) translateX(8%)` }}
              >
                {locale === 'vi' ? item.shortVi : item.shortLo}
              </span>
            ))}
          </div>
        </div>
        <div className={styles.panel}>
          {spin && reward ? (
            <div className={styles.result} aria-live="polite">
              <span>{t('wheel.result')}</span>
              <strong>{locale === 'vi' ? reward.nameVi : reward.nameLo}{sampleProduct ? ` — ${sampleProduct.name}` : ''}</strong>
            </div>
          ) : (
            <Button type="button" fullWidth disabled={spinning || saving} onClick={startSpin}>
              {spinning ? t('wheel.spinning') : t('wheel.spin')}
            </Button>
          )}
          <p className={styles.disclaimer}>{locale === 'vi' ? 'Ba giải đặc biệt trên vòng quay đang ở trạng thái chờ kích hoạt và không được phân bổ trong cấu hình UAT hiện tại.' : '3 ລາງວັນພິເສດຢູ່ໃນສະຖານະລໍຖ້າ ແລະ ບໍ່ຖືກແຈກໃນ UAT.'}</p>
          {spin && <Button type="button" fullWidth onClick={onContinue}>{locale === 'vi' ? 'TIẾP TỤC TẠO ĐƠN NHÁP' : 'ຕໍ່ໄປສ້າງບິນຮ່າງ'}</Button>}
        </div>
      </div>
      <div className={shared.actions}>
        <Button type="button" variant="ghost" onClick={onBack}>{t('common.back')}</Button>
      </div>
    </div>
  );
}
