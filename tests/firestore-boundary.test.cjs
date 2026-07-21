const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const rules = fs.readFileSync(path.join(__dirname, '..', 'firestore.rules'), 'utf8');

test('sensitive backend-owned collections deny direct client access', () => {
  const deniedCollections = [
    'landing_pages',
    'landing_activities',
    'landing_versions',
    'forms',
    'claim_matrix',
    'claim_activities',
    'landing_assets',
    'landing_action_keys',
    'asset_replacement_jobs',
    'asset_replacement_activities',
    'asset_action_keys',
    'system_settings',
    'lead_admin_action_keys',
    'lead_outbox_events',
    'webhook_deliveries',
    'webhook_delivery_attempts',
    'webhook_delivery_activities',
    'webhook_action_keys',
    'stats_daily_delivery_v1',
    'ai_lead_features_v1',
    'ai_analysis_jobs',
    'ai_job_activities',
    'ai_analysis_results',
    'analytics_snapshots_v1',
  ];

  for (const collection of deniedCollections) {
    const escapedCollection = collection.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const collectionBlock = new RegExp(
      `match /${escapedCollection}/\\{[^}]+\\} \\{[\\s\\S]*?allow read, write: if false;[\\s\\S]*?\\n    \\}`,
      'm'
    );
    assert.match(rules, collectionBlock, `${collection} must deny direct client access`);
  }
});

test('Lead collection is create-only for public intake and read-only for internal CRM roles', () => {
  const start = rules.indexOf('match /leads/{leadId}');
  const end = rules.indexOf('match /lead_activities/{activityId}', start);
  assert.ok(start >= 0 && end > start, 'Lead rules block must be discoverable');
  const leadRules = rules.slice(start, end);

  assert.match(leadRules, /allow create: if publicLeadIntakeEnabled\(\)/);
  assert.match(leadRules, /allow read: if isStaff\(\)/);
  assert.match(leadRules, /hasRole\(\['sales_rep'\]\)/);
  assert.match(leadRules, /resource\.data\.crm\.owner_id == request\.auth\.token\.email/);
  assert.match(leadRules, /allow update, delete: if false/);
  assert.match(rules, /data\.created_at == request\.time/);
  assert.match(rules, /data\.ingestion\.app_check_required == true/);
  assert.match(rules, /data\.ingestion\.mode == 'firestore_web_uat_v1'/);
  assert.match(rules, /data\.ingestion\.app_check_required == false/);
  assert.match(rules, /validPublicLeadItem\(item\)/);
  assert.match(rules, /items\.size\(\) <= 4/);
  assert.match(rules, /items\.size\(\) <= 7/);
  assert.match(rules, /function validNncPublicLeadCreate\(leadId, data\)/);
  assert.match(leadRules, /isNncRewardsLead\(request\.resource\.data\)\s+&& validNncPublicLeadCreate\(leadId, request\.resource\.data\)/);
  assert.match(leadRules, /isWhiteLotusOrderLead\(request\.resource\.data\)\s+&& validWhiteLotusOrderCreate\(leadId, request\.resource\.data\)/);
  assert.match(leadRules, /!isNncRewardsLead\(request\.resource\.data\)\s+&& !isWhiteLotusOrderLead\(request\.resource\.data\)\s+&& validPublicLeadCreate\(leadId, request\.resource\.data\)/);
  assert.match(rules, /request\.auth == null \|\| isStaff\(\)/);
  const nncValidatorStart = rules.indexOf('function validNncPublicLeadCreate');
  const nncValidatorEnd = rules.indexOf('function validPublicLeadCreate', nncValidatorStart);
  const nncValidator = rules.slice(nncValidatorStart, nncValidatorEnd);
  assert.doesNotMatch(nncValidator, /wheel_reward_/);
  assert.match(nncValidator, /leadId\.matches\('\^lead-v1-nnc-\[a-z0-9\]/);
  assert.match(nncValidator, /data\.selection\.keys\(\)\.hasOnly\(\['package_id', 'reward_option', 'currency', 'need_type'\]\)/);
  assert.doesNotMatch(rules, /data\.wheel_reward_status in \['provisional', 'approved'\]/);
  assert.doesNotMatch(rules, /data\.wheel_reward_recorded_at == request\.time/);
  assert.doesNotMatch(rules, /wheel_reward_issued_at/);
  assert.match(rules, /data\.form\.flow_key == 'rewards_order'/);
  assert.match(rules, /data\.attribution\.lead_type == 'PARTICIPANT'/);
  assert.match(rules, /data\.attribution\.landing_version == 2/);
  assert.match(rules, /data\.attribution\.variant_id == 'clinical-progress'/);
  assert.match(rules, /request\.time >= timestamp\.value\(1785517200000\)/);
  assert.match(rules, /request\.time < timestamp\.value\(1790787600000\)/);
  assert.match(rules, /function nncProductionUatOpen\(\) \{\s+return true;/);
  assert.match(rules, /function whiteLotusProductionUatOpen\(\) \{\s+return true;/);
  assert.match(rules, /data\.attribution\.campaign_id == 'WL_NEW_PRODUCTS_2026_Q3'[\s\S]*?whiteLotusProductionUatOpen\(\)[\s\S]*?data\.ingestion\.mode == 'firestore_web_uat_v1'/);
  assert.match(rules, /isStaff\(\) \|\| nncProductionUatOpen\(\) \|\| nncCampaignIntakeOpen\(\)/);
  assert.match(rules, /data\.lead_score == null/);
  assert.match(rules, /item\.quantity <= 10000/);
  assert.match(rules, /'cv-mox-228\.5'/);
  assert.doesNotMatch(rules, /'cv-mok-228\.5'/);
  assert.match(rules, /system_settings\/public_lead_intake/);
  assert.match(rules, /data\.app_check_enforced == true/);
});

test('verified internal email is required for staff and AI records are API-only', () => {
  assert.match(
    rules,
    /function isStaff\(\) \{\s+return hasInternalEmail\(\);/,
    'staff access must require verified internal email'
  );
  assert.doesNotMatch(rules, /match \/ai_analysis_jobs\/\{jobId\} \{\s+allow read: if/);
});
