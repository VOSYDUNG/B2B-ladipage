import { campaignConfig } from '@/config/campaign'
import { publicFormContracts } from '@/config/form-contracts'
import {
  NNC_PRODUCTION_UAT_ALLOW_MISSING_APP_CHECK,
  NNC_PRODUCTION_UAT_OPEN,
} from '@/config/nnc-production-uat'
import { WL_PRODUCTS } from '@/config/white-lotus'
import {
  WHITE_LOTUS_PRODUCTION_UAT_ALLOW_MISSING_APP_CHECK,
  WHITE_LOTUS_PRODUCTION_UAT_OPEN,
} from '@/config/white-lotus-production-uat'
import {
  getAppCheckToken,
  getFirestoreClient,
  hasFirebaseConfig,
} from '@/lib/firebase'
import type {
  LandingVariant,
  LeadFormValues,
  PublicLeadPayload,
  WhiteLotusOrderValues
} from '@/types'

type LeadSubmitMode = 'firestore' | 'demo'

type LeadSubmitResult = {
  id: string
  mode: LeadSubmitMode
}

type SampleRequestValues = {
  pharmacyName: string
  contactName: string
  phone: string
  province: string
  selectedProductIds: string[]
  needType: string
}

const PRIVACY_VERSION = 'lead_form_v1'
const IDEMPOTENCY_WINDOW_MS = 10 * 60 * 1000
const submissionKeys = new Map<string, { key: string; expiresAt: number }>()

const getQueryAttribution = () => {
  const query = new URLSearchParams(window.location.search)
  const optionalValue = (value: string | null, maxLength: number) => value
    ? value.slice(0, maxLength)
    : null
  return {
    source: (query.get('utm_source') || 'direct').slice(0, 100),
    medium: optionalValue(query.get('utm_medium'), 100),
    campaign: optionalValue(query.get('utm_campaign'), 120),
    content: optionalValue(query.get('utm_content'), 120),
    referrer: optionalValue(document.referrer || null, 500),
  }
}

const baseCrm = (): PublicLeadPayload['crm'] => ({
  status: 'NEW',
  owner_id: null,
  next_action_at: null,
  lead_score: null,
  lost_reason: null,
  converted_order_value: null,
})

const hashFingerprint = async (value: string) => {
  if (globalThis.crypto?.subtle) {
    const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
    return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, '0')).join('')
  }
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return Math.abs(hash >>> 0).toString(36).padStart(16, '0')
}

export async function createNncReferralCode() {
  if (globalThis.crypto?.getRandomValues) {
    const bytes = globalThis.crypto.getRandomValues(new Uint8Array(10))
    const token = Array.from(bytes).map(byte => byte.toString(16).padStart(2, '0')).join('')
    return `NNC-${token.toUpperCase()}`
  }
  const token = globalThis.crypto?.randomUUID?.().replace(/-/g, '')
    ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 14)}`
  return `NNC-${token.slice(0, 20).toUpperCase()}`
}

const buildIdempotencyKey = async (payload: PublicLeadPayload) => {
  const identity = payload.identity
  const selection = payload.selection
  const stableParts = [
    payload.attribution.landing_id,
    payload.attribution.campaign_id,
    payload.attribution.lead_type,
    payload.form.form_id,
    String(payload.form.version_number),
    identity.phone,
    identity.pharmacy_name,
    selection.package_id || '',
    selection.need_type || '',
    (selection.items || []).map(item => `${item.product_id}:${item.quantity}`).join('|')
  ]
  const now = Date.now()
  const fingerprint = stableParts.join('::').toLowerCase()
  if (payload.attribution.campaign_id === 'NNC_B2B_ONLINE_REWARDS_Q3_2026') {
    const stableCampaignFingerprint = [
      payload.attribution.campaign_id,
      identity.phone.replace(/\D/g, ''),
      payload.form.form_id,
    ].join('::').toLowerCase()
    return `lead-v1-nnc-${(await hashFingerprint(stableCampaignFingerprint)).slice(0, 40)}`
  }
  for (const [cacheKey, cached] of submissionKeys) {
    if (cached.expiresAt <= now) submissionKeys.delete(cacheKey)
  }

  const cached = submissionKeys.get(fingerprint)
  if (cached) return cached.key

  const key = `lead-v1-${globalThis.crypto?.randomUUID?.() || `${now}-${Math.random().toString(36).slice(2)}`}`
  submissionKeys.set(fingerprint, { key, expiresAt: now + IDEMPOTENCY_WINDOW_MS })
  return key
}

async function submitLeadToFirestore(payload: PublicLeadPayload): Promise<LeadSubmitResult> {
  const idempotencyKey = await buildIdempotencyKey(payload)
  const isNncProductionUat = payload.attribution.campaign_id === 'NNC_B2B_ONLINE_REWARDS_Q3_2026'
    && NNC_PRODUCTION_UAT_OPEN
    && NNC_PRODUCTION_UAT_ALLOW_MISSING_APP_CHECK
  const isWhiteLotusProductionUat = payload.attribution.campaign_id === 'WL_NEW_PRODUCTS_2026_Q3'
    && WHITE_LOTUS_PRODUCTION_UAT_OPEN
    && WHITE_LOTUS_PRODUCTION_UAT_ALLOW_MISSING_APP_CHECK
  const allowMissingAppCheck = isNncProductionUat || isWhiteLotusProductionUat
  let appCheckToken: string | null = null
  try {
    appCheckToken = await getAppCheckToken()
  } catch {
    if (!allowMissingAppCheck) throw new Error('Firebase App Check token could not be issued')
    console.warn('Production UAT is continuing without an App Check token; disable the campaign fallback after owner sign-off.')
  }
  if (!appCheckToken && !allowMissingAppCheck) {
    throw new Error('Lead intake is locked until Firebase App Check is configured')
  }
  const usingUatFallback = !appCheckToken && allowMissingAppCheck

  const db = await getFirestoreClient()
  if (!db) throw new Error('Firestore is unavailable')

  const { doc, serverTimestamp, setDoc } = await import('firebase/firestore')
  const contract = Object.values(publicFormContracts).find(
    (candidate) => candidate.formId === payload.form.form_id
  )
  const leadRef = doc(db, 'leads', idempotencyKey)

  await setDoc(leadRef, {
    ...payload,
    schema_version: 'public_lead_v1',
    form: {
      ...payload.form,
      flow_key: contract?.flowKey || 'unknown',
    },
    ingestion: {
      mode: usingUatFallback ? 'firestore_web_uat_v1' : 'firestore_web_v1',
      app_check_required: !usingUatFallback,
    },
    ...(payload.wheel_reward_id ? { wheel_reward_recorded_at: serverTimestamp() } : {}),
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  })

  return { id: leadRef.id, mode: 'firestore' }
}

async function submitPublicLead(payload: PublicLeadPayload): Promise<LeadSubmitResult> {
  if (!hasFirebaseConfig) {
    await new Promise((resolve) => setTimeout(resolve, 700))
    return { id: `demo-${Date.now()}`, mode: 'demo' }
  }

  return submitLeadToFirestore(payload)
}

export async function submitLead(
  values: LeadFormValues,
  variant: LandingVariant,
  lang: string = 'vi',
  campaignId: string = 'VG5_KMK_LAO_2026',
  landingId: string = 'vg5-kmk',
  landingVersion: number = 1
) {
  const attribution = getQueryAttribution()
  const suggestedTotal = values.selectedPackage === 'advanced'
    ? campaignConfig.packages.advanced.suggestedTotal
    : campaignConfig.packages.basic.suggestedTotal

  return submitPublicLead({
    form: {
      form_id: publicFormContracts.vg5TradeOrder.formId,
      version_number: publicFormContracts.vg5TradeOrder.versionNumber,
    },
    attribution: {
      landing_id: landingId,
      landing_version: landingVersion,
      campaign_id: campaignId,
      template_id: 'pharmacy_trade_v1',
      variant_id: variant,
      language: lang,
      lead_type: 'ORDER',
      ...attribution,
    },
    identity: {
      pharmacy_name: values.pharmacyName.trim(),
      province: values.province.trim(),
      contact_name: values.contactName.trim(),
      phone: values.phone.trim(),
    },
    selection: {
      package_id: values.selectedPackage,
      reward_option: values.rewardOption,
      selected_package_value: suggestedTotal,
      currency: 'LAK',
    },
    crm: baseCrm(),
    compliance: {
      contact_consent: true,
      privacy_version: PRIVACY_VERSION,
    },
  })
}

export async function submitWhiteLotusOrder(
  values: WhiteLotusOrderValues,
  lang: string = 'vi',
  campaignId: string = 'WL_NEW_PRODUCTS_2026_Q3',
  landingId: string = 'white-lotus',
  landingVersion: number = 1
) {
  const attribution = getQueryAttribution()
  const priceByProduct = new Map(WL_PRODUCTS.map(product => [product.product_id, product.price_vientiane_lak]))
  const selectedPackageValue = values.items.reduce(
    (sum, item) => sum + ((priceByProduct.get(item.product_id) || 0) * item.quantity),
    0
  )

  return submitPublicLead({
    form: {
      form_id: publicFormContracts.whiteLotusProductOrder.formId,
      version_number: publicFormContracts.whiteLotusProductOrder.versionNumber,
    },
    attribution: {
      landing_id: landingId,
      landing_version: landingVersion,
      campaign_id: campaignId,
      template_id: 'white_lotus_order_v1',
      variant_id: 'default',
      language: lang,
      lead_type: 'ORDER',
      ...attribution,
    },
    identity: {
      pharmacy_name: values.pharmacyName.trim(),
      province: values.province.trim(),
      contact_name: values.contactName.trim(),
      phone: values.phone.trim(),
    },
    selection: {
      items: values.items,
      package_id: 'white_lotus_order',
      reward_option: 'product',
      selected_package_value: selectedPackageValue,
      currency: 'LAK',
    },
    crm: baseCrm(),
    compliance: {
      contact_consent: true,
      privacy_version: PRIVACY_VERSION,
    },
  })
}

export async function submitWhiteLotusSampleRequest(
  values: SampleRequestValues,
  lang: string = 'vi',
  campaignId: string = 'WL_NEW_PRODUCTS_2026_Q3',
  landingId: string = 'white-lotus',
  landingVersion: number = 1
) {
  const attribution = getQueryAttribution()

  return submitPublicLead({
    form: {
      form_id: publicFormContracts.whiteLotusSampleRequest.formId,
      version_number: publicFormContracts.whiteLotusSampleRequest.versionNumber,
    },
    attribution: {
      landing_id: landingId,
      landing_version: landingVersion,
      campaign_id: campaignId,
      template_id: 'white_lotus_order_v1',
      variant_id: 'default',
      language: lang,
      lead_type: 'SAMPLE_REQUEST',
      ...attribution,
    },
    identity: {
      pharmacy_name: values.pharmacyName.trim(),
      province: values.province.trim(),
      contact_name: values.contactName.trim(),
      phone: values.phone.trim(),
    },
    selection: {
      items: values.selectedProductIds.map(productId => ({ product_id: productId, quantity: 1 })),
      package_id: 'sample_request',
      reward_option: values.needType,
      currency: 'LAK',
      need_type: values.needType,
    },
    crm: baseCrm(),
    compliance: {
      contact_consent: false,
      privacy_version: PRIVACY_VERSION,
    },
  })
}

export async function submitNncRewardsLead(
  values: {
    pharmacyName: string;
    province: string;
    contactName: string;
    phone: string;
    role: string;
    category_interest: string;
    product_interests: string[];
    answers_json: string;
    purchase_intent_range: string;
    support_needs: string[];
    preferred_contact: 'whatsapp' | 'phone' | 'other';
    referral_code_used?: string;
    referral_code_owned?: string;
  },
  lang: string = 'vi',
  campaignId: string = 'NNC_B2B_ONLINE_REWARDS_Q3_2026',
  landingId: string = 'nnc-b2b-online-rewards-q3-2026',
  landingVersion: number = 2
) {
  const attribution = getQueryAttribution();

  const payload: PublicLeadPayload = {
    form: {
      form_id: publicFormContracts.nncRewardsOrder.formId,
      version_number: publicFormContracts.nncRewardsOrder.versionNumber,
    },
    attribution: {
      landing_id: landingId,
      landing_version: landingVersion,
      campaign_id: campaignId,
      template_id: 'nnc_b2b_rewards_v2',
      variant_id: 'clinical-progress',
      language: lang,
      lead_type: 'PARTICIPANT',
      ...attribution,
    },
    identity: {
      pharmacy_name: values.pharmacyName.trim(),
      province: values.province.trim(),
      contact_name: values.contactName.trim(),
      phone: values.phone.trim(),
    },
    selection: {
      package_id: 'nnc_rewards_b2b',
      reward_option: 'pending_confirmation',
      currency: 'LAK',
      need_type: values.category_interest
    },
    crm: baseCrm(),
    compliance: {
      contact_consent: true,
      privacy_version: PRIVACY_VERSION,
    },
    role: values.role,
    category_interest: values.category_interest,
    product_interests: values.product_interests,
    answers_json: values.answers_json,
    purchase_intent_range: values.purchase_intent_range,
    support_needs: values.support_needs,
    preferred_contact: values.preferred_contact,
    referral_code_used: values.referral_code_used || '',
    referral_code_owned: values.referral_code_owned || ''
  };

  // Production UAT must exercise the same persisted path as the campaign.
  // Do not unlock the NNC flow with the generic demo fallback.
  return submitLeadToFirestore(payload);
}

export async function saveB2BParticipant(
  participantId: string,
  data: {
    phone?: string;
    role?: string;
    businessName?: string;
    referralCodeUsed?: string;
    targetTierId?: string;
    rewardId?: string;
    cartItems?: Array<{ product_id: string; quantity: number }>;
    cartTotal?: number;
    whatsappClickedAt?: boolean;
  }
) {
  if (!hasFirebaseConfig) {
    console.log("Demo mode: saving B2B participant", participantId, data);
    return { id: participantId, mode: 'demo' as const };
  }

  const db = await getFirestoreClient();
  if (!db) throw new Error('Firestore is unavailable');

  const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
  const participantRef = doc(db, 'b2b_rewards_participants', participantId);

  const cleanData: Record<string, any> = {};
  if (data.phone !== undefined) {
    cleanData.phone = data.phone;
    cleanData.created_at = serverTimestamp();
  }
  if (data.role !== undefined) cleanData.role = data.role;
  if (data.businessName !== undefined) cleanData.businessName = data.businessName;
  if (data.referralCodeUsed !== undefined) cleanData.referralCodeUsed = data.referralCodeUsed;
  if (data.targetTierId !== undefined) cleanData.targetTierId = data.targetTierId;
  if (data.rewardId !== undefined) cleanData.rewardId = data.rewardId;
  if (data.cartItems !== undefined) cleanData.cartItems = data.cartItems;
  if (data.cartTotal !== undefined) cleanData.cartTotal = data.cartTotal;
  if (data.whatsappClickedAt === true) {
    cleanData.whatsappClickedAt = serverTimestamp();
  }

  cleanData.updated_at = serverTimestamp();

  await setDoc(participantRef, cleanData, { merge: true });

  return { id: participantId, mode: 'firestore' as const };
}

