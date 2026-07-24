import { INITIAL_STATE } from './reducer';
import type { CampaignState } from './types';

const STORAGE_KEY = 'nnc-b2b-q3-2026-session-v2';

export function loadCampaignState(): CampaignState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw) as Partial<CampaignState>;
    return {
      ...INITIAL_STATE,
      ...parsed,
      dialogOpen: false,
      step: 'browse',
      firestoreStatus: 'idle',
    };
  } catch {
    return INITIAL_STATE;
  }
}

export function saveCampaignState(state: CampaignState): void {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        locale: state.locale,
        registration: state.registration,
        selectedTierId: state.selectedTierId,
        policyAcknowledged: state.policyAcknowledged,
        spin: state.spin,
        cart: state.cart,
      }),
    );
  } catch {
    // Session persistence is optional. The flow remains usable without it.
  }
}
