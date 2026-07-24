import { getFirebaseClient } from '../../../shared/firebase/client';
import type { CampaignRepository } from './campaignRepository';
import { firestoreCampaignRepository } from './firestoreCampaignRepository';
import { localCampaignRepository } from './localCampaignRepository';

export function createCampaignRepository(): CampaignRepository {
  return getFirebaseClient() ? firestoreCampaignRepository : localCampaignRepository;
}
