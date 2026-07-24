import { Section } from '../../../shared/ui/Section';
import { REWARDS } from '../model/config';
import type { Locale } from '../model/types';
import { translate } from '../model/translations';

export function RewardShowcase({ locale }: { locale: Locale }) {
  const t = (key: string) => translate(locale, key);
  return (
    <Section id="rewards" tone="surface" eyebrow={t('rewards.eyebrow')} title={t('rewards.title')} description={t('rewards.description')}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem', marginTop: '1.5rem' }}>
        {REWARDS.map((reward) => (
          <article
            key={reward.id}
            style={{
              background: '#062B24',
              border: '1px solid rgba(240, 180, 41, 0.3)',
              borderRadius: '12px',
              padding: '1.2rem',
              color: '#FFF',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <span style={{ background: '#10B981', color: '#FFF', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, display: 'inline-block', marginBottom: '0.6rem' }}>
                100% TRÚNG QUÀ
              </span>
              <h4 style={{ color: '#F0B429', fontSize: '1.1rem', margin: '0 0 0.4rem' }}>
                {locale === 'lo' ? reward.nameLo : reward.nameVi}
              </h4>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', margin: 0 }}>
                {locale === 'lo' ? reward.conditionLo : reward.conditionVi}
              </p>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
