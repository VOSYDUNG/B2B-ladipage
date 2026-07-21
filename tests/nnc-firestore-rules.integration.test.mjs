import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test, { after, before, beforeEach } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment
} from '@firebase/rules-unit-testing';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectId = 'demo-nnc-campaign-rules-test';
let testEnvironment;

const baseCrm = {
  status: 'NEW',
  owner_id: null,
  next_action_at: null,
  lead_score: null,
  lost_reason: null,
  converted_order_value: null
};

const attributionOptionalFields = {
  medium: null,
  campaign: null,
  content: null,
  referrer: null
};

function nncLead(overrides = {}) {
  return {
    schema_version: 'public_lead_v1',
    form: {
      form_id: 'nnc-rewards-order',
      version_number: 1,
      flow_key: 'rewards_order'
    },
    attribution: {
      landing_id: 'nnc-b2b-online-rewards-q3-2026',
      landing_version: 2,
      campaign_id: 'NNC_B2B_ONLINE_REWARDS_Q3_2026',
      template_id: 'nnc_b2b_rewards_v2',
      variant_id: 'clinical-progress',
      language: 'vi',
      source: 'direct',
      ...attributionOptionalFields,
      lead_type: 'PARTICIPANT'
    },
    identity: {
      pharmacy_name: 'UAT Pharmacy',
      province: 'Vientiane',
      contact_name: 'UAT Owner',
      phone: '020000235'
    },
    selection: {
      package_id: 'nnc_rewards_b2b',
      reward_option: 'pending_confirmation',
      currency: 'LAK',
      need_type: 'herbal'
    },
    crm: { ...baseCrm },
    compliance: {
      contact_consent: true,
      privacy_version: 'lead_form_v1'
    },
    ingestion: {
      mode: 'firestore_web_uat_v1',
      app_check_required: false
    },
    role: 'pharmacy',
    category_interest: 'herbal',
    product_interests: ['tadimax'],
    answers_json: JSON.stringify({
      role: 'pharmacy',
      category_interest: 'herbal',
      product_interests: ['tadimax'],
      program_comprehension: 'accumulated',
      purchase_intent_range: 'under_2m',
      support_needs: ['product_info']
    }),
    purchase_intent_range: 'under_2m',
    support_needs: ['product_info'],
    preferred_contact: 'whatsapp',
    referral_code_used: '',
    referral_code_owned: 'NNC-1234567890ABCDEF',
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    ...overrides
  };
}

function whiteLotusLead() {
  return {
    schema_version: 'public_lead_v1',
    form: {
      form_id: 'white-lotus-order',
      version_number: 1,
      flow_key: 'product_order'
    },
    attribution: {
      landing_id: 'white-lotus',
      landing_version: 1,
      campaign_id: 'WL_NEW_PRODUCTS_2026_Q3',
      template_id: 'white_lotus_order_v1',
      variant_id: 'default',
      language: 'vi',
      source: 'direct',
      ...attributionOptionalFields,
      lead_type: 'ORDER'
    },
    identity: {
      pharmacy_name: 'Compatibility Pharmacy',
      province: 'Vientiane',
      contact_name: 'Compatibility Owner',
      phone: '02055555555'
    },
    selection: {
      items: [{ product_id: 'lotofex-200', quantity: 1 }],
      package_id: 'white_lotus_order',
      reward_option: 'product',
      selected_package_value: 100000,
      currency: 'LAK'
    },
    crm: { ...baseCrm },
    compliance: {
      contact_consent: true,
      privacy_version: 'lead_form_v1'
    },
    ingestion: {
      mode: 'firestore_web_v1',
      app_check_required: true
    },
    created_at: serverTimestamp(),
    updated_at: serverTimestamp()
  };
}

function whiteLotusSampleLead() {
  return {
    ...whiteLotusLead(),
    form: {
      form_id: 'white-lotus-sample-request',
      version_number: 1,
      flow_key: 'sample_request'
    },
    attribution: {
      ...whiteLotusLead().attribution,
      lead_type: 'SAMPLE_REQUEST'
    },
    selection: {
      items: [{ product_id: 'fexentrix-60', quantity: 1 }],
      package_id: 'sample_request',
      reward_option: 'sample',
      currency: 'LAK',
      need_type: 'sample'
    },
    compliance: {
      contact_consent: false,
      privacy_version: 'lead_form_v1'
    },
    ingestion: {
      mode: 'firestore_web_uat_v1',
      app_check_required: false
    }
  };
}

before(async () => {
  const rules = fs.readFileSync(path.join(__dirname, '..', 'firestore.rules'), 'utf8');
  testEnvironment = await initializeTestEnvironment({
    projectId,
    firestore: { rules }
  });
});

beforeEach(async () => {
  await testEnvironment.clearFirestore();
  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'system_settings', 'public_lead_intake'), {
      enabled: true,
      app_check_enforced: true
    });
  });
});

after(async () => {
  await testEnvironment?.cleanup();
});

test('anonymous NNC UAT participant create is allowed through the direct Firestore boundary', async () => {
  const db = testEnvironment.unauthenticatedContext().firestore();
  await assertSucceeds(setDoc(
    doc(db, 'leads', 'lead-v1-nnc-1234567890abcdef1234567890abcdef12345678'),
    nncLead()
  ));
});

test('NNC normal App Check-labelled ingestion remains compatible while enforcement is external', async () => {
  const db = testEnvironment.unauthenticatedContext().firestore();
  await assertSucceeds(setDoc(
    doc(db, 'leads', 'lead-v1-nnc-abcdef1234567890abcdef1234567890abcdef12'),
    nncLead({ ingestion: { mode: 'firestore_web_v1', app_check_required: true } })
  ));
});

test('NNC public create is not blocked by a persisted non-staff Firebase Auth session', async () => {
  const db = testEnvironment.authenticatedContext('uat-browser-user', {
    email: 'uat.browser@example.com',
    email_verified: true,
    role: 'consumer'
  }).firestore();
  await assertSucceeds(setDoc(
    doc(db, 'leads', 'lead-v1-nnc-9876543210abcdef9876543210abcdef98765432'),
    nncLead()
  ));
});

test('NNC maximal valid selection remains below the Rules expression ceiling', async () => {
  const db = testEnvironment.unauthenticatedContext().firestore();
  const productIds = [
    'tadimax',
    'bai-thach',
    'cv-mox-1000',
    'nc-cv-mox-625',
    'cv-mox-228.5',
    'cefixad-100mg',
    'azihadi'
  ];
  const supportNeeds = [
    'product_info',
    'price_policy',
    'samples',
    'inventory_delivery',
    'direct_sales',
    'accumulation_rewards'
  ];
  await assertSucceeds(setDoc(
    doc(db, 'leads', 'lead-v1-nnc-fallbackhashwithbase36letters123456789'),
    nncLead({
      product_interests: productIds,
      support_needs: supportNeeds,
      selection: {
        package_id: 'nnc_rewards_b2b',
        reward_option: 'pending_confirmation',
        currency: 'LAK',
        need_type: 'multiple'
      },
      category_interest: 'multiple',
      answers_json: JSON.stringify({
        role: 'pharmacy',
        category_interest: 'multiple',
        product_interests: productIds,
        program_comprehension: 'accumulated',
        purchase_intent_range: 'above_25m',
        support_needs: supportNeeds
      }),
      purchase_intent_range: 'above_25m'
    })
  ));
});

test('NNC create rejects browser-selected reward fields and invalid product ids', async () => {
  const db = testEnvironment.unauthenticatedContext().firestore();
  await assertFails(setDoc(
    doc(db, 'leads', 'lead-v1-nnc-1111111111111111111111111111111111111111'),
    nncLead({ wheel_reward_id: 'client-selected' })
  ));
  await assertFails(setDoc(
    doc(db, 'leads', 'lead-v1-nnc-2222222222222222222222222222222222222222'),
    nncLead({
      product_interests: ['not-a-real-product'],
      selection: {
        package_id: 'nnc_rewards_b2b',
        reward_option: 'pending_confirmation',
        currency: 'LAK',
        need_type: 'herbal'
      }
    })
  ));
});

test('existing White Lotus direct Firestore create remains allowed', async () => {
  const db = testEnvironment.unauthenticatedContext().firestore();
  await assertSucceeds(setDoc(
    doc(db, 'leads', 'lead-v1-1234567890abcdef'),
    whiteLotusLead()
  ));
});

test('White Lotus UAT order and sample request can persist without browser App Check', async () => {
  const db = testEnvironment.unauthenticatedContext().firestore();
  await assertSucceeds(setDoc(
    doc(db, 'leads', 'lead-v1-white-lotus-order-1234567890'),
    {
      ...whiteLotusLead(),
      ingestion: { mode: 'firestore_web_uat_v1', app_check_required: false }
    }
  ));
  await assertSucceeds(setDoc(
    doc(db, 'leads', 'lead-v1-white-lotus-sample-123456789'),
    whiteLotusSampleLead()
  ));
});

test('public clients cannot read White Lotus Lead PII after a successful create', async () => {
  const db = testEnvironment.unauthenticatedContext().firestore();
  const leadRef = doc(db, 'leads', 'lead-v1-white-lotus-private-123456789');
  await assertSucceeds(setDoc(leadRef, {
    ...whiteLotusLead(),
    ingestion: { mode: 'firestore_web_uat_v1', app_check_required: false }
  }));
  await assertFails(getDoc(leadRef));
});

test('lead updates remain denied after creation', async () => {
  const db = testEnvironment.unauthenticatedContext().firestore();
  const leadRef = doc(db, 'leads', 'lead-v1-nnc-3333333333333333333333333333333333333333');
  await assertSucceeds(setDoc(leadRef, nncLead()));
  await assertFails(setDoc(leadRef, nncLead({ preferred_contact: 'phone' })));
  assert.ok(true);
});
