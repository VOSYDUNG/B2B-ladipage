import { PRODUCTS, SAMPLE_PRODUCT_IDS, TIERS } from './config.ts';
import type { CartLine, Reward, Tier } from './types.ts';

export function formatKip(value: number, locale: 'vi' | 'lo' = 'vi'): string {
  return `${new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'lo-LA').format(Math.round(value))} KIP`;
}

export function getTierForRevenue(revenueKip: number): Tier | null {
  return (
    TIERS.find((tier) => {
      const aboveMin = revenueKip >= tier.minRevenueKip;
      const belowMax = tier.maxRevenueKip === null || revenueKip < tier.maxRevenueKip;
      return aboveMin && belowMax;
    }) ?? null
  );
}

export function getNextTier(revenueKip: number): Tier | null {
  return TIERS.find((tier) => revenueKip < tier.minRevenueKip) ?? null;
}

export function calculateCart(lines: CartLine[]) {
  const items = lines
    .filter((line) => line.quantity > 0)
    .map((line) => {
      const product = PRODUCTS.find((candidate) => candidate.id === line.productId);
      if (!product) return null;
      return {
        ...line,
        product,
        lineTotalKip: product.priceKip * line.quantity,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const subtotalKip = items.reduce((sum, item) => sum + item.lineTotalKip, 0);
  const tier = getTierForRevenue(subtotalKip);
  const immediateDiscountKip = subtotalKip * 0.05;
  const estimatedQuarterRewardKip = tier
    ? subtotalKip * (tier.quarterRewardPercent / 100)
    : 0;

  return {
    items,
    subtotalKip,
    tier,
    immediateDiscountKip,
    estimatedQuarterRewardKip,
    estimatedPayableKip: subtotalKip - immediateDiscountKip,
  };
}

export function chooseWeightedReward(rewards: Reward[], random = Math.random): Reward {
  const activeRewards = rewards.filter((reward) => reward.status === 'active' && reward.weight > 0);
  const totalWeight = activeRewards.reduce((sum, reward) => sum + reward.weight, 0);
  if (totalWeight <= 0) throw new Error('No active rewards configured.');

  let cursor = random() * totalWeight;
  for (const reward of activeRewards) {
    cursor -= reward.weight;
    if (cursor < 0) return reward;
  }

  return activeRewards[activeRewards.length - 1];
}

export function chooseSampleProduct(random = Math.random): string {
  const index = Math.min(
    SAMPLE_PRODUCT_IDS.length - 1,
    Math.floor(random() * SAMPLE_PRODUCT_IDS.length),
  );
  return SAMPLE_PRODUCT_IDS[index];
}

export function normalizePhone(value: string): string {
  return value.replace(/[^0-9+]/g, '').replace(/^00/, '+').trim();
}
