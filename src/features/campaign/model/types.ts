export type Locale = 'vi' | 'lo';

export type CampaignStep =
  | 'browse'
  | 'register'
  | 'policy'
  | 'spin'
  | 'cart'
  | 'complete';

export type BusinessRole = 'pharmacy' | 'clinic' | 'dealer' | 'doctor';
export type BusinessType = 'hospital_clinic' | 'pharmacy';

export interface Product {
  id: string;
  name: string;
  image: string;
  packVi: string;
  packLo: string;
  priceKip: number;
  formulation?: string;
  descriptionVi?: string;
  descriptionLo?: string;
  categoryVi?: string;
  categoryLo?: string;
  isFlagship?: boolean;
}

export interface Tier {
  id: string;
  nameVi: string;
  nameLo: string;
  minRevenueKip: number;
  maxRevenueKip: number | null;
  immediateDiscountPercent: number;
  quarterRewardPercent: number;
  totalBenefitPercent: number;
  giftValueKip?: number | null;
}

export type RewardStatus = 'active' | 'pending';

export interface Reward {
  id: string;
  nameVi: string;
  nameLo: string;
  shortVi: string;
  shortLo: string;
  weight: number;
  status: RewardStatus;
  wheelIndex: number;
  conditionVi?: string;
  conditionLo?: string;
  image?: string;
}

export interface RegistrationData {
  role?: BusinessRole;
  fullName: string;
  phone: string;
  businessName: string;
  businessType: BusinessType;
  dob: string;
  province: string;
  referralCode: string;
  contactPref?: 'whatsapp' | 'call' | 'other';
  consent: boolean;
}

export interface CartLine {
  productId: string;
  quantity: number;
}

export interface SpinResult {
  rewardId: string;
  sampleProductId?: string;
  createdAt: string;
  referralCode?: string;
}

export interface LiveTickerItem {
  id: string;
  name: string;
  business: string;
  province: string;
  rewardVi: string;
  rewardLo: string;
  timeAgoVi: string;
  timeAgoLo: string;
}

export interface CampaignState {
  step: CampaignStep;
  locale: Locale;
  dialogOpen: boolean;
  registration: RegistrationData | null;
  selectedTierId: string | null;
  policyAcknowledged: boolean;
  spin: SpinResult | null;
  cart: CartLine[];
  firestoreStatus: 'idle' | 'saving' | 'saved' | 'error';
  rulesPdfOpen: boolean;
  invoiceModalOpen: boolean;
  selectedProductId: string | null;
  simulatedRevenue: number;
}

export type CampaignAction =
  | { type: 'SET_LOCALE'; locale: Locale }
  | { type: 'OPEN_FLOW'; step?: Exclude<CampaignStep, 'browse'> }
  | { type: 'CLOSE_FLOW' }
  | { type: 'GO_TO_STEP'; step: Exclude<CampaignStep, 'browse'> }
  | { type: 'SAVE_REGISTRATION'; registration: RegistrationData }
  | { type: 'SELECT_TIER'; tierId: string }
  | { type: 'ACKNOWLEDGE_POLICY'; value: boolean }
  | { type: 'SAVE_SPIN'; spin: SpinResult }
  | { type: 'SET_CART_QUANTITY'; productId: string; quantity: number }
  | { type: 'SET_FIRESTORE_STATUS'; status: CampaignState['firestoreStatus'] }
  | { type: 'SET_RULES_PDF_OPEN'; open: boolean }
  | { type: 'SET_INVOICE_MODAL_OPEN'; open: boolean }
  | { type: 'SET_SELECTED_PRODUCT_ID'; productId: string | null }
  | { type: 'SET_SIMULATED_REVENUE'; revenue: number }
  | { type: 'RESET_FLOW' };
