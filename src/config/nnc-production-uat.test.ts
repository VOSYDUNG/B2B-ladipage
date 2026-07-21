import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  canParticipateInNncCampaign,
  NNC_PRODUCTION_UAT_ALLOW_MISSING_APP_CHECK,
  NNC_PRODUCTION_UAT_BANNER,
  NNC_PRODUCTION_UAT_OPEN
} from './nnc-production-uat';

test('NNC production UAT override is explicit and easy to disable', () => {
  assert.equal(NNC_PRODUCTION_UAT_OPEN, true);
  assert.equal(NNC_PRODUCTION_UAT_ALLOW_MISSING_APP_CHECK, true);
  assert.equal(NNC_PRODUCTION_UAT_BANNER, 'UAT đang mở trên production');

  assert.equal(canParticipateInNncCampaign('upcoming', true), true);
  assert.equal(canParticipateInNncCampaign('ended', true), true);
  assert.equal(canParticipateInNncCampaign('active', false), true);
  assert.equal(canParticipateInNncCampaign('upcoming', false), false);
  assert.equal(canParticipateInNncCampaign('ended', false), false);
});
