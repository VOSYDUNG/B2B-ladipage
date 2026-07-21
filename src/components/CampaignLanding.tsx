import React from 'react';
import { 
  Sparkles, Activity, FileText, Award, Check, MapPin, Coins, Gift, 
  AlertTriangle, Eye, Info, Store, Phone, FileSignature, ArrowRight, 
  BookOpen, Play, Pause, Volume2, VolumeX, Star, ChevronDown, ChevronUp, 
  Calculator, HelpCircle 
} from 'lucide-react';
import { AppLanguage } from '../types';

const ENABLE_MEDICAL_CLAIMS = false;

const SafeImage = ({ src, placeholderLabel, className, alt = "" }: { src: string, placeholderLabel?: string, className?: string, alt?: string }) => {
  return <img src={src} alt={alt || placeholderLabel} className={className} onError={(e) => {
    e.currentTarget.style.display = 'none';
    if (e.currentTarget.parentElement) {
      const div = document.createElement('div');
      div.className = "w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 text-[10px] font-bold p-4 text-center border border-dashed border-slate-300";
      div.innerText = placeholderLabel || 'Missing Image';
      e.currentTarget.parentElement.appendChild(div);
    }
  }} />;
};
interface CampaignLandingProps {
  lang: AppLanguage;
  setLang: (lang: AppLanguage) => void;
  medicalMode: boolean;
  setMedicalMode: (mode: boolean) => void;
  calcCombo: 'COMBO_500K' | 'COMBO_1M' | 'COMBO_3M';
  setCalcCombo: (combo: 'COMBO_500K' | 'COMBO_1M' | 'COMBO_3M') => void;
  weeklyTraffic: number;
  setWeeklyTraffic: (traffic: number) => void;
  
  // Form states
  formPharmacy: string;
  setFormPharmacy: (val: string) => void;
  formContact: string;
  setFormContact: (val: string) => void;
  formPhone: string;
  setFormPhone: (val: string) => void;
  formProvince: string;
  setFormProvince: (val: string) => void;
  formCombo: string;
  setFormCombo: (val: string) => void;
  formReward: 'IN_KIND' | 'CASH' | 'NONE';
  setFormReward: (val: 'IN_KIND' | 'CASH' | 'NONE') => void;
  formSubmitted: boolean;
  isSubmitting: boolean;
  handleLeadFormSubmit: (e: React.FormEvent) => void;
  clearForm: () => void;

  // Video states
  videoPlaying: boolean;
  setVideoPlaying: (playing: boolean) => void;
  videoTime: number;
  setVideoTime: (time: number) => void;
  videoMuted: boolean;
  setVideoMuted: (muted: boolean) => void;
  videoSpeed: number;
  setVideoSpeed: (speed: number) => void;

  // Helpers
  triggerAnalyticsEvent: (name: string, params: Record<string, any>) => void;
  scrollSection: (id: string) => void;
  expandedFaq: number | null;
  setExpandedFaq: (id: number | null) => void;
}

// Inline SVG assets for maximum reliability and clean scaling without broken image paths
const DICTIONARY = {
  lo: {
    brandName: "NNC Pharma",
    brandSlogan: "ຄູ່ຮ່ວມງານຮ້ານຂາຍຢາທີ່ໜ້າເຊື່ອຖືໃນລາວ",
    navHome: "ໜ້າຫຼັກ",
    navProducts: "ຜະລິດຕະພັນ",
    navVideo: "ວິດີໂອແນະນຳ",
    navCalculator: "ຄິດໄລ່ກຳໄລ",
    navTestimonials: "ຄຳຄິດເຫັນ",
    navFaq: "ຄຳຖາມທົ່ວໄປ",
    navRegister: "ລົງທະບຽນ",
    
    heroBadge: "ໂຄງການຮ່ວມມືສະເພາະຮ້ານຂາຍຢາໄຕມາດ 2/2026",
    heroTitle: "ເພີ່ມຍອດຂາຍຮ້ານຢາຂອງທ່ານດ້ວຍຊຸດຜະລິດຕະພັນ",
    heroTitleHighlight: "VG-5 & ແກ້ເມົາຄ້າງ",
    heroDesc: "ໂອກາດການຄ້າທີ່ດີທີ່ສຸດໃນປີ 2026 ສໍາລັບຮ້ານຢາໃນລາວ. ຮັບຄະແນນການຄ້າສູງ, ລະບົບຊັ້ນວາງ POSM ແບບປະສົມ ແລະ ການສະໜັບສະໜູນຢ່າງເຕັມຮູບແບບຈາກ Trình Dược Viên.",
    heroCta: "ລົງທະບຽນຮັບຂໍ້ສະເໜີທັນທີ",
    heroStatsLeads: "ຮ້ານຢາໄດ້ເຂົ້າຮ່ວມແລ້ວ",
    heroStatsPosm: "ຊັ້ນວາງໄດ້ຕິດຕັ້ງແລ້ວ",

    productSectionTitle: "ລາຍລະອຽດຜະລິດຕະພັນຄູ່ຮ່ວມງານ",
    productSectionSubtitle: "ຄຸນລັກສະນະທາງກາຍະພາບ ແລະ ມາດຕະຖານການຜະລິດ",
    vg5Name: "VG-5 (ຢາເມັດສະໝູນໄພ)",
    vg5Specs: "ຂະໜາດບັນຈຸ: 40 ເມັດ/ແກ້ວ/ກ່ອງ (ສະເພາະໃໝ່ຫຼ້າສຸດ)",
    vg5Mfg: "ຜູ້ຜະລິດ: Danapha (ຫວຽດນາມ) - ມາດຕະຖານ GMP-WHO",
    vg5Dist: "ຜູ້ຈັດຈຳໜ່າຍໃນລາວ: NNC Pharma Co., Ltd",
    vg5SafeClaim: "ຢາສະໝູນໄພພື້ນເມືອງ, ບັນຈຸພັນແກ້ວປ້ອງກันແສງ, ສະດວກໃນການເກັບຮັກສາ, ມີເອກະສານ CO/CQ ຄົບຖ້ວນ.",
    vg5MedClaim: "ປ້ອງກັນຈຸລັງຕັບ, ເພີ່ມທະວີການຂັບຖ່າຍສານພິດໃນຕັບ, ຫຼຸດຄ່າເອນໄຊມ໌ຕັບ (ALT/AST), ສະໜັບສະໜູນການປິ່ນປົວພະຍາດຕັບອັກເສບ ແລະ ໄຂມັນເກາະຕັບ.",

    kmkName: "Ker Mao Khang (ແກ້ເມົາຄ້າງ - ຢາເມັດຟູ)",
    kmkSpecs: "ຂະໜາດບັນຈຸ: 10 ເມັດ/ຫຼອດ, ກ່ອງນອກສະດວກສະບາຍ",
    kmkMfg: "ຜູ້ຜະລິດ: ບໍລິສັດການຢາ ຮ່າຕິ້ງ - ມາດຕະຖານ ISO",
    kmkDist: "ຜູ້ຈັດຈຳໜ່າຍໃນລາວ: NNC Pharma Co., Ltd",
    kmkSafeClaim: "ຢາເມັດຟູລະລາຍໄວ, ລົດຊາດໝາກກ້ຽງສົດຊື່ນ, ສະດວກໃນການພົກພາ, ເໝາະສົມກັບການວາງສະແດງໃນຮູສຽບຊັ້ນວາງ POSM.",
    kmkMedClaim: "ສູດວິທະຍາສາດບັນຈຸ Succinic Acid, Fumaric Acid ແລະ Methionine. ຊ່ວຍເລັ່ງການຍ່ອຍສະຫຼາຍຂອງ Acetaldehyde, ຫຼຸດອາການເມົາຄ້າງ, ປວດຫົວ, ປວດຮາກ ແລະ ປ້ອງກັນລະບົບປະສາດ.",

    medSpecsTitle: "ກົນໄກວິທະຍາສາດ (Active Ingredients):",
    medSpecsSuccinic: "Succinic Acid (200mg): ກະຕຸ້ນວົງຈອນ Krebs, ເລັ່ງການຂັບຖ່າຍທາດເຫຼົ້າອອກຈາກຮ່າງກາຍ.",
    medSpecsFumaric: "Fumaric Acid (75mg): ປົກປ້ອງກະເພາະອາຫານ ແລະ ເລັ່ງການແປຮູບທາດພິດ.",
    medSpecsMethionine: "Methionine (50mg): ອາຊິດອາມີໂນຈຳເປັນທີ່ຊ່ວຍສ້າງ Glutathione ເພື່ອປ້ອງກັນຕັບ.",

    comboTitle: "ແພັກເກັດການຄ້າ ແລະ ສິດທິປະໂຫຍດການວາງສະແດງ",
    comboSubtitle: "ເລືອກແພັກເກັດທີ່ເໝາະສົມກັບຂະໜາດຮ້ານຂາຍຢາຂອງທ່ານ",
    comboBasic: "ແພັກເກັດເລີ່ມຕົ້ນ (Combo 500K LAK)",
    comboBasicDesc: "ເໝາະສຳລັບຮ້ານຂາຍຢາຂະໜາດນ້ອຍ ຫຼື ຕ້ອງການທົດລອງຕະຫຼາດ",
    comboPremium: "ແພັກເກັດແນະນຳ (Combo 1M LAK)",
    comboPremiumDesc: "ເໝາະສຳລັບຮ້ານຂາຍຢາຂະໜາດກາງ ແລະ ໃຫຍ່ ທີ່ຕ້ອງການສ້າງຍອດຂາຍສູງ",
    comboRewardTitle: "ສິດທິປະໂຫຍດການວາງສະແດງ (3 ເດືອນ):",
    comboRewardCash: "ທາງເລືອກ A: ຮັບເງິນສົດ 50,000 LAK / ເດືອນ",
    comboRewardProduct: "ທາງເລືອກ B: ຮັບຢາເມັດຟູ 2 ຫຼອດ / ເດືອນ + 1 ກ່ອງ VG-5 (ເມື່ອສິ້ນສຸດໂຄງການ)",

    formTitle: "ຟອມລົງທະບຽນເຂົ້າຮ່ວມໂຄງການ",
    formSubtitle: "ກະລຸນາຕື່ມຂໍ້ມູນຮ້ານຢາຂອງທ່ານເພື່ອຮັບສິດທິປະໂຫຍດ",
    formPharmacyName: "ຊື່ຮ້ານຂາຍຢາ",
    formContactName: "ຊື່ຜູ້ຕິດຕໍ່ (ເພສັດຊະກອນ/ເຈົ້າຂອງຮ້ານ)",
    formPhone: "ເບີໂທລະສັບ (ຕົວຢ່າງ: 020 55xxxxxx)",
    formProvince: "ແຂວງ/ນະຄອນຫຼວງ",
    formSelectCombo: "ເລືອກແພັກເກັດ",
    formSelectReward: "ເລືອກສິດທິປະໂຫຍດການວາງສະແດງ",
    formRewardNone: "ບໍ່ເຂົ້າຮ່ວມການວາງສະແດງ (ບໍ່ຮັບຂອງແຖມ)",
    formRewardInKind: "ຮັບຂອງແຖມເປັນຜະລິດຕະພັນ (ແກ້ເມົາຄ້າງ)",
    formRewardCash: "ຮັບຂອງແຖມເປັນເງິນສົດ (50,000 LAK/ເດືອນ)",
    formSubmit: "ສົ່ງຂໍ້ມູນລົງທະບຽນ",
    formSubmitting: "ກຳລັງບັນທຶກຂໍ້ມູນເຂົ້າ Database...",
    formSuccess: "ລົງທະບຽນສຳເລັດແລ້ວ!",
    formSuccessDesc: "ຂໍ້ມູນຂອງທ່ານໄດ້ຖືກບັນທຶກເຂົ້າຖານຂໍ້ມູນຢ່າງປອດໄພ. ທີມງານ NNC Pharma ຈະຕິດຕໍ່ຫາທ່ານໂດຍໄວທີ່ສຸດ.",
    formBtnBack: "ລົງທະບຽນຕື່ມອີກ",

    disclaimerTitle: "ຄຳເຕືອນທາງກົດໝາຍ ແລະ ການປະຕິເສດຄວາມຮັບຜິດຊອບ",
    disclaimerA: "ຂໍ້ມູນຜະລິດຕະພັນສະແດງຕາມບັນຈຸພັນຕົວຈິງ ແລະ ເອກະສານ PIL ທີ່ໄດ້ຮັບການອະນຸມັດ. ຜະລິດຕະພັນນີ້ບໍ່ແມ່ນຢາປິ່ນປົວພະຍາດ ແລະ ບໍ່ສາມາດປ່ຽນແທນຢາປິ່ນປົວພະຍາດໄດ້.",
    disclaimerB: "ຄຳເຕືອນກ່ຽວກັບການດື່ມເຫຼົ້າ: ການໃຊ້ຜະລິດຕະພັນແກ້ເມົາຄ້າງ ບໍ່ໄດ້ໝາຍຄວາມວ່າທ່ານສາມາດຂັບຂີ່ຍານພາຫະນະໄດ້ຢ່າງປອດໄພຫຼັງການດື່ມເຫຼົ້າ. ກະລຸນາປະຕິບັດຕາມກົດຈະລາຈອນຢ່າງເຂັ້ມງວດ.",
    calcTitle: "ເຄື່ອງມືຄິດໄລ່ກຳໄລຮ້ານຢາ",
    calcSubtitle: "ປະເມີນລາຍຮັບເພີ່ມເຕີມຈາກການຂາຍ ແລະ ໂບນັດວາງສະແດງ"
  },
  vi: {
    brandName: "NNC Pharma",
    brandSlogan: "Đối tác nhà thuốc tin cậy tại Lào",
    navHome: "Trang chủ",
    navProducts: "Sản phẩm",
    navVideo: "Video giới thiệu",
    navCalculator: "Tính lợi nhuận",
    navTestimonials: "Ý kiến nhà thuốc",
    navFaq: "Hỏi đáp (FAQ)",
    navRegister: "Đăng ký đối tác",
    
    heroBadge: "Chương trình dành cho nhà thuốc tại Lào",
    heroTitle: "Chương trình bán hàng và trưng bày ",
    heroTitleHighlight: "VG-5 + ແກ້ເມົາຄ້າງ",
    heroDesc: "Chọn gói nhập hàng phù hợp, nhận bộ POSM và quyền lợi trưng bày trong ba tháng.",
    heroCta: "Đăng ký tham gia",
    heroStatsLeads: "Nhà thuốc đã liên kết",
    heroStatsPosm: "Kệ trưng bày đã phủ",

    productSectionTitle: "Chi Tiết Bộ Đôi Sản Phẩm Đồng Hành",
    productSectionSubtitle: "Cấu trúc vật lý, tiêu chuẩn sản xuất và cơ chế giải độc",
    vg5Name: "VG-5 (Viên nén thảo dược)",
    vg5Specs: "Quy cách: 40 viên nén bao phim/lọ thủy tinh/hộp (Mới nhất)",
    vg5Mfg: "Nhà sản xuất: Danapha (Việt Nam) - Đạt chuẩn quốc tế GMP-WHO",
    vg5Dist: "Nhà phân phối tại Lào: NNC Pharma Co., Ltd",
    vg5SafeClaim: "Thành phần thảo dược tự nhiên, đóng gói lọ thủy tinh tối màu bảo vệ dược tính hoàn hảo, dễ sắp xếp tại tủ quầy, đầy đủ giấy tờ CO/CQ chính hãng.",
    vg5MedClaim: "Hỗ trợ bảo vệ tế bào gan vượt trội, tăng cường chức năng giải độc, thúc đẩy hạ men gan (AST/ALT), hỗ trợ điều trị viêm gan cấp và mãn tính một cách an toàn từ y học cổ truyền.",

    kmkName: "Ker Mao Khang (แก้ເມົາຄ້າງ - Viên sủi giải rượu)",
    kmkSpecs: "Quy cách: 10 viên sủi/ống nhựa bảo quản, hộp giấy ngoài",
    kmkMfg: "Nhà sản xuất: Dược Hà Tĩnh (Hadiphar) - Đạt chuẩn ISO quốc tế",
    kmkDist: "Nhà phân phối tại Lào: NNC Pharma Co., Ltd",
    kmkSafeClaim: "Dạng viên sủi hòa tan nhanh, vị cam thanh ngọt thơm mát, tiện mang theo, được thiết kế với kích thước vừa khít 10 hốc cắm trên kệ trưng bày POSM của NNC.",
    kmkMedClaim: "Công thức y khoa chứa Succinic Acid, Fumaric Acid và Methionine giúp đẩy nhanh chu trình chuyển hóa cồn, phân hủy Acetaldehyde độc hại, cắt nhanh cơn say, giảm đau đầu và bảo vệ hệ thần kinh.",

    medSpecsTitle: "Cơ chế sinh học & hoạt chất y khoa chuyên sâu:",
    medSpecsSuccinic: "Succinic Acid (200mg): Thúc đẩy chu trình Krebs phân giải nhanh acetaldehyde độc hại.",
    medSpecsFumaric: "Fumaric Acid (75mg): Trung hòa axit dạ dày, bảo vệ niêm mạc khỏi kích ứng do cồn.",
    medSpecsMethionine: "Methionine (50mg): Axit amin thiết yếu thúc đẩy gan sản sinh Glutathione nội sinh giải độc gan.",

    comboTitle: "Gói Ưu Đãi Thương Mại & Thưởng Trưng Bày",
    comboSubtitle: "Lựa chọn gói nhập hàng phù hợp với quy mô điểm bán của bạn",
    comboBasic: "Gói Khởi Động (Combo 500K LAK)",
    comboBasicDesc: "Phù hợp nhà thuốc quy mô nhỏ hoặc muốn thử nghiệm phản ứng người tiêu dùng",
    comboPremium: "Gói Khuyến Nghị (Combo 1M LAK)",
    comboPremiumDesc: "Tối ưu hóa lợi nhuận, tặng miễn phí kệ POSM và thưởng duy trì quầy trưng bày",
    comboRewardTitle: "Quyền lợi thưởng duy trì kệ trưng bày tại quầy (3 tháng liên tục):",
    comboRewardCash: "Phương án A: Thưởng tiền mặt 50,000 LAK / tháng",
    comboRewardProduct: "Phương án B: Thưởng 2 ống sủi giải rượu / tháng + 1 hộp VG-5 (Tổng kết cuối kỳ)",

    formTitle: "Đăng Ký Tham Gia Chương Trình Đối Tác",
    formSubtitle: "Vui lòng nhập thông tin nhà thuốc của bạn để Trình dược viên bàn giao kệ POSM tận nơi miễn phí",
    formPharmacyName: "Tên nhà thuốc / Cơ sở kinh doanh",
    formContactName: "Dược sĩ đại diện (Chủ quầy / Người liên hệ)",
    formPhone: "Số điện thoại liên hệ (Ví dụ: 020 55xxxxxx)",
    formProvince: "Tỉnh / Thành phố hoạt động tại Lào",
    formSelectCombo: "Lựa chọn gói nhập hàng phù hợp",
    formSelectReward: "Lựa chọn hình thức thưởng trưng bày",
    formRewardNone: "Không tham gia chương trình trưng bày (Chỉ nhập sỉ)",
    formRewardInKind: "Nhận bằng sản phẩm sủi giải rượu",
    formRewardCash: "Nhận bằng tiền mặt (50,000 LAK/tháng)",
    formSubmit: "Gửi đăng ký đối tác ngay",
    formSubmitting: "Đang lưu trữ dữ liệu vào Database...",
    formSuccess: "Đăng Ký Đối Tác Thành Công!",
    formSuccessDesc: "Thông tin nhà thuốc của bạn đã được ghi nhận thành công. Trình Dược Viên phụ trách khu vực của NNC Pharma sẽ liên hệ trong vòng 24h.",
    formBtnBack: "Đăng ký thêm cơ sở khác",

    disclaimerTitle: "Tuyên Bố Pháp Lý & Miễn Trừ Trách Nhiệm",
    disclaimerA: "Thông tin sản phẩm dựa trên hồ sơ công bố lưu hành thực tế được cấp phép. Sản phẩm này không phải là thuốc và không có tác dụng thay thế thuốc chữa bệnh.",
    disclaimerB: "Cảnh báo an toàn rượu bia: Sử dụng viên sủi giải rượu hỗ trợ bảo vệ cơ thể nhưng không loại bỏ hoàn toàn nồng độ cồn để tham gia giao thông. Hãy chấp hành nghiêm chỉnh luật giao thông.",
    calcTitle: "Công Cụ Tính Lợi Nhuận Nhà Thuốc",
    calcSubtitle: "Ước tính lợi nhuận thu về từ doanh số bán lẻ combo và tiền thưởng trưng bày"
  },
  en: {
    brandName: "NNC Pharma",
    brandSlogan: "Trusted pharmacy partner in Laos",
    navHome: "Home",
    navProducts: "Products",
    navVideo: "Promo Video",
    navCalculator: "Calculate Profit",
    navTestimonials: "Testimonials",
    navFaq: "FAQs",
    navRegister: "Register",

    heroBadge: "Q2/2026 Pharmacy Trade Partnership Program",
    heroTitle: "Accelerate Pharmacy Revenue with the Power Duo",
    heroTitleHighlight: "VG-5 + ແກ້ເມົາຄ້າງ",
    heroDesc: "The ultimate 2026 commercial solution for pharmacies in Laos. High profit margins, joint structural POSM display supplied for free, and direct field representative support.",
    heroCta: "Register for Promo Pack & Free POSM",
    heroStatsLeads: "Partnered Pharmacies",
    heroStatsPosm: "POSM Displays Deployed",

    productSectionTitle: "Cohesive Product Portfolio",
    productSectionSubtitle: "Physical specifications, manufacturing certifications & chemical properties",
    vg5Name: "VG-5 (Herbal Tablet)",
    vg5Specs: "Packaging: 40 film-coated tablets/dark glass bottle/box (Latest)",
    vg5Mfg: "Manufacturer: Danapha (Vietnam) - GMP-WHO Certified Standard",
    vg5Dist: "Laos Distributor: NNC Pharma Co., Ltd",
    vg5SafeClaim: "All-natural herbal ingredients, light-protected amber glass bottle for stable shelf life, easy shelf setup, fully verified CO/CQ certificates.",
    vg5MedClaim: "Provides strong hepatocyte protection, enhances liver detoxification pathways, significantly reduces liver enzymes (ALT/AST), and traditionally supports hepatitis treatments.",

    kmkName: "Ker Mao Khang (ແກ້ເມົາຄ້າງ - Effervescent)",
    kmkSpecs: "Packaging: 10 effervescent tablets/tube, outer protective box",
    kmkMfg: "Manufacturer: Ha Tinh Pharmaceutical (Hadiphar) - ISO Certified",
    kmkDist: "Laos Distributor: NNC Pharma Co., Ltd",
    kmkSafeClaim: "Fast-dissolving effervescent, cooling citrus flavor, highly portable, precision-designed to fit securely inside the 10 custom holes of the NNC POSM stand.",
    kmkMedClaim: "Clinical formula containing Succinic Acid, Fumaric Acid, and Methionine to accelerate alcohol metabolism, oxidize hazardous acetaldehyde, relieve hangover headache/nausea, and protect cells.",

    medSpecsTitle: "Bio-chemical Action Pathways (Active Ingredients):",
    medSpecsSuccinic: "Succinic Acid (200mg): Drives the Krebs cycle to quickly oxidize toxic alcohol metabolites.",
    medSpecsFumaric: "Fumaric Acid (75mg): Buffers stomach acidity and lowers gastric irritation.",
    medSpecsMethionine: "Methionine (50mg): Essential amino acid triggering liver-protecting endogenous Glutathione.",

    comboTitle: "Wholesale Trade Combos & Display Rewards",
    comboSubtitle: "Select the bundle size that matches your pharmacy's weekly customer flow",
    comboBasic: "Starter Combo (500K LAK)",
    comboBasicDesc: "Best for small community pharmacies or initial geographical market testing",
    comboPremium: "Recommended Combo (1M LAK)",
    comboPremiumDesc: "Maximum profit margin, includes custom premium POSM stand and recurring display rewards",
    comboRewardTitle: "Continuous monthly display incentive details (3 consecutive months):",
    comboRewardCash: "Reward option A: 50,000 LAK / month cash transfer",
    comboRewardProduct: "Reward option B: 2 free tubes of Ker Mao Khang seltzer / month + 1 box of VG-5 (upon final review)",

    formTitle: "Pharmacy Partner Application Form",
    formSubtitle: "Please enter your outlet details below. A representative will deliver the stock and install your free POSM rack.",
    formPharmacyName: "Pharmacy / Business Outlet Name",
    formContactName: "Representing Pharmacist (Owner / Contact Person)",
    formPhone: "Mobile Number (e.g. 020 55xxxxxx)",
    formProvince: "Laos Province / Region",
    formSelectCombo: "Select Wholesale Trade Combo Level",
    formSelectReward: "Select Display Reward Incentive Preference",
    formRewardNone: "No display program participation (Inventory stock only)",
    formRewardInKind: "Product payout (Ker Mao Khang tubes)",
    formRewardCash: "Cash payout (50,000 LAK/month)",
    formSubmit: "Submit B2B Lead Document",
    formSubmitting: "Saving B2B document to Database...",
    formSuccess: "B2B Registration Completed!",
    formSuccessDesc: "Your partner lead document has been successfully committed. An NNC Pharma representative will contact you in 24 hours.",
    formBtnBack: "Register Another Outlet",

    disclaimerTitle: "Regulatory Compliance & Safety Disclosures",
    disclaimerA: "Product details represent standard packaging specs and approved PIL guidelines. This product is not intended to diagnose, treat, cure, or prevent any disease.",
    disclaimerB: "Responsible drinking disclosure: Hangover seltzers relieve physical symptoms but do not eliminate breath alcohol. Always adhere strictly to Laos road safety laws.",
    calcTitle: "Pharmacy Profit Estimation tool",
    calcSubtitle: "Forecast additional revenue from retail sales markup and recurring display incentives"
  }
};

const FAQ_ITEMS = [
  {
    id: 1,
    q: {
      vi: "Chương trình bán hàng và trưng bày này áp dụng tại khu vực nào?",
      lo: "ໂຄງການຂາຍ ແລະ ວາງສະແດງນີ້ຈັດຂຶ້ນຢູ່ເຂດໃດແດ່?",
      en: "In which areas does this display campaign apply?"
    },
    a: {
      vi: "Chương trình hiện tại áp dụng cho toàn bộ các nhà thuốc trên lãnh thổ Lào, bao gồm thủ đô Vientiane, tỉnh Savannakhet, Champasak, Luang Prabang và các tỉnh lân cận.",
      lo: "ໂຄງການນີ້ຈັດຂຶ້ນສຳລັບຮ້ານຂາຍຢາທັງໝົດໃນລາວ ເຊັ່ນ ນະຄອນຫຼວງວຽງຈັນ, ສະຫວັນນະເຂດ, ຈຳປາສັກ, ຫຼວງພະບາງ ແລະ ແຂວງອື່ນໆ.",
      en: "This program currently applies to all registered pharmacies across Laos, including Vientiane, Savannakhet, Champasak, Luang Prabang, and other provinces."
    }
  },
  {
    id: 2,
    q: {
      vi: "Nhà thuốc có bắt buộc nhập cả 2 sản phẩm VG-5 và sủi giải rượu không?",
      lo: "ຮ້ານຂາຍຢາຕ້ອງຊື້ທັງສອງຜະລິດຕະພັນ VG-5 ແລະ ແກ້ເມົາຄ້າງ ບໍ່?",
      en: "Is the pharmacy required to stock both products?"
    },
    a: {
      vi: "Đúng vậy. Để tối ưu hóa hiệu quả trưng bày trên kệ POSM chuyên dụng (có sẵn hốc cắm sủi và khay đứng lọ thuốc dẹt) và tối đa hóa doanh thu điểm bán, nhà thuốc cần nhập cả 2 sản phẩm theo cấu trúc combo cơ bản hoặc nâng cao.",
      lo: "ແມ່ນແລ້ວ. ເພື່ອໃຫ້ວາງສະແດງໄດ້ຢ່າງສວຍງາມເທິງຊັ້ນວາງ POSM ແລະ ເພີ່ມຍອດຂາຍ, ຮ້ານຢາຄວນຊື້ທັງສອງຜະລິດຕະພັນຮ່ວມກັນ.",
      en: "Yes. To optimize display aesthetic on our custom joint POSM stand and maximize point-of-sale revenues, pharmacies must purchase both products according to our combo packages."
    }
  },
  {
    id: 3,
    q: {
      vi: "Kệ trưng bày POSM và hàng quà tặng sẽ được giao trong bao lâu?",
      lo: "ຊັ້ນວາງ POSM ແລະ ຂອງແຖມຈະໄດ້ຮັບພາຍໃນຈັກວັນ?",
      en: "How long does it take to deliver the POSM and gifts?"
    },
    a: {
      vi: "Sau khi bạn hoàn thành gửi form đăng ký, Trình dược viên phụ trách khu vực của NNC Pharma sẽ liên hệ xác nhận đơn hàng và tiến hành bàn giao, lắp ráp kệ POSM trực tiếp tại quầy thuốc của bạn hoàn toàn miễn phí trong vòng 24h.",
      lo: "ຫຼັງຈາກລົງທະບຽນ, ທີມງານ NNC Pharma ຈະຕິດຕໍ່ຢືນຢັນ ແລະ ຈັດສົ່ງຕິດຕັ້ງຊັ້ນວາງໃຫ້ຟຣີຮອດຮ້ານພາຍໃນ 24 ຊົ່ວໂມງ.",
      en: "Once you register, NNC field representatives will confirm your order and install your POSM countertop display directly in 24 hours, free of charge."
    }
  },
  {
    id: 4,
    q: {
      vi: "Điều kiện chụp ảnh báo cáo trưng bày hằng tháng để nhận thưởng là gì?",
      lo: "ເງື່ອນໄຂການຖ່າຍຮູບລາຍງານທຸກເດືອນເພື່ອຮັບໂບນັດມີຫຍັງແດ່?",
      en: "What are the rules for monthly photo submissions to get rewards?"
    },
    a: {
      vi: "Nhà thuốc chỉ cần chụp 1 tấm ảnh rõ nét thấy rõ kệ POSM NNC đặt ở vị trí dễ nhìn (quầy thu ngân hoặc tủ kính trung tâm) có đầy đủ cả 2 sản phẩm (đạt trên 80% dung lượng kệ) và gửi cho Trình dược viên phụ trách qua WhatsApp trước ngày 25 hằng tháng.",
      lo: "ພຽງແຕ່ຖ່າຍຮູບຊັ້ນວາງສະແດງທີ່ວາງຢູ່ໜ້າຮ້ານ ເຊິ່ງມີສິນຄ້າຫຼາຍກວ່າ 80% ແລະ ສົ່ງໃຫ້ທີມງານຜ່ານ WhatsApp ກ່ອນວັນທີ 25 ຂອງທຸກໆເດືອນ.",
      en: "Pharmacies submit one clear photo showing the NNC POSM stand on their cashier counter or main glass cabinet stocked at over 80% capacity to their representative via WhatsApp before the 25th of each month."
    }
  }
];

export default function CampaignLanding({
  lang, setLang, medicalMode, setMedicalMode, calcCombo, setCalcCombo, 
  weeklyTraffic, setWeeklyTraffic, formPharmacy, setFormPharmacy, 
  formContact, setFormContact, formPhone, setFormPhone, formProvince, 
  setFormProvince, formCombo, setFormCombo, formReward, setFormReward, 
  formSubmitted, isSubmitting, handleLeadFormSubmit, clearForm, 
  videoPlaying, setVideoPlaying, videoTime, setVideoTime, videoMuted, 
  setVideoMuted, videoSpeed, setVideoSpeed, triggerAnalyticsEvent, 
  scrollSection, expandedFaq, setExpandedFaq
}: CampaignLandingProps) {
  
  const t = DICTIONARY[lang];
  const [showVideoPlayer, setShowVideoPlayer] = React.useState(false);
  const [displayTab, setDisplayTab] = React.useState('product');
  const [selectedHotspot, setSelectedHotspot] = React.useState(null);
  const [isPosmZoomed, setIsPosmZoomed] = React.useState(false);
  const [honeypot, setHoneypot] = React.useState('');
  const [consent, setConsent] = React.useState(false);
  
  const activeMedicalMode = ENABLE_MEDICAL_CLAIMS ? medicalMode : false;

  React.useEffect(() => {
    triggerAnalyticsEvent('view_promotion', {
      promotion_id: 'DISPLAY_CHAMPION_2026',
      promotion_name: 'Chương trình trưng bày quầy thuốc NNC',
      creative_name: 'timeline_rewards',
      creative_slot: 'display_program_section',
      universal: {
        campaign_id: "VG5_KMK_LAO_2026",
        page_variant: activeMedicalMode ? "claim_gated" : "zero_claim",
        language: lang
      }
    });
  }, []);

  // Wholesaler Profit Calculator formulas
  const getCalcResults = () => {
    const weeklyCustomers = weeklyTraffic;
    // Estimated conversion rate: 4.5% of weekly store traffic buys the duo combo
    const weeklyBuyers = Math.round(weeklyCustomers * 0.045);
    const monthlyBuyers = weeklyBuyers * 4;
    
    // Average B2B retail markup profit per bundle sold
    const profitPerBundle = 24000; // in LAK
    const rawRetailProfit = monthlyBuyers * profitPerBundle;
    
    // Monthly display reward
    const monthlyDisplayReward = calcCombo === 'COMBO_3M' ? 150000 : calcCombo === 'COMBO_1M' ? 50000 : 0;
    const totalMonthlyProfit = rawRetailProfit + monthlyDisplayReward;
    
    const wholesaleCost = calcCombo === 'COMBO_3M' ? 3000000 : calcCombo === 'COMBO_1M' ? 1000000 : 500000;
    const roi = Math.round((totalMonthlyProfit / wholesaleCost) * 100);
    
    return {
      monthlyBuyers,
      rawRetailProfit,
      monthlyDisplayReward,
      totalMonthlyProfit,
      roi,
      wholesaleCost
    };
  };

  const calcResults = getCalcResults();

  // Video scenes for visual mockup player
  const videoScenes = [
    {
      id: 1,
      start: 0,
      end: 5,
      title: {
        vi: "1. ĐỒNG HÀNH PHÁT TRIỂN DOANH SỐ",
        lo: "1. ຮ່ວມທຸລະກິດເພີ່ມຍອດຂາຍ",
        en: "1. PARTNERSHIP TO GROW REVENUE"
      },
      subtitle: {
        vi: "NNC Pharma tự hào là đối tác phân phối chính hãng bộ đôi sản phẩm VG-5 & sủi giải rượu sảng khoái ແກ້ເມົາຄ້າງ tại Lào.",
        lo: "NNC Pharma ພູມໃຈເປັນຜູ້ຈັດຈຳໜ່າຍຊຸດຜະລິດຕະພັນ VG-5 & ແກ້ເມົາຄ້າງ ຢ່າງເປັນທາງການໃນລາວ.",
        en: "NNC Pharma is proud to be the official distributor of the VG-5 & ແກ້ເມົາຄ້າງ health recovery duo in Laos."
      }
    },
    {
      id: 2,
      start: 5,
      end: 10,
      title: {
        vi: "2. KHẮC PHỤC ĐIỂM YẾU BÁN LỆ",
        lo: "2. ແກ້ໄຂຈຸດອ່ອນການຂາຍຍ່ອຍ",
        en: "2. OVERCOMING RETAIL DISPLAY PAIN POINTS"
      },
      subtitle: {
        vi: "Lọ thuốc VG-5 dẹt khó đứng vững độc lập? Kệ POSM cứng cáp giữ chặt hộp VG-5 và trưng bày bắt mắt sủi giải rượu.",
        lo: "ກ່ອງຢາ VG-5 ແປບໍ່ສາມາດຕັ້ງຊື່ໄດ້ງ່າຍ? ຊັ້ນວາງ POSM ແຂງແຮງ ບັນຈຸ ແລະ ສະແດງສິນຄ້າໄດ້ຢ່າງເປັນລະບຽບ.",
        en: "Flat boxes are hard to display. Our structural joint POSM shelf holds VG-5 packets upright while presenting seltzers."
      }
    },
    {
      id: 3,
      start: 10,
      end: 15,
      title: {
        vi: "3. TĂNG THU NHẬP THỤ ĐỘNG QUẦY THUỐC",
        lo: "3. ເພີ່ມລາຍໄດ້ແບບ passive ໃນຮ້ານຢາ",
        en: "3. INCREASING IMPULSE COUNTER INCOME"
      },
      subtitle: {
        vi: "Tặng kèm chi phí duy trì kệ 50,000 LAK tiền mặt hằng tháng hoặc sản phẩm thưởng cho điểm bán duy trì liên tục trong 3 tháng.",
        lo: "ຮັບໂບນັດຮັກສາຊັ້ນວາງສະແດງ 50,000 LAK/ເດືອນ ຫຼື ຜະລິດຕະພັນຟຣີ ເມື່ອຮັກສາຊັ້ນວາງເປັນເວລາ 3 ເດືອນ.",
        en: "Receive a recurring retainer reward of 50,000 LAK cash or product refills for keeping the stand on your counter."
      }
    },
    {
      id: 4,
      start: 15,
      end: 20,
      title: {
        vi: "4. CHẤT LƯỢNG TIÊU CHUẨN QUỐC TẾ",
        lo: "4. ມາດຕະຖານຄຸນນະພາບສາກົນ",
        en: "4. GMP-WHO CERTIFIED QUALITY STANDARDS"
      },
      subtitle: {
        vi: "VG-5 và ແກ́ເມົາຄ້າງ được sản xuất tại các nhà máy đạt chuẩn GMP-WHO và ISO danh tiếng, đảm bảo đầy đủ CO/CQ.",
        lo: "VG-5 ແລະ ແກ້ເມົາຄ້າງ ຖືກຜະລິດໃນໂຮງງານທີ່ໄດ້ມາດຕະຖານ GMP-WHO ແລະ ISO, ຮັບປະກັນ CO/CQ ຄົບຖ້ວນ.",
        en: "VG-5 & ແກ້ເມົາຄ້າງ are produced in certified GMP-WHO and ISO pharmaceutical facilities with verified compliance."
      }
    },
    {
      id: 5,
      start: 20,
      end: 25,
      title: {
        vi: "5. ĐĂNG KÝ NHANH - BÀN GIAO 24H",
        lo: "5. ລົງທະບຽນໄວ - ສົ່ງມອບໃນ 24 ຊົ່ວໂມງ",
        en: "5. SIMPLE SIGN-UP - DELIVERED IN 24H"
      },
      subtitle: {
        vi: "Gửi thông tin nhà thuốc của bạn trong form đăng ký bên dưới. Trình dược viên sẽ giao hàng và lắp đặt kệ miễn phí.",
        lo: "ສົ່ງຂໍ້ມູນຮ້ານຂາຍຢາຂອງທ່ານໃນຟອມລົງທະບຽນລຸ່ມນີ້. ທີມງານ Trình Dược Viên ຈະຈັດສົ່ງ ແລະ ຕິດຕັ້ງໃຫ້ຟຣີ.",
        en: "Submit your pharmacy details using the form below. Our local representative will deliver and install your stand."
      }
    }
  ];

  const currentScene = videoScenes.find(s => videoTime >= s.start && videoTime < s.end) || videoScenes[0];

  return (
    <div className={lang === 'lo' ? 'lang-lo' : 'lang-vi'}>
      {/* Navigation Header for Public Campaign (Completely clean of admin login buttons) */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-sm transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          
          {/* Corporate Brand Identity */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollSection('hero-section')}>
            <SafeImage src="/assets/nnc_logo.png" placeholderLabel="NNC Pharma" className="w-full h-full object-contain" />
            <div>
              <h1 className="text-base sm:text-lg font-black font-display leading-none text-emerald-800 flex items-center gap-1.5">
                {t.brandName}
              </h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">{t.brandSlogan}</p>
            </div>
          </div>

          {/* Navigation Items (Targeting sections instead of academic research) */}
          <nav className="hidden lg:flex items-center gap-1 p-1 bg-slate-100 rounded-2xl text-xs font-bold border border-slate-200">
            <button
              onClick={() => scrollSection('hero-section')}
              className="px-3 py-1.5 text-slate-600 hover:text-slate-900 transition cursor-pointer"
            >
              {t.navHome}
            </button>
            <button
              onClick={() => scrollSection('product-details-section')}
              className="px-3 py-1.5 text-slate-600 hover:text-slate-900 transition cursor-pointer"
            >
              {t.navProducts}
            </button>
            <button
              onClick={() => scrollSection('promo-video-section')}
              className="px-3 py-1.5 text-slate-600 hover:text-slate-900 transition cursor-pointer"
            >
              {t.navVideo}
            </button>
            <button
              onClick={() => scrollSection('roi-calculator-section')}
              className="px-3 py-1.5 text-slate-600 hover:text-slate-900 transition cursor-pointer"
            >
              {t.navCalculator}
            </button>
            <button
              onClick={() => scrollSection('testimonials-section')}
              className="px-3 py-1.5 text-slate-600 hover:text-slate-900 transition cursor-pointer"
            >
              {t.navTestimonials}
            </button>
            <button
              onClick={() => scrollSection('faq-section')}
              className="px-3 py-1.5 text-slate-600 hover:text-slate-900 transition cursor-pointer"
            >
              {t.navFaq}
            </button>
          </nav>

          {/* Multilingual Selector & Direct Register Action */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 border border-slate-200 rounded-xl">
              <button
                onClick={() => { setLang('lo'); triggerAnalyticsEvent('change_language', { target: 'lo' }); }}
                className={`px-2 py-1 text-[11px] font-extrabold rounded-lg transition cursor-pointer ${
                  lang === 'lo' ? 'bg-brand-green text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="ພາສາລາວ"
              >
                🇱🇦 LO
              </button>
              <button
                onClick={() => { setLang('vi'); triggerAnalyticsEvent('change_language', { target: 'vi' }); }}
                className={`px-2 py-1 text-[11px] font-extrabold rounded-lg transition cursor-pointer ${
                  lang === 'vi' ? 'bg-brand-green text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Tiếng Việt"
              >
                🇻🇳 VI
              </button>
              <button
                onClick={() => { setLang('en'); triggerAnalyticsEvent('change_language', { target: 'en' }); }}
                className={`px-2 py-1 text-[11px] font-extrabold rounded-lg transition cursor-pointer ${
                  lang === 'en' ? 'bg-brand-green text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="English"
              >
                🇬🇧 EN
              </button>
            </div>

            <button
              onClick={() => scrollSection('lead-form-section')}
              className="hidden sm:flex items-center gap-1 px-4 py-2 bg-brand-green hover:bg-brand-green-hover text-white text-xs font-black rounded-xl transition shadow-xs cursor-pointer"
            >
              <FileSignature className="w-3.5 h-3.5" />
              <span>{lang === 'vi' ? 'Hợp tác ngay' : lang === 'lo' ? 'ຮ່ວມມືຕອນນີ້' : 'Partner Now'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Campaign Landing Page Frame */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-16">
        
        {/* HERO SECTION WITH VIDEO */}
        <section id="hero-section" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border border-slate-200 rounded-[32px] p-6 lg:p-10 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none select-none">
            <div className="text-[180px] font-black leading-none font-display text-slate-500">NNC</div>
          </div>

          {/* Left Column: Direct CTA Marketing Messages */}
          <div className="lg:col-span-7 space-y-6 z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-brand-green-light text-brand-green border border-brand-green/15 glow-green">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              {t.heroBadge}
            </span>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-slate-900 leading-tight">
              {t.heroTitle} <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-emerald-600 glow-text">
                {t.heroTitleHighlight}
              </span>
            </h2>
            
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-xl font-medium">
              {t.heroDesc}
            </p>

            {/* Quick stats and CTA */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => scrollSection('lead-form-section')}
                className="px-6 py-3.5 bg-brand-green hover:bg-brand-green-hover text-white text-xs font-black rounded-2xl transition shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer pulse-yellow"
              >
                <FileSignature className="w-4 h-4" />
                <span>{t.heroCta}</span>
              </button>
              
              <button
                onClick={() => scrollSection('roi-calculator-section')}
                className="px-5 py-3.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-2xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <Calculator className="w-4 h-4 text-brand-green" />
                <span>{lang === 'vi' ? 'Tính lợi nhuận' : 'ຄິດໄລ່ກຳໄລ'}</span>
              </button>
            </div>

            {/* Social Trust Metrics */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 max-w-sm">
              <div className="space-y-1">
                <span className="text-xl sm:text-2xl font-black font-mono text-emerald-800">140+</span>
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">{t.heroStatsLeads}</span>
              </div>
              <div className="space-y-1">
                <span className="text-xl sm:text-2xl font-black font-mono text-emerald-800">120+</span>
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">{t.heroStatsPosm}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Embedded YouTube Video */}
          <div id="promo-video-section" className="lg:col-span-5 z-10">
            <div className="bg-slate-950 border-4 border-slate-800 rounded-[28px] overflow-hidden shadow-2xl relative aspect-[16/10]">
              <iframe
                className="w-full h-full border-none"
                src="https://www.youtube.com/embed/lBsfYZFfyAs"
                title="NNC Promo Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </section>

        {/* COHESIVE PRODUCT PORTFOLIO SECTION */}
        <section id="product-details-section" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-2xl lg:text-3xl font-black font-display text-slate-900">
                {t.productSectionTitle}
              </h3>
              <p className="text-slate-500 text-xs sm:text-sm">
                {t.productSectionSubtitle}
              </p>
            </div>

            {/* Regulatory Claim Gate Switcher */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-xl self-start sm:self-auto">
              <button
                onClick={() => { setMedicalMode(false); triggerAnalyticsEvent('toggle_claim_gate', { mode: 'commercial' }); }}
                className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition cursor-pointer ${
                  !medicalMode ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {lang === 'vi' ? 'Bản thương mại (Safe Copy)' : 'ຮູບແບບການຄ້າ'}
              </button>
              <button
                onClick={() => { setMedicalMode(true); triggerAnalyticsEvent('toggle_claim_gate', { mode: 'medical_gated' }); }}
                className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition cursor-pointer flex items-center gap-1 ${
                  medicalMode ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Activity className="w-3 h-3 text-brand-yellow" />
                <span>{lang === 'vi' ? 'Cơ chế giải độc (Medical)' : 'ກົນໄກວິທະຍາສາດ'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Card Product 1: VG-5 */}
            <div className="bg-white border border-slate-200 rounded-[32px] p-6 lg:p-8 flex flex-col justify-between space-y-6 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Activity className="w-24 h-24 text-brand-green" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 p-1">
                    <SafeImage src="/assets/vg5_detail.png" placeholderLabel="VG-5 (Danapha)" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 leading-tight">{t.vg5Name}</h4>
                    <p className="text-[10px] text-brand-green font-bold uppercase mt-1 tracking-wider">Danapha WHO-GMP</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 font-medium">
                  <p className="font-bold text-slate-800">{t.vg5Specs}</p>
                  <p>{t.vg5Mfg}</p>
                  <p>{t.vg5Dist}</p>
                </div>

                {/* Conditional copywriting fields */}
                <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl leading-relaxed text-xs">
                  {medicalMode ? (
                    <div className="space-y-2 text-slate-700">
                      <p className="font-extrabold text-emerald-850">🛡️ {lang === 'vi' ? 'Tác dụng hạ men gan & bảo vệ tế bào gan:' : 'ປ້ອງກັນຈຸລັງຕັບ ແລະ ຫຼຸດເອນໄຊມ໌ຕັບ:'}</p>
                      <p className="font-medium">{t.vg5MedClaim}</p>
                    </div>
                  ) : (
                    <div className="space-y-2 text-slate-600 font-medium">
                      <p className="font-bold text-slate-800">📋 {lang === 'vi' ? 'Thông tin sản phẩm chính thức:' : 'ຂໍ້ມູນບັນຈຸພັນ:'}</p>
                      <p>{t.vg5SafeClaim}</p>
                    </div>
                  )}
                </div>

                {/* Render scientific ingredients if medical mode is toggled */}
                {medicalMode && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{lang === 'vi' ? 'Thành phần thảo dược chính:' : 'ສ່ວນປະກອບສະໝູນໄພ:'}</h5>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-700">
                      <div className="flex justify-between p-1.5 bg-slate-50 rounded-lg">
                        <span>Diệp hạ châu đắng</span>
                        <span>100mg</span>
                      </div>
                      <div className="flex justify-between p-1.5 bg-slate-50 rounded-lg">
                        <span>Cỏ nhọ nồi</span>
                        <span>130mg</span>
                      </div>
                      <div className="flex justify-between p-1.5 bg-slate-50 rounded-lg">
                        <span>Cỏ mần trầu</span>
                        <span>50mg</span>
                      </div>
                      <div className="flex justify-between p-1.5 bg-slate-50 rounded-lg">
                        <span>Râu ngô (Râu bắp)</span>
                        <span>50mg</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={() => scrollSection('lead-form-section')}
                className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-black rounded-xl border border-slate-200 transition text-center cursor-pointer"
              >
                {lang === 'vi' ? 'Xem giá combo nhập sỉ' : 'ເບິ່ງລາຄາ combo ພິເສດ'}
              </button>
            </div>

            {/* Card Product 2: ແກ້ເມົາຄ້າງ */}
            <div className="bg-white border border-slate-200 rounded-[32px] p-6 lg:p-8 flex flex-col justify-between space-y-6 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Coins className="w-24 h-24 text-brand-green" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 p-1">
                    <SafeImage src="/assets/kmk_lifestyle.png" placeholderLabel="Ker Mao Khang" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 leading-tight">{t.kmkName}</h4>
                    <p className="text-[10px] text-brand-green font-bold uppercase mt-1 tracking-wider">Hadiphar ISO Standard</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 font-medium">
                  <p className="font-bold text-slate-800">{t.kmkSpecs}</p>
                  <p>{t.kmkMfg}</p>
                  <p>{t.kmkDist}</p>
                </div>

                {/* Conditional copywriting fields */}
                <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl leading-relaxed text-xs">
                  {medicalMode ? (
                    <div className="space-y-2 text-slate-700">
                      <p className="font-extrabold text-emerald-850">⚡ {lang === 'vi' ? 'Tác động kép giải độc cồn & bảo vệ gan:' : 'ກົນໄກແກ້ເມົາຄ້າງ ແລະ ປົກປ້ອງຕັບ:'}</p>
                      <p className="font-medium">{t.kmkMedClaim}</p>
                    </div>
                  ) : (
                    <div className="space-y-2 text-slate-600 font-medium">
                      <p className="font-bold text-slate-800">📋 {lang === 'vi' ? 'Thông tin sản phẩm chính thức:' : 'ຂໍ້ມູນບັນຈຸພັນ:'}</p>
                      <p>{t.kmkSafeClaim}</p>
                    </div>
                  )}
                </div>

                {/* Render active ingredients list in medical mode */}
                {medicalMode && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{t.medSpecsTitle}</h5>
                    <div className="space-y-1.5 text-[10px] font-bold text-slate-700">
                      <div className="p-1.5 bg-slate-50 rounded-lg flex items-start gap-2">
                        <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[8px] font-black">Krebs</span>
                        <span>{t.medSpecsSuccinic}</span>
                      </div>
                      <div className="p-1.5 bg-slate-50 rounded-lg flex items-start gap-2">
                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-[8px] font-black">Acid</span>
                        <span>{t.medSpecsFumaric}</span>
                      </div>
                      <div className="p-1.5 bg-slate-50 rounded-lg flex items-start gap-2">
                        <span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded text-[8px] font-black">Amino</span>
                        <span>{t.medSpecsMethionine}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={() => scrollSection('lead-form-section')}
                className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-black rounded-xl border border-slate-200 transition text-center cursor-pointer"
              >
                {lang === 'vi' ? 'Xem giá combo nhập sỉ' : 'ເບິ່ງລາຄາ combo ພິເສດ'}
              </button>
            </div>

          </div>
        </section>

        {/* DISPLAY INCENTIVE PROGRAM DETAILS */}
        <section id="display-program-section" className="space-y-8 bg-white border border-slate-200 rounded-[32px] p-6 lg:p-10 shadow-xs">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="px-2.5 py-1 rounded-full text-[9px] font-black bg-brand-green-light text-brand-green uppercase tracking-widest border border-brand-green/10">
              {lang === 'vi' ? 'Chương trình Trưng bày' : 'ໂຄງການວາງສະແດງ'}
            </span>
            <h3 className="text-2xl lg:text-3xl font-black font-display text-slate-900">
              {lang === 'vi' ? 'Nhận Thưởng Duy Trì Trưng Bày 3 Tháng' : 'ຮັບໂບນັດຮັກສາຊັ້ນວາງ 3 ເດືອນ'}
            </h3>
            <p className="text-slate-500 text-sm font-medium">
              {lang === 'vi' ? 'Tham gia trưng bày bộ đôi sản phẩm tại quầy để nhận thưởng tối đa' : 'ຮ່ວມມືວາງສະແດງສິນຄ້າໜ້າ quầy ເພື່ອຮັບຜົນປະໂຫຍດສູງສຸດ'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Interactive Switcher & Details */}
            <div className="lg:col-span-7 space-y-6">
              {/* Interactive Tabs Slider */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-2xl w-full sm:w-max">
                <button
                  type="button"
                  onClick={() => {
                    setDisplayTab('product');
                    triggerAnalyticsEvent('select_reward_option', { reward_option: 'product', selected_package: formCombo });
                  }}
                  className={`flex-1 sm:flex-none px-4 py-2 text-xs font-black rounded-xl transition cursor-pointer ${
                    displayTab === 'product' ? 'bg-brand-green text-white shadow-md' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  🎁 {lang === 'vi' ? 'Thưởng bằng sản phẩm' : 'ຮັບຂອງແຖມເປັນສິນຄ້າ'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDisplayTab('cash');
                    triggerAnalyticsEvent('select_reward_option', { reward_option: 'cash', selected_package: formCombo });
                  }}
                  className={`flex-1 sm:flex-none px-4 py-2 text-xs font-black rounded-xl transition cursor-pointer ${
                    displayTab === 'cash' ? 'bg-brand-green text-white shadow-md' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  💵 {lang === 'vi' ? 'Thưởng bằng tiền mặt' : 'ຮັບຂອງແຖມເປັນເງິນສົດ'}
                </button>
              </div>

              {/* Reward Content display */}
              <div className="p-5 bg-slate-50 border border-slate-200/50 rounded-2xl space-y-4">
                {displayTab === 'product' ? (
                  <div className="space-y-2">
                    <h4 className="text-sm font-black text-slate-800">{lang === 'vi' ? 'Quyền lợi thưởng sản phẩm (Khuyên dùng):' : 'ສິດthິປະໂຫຍດຂອງແຖມເປັນສິນຄ້າ:'}</h4>
                    <ul className="space-y-2 text-xs font-semibold text-slate-600">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                        <span>{lang === 'vi' ? 'Nhận ngay 02 ống sủi giải rượu ແກ້ເມົາຄ້າງ mỗi tháng hợp lệ.' : 'ຮັບ 02 ຫຼອດແກ້ເມົາຄ້າງໃນແຕ່ລະເດືອນ.'}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                        <span>{lang === 'vi' ? 'Tặng thêm 01 hộp thuốc bổ gan VG-5 sau khi hoàn thành chu kỳ 3 tháng.' : 'ແຖມເພີ່ມ 01 ກ່ອງ VG-5 ຫຼັງຈາກວາງສະແດງຄົບ 3 ເດືອນ.'}</span>
                      </li>
                      <li className="flex items-start gap-2 text-brand-green font-bold">
                        <Gift className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                        <span>{lang === 'vi' ? 'Tổng trị giá quy đổi quà tặng đạt tới 242,000 LAK!' : 'ມູນຄ່າຂອງແຖມລວມສູງເຖິງ 242,000 LAK!'}</span>
                      </li>
                    </ul>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <h4 className="text-sm font-black text-slate-800">{lang === 'vi' ? 'Quyền lợi thưởng tiền mặt:' : 'ສິດທິປະໂຫຍດໂບນັດເງinສົດ:'}</h4>
                    <ul className="space-y-2 text-xs font-semibold text-slate-600">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                        <span>{lang === 'vi' ? 'Nhận trực tiếp 50,000 LAK chuyển khoản ngân hàng mỗi tháng hợp lệ.' : 'ຮັບເງິນສົດ 50,000 LAK ໂອນຜ່ານທະນາຄານໃນແຕ່ລະເດືອນ.'}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                        <span>{lang === 'vi' ? 'Số tiền được đối chiếu thanh toán trước ngày 10 của tháng kế tiếp.' : 'ໂອນເງິນກ່ອນວັນທີ 10 ຂອງເດືອນຖັດໄປ.'}</span>
                      </li>
                      <li className="flex items-start gap-2 text-brand-green font-bold">
                        <Coins className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                        <span>{lang === 'vi' ? 'Tổng tiền thưởng nhận được sau 3 tháng là 150,000 LAK!' : 'ຍອດເງິນສົດທັງໝົດຫຼັງຈາກຄົບ 3 ເດືອນແມ່ນ 150,000 LAK!'}</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* 3-Month Horizontal Timeline */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  {lang === 'vi' ? 'Hành trình trưng bày 3 tháng:' : 'ຂັ້ນຕອນການຮ່ວມມືວາງສະແດງ 3 ເດືອນ:'}
                </h4>
                
                {/* Horizontal steps container */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1 relative">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-black text-[10px] flex items-center justify-center mx-auto">1</span>
                    <span className="text-[10px] font-black text-slate-800 block">{lang === 'vi' ? 'Nhận Kệ & POSM' : 'ຮັບຊັ້ນວາງ POSM'}</span>
                    <span className="text-[9px] text-slate-400 block font-medium">{lang === 'vi' ? 'Đặt kệ tại quầy' : 'ວາງສະແດງໜ້າ quầy'}</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1 relative">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-black text-[10px] flex items-center justify-center mx-auto">2</span>
                    <span className="text-[10px] font-black text-slate-800 block">{lang === 'vi' ? 'Trưng bày bộ đôi' : 'ວາງສະແດງສິນຄ້າ'}</span>
                    <span className="text-[9px] text-slate-400 block font-medium">{lang === 'vi' ? 'Luôn lấp đầy hàng' : 'ຈັດວາງສິນຄ້າໃຫ້ຄົບ'}</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1 relative">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-black text-[10px] flex items-center justify-center mx-auto">3</span>
                    <span className="text-[10px] font-black text-slate-800 block">{lang === 'vi' ? 'Báo cáo ảnh' : 'ຖ່າຍຮູບລາຍງານ'}</span>
                    <span className="text-[9px] text-slate-400 block font-medium">{lang === 'vi' ? 'Trước 25 hằng tháng' : 'ກ່ອນວັນທີ 25 ທຸກເດືອນ'}</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1 relative">
                    <span className="w-5 h-5 rounded-full bg-brand-green text-white font-black text-[10px] flex items-center justify-center mx-auto">4</span>
                    <span className="text-[10px] font-black text-brand-green block">{lang === 'vi' ? 'Nhận thưởng' : 'ຮັບຜົນປະໂຫຍດ'}</span>
                    <span className="text-[9px] text-brand-green block font-black">{lang === 'vi' ? 'Phê duyệt cực nhanh' : 'ອະນຸມັດໄວ'}</span>
                  </div>
                </div>
              </div>

              {/* View terms details CTA */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    triggerAnalyticsEvent('view_display_terms', { terms_version: 'v1.0' });
                    alert(lang === 'vi' ? 'Điều khoản chi tiết: \n1. Nhà thuốc cam kết duy trì kệ POSM NNC tại quầy thanh toán trong 3 tháng. \n2. Số lượng sản phẩm trưng bày tối thiểu đạt 80% sức chứa của kệ. \n3. Gửi ảnh chụp báo cáo qua trình dược viên hoặc hệ thống trước ngày 25 hằng tháng.' : 'ເງື່ອນໄຂລະອຽດ: ວາງສະແດງຊັ້ນວາງ POSMໜ້າ quầy ຮັບເງິນເປັນເວລາ 3 ເດືອນ, ສິນຄ້າວາງສະແດງຫຼາຍກວ່າ 80% ແລະ ສົ່ງຮູບກ່ອນວັນທີ 25 ຂອງທຸກເດືອນ.');
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-black text-slate-500 hover:text-slate-800 transition cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{lang === 'vi' ? 'Xem chi tiết điều khoản & chính sách trưng bày' : 'ເບິ່ງເງື່ອນໄຂການວາງສະແດງລະອຽດ'}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Visual image card */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <div className="bg-[#FAFDFB] border border-slate-200 rounded-[28px] p-6 shadow-xs w-full max-w-sm">
                <div className="aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-inner">
                  <SafeImage
                    src="/assets/combo.png"
                    placeholderLabel="NNC Product Combo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-center mt-4">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">NNC Product Packaging</span>
                  <span className="text-xs font-black text-slate-700 block mt-1">{lang === 'vi' ? 'Tiêu chuẩn lâm sàng & Đồng bộ' : 'ມາດຕະຖານຄລີນິກ ແລະ ພ້ອມເພີງ'}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COMBO PACKAGES & DISPLAY INCENTIVES PROGRAM */}
        <section id="combos-section" className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h3 className="text-2xl lg:text-3xl font-black font-display text-slate-900">
              {t.comboTitle}
            </h3>
            <p className="text-slate-500 text-sm">
              {t.comboSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            
            {/* Gói cơ bản */}
            <div className="bg-white border border-slate-200 rounded-[32px] p-6 lg:p-8 flex flex-col justify-between space-y-6 shadow-xs relative">
              <div className="space-y-4">
                <div>
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-wider">
                    {lang === 'vi' ? 'Gói Cơ Bản' : 'ແພັກເກັດເລີ່ມຕົ້ນ'}
                  </span>
                  <h4 className="text-xl font-black text-slate-900 mt-2">{t.comboBasic}</h4>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed font-medium">{t.comboBasicDesc}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl space-y-3 text-xs border border-slate-200/50">
                  <div className="flex justify-between items-center text-slate-700 font-bold">
                    <span>{lang === 'vi' ? 'Ngưỡng hóa đơn tối thiểu:' : 'ຍອດຊື້ຂັ້ນຕ່ຳ:'}</span>
                    <span className="font-extrabold text-emerald-850">500,000 LAK</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 font-medium">
                    <span>{lang === 'vi' ? 'Cơ cấu combo gợi ý:' : 'ໂຄງສ້າງແນະນຳ:'}</span>
                    <span className="font-black text-slate-800">2 × VG-5 + 10 × ແກ້ເມົາຄ້າງ</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 font-medium">
                    <span>{lang === 'vi' ? 'Tổng tiền combo thực tế:' : 'ຍອດຈ່າຍຕົວຈິງ:'}</span>
                    <span className="font-black text-slate-800">502,000 LAK</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lang === 'vi' ? 'Quà tặng & POSM bàn giao lập tức:' : 'ຂອງແຖມ & ຊັ້ນວາງ POSM ຕິດຕັ້ງທັນທີ:'}</h5>
                  <ul className="space-y-1.5 text-xs text-slate-700 font-bold">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-brand-green shrink-0" />
                      <span>{lang === 'vi' ? '02 ống sủi giải rượu ແກ້ເມົາຄ້າງ (Trị giá 64,000 LAK)' : '02 ຫຼອດແກ້ເມົາຄ້າງ (ມູນຄ່າ 64,000 LAK)'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-brand-green shrink-0" />
                      <span>{lang === 'vi' ? '01 Kệ trưng bày quầy thuốc NNC cao cấp' : '01 ຊັ້ນວາງສະແດງ quầy NNC'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-brand-green shrink-0" />
                      <span>{lang === 'vi' ? '01 Poster dán quầy A3 đồng bộ' : '01 ແຜ່ນພັບ Poster A3'}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => {
                  setFormCombo('COMBO_500K');
                  setFormReward('NONE');
                  scrollSection('lead-form-section');
                  triggerAnalyticsEvent('select_promotion', { promotion_id: 'COMBO_500K', promotion_name: 'Gói Cơ Bản 500K LAK', creative_name: 'Combo Starter', creative_slot: 'packages_grid_left', items: [{ item_name: 'VG-5', quantity: 2 }, { item_name: 'Ker Mao Khang', quantity: 10 }] });
                }}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-2xl transition text-center cursor-pointer shadow-md"
              >
                {lang === 'vi' ? 'Chọn gói cơ bản' : 'ເລືອກແພັກເກັດເລີ່ມຕົ້ນ'}
              </button>
            </div>

            {/* Gói nâng cao */}
            <div className="bg-white border-2 border-brand-green rounded-[32px] p-6 lg:p-8 flex flex-col justify-between space-y-6 shadow-md relative">
              <div className="absolute -top-3.5 left-6 px-3 py-1 bg-brand-yellow text-slate-950 text-[9px] font-black uppercase rounded-lg tracking-wider border border-brand-yellow-dark shadow-xs">
                {lang === 'vi' ? 'Khuyên Dùng Cho Điểm Bán' : 'ແນະນຳສຳລັບຮ້ານຢາ'}
              </div>

              <div className="space-y-4">
                <div>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-brand-green text-[9px] font-black uppercase tracking-wider">
                    {lang === 'vi' ? 'Gói Nâng Cao' : 'ແພັກເກັດແນະນຳ'}
                  </span>
                  <h4 className="text-xl font-black text-slate-900 mt-2">{t.comboPremium}</h4>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed font-medium">{t.comboPremiumDesc}</p>
                </div>

                <div className="p-4 bg-emerald-50/50 rounded-2xl space-y-3 text-xs border border-brand-green/10">
                  <div className="flex justify-between items-center text-slate-700 font-bold">
                    <span>{lang === 'vi' ? 'Ngưỡng hóa đơn tối thiểu:' : 'ຍອດຊື້ຂັ້ນຕ່ຳ:'}</span>
                    <span className="font-extrabold text-emerald-850">1,000,000 LAK</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 font-medium">
                    <span>{lang === 'vi' ? 'Cơ cấu combo gợi ý:' : 'ໂຄງສ້າງແນະນຳ:'}</span>
                    <span className="font-black text-slate-800">5 × VG-5 + 18 × ແກ້ເມົາ¢້າງ</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 font-medium">
                    <span>{lang === 'vi' ? 'Tổng tiền combo thực tế:' : 'ຍອດຈ່າຍຕົວຈິງ:'}</span>
                    <span className="font-black text-slate-800">1,024,000 LAK</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lang === 'vi' ? 'Lựa chọn quà tặng hấp dẫn:' : 'ທາງເລືອກຂອງແຖມພິເສດ:'}</h5>
                  <div className="p-3 bg-white border border-slate-100 rounded-xl space-y-2">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{lang === 'vi' ? 'Chọn 1 trong 2 quyền lợi bên dưới:' : 'ເລືອກ 1 ໃນ 2 ທາງເລືອກລຸ່ມນີ້:'}</p>
                    <div className="space-y-1.5 text-xs text-slate-700 font-bold">
                      <p className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-brand-green shrink-0" />
                        <span>{lang === 'vi' ? 'Quyền lợi A: Tặng thêm 05 ống sủi giải rượu' : 'ທາງເລືອກ A: ແຖມເພີ່ມ 05 ຫຼອດແກ້ເມົາຄ້າງ'}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-brand-green shrink-0" />
                        <span>{lang === 'vi' ? 'Quyền lợi B: Tặng thêm 02 hộp thuốc bổ gan VG-5' : 'ທາງເລືອກ B: ແຖມເພີ່ມ 02 ກ່ອງ VG-5'}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.comboRewardTitle}</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-bold text-slate-700">
                      <div className="p-2.5 bg-slate-50 border border-slate-200/50 rounded-xl flex items-start gap-1.5">
                        <Coins className="w-4 h-4 text-brand-green shrink-0" />
                        <span>{t.comboRewardCash}</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 border border-slate-200/50 rounded-xl flex items-start gap-1.5">
                        <Gift className="w-4 h-4 text-brand-green shrink-0" />
                        <span>{t.comboRewardProduct}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setFormCombo('COMBO_1M');
                  setFormReward('IN_KIND');
                  scrollSection('lead-form-section');
                  triggerAnalyticsEvent('select_promotion', { promotion_id: 'COMBO_1M', promotion_name: 'Gói Nâng Cao 1M LAK', creative_name: 'Combo Recommended', creative_slot: 'packages_grid_right', items: [{ item_name: 'VG-5', quantity: 5 }, { item_name: 'Ker Mao Khang', quantity: 18 }] });
                }}
                className="w-full py-3.5 bg-brand-green hover:bg-brand-green-hover text-white text-xs font-black rounded-2xl transition text-center cursor-pointer shadow-md"
              >
                {t.comboPremium}
              </button>
            </div>

          </div>
        </section>

        {/* DISPLAY INCENTIVE PROGRAM DETAILS */}
        <section id="display-program-section" className="space-y-8 bg-white border border-slate-200 rounded-[32px] p-6 lg:p-10 shadow-xs">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="px-2.5 py-1 rounded-full text-[9px] font-black bg-brand-green-light text-brand-green uppercase tracking-widest border border-brand-green/10">
              {lang === 'vi' ? 'Chương trình Trưng bày' : 'ໂຄງການວາງສະແດງ'}
            </span>
            <h3 className="text-2xl lg:text-3xl font-black font-display text-slate-900">
              {lang === 'vi' ? 'Nhận Thưởng Duy Trì Trưng Bày 3 Tháng' : 'ຮັບໂບນັດຮັກສາຊັ້ນວາງ 3 ເດືອນ'}
            </h3>
            <p className="text-slate-500 text-sm font-medium">
              {lang === 'vi' ? 'Tham gia trưng bày bộ đôi sản phẩm tại quầy để nhận thưởng tối đa' : 'ຮ່ວມມືວາງສະແດງສິນຄ້າໜ້າ quầy ເພື່ອຮັບຜົນປະໂຫຍດສູງສຸດ'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Interactive Switcher & Details */}
            <div className="lg:col-span-7 space-y-6">
              {/* Interactive Tabs Slider */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-2xl w-full sm:w-max">
                <button
                  type="button"
                  onClick={() => {
                    setDisplayTab('product');
                    triggerAnalyticsEvent('select_reward_option', { reward_option: 'product', selected_package: formCombo });
                  }}
                  className={`flex-1 sm:flex-none px-4 py-2 text-xs font-black rounded-xl transition cursor-pointer ${
                    displayTab === 'product' ? 'bg-brand-green text-white shadow-md' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  🎁 {lang === 'vi' ? 'Thưởng bằng sản phẩm' : 'ຮັບຂອງແຖມເປັນສິນຄ້າ'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDisplayTab('cash');
                    triggerAnalyticsEvent('select_reward_option', { reward_option: 'cash', selected_package: formCombo });
                  }}
                  className={`flex-1 sm:flex-none px-4 py-2 text-xs font-black rounded-xl transition cursor-pointer ${
                    displayTab === 'cash' ? 'bg-brand-green text-white shadow-md' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  💵 {lang === 'vi' ? 'Thưởng bằng tiền mặt' : 'ຮັບຂອງແຖມເປັນເງິນສົດ'}
                </button>
              </div>

              {/* Reward Content display */}
              <div className="p-5 bg-slate-50 border border-slate-200/50 rounded-2xl space-y-4">
                {displayTab === 'product' ? (
                  <div className="space-y-2">
                    <h4 className="text-sm font-black text-slate-800">{lang === 'vi' ? 'Quyền lợi thưởng sản phẩm (Khuyên dùng):' : 'ສິດthິປະໂຫຍດຂອງແຖມເປັນສິນຄ້າ:'}</h4>
                    <ul className="space-y-2 text-xs font-semibold text-slate-600">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                        <span>{lang === 'vi' ? 'Nhận ngay 02 ống sủi giải rượu ແກ້ເມົາຄ້າງ mỗi tháng hợp lệ.' : 'ຮັບ 02 ຫຼອດແກ້ເມົາຄ້າງໃນແຕ່ລະເດືອນ.'}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                        <span>{lang === 'vi' ? 'Tặng thêm 01 hộp thuốc bổ gan VG-5 sau khi hoàn thành chu kỳ 3 tháng.' : 'ແຖມເພີ່ມ 01 ກ່ອງ VG-5 ຫຼັງຈາກວາງສະແດງຄົບ 3 ເດືອນ.'}</span>
                      </li>
                      <li className="flex items-start gap-2 text-brand-green font-bold">
                        <Gift className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                        <span>{lang === 'vi' ? 'Tổng trị giá quy đổi quà tặng đạt tới 242,000 LAK!' : 'ມູນຄ່າຂອງແຖມລວມສູງເຖິງ 242,000 LAK!'}</span>
                      </li>
                    </ul>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <h4 className="text-sm font-black text-slate-800">{lang === 'vi' ? 'Quyền lợi thưởng tiền mặt:' : 'ສິດທິປະໂຫຍດໂບນັດເງinສົດ:'}</h4>
                    <ul className="space-y-2 text-xs font-semibold text-slate-600">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                        <span>{lang === 'vi' ? 'Nhận trực tiếp 50,000 LAK chuyển khoản ngân hàng mỗi tháng hợp lệ.' : 'ຮັບເງິນສົດ 50,000 LAK ໂອນຜ່ານທະນາຄານໃນແຕ່ລະເດືອນ.'}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                        <span>{lang === 'vi' ? 'Số tiền được đối chiếu thanh toán trước ngày 10 của tháng kế tiếp.' : 'ໂອນເງິນກ່ອນວັນທີ 10 ຂອງເດືອນຖັດໄປ.'}</span>
                      </li>
                      <li className="flex items-start gap-2 text-brand-green font-bold">
                        <Coins className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                        <span>{lang === 'vi' ? 'Tổng tiền thưởng nhận được sau 3 tháng là 150,000 LAK!' : 'ຍອດເງິນສົດທັງໝົດຫຼັງຈາກຄົບ 3 ເດືອນແມ່ນ 150,000 LAK!'}</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* 3-Month Horizontal Timeline */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  {lang === 'vi' ? 'Hành trình trưng bày 3 tháng:' : 'ຂັ້ນຕອນການຮ່ວມມືວາງສະແດງ 3 ເດືອນ:'}
                </h4>
                
                {/* Horizontal steps container */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1 relative">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-black text-[10px] flex items-center justify-center mx-auto">1</span>
                    <span className="text-[10px] font-black text-slate-800 block">{lang === 'vi' ? 'Nhận Kệ & POSM' : 'ຮັບຊັ້ນວາງ POSM'}</span>
                    <span className="text-[9px] text-slate-400 block font-medium">{lang === 'vi' ? 'Đặt kệ tại quầy' : 'ວາງສະແດງໜ້າ quầy'}</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1 relative">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-black text-[10px] flex items-center justify-center mx-auto">2</span>
                    <span className="text-[10px] font-black text-slate-800 block">{lang === 'vi' ? 'Trưng bày bộ đôi' : 'ວາງສະແດງສິນຄ້າ'}</span>
                    <span className="text-[9px] text-slate-400 block font-medium">{lang === 'vi' ? 'Luôn lấp đầy hàng' : 'ຈັດວາງສິນຄ້າໃຫ້ຄົບ'}</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1 relative">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-black text-[10px] flex items-center justify-center mx-auto">3</span>
                    <span className="text-[10px] font-black text-slate-800 block">{lang === 'vi' ? 'Báo cáo ảnh' : 'ຖ່າຍຮູບລາຍງານ'}</span>
                    <span className="text-[9px] text-slate-400 block font-medium">{lang === 'vi' ? 'Trước 25 hằng tháng' : 'ກ່ອນວັນທີ 25 ທຸກເດືອນ'}</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1 relative">
                    <span className="w-5 h-5 rounded-full bg-brand-green text-white font-black text-[10px] flex items-center justify-center mx-auto">4</span>
                    <span className="text-[10px] font-black text-brand-green block">{lang === 'vi' ? 'Nhận thưởng' : 'ຮັບຜົນປະໂຫຍດ'}</span>
                    <span className="text-[9px] text-brand-green block font-black">{lang === 'vi' ? 'Phê duyệt cực nhanh' : 'ອະນຸມັດໄວ'}</span>
                  </div>
                </div>
              </div>

              {/* View terms details CTA */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    triggerAnalyticsEvent('view_display_terms', { terms_version: 'v1.0' });
                    alert(lang === 'vi' ? 'Điều khoản chi tiết: \n1. Nhà thuốc cam kết duy trì kệ POSM NNC tại quầy thanh toán trong 3 tháng. \n2. Số lượng sản phẩm trưng bày tối thiểu đạt 80% sức chứa của kệ. \n3. Gửi ảnh chụp báo cáo qua trình dược viên hoặc hệ thống trước ngày 25 hằng tháng.' : 'ເງື່ອນໄຂລະອຽດ: ວາງສະແດງຊັ້ນວາງ POSMໜ້າ quầy ຮັບເງິນເປັນເວລາ 3 ເດືອນ, ສິນຄ້າວາງສະແດງຫຼາຍກວ່າ 80% ແລະ ສົ່ງຮູບກ່ອນວັນທີ 25 ຂອງທຸກເດືອນ.');
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-black text-slate-500 hover:text-slate-800 transition cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{lang === 'vi' ? 'Xem chi tiết điều khoản & chính sách trưng bày' : 'ເບິ່ງເງື່ອນໄຂການວາງສະແດງລະອຽດ'}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Visual image card */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <div className="bg-[#FAFDFB] border border-slate-200 rounded-[28px] p-6 shadow-xs w-full max-w-sm">
                <div className="aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-inner">
                  <SafeImage
                    src="/assets/combo.png"
                    placeholderLabel="NNC Product Combo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-center mt-4">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">NNC Product Packaging</span>
                  <span className="text-xs font-black text-slate-700 block mt-1">{lang === 'vi' ? 'Tiêu chuẩn lâm sàng & Đồng bộ' : 'ມາດຕະຖານຄລີນິກ ແລະ ພ້ອມເພີງ'}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        

        {/* COUNTERTOP POSM SHELF STRUCTURE DETAILS */}
        <section className="bg-white border border-slate-200 rounded-[32px] p-6 lg:p-10 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Left: 3D POSM shelf structure vector description */}
          <div className="md:col-span-5 flex items-center justify-center bg-slate-50 rounded-2xl border border-slate-100 p-4">
            <SafeImage src="/assets/MOCKUPOSM.png" placeholderLabel="POSM Display" className="w-full h-auto object-contain mx-auto" />
          </div>

          {/* Right: Copy description */}
          <div className="md:col-span-7 space-y-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-brand-green-light text-brand-green uppercase tracking-widest border border-brand-green/10">
              In-Store Branding (POSM)
            </span>
            
            <h3 className="text-2xl font-black text-slate-900 font-display">
              {lang === 'vi' ? 'Giải Pháp Trưng Bày Đột Phá Tại Quầy Thu Ngân' : 'ຊັ້ນວາງສະແດງນະວັດຕະກຳໃໝ່ໜ້າ quầy'}
            </h3>
            
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-medium">
              {lang === 'vi' ? 'Sản phẩm viên sủi giải rượu dạng ống tròn dẹt rất khó đứng độc lập trên tủ thuốc kính. Kệ POSM NNC được đúc khuôn cứng cáp với 10 hốc cắm ống sủi sành điệu, kết hợp khay đứng chắc chắn bảo vệ lọ thủy tinh VG-5. Tạo điểm nhấn nhận diện thương hiệu thu hút mọi ánh nhìn của khách hàng vãng lai ngay tại khu vực thanh toán.' :
               'ຊັ້ນວາງ POSM ຖືກອອກແບບມາເປັນພິເສດເພື່ອຮັກສາຫຼອດແກ້ເມົາຄ້າງ ແລະ ກ່ອງ VG-5 ໃຫ້ຕັ້ງຊື່ຢູ່ໜ້າ quầy, ຊ່ວຍດຶງດູດສາຍຕາຂອງລູກຄ້າໄດ້ຢ່າງມີປະສິດທິພາບ.'}
            </p>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-xs font-bold text-slate-700">
              <div className="space-y-1">
                <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Hốc cắm sủi giải rượu</span>
                <span>10 hốc cắm đứng</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Độ phủ quầy thuốc Lào</span>
                <span>Phủ quầy thuốc NNC</span>
              </div>
            </div>
          </div>

        </section>

        {/* HIGH-TRUST PHARMACY CUSTOMER TESTIMONIALS */}
        <section id="testimonials-section" className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-1">
            <h3 className="text-2xl lg:text-3xl font-black font-display text-slate-900">
              {lang === 'vi' ? 'Được Tin Dùng Bởi 140+ Nhà Thuốc' : 'ໄດ້ຮັບຄວາມໄວ້ວາງໃຈຈາກ 140+ ຮ້ານຢາ'}
            </h3>
            <p className="text-slate-500 text-sm">
              {lang === 'vi' ? 'Nhà thuốc tại Lào nói gì về kệ trưng bày POSM và phản hồi từ bệnh nhân' : 'ຄຳເຫັນຈິງຈາກຮ້ານຢາທີ່ໄດ້ເຂົ້າຮ່ວມໂຄງການ'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs relative">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />)}
              </div>
              <p className="text-slate-600 text-xs italic leading-relaxed font-medium">
                "{lang === 'vi' ? 'Kệ POSM của NNC rất đẹp và chắc chắn, đặt ngay tại quầy thu ngân. Khách hàng tới mua thuốc Tây hỏi nhiều về sủi giải rượu ແກ້ເມົາຄ້າງ vì thiết kế bắt mắt, doanh số bán lẻ tăng gấp đôi tháng trước.' :
                 'ຊັ້ນວາງ POSM ງາມຫຼາຍ, ຕັ້ງຢູ່ quầy ເກັບເງິນ ເຮັດໃຫ້ລູກຄ້າສົນໃຈຖາມຊື້ຫຼາຍ, ຍອດຂາຍເພີ່ມຂຶ້ນສອງເທົ່າ.'}"
              </p>
              <div className="border-t border-slate-100 pt-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-green-light text-brand-green flex items-center justify-center font-black text-[10px]">
                  VS
                </div>
                <div>
                  <span className="block text-xs font-black text-slate-800">Sengaloun Pharmacy</span>
                  <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Vientiane, Laos</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs relative">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />)}
              </div>
              <p className="text-slate-600 text-xs italic leading-relaxed font-medium">
                "{lang === 'vi' ? 'Trước đây viên sủi giải rượu dạng ống tròn dẹt rất khó xếp lên tủ kính, toàn bị rơi hoặc cất góc khuất. Kệ POSM này giải quyết đúng nỗi đau của tôi. Hơn nữa tiền thưởng trưng bày 50,000 LAK được trừ trực tiếp hóa đơn nhập hàng tháng tiếp theo rất minh bạch.' :
                 'ແຕ່ກ່ອນຫຼອດ sủi ຍາກທີ່ຈະວາງສະແດງ. ຊັ້ນວາງ POSM ນີ້ຊ່ວຍແກ້ໄຂບັນຫາໄດ້ດີ ແລະ ໂບນັດ 50,000 LAK ກໍ່ໄດ້ຮັບຈິງ.'}"
              </p>
              <div className="border-t border-slate-100 pt-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-green-light text-brand-green flex items-center justify-center font-black text-[10px]">
                  PK
                </div>
                <div>
                  <span className="block text-xs font-black text-slate-800">Pakse Central Drugstore</span>
                  <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Champasak, Laos</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs relative">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />)}
              </div>
              <p className="text-slate-600 text-xs italic leading-relaxed font-medium">
                "{lang === 'vi' ? 'Khách hàng của tôi rất tin tưởng VG-5 vì sản phẩm từ Danapha đạt tiêu chuẩn quốc tế GMP-WHO. Hộp thuốc dẹt được xếp đứng ngăn nắp bên cạnh ống sủi giải rượu trông chuyên nghiệp, Trình Dược Viên giao lắp quầy rất nhiệt tình.' :
                 'ລູກຄ້າໄວ້ວາງໃຈ VG-5 ຫຼາຍເພາະໄດ້ມາດຕະຖານ GMP-WHO. ວາງສະແດງຄູ່ກັນເບິ່ງເປັນມືອາຊີບຫຼາຍ.'}"
              </p>
              <div className="border-t border-slate-100 pt-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-green-light text-brand-green flex items-center justify-center font-black text-[10px]">
                  SV
                </div>
                <div>
                  <span className="block text-xs font-black text-slate-800">Savannakhet Depot</span>
                  <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Savannakhet, Laos</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* REGISTRATION B2B LEAD CAPTURE FORM */}
        <section id="lead-form-section" className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-md grid grid-cols-1 lg:grid-cols-12 items-stretch">
          
          {/* Left Column: Visual instructions */}
          <div className="lg:col-span-5 bg-slate-900 p-8 text-white flex flex-col justify-between space-y-8 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-slate-950 to-slate-900 opacity-90" />
            
            <div className="z-10 space-y-4">
              <span className="px-2.5 py-1 bg-brand-green/20 text-brand-green border border-brand-green/30 rounded-lg text-[9px] font-black uppercase tracking-wider">
                Partner Registration
              </span>
              <h4 className="text-xl sm:text-2xl font-black font-display text-white">{t.formTitle}</h4>
              <p className="text-slate-300 text-xs leading-relaxed font-medium">
                {t.formSubtitle}
              </p>
            </div>

            <div className="z-10 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/10 text-brand-yellow flex items-center justify-center font-black text-xs shrink-0 mt-0.5 border border-white/5">
                  1
                </div>
                <div>
                  <span className="font-extrabold block text-xs">Điền Form đăng ký</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5 leading-relaxed font-medium">Nhập tên nhà thuốc, số điện thoại liên hệ (ưu tiên WhatsApp).</span>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/10 text-brand-yellow flex items-center justify-center font-black text-xs shrink-0 mt-0.5 border border-white/5">
                  2
                </div>
                <div>
                  <span className="font-extrabold block text-xs">Xác nhận gói hàng & bàn giao quầy</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5 leading-relaxed font-medium">Trình dược viên NNC sẽ liên hệ giao hàng sỉ và kệ trưng bày miễn phí trong 24h.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/10 text-brand-yellow flex items-center justify-center font-black text-xs shrink-0 mt-0.5 border border-white/5">
                  3
                </div>
                <div>
                  <span className="font-extrabold block text-xs">Báo cáo hình ảnh & nhận thưởng</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5 leading-relaxed font-medium">Gửi ảnh chụp kệ qua WhatsApp trước ngày 25 hằng tháng để nhận tiền hoặc sản phẩm.</span>
                </div>
              </div>
            </div>

            <div className="z-10 text-[9px] text-slate-500 font-bold uppercase tracking-wider">
              NNC Pharma Co., Ltd. Laos Campaign © 2026
            </div>
          </div>

          {/* Right Column: Lead Form Fields */}
          <div className="lg:col-span-7 p-6 sm:p-8 bg-white flex flex-col justify-center">
            
            {formSubmitted ? (
              <div className="text-center py-10 space-y-4 animate-fade-in max-w-md mx-auto">
                <div className="w-14 h-14 bg-emerald-50 text-brand-green border border-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-xs">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <h4 className="text-xl font-black text-slate-900 leading-tight">{t.formSuccess}</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  {t.formSuccessDesc}
                </p>
                <button
                  onClick={clearForm}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl transition cursor-pointer"
                >
                  {t.formBtnBack}
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => {
                  e.preventDefault();
                  if (honeypot) {
                    // Silent prevent write for bots
                    alert(lang === 'vi' ? 'Lưu thành công!' : 'ບັນທຶກສຳເລັດ!');
                    return;
                  }
                  if (!consent) {
                    alert(lang === 'vi' ? 'Bạn cần đồng ý với các điều khoản bảo mật thông tin NNC.' : 'ທ່ານຕ້ອງຍອມຮັບເງື່ອນໄຂຂໍ້ມູນຂອງ NNC.');
                    return;
                  }
                  
                  // Simple phone regex validation for Laos numbers (must start with 020 or 030 and have 8 digits)
                  const cleanedPhone = formPhone.replace(/\s/g, '');
                  if (!/^(020|030)\d{8}$/.test(cleanedPhone)) {
                    triggerAnalyticsEvent('form_validation_error', { field_name: 'phone_number', error_type: 'invalid_format' });
                    alert(lang === 'vi' ? 'Số điện thoại không hợp lệ. Vui lòng nhập định dạng: 020 55xxxxxx hoặc 030 xxxxxxx' : 'ເບີໂທລະສັບບໍ່ຖືກຕ້ອງ. ກະລຸນາໃສ່: 020 55xxxxxx');
                    return;
                  }
                  
                  handleLeadFormSubmit(e);
                }} className="space-y-4 max-w-xl mx-auto w-full">
                
                {/* Honeypot anti-abuse protection */}
                <input
                  type="text"
                  name="website_url"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  style={{ display: 'none' }}
                  autoComplete="off"
                />
                
                {/* Pharmacy Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    {t.formPharmacyName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formPharmacy}
                    onChange={(e) => setFormPharmacy(e.target.value)}
                    placeholder="Phasouk Pharmacy Vientiane"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-green focus:ring-1 focus:ring-brand-green rounded-xl text-xs transition outline-none text-slate-800 placeholder-slate-400 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Contact Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                      {t.formContactName} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formContact}
                      onChange={(e) => setFormContact(e.target.value)}
                      placeholder="Dr. Somphone"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-green focus:ring-1 focus:ring-brand-green rounded-xl text-xs transition outline-none text-slate-800 placeholder-slate-400 font-semibold"
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                      {t.formPhone} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="020 55xxxxxx"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-green focus:ring-1 focus:ring-brand-green rounded-xl text-xs transition outline-none text-slate-800 placeholder-slate-400 font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Province Selection */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                      {t.formProvince} *
                    </label>
                    <select
                      value={formProvince}
                      onChange={(e) => setFormProvince(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-green focus:ring-1 focus:ring-brand-green rounded-xl text-xs transition outline-none text-slate-800 font-semibold cursor-pointer"
                    >
                      <option value="vientiane">Vientiane (ນະຄອນຫຼວງວຽງຈັນ)</option>
                      <option value="champasak">Champasak (ຈຳປາສັກ)</option>
                      <option value="savannakhet">Savannakhet (ສະຫວັນນະເຂດ)</option>
                      <option value="luangprabang">Luang Prabang (ຫຼວງພະບາງ)</option>
                      <option value="other">{lang === 'vi' ? 'Tỉnh thành khác tại Lào' : 'ແຂວງອື່ນໆ'}</option>
                    </select>
                  </div>

                  {/* Combo Selection */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                      {t.formSelectCombo} *
                    </label>
                    <select
                      value={formCombo}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormCombo(val);
                        // Align calculator
                        setCalcCombo(val === 'COMBO_3M' ? 'COMBO_3M' : val === 'COMBO_500K' ? 'COMBO_500K' : 'COMBO_1M');
                      }}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-green focus:ring-1 focus:ring-brand-green rounded-xl text-xs transition outline-none text-slate-800 font-semibold cursor-pointer"
                    >
                      <option value="COMBO_500K">{lang === 'vi' ? 'Gói Cơ Bản (500,000 LAK + Kệ POSM)' : 'ແພັກເກັດເລີ່ມຕົ້ນ (500K LAK)'}</option>
                      <option value="COMBO_1M">{lang === 'vi' ? 'Gói Khuyến Nghị (1,000,000 LAK + Kệ + Quà tặng)' : 'ແພັກເກັດແນະນຳ (1M LAK)'}</option>
                    </select>
                  </div>
                </div>

                {/* Reward Preference Selection */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    {t.formSelectReward} *
                  </label>
                  <select
                    value={formReward}
                    onChange={(e) => setFormReward(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-green focus:ring-1 focus:ring-brand-green rounded-xl text-xs transition outline-none text-slate-800 font-semibold cursor-pointer"
                  >
                    <option value="IN_KIND">{t.formRewardInKind}</option>
                    <option value="CASH">{t.formRewardCash}</option>
                    <option value="NONE">{t.formRewardNone}</option>
                  </select>
                </div>

                <div className="flex items-start gap-2 pt-1 pb-2">
                  <input
                    type="checkbox"
                    id="consent_checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    required
                    className="w-4 h-4 mt-0.5 accent-brand-green border-slate-350 rounded cursor-pointer"
                  />
                  <label htmlFor="consent_checkbox" className="text-[10px] text-slate-500 font-bold select-none leading-relaxed cursor-pointer">
                    {lang === 'vi' ? 
                      'Tôi cam kết thông tin cung cấp chính xác và đồng ý cho phép NNC liên hệ trao đổi chính sách trưng bày.' : 
                      'ຂ້າພະເຈົ້າຢືນຢັນວ່າຂໍ້ມູນທີ່ສະໜອງແມ່ນຖືກຕ້ອງ ແລະ ຍອມຮັບໃຫ້ NNC ຕິດຕໍ່ພົວພັນ.'
                    }
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-brand-green hover:bg-brand-green-hover text-white text-xs font-black rounded-xl transition shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>{t.formSubmitting}</span>
                      </>
                    ) : (
                      <>
                        <FileSignature className="w-3.5 h-3.5" />
                        <span>{t.formSubmit}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        </section>

        {/* ACCORDION FAQ SECTION */}
        {/* HIDE_UNTIL_ANSWERS_APPROVED 
 <section id="faq-section" className="space-y-6 max-w-3xl mx-auto">
          <div className="text-center space-y-1">
            <h3 className="text-2xl font-black font-display text-slate-900">
              {lang === 'vi' ? 'Hỏi Đáp Về Chương Trình' : 'ຄຳຖາມທີ່ຖາມເລື້ອຍໆ'}
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm">
              {lang === 'vi' ? 'Giải đáp thắc mắc của nhà thuốc về việc đăng ký, nhận kệ và điều khoản thưởng trưng bày' : 'ຂໍ້ມູນເພີ່ມເຕີມກ່ຽວກັບໂຄງການ'}
            </p>
          </div>

          <div className="space-y-3.5">
            {FAQ_ITEMS.map((faq) => {
              const isExpanded = expandedFaq === faq.id;
              return (
                <div 
                  key={faq.id} 
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs transition"
                >
                  <button
                    onClick={() => {
                      setExpandedFaq(isExpanded ? null : faq.id);
                      triggerAnalyticsEvent('click_faq_accordion', { faq_id: faq.id, state: isExpanded ? 'close' : 'open' });
                    }}
                    className="w-full text-left p-4 flex items-center justify-between gap-4 font-sans text-xs font-bold text-slate-800 cursor-pointer"
                  >
                    <span>
                      {lang === 'vi' ? faq.q.vi : lang === 'lo' ? faq.q.lo : faq.q.en}
                    </span>
                    <span className="text-slate-400 shrink-0">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>
                  
                  {isExpanded && (
                    <div className="px-4 pb-4 font-sans text-xs text-slate-500 leading-relaxed font-medium border-t border-slate-50 pt-3">
                      {lang === 'vi' ? faq.a.vi : lang === 'lo' ? faq.a.lo : faq.a.en}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section> 
 */}

        {/* LEGAL DISCLAIMERS / REGULATORY FOOTER COMPLIANCE */}
        <section className="bg-slate-100 border border-slate-200/80 rounded-3xl p-6 lg:p-8 space-y-4 text-[10px] text-slate-400 font-sans leading-relaxed font-medium">
          <h4 className="text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            {t.disclaimerTitle}
          </h4>
          <p>{t.disclaimerA}</p>
          <p>{t.disclaimerB}</p>
        </section>

      </div>
    </div>
  );
}
