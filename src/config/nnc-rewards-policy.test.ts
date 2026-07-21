import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  appendNncWhatsAppReference,
  buildNncWhatsAppReference,
  getNncCampaignPhase,
  isValidNncPhone,
  normalizeNncProductInterests,
  NNC_ACCUMULATION_TIERS,
  NNC_CAMPAIGN_CONFIG,
  NNC_PRODUCTS,
  NNC_REWARD_RUNTIME_MODE,
  NNC_WHATSAPP_PATH,
  NNC_WHEEL_SEGMENTS,
  type NncAccumulationTier
} from './nnc-b2b-rewards';

function getExpectedTier(revenue: number): NncAccumulationTier | null {
  return [...NNC_ACCUMULATION_TIERS].reverse().find((tier) => revenue >= tier.min_revenue_kip) ?? null;
}

test('NNC campaign source-locked facts', async (t) => {
  await t.test('campaign period and WhatsApp stay locked', () => {
    assert.equal(NNC_CAMPAIGN_CONFIG.period, '01/08/2026 - 30/09/2026');
    assert.equal(NNC_CAMPAIGN_CONFIG.whatsapp.display, '020 9980 6327');
    assert.equal(NNC_CAMPAIGN_CONFIG.whatsapp.normalized, '+8562099806327');
    assert.equal(NNC_WHATSAPP_PATH, '8562099806327');
  });

  await t.test('campaign phase honors Laos start and exclusive end', () => {
    assert.equal(getNncCampaignPhase(new Date('2026-07-31T23:59:59.999+07:00')), 'upcoming');
    assert.equal(getNncCampaignPhase(new Date('2026-08-01T00:00:00+07:00')), 'active');
    assert.equal(getNncCampaignPhase(new Date('2026-09-30T23:59:59.999+07:00')), 'active');
    assert.equal(getNncCampaignPhase(new Date('2026-10-01T00:00:00+07:00')), 'ended');
  });

  await t.test('seven products and Vientiane prices match policy source', () => {
    assert.equal(NNC_PRODUCTS.length, 7);
    assert.deepEqual(
      Object.fromEntries(NNC_PRODUCTS.map((product) => [product.product_id, product.price_vientiane_kip])),
      {
        tadimax: 193000,
        'bai-thach': 69000,
        'cv-mox-1000': 71000,
        'nc-cv-mox-625': 369000,
        'cv-mox-228.5': 24000,
        'cefixad-100mg': 30000,
        azihadi: 32000
      }
    );
  });

  await t.test('corrected pack identities do not regress', () => {
    const byId = Object.fromEntries(NNC_PRODUCTS.map((product) => [product.product_id, product]));
    assert.equal(byId.tadimax.pack_size, 'Hộp 21 viên x 2 vỉ');
    assert.equal(byId['nc-cv-mox-625'].pack_size, 'Hộp 10 vỉ x 10 viên');
    assert.equal(byId['cv-mox-228.5'].pack_size, 'Chai 60ml');
    assert.equal(byId['cv-mox-228.5'].canonical_name, 'CV MOX 228.5');
    assert.equal(byId['cefixad-100mg'].pack_size, 'Chai 30ml (100mg/5ml)');
    assert.equal(byId.azihadi.formulation, 'Azithromycin 200mg/5ml');
    assert.equal(byId['cv-mox-1000'].formulation, 'Amoxicillin 1000mg + Clavulanic acid');
    assert.equal(byId['cv-mox-1000'].source_status, 'needs_nnc_confirmation');
    assert.equal(byId['cv-mox-228.5'].source_status, 'source_locked');
    assert.equal(Object.values(byId).filter((product) => product.source_status === 'source_locked').length, 6);
  });
});

test('WhatsApp messages carry a stable campaign reference', () => {
  assert.equal(
    buildNncWhatsAppReference('product_consultation', 'cv-mox-228.5'),
    'NNC_B2B_ONLINE_REWARDS_Q3_2026/product_consultation/cv-mox-228.5'
  );
  assert.equal(
    buildNncWhatsAppReference('reward confirmation', 'participant/01'),
    'NNC_B2B_ONLINE_REWARDS_Q3_2026/reward-confirmation/participant-01'
  );
  assert.equal(
    appendNncWhatsAppReference('Xin chào NNC.', 'campaign_consultation'),
    'Xin chào NNC.\n\nRef: NNC_B2B_ONLINE_REWARDS_Q3_2026/campaign_consultation'
  );
  assert.throws(() => buildNncWhatsAppReference('   '), /intent is required/);
});

test('NNC phone validation counts digits instead of separators', () => {
  assert.equal(isValidNncPhone('020 9980 6327'), true);
  assert.equal(isValidNncPhone('+856-20-9980-6327'), true);
  assert.equal(isValidNncPhone('--------'), false);
  assert.equal(isValidNncPhone('        '), false);
  assert.equal(isValidNncPhone('1234567'), false);
  assert.equal(isValidNncPhone('1234567890123456'), false);
});

test('legacy product drafts migrate to the source-locked product id', () => {
  assert.deepEqual(
    normalizeNncProductInterests(['cv-mok-228.5', 'cv-mox-228.5', 'unknown', 42]),
    ['cv-mox-228.5']
  );
  assert.deepEqual(normalizeNncProductInterests('cv-mok-228.5'), []);
});

test('Accumulation calculator tiers match the Q3 policy', () => {
  assert.equal(getExpectedTier(1999999), null);
  assert.deepEqual([2000000, 6000000, 12000000, 25000000].map((value) => getExpectedTier(value)?.total_benefit), [7, 8, 9, 10]);
  assert.deepEqual(NNC_ACCUMULATION_TIERS.map((tier) => tier.quarter_end_reward), [2, 3, 4, 5]);
  assert.ok(NNC_ACCUMULATION_TIERS.every((tier) => tier.immediate_discount === 5));
});

test('unapproved reward inventory remains visibly provisional in configuration', () => {
  assert.equal(NNC_REWARD_RUNTIME_MODE, 'provisional_preview');
  assert.equal(NNC_WHEEL_SEGMENTS.length, 6);
  assert.ok(NNC_WHEEL_SEGMENTS.every((reward) => reward.approval_status === 'provisional'));
  assert.ok(NNC_WHEEL_SEGMENTS.every((reward) => reward.stock_limit === null && reward.daily_limit === null));
  assert.ok(NNC_WHEEL_SEGMENTS.every((reward) => reward.image_asset === null));
  assert.ok(NNC_WHEEL_SEGMENTS.every((reward) => reward.is_active === false));
  assert.ok(NNC_WHEEL_SEGMENTS.every((reward) => !/200,?000|100%|30\+1/.test(`${reward.name_vi} ${reward.description_vi}`)));
});

test('NNC participant submission stays on the v2 clinical-progress contract', () => {
  const source = readFileSync(new URL('../lib/lead-service.ts', import.meta.url), 'utf8');
  const start = source.indexOf('export async function submitNncRewardsLead');
  assert.ok(start >= 0);
  const nncBlock = source.slice(start);
  assert.match(nncBlock, /landingVersion: number = 2/);
  assert.match(nncBlock, /template_id: 'nnc_b2b_rewards_v2'/);
  assert.match(nncBlock, /variant_id: 'clinical-progress'/);
  assert.match(nncBlock, /lead_type: 'PARTICIPANT'/);
  assert.match(nncBlock, /return submitLeadToFirestore\(payload\)/);
  assert.doesNotMatch(nncBlock, /return submitPublicLead\(payload\)/);
});

test('NNC production UAT can persist real Firestore data when browser App Check is unavailable', () => {
  const source = readFileSync(new URL('../lib/lead-service.ts', import.meta.url), 'utf8');
  assert.match(source, /NNC_PRODUCTION_UAT_ALLOW_MISSING_APP_CHECK/);
  assert.match(source, /payload\.attribution\.campaign_id === 'NNC_B2B_ONLINE_REWARDS_Q3_2026'/);
  assert.match(source, /mode: usingUatFallback \? 'firestore_web_uat_v1' : 'firestore_web_v1'/);
  assert.match(source, /app_check_required: !usingUatFallback/);
});

test('NNC runtime migrates legacy product drafts before Firestore submission', () => {
  const questionnaireSource = readFileSync(new URL('../components/nnc-b2b-rewards/questionnaire-flow.tsx', import.meta.url), 'utf8');
  const campaignSource = readFileSync(new URL('../components/nnc-b2b-rewards/campaign-page.tsx', import.meta.url), 'utf8');
  assert.match(questionnaireSource, /normalizeDraftAnswers/);
  assert.match(questionnaireSource, /normalizeNncProductInterests/);
  assert.match(campaignSource, /const productInterests = normalizeNncProductInterests/);
  assert.match(campaignSource, /answers_json: JSON\.stringify\(normalizedQuizAnswers\)/);
});

test('all NNC WhatsApp message paths append stable non-PII references', () => {
  const campaignSource = readFileSync(new URL('../components/nnc-b2b-rewards/campaign-page.tsx', import.meta.url), 'utf8');
  const rewardSource = readFileSync(new URL('../components/nnc-b2b-rewards/reward-wheel.tsx', import.meta.url), 'utf8');
  assert.match(campaignSource, /appendNncWhatsAppReference\(message, intent, referenceSubject\)/);
  assert.match(rewardSource, /'reward_confirmation'/);
  assert.match(rewardSource, /'referral_share'/);
  assert.match(rewardSource, /'whatsapp'/);
});

test('NNC Firestore fallback preserves the wheel before the WhatsApp handoff', () => {
  const campaignSource = readFileSync(new URL('../components/nnc-b2b-rewards/campaign-page.tsx', import.meta.url), 'utf8');
  const rewardSource = readFileSync(new URL('../components/nnc-b2b-rewards/reward-wheel.tsx', import.meta.url), 'utf8');
  const fallbackStart = campaignSource.indexOf('const handleRegistrationWhatsAppFallback');
  const fallbackEnd = campaignSource.indexOf('const changeLanguage', fallbackStart);
  const fallbackBlock = campaignSource.slice(fallbackStart, fallbackEnd);
  assert.ok(fallbackStart >= 0);
  assert.match(fallbackBlock, /setRegistration\(values\)/);
  assert.match(fallbackBlock, /setParticipantRecord\(fallbackParticipant\)/);
  assert.match(fallbackBlock, /setFlow\('wheel'\)/);
  assert.doesNotMatch(fallbackBlock, /window\.location\.(assign|replace)/);
  assert.match(rewardSource, /isWhatsAppFallback/);
  assert.match(rewardSource, /Gửi kết quả qua WhatsApp/);
});

test('NNC runtime does not send participant identifiers to analytics or persist a client-selected reward', () => {
  const source = readFileSync(new URL('../components/nnc-b2b-rewards/campaign-page.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /participant_id/);
  assert.doesNotMatch(source, /wheel_reward_(id|name|status)/);
  assert.match(source, /allocation_mode: 'provisional_preview'/);
});
