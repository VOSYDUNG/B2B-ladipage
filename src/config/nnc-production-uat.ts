import type { NncCampaignPhase } from './nnc-b2b-rewards';

export const NNC_PRODUCTION_UAT_OPEN = true;
export const NNC_PRODUCTION_UAT_ALLOW_MISSING_APP_CHECK = true;
export const NNC_PRODUCTION_UAT_BANNER = 'UAT đang mở trên production';

export function canParticipateInNncCampaign(
  phase: NncCampaignPhase,
  productionUatOpen: boolean = NNC_PRODUCTION_UAT_OPEN
): boolean {
  return productionUatOpen || phase === 'active';
}
