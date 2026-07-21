import type { LandingVariant } from '@/types'

export type AnalyticsPayload = Record<string, string | number | boolean | undefined>

const PII_PARAM_KEY = /(^|_)(address|contact_name|email|full_name|lead_id|note|participant_id|pharmacy_name|phone|referral_code)(_|$)/i
export const ANALYTICS_EVENT_CHANNEL = 'nnc:analytics-event'
const inMemoryFlowIds = new Map<string, string>()

function createAnalyticsId(prefix: string) {
  const token = globalThis.crypto?.randomUUID?.()
    ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
  return `${prefix}-${token}`
}

export function getAnalyticsFlowId(landingId: string) {
  const storageKey = `nnc:analytics-flow:${landingId}`
  const cached = inMemoryFlowIds.get(storageKey)
  if (cached) return cached

  try {
    const stored = window.sessionStorage.getItem(storageKey)
    if (stored) {
      inMemoryFlowIds.set(storageKey, stored)
      return stored
    }
    const created = createAnalyticsId('flow')
    window.sessionStorage.setItem(storageKey, created)
    inMemoryFlowIds.set(storageKey, created)
    return created
  } catch {
    const created = createAnalyticsId('flow')
    inMemoryFlowIds.set(storageKey, created)
    return created
  }
}

export async function trackEvent(name: string, params: AnalyticsPayload = {}) {
  const sanitized = Object.fromEntries(
    Object.entries({ event_id: createAnalyticsId('evt'), ...params })
      .filter(([key, value]) => value !== undefined && !PII_PARAM_KEY.test(key)),
  ) as Record<string, string | number | boolean>

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(ANALYTICS_EVENT_CHANNEL, {
        detail: { name, params: sanitized },
      }),
    )
  }

  const { getAnalyticsClient } = await import('@/lib/firebase')
  const analytics = await getAnalyticsClient()
  if (!analytics) return
  const { logEvent } = await import('firebase/analytics')
  logEvent(analytics, name, sanitized)
}

export function landingParams({
  landingId,
  campaignId,
  templateId,
  variantId = 'default',
  language = 'vi',
  market = 'laos',
  landingVersion = 1,
  pageId = 'main',
}: {
  landingId: string
  campaignId: string
  templateId: string
  variantId?: string
  language?: string
  market?: string
  landingVersion?: number
  pageId?: string
}) {
  return {
    landing_id: landingId,
    campaign_id: campaignId,
    page_id: pageId,
    template_id: templateId,
    market,
    variant_id: variantId,
    language,
    landing_version: landingVersion,
    flow_id: getAnalyticsFlowId(landingId),
  }
}

export function campaignParams(
  variant: LandingVariant,
  language: string = 'vi',
  campaignId: string = 'VG5_KMK_LAO_2026',
  landingId: string = 'vg5-kmk',
  landingVersion = 1,
) {
  return landingParams({
    landingId,
    campaignId,
    templateId: 'pharmacy_trade_v1',
    variantId: variant,
    language,
    landingVersion,
  })
}
