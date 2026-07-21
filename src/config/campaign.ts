export const campaignConfig = {
  id: 'VG5_KMK_LAO_PHARMACY_2026',
  market: 'Lao PDR',
  currency: 'LAK',
  packages: {
    basic: {
      id: 'basic',
      name: 'Gói cơ bản',
      threshold: 500_000,
      suggestedTotal: 502_000,
      inventory: '2 hộp VG-5 + 10 đơn vị Ker Mao Khang',
      gift: '2 đơn vị Ker Mao Khang + 1 bộ POSM',
      posm: '1 kệ trưng bày + 1 poster',
    },
    advanced: {
      id: 'advanced',
      name: 'Gói nâng cao',
      threshold: 1_000_000,
      suggestedTotal: 1_024_000,
      inventory: '5 hộp VG-5 + 18 đơn vị Ker Mao Khang',
      gift: 'Chọn 5 đơn vị Ker Mao Khang hoặc 2 hộp VG-5',
      posm: 'Phù hợp nhà thuốc muốn tăng lượng hàng bán trong tháng',
    },
  },
  displayProgram: {
    durationMonths: 3,
    productReward: {
      monthly: 'Mỗi tháng hợp lệ: 2 đơn vị Ker Mao Khang',
      completion: 'Hoàn thành 3 tháng: thêm 1 hộp VG-5',
    },
    cashReward: {
      monthly: '50.000 LAK cho mỗi tháng hợp lệ',
      method: 'Thanh toán hoặc trừ vào đơn hàng theo quy trình chương trình',
    },
  },
} as const
