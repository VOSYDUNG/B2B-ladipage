import type { NncRegistrationValues } from './registration-form';

export const NNC_PARTICIPANT_SESSION_KEY = 'nnc_q3_participant_session_v2';
const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000;

export interface NncParticipantSession {
  campaignId: string;
  landingId: string;
  landingVersion: number;
  savedAt: number;
  participantRecord: {
    participantId: string;
    referralCode: string;
  };
  registration: NncRegistrationValues;
  quizAnswers: Record<string, unknown>;
  rewardResultId?: string;
  cartItems?: Array<{ product_id: string; quantity: number }>;
  cartTotal?: number;
}

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const isRegistration = (value: unknown): value is NncRegistrationValues => {
  if (!isRecord(value)) return false;
  return typeof value.fullName === 'string'
    && typeof value.phone === 'string'
    && typeof value.businessName === 'string'
    && (typeof value.role === 'string' || typeof value.province === 'string')
    && typeof value.referralCodeUsed === 'string'
    && ['whatsapp', 'phone', 'other'].includes(String(value.preferredContact));
};

export function readNncParticipantSession(
  storage: Pick<Storage, 'getItem' | 'removeItem'>,
  expected: Pick<NncParticipantSession, 'campaignId' | 'landingId' | 'landingVersion'>,
  now = Date.now()
): NncParticipantSession | null {
  try {
    const raw = storage.getItem(NNC_PARTICIPANT_SESSION_KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (!isRecord(value)
      || value.campaignId !== expected.campaignId
      || value.landingId !== expected.landingId
      || value.landingVersion !== expected.landingVersion
      || typeof value.savedAt !== 'number'
      || value.savedAt > now
      || now - value.savedAt > SESSION_MAX_AGE_MS
      || !isRecord(value.participantRecord)
      || typeof value.participantRecord.participantId !== 'string'
      || !value.participantRecord.participantId.startsWith('lead-v1-nnc-')
      || typeof value.participantRecord.referralCode !== 'string'
      || !isRegistration(value.registration)) {
      storage.removeItem(NNC_PARTICIPANT_SESSION_KEY);
      return null;
    }

    if (!isRecord(value.quizAnswers)) {
      value.quizAnswers = {};
    }

    return value as unknown as NncParticipantSession;
  } catch {
    try { storage.removeItem(NNC_PARTICIPANT_SESSION_KEY); } catch { /* optional browser storage */ }
    return null;
  }
}

export function writeNncParticipantSession(
  storage: Pick<Storage, 'setItem'>,
  session: NncParticipantSession
): boolean {
  try {
    storage.setItem(NNC_PARTICIPANT_SESSION_KEY, JSON.stringify(session));
    return true;
  } catch {
    return false;
  }
}
