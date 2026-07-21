import type { LandingVariant } from '@/types'

export type LandingTemplateId =
  | 'pharmacy_trade_v1'
  | 'white_lotus_order_v1'
  | 'nnc_b2b_rewards_v1'
  | 'nnc_b2b_rewards_v2'
export type LandingPageStatus = 'draft' | 'review' | 'published' | 'archived'
export type LandingClaimMode = 'zero_claim' | 'claim_gated'
export type LandingVersionStatus =
  | 'draft'
  | 'internal_review'
  | 'regulatory_review'
  | 'approved'
  | 'published'
  | 'retired'

export interface LandingSectionConfig {
  id: string
  type: string
  enabled: boolean
  order: number
}

export interface LandingVersion {
  versionId: string
  landingId: string
  versionNumber: number
  status: LandingVersionStatus
  formId: string
  formRefs: Record<string, string>
  claimMode: LandingClaimMode
  sourceLocked: boolean
  sections: LandingSectionConfig[]
  assetRefs: string[]
  claimRefs: string[]
  createdAt?: string | null
  updatedAt?: string | null
  publishedAt?: string | null
  createdBy?: string | null
  regulatoryApprovedAt?: string | null
  regulatoryApprovedBy?: string | null
}

export interface LandingFormDefinition {
  contractId: string
  formId: string
  versionNumber: number
  landingId: string
  flowKey: string
  name: string
  fields: Array<{
    id: string
    path: string
    type: string
    required: boolean
    piiClass: 'direct_identifier' | 'quasi_identifier' | 'business_contact' | 'non_pii'
    maxLength?: number | null
    patternKey?: string | null
  }>
  status: 'draft' | 'active' | 'retired'
  runtimeBinding: string
  campaignId: string
  templateId: LandingTemplateId
  leadType: string
  schemaHash: string
  selectionRules: Record<string, unknown>
  compliancePolicy: {
    contactBasis: 'explicit_consent' | 'user_initiated_service_request'
    requiresExplicitConsent: boolean
    marketingConsent: boolean
    privacyVersion: string
  }
  validationSchema: Record<string, unknown>
  consentText: string
  successMessage: string
  active: boolean
  sourceLocked: boolean
  runtimeReady: boolean
  sourceDocument?: string | null
}

export interface LandingClaim {
  claimId: string
  productId: string
  claimTextVi: string
  claimTextLo?: string | null
  sourceDocument?: string | null
  sourcePage?: string | null
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  approvedForPublicUse: boolean
  validFrom?: string | null
  validTo?: string | null
  approvedBy?: string | null
  reviewNote?: string | null
}

export interface LandingAsset {
  assetId: string
  landingId: string
  filename: string
  sourcePath?: string | null
  runtimePath?: string | null
  type: string
  status: string
  productionReady: boolean
  publicAccess: string
  sourceDocument?: string | null
  sourceHash?: string | null
  sourceLocked: boolean
}

export type AssetReplacementStatus =
  | 'upload_pending'
  | 'verifying'
  | 'verified'
  | 'approved_candidate'
  | 'rejected'
  | 'verification_failed'

export interface AssetReplacementJob {
  jobId: string
  assetId: string
  landingId: string
  filename: string
  contentType: string
  expectedSizeBytes: number
  expectedSha256: string
  actualSizeBytes?: number | null
  actualSha256?: string | null
  sourceAssetHash?: string | null
  sourceAssetStatus?: string | null
  sourcePublicAccess: string
  status: AssetReplacementStatus
  runtimeBindingStatus: 'not_bound'
  reviewRequired: 'marketing' | 'regulatory'
  createdBy?: string | null
  createdAt?: string | null
  expiresAt?: string | null
  expired: boolean
  verifiedAt?: string | null
  reviewedBy?: string | null
  reviewedAt?: string | null
  reviewNote?: string | null
  failureReason?: string | null
}

export interface LandingWorkspacePermissions {
  canManage: boolean
  canReview: boolean
  canViewAnalytics: boolean
}

export interface LandingRegistryEntry {
  landingId: string
  slug: string
  name: string
  status: LandingPageStatus
  campaignId: string
  templateId: LandingTemplateId
  defaultVariant: LandingVariant | 'default' | 'clinical-progress'
  market: string
  defaultLanguage: string
  claimMode: LandingClaimMode
  activeVersion: number
  latestVersion: number
  analyticsEnabled: boolean
  formId: string
  formRefs: Record<string, string>
  createdAt?: string
  createdBy?: string
  updatedAt?: string
  updatedBy?: string
}

export const landingRegistry: Record<string, LandingRegistryEntry> = {
  'vg5-kmk': {
    landingId: 'vg5-kmk',
    slug: 'vg5-kmk',
    name: 'VG5 x Ker Mao Khang',
    status: 'published',
    campaignId: 'VG5_KMK_LAO_2026',
    templateId: 'pharmacy_trade_v1',
    defaultVariant: 'safe',
    market: 'laos',
    defaultLanguage: 'vi',
    claimMode: 'zero_claim',
    activeVersion: 1,
    latestVersion: 1,
    analyticsEnabled: true,
    formId: 'vg5-kmk-order_v1',
    formRefs: {
      trade_order: 'vg5-kmk-order_v1',
    },
  },
  'white-lotus': {
    landingId: 'white-lotus',
    slug: 'white-lotus',
    name: 'White Lotus New Products Q3 2026',
    status: 'published',
    campaignId: 'WL_NEW_PRODUCTS_2026_Q3',
    templateId: 'white_lotus_order_v1',
    defaultVariant: 'default',
    market: 'laos',
    defaultLanguage: 'vi',
    claimMode: 'zero_claim',
    activeVersion: 1,
    latestVersion: 1,
    analyticsEnabled: true,
    formId: 'white-lotus-order_v1',
    formRefs: {
      product_order: 'white-lotus-order_v1',
      sample_request: 'white-lotus-sample-request_v1',
    },
  },
  'nnc-b2b-online-rewards-q3-2026': {
    landingId: 'nnc-b2b-online-rewards-q3-2026',
    slug: 'nnc-b2b-online-rewards-q3-2026',
    name: 'NNC B2B Online Rewards Q3 2026',
    status: 'published',
    campaignId: 'NNC_B2B_ONLINE_REWARDS_Q3_2026',
    templateId: 'nnc_b2b_rewards_v2',
    defaultVariant: 'clinical-progress',
    market: 'laos',
    defaultLanguage: 'vi',
    claimMode: 'zero_claim',
    activeVersion: 2,
    latestVersion: 2,
    analyticsEnabled: true,
    formId: 'nnc-rewards-order_v1',
    formRefs: {
      rewards_order: 'nnc-rewards-order_v1',
    },
  },
}

export function getLandingBySlug(slug: string | undefined) {
  if (!slug) return null
  return landingRegistry[slug] || null
}
