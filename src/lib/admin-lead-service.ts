import type { AiLeadFeature, UnifiedLead } from '@/types'
import { getAppCheckToken, getFirestoreClient } from '@/lib/firebase'

const FULL_LEAD_READ_ROLES = new Set(['super_admin', 'marketing_admin', 'sales_manager'])

const toIsoString = (value: unknown) => {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'toDate' in value) {
    const date = (value as { toDate: () => Date }).toDate()
    return date.toISOString()
  }
  return new Date(0).toISOString()
}

const normalizeLead = (id: string, raw: Record<string, unknown>): UnifiedLead => ({
  ...(raw as unknown as UnifiedLead),
  id,
  created_at: toIsoString(raw.created_at),
  updated_at: toIsoString(raw.updated_at || raw.created_at),
})

async function getLeadReadContext() {
  await getAppCheckToken().catch(() => null)
  const [{ auth }, db] = await Promise.all([
    import('@/firebase'),
    getFirestoreClient(),
  ])
  const firebaseUser = auth.currentUser
  if (!firebaseUser) throw new Error('CRM session is unavailable')
  if (!db) throw new Error('Firestore is unavailable')
  const token = await firebaseUser.getIdTokenResult()
  const role = typeof token.claims.role === 'string' ? token.claims.role : ''
  const email = firebaseUser.email?.toLowerCase() || ''
  const canReadAll = FULL_LEAD_READ_ROLES.has(role)
    || email === 'admin@nncpharma.com'

  return { db, email, role, canReadAll }
}

type AdminLeadQuery = {
  campaignId?: string
  readLimit?: number
}

export async function fetchAdminLeads(options: number | AdminLeadQuery = 500) {
  const { db, email, role, canReadAll } = await getLeadReadContext()
  const {
    collection,
    getDocs,
    limit,
    orderBy,
    query,
    where,
  } = await import('firebase/firestore')
  const readLimit = typeof options === 'number' ? options : options.readLimit ?? 500
  const campaignId = typeof options === 'number' ? undefined : options.campaignId?.trim()
  const boundedLimit = Math.min(500, Math.max(1, readLimit))
  const constraints = canReadAll
    ? [
        ...(campaignId ? [where('attribution.campaign_id', '==', campaignId)] : []),
        orderBy('created_at', 'desc'),
        limit(boundedLimit),
      ]
    : role === 'sales_rep'
      ? [
          where('crm.owner_id', '==', email),
          orderBy('created_at', 'desc'),
          limit(boundedLimit),
        ]
      : null

  if (!constraints) throw new Error('CRM role cannot read Lead data')

  const snapshot = await getDocs(query(collection(db, 'leads'), ...constraints))
  const normalizedLeads = snapshot.docs.map((leadDocument) => (
    normalizeLead(leadDocument.id, leadDocument.data())
  ))
  const leads = campaignId && !canReadAll
    ? normalizedLeads.filter((lead) => lead.attribution?.campaign_id === campaignId)
    : normalizedLeads
  return {
    leads,
    scope: canReadAll ? 'all' as const : 'assigned' as const,
    truncated: snapshot.size === boundedLimit,
  }
}

export async function updateAdminLead(
  _leadId: string,
  _crm: NonNullable<UnifiedLead['crm']>
): Promise<UnifiedLead> {
  throw new Error('Lead CRM is read-only in direct Firestore mode')
}

export async function deleteAdminLead(_leadId: string): Promise<void> {
  throw new Error('Lead CRM is read-only in direct Firestore mode')
}

export async function fetchAdminLeadFeature(_leadId: string): Promise<AiLeadFeature | null> {
  return null
}
