import type {
  DeliveryDailyStat,
  LeadIntegrationWorkspace,
  WebhookDelivery,
  WebhookDeliveryActivity,
  WebhookDeliveryAttempt,
  WebhookDeliveryDetail,
  WebhookDeliveryStatus,
} from '@/types'
import { getAppCheckToken } from '@/lib/firebase'

const getAdminIntegrationApiUrl = () => (
  import.meta.env.VITE_ADMIN_INTEGRATION_API_URL || '/api/admin/integrations'
)

async function getAdminHeaders(idempotency = false) {
  const [{ auth }, appCheckToken] = await Promise.all([
    import('@/firebase'),
    getAppCheckToken(),
  ])
  const firebaseUser = auth.currentUser
  if (!firebaseUser) throw new Error('Admin session is unavailable')
  const idToken = await firebaseUser.getIdToken()
  const randomKey = globalThis.crypto?.randomUUID?.()
    || `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`
  return {
    Authorization: `Bearer ${idToken}`,
    'Content-Type': 'application/json',
    ...(appCheckToken ? { 'X-Firebase-AppCheck': appCheckToken } : {}),
    ...(idempotency ? { 'Idempotency-Key': `integration-${randomKey}` } : {}),
  }
}

function parseDelivery(data: Record<string, unknown>): WebhookDelivery {
  return {
    deliveryId: String(data.delivery_id || ''),
    eventId: String(data.event_id || ''),
    destinationId: String(data.destination_id || ''),
    contractVersion: 'redacted_lead_event_v1',
    leadFeatureId: typeof data.lead_feature_id === 'string' ? data.lead_feature_id : null,
    eventType: String(data.event_type || 'lead.created') as WebhookDelivery['eventType'],
    landingId: String(data.landing_id || ''),
    campaignId: String(data.campaign_id || ''),
    status: String(data.status || 'held') as WebhookDeliveryStatus,
    attemptCount: Number(data.attempt_count || 0),
    projectionSha256: String(data.projection_sha256 || ''),
    nextAttemptAt: typeof data.next_attempt_at === 'string' ? data.next_attempt_at : null,
    leaseExpiresAt: typeof data.lease_expires_at === 'string' ? data.lease_expires_at : null,
    lastHttpStatus: typeof data.last_http_status === 'number' ? data.last_http_status : null,
    lastErrorCode: typeof data.last_error_code === 'string' ? data.last_error_code : null,
    failureReason: typeof data.failure_reason === 'string' ? data.failure_reason : null,
    releasedBy: typeof data.released_by === 'string' ? data.released_by : null,
    releasedAt: typeof data.released_at === 'string' ? data.released_at : null,
    deliveredAt: typeof data.delivered_at === 'string' ? data.delivered_at : null,
    createdAt: typeof data.created_at === 'string' ? data.created_at : null,
    updatedAt: typeof data.updated_at === 'string' ? data.updated_at : null,
  }
}

function parseDailyStat(data: Record<string, unknown>): DeliveryDailyStat {
  return {
    statId: String(data.stat_id || ''),
    date: String(data.date || ''),
    destinationId: String(data.destination_id || ''),
    releasedEvents: Number(data.released_events || 0),
    attempts: Number(data.attempts || 0),
    deliveredEvents: Number(data.delivered_events || 0),
    retryScheduled: Number(data.retry_scheduled || 0),
    deadLetterEvents: Number(data.dead_letter_events || 0),
    deliveryLatencySumMs: Number(data.delivery_latency_sum_ms || 0),
  }
}

export interface IntegrationFilters {
  status?: WebhookDeliveryStatus | ''
  landingId?: string
  campaignId?: string
  eventType?: WebhookDelivery['eventType'] | ''
  cursor?: string
}

export async function fetchAdminIntegrationWorkspace(
  filters: IntegrationFilters = {}
): Promise<LeadIntegrationWorkspace> {
  const headers = await getAdminHeaders()
  const query = new URLSearchParams({ limit: '100' })
  if (filters.status) query.set('status', filters.status)
  if (filters.landingId) query.set('landing_id', filters.landingId)
  if (filters.campaignId) query.set('campaign_id', filters.campaignId)
  if (filters.eventType) query.set('event_type', filters.eventType)
  if (filters.cursor) query.set('cursor', filters.cursor)
  const response = await fetch(`${getAdminIntegrationApiUrl()}?${query}`, {
    method: 'GET',
    headers,
  })
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(body?.message || `Admin Integration API failed with ${response.status}`)
  }
  const data = body?.data || {}
  return {
    destination: {
      destinationId: String(data.destination?.destination_id || ''),
      contractVersion: 'redacted_lead_event_v1',
      deliveryMode: data.destination?.delivery_mode === 'enabled' ? 'enabled' : 'off',
      configured: data.destination?.configured === true,
      urlFingerprint: typeof data.destination?.url_fingerprint === 'string'
        ? data.destination.url_fingerprint
        : null,
    },
    deliveries: (Array.isArray(data.deliveries) ? data.deliveries : []).map(parseDelivery),
    dailyStats: (Array.isArray(data.daily_stats) ? data.daily_stats : []).map(parseDailyStat),
    health: {
      held: Number(data.health?.held || 0),
      pending: Number(data.health?.pending || 0),
      retryWait: Number(data.health?.retry_wait || 0),
      deadLetter: Number(data.health?.dead_letter || 0),
      deliveredToday: Number(data.health?.delivered_today || 0),
      oldestActionableAt: typeof data.health?.oldest_actionable_at === 'string'
        ? data.health.oldest_actionable_at
        : null,
    },
    permissions: { canOperate: data.permissions?.can_operate === true },
    limit: Number(data.limit || 100),
    truncated: data.truncated === true,
    nextCursor: typeof data.next_cursor === 'string' ? data.next_cursor : null,
  }
}

export async function executeIntegrationCommand(
  action: 'release_delivery' | 'retry_delivery',
  deliveryId: string,
  note: string
) {
  const headers = await getAdminHeaders(true)
  const response = await fetch(getAdminIntegrationApiUrl(), {
    method: 'POST',
    headers,
    body: JSON.stringify({ action, delivery_id: deliveryId, note }),
  })
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(body?.message || `Integration action failed with ${response.status}`)
  }
  return parseDelivery(body?.data?.delivery || {})
}

export async function fetchWebhookDeliveryDetail(
  deliveryId: string
): Promise<WebhookDeliveryDetail> {
  const headers = await getAdminHeaders()
  const query = new URLSearchParams({ view: 'attempts', delivery_id: deliveryId })
  const response = await fetch(`${getAdminIntegrationApiUrl()}?${query}`, {
    method: 'GET',
    headers,
  })
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(body?.message || `Delivery detail failed with ${response.status}`)
  }
  const data = body?.data || {}
  return {
    delivery: parseDelivery(data.delivery || {}),
    attempts: (Array.isArray(data.attempts) ? data.attempts : []).map(
      (attempt: Record<string, unknown>): WebhookDeliveryAttempt => ({
        attemptId: String(attempt.attempt_id || ''),
        attemptNumber: Number(attempt.attempt_number || 0),
        startedAt: typeof attempt.started_at === 'string' ? attempt.started_at : null,
        completedAt: typeof attempt.completed_at === 'string' ? attempt.completed_at : null,
        outcome: String(attempt.outcome || 'dead_letter') as WebhookDeliveryAttempt['outcome'],
        httpStatus: typeof attempt.http_status === 'number' ? attempt.http_status : null,
        errorCode: typeof attempt.error_code === 'string' ? attempt.error_code : null,
        responseBodyStored: false,
      })
    ),
    activities: (Array.isArray(data.activities) ? data.activities : []).map(
      (activity: Record<string, unknown>): WebhookDeliveryActivity => ({
        activityId: String(activity.activity_id || ''),
        type: String(activity.type || 'delivery_released') as WebhookDeliveryActivity['type'],
        actorId: typeof activity.actor_id === 'string' ? activity.actor_id : null,
        actorRole: typeof activity.actor_role === 'string' ? activity.actor_role : null,
        previousStatus: typeof activity.previous_status === 'string'
          ? activity.previous_status as WebhookDeliveryStatus
          : null,
        newStatus: typeof activity.new_status === 'string'
          ? activity.new_status as WebhookDeliveryStatus
          : null,
        note: typeof activity.note === 'string' ? activity.note : null,
        createdAt: typeof activity.created_at === 'string' ? activity.created_at : null,
      })
    ),
  }
}
