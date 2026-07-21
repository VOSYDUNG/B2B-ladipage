import {
  getLandingBySlug,
  type LandingRegistryEntry
} from '@/config/landing-registry'

const LANDING_STATUSES = new Set(['draft', 'review', 'published', 'archived'])
const TEMPLATE_IDS = new Set([
  'pharmacy_trade_v1',
  'white_lotus_order_v1',
  'nnc_b2b_rewards_v1',
  'nnc_b2b_rewards_v2',
])

export function parseLandingDocument(id: string, data: Record<string, unknown>): LandingRegistryEntry | null {
  const status = typeof data.status === 'string' ? data.status : ''
  const templateId = typeof data.template_id === 'string' ? data.template_id : ''
  if (!LANDING_STATUSES.has(status) || !TEMPLATE_IDS.has(templateId)) return null

  const slug = typeof data.slug === 'string' ? data.slug : id
  const landingId = typeof data.landing_id === 'string' ? data.landing_id : id
  const campaignId = typeof data.campaign_id === 'string' ? data.campaign_id : ''
  if (!slug || slug !== id || !landingId || !campaignId) return null

  return {
    landingId,
    slug,
    name: typeof data.name === 'string' ? data.name : slug,
    status: status as LandingRegistryEntry['status'],
    campaignId,
    templateId: templateId as LandingRegistryEntry['templateId'],
    defaultVariant: (
      typeof data.default_variant === 'string' ? data.default_variant : 'default'
    ) as LandingRegistryEntry['defaultVariant'],
    market: typeof data.market === 'string' ? data.market : 'laos',
    defaultLanguage: typeof data.default_language === 'string' ? data.default_language : 'vi',
    claimMode: data.claim_mode === 'claim_gated' ? 'claim_gated' : 'zero_claim',
    activeVersion: typeof data.active_version === 'number' ? data.active_version : 1,
    latestVersion: typeof data.latest_version === 'number'
      ? data.latest_version
      : typeof data.active_version === 'number'
        ? data.active_version
        : 1,
    analyticsEnabled: data.analytics_enabled !== false,
    formId: typeof data.form_id === 'string' ? data.form_id : '',
    formRefs: data.form_refs && typeof data.form_refs === 'object' && !Array.isArray(data.form_refs)
      ? Object.fromEntries(
        Object.entries(data.form_refs).filter((entry): entry is [string, string] => (
          typeof entry[1] === 'string'
        ))
      )
      : {},
    createdAt: typeof data.created_at === 'string' ? data.created_at : undefined,
    createdBy: typeof data.created_by === 'string' ? data.created_by : undefined,
    updatedAt: typeof data.updated_at === 'string' ? data.updated_at : undefined,
    updatedBy: typeof data.updated_by === 'string' ? data.updated_by : undefined,
  }
}

export function shouldUseSourceLockedHostingFallback(
  status: number,
  contentType: string | null,
  fallback: LandingRegistryEntry | null
) {
  return Boolean(
    fallback
    && status === 404
    && contentType?.toLowerCase().includes('text/html')
  )
}

export async function getLandingRuntimeConfig(slug: string) {
  const fallback = getLandingBySlug(slug)
  if (import.meta.env.VITE_USE_CLOUD_FUNCTIONS !== 'true') return fallback

  const configuredEndpoint = import.meta.env.VITE_LANDING_CONFIG_API_URL
  const endpoint = configuredEndpoint || (import.meta.env.PROD ? '/api/landing-config' : null)
  if (!endpoint) return fallback

  try {
    const response = await fetch(`${endpoint}?slug=${encodeURIComponent(slug)}`, {
      headers: { Accept: 'application/json' },
    })
    if (shouldUseSourceLockedHostingFallback(
      response.status,
      response.headers.get('content-type'),
      fallback
    )) {
      console.warn('Landing Config Function is unavailable; using the source-locked published registry.')
      return fallback
    }
    if (response.status === 404 || response.status === 409) return null
    if (!response.ok) throw new Error(`Landing config API failed with ${response.status}`)
    const body = await response.json()
    return parseLandingDocument(slug, body?.data || {}) || null
  } catch (error) {
    console.error('Landing metadata unavailable; production resolution is fail-closed.', error)
    return null
  }
}
