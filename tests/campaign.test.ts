import assert from 'node:assert/strict';
import test from 'node:test';
import { ACTIVE_REWARDS, PRODUCTS, SAMPLE_PRODUCT_IDS, TIERS } from '../src/features/campaign/model/config.ts';
import { calculateCart, chooseWeightedReward, getTierForRevenue, normalizePhone } from '../src/features/campaign/model/math.ts';

test('campaign keeps exactly seven participating products with unique IDs', () => {
  assert.equal(PRODUCTS.length, 7);
  assert.equal(new Set(PRODUCTS.map((product) => product.id)).size, 7);
});

test('five sample products are valid participating products', () => {
  const productIds = new Set(PRODUCTS.map((product) => product.id));
  assert.equal(SAMPLE_PRODUCT_IDS.length, 5);
  for (const productId of SAMPLE_PRODUCT_IDS) assert.equal(productIds.has(productId), true);
});

test('tier boundaries are exclusive at the upper bound', () => {
  const cases: Array<[number, string | null]> = [
    [1_999_999, null],
    [2_000_000, 'tier-1'],
    [5_999_999, 'tier-1'],
    [6_000_000, 'tier-2'],
    [11_999_999, 'tier-2'],
    [12_000_000, 'tier-3'],
    [24_999_999, 'tier-3'],
    [25_000_000, 'tier-4'],
  ];
  for (const [revenue, expected] of cases) assert.equal(getTierForRevenue(revenue)?.id ?? null, expected);
});

test('active reward weights total 100 and never select pending rewards', () => {
  assert.equal(ACTIVE_REWARDS.reduce((sum, reward) => sum + reward.weight, 0), 100);
  assert.equal(chooseWeightedReward(ACTIVE_REWARDS, () => 0).id, 'voucher-200');
  assert.equal(chooseWeightedReward(ACTIVE_REWARDS, () => 0.999999).id, 'sample-product');
});

test('cart totals use server-like product snapshots and 5 percent immediate discount', () => {
  const result = calculateCart([
    { productId: 'tadimax', quantity: 10 },
    { productId: 'bai-thach', quantity: 1 },
  ]);
  assert.equal(result.subtotalKip, 1_999_000);
  assert.equal(result.immediateDiscountKip, 99_950);
  assert.equal(result.estimatedPayableKip, 1_899_050);
  assert.equal(result.tier, null);
});

test('phone normalization removes visual separators', () => {
  assert.equal(normalizePhone('020 9535-5355'), '02095355355');
  assert.equal(normalizePhone('00856 20 9535 5355'), '+8562095355355');
});

test('tier configuration totals remain 7, 8, 9 and 10 percent', () => {
  assert.deepEqual(TIERS.map((tier) => tier.totalBenefitPercent), [7, 8, 9, 10]);
});
