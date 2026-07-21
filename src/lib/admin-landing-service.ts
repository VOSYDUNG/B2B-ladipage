import type {
  AssetReplacementJob,
  LandingClaim,
  LandingAsset,
  LandingFormDefinition,
  LandingRegistryEntry,
  LandingVersion,
  LandingWorkspacePermissions,
} from '@/config/landing-registry'
import { parseLandingDocument } from '@/lib/landing-service'
import { getAppCheckToken } from '@/lib/firebase'

const getAdminLandingApiUrl = () => (
  import.meta.env.VITE_ADMIN_LANDING_API_URL || '/api/admin/landings'
)
const getAdminAssetApiUrl = () => (
  import.meta.env.VITE_ADMIN_ASSET_API_URL || '/api/admin/assets'
)

export type LandingCommand =
  | { action: 'initialize' }
  | { action: 'create_version'; landing_id: string }
  | {
    action: 'transition_version'
    landing_id: string
    version_number: number
    target_status: LandingVersion['status']
    note?: string
  }
  | {
    action: 'duplicate_landing'
    landing_id: string
    new_landing_id: string
    name: string
    campaign_id: string
  }
  | {
    action: 'review_claim'
    claim_id: string
    decision: 'approved' | 'rejected'
    note?: string
  }
  | {
    action: 'bind_form_contract'
    landing_id: string
    version_number: number
    flow_key: string
    contract_id: string
  }

export interface LandingWorkspace {
  landings: LandingRegistryEntry[]
  versions: LandingVersion[]
  forms: LandingFormDefinition[]
  claims: LandingClaim[]
  assets: LandingAsset[]
  assetJobs: AssetReplacementJob[]
  permissions: LandingWorkspacePermissions
}

export type AssetUploadPhase = 'hashing' | 'creating_session' | 'uploading' | 'verifying'

async function getAdminHeaders(idempotency: boolean | string = false) {
  const [{ auth }, appCheckToken] = await Promise.all([
    import('@/firebase'),
    getAppCheckToken(),
  ])
  const firebaseUser = auth.currentUser
  if (!firebaseUser) throw new Error('Admin session is unavailable')

  const idToken = await firebaseUser.getIdToken()
  const randomKey = globalThis.crypto?.randomUUID?.()
    || `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`
  const idempotencyKey = typeof idempotency === 'string'
    ? idempotency
    : idempotency
      ? `landing-${randomKey}`
      : null
  return {
    Authorization: `Bearer ${idToken}`,
    'Content-Type': 'application/json',
    ...(appCheckToken ? { 'X-Firebase-AppCheck': appCheckToken } : {}),
    ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
  }
}

function parseVersion(data: Record<string, unknown>): LandingVersion {
  return {
    versionId: String(data.version_id || ''),
    landingId: String(data.landing_id || ''),
    versionNumber: Number(data.version_number || 1),
    status: String(data.status || 'draft') as LandingVersion['status'],
    formId: String(data.form_id || ''),
    formRefs: data.form_refs && typeof data.form_refs === 'object' && !Array.isArray(data.form_refs)
      ? Object.fromEntries(
        Object.entries(data.form_refs).filter((entry): entry is [string, string] => (
          typeof entry[1] === 'string'
        ))
      )
      : {},
    claimMode: data.claim_mode === 'claim_gated' ? 'claim_gated' : 'zero_claim',
    sourceLocked: data.source_locked === true,
    sections: Array.isArray(data.sections)
      ? data.sections as LandingVersion['sections']
      : [],
    assetRefs: Array.isArray(data.asset_refs) ? data.asset_refs.map(String) : [],
    claimRefs: Array.isArray(data.claim_refs) ? data.claim_refs.map(String) : [],
    createdAt: typeof data.created_at === 'string' ? data.created_at : null,
    updatedAt: typeof data.updated_at === 'string' ? data.updated_at : null,
    publishedAt: typeof data.published_at === 'string' ? data.published_at : null,
    createdBy: typeof data.created_by === 'string' ? data.created_by : null,
    regulatoryApprovedAt: typeof data.regulatory_approved_at === 'string'
      ? data.regulatory_approved_at
      : null,
    regulatoryApprovedBy: typeof data.regulatory_approved_by === 'string'
      ? data.regulatory_approved_by
      : null,
  }
}

function parseForm(data: Record<string, unknown>): LandingFormDefinition {
  const compliance = data.compliance_policy && typeof data.compliance_policy === 'object'
    ? data.compliance_policy as Record<string, unknown>
    : {}
  return {
    contractId: String(data.contract_id || ''),
    formId: String(data.form_id || ''),
    versionNumber: Number(data.version_number || 1),
    landingId: String(data.landing_id || ''),
    flowKey: String(data.flow_key || ''),
    name: String(data.name || ''),
    fields: Array.isArray(data.fields)
      ? data.fields.map((field) => {
        const value = field && typeof field === 'object'
          ? field as Record<string, unknown>
          : {}
        return {
          id: String(value.id || ''),
          path: String(value.path || value.id || ''),
          type: String(value.type || 'text'),
          required: value.required === true,
          piiClass: String(value.pii_class || 'non_pii') as LandingFormDefinition['fields'][number]['piiClass'],
          maxLength: typeof value.max_length === 'number' ? value.max_length : null,
          patternKey: typeof value.pattern_key === 'string' ? value.pattern_key : null,
        }
      })
      : [],
    status: String(data.status || (data.active === true ? 'active' : 'draft')) as LandingFormDefinition['status'],
    runtimeBinding: String(data.runtime_binding || ''),
    campaignId: String(data.campaign_id || ''),
    templateId: String(data.template_id || 'pharmacy_trade_v1') as LandingFormDefinition['templateId'],
    leadType: String(data.lead_type || ''),
    schemaHash: String(data.schema_hash || ''),
    selectionRules: data.selection_rules && typeof data.selection_rules === 'object'
      ? data.selection_rules as Record<string, unknown>
      : {},
    compliancePolicy: {
      contactBasis: compliance.contact_basis === 'user_initiated_service_request'
        ? 'user_initiated_service_request'
        : 'explicit_consent',
      requiresExplicitConsent: compliance.requires_explicit_consent === true,
      marketingConsent: compliance.marketing_consent === true,
      privacyVersion: String(compliance.privacy_version || ''),
    },
    validationSchema: data.validation_schema && typeof data.validation_schema === 'object'
      ? data.validation_schema as Record<string, unknown>
      : {},
    consentText: String(data.consent_text || ''),
    successMessage: String(data.success_message || ''),
    active: data.active === true,
    sourceLocked: data.source_locked === true,
    runtimeReady: data.runtime_ready === true,
    sourceDocument: typeof data.source_document === 'string' ? data.source_document : null,
  }
}

function parseClaim(data: Record<string, unknown>): LandingClaim {
  return {
    claimId: String(data.claim_id || ''),
    productId: String(data.product_id || ''),
    claimTextVi: String(data.claim_text_vi || ''),
    claimTextLo: typeof data.claim_text_lo === 'string' ? data.claim_text_lo : null,
    sourceDocument: typeof data.source_document === 'string' ? data.source_document : null,
    sourcePage: typeof data.source_page === 'string' ? data.source_page : null,
    status: String(data.status || 'pending') as LandingClaim['status'],
    approvedForPublicUse: data.approved_for_public_use === true,
    validFrom: typeof data.valid_from === 'string' ? data.valid_from : null,
    validTo: typeof data.valid_to === 'string' ? data.valid_to : null,
    approvedBy: typeof data.approved_by === 'string' ? data.approved_by : null,
    reviewNote: typeof data.review_note === 'string' ? data.review_note : null,
  }
}

function parseAsset(data: Record<string, unknown>): LandingAsset {
  return {
    assetId: String(data.asset_id || ''),
    landingId: String(data.landing_id || ''),
    filename: String(data.filename || ''),
    sourcePath: typeof data.source_path === 'string' ? data.source_path : null,
    runtimePath: typeof data.runtime_path === 'string' ? data.runtime_path : null,
    type: String(data.type || 'unknown'),
    status: String(data.status || 'UNKNOWN'),
    productionReady: data.production_ready === true,
    publicAccess: String(data.public_access || 'blocked'),
    sourceDocument: typeof data.source_document === 'string' ? data.source_document : null,
    sourceHash: typeof data.source_hash === 'string' ? data.source_hash : null,
    sourceLocked: data.source_locked === true,
  }
}

function parseAssetReplacementJob(data: Record<string, unknown>): AssetReplacementJob {
  return {
    jobId: String(data.job_id || ''),
    assetId: String(data.asset_id || ''),
    landingId: String(data.landing_id || ''),
    filename: String(data.filename || ''),
    contentType: String(data.content_type || ''),
    expectedSizeBytes: Number(data.expected_size_bytes || 0),
    expectedSha256: String(data.expected_sha256 || ''),
    actualSizeBytes: typeof data.actual_size_bytes === 'number'
      ? data.actual_size_bytes
      : null,
    actualSha256: typeof data.actual_sha256 === 'string' ? data.actual_sha256 : null,
    sourceAssetHash: typeof data.source_asset_hash === 'string' ? data.source_asset_hash : null,
    sourceAssetStatus: typeof data.source_asset_status === 'string'
      ? data.source_asset_status
      : null,
    sourcePublicAccess: String(data.source_public_access || 'blocked'),
    status: String(data.status || 'upload_pending') as AssetReplacementJob['status'],
    runtimeBindingStatus: 'not_bound',
    reviewRequired: data.review_required === 'regulatory' ? 'regulatory' : 'marketing',
    createdBy: typeof data.created_by === 'string' ? data.created_by : null,
    createdAt: typeof data.created_at === 'string' ? data.created_at : null,
    expiresAt: typeof data.expires_at === 'string' ? data.expires_at : null,
    expired: data.expired === true,
    verifiedAt: typeof data.verified_at === 'string' ? data.verified_at : null,
    reviewedBy: typeof data.reviewed_by === 'string' ? data.reviewed_by : null,
    reviewedAt: typeof data.reviewed_at === 'string' ? data.reviewed_at : null,
    reviewNote: typeof data.review_note === 'string' ? data.review_note : null,
    failureReason: typeof data.failure_reason === 'string' ? data.failure_reason : null,
  }
}

export async function fetchAdminLandingWorkspace(
  landingId?: string
): Promise<LandingWorkspace> {
  const headers = await getAdminHeaders()
  const query = landingId
    ? `?landing_id=${encodeURIComponent(landingId)}`
    : ''
  const [landingResponse, assetResponse] = await Promise.all([
    fetch(`${getAdminLandingApiUrl()}${query}`, { method: 'GET', headers }),
    fetch(`${getAdminAssetApiUrl()}${query}`, { method: 'GET', headers }),
  ])
  const [body, assetBody] = await Promise.all([
    landingResponse.json().catch(() => null),
    assetResponse.json().catch(() => null),
  ])
  if (!landingResponse.ok) {
    throw new Error(body?.message || `Admin Landing API failed with ${landingResponse.status}`)
  }
  if (!assetResponse.ok) {
    throw new Error(assetBody?.message || `Admin Asset API failed with ${assetResponse.status}`)
  }
  const data = body?.data || {}
  const assetData = assetBody?.data || {}
  const landings = (Array.isArray(data.landings) ? data.landings : [])
    .map((landing: Record<string, unknown>) => (
      parseLandingDocument(String(landing.slug || landing.landing_id || ''), landing)
    ))
    .filter((landing: LandingRegistryEntry | null): landing is LandingRegistryEntry => (
      Boolean(landing)
    ))
  return {
    landings,
    versions: (Array.isArray(data.versions) ? data.versions : []).map(parseVersion),
    forms: (Array.isArray(data.forms) ? data.forms : []).map(parseForm),
    claims: (Array.isArray(data.claims) ? data.claims : []).map(parseClaim),
    assets: (Array.isArray(data.assets) ? data.assets : []).map(parseAsset),
    assetJobs: (Array.isArray(assetData.jobs) ? assetData.jobs : [])
      .map(parseAssetReplacementJob),
    permissions: {
      canManage: data.permissions?.can_manage === true,
      canReview: data.permissions?.can_review === true,
      canViewAnalytics: data.permissions?.can_view_analytics === true,
    },
  }
}

export async function executeLandingCommand(command: LandingCommand) {
  const headers = await getAdminHeaders(true)
  const response = await fetch(getAdminLandingApiUrl(), {
    method: 'POST',
    headers,
    body: JSON.stringify(command),
  })
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(body?.message || `Admin Landing API failed with ${response.status}`)
  }
  return body?.data as Record<string, unknown>
}

async function sha256Hex(file: File) {
  const digest = await globalThis.crypto.subtle.digest('SHA-256', await file.arrayBuffer())
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export async function uploadAssetReplacement(
  assetId: string,
  file: File,
  onPhase?: (phase: AssetUploadPhase) => void
): Promise<AssetReplacementJob> {
  onPhase?.('hashing')
  const sha256 = await sha256Hex(file)
  onPhase?.('creating_session')
  const createHeaders = await getAdminHeaders(true)
  const createResponse = await fetch(getAdminAssetApiUrl(), {
    method: 'POST',
    headers: createHeaders,
    body: JSON.stringify({
      action: 'create_upload_session',
      asset_id: assetId,
      filename: file.name,
      content_type: file.type,
      size_bytes: file.size,
      sha256,
    }),
  })
  const createBody = await createResponse.json().catch(() => null)
  if (!createResponse.ok) {
    throw new Error(createBody?.message || `Asset upload session failed with ${createResponse.status}`)
  }
  const session = createBody?.data || {}
  if (!session.upload_url || !session.job_id) {
    throw new Error(`Asset upload session is ${session.state || 'unavailable'}`)
  }

  onPhase?.('uploading')
  const uploadResponse = await fetch(String(session.upload_url), {
    method: 'PUT',
    headers: session.upload_headers && typeof session.upload_headers === 'object'
      ? session.upload_headers as Record<string, string>
      : { 'Content-Type': file.type },
    body: file,
  })
  if (!uploadResponse.ok) {
    throw new Error(`Storage upload failed with ${uploadResponse.status}`)
  }

  onPhase?.('verifying')
  return finalizeAssetReplacement(String(session.job_id))
}

export async function finalizeAssetReplacement(jobId: string): Promise<AssetReplacementJob> {
  const finalizeHeaders = await getAdminHeaders(`asset-finalize-${jobId}`)
  const finalizeResponse = await fetch(getAdminAssetApiUrl(), {
    method: 'POST',
    headers: finalizeHeaders,
    body: JSON.stringify({
      action: 'finalize_upload',
      job_id: jobId,
    }),
  })
  const finalizeBody = await finalizeResponse.json().catch(() => null)
  if (!finalizeResponse.ok) {
    throw new Error(finalizeBody?.message || `Asset verification failed with ${finalizeResponse.status}`)
  }
  return parseAssetReplacementJob(finalizeBody?.data || {})
}

export async function reviewAssetReplacement(
  jobId: string,
  decision: 'approved' | 'rejected',
  note?: string
): Promise<AssetReplacementJob> {
  const headers = await getAdminHeaders(true)
  const response = await fetch(getAdminAssetApiUrl(), {
    method: 'POST',
    headers,
    body: JSON.stringify({
      action: 'review_asset_replacement',
      job_id: jobId,
      decision,
      ...(note?.trim() ? { note: note.trim() } : {}),
    }),
  })
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(body?.message || `Asset review failed with ${response.status}`)
  }
  return parseAssetReplacementJob(body?.data || {})
}
