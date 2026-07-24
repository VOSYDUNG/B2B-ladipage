import type { Product, Reward, Tier } from './types.ts';

export const CAMPAIGN_ID = 'NNC_B2B_REWARDS_Q3_2026';
export const CAMPAIGN_PERIOD = '01/08 – 30/09/2026';

export const PRODUCTS: Product[] = [
  {
    id: 'tadimax',
    name: 'Tadimax',
    image: '/images/tadimax.webp',
    packVi: 'Hộp 21 viên × 2 vỉ',
    packLo: 'ກັບ 21 ເມັດ × 2 ແຜງ',
    priceKip: 193_000,
  },
  {
    id: 'bai-thach',
    name: 'Bài Thạch',
    image: '/images/bai-thach.webp',
    packVi: 'Hộp 45 viên',
    packLo: 'ກັບ 45 ເມັດ',
    priceKip: 69_000,
  },
  {
    id: 'cv-mox-1000',
    name: 'CV Mox 1000',
    image: '/images/cvmox-1000.webp',
    packVi: 'Hộp 2 vỉ × 7 viên',
    packLo: 'ກັບ 2 ແຜງ × 7 ເມັດ',
    priceKip: 71_000,
  },
  {
    id: 'nc-cv-mox-625',
    name: 'NC CV Mox 625',
    image: '/images/nc-cvmox-625.webp',
    packVi: 'Hộp 10 vỉ × 10 viên',
    packLo: 'ກັບ 10 ແຜງ × 10 ເມັດ',
    priceKip: 369_000,
  },
  {
    id: 'cv-mox-228-5',
    name: 'CV Mox 228.5',
    image: '/images/cvmok-228.webp',
    packVi: 'Chai 60 ml',
    packLo: 'ຕຸກ 60 ml',
    priceKip: 24_000,
  },
  {
    id: 'cefixad-100',
    name: 'Cefixad 100mg',
    image: '/images/cefixad-100.webp',
    packVi: 'Chai 30 ml',
    packLo: 'ຕຸກ 30 ml',
    priceKip: 30_000,
  },
  {
    id: 'azihadi',
    name: 'AZIHADI',
    image: '/images/azihadi.webp',
    packVi: 'Chai 30 ml',
    packLo: 'ຕຸກ 30 ml',
    priceKip: 32_000,
  },
];

export const SAMPLE_PRODUCT_IDS = [
  'bai-thach',
  'cv-mox-1000',
  'cv-mox-228-5',
  'cefixad-100',
  'azihadi',
] as const;

export const TIERS: Tier[] = [
  {
    id: 'tier-1',
    nameVi: 'Bậc 1',
    nameLo: 'ຂັ້ນ 1',
    minRevenueKip: 2_000_000,
    maxRevenueKip: 6_000_000,
    immediateDiscountPercent: 5,
    quarterRewardPercent: 2,
    totalBenefitPercent: 7,
    giftValueKip: 420_000,
  },
  {
    id: 'tier-2',
    nameVi: 'Bậc 2',
    nameLo: 'ຂັ້ນ 2',
    minRevenueKip: 6_000_000,
    maxRevenueKip: 12_000_000,
    immediateDiscountPercent: 5,
    quarterRewardPercent: 3,
    totalBenefitPercent: 8,
    giftValueKip: 960_000,
  },
  {
    id: 'tier-3',
    nameVi: 'Bậc 3',
    nameLo: 'ຂັ້ນ 3',
    minRevenueKip: 12_000_000,
    maxRevenueKip: 25_000_000,
    immediateDiscountPercent: 5,
    quarterRewardPercent: 4,
    totalBenefitPercent: 9,
    giftValueKip: 2_250_000,
  },
  {
    id: 'tier-4',
    nameVi: 'Bậc 4',
    nameLo: 'ຂັ້ນ 4',
    minRevenueKip: 25_000_000,
    maxRevenueKip: null,
    immediateDiscountPercent: 5,
    quarterRewardPercent: 5,
    totalBenefitPercent: 10,
    giftValueKip: null,
  },
];

export const REWARDS: Reward[] = [
  {
    id: 'samsung-a16',
    nameVi: 'Samsung Galaxy A16',
    nameLo: 'Samsung Galaxy A16',
    shortVi: 'Galaxy A16',
    shortLo: 'Galaxy A16',
    weight: 0,
    status: 'pending',
    wheelIndex: 0,
  },
  {
    id: 'omron',
    nameVi: 'Máy đo huyết áp OMRON',
    nameLo: 'ເຄື່ອງວັດຄວາມດັນ OMRON',
    shortVi: 'Máy đo OMRON',
    shortLo: 'OMRON',
    weight: 0,
    status: 'pending',
    wheelIndex: 1,
  },
  {
    id: 'digital-scale',
    nameVi: 'Cân sức khỏe điện tử',
    nameLo: 'ເຄື່ອງຊັ່ງສຸຂະພາບ',
    shortVi: 'Cân sức khỏe',
    shortLo: 'ເຄື່ອງຊັ່ງ',
    weight: 0,
    status: 'pending',
    wheelIndex: 2,
  },
  {
    id: 'voucher-200',
    nameVi: 'Voucher mua hàng 200.000 KIP',
    nameLo: 'ບັດຊື້ສິນຄ້າ 200.000 KIP',
    shortVi: 'Voucher 200K',
    shortLo: 'Voucher 200K',
    weight: 10,
    status: 'active',
    wheelIndex: 3,
  },
  {
    id: 'voucher-100',
    nameVi: 'Voucher mua hàng 100.000 KIP',
    nameLo: 'ບັດຊື້ສິນຄ້າ 100.000 KIP',
    shortVi: 'Voucher 100K',
    shortLo: 'Voucher 100K',
    weight: 45,
    status: 'active',
    wheelIndex: 4,
  },
  {
    id: 'sample-product',
    nameVi: 'Quà thuốc mẫu NNC',
    nameLo: 'ຂອງຂວັນຕົວຢ່າງ NNC',
    shortVi: 'Quà thuốc mẫu',
    shortLo: 'ຕົວຢ່າງ NNC',
    weight: 45,
    status: 'active',
    wheelIndex: 5,
  },
];

export const ACTIVE_REWARDS = REWARDS.filter((reward) => reward.status === 'active');
export const PENDING_REWARDS = REWARDS.filter((reward) => reward.status === 'pending');
