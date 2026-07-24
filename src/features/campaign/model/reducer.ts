import type { CampaignAction, CampaignState } from './types';

export const INITIAL_STATE: CampaignState = {
  step: 'browse',
  locale: 'vi',
  dialogOpen: false,
  registration: null,
  selectedTierId: null,
  policyAcknowledged: false,
  spin: null,
  cart: [],
  firestoreStatus: 'idle',
};

export function campaignReducer(
  state: CampaignState,
  action: CampaignAction,
): CampaignState {
  switch (action.type) {
    case 'SET_LOCALE':
      return { ...state, locale: action.locale };
    case 'OPEN_FLOW':
      return {
        ...state,
        dialogOpen: true,
        step: action.step ?? (state.registration ? 'policy' : 'register'),
      };
    case 'CLOSE_FLOW':
      return { ...state, dialogOpen: false };
    case 'GO_TO_STEP':
      return { ...state, dialogOpen: true, step: action.step };
    case 'SAVE_REGISTRATION':
      return {
        ...state,
        registration: action.registration,
        step: 'policy',
        dialogOpen: true,
      };
    case 'SELECT_TIER':
      return { ...state, selectedTierId: action.tierId };
    case 'ACKNOWLEDGE_POLICY':
      return { ...state, policyAcknowledged: action.value };
    case 'SAVE_SPIN':
      return { ...state, spin: action.spin, step: 'spin', dialogOpen: true };
    case 'SET_CART_QUANTITY': {
      const quantity = Math.max(0, Math.min(999, Math.trunc(action.quantity)));
      const existing = state.cart.find((line) => line.productId === action.productId);
      const nextCart = existing
        ? state.cart.map((line) =>
            line.productId === action.productId ? { ...line, quantity } : line,
          )
        : [...state.cart, { productId: action.productId, quantity }];
      return { ...state, cart: nextCart.filter((line) => line.quantity > 0) };
    }
    case 'SET_FIRESTORE_STATUS':
      return { ...state, firestoreStatus: action.status };
    case 'RESET_FLOW':
      return { ...INITIAL_STATE, locale: state.locale };
    default:
      return state;
  }
}
