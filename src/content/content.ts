/**
 * SOURCE-LOCKED CONTENT
 *
 * - Lao strings are preserved from the supplied human-translated source.
 * - Do not retranslate or paraphrase strings in this file.
 * - Medical claims are stored separately and disabled in production.
 * - Sales and display programs are separate business programs.
 */
import type { LandingVariant } from '@/types'

export type AppLanguage = 'vi' | 'lo';

export const safeContent = {
  vi: {
    eyebrow: 'Chương trình dành riêng cho nhà thuốc tại Lào',
    headline: 'Chương trình bán hàng và trưng bày VG-5 + ແກ້ເມົາຄ້າງ',
    subheadline: 'Chọn gói nhập hàng phù hợp, nhận bộ POSM và quyền lợi duy trì trưng bày trong 3 tháng.',
    primaryCta: 'Đăng ký tham gia',
    secondaryCta: 'Xem quyền lợi',
    trustItems: ['2 sản phẩm', '2 mức nhập hàng', 'POSM tại quầy', 'Thưởng 3 tháng'],
    benefits: [
      {
        title: 'Hai mức nhập rõ ràng',
        body: 'Chọn gói phù hợp với nhu cầu nhập hàng và quy mô của nhà thuốc.',
      },
      {
        title: 'POSM đồng bộ',
        body: 'Kệ trưng bày và poster giúp sản phẩm có vị trí rõ ràng tại quầy.',
      },
      {
        title: 'Quyền lợi duy trì',
        body: 'Chọn hình thức thưởng bằng sản phẩm hoặc tiền theo chính sách chương trình.',
      },
      {
        title: 'Sales hỗ trợ xuyên suốt',
        body: 'Xác nhận gói, đơn hàng, POSM và thông tin nhận quyền lợi.',
      },
    ],
    products: {
      vg5: {
        name: 'VG-5',
        facts: ['Viên nén bao phim', 'Sản xuất bởi Danapha'],
        description: 'VG-5 là một trong hai sản phẩm thuộc chương trình dành cho nhà thuốc. Thông tin sản phẩm được trình bày theo bao bì và tài liệu hiện hành.',
      },
      kmk: {
        name: 'ແກ້ເມົາຄ້າງ',
        latinName: 'Ker Mao Khang',
        facts: ['Dạng viên sủi', 'Nguồn nội bộ: 10 viên/ống', 'Phù hợp bố trí trên kệ POSM'],
        description: 'Sản phẩm dạng viên sủi thuộc chương trình dành cho nhà thuốc. Thông tin sử dụng phải theo bao bì và tài liệu hiện hành.',
      },
    },
    safety: 'Thông tin sản phẩm được trình bày theo bao bì và tài liệu hiện hành. Nhà thuốc hướng dẫn người sử dụng đọc kỹ hướng dẫn và tham khảo ý kiến chuyên môn khi cần.',
    nav: {
      benefits: 'Quyền lợi',
      products: 'Sản phẩm',
      packages: 'Gói bán hàng',
      display: 'Trưng bày',
      process: 'Cách tham gia'
    },
    medicalWarning: 'Dự thảo nội bộ có claim — Không phát hành trước khi Regulatory/Medical phê duyệt'
  },
  lo: {
    eyebrow: 'ໂຄງການພິເສດສຳລັບຮ້ານຂາຍຢາໃນລາວ',
    headline: 'ໂຄງການຂາຍ ແລະ ວາງສະແດງ VG-5 + ແກ້ເມົາຄ້າງ',
    subheadline: 'ເລືອກແພັກເກດທີ່ເໝາະສົມ, ຮັບຊຸດ POSM ແລະ ສິດທິປະໂຫຍດໃນການວາງສະແດງ 3 ເດືອນ.',
    primaryCta: 'ລົງທະບຽນເຂົ້າຮ່ວມ',
    secondaryCta: 'ເບິ່ງສິດທິປະໂຫຍດ',
    trustItems: ['2 ຜະລິດຕະພັນ', '2 ລະດັບການສັ່ງຊື້', 'POSM ຢູ່ຮ້ານ', 'ໂບນັດ 3 ເດືອນ'],
    benefits: [
      {
        title: 'ສອງລະດັບທີ່ຊັດເຈນ',
        body: 'ເລືອກແພັກເກດທີ່ເໝາະສົມກັບຄວາມຕ້ອງການ ແລະ ຂະໜາດຂອງຮ້ານຂາຍຢາ.',
      },
      {
        title: 'POSM ຄົບຊຸດ',
        body: 'ຊັ້ນວາງ ແລະ ໂປສເຕີຊ່ວຍໃຫ້ຜະລິດຕະພັນມີຕຳແໜ່ງທີ່ຊັດເຈນຢູ່ຮ້ານ.',
      },
      {
        title: 'ສິດທິປະໂຫຍດຕໍ່ເນື່ອງ',
        body: 'ເລືອກຮູບແບບໂບນັດເປັນຜະລິດຕະພັນ ຫຼື ເງິນສົດຕາມນະໂຍບາຍ.',
      },
      {
        title: 'ການຊ່ວຍເຫຼືອຕະຫຼອດ',
        body: 'ຢືນຢັນແພັກເກດ, ຄຳສັ່ງຊື້, POSM ແລະ ຂໍ້ມູນສິດທິປະໂຫຍດ.',
      },
    ],
    products: {
      vg5: {
        name: 'VG-5',
        facts: ['ຢາເມັດເຄືອບ', 'ຜະລິດໂດຍ Danapha'],
        description: 'VG-5 ແມ່ນໜຶ່ງໃນສອງຜະລິດຕະພັນຂອງໂຄງການສຳລັບຮ້ານຂາຍຢາ. ຂໍ້ມູນຜະລິດຕະພັນສະໜອງຕາມເອກະສານອ້າງອີງ.',
      },
      kmk: {
        name: 'ແກ້ເມົາຄ້າງ',
        latinName: 'Ker Mao Khang',
        facts: ['ຢາເມັດຟູ່', 'ບັນຈຸ 10 ເມັດ/ຫຼອດ', 'ເໝາະສຳລັບວາງໃນຊັ້ນ POSM'],
        description: 'ຜະລິດຕະພັນຢາເມັດຟູ່ໃນໂຄງການຮ້ານຂາຍຢາ. ການນຳໃຊ້ຕ້ອງປະຕິບັດຕາມຄຳແນະນຳ.',
      },
    },
    safety: 'ຂໍ້ມູນຜະລິດຕະພັນສະໜອງຕາມເອກະສານອ້າງອີງ. ຮ້ານຂາຍຢາຄວນແນະນຳຜູ້ໃຊ້ໃຫ້ອ່ານຄຳແນະນຳ ແລະ ປຶກສາແພດເມື່ອຈຳເປັນ.',
    nav: {
      benefits: 'ສິດທິປະໂຫຍດ',
      products: 'ຜະລິດຕະພັນ',
      packages: 'ແພັກເກດ',
      display: 'ການວາງສະແດງ',
      process: 'ວິທີເຂົ້າຮ່ວມ'
    },
    medicalWarning: 'ຮ່າງພາຍໃນມີຂໍ້ອ້າງອິງທາງການແພດ — ຫ້າມເຜີຍແຜ່ກ່ອນໄດ້ຮັບອະນຸມັດ'
  }
}


/**
 * Hai chương trình nghiệp vụ tách biệt, khóa theo tài liệu gốc:
 *
 * 1) `salesProgram`: nhập hàng theo ngưỡng hóa đơn và nhận quà.
 * 2) `displayProgram`: duy trì trưng bày trong 3 tháng và nhận thưởng.
 *
 * Không được gộp hai chương trình này trong UI hoặc analytics.
 */
export const campaignPrograms = {
  salesProgram: {
    sectionTitle: {
      vi: 'Chương trình bán hàng',
      lo: 'ໂຄງການຂາຍ',
    },
    description: {
      vi: 'Chọn gói phù hợp với quy mô nhà thuốc.',
      lo: 'ເລືອກແພັກເກດທີ່ເໝາະສົມກັບຂະໜາດຂອງຮ້ານຂາຍຢາ',
    },
    packages: {
      basic: {
        id: 'basic',
        name: {
          vi: 'Gói cơ bản',
          lo: 'ແພັກເກດພື້ນຖານ',
        },
        invoiceThresholdLak: 500_000,
        suggestedCombo: {
          vg5Boxes: 2,
          kerMaoKhangTubes: 10,
          text: {
            vi: 'VG-5 2 hộp + Ker Mao Khang 10 ống',
            lo: 'VG-5 2 ກ່ອງ + ແກ້ເມົາຄ້າງ 10 ຫຼອດ',
          },
        },
        suggestedTotalLak: 502_000,
        gift: {
          kerMaoKhangTubes: 2,
          posmSets: 1,
          displayShelves: 1,
          posters: 1,
        },
      },
      advanced: {
        id: 'advanced',
        name: {
          vi: 'Gói nâng cao',
          lo: 'ແພັກເກດຍົກລະດັບ',
        },
        invoiceThresholdLak: 1_000_000,
        suggestedCombo: {
          vg5Boxes: 5,
          kerMaoKhangTubes: 18,
          text: {
            vi: 'VG-5 5 hộp + Ker Mao Khang 18 ống',
            lo: 'VG-5 5 ກ່ອງ + ແກ້ເມົາຄ້າງ 18 ຫຼອດ',
          },
        },
        suggestedTotalLak: 1_024_000,
        giftChoice: [
          {
            id: 'kmk-5',
            kerMaoKhangTubes: 5,
            label: {
              vi: 'Ker Mao Khang 5 ống',
              lo: 'ແກ້ເມົາຄ້າງ 5 ຫຼອດ',
            },
          },
          {
            id: 'vg5-2',
            vg5Boxes: 2,
            label: {
              vi: 'VG-5 2 hộp',
              lo: 'VG-5 2 ກ່ອງ',
            },
          },
        ],
      },
    },
    sourceRules: {
      hasDiscount: false,
      hasGift: true,
      note: 'Nguồn chỉ xác nhận ngưỡng hóa đơn, combo và quà; không xác nhận giảm giá.',
    },
  },

  displayProgram: {
    sectionTitle: {
      vi: 'Chương trình trưng bày',
      lo: 'ໂຄງການວາງສະແດງ',
    },
    durationMonths: 3,
    condition: {
      vi: 'Nhà thuốc trưng bày cả hai sản phẩm theo điều kiện chương trình và gửi ảnh xác nhận mỗi tháng.',
      lo: 'ຮ້ານຂາຍຢາວາງສະແດງທັງສອງຜະລິດຕະພັນຕາມເງື່ອນໄຂໂຄງການ ແລະ ສົ່ງຮູບຢືນຢັນທຸກເດືອນ.',
    },
    rewardOptions: {
      product: {
        label: {
          vi: 'Thưởng sản phẩm',
          lo: 'ລາງວັນຜະລິດຕະພັນ',
        },
        monthlyReward: {
          kerMaoKhangTubes: 2,
          text: {
            vi: 'Mỗi tháng hợp lệ: 2 ống Ker Mao Khang',
            lo: 'ທຸກໆເດືອນທີ່ຖືກຕ້ອງ: 2 ຫຼອດ ແກ້ເມົາຄ້າງ',
          },
        },
        completionReward: {
          vg5Boxes: 1,
          text: {
            vi: 'Hoàn thành 3 tháng: tặng thêm 1 hộp VG-5',
            lo: 'ສຳເລັດ 3 ເດືອນ: ແຖມອີກ 1 ກ່ອງ VG-5',
          },
        },
      },
      cash: {
        label: {
          vi: 'Thưởng tiền mặt',
          lo: 'ລາງວັນເງິນສົດ',
        },
        monthlyLak: 50_000,
        amountText: {
          vi: '50.000 LAK/tháng',
          // Chưa có câu Lào hoàn chỉnh đã được người dịch duyệt.
          lo: null,
        },
        translationStatus: 'pending-human-translation',
      },
    },
  },

  posm: {
    tubeSlotCount: 10,
    tubeSlotLayout: {
      rows: 2,
      columns: 5,
    },
    productZone: 'VG-5',
    sourceLocked: true,
  },
} as const;

export const vg5KmkSourcePolicy = {
  campaignId: 'VG5_KMK_LAO_2026',
  sourceLockedLocale: 'lo',
  translationRule: 'use-source-string-verbatim',
  safeVariantDefault: true,
  programsMustRemainSeparate: true,
  removeUnsupportedMetrics: ['500+', '30%', '98%', '15+'],
  removeUnsupportedDiscountCopy: true,
  regulatoryGatedFields: ['pendingMedicalClaims'],
  posmTubeSlotCount: 10,
  posmTubeSlotLayout: '2x5',
} as const;

export const pendingMedicalClaims = {
  vi: {
    vg5: [
      'Bổ gan, cơ thể phục hồi nhanh',
      'Đưa men gan về mức bình thường',
    ],
    kmk: [
      'Giải say tức thì, giảm đau đầu',
      'Bổ gan, cơ thể phục hồi nhanh',
    ],
  },
  lo: {
    vg5: [
      'ບຳລຸງຕັບ, ຮ່າງກາຍຟື້ນໂຕໄວ',
      'ຄ່າຕັບກັບສູ່ສະພາບປົກກະຕິ',
    ],
    kmk: [
      'ເຊົາເມົາທັນໃຈ, ຫຼຸດອາການປວດຫົວ',
      'ບຳລຸງຕັບ, ຮ່າງກາຍຟື້ນໂຕໄວ',
    ],
  }
}

/**
 * Chỉ đổi thành `true` sau khi có phê duyệt Regulatory/Medical bằng văn bản.
 * Mặc định production luôn ẩn claim y khoa.
 */
export const MEDICAL_CLAIMS_APPROVED = false as const;

export function getVariantContent(variant: LandingVariant, lang: AppLanguage) {
  const showMedicalClaims =
    variant === 'medical-preview' && MEDICAL_CLAIMS_APPROVED;

  return {
    ...safeContent[lang],
    variant,
    showMedicalClaims,
    claims: showMedicalClaims ? pendingMedicalClaims[lang] : {
      vg5: [],
      kmk: [],
    },
  }
}
