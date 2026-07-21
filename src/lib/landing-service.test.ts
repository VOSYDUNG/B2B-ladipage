import assert from 'node:assert/strict'
import test from 'node:test'
import { landingRegistry } from '@/config/landing-registry'
import { parseLandingDocument, shouldUseSourceLockedHostingFallback } from './landing-service'

test('allows a source-locked fallback only for the missing Hosting rewrite response', () => {
  const fallback = landingRegistry['white-lotus']
  assert.equal(shouldUseSourceLockedHostingFallback(404, 'text/html; charset=UTF-8', fallback), true)
  assert.equal(shouldUseSourceLockedHostingFallback(404, 'application/json', fallback), false)
  assert.equal(shouldUseSourceLockedHostingFallback(409, 'text/html', fallback), false)
  assert.equal(shouldUseSourceLockedHostingFallback(500, 'text/html', fallback), false)
  assert.equal(shouldUseSourceLockedHostingFallback(404, 'text/html', null), false)
})

test('parses the published NNC v2 template contract', () => {
  const parsed = parseLandingDocument('nnc-b2b-online-rewards-q3-2026', {
    slug: 'nnc-b2b-online-rewards-q3-2026',
    landing_id: 'nnc-b2b-online-rewards-q3-2026',
    campaign_id: 'NNC_B2B_ONLINE_REWARDS_Q3_2026',
    status: 'published',
    template_id: 'nnc_b2b_rewards_v2',
    default_variant: 'clinical-progress',
    active_version: 2,
    latest_version: 2,
  })

  assert.equal(parsed?.templateId, 'nnc_b2b_rewards_v2')
  assert.equal(parsed?.defaultVariant, 'clinical-progress')
  assert.equal(parsed?.activeVersion, 2)
})
