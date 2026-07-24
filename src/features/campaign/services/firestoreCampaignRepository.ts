import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getFirebaseClient } from '../../../shared/firebase/client';
import { CAMPAIGN_ID } from '../model/config';
import { normalizePhone } from '../model/math';
import type { CampaignRepository } from './campaignRepository';

const POLICY_VERSION = 'Q3-2026-LAO-v1';

function getDbOrThrow() {
  const client = getFirebaseClient();
  if (!client) throw new Error('Firebase environment variables are not configured.');
  return client.db;
}

export const firestoreCampaignRepository: CampaignRepository = {
  async saveRegistration(registration) {
    await addDoc(collection(getDbOrThrow(), 'nnc_b2b_campaign_leads'), {
      campaignId: CAMPAIGN_ID,
      role: registration.role,
      fullName: registration.fullName.trim(),
      phoneNormalized: normalizePhone(registration.phone),
      businessName: registration.businessName.trim(),
      referralCodeUsed: registration.referralCode.trim() || null,
      consent: registration.consent,
      source: 'landing_page_uat',
      createdAt: serverTimestamp(),
    });
  },

  async savePolicyAcknowledgement(payload) {
    await addDoc(collection(getDbOrThrow(), 'nnc_b2b_campaign_events'), {
      campaignId: CAMPAIGN_ID,
      eventType: 'policy_acknowledged',
      phoneNormalized: normalizePhone(payload.phone),
      selectedTierId: payload.selectedTierId,
      policyVersion: payload.policyVersion || POLICY_VERSION,
      createdAt: serverTimestamp(),
    });
  },

  async saveSpinPreview(payload) {
    await addDoc(collection(getDbOrThrow(), 'nnc_b2b_campaign_events'), {
      campaignId: CAMPAIGN_ID,
      eventType: 'spin_preview_completed',
      phoneNormalized: normalizePhone(payload.phone),
      rewardId: payload.spin.rewardId,
      sampleProductId: payload.spin.sampleProductId ?? null,
      rewardMode: 'preview',
      createdAt: serverTimestamp(),
    });
  },

  async saveCartDraft(payload) {
    await addDoc(collection(getDbOrThrow(), 'nnc_b2b_campaign_cart_drafts'), {
      campaignId: CAMPAIGN_ID,
      phoneNormalized: normalizePhone(payload.phone),
      items: payload.cart,
      status: 'draft',
      createdAt: serverTimestamp(),
    });
  },

  async saveCompletion(payload) {
    await addDoc(collection(getDbOrThrow(), 'nnc_b2b_campaign_events'), {
      campaignId: CAMPAIGN_ID,
      eventType: 'flow_completed',
      phoneNormalized: payload.registration
        ? normalizePhone(payload.registration.phone)
        : null,
      rewardId: payload.spin?.rewardId ?? null,
      cartItemCount: payload.cart.reduce((sum, line) => sum + line.quantity, 0),
      createdAt: serverTimestamp(),
    });
  },
};
