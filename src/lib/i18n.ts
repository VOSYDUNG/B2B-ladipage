import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { safeContent, pendingMedicalClaims } from '@/content/content';
import { wlVi, wlLo } from '@/config/locales-wl';
import { nncVi, nncLo } from '@/config/locales-nnc';

// Auto-generate translations from the existing structured content dictionary
const resources = {
  vi: {
    translation: {
      ...safeContent.vi,
      claims: pendingMedicalClaims.vi,
      wl: wlVi,
      nnc: nncVi,
      // Add any missing hardcoded keys here!
      ui: {
        posmDisplayTitle: 'Tài liệu hướng dẫn trưng bày (POSM)',
        benefitsB2bEyebrow: 'LỢI ÍCH B2B',
        benefitsB2bTitle: 'Một chương trình dễ hiểu và dễ triển khai tại nhà thuốc',
        benefitsB2bDesc: 'Thông tin tập trung vào quyền lợi thương mại, POSM, quy trình và hành động đăng ký.',
        productSectionTitle: 'Sản phẩm trong chương trình',
        productSectionSubtitle: 'Nhận diện rõ sản phẩm, kèm theo tác dụng hỗ trợ lâm sàng',
        productSectionDesc: 'Giới thiệu thông tin định danh, quy cách và các tác dụng hỗ trợ lâm sàng của sản phẩm trong chương trình.',
        form: {
          title: 'Đăng ký chương trình nhà thuốc',
          desc: 'Gửi thông tin để Sales liên hệ và xác nhận gói phù hợp.',
          pharmacyName: 'Tên nhà thuốc',
          province: 'Tỉnh/Thành phố',
          contactName: 'Người liên hệ',
          phone: 'Số điện thoại',
          submit: 'Gửi đăng ký đối tác',
          submitting: 'Đang gửi...',
          successTitle: 'Đã nhận thông tin đăng ký',
          successDesc: 'Sales sẽ kiểm tra thông tin và liên hệ để xác nhận gói chương trình phù hợp.',
          doneBtn: 'Hoàn tất',
          b2bBtn: 'Đăng ký B2B',
          demoWarning: 'Bản demo chưa có biến môi trường Firebase nên dữ liệu chưa được ghi vào Firestore.',
          packageLabel: 'Gói quan tâm',
          basicPackage: 'Gói cơ bản',
          advancedPackage: 'Gói nâng cao',
          rewardLabel: 'Hình thức thưởng quan tâm',
          productReward: 'Sản phẩm',
          cashReward: 'Tiền',
          adviseReward: 'Cần Sales tư vấn',
          consentText: 'Tôi đồng ý để thông tin được sử dụng cho việc liên hệ và quản lý chương trình.',
          submitBtn: 'Gửi đăng ký',
          placeholders: {
            pharmacyName: 'Ví dụ: Nhà thuốc An Khang',
            province: 'Ví dụ: Vientiane',
            contactName: 'Tên người phụ trách',
          },
          errors: {
            pharmacyName: 'Vui lòng nhập tên nhà thuốc',
            province: 'Vui lòng nhập tỉnh/thành phố',
            contactName: 'Vui lòng nhập người liên hệ',
            phone: 'Số điện thoại chưa đúng định dạng',
            consent: 'Vui lòng đồng ý để gửi thông tin',
            serverError: 'Có lỗi xảy ra khi gửi đăng ký. Vui lòng thử lại sau.'
          }
        },
        medicalBenefitsTitle: 'Tác dụng hỗ trợ lâm sàng',
        video: {
          title: 'Không gian dành cho Video (16:9)',
          subtitle: 'Bấm để phát (Chờ tích hợp Video thật)'
        },
        packages: {
          eyebrow: 'Chương trình bán hàng',
          title: 'Chọn gói phù hợp với quy mô nhà thuốc',
          desc: 'Các gói bán hàng được thiết kế tối ưu với mức chiết khấu hấp dẫn và cơ cấu quà tặng phù hợp.',
          featuredBadge: 'Gói nổi bật',
          basicLabel: 'Bắt đầu dễ dàng',
          advancedLabel: 'Tăng lượng hàng bán',
          threshold: 'Ngưỡng hóa đơn',
          combo: 'Combo gợi ý',
          totalSuggest: 'Tổng gợi ý',
          select: 'Chọn'
        },
        display: {
          eyebrow: 'Chương trình trưng bày',
          title: 'Duy trì vị trí nổi bật trong 3 tháng',
          desc: 'Nhà thuốc trưng bày cả hai sản phẩm theo điều kiện chương trình và gửi ảnh xác nhận theo tháng.',
          productTab: 'Thưởng sản phẩm',
          cashTab: 'Thưởng tiền',
          month1: 'Tháng 1',
          month2: 'Tháng 2',
          month3: 'Tháng 3',
          action: 'Trưng bày · gửi ảnh · xác nhận'
        },
        posm: {
          eyebrow: 'POSM tại quầy',
          title: 'Giúp hai sản phẩm có một vị trí rõ ràng',
          desc: 'Mockup cho thấy cấu trúc kệ có khu vực VG-5 và 10 vị trí đặt ống. Đây là hình mô phỏng, không phải ảnh lắp đặt thực tế tại nhà thuốc.',
          bullet1: 'Bố trí tại quầy thu ngân hoặc khu vực trung tâm theo hướng dẫn',
          bullet2: 'Giữ cả hai sản phẩm trong cùng một cụm nhận diện',
          bullet3: 'Dùng ảnh xác nhận để quản lý chương trình trưng bày'
        },
        displayReward: {
          monthly: 'Mỗi tháng hợp lệ: 2 đơn vị Ker Mao Khang',
          completion: 'Hoàn thành 3 tháng: thêm 1 hộp VG-5',
          cashMonthly: '50.000 LAK cho mỗi tháng hợp lệ',
          cashMethod: 'Thanh toán hoặc trừ vào đơn hàng theo quy trình chương trình'
        },
        packageItems: {
          basic: {
            name: 'Gói cơ bản',
            inventory: '2 hộp VG-5 + 10 đơn vị Ker Mao Khang',
            gift: '2 đơn vị Ker Mao Khang + 1 bộ POSM',
            posm: '1 kệ trưng bày + 1 poster'
          },
          advanced: {
            name: 'Gói nâng cao',
            inventory: '5 hộp VG-5 + 18 đơn vị Ker Mao Khang',
            gift: 'Chọn 5 đơn vị Ker Mao Khang hoặc 2 hộp VG-5',
            posm: 'Phù hợp nhà thuốc muốn tăng lượng hàng bán trong tháng'
          }
        },
        process: {
          step1: 'Chọn gói',
          step2: 'Gửi thông tin',
          step3: 'Sales xác nhận',
          step4: 'Lên đơn',
          step5: 'Nhận hàng & POSM',
          step6: 'Duy trì trưng bày',
          step7: 'Gửi ảnh theo tháng',
          step8: 'Nhận quyền lợi',
          eyebrow: 'Bắt đầu chương trình',
          title: 'Gửi thông tin để Sales xác nhận gói phù hợp',
          desc: 'Biểu mẫu chỉ thu thập dữ liệu cần thiết cho việc liên hệ và quản lý chương trình nhà thuốc.',
          cta: 'Đăng ký ngay'
        }
      }
    }
  },
  lo: {
    translation: {
      ...safeContent.lo,
      claims: pendingMedicalClaims.lo,
      wl: wlLo,
      nnc: nncLo,
      ui: {
        posmDisplayTitle: 'ເອກະສານແນະນຳການວາງສະແດງ (POSM)',
        benefitsB2bEyebrow: 'ຜົນປະໂຫຍດ B2B',
        benefitsB2bTitle: 'ໂຄງການທີ່ເຂົ້າໃຈງ່າຍ ແລະ ປະຕິບັດງ່າຍຢູ່ຮ້ານຂາຍຢາ',
        benefitsB2bDesc: 'ຂໍ້ມູນເນັ້ນໃສ່ຜົນປະໂຫຍດທາງການຄ້າ, POSM, ຂັ້ນຕອນ ແລະ ການລົງທະບຽນ.',
        productSectionTitle: 'ຜະລິດຕະພັນໃນໂຄງການ',
        productSectionSubtitle: 'ລະບຸຜະລິດຕະພັນໃຫ້ຊັດເຈນ, ພ້ອມກັບຜົນປະໂຫຍດທາງຄລີນິກ',
        productSectionDesc: 'ແນະນຳຂໍ້ມູນການລະບຸຕົວຕົນ, ມາດຕະຖານ ແລະ ຜົນປະໂຫຍດທາງຄລີນິກຂອງຜະລິດຕະພັນໃນໂຄງການ.',
        form: {
          title: 'ລົງທະບຽນໂຄງການຮ້ານຂາຍຢາ',
          desc: 'ສົ່ງຂໍ້ມູນເພື່ອໃຫ້ພະນັກງານຂາຍຕິດຕໍ່ ແລະ ຢືນຢັນແພັກເກດທີ່ເໝາະສົມ.',
          pharmacyName: 'ຊື່ຮ້ານຂາຍຢາ',
          province: 'ແຂວງ/ນະຄອນ',
          contactName: 'ຊື່ຜູ້ຕິດຕໍ່',
          phone: 'ເບີໂທລະສັບ',
          submit: 'ສົ່ງຂໍ້ມູນລົງທະບຽນ',
          submitting: 'ກຳລັງສົ່ງ...',
          successTitle: 'ໄດ້ຮັບຂໍ້ມູນລົງທະບຽນແລ້ວ',
          successDesc: 'ພະນັກງານຂາຍຈະກວດສອບ ແລະ ຕິດຕໍ່ກັບເພື່ອຢືນຢັນແພັກເກດທີ່ເໝາະສົມ.',
          doneBtn: 'ສຳເລັດ',
          b2bBtn: 'ລົງທະບຽນ B2B',
          demoWarning: 'ສະບັບທົດລອງຍັງບໍ່ມີຕົວແປສະພາບແວດລ້ອມ Firebase ດັ່ງນັ້ນຂໍ້ມູນຈຶ່ງບໍ່ຖືກບັນທຶກລົງໃນ Firestore.',
          packageLabel: 'ແພັກເກດທີ່ສົນໃຈ',
          basicPackage: 'ແພັກເກດພື້ນຖານ',
          advancedPackage: 'ແພັກເກດຍົກລະດັບ',
          rewardLabel: 'ຮູບແບບລາງວັນທີ່ສົນໃຈ',
          productReward: 'ຜະລິດຕະພັນ',
          cashReward: 'ເງິນສົດ',
          adviseReward: 'ຕ້ອງການໃຫ້ພະນັກງານຂາຍໃຫ້ຄຳປຶກສາ',
          consentText: 'ຂ້າພະເຈົ້າຕົກລົງເຫັນດີໃຫ້ນຳໃຊ້ຂໍ້ມູນເພື່ອການຕິດຕໍ່ ແລະ ຄຸ້ມຄອງໂຄງການ.',
          submitBtn: 'ສົ່ງລົງທະບຽນ',
          placeholders: {
            pharmacyName: 'ຕົວຢ່າງ: ຮ້ານຂາຍຢາ An Khang',
            province: 'ຕົວຢ່າງ: Vientiane',
            contactName: 'ຊື່ຜູ້ຮັບຜິດຊອບ',
          },
          errors: {
            pharmacyName: 'ກະລຸນາປ້ອນຊື່ຮ້ານຂາຍຢາ',
            province: 'ກະລຸນາປ້ອນແຂວງ/ນະຄອນ',
            contactName: 'ກະລຸນາປ້ອນຊື່ຜູ້ຕິດຕໍ່',
            phone: 'ຮູບແບບເບີໂທລະສັບບໍ່ຖືກຕ້ອງ',
            consent: 'ກະລຸນາຕົກລົງເຫັນດີເພື່ອສົ່ງຂໍ້ມູນ',
            serverError: 'ເກີດຂໍ້ຜິດພາດໃນການສົ່ງລົງທະບຽນ. ກະລຸນາລອງໃໝ່ໃນພາຍຫຼັງ.'
          }
        },
        medicalBenefitsTitle: 'ຜົນປະໂຫຍດທາງຄລີນິກ',
        video: {
          title: 'ພື້ນທີ່ສຳລັບວິດີໂອ (16:9)',
          subtitle: 'ກົດເພື່ອຫຼິ້ນ (ລໍຖ້າວິດີໂອຕົວຈິງ)'
        },
        packages: {
          eyebrow: 'ໂຄງການຂາຍ',
          title: 'ເລືອກແພັກເກດທີ່ເໝາະສົມກັບຂະໜາດຂອງຮ້ານຂາຍຢາ',
          desc: 'ແພັກເກດການຂາຍຖືກອອກແບບມາໃຫ້ເໝາະສົມ ພ້ອມສ່ວນຫຼຸດ ແລະ ຂອງຂວັນທີ່ໜ້າສົນໃຈ.',
          featuredBadge: 'ແພັກເກດພິເສດ',
          basicLabel: 'ເລີ່ມຕົ້ນງ່າຍດາຍ',
          advancedLabel: 'ເພີ່ມຍອດຂາຍ',
          threshold: 'ຍອດບິນ',
          combo: 'ຄອມໂບແນະນຳ',
          totalSuggest: 'ຍອດລວມແນະນຳ',
          select: 'ເລືອກ'
        },
        display: {
          eyebrow: 'ໂຄງການວາງສະແດງ',
          title: 'ຮັກສາຈຸດເດັ່ນເປັນເວລາ 3 ເດືອນ',
          desc: 'ຮ້ານຂາຍຢາວາງສະແດງທັງສອງຜະລິດຕະພັນຕາມເງື່ອນໄຂໂຄງການ ແລະ ສົ່ງຮູບຢືນຢັນທຸກເດືອນ.',
          productTab: 'ລາງວັນຜະລິດຕະພັນ',
          cashTab: 'ລາງວັນເງິນສົດ',
          month1: 'ເດືອນ 1',
          month2: 'ເດືອນ 2',
          month3: 'ເດືອນ 3',
          action: 'ວາງສະແດງ · ສົ່ງຮູບ · ຢືນຢັນ'
        },
        posm: {
          eyebrow: 'POSM ຢູ່ຮ້ານ',
          title: 'ຊ່ວຍໃຫ້ທັງສອງຜະລິດຕະພັນມີຕຳແໜ່ງທີ່ຊັດເຈນ',
          desc: 'ພາບຈຳລອງສະແດງໂຄງສ້າງຊັ້ນວາງທີ່ມີເຂດ VG-5 ແລະ 10 ບ່ອນວາງຫຼອດ. ນີ້ແມ່ນພາບຈຳລອງ, ບໍ່ແມ່ນຮູບພາບການຕິດຕັ້ງຕົວຈິງຢູ່ຮ້ານຂາຍຢາ.',
          bullet1: 'ຈັດວາງໄວ້ໜ້າເຄົາເຕີຈ່າຍເງິນ ຫຼື ເຂດໃຈກາງຕາມການແນະນຳ',
          bullet2: 'ຮັກສາທັງສອງຜະລິດຕະພັນໄວ້ໃນຈຸດດຽວກັນ',
          bullet3: 'ໃຊ້ຮູບຖ່າຍຢືນຢັນເພື່ອຄຸ້ມຄອງໂຄງການວາງສະແດງ'
        },
        displayReward: {
          monthly: 'ທຸກໆເດືອນທີ່ຖືກຕ້ອງ: 2 ຫຼອດ ແກ້ເມົາຄ້າງ',
          completion: 'ສຳເລັດ 3 ເດືອນ: ແຖມອີກ 1 ກ່ອງ VG-5',
          cashMonthly: '50.000 LAK ສຳລັບທຸກໆເດືອນທີ່ຖືກຕ້ອງ',
          cashMethod: 'ຈ່າຍເປັນເງິນສົດ ຫຼື ຫັກອອກຈາກບິນສັ່ງຊື້ຕາມຂັ້ນຕອນຂອງໂຄງການ'
        },
        packageItems: {
          basic: {
            name: 'ແພັກເກດພື້ນຖານ',
            inventory: 'VG-5 2 ກ່ອງ + ແກ້ເມົາຄ້າງ 10 ຫຼອດ',
            gift: 'ແກ້ເມົາຄ້າງ 2 ຫຼອດ + POSM 1 ຊຸດ',
            posm: 'ຊັ້ນວາງສະແດງ 1 ອັນ + ໂປສເຕີ 1 ແຜ່ນ'
          },
          advanced: {
            name: 'ແພັກເກດຍົກລະດັບ',
            inventory: 'VG-5 5 ກ່ອງ + ແກ້ເມົາຄ້າງ 18 ຫຼອດ',
            gift: 'ເລືອກ ແກ້ເມົາຄ້າງ 5 ຫຼອດ ຫຼື VG-5 2 ກ່ອງ',
            posm: 'ເໝາະສຳລັບຮ້ານຂາຍຢາທີ່ຕ້ອງການເພີ່ມຍອດຂາຍໃນເດືອນ'
          }
        },
        process: {
          step1: 'ເລືອກແພັກເກດ',
          step2: 'ສົ່ງຂໍ້ມູນ',
          step3: 'Sales ຢືນຢັນ',
          step4: 'ສັ່ງຊື້',
          step5: 'ຮັບສິນຄ້າ & POSM',
          step6: 'ຮັກສາການວາງສະແດງ',
          step7: 'ສົ່ງຮູບທຸກເດືອນ',
          step8: 'ຮັບສິດທິປະໂຫຍດ',
          eyebrow: 'ເລີ່ມຕົ້ນໂຄງການ',
          title: 'ສົ່ງຂໍ້ມູນເພື່ອໃຫ້ Sales ຢືນຢັນແພັກເກດທີ່ເໝາະສົມ',
          desc: 'ຟອມນີ້ເກັບກຳສະເພາະຂໍ້ມູນທີ່ຈຳເປັນສຳລັບການຕິດຕໍ່ ແລະ ຄຸ້ມຄອງໂຄງການຮ້ານຂາຍຢາ.',
          cta: 'ລົງທະບຽນດຽວນີ້'
        }
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'vi',
    react: { useSuspense: false },
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    }
  });

export default i18n;
