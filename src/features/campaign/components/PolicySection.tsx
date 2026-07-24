import { useMemo, useState, type ChangeEvent } from 'react';
import { Section } from '../../../shared/ui/Section';
import { TIERS } from '../model/config';
import { formatKip, getNextTier, getTierForRevenue } from '../model/math';
import type { Locale } from '../model/types';
import { translate } from '../model/translations';
import styles from './PolicySection.module.css';

export function PolicySection({ locale }: { locale: Locale }) {
  const t = (key: string) => translate(locale, key);
  const [revenue, setRevenue] = useState(6_000_000);
  const tier = useMemo(() => getTierForRevenue(revenue), [revenue]);
  const nextTier = useMemo(() => getNextTier(revenue), [revenue]);
  const direct = revenue * 0.05;
  const quarter = tier ? revenue * (tier.quarterRewardPercent / 100) : 0;

  const formatRange = (min: number, max: number | null) => {
    const minimum = `${new Intl.NumberFormat('vi-VN').format(min / 1_000_000)}M`;
    return max ? `${minimum} – <${new Intl.NumberFormat('vi-VN').format(max / 1_000_000)}M KIP` : `≥ ${minimum} KIP`;
  };

  return (
    <Section
      id="policy"
      tone="soft"
      eyebrow={t('policy.eyebrow')}
      title={t('policy.title')}
      description={t('policy.description')}
    >
      <div className={styles.layout}>
        <div>
          <div className={styles.tiers}>
            {TIERS.map((item) => (
              <article className={styles.tier} key={item.id}>
                <div className={styles.tierHeader}>
                  <h3>{locale === 'vi' ? item.nameVi : item.nameLo}</h3>
                  <span className={styles.percent}>{item.totalBenefitPercent}%</span>
                </div>
                <p className={styles.range}>{formatRange(item.minRevenueKip, item.maxRevenueKip)}</p>
                <div className={styles.split}>
                  <span className={styles.chip}>5% {locale === 'vi' ? 'ngay' : 'ທັນທີ'}</span>
                  <span className={styles.chip}>+{item.quarterRewardPercent}% {locale === 'vi' ? 'cuối quý' : 'ທ້າຍໄຕມາດ'}</span>
                </div>
              </article>
            ))}
          </div>
          <p className={styles.note}>{t('policy.note')}</p>
        </div>

        <aside className={styles.calculator} aria-label={t('policy.calculator')}>
          <h3>{t('policy.calculator')}</h3>
          <div className={styles.labelRow}>
            <span>{t('policy.revenue')}</span>
            <strong>{formatKip(revenue, locale)}</strong>
          </div>
          <input
            className={styles.rangeInput}
            type="range"
            min="0"
            max="40000000"
            step="500000"
            value={revenue}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setRevenue(Number(event.target.value))}
          />
          <div className={styles.summary}>
            <div><span>{locale === 'vi' ? 'Bậc hiện tại' : 'ຂັ້ນປັດຈຸບັນ'}</span><strong>{tier ? (locale === 'vi' ? tier.nameVi : tier.nameLo) : '—'}</strong></div>
            <div><span>{locale === 'vi' ? 'Giảm ngay' : 'ຫຼຸດທັນທີ'}</span><strong>{formatKip(direct, locale)}</strong></div>
            <div><span>{locale === 'vi' ? 'Ước tính cuối quý' : 'ຄາດຄະເນທ້າຍໄຕມາດ'}</span><strong>{formatKip(quarter, locale)}</strong></div>
            <div><span>{locale === 'vi' ? 'Bậc kế tiếp' : 'ຂັ້ນຕໍ່ໄປ'}</span><strong>{nextTier ? formatKip(nextTier.minRevenueKip - revenue, locale) : 'MAX'}</strong></div>
          </div>
          <button className={styles.policyLink} type="button" onClick={() => window.open('/images/page-1.png', '_blank', 'noopener,noreferrer')}>
            {t('policy.view')}
          </button>
        </aside>
      </div>
    </Section>
  );
}
