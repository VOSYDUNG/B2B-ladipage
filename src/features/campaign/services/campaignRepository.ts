import type {
  CampaignState,
  CartLine,
  RegistrationData,
  SpinResult,
} from '../model/types';

export interface CampaignRepository {
  saveRegistration(registration: RegistrationData): Promise<void>;
  savePolicyAcknowledgement(payload: {
    phone: string;
    selectedTierId: string;
    policyVersion: string;
  }): Promise<void>;
  saveSpinPreview(payload: { phone: string; spin: SpinResult }): Promise<void>;
  saveCartDraft(payload: { phone: string; cart: CartLine[] }): Promise<void>;
  saveCompletion(payload: Pick<CampaignState, 'registration' | 'spin' | 'cart'>): Promise<void>;
}
