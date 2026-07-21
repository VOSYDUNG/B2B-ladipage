export const NNC_CAMPAIGN_CONFIG = {
  campaign_id: "NNC_B2B_ONLINE_REWARDS_Q3_2026",
  landing_id: "nnc-b2b-online-rewards-q3-2026",
  template_id: "nnc_b2b_rewards_v2",
  market: "laos",
  period: "01/08/2026 - 30/09/2026",
  period_start_iso: "2026-08-01T00:00:00+07:00",
  period_end_exclusive_iso: "2026-10-01T00:00:00+07:00",
  whatsapp: {
    display: "020 9980 6327",
    normalized: "+8562099806327"
  }
} as const;

export const NNC_WHATSAPP_PATH = NNC_CAMPAIGN_CONFIG.whatsapp.normalized.replace(/\D/g, "");
export const NNC_REWARD_RUNTIME_MODE = "provisional_preview" as const;

function normalizeWhatsAppReferencePart(value: string): string {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

export function buildNncWhatsAppReference(intent: string, subjectId?: string): string {
  const normalizedIntent = normalizeWhatsAppReferencePart(intent);
  if (!normalizedIntent) throw new Error("WhatsApp reference intent is required");
  const normalizedSubject = subjectId ? normalizeWhatsAppReferencePart(subjectId) : "";
  return [NNC_CAMPAIGN_CONFIG.campaign_id, normalizedIntent, normalizedSubject].filter(Boolean).join("/");
}

export function appendNncWhatsAppReference(message: string, intent: string, subjectId?: string): string {
  return `${message.trim()}\n\nRef: ${buildNncWhatsAppReference(intent, subjectId)}`;
}

export type NncCampaignPhase = "upcoming" | "active" | "ended";

export function getNncCampaignPhase(now: number | Date = Date.now()): NncCampaignPhase {
  const current = now instanceof Date ? now.getTime() : now;
  const start = Date.parse(NNC_CAMPAIGN_CONFIG.period_start_iso);
  const end = Date.parse(NNC_CAMPAIGN_CONFIG.period_end_exclusive_iso);
  if (current < start) return "upcoming";
  if (current >= end) return "ended";
  return "active";
}

export function isValidNncPhone(value: string): boolean {
  const trimmed = value.trim();
  if (!/^\+?[0-9\s-]{8,24}$/.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}

export interface NncProduct {
  product_id: string;
  canonical_name: string;
  category: "Herbal" | "Antibiotic";
  pack_size: string;
  price_vientiane_kip: number;
  formulation: string;
  source_note_vi: string;
  source_note_lo: string;
  packshot_url: string;
  scene_asset_stem: string;
  source_status: "source_locked" | "needs_nnc_confirmation";
}

const sourceNoteVi = "Thông tin nhận diện theo tài liệu NNC. Vui lòng liên hệ NNC để nhận tài liệu chuyên môn chính thức.";
const sourceNoteLo = "ຂໍ້ມູນລະບຸຕົວຕາມເອກະສານ NNC. ກະລຸນາຕິດຕໍ່ NNC ເພື່ອຮັບເອກະສານວິຊາການທາງການ.";

export const NNC_PRODUCTS: NncProduct[] = [
  {
    product_id: "tadimax",
    canonical_name: "Tadimax",
    category: "Herbal",
    pack_size: "Hộp 21 viên x 2 vỉ",
    price_vientiane_kip: 193000,
    formulation: "Thảo dược",
    source_note_vi: sourceNoteVi,
    source_note_lo: sourceNoteLo,
    packshot_url: "/assets/nnc-b2b-rewards/web/tadimax.webp?v=20260717",
    scene_asset_stem: "/assets/nnc-b2b-rewards/visual/product-scene-tadimax",
    source_status: "source_locked"
  },
  {
    product_id: "bai-thach",
    canonical_name: "Bài Thạch",
    category: "Herbal",
    pack_size: "Hộp 45 viên",
    price_vientiane_kip: 69000,
    formulation: "Thảo dược",
    source_note_vi: sourceNoteVi,
    source_note_lo: sourceNoteLo,
    packshot_url: "/assets/nnc-b2b-rewards/web/bai-thach.webp?v=20260717",
    scene_asset_stem: "/assets/nnc-b2b-rewards/visual/product-scene-bai-thach",
    source_status: "source_locked"
  },
  {
    product_id: "cv-mox-1000",
    canonical_name: "CV Mox 1000",
    category: "Antibiotic",
    pack_size: "Hộp 2 vỉ x 7 viên",
    price_vientiane_kip: 71000,
    formulation: "Amoxicillin 1000mg + Clavulanic acid",
    source_note_vi: sourceNoteVi,
    source_note_lo: sourceNoteLo,
    packshot_url: "/assets/nnc-b2b-rewards/web/cvmox-1000.webp?v=20260717",
    scene_asset_stem: "/assets/nnc-b2b-rewards/visual/product-scene-cvmox-1000",
    source_status: "needs_nnc_confirmation"
  },
  {
    product_id: "nc-cv-mox-625",
    canonical_name: "NC CV Mox 625",
    category: "Antibiotic",
    pack_size: "Hộp 10 vỉ x 10 viên",
    price_vientiane_kip: 369000,
    formulation: "Amoxicillin 500mg + Clavulanate 125mg",
    source_note_vi: sourceNoteVi,
    source_note_lo: sourceNoteLo,
    packshot_url: "/assets/nnc-b2b-rewards/web/nc-cvmox-625.webp?v=20260717",
    scene_asset_stem: "/assets/nnc-b2b-rewards/visual/product-scene-nc-cvmox-625",
    source_status: "source_locked"
  },
  {
    product_id: "cv-mox-228.5",
    canonical_name: "CV MOX 228.5",
    category: "Antibiotic",
    pack_size: "Chai 60ml",
    price_vientiane_kip: 24000,
    formulation: "Amoxicillin 200mg + Clavulanate 28.5mg",
    source_note_vi: sourceNoteVi,
    source_note_lo: sourceNoteLo,
    packshot_url: "/assets/nnc-b2b-rewards/web/cvmok-228.webp?v=20260717",
    scene_asset_stem: "/assets/nnc-b2b-rewards/visual/product-scene-cvmok-228",
    source_status: "source_locked"
  },
  {
    product_id: "cefixad-100mg",
    canonical_name: "Cefixad 100mg",
    category: "Antibiotic",
    pack_size: "Chai 30ml (100mg/5ml)",
    price_vientiane_kip: 30000,
    formulation: "Cefixime 100mg/5ml",
    source_note_vi: sourceNoteVi,
    source_note_lo: sourceNoteLo,
    packshot_url: "/assets/nnc-b2b-rewards/web/cefixad-100.webp?v=20260717",
    scene_asset_stem: "/assets/nnc-b2b-rewards/visual/product-scene-cefixad-100",
    source_status: "source_locked"
  },
  {
    product_id: "azihadi",
    canonical_name: "AZIHADI",
    category: "Antibiotic",
    pack_size: "Chai 30ml",
    price_vientiane_kip: 32000,
    formulation: "Azithromycin 200mg/5ml",
    source_note_vi: sourceNoteVi,
    source_note_lo: sourceNoteLo,
    packshot_url: "/assets/nnc-b2b-rewards/web/azihadi.webp?v=20260717",
    scene_asset_stem: "/assets/nnc-b2b-rewards/visual/product-scene-azihadi",
    source_status: "source_locked"
  }
];

const NNC_LEGACY_PRODUCT_ID_ALIASES: Readonly<Record<string, string>> = {
  "cv-mok-228.5": "cv-mox-228.5"
};

export function normalizeNncProductInterests(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const allowedIds = new Set(NNC_PRODUCTS.map((product) => product.product_id));
  return [...new Set(
    value
      .filter((item): item is string => typeof item === "string")
      .map((item) => NNC_LEGACY_PRODUCT_ID_ALIASES[item] ?? item)
      .filter((item) => allowedIds.has(item))
  )];
}

export interface NncAccumulationTier {
  tier_id: string;
  name_vi: string;
  name_lo: string;
  min_revenue_kip: number;
  max_revenue_kip: number;
  immediate_discount: number;
  quarter_end_reward: number;
  total_benefit: number;
}

export const NNC_ACCUMULATION_TIERS: NncAccumulationTier[] = [
  { tier_id: "tier_1", name_vi: "Bậc 1", name_lo: "ຂັ້ນ 1", min_revenue_kip: 2000000, max_revenue_kip: 6000000, immediate_discount: 5, quarter_end_reward: 2, total_benefit: 7 },
  { tier_id: "tier_2", name_vi: "Bậc 2", name_lo: "ຂັ້ນ 2", min_revenue_kip: 6000000, max_revenue_kip: 12000000, immediate_discount: 5, quarter_end_reward: 3, total_benefit: 8 },
  { tier_id: "tier_3", name_vi: "Bậc 3", name_lo: "ຂັ້ນ 3", min_revenue_kip: 12000000, max_revenue_kip: 25000000, immediate_discount: 5, quarter_end_reward: 4, total_benefit: 9 },
  { tier_id: "tier_4", name_vi: "Bậc 4", name_lo: "ຂັ້ນ 4", min_revenue_kip: 25000000, max_revenue_kip: Number.MAX_SAFE_INTEGER, immediate_discount: 5, quarter_end_reward: 5, total_benefit: 10 }
];

export interface NncQuizQuestion {
  id: string;
  field: string;
  question_vi: string;
  question_lo: string;
  type: "single" | "multi";
  options: Array<{
    value: string;
    label_vi: string;
    label_lo: string;
    is_correct?: boolean;
  }>;
}

export const NNC_QUIZ_QUESTIONS: NncQuizQuestion[] = [
  {
    id: "q1", field: "role", question_vi: "Anh/chị hiện thuộc nhóm nào?", question_lo: "ທ່ານຈັດຢູ່ໃນກຸ່ມລູກຄ້າໃດ?", type: "single",
    options: [
      { value: "doctor", label_vi: "Bác sĩ", label_lo: "ທ່ານໝໍ" },
      { value: "clinic", label_vi: "Phòng khám", label_lo: "ຄລີນິກ" },
      { value: "pharmacy", label_vi: "Nhà thuốc", label_lo: "ຮ້ານຂາຍຢາ" },
      { value: "agent", label_vi: "Đại lý", label_lo: "ຕົວແທນຈໍາຫນ່າຍ" },
      { value: "other", label_vi: "Khác", label_lo: "ອື່ນໆ" }
    ]
  },
  {
    id: "q2", field: "category_interest", question_vi: "Anh/chị đang quan tâm nhóm sản phẩm nào nhất?", question_lo: "ທ່ານມີຄວາມສົນໃຈຜະລິດຕະພັນກຸ່ມໃດຫຼາຍທີ່ສຸດ?", type: "single",
    options: [
      { value: "herbal", label_vi: "Thảo dược", label_lo: "ຢາສະໝຸນໄພ" },
      { value: "adult_antibiotic", label_vi: "Kháng sinh người lớn", label_lo: "ຢາຕ້ານເຊື້ອຜູ້ໃຫຍ່" },
      { value: "child_antibiotic", label_vi: "Kháng sinh trẻ em", label_lo: "ຢາຕ້ານເຊື້ອເດັກນ້ອຍ" },
      { value: "multiple", label_vi: "Nhiều nhóm sản phẩm", label_lo: "ຫຼາຍກຸ່ມຜະລິດຕະພັນ" },
      { value: "more_advice", label_vi: "Cần tư vấn thêm", label_lo: "ຕ້ອງການຄໍາປຶກສາເພີ່ມເຕີມ" }
    ]
  },
  {
    id: "q3", field: "product_interests", question_vi: "Anh/chị muốn tìm hiểu hoặc nhập thử sản phẩm nào?", question_lo: "ທ່ານຕ້ອງການຮຽນຮູ້ ຫຼື ທົດລອງນໍາເຂົ້າຜະລິດຕະພັນໃດ?", type: "multi",
    options: NNC_PRODUCTS.map((product) => ({ value: product.product_id, label_vi: product.canonical_name, label_lo: product.canonical_name }))
  },
  {
    id: "q4", field: "program_comprehension", question_vi: "Doanh số trong chương trình được tính như thế nào?", question_lo: "ຍອດຂາຍໃນໂຄງການຖືກຄິດໄລ່ແນວໃດ?", type: "single",
    options: [
      { value: "separated", label_vi: "Tính riêng từng sản phẩm", label_lo: "ຄິດໄລ່ແຍກແຕ່ລະຜະລິດຕະພັນ", is_correct: false },
      { value: "accumulated", label_vi: "Cộng chung tất cả sản phẩm trong quý", label_lo: "ສະສົມຮ່ວມກັນທຸກຜະລິດຕະພັນໃນໄຕມາດ", is_correct: true },
      { value: "first_order", label_vi: "Chỉ tính đơn đầu tiên", label_lo: "ຄິດໄລ່ສະເພາະບິນທຳອິດ", is_correct: false },
      { value: "highest_price", label_vi: "Chỉ tính sản phẩm giá cao nhất", label_lo: "ຄິດໄລ່ສະເພາະຜະລິດຕະພັນທີ່ມີມູນຄ່າສູງສຸດ", is_correct: false }
    ]
  },
  {
    id: "q5", field: "purchase_intent_range", question_vi: "Tổng giá trị đơn hàng anh/chị dự kiến trong thời gian chương trình là bao nhiêu?", question_lo: "ມູນຄ່າຍອດສັ່ງຊື້ທັງໝົດທີ່ທ່ານຄາດໄວ້ໃນໄລຍະໂຄງການແມ່ນເທົ່າໃດ?", type: "single",
    options: [
      { value: "under_2m", label_vi: "Dưới 2 triệu KIP", label_lo: "ຕ່ຳກວ່າ 2 ລ້ານກີບ" },
      { value: "2m_to_6m", label_vi: "2 đến dưới 6 triệu KIP", label_lo: "2 ຫາຕ່ຳກວ່າ 6 ລ້ານກີບ" },
      { value: "6m_to_12m", label_vi: "6 đến dưới 12 triệu KIP", label_lo: "6 ຫາຕ່ຳກວ່າ 12 ລ້ານກີບ" },
      { value: "12m_to_25m", label_vi: "12 đến dưới 25 triệu KIP", label_lo: "12 ຫາຕ່ຳກວ່າ 25 ລ້ານກີບ" },
      { value: "above_25m", label_vi: "Từ 25 triệu KIP", label_lo: "25 ລ້ານກີບຂຶ້ນໄປ" },
      { value: "undetermined", label_vi: "Chưa xác định", label_lo: "ຍັງບໍ່ໄດ້ກໍານົດ" }
    ]
  },
  {
    id: "q6", field: "support_needs", question_vi: "Trước khi đặt hàng, anh/chị cần NNC hỗ trợ nội dung nào?", question_lo: "ກ່ອນທີ່ຈະສັ່ງຊື້, ທ່ານຕ້ອງການໃຫ້ NNC ຊ່ວຍເຫຼືອຂໍ້ມູນໃດ?", type: "multi",
    options: [
      { value: "product_info", label_vi: "Thông tin sản phẩm", label_lo: "ຂໍ້ມູນຜະລິດຕະພັນ" },
      { value: "price_policy", label_vi: "Giá và chính sách", label_lo: "ລາຄາ ແລະ ນະໂຍບາຍ" },
      { value: "samples", label_vi: "Hàng mẫu", label_lo: "ຜະລິດຕະພັນຕົວຢ່າງ" },
      { value: "inventory_delivery", label_vi: "Tồn kho và giao hàng", label_lo: "ສິນຄ້າໃນສາງ ແລະ ການຈັດສົ່ງ" },
      { value: "direct_sales", label_vi: "Sales tư vấn trực tiếp", label_lo: "ພະນັກງານຂາຍໃຫ້ຄຳປຶກສາໂດຍກົງ" },
      { value: "accumulation_rewards", label_vi: "Chương trình tích lũy và quyền lợi", label_lo: "ໂຄງການສະສົມ ແລະ ຜົນປະໂຫຍດ" }
    ]
  }
];

export interface NncWheelSegment {
  reward_id: string;
  name_vi: string;
  name_lo: string;
  description_vi: string;
  description_lo: string;
  weight: number;
  stock_limit: number | null;
  daily_limit: number | null;
  start_at: string;
  end_at: string;
  condition_text_vi: string;
  condition_text_lo: string;
  image_asset: string | null;
  approval_status: "provisional" | "approved";
  is_active: boolean;
}

const conditionVi = "Loại quyền lợi và điều kiện áp dụng theo thể lệ được NNC xác nhận trước khi sử dụng.";
const conditionLo = "ປະເພດສິດທິປະໂຫຍດ ແລະ ເງື່ອນໄຂການນຳໃຊ້ ເປັນໄປຕາມການກຳນົດທີ່ NNC ອະນຸມັດກ່ອນປ່ອຍໃຊ້.";

export const NNC_WHEEL_SEGMENTS: NncWheelSegment[] = [
  ["sample_voucher", "Voucher mẫu sản phẩm", "ຄູປ໋ອງຕົວຢ່າງຜະລິດຕະພັນ"],
  ["order_voucher", "Voucher đơn hàng", "ຄູປ໋ອງສຳລັບຄຳສັ່ງຊື້"],
  ["shipping_support", "Hỗ trợ vận chuyển", "ສິດທິຊ່ວຍເຫຼືອການຂົນສົ່ງ"],
  ["posm_kit", "Bộ POSM", "ຊຸດ POSM"],
  ["practical_gift", "Quà gia dụng thiết thực", "ຂອງຂວັນເຄື່ອງໃຊ້ທີ່ເໝາະສົມ"],
  ["companion_gift_box", "Hộp quà đồng hành", "ກ່ອງຂອງຂວັນຮ່ວມເດີນທາງ"]
].map(([reward_id, name_vi, name_lo]) => ({
  reward_id,
  name_vi,
  name_lo,
  description_vi: "Nhóm quyền lợi tham khảo; NNC xác nhận theo thể lệ trước khi áp dụng.",
  description_lo: "ປະເພດສິດທິປະໂຫຍດອ້າງອີງໃນສະບັບການກຳນົດແຄມເປນ.",
  weight: 1,
  stock_limit: null,
  daily_limit: null,
  start_at: "2026-08-01",
  end_at: "2026-09-30",
  condition_text_vi: conditionVi,
  condition_text_lo: conditionLo,
  image_asset: null,
  approval_status: "provisional" as const,
  is_active: false
}));
