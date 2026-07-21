import assert from 'node:assert/strict';
import test from 'node:test';
import {
  NNC_PARTICIPANT_SESSION_KEY,
  readNncParticipantSession,
  writeNncParticipantSession,
  type NncParticipantSession
} from './participant-session';

const expected = {
  campaignId: 'NNC_B2B_ONLINE_REWARDS_Q3_2026',
  landingId: 'nnc-b2b-online-rewards-q3-2026',
  landingVersion: 2
};

const makeSession = (savedAt = 100_000): NncParticipantSession => ({
  ...expected,
  savedAt,
  participantRecord: {
    participantId: 'lead-v1-nnc-1234567890abcdef',
    referralCode: 'NNC-1234567890ABCDEF'
  },
  registration: {
    fullName: 'UAT Owner',
    phone: '020 5555 5555',
    businessName: 'NNC UAT',
    role: 'pharmacy',
    referralCodeUsed: '',
    preferredContact: 'whatsapp'
  },
  quizAnswers: {
    product_interests: ['tadimax']
  }
});

const createStorage = () => {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
    values
  };
};

test('NNC participant session restores the persisted game handoff in the same browser tab', () => {
  const storage = createStorage();
  const session = makeSession();
  assert.equal(writeNncParticipantSession(storage, session), true);
  assert.deepEqual(readNncParticipantSession(storage, expected, session.savedAt + 1_000), session);
});

test('NNC participant session rejects stale or cross-campaign state', () => {
  const staleStorage = createStorage();
  writeNncParticipantSession(staleStorage, makeSession(100_000));
  assert.equal(readNncParticipantSession(staleStorage, expected, 100_000 + 12 * 60 * 60 * 1000 + 1), null);
  assert.equal(staleStorage.values.has(NNC_PARTICIPANT_SESSION_KEY), false);

  const otherCampaignStorage = createStorage();
  writeNncParticipantSession(otherCampaignStorage, makeSession());
  assert.equal(readNncParticipantSession(otherCampaignStorage, { ...expected, campaignId: 'OTHER' }, 101_000), null);
  assert.equal(otherCampaignStorage.values.has(NNC_PARTICIPANT_SESSION_KEY), false);
});

test('NNC participant session never accepts a non-persisted participant id', () => {
  const storage = createStorage();
  const invalid = makeSession();
  invalid.participantRecord.participantId = 'demo-participant';
  writeNncParticipantSession(storage, invalid);
  assert.equal(readNncParticipantSession(storage, expected, 101_000), null);
});
