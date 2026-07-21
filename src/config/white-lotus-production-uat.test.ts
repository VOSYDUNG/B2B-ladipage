import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  WHITE_LOTUS_PRODUCTION_UAT_ALLOW_MISSING_APP_CHECK,
  WHITE_LOTUS_PRODUCTION_UAT_BANNER,
  WHITE_LOTUS_PRODUCTION_UAT_OPEN,
} from './white-lotus-production-uat'

test('White Lotus production UAT override is explicit and easy to disable', () => {
  assert.equal(WHITE_LOTUS_PRODUCTION_UAT_OPEN, true)
  assert.equal(WHITE_LOTUS_PRODUCTION_UAT_ALLOW_MISSING_APP_CHECK, true)
  assert.equal(WHITE_LOTUS_PRODUCTION_UAT_BANNER, 'White Lotus Firestore UAT đang mở')
})
