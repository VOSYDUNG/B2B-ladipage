import type { UnifiedLead } from '@/types'

const csvCell = (value: unknown) => {
  const normalized = value == null ? '' : String(value).replace(/\r?\n/g, ' ').trim()
  const formulaSafe = /^[=+\-@]/.test(normalized) ? `'${normalized}` : normalized
  return `"${formulaSafe.replace(/"/g, '""')}"`
}

const leadIdentity = (lead: UnifiedLead) => ({
  pharmacyName: lead.identity?.pharmacy_name || lead.pharmacy_name || '',
  contactName: lead.identity?.contact_name || lead.contact_name || '',
  phone: lead.identity?.phone || lead.phone_number || '',
  province: lead.identity?.province || lead.province || '',
})

export function serializeLeadsCsv(leads: UnifiedLead[]) {
  const headers = [
    'lead_id',
    'campaign_id',
    'landing_id',
    'lead_type',
    'created_at',
    'pharmacy_name',
    'contact_name',
    'phone',
    'province',
    'form_id',
    'items',
    'need_type',
    'selected_value',
    'currency',
    'status',
    'source',
    'medium',
    'language',
  ]

  const rows = leads.map((lead) => {
    const identity = leadIdentity(lead)
    const items = (lead.selection?.items || [])
      .map((item) => `${item.product_id} x ${item.quantity}`)
      .join(' | ')
    return [
      lead.id,
      lead.attribution?.campaign_id || lead.campaign_id || '',
      lead.attribution?.landing_id || lead.landing_id || '',
      lead.attribution?.lead_type || lead.lead_type || '',
      lead.created_at,
      identity.pharmacyName,
      identity.contactName,
      identity.phone,
      identity.province,
      lead.form?.form_id || '',
      items,
      lead.selection?.need_type || '',
      lead.selection?.selected_package_value ?? '',
      lead.selection?.currency || '',
      lead.crm?.status || lead.status || 'NEW',
      lead.attribution?.source || lead.utm_source || '',
      lead.attribution?.medium || lead.utm_medium || '',
      lead.attribution?.language || lead.language || '',
    ].map(csvCell).join(',')
  })

  return `\uFEFF${headers.map(csvCell).join(',')}\r\n${rows.join('\r\n')}`
}

export function buildLeadExportFilename(campaignId: string, date = new Date()) {
  const safeCampaign = campaignId.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return `${safeCampaign || 'campaign'}-leads-${date.toISOString().slice(0, 10)}.csv`
}

export function downloadLeadsCsv(leads: UnifiedLead[], campaignId: string) {
  const blob = new Blob([serializeLeadsCsv(leads)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = buildLeadExportFilename(campaignId)
  anchor.click()
  URL.revokeObjectURL(url)
}
