import assert from 'node:assert/strict'
import test from 'node:test'
import {
  WL_PROMOTION,
  getHighestEligibleWhiteLotusPromotionRule,
  getNextWhiteLotusPromotionRule,
  getWhiteLotusPromotionRules,
} from './white-lotus'

test('publishes the source-approved 4, 6 and 12 thresholds', () => {
  assert.equal(WL_PROMOTION.program_code, 'wl_tiered_4_6_12_v1')
  assert.deepEqual(
    WL_PROMOTION.rules.map(rule => [rule.level, rule.buy_quantity, rule.reward_kind]),
    [
      [1, 4, 'multi_vitamin'],
      [1, 6, 'multi_vitamin'],
      [2, 12, 'program_product'],
    ],
  )
})

test('groups the three thresholds into the two catalog levels', () => {
  assert.deepEqual(
    WL_PROMOTION.rules.map(rule => ({ threshold: rule.buy_quantity, level: rule.level })),
    [
      { threshold: 4, level: 1 },
      { threshold: 6, level: 1 },
      { threshold: 12, level: 2 },
    ],
  )
})

test('maps every product into an explicit three-column eligibility matrix', () => {
  const matrix = Object.fromEntries(
    ['fexentrix-60', 'etorilux-120', 'fexentrix-120', 'lotofex-200'].map(productId => [
      productId,
      [4, 6, 12].map(threshold => (
        getWhiteLotusPromotionRules(productId).some(rule => rule.buy_quantity === threshold)
      )),
    ]),
  )

  assert.deepEqual(matrix, {
    'fexentrix-60': [true, false, true],
    'etorilux-120': [false, true, true],
    'fexentrix-120': [true, false, true],
    'lotofex-200': [true, false, true],
  })
})

test('maps Lotofex and both Fexentrix products to the 4 and 12 thresholds', () => {
  for (const productId of ['lotofex-200', 'fexentrix-60', 'fexentrix-120']) {
    assert.deepEqual(getWhiteLotusPromotionRules(productId).map(rule => rule.buy_quantity), [4, 12])
    assert.equal(getHighestEligibleWhiteLotusPromotionRule(productId, 3), null)
    assert.equal(getHighestEligibleWhiteLotusPromotionRule(productId, 4)?.buy_quantity, 4)
    assert.equal(getHighestEligibleWhiteLotusPromotionRule(productId, 12)?.buy_quantity, 12)
  }
})

test('maps Etorilux to the 6 and 12 thresholds', () => {
  assert.deepEqual(getWhiteLotusPromotionRules('etorilux-120').map(rule => rule.buy_quantity), [6, 12])
  assert.equal(getHighestEligibleWhiteLotusPromotionRule('etorilux-120', 5), null)
  assert.equal(getHighestEligibleWhiteLotusPromotionRule('etorilux-120', 6)?.buy_quantity, 6)
  assert.equal(getHighestEligibleWhiteLotusPromotionRule('etorilux-120', 12)?.buy_quantity, 12)
})

test('reports the next threshold without inferring gift quantities or stacking', () => {
  assert.equal(getNextWhiteLotusPromotionRule('lotofex-200', 1)?.buy_quantity, 4)
  assert.equal(getNextWhiteLotusPromotionRule('lotofex-200', 4)?.buy_quantity, 12)
  assert.equal(getNextWhiteLotusPromotionRule('lotofex-200', 12), null)
  assert.equal(getWhiteLotusPromotionRules('unknown-product').length, 0)
})
