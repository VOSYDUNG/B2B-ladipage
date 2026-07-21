export const WL_CAMPAIGN_CONFIG = {
  campaign_id: "WL_NEW_PRODUCTS_2026_Q3",
  landing_id: "white-lotus",
  template_id: "pharma_trade_catalog_v1",
  market: "laos",
  promotion: {
    program_code: "wl_tiered_4_6_12_v1",
    headline: "Ưu đãi theo mốc 4, 6 và 12 sản phẩm",
    scope: "Mốc áp dụng phụ thuộc từng sản phẩm",
  },
  contact: {
    hotline: "02095355355",
  }
}

export type WhiteLotusProductId =
  | "fexentrix-60"
  | "etorilux-120"
  | "fexentrix-120"
  | "lotofex-200"

export type WhiteLotusPromotionRule = {
  rule_id: string
  level: 1 | 2
  product_ids: readonly WhiteLotusProductId[]
  buy_quantity: number
  gift_quantity: 1
  reward_kind: "multi_vitamin" | "program_product"
}

export const WL_PROMOTION = {
  program_code: WL_CAMPAIGN_CONFIG.promotion.program_code,
  source_revision: "2026-07-13",
  final_reward_requires_sales_confirmation: true,
  rules: [
    {
      rule_id: "wl_level_1_buy_4_multi_vitamin",
      level: 1,
      product_ids: ["lotofex-200", "fexentrix-60", "fexentrix-120"],
      buy_quantity: 4,
      gift_quantity: 1,
      reward_kind: "multi_vitamin",
    },
    {
      rule_id: "wl_level_1_buy_6_multi_vitamin",
      level: 1,
      product_ids: ["etorilux-120"],
      buy_quantity: 6,
      gift_quantity: 1,
      reward_kind: "multi_vitamin",
    },
    {
      rule_id: "wl_level_2_buy_12_program_product",
      level: 2,
      product_ids: ["lotofex-200", "fexentrix-60", "fexentrix-120", "etorilux-120"],
      buy_quantity: 12,
      gift_quantity: 1,
      reward_kind: "program_product",
    },
  ] satisfies readonly WhiteLotusPromotionRule[],
} as const

export const WL_PROMOTION_THRESHOLDS = [4, 6, 12] as const

export function getWhiteLotusPromotionRules(productId: string) {
  return WL_PROMOTION.rules
    .filter(rule => (rule.product_ids as readonly string[]).includes(productId))
    .sort((left, right) => left.buy_quantity - right.buy_quantity)
}

export function getHighestEligibleWhiteLotusPromotionRule(productId: string, quantity: number) {
  return getWhiteLotusPromotionRules(productId)
    .filter(rule => quantity >= rule.buy_quantity)
    .at(-1) ?? null
}

export function getNextWhiteLotusPromotionRule(productId: string, quantity: number) {
  return getWhiteLotusPromotionRules(productId)
    .find(rule => quantity < rule.buy_quantity) ?? null
}

export const WL_PRODUCTS = [
  {
    product_id: "fexentrix-60",
    canonical_name: "Fexentrix 60",
    active_ingredient: "Fexofenadine HCl 60 mg",
    pack_size: "10 vỉ x 10 viên",
    price_vientiane_lak: 45000,
    indications: "Điều trị triệu chứng viêm mũi dị ứng theo mùa và mề đay tự phát vô căn.",
    advantages: "Không gây buồn ngủ, an toàn cho người lái xe và vận hành máy móc.",
    packshot_url: "/assets/white-lotus/web/fexentrix-60-packshot.webp",
    catalog_url: "/assets/white-lotus/catalogs/AST-WL-F60-CATALOG.pdf",
    visual_aid_url: "/assets/white-lotus/visual-aids/fexentrix-60-visual-aid.png",
  },
  {
    product_id: "etorilux-120",
    canonical_name: "Etorilux 120",
    active_ingredient: "Etoricoxib 120 mg",
    pack_size: "3 vỉ x 10 viên",
    price_vientiane_lak: 38000,
    indications: "Giảm đau cấp tính và mãn tính trong viêm xương khớp, viêm khớp dạng thấp và gout.",
    advantages: "Tác dụng nhanh, chọn lọc cao trên COX-2, bảo vệ niêm mạc dạ dày.",
    packshot_url: "/assets/white-lotus/web/etorilux-120-packshot.webp",
    catalog_url: "/assets/white-lotus/catalogs/AST-WL-E120-CATALOG.pdf",
    visual_aid_url: "/assets/white-lotus/visual-aids/etorilux-120-visual-aid.png",
  },
  {
    product_id: "fexentrix-120",
    canonical_name: "Fexentrix 120",
    active_ingredient: "Fexofenadine HCl 120 mg",
    pack_size: "10 vỉ x 10 viên",
    price_vientiane_lak: 81000,
    indications: "Giảm nhanh các triệu chứng viêm mũi dị ứng nghiêm trọng và ngứa do mề đay.",
    advantages: "Hàm lượng tối ưu 120mg cho tác dụng kéo dài suốt 24 giờ chỉ với 1 viên.",
    packshot_url: "/assets/white-lotus/web/fexentrix-120-packshot.webp",
    catalog_url: "/assets/white-lotus/catalogs/AST-WL-F120-CATALOG.pdf",
    visual_aid_url: "/assets/white-lotus/visual-aids/fexentrix-120-visual-aid.png",
  },
  {
    product_id: "lotofex-200",
    canonical_name: "Lotofex 200",
    active_ingredient: "Ofloxacin 200 mg",
    pack_size: "10 vỉ x 10 viên",
    price_vientiane_lak: 55000,
    indications: "Điều trị các bệnh nhiễm khuẩn đường tiết niệu, sinh dục, hô hấp, da và mô mềm.",
    advantages: "Phổ kháng khuẩn rộng, hấp thu nhanh, hiệu quả cao trong điều trị.",
    packshot_url: "/assets/white-lotus/web/lotofex-200-packshot.webp",
    catalog_url: "/assets/white-lotus/catalogs/AST-WL-L200-CATALOG.pdf",
    visual_aid_url: "/assets/white-lotus/visual-aids/lotofex-200-visual-aid.png",
  }
]
