import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { UnifiedLead } from '@/types'
import { buildLeadExportFilename, serializeLeadsCsv } from './lead-export'

const lead: UnifiedLead = {
  id: 'lead-1',
  created_at: '2026-07-20T08:00:00.000Z',
  updated_at: '2026-07-20T08:00:00.000Z',
  attribution: {
    campaign_id: 'WL_NEW_PRODUCTS_2026_Q3',
    landing_id: 'white-lotus',
    lead_type: 'ORDER',
    source: 'direct',
  },
  identity: {
    pharmacy_name: '=unsafe formula',
    contact_name: 'An',
    phone: '+856 20 1234 5678',
    province: 'Vientiane',
  },
  selection: {
    items: [{ product_id: 'lotofex-200', quantity: 4 }],
    selected_package_value: 220000,
    currency: 'LAK',
  },
  crm: { status: 'NEW' },
}

test('serializes campaign Lead data with UTF-8 BOM and formula protection', () => {
  const csv = serializeLeadsCsv([lead])
  assert.equal(csv.charCodeAt(0), 0xFEFF)
  assert.match(csv, /"'\=unsafe formula"/)
  assert.match(csv, /"'\+856 20 1234 5678"/)
  assert.match(csv, /"lotofex-200 x 4"/)
})

test('builds a stable campaign export filename', () => {
  assert.equal(
    buildLeadExportFilename('WL_NEW_PRODUCTS_2026_Q3', new Date('2026-07-20T00:00:00Z')),
    'wl-new-products-2026-q3-leads-2026-07-20.csv',
  )
})
