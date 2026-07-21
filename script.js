// Campaign & App Configurations
const CONFIG = {
  whatsappNumber: '8562099806327',
  // Dán URL Web App của Google Apps Script vào đây (xem HUONG-DAN-CAI-DAT.md).
  // Để trống '' thì trang vẫn chạy bình thường, chỉ không lưu dữ liệu về Sheet.
  sheetWebhookUrl: '',
  campaignEndDate: '2026-10-01T00:00:00+07:00',
  referralPrefix: 'NNC-REF-'
};

// Global App State
let currentLang = 'vi';
let flowState = 'discover'; // 'discover' | 'register' | 'program' | 'wheel' | 'cart' | 'completion'
let programViewed = false;
let targetTierId = '';
let hasSpun = false;
let selectedCategory = 'all';
let registrationInfo = null;
let simulatedRevenue = 12000000;
let isSpinning = false;
let wheelRotation = 0;
let selectedModalProductId = '';
let interestedProductsSet = new Set();
let quantities = {}; // holds ordering quantity of 7 products
let rewardResult = null; // won wheel segment object
let participantId = '';
let referralLocked = false;

// Translation Dictionaries (Vietnamese & Lao)
const TRANSLATIONS = {
  vi: {
    // Nav
    'nav.products': 'Sản phẩm',
    'nav.accumulation': 'Tích lũy',
    'nav.wheel': 'Vòng quay',
    // Hero
    'hero.eyebrow': 'NNC PHARMA · CHƯƠNG TRÌNH TRI ÂN ĐỐI TÁC B2B Q3/2026',
    'hero.title_part1': '100% QUAY LÀ TRÚNG QUÀ',
    'hero.title_part2': 'CHIẾT KHẤU TÍCH LŨY ĐẾN 10%',
    'hero.subtitle': 'Dành riêng Nhà thuốc & Phòng khám tại Lào. Hoàn thành 2 bước để mở khóa lượt quay — mọi lượt quay đều có quà.',
    'hero.cta_main': 'MỞ KHÓA LƯỢT QUAY NGAY',
    'hero.cta_secondary': 'THỬ TÍNH CHIẾT KHẤU ĐƠN HÀNG',
    // Products
    'products.eyebrow': 'DANH MỤC CHÍNH THỨC',
    'products.title': '7 Dòng Sản Phẩm Tích Lũy Doanh Số Q3',
    'products.desc': 'Xem thông tin sản phẩm và chính sách kinh doanh sỉ. Cả 7 sản phẩm đều cộng dồn chung doanh số lũy tiến.',
    'products.flagships_title': 'DÒNG SẢN PHẨM CHỦ LỰC KÊ ĐƠN (3 SẢN PHẨM CHÍNH)',
    'products.support_title': 'DANH MỤC THẢO DƯỢC & KHÁNG SINH PEDIATRIC BỔ TRỢ (4 SẢN PHẨM)',
    // Calculator
    'acc.eyebrow': 'BẢNG QUYỀN LỢI TÍCH LŨY',
    'acc.title': 'Cơ chế Doanh số gộp Lũy tiến',
    'acc.desc': 'Nhập sỉ gộp đơn 7 dòng sản phẩm NNC, nhận chiết khấu trực tiếp trên đơn và thưởng cộng dồn suốt quý.',
    'acc.tbl_tier': 'Bậc tích lũy',
    'acc.tbl_range': 'Doanh số Quý (KIP)',
    'acc.tbl_direct': 'Chiết khấu trực tiếp',
    'acc.tbl_quarter': 'Thưởng cuối Quý',
    'acc.tbl_total': 'Tổng lợi ích',
    'acc.note': 'Chương trình bán lẻ KHÔNG áp dụng đồng thời chương trình hàng tặng 30+1.',
    'calc.title': 'Bảng tính Bài toán Kinh tế giả lập',
    'calc.subtitle': 'Kéo thanh trượt để giả lập doanh số nhập sỉ và dòng tiền tiết kiệm được.',
    'calc.revenue_label': 'Doanh số đặt hàng dự kiến:',
    'calc.immediate_label': 'Giảm giá trực tiếp (5%):',
    'calc.quarter_label': 'Thưởng cuối Quý tích lũy:',
    'calc.total_label': 'Tổng tiền sỉ tiết kiệm được:',
    'calc.view_pdf': 'Xem chi tiết chương trình (PDF)',
    // Form
    'form.title': 'Thông tin Đăng ký Đối tác B2B',
    'form.desc': 'Cung cấp thông tin cơ sở để nhận kết quả khảo sát và nhận quà chính thức.',
    'form.fullname': 'Họ và tên người phụ trách',
    'form.phone': 'Số điện thoại liên hệ',
    'form.business': 'Tên Nhà thuốc / Phòng khám',
    'form.province': 'Tỉnh / Thành phố tại Lào',
    'form.ref_code': 'Mã giới thiệu (nếu có)',
    'form.contact_pref': 'KÊNH LIÊN HỆ ƯU TIÊN',
    'form.call': 'Gọi điện',
    'form.other': 'Khác',
    'form.consent': 'Tôi đồng ý để NNC ghi nhận thông tin tham gia, nhu cầu sản phẩm, mã giới thiệu và nhóm quyền lợi; đồng thời liên hệ theo kênh tôi chọn để tư vấn sản phẩm, chính sách sỉ và hỗ trợ đặt hàng.',
    'form.submit_btn': 'LƯU THÔNG TIN & TIẾP TỤC',
    'form.validate_btn': 'Kiểm tra',
    'form.referral_valid': '✓ Mã giới thiệu hợp lệ và đã khóa',
    'form.referral_invalid': 'Mã không hợp lệ (tối thiểu 4 ký tự)',
    // Wheel
    'wheel.eyebrow': 'VÒNG QUAY MAY MẮN B2B',
    'wheel.title': 'Mở khóa Hộp Quà Quyền Lợi Q3',
    'wheel.desc': 'Bạn đã mở khóa thành công lượt quay quyền lợi sỉ. 100% cơ hội trúng quà tặng thực tế hoặc chiết khấu ưu đãi từ NNC Pharma.',
    'wheel.spin_btn': 'QUAY NGAY',
    // Modal
    'modal.formulation': 'Hoạt chất & Hàm lượng:',
    'modal.pack_size': 'Quy cách đóng gói:',
    'modal.price': 'Giá sỉ đề xuất tại Vientiane:',
    'modal.wa_btn': 'Tư vấn sỉ qua WhatsApp',
    'modal.interest_yes': '✓ Đang quan tâm sản phẩm này',
    'modal.interest_no': 'Tôi quan tâm sản phẩm này',
    // Results
    'result.congrats': 'Chúc mừng anh/chị!',
    'result.win_intro': 'Quyền lợi sỉ Q3 đã được ghi nhận thành công. Anh/chị đã trúng:',
    'result.condition': 'Điều kiện áp dụng:',
    'result.ref_title': 'Giới thiệu Đồng nghiệp - Nhận thêm 0.5% chiết khấu',
    'result.ref_desc': 'Chia sẻ chương trình này tới đồng nghiệp. Anh/chị sẽ nhận thêm 0.5% chiết khấu tích lũy đơn sỉ gộp khi người được giới thiệu phát sinh doanh số đơn hàng đầu tiên.',
    'result.ref_code': 'Mã giới thiệu của bạn:',
    'result.ref_link': 'Link chia sẻ nhanh:',
    'result.wa_claim_btn': 'Nhận quà qua WhatsApp B2B',
    'result.cta_next': 'Tiếp tục nhận quà',
    // Stepper
    'stepper.step1': 'Đăng ký & Khảo sát',
    'stepper.step2': 'Xem chương trình',
    'stepper.step3': 'Quay thưởng',
    'stepper.step4': 'Đơn hàng',
    'stepper.step5': 'Hoàn tất',
    // Survey
    'survey.title': 'KHẢO SÁT NHANH: SẢN PHẨM ANH/CHỊ ĐANG QUAN TÂM',
    'survey.hint': 'Chạm chọn nhanh (có thể chọn nhiều). Thông tin giúp NNC tư vấn đúng nhu cầu.',
    // Program review gate
    'program.badge': 'BƯỚC 2/2 ĐỂ MỞ KHÓA VÒNG QUAY',
    'program.title': 'Chương trình Tích lũy Doanh số Q3/2026',
    'program.desc': 'Dành cho Nhà thuốc & Phòng khám. Áp dụng gộp doanh số cả 7 sản phẩm, từ 01/08 đến 30/09/2026.',
    'program.point1': 'Giảm ngay 5% trực tiếp trên mọi hóa đơn nhập hàng.',
    'program.point2': 'Thưởng cuối quý 2% → 5% tính trên tổng doanh số tích lũy cả quý.',
    'program.point3': 'Lưu ý: Chương trình khách lẻ KHÔNG áp dụng đồng thời với chương trình hàng tặng 30+1.',
    'program.ack': 'Tôi đã xem và hiểu chính sách tích lũy Q3/2026 của NNC Pharma.',
    'program.choose_prompt': 'Chạm chọn <strong>bậc mục tiêu doanh số</strong> anh/chị nhắm tới trong Quý 3 để mở khóa vòng quay:',
    'program.unlock_btn': 'MỞ KHÓA VÒNG QUAY QUÀ TẶNG',
    // Wheel lock
    'wheel.locked_hint': 'Hoàn thành 2 bước để mở khóa lượt quay 100% trúng quà',
    'wheel.locked_cta': 'Bấm để bắt đầu →',
    // Cart/Order Form
    'cart.eyebrow': 'ĐƠN HÀNG THAM KHẢO',
    'cart.title': 'Lên thử đơn hàng của bạn',
    'cart.subtitle': 'Chọn số lượng để xem tổng tiền và bậc tích lũy. NNC sẽ tư vấn chính xác hơn khi bạn gửi thông tin này qua WhatsApp.',
    'cart.summary_title': 'Tổng quan đơn hàng',
    'cart.preview_invoice': 'Xem PDF Đặt hàng',
    'cart.send_whatsapp': 'Gửi qua WhatsApp',
    'cart.skip': 'Bỏ qua bước này',
    // Rules / Invoice Modals
    'rules.title': 'Chi tiết chương trình',
    'rules.close': 'Đóng',
    'rules.download': 'Tải xuống hình ảnh',
    'invoice.title': 'Xem trước bản PDF',
    'invoice.close': 'Đóng',
    'invoice.download': 'Tải xuống hình ảnh',
    // Completion
    'completion.title': 'Cảm ơn bạn đã lên đơn!',
    'completion.desc': 'Đơn hàng tham khảo của bạn đã được ghi nhận. Đội ngũ NNC sẽ liên hệ qua WhatsApp sớm nhất để hỗ trợ.',
    'completion.wa_btn': 'Nhắn tin qua WhatsApp',
    // Footer
    'footer.desc': 'Chương trình B2B Q3/2026 dành riêng cho bác sĩ, phòng khám, nhà thuốc và đối tác sỉ chính hãng của NNC Pharma tại Lào.'
  },
  lo: {
    // Nav
    'nav.products': 'ຜະລິດຕະພັນ',
    'nav.accumulation': 'ສະສົມຍອດ',
    'nav.wheel': 'ວົງລໍ້ລາງວັນ',
    // Hero
    'hero.eyebrow': 'ສຳລັບ ທ່ານໝໍ · ຄລີນິກ · ຮ້ានຂາຍຢາ · ຄູ່ຮ່ວມງານ B2B',
    'hero.title_part1': 'ໝູນແມ່ນໄດ້ຂອງຂວັນ 100%',
    'hero.title_part2': 'ສ່ວນຫຼຸດສະສົມສູງສຸດ 10%',
    'hero.subtitle': 'ສະເພາະຮ້ານຢາ & ຄລີນິກ ຢູ່ ລາວ. ສຳເລັດ 2 ຂັ້ນຕອນເພື່ອປົດລັອກການໝູນ — ທຸກການໝູນມີຂອງຂວັນ.',
    'hero.cta_main': 'ປົດລັອກການໝູນດຽວນີ້',
    'hero.cta_secondary': 'ທົດລອງຄິດໄລ່ສ່ວນຫຼຸດ',
    // Products
    'products.eyebrow': 'ລາຍການຜະລິດຕະພັນທາງການ',
    'products.title': '7 ຜະລິດຕະພັນສະສົມຍອດຂາຍໄຕມາດ 3',
    'products.desc': 'ເບິ່ງຂໍ້ມູນຜະລິດຕະພັນ ແລະ ນະໂຍບາຍຂາຍສົ່ງ. ຍອດຊື້ຜະລິດຕະພັນທັງ 7 ຈະຖືກສະສົມລວມກັນ.',
    'products.flagships_title': 'ກຸ່ມຜະລິດຕະພັນຫຼັກປິ່ນປົວ (3 ຜະລິດຕະພັນຫຼັກ)',
    'products.support_title': 'ກຸ່ມສະໝຸນໄພ & ຢາຕ້ານເຊື້ອເດັກນ້ອຍບຳລຸງ (4 ຜະລິດຕະພັນ)',
    // Calculator
    'acc.eyebrow': 'ຕາຕະລາງຜົນປະໂຫຍດສະສົມ',
    'acc.title': 'ນະໂຍບາຍຍອດຂາຍສະສົມແບບຂັ້ນໄດ',
    'acc.desc': 'ສັ່ງຊື້ຜະລິດຕະພັນທັງ 7 ຂອງ NNC, ຮັບສ່ວນຫຼຸດໂດຍກົງໃນບິນ ແລະ ໂບນັດສະສົມທ້າຍໄຕມາດ.',
    'acc.tbl_tier': 'ຂັ້ນສະສົມ',
    'acc.tbl_range': 'ຍອດຂາຍໄຕມາດ (KIP)',
    'acc.tbl_direct': 'ສ່ວນຫຼຸດໂດຍກົງ',
    'acc.tbl_quarter': 'ໂບນັດທ້າຍໄຕມາດ',
    'acc.tbl_total': 'ຜົນປະໂຫຍດລວມ',
    'acc.note': 'ໂຄງການຂາຍຍ່ອຍ ບໍ່ສາມາດໃຊ້ຮ່ວມກັບໂຄງການແຖມສິນຄ້າ 30+1 ໄດ້.',
    'calc.title': 'ເຄື່ອງຄິດໄລ່ຜົນປະໂຫຍດຈຳລອງ',
    'calc.subtitle': 'ເລື່ອນແຖບເພື່ອຈຳລອງຍອດຊື້ ແລະ ເບິ່ງສ່ວນຫຼຸດທີ່ຈະໄດ້ຮັບ.',
    'calc.revenue_label': 'ຍອດຊື້ທີ່ຄາດໄວ້:',
    'calc.immediate_label': 'ສ່ວນຫຼຸດໂດຍກົງ (5%):',
    'calc.quarter_label': 'ໂບນັດທ້າຍໄຕມາດ:',
    'calc.total_label': 'ຍອດປະຢັດລວມທັງໝົດ:',
    'calc.view_pdf': 'ເບິ່ງລາຍລະອຽດໂຄງການ (PDF)',
    // Form
    'form.title': 'ຂໍ້ມູນລົງທະບຽນຄູ່ຮ່ວມ B2B',
    'form.desc': 'ກະລຸນາປ້ອນຂໍ້ມູນເພື່ອບັນທຶກຜົນການສຳຫຼວດ ແລະ ຮັບຂອງຂວັນ.',
    'form.fullname': 'ຊື່ ແລະ ນາມສະກຸນ ຜູ້ຮັບຜິດຊອບ',
    'form.phone': 'ເບີໂທລະສັບຕິດຕໍ່',
    'form.business': 'ຊື່ຮ້ានຢາ / ຄລີນິກ',
    'form.province': 'ແຂວງ / ນະຄອນ (ລາວ)',
    'form.ref_code': 'ລະຫັດຜູ້ແນະນຳ (ຖ້າມີ)',
    'form.contact_pref': 'ຊ່ອງທາງຕິດຕໍ່ທີ່ສະດວກ',
    'form.call': 'ໂທ',
    'form.other': 'ອື່ນໆ',
    'form.consent': 'ຂ້າພະເຈົ້າຕົກລົງບັນທຶກຂໍ້ມູນເພື່ອຮັບຄຳປຶກສາຈາກ NNC, ຄວາມຕ້ອງການສິນຄ້າ, ລະຫັດແນະນຳ ແລະ ຮັບສິດທິຕ່າງໆ.',
    'form.submit_btn': 'ບັນທຶກຂໍ້ມູນ & ຕໍ່ໄປ',
    'form.validate_btn': 'ກວດສອບ',
    'form.referral_valid': '✓ ລະຫັດແນະນຳຖືກຕ້ອງ ແລະ ຖືກລັອກ',
    'form.referral_invalid': 'ລະຫັດບໍ່ຖືກຕ້ອງ (ຢ່າງຕ່ຳ 4 ຕົວອັກສອນ)',
    // Wheel
    'wheel.eyebrow': 'ວົງລໍ້ລາງວັນ B2B',
    'wheel.title': 'ປົດລັອກກ່ອງຂອງຂວັນໄຕມາດ 3',
    'wheel.desc': 'ທ່ານໄດ້ປົດລັອກວົງລໍ້ລາງວັນສຳເລັດແລ້ວ. ໂອກາດ 100% ທີ່ຈະໄດ້ຮັບຂອງຂວັນຕົວຈິງ ຫຼື ສ່ວນຫຼຸດພິເສດຈາກ NNC Pharma.',
    'wheel.stock_pre': 'ເຫຼືອພຽງແຕ່',
    'wheel.stock_post': 'ຂອງຂວັນໃນສາງມື້ນີ້! ໝູນເລີຍກ່ອນໝົດ.',
    'wheel.spin_btn': 'ໝູນວົງລໍ້',
    // Modal
    'modal.formulation': 'ສ່ວນປະກອບ & ປະລິມານ:',
    'modal.pack_size': 'ຂະໜາດບັນຈຸ:',
    'modal.price': 'ລາຄາແນະນຳຢູ່ ວຽງຈັນ:',
    'modal.wa_btn': 'ຂໍຄຳປຶກສາຜ່ານ WhatsApp',
    'modal.interest_yes': '✓ ສົນໃຈຜະລິດຕະພັນນີ້ແລ້ວ',
    'modal.interest_no': 'ຂ້ອຍສົນໃຈຜະລິດຕະພັນນີ້',
    // Results
    'result.congrats': 'ຂໍສະແດງຄວາມຍິນດີ!',
    'result.win_intro': 'ຜົນປະໂຫຍດຂາຍສົ່ງໄຕມາດ 3 ຖືກບັນທຶກແລ້ວ. ທ່ານໄດ້ຮັບ:',
    'result.condition': 'ເງື່ອນໄຂການນຳໃຊ້:',
    'result.ref_title': 'ແນະນຳເພື່ອນຮ່ວມງານ - ຮັບສ່ວນຫຼຸດເພີ່ມ 0.5%',
    'result.ref_desc': 'ແບ່ງປັນໂຄງການນີ້ໃຫ້ເພື່ອນຮ່ວມງານ. ທ່ານຈະໄດ້ຮັບສ່ວນຫຼຸດເພີ່ມ 0.5% ເມື່ອຜູ້ທີ່ຖືກແນະນຳມີຍອດຊື້ບິນທຳອິດ.',
    'result.ref_code': 'ລະຫັດແນະນຳຂອງທ່ານ:',
    'result.ref_link': 'ລິ້ງແບ່ງປັນດ່ວນ:',
    'result.wa_claim_btn': 'ຢືນຢັນ & ຮັບຂອງຂວັນຜ່ານ WhatsApp B2B',
    'result.cta_next': 'ສືບຕໍ່ຮັບຂອງຂວັນ',
    // Stepper
    'stepper.step1': 'ລົງທະບຽນ & ສຳຫຼວດ',
    'stepper.step2': 'ເບິ່ງໂຄງການ',
    'stepper.step3': 'ໝູນວົງລໍ້',
    'stepper.step4': 'ໃບສັ່ງຊື້',
    'stepper.step5': 'ສຳເລັດ',
    // Survey
    'survey.title': 'ສຳຫຼວດດ່ວນ: ຜະລິດຕະພັນທີ່ທ່ານສົນໃຈ',
    'survey.hint': 'ແຕະເລືອກໄດ້ຫຼາຍລາຍການ. ຂໍ້ມູນຊ່ວຍໃຫ້ NNC ໃຫ້ຄຳປຶກສາຖືກຕາມຄວາມຕ້ອງການ.',
    // Program review gate
    'program.badge': 'ຂັ້ນຕອນ 2/2 ເພື່ອປົດລັອກວົງລໍ້',
    'program.title': 'ໂຄງການສະສົມຍອດຂາຍ ໄຕມາດ 3/2026',
    'program.desc': 'ສຳລັບຮ້ານຢາ & ຄລີນິກ. ນັບຍອດຮວມທັງ 7 ຜະລິດຕະພັນ, ຕັ້ງແຕ່ 01/08 ຫາ 30/09/2026.',
    'program.point1': 'ຫຼຸດທັນທີ 5% ໃນທຸກໃບບິນສັ່ງຊື້.',
    'program.point2': 'ໂບນັດທ້າຍໄຕມາດ 2% → 5% ຄິດຈາກຍອດສະສົມລວມທັງໄຕມາດ.',
    'program.point3': 'ໝາຍເຫດ: ໂຄງການຜູ້ຂາຍຍ່ອຍ ບໍ່ສາມາດນຳໃຊ້ພ້ອມກັນກັບໂຄງການແຖມ 30+1 ໄດ້.',
    'program.ack': 'ຂ້ອຍໄດ້ອ່ານ ແລະ ເຂົ້າໃຈນະໂຍບາຍສະສົມ ໄຕມາດ 3/2026 ຂອງ NNC Pharma ແລ້ວ.',
    'program.choose_prompt': 'ແຕະເລືອກ <strong>ຂັ້ນເປົ້າໝາຍຍອດຂາຍ</strong> ທີ່ທ່ານຕັ້ງໃຈໃນໄຕມາດ 3 ເພື່ອປົດລັອກວົງລໍ້:',
    'program.unlock_btn': 'ປົດລັອກວົງລໍ້ຂອງຂວັນ',
    // Wheel lock
    'wheel.locked_hint': 'ສຳເລັດ 2 ຂັ້ນຕອນ ເພື່ອປົດລັອກການໝູນ 100% ໄດ້ຂອງຂວັນ',
    'wheel.locked_cta': 'ແຕະເພື່ອເລີ່ມ →',
    // Cart/Order Form
    'cart.eyebrow': 'ໃບສັ່ງຊື້ອ້າງອີງ',
    'cart.title': 'ລອງຈັດໃບສັ່ງຊື້ຂອງເຈົ້າ',
    'cart.subtitle': 'ເລືອກຈຳນວນສິນຄ້າ ເພື່ອເບິ່ງຍອດລວມ ແລະ ຂັ້ນສະສົມ. ຂໍ້ມູນນີ້ຊ່ວຍໃຫ້ NNC ໃຫ້ຄຳປຶກສາໄດ້ໄວຂຶ້ນຜ່ານ WhatsApp.',
    'cart.summary_title': 'ສະຫຼຸບຍອດລວມ',
    'cart.preview_invoice': 'ເບິ່ງ PDF ອ້າງອີງ',
    'cart.send_whatsapp': 'ສົ່ງຜ່ານ WhatsApp',
    'cart.skip': 'ຂ້າມຂັ້ນຕອນນີ້',
    // Rules / Invoice Modals
    'rules.title': 'ລາຍລະອຽດໂຄງການ',
    'rules.close': 'ປິດ',
    'rules.download': 'ດາວໂຫຼດຮູບພາບ',
    'invoice.title': 'ເບິ່ງຕົວຢ່າງ PDF',
    'invoice.close': 'ປິດ',
    'invoice.download': 'ດາວໂຫຼດຮູບພາບ',
    // Completion
    'completion.title': 'ຂອບໃຈທີ່ສັ່ງຊື້!',
    'completion.desc': 'ໃບສັ່ງຊື້ຂອງທ່ານໄດ້ຮັບການບັນທຶກແລ້ວ. ທີມງານ NNC ຈະຕິດຕໍ່ຫາທ່ານທາງ WhatsApp ໃນໄວໆນີ້.',
    'completion.wa_btn': 'ສົ່ງຂໍ້ຄວາມ WhatsApp',
    // Footer
    'footer.desc': 'ໂຄງການ B2B Q3/2026 ສຳລັບທ່ານໝໍ, ຄລີນິກ, ຮ້ານຢາ ແລະ ຄູ່ຮ່ວມງານຢ່າງເປັນທາງການຂອງ NNC Pharma ຢູ່ ລາວ.'
  }
};

// 7 Participating Products Data
const PRODUCTS_DATA = [
  {
    id: 'tadimax',
    name: 'Tadimax',
    category: 'herbal',
    pack: 'Hộp 21 viên x 2 vỉ',
    price: 193000,
    badgeVi: 'Best-Seller · Lợi nhuận sỉ tốt',
    badgeLo: 'ຂາຍດີທີ່ສຸດ · ກຳໄລດີ',
    formulation: 'Trinh nữ hoàng cung, Bản lam căn, Cát cánh, v.v.',
    descVi: 'Dòng sản phẩm thảo dược hỗ trợ điều trị phì đại lành tính tuyến tiền liệt có tỷ lệ quay vòng kê đơn cao nhất tại thị trường Lào. Mang lại doanh số ổn định và biên lợi nhuận sỉ cực tốt cho nhà thuốc.',
    descLo: 'ຜະລິດຕະພັນສະໝຸນໄພປິ່ນປົວພະຍາດຕ່ອມລູກໝາກໃຫຍ່ ທີ່ມີອັດຕາການໝູນວຽນສູງສຸດໃນລາວ. ໃຫ້ຍອດຂາຍຄົງທີ່ ແລະກຳໄລສູງ.',
    image: 'images/tadimax.webp'
  },
  {
    id: 'bai-thach',
    name: 'Bài Thạch NNC',
    category: 'herbal',
    pack: 'Hộp 1 lọ 45 viên',
    price: 69000,
    badgeVi: 'Thảo dược sỏi thận bán chạy nhất',
    badgeLo: 'ສະໝຸນໄພປິ່ນປົວໜິ້ວຂາຍດີ',
    formulation: 'Kim tiền thảo, Nhân trần, Hoàng cầm, Uất kim',
    descVi: 'Hỗ trợ tán sỏi thận, sỏi đường tiết niệu hiệu quả lâm sàng cao. Được bệnh nhân truyền tai mua nhiều, giúp nhà thuốc giữ chân khách hàng trung thành tốt.',
    descLo: 'ຊ່ວຍລະລາຍໜິ້ວໃນໝາກໄຂ່ຫຼັງ ແລະທາງເດີນປັດສະວະຢ່າງມີປະສິດທິຜົນ. ເປັນທີ່ນິຍົມຂອງຄົນເຈັບ, ຊ່ວຍຮັກສາຖານລູກຄ້າ.',
    image: 'images/bai-thach.webp'
  },
  {
    id: 'cv-mox-1000',
    name: 'CV Mox 1000',
    category: 'antibiotic',
    pack: 'Hộp 2 vỉ x 7 viên',
    price: 71000,
    badgeVi: 'Kháng sinh chủ lực phòng khám',
    badgeLo: 'ຢາຕ້ານເຊື້ອຫຼັກຄລີນິກ',
    formulation: 'Amoxicillin 1000mg + Clavulanic acid',
    descVi: 'Kháng sinh phổ rộng chất lượng chuẩn châu Âu, chuyên trị nhiễm khuẩn hô hấp, răng hàm mặt. Lựa chọn kê đơn số 1 của các bác sĩ tư tại Lào vì tính an toàn và hiệu quả nhanh.',
    descLo: 'ຢາຕ້ານເຊື້ອຄຸນນະພາບມາດຕະຖານຢູໂຣບ, ປິ່ນປົວການຕິດເຊື້ອທາງເດີນຫາຍໃຈ. ທາງເລືອກອັນດັບ 1 ຂອງຄລີນິກເອກະຊົນ.',
    image: 'images/cvmox-1000.webp'
  },
  {
    id: 'nc-cv-mox-625',
    name: 'NC CV Mox 625',
    category: 'antibiotic',
    pack: 'Hộp 10 vỉ x 10 viên',
    price: 369000,
    badgeVi: 'Biên lợi nhuận sỉ rất cao',
    badgeLo: 'ກຳໄລສີສູງຫຼາຍ',
    formulation: 'Amoxicillin 500mg + Clavulanate 125mg',
    descVi: 'Hàm lượng 625mg chuẩn điều trị ngoại trú. Chương trình sỉ hỗ trợ giá tốt nhất Quý 3, tối ưu hóa biên lợi nhuận cho đại lý phân phối và các đối tác lớn.',
    descLo: 'ປະລິມານ 625mg ມາດຕະຖານການປິ່ນປົວ. ໂຄງການສີຊ່ວຍເຫຼືອລາຄາດີທີ່ສຸດໃນໄຕມາດ 3, ເພີ່ມກຳໄລສູງສຸດໃຫ້ຜູ້ຈັດຈຳໜ່າຍ.',
    image: 'images/nc-cvmox-625.webp'
  },
  {
    id: 'cv-mox-228-5',
    name: 'CV MOX 228.5 (Hỗn dịch)',
    category: 'antibiotic',
    pack: 'Chai 60ml',
    price: 24000,
    badgeVi: 'Dễ kê đơn · Phổ biến nhi khoa',
    badgeLo: 'ແນະນຳງ່າຍ · ຍອດນິຍົມສຳລັບເດັກນ້ອຍ',
    formulation: 'Amoxicillin 200mg + Clavulanate 28.5mg',
    descVi: 'Hỗn dịch ngọt dịu thơm hương trái cây dễ uống cho trẻ em. Khuyên dùng rộng rãi trong các phòng khám nhi khoa ngoại trú tại Vientiane.',
    descLo: 'ຢານ້ຳເຊື່ອມລົດຊາດຫວານຫອມໝາກໄມ້ ກິນງ່າຍສຳລັບເດັກນ້ອຍ. ແນະນຳໃຫ້ໃຊ້ຢ່າງກວ້າງຂວາງໃນຄລີນິກເດັກ.',
    image: 'images/cvmok-228.webp'
  },
  {
    id: 'cefixad-100',
    name: 'Cefixad 100mg',
    category: 'antibiotic',
    pack: 'Chai 30ml (100mg/5ml)',
    price: 30000,
    badgeVi: 'Kháng sinh Cephalosporin bán chạy',
    badgeLo: 'ຢαຕ້ານເຊື້ອ Cephalosporin ຂາຍດີ',
    formulation: 'Cefixime 100mg/5ml',
    descVi: 'Kháng sinh Cephalosporin thế hệ 3 dạng bột pha nước uống tiện lợi. Đảm bảo diệt khuẩn nhanh đối với viêm tai giữa, viêm phế quản cấp ở trẻ nhỏ.',
    descLo: 'ຢαຕ້ານເຊື້ອ Cephalosporin ຮຸ່ນທີ 3 ແບບຜົງປະສົມນ້ຳສະດວກ. ຮັບປະກັນຂ້າເຊື້ອໄວສຳລັບການອັກເສບຫູ.',
    image: 'images/cefixad-100.webp'
  },
  {
    id: 'azihadi',
    name: 'AZIHADI (Hỗn dịch)',
    category: 'antibiotic',
    pack: 'Chai 30ml',
    price: 32000,
    badgeVi: 'Kê đơn ngắn ngày hiệu quả cao',
    badgeLo: 'ໃຊ້ໄລຍະສັ້ນມີປະສິດທິຜົນສູງ',
    formulation: 'Azithromycin 200mg/5ml',
    descVi: 'Liệu trình ngắn ngày tối ưu (chỉ 3 ngày kê đơn). Dòng sản phẩm kháng sinh macrolide cực kỳ nhạy bén đối với nhiễm trùng da và mô mềm trẻ em.',
    descLo: 'ໄລຍະການປິ່ນປົວສັ້ນທີ່ດີທີ່ສຸດ (ພຽງແຕ່ 3 ວັນ). ຢາຕ້ານເຊື້ອ macrolide ທີ່ຕອບສະໜອງໄວຕໍ່ການຕິດເຊື້ອຜິວໜັງ.',
    image: 'images/azihadi.webp'
  }
];

// Lucky Wheel Segments (6 items matching React)
const WHEEL_SEGMENTS = [
  { id: 'extra_discount', weight: 12, nameVi: 'Chiết khấu thêm 1% đơn đầu', nameLo: 'ສ່ວນຫຼຸດເພີ່ມ 1% ບິນທຳອິດ', color: '#0f3a30', textColor: '#ffffff' },
  { id: 'voucher_100k', weight: 22, nameVi: 'Voucher 100.000 KIP', nameLo: 'ຄູປ໋ອງ 100.000 ກີບ', color: '#fbbf24', textColor: '#102a24' },
  { id: 'free_shipping', weight: 20, nameVi: 'Miễn phí vận chuyển 2 đơn', nameLo: 'ສົ່ງຟຣີ 2 ບິນ', color: '#104e40', textColor: '#ffffff' },
  { id: 'tadimax_gift', weight: 15, nameVi: 'Tặng 1 hộp Tadimax', nameLo: 'ແຖມ ຕາດິແມ໋ກ 1 ກັບ', color: '#0f3a30', textColor: '#ffffff' },
  { id: 'office_kit', weight: 25, nameVi: 'Bộ quà văn phòng NNC', nameLo: 'ຊຸດຂອງຂວັນຫ້ອງການ NNC', color: '#60a5fa', textColor: '#ffffff' },
  { id: 'voucher_200k', weight: 6, nameVi: 'Voucher 200.000 KIP', nameLo: 'ຄູປ໋ອງ 200.000 ກີບ', color: '#104e40', textColor: '#ffffff' }
];

const REWARD_DETAILS = {
  extra_discount: {
    nameVi: 'Chiết khấu thêm 1% trên đơn hàng đầu tiên',
    nameLo: 'ສ່ວນຫຼຸດເພີ່ມ 1% ໃນບິນສັ່ງຊື້ທຳອິດ',
    condVi: 'Cộng thêm 1% chiết khấu trực tiếp (ngoài mức 5% chuẩn) cho hóa đơn đầu tiên trong Q3/2026, tối đa 300.000 KIP.',
    condLo: 'ເພີ່ມສ່ວນຫຼຸດ 1% (ນອກເໜືອຈາກ 5% ມາດຕະຖານ) ສຳລັບບິນທຳອິດໃນໄຕມາດ 3/2026, ສູງສຸດ 300.000 ກີບ.'
  },
  voucher_100k: {
    nameVi: 'Voucher 100.000 KIP',
    nameLo: 'ຄູປ໋ອງ 100.000 ກີບ',
    condVi: 'Trừ trực tiếp 100.000 KIP vào hóa đơn nhập hàng từ 2.000.000 KIP trở lên trong Q3/2026.',
    condLo: 'ຫັກ 100.000 ກີບ ໂດຍກົງໃນບິນສັ່ງຊື້ຕັ້ງແຕ່ 2.000.000 ກີບ ຂຶ້ນໄປ ໃນໄຕມາດ 3/2026.'
  },
  free_shipping: {
    nameVi: 'Miễn phí vận chuyển 2 đơn hàng đầu',
    nameLo: 'ສົ່ງຟຣີ 2 ບິນທຳອິດ',
    condVi: 'NNC hỗ trợ toàn bộ cước vận chuyển cho 2 đơn hàng đầu tiên phát sinh trong Q3/2026.',
    condLo: 'NNC ຮັບຜິດຊອບຄ່າຂົນສົ່ງທັງໝົດສຳລັບ 2 ບິນທຳອິດໃນໄຕມາດ 3/2026.'
  },
  tadimax_gift: {
    nameVi: 'Tặng 1 hộp Tadimax kèm đơn hàng',
    nameLo: 'ແຖມ ຕາດິແມ໋ກ 1 ກັບ ພ້ອມບິນສັ່ງຊື້',
    condVi: 'Tặng 1 hộp Tadimax (21 viên x 2 vỉ) kèm đơn hàng đầu tiên từ 3.000.000 KIP trở lên.',
    condLo: 'ແຖມ ຕາດິແມ໋ກ 1 ກັບ (21 ເມັດ x 2 ແຜງ) ພ້ອມບິນທຳອິດຕັ້ງແຕ່ 3.000.000 ກີບ ຂຶ້ນໄປ.'
  },
  office_kit: {
    nameVi: 'Bộ quà văn phòng NNC Pharma',
    nameLo: 'ຊຸດຂອງຂວັນຫ້ອງການ NNC Pharma',
    condVi: 'Bộ sổ tay + bút ký + ô che nắng NNC, sales giao tận nơi cùng đơn hàng đầu tiên.',
    condLo: 'ຊຸດປຶ້ມບັນທຶກ + ບິກ + ຄັນຮົ່ມ NNC, ພະນັກງານຂາຍນຳສົ່ງພ້ອມບິນທຳອິດ.'
  },
  voucher_200k: {
    nameVi: 'Voucher 200.000 KIP',
    nameLo: 'ຄູປ໋ອງ 200.000 ກີບ',
    condVi: 'Trừ trực tiếp 200.000 KIP vào hóa đơn nhập hàng từ 5.000.000 KIP trở lên trong Q3/2026.',
    condLo: 'ຫັກ 200.000 ກີບ ໂດຍກົງໃນບິນສັ່ງຊື້ຕັ້ງແຕ່ 5.000.000 ກີບ ຂຶ້ນໄປ ໃນໄຕມາດ 3/2026.'
  }
};

const NNC_ACCUMULATION_TIERS = [
  { tier_id: "tier_1", name_vi: "Bậc 1", name_lo: "ຂັ້ນ 1", min_revenue_kip: 2000000, max_revenue_kip: 6000000, immediate_discount: 5, quarter_end_reward: 2, total_benefit: 7 },
  { tier_id: "tier_2", name_vi: "Bậc 2", name_lo: "ຂັ້ນ 2", min_revenue_kip: 6000000, max_revenue_kip: 12000000, immediate_discount: 5, quarter_end_reward: 3, total_benefit: 8 },
  { tier_id: "tier_3", name_vi: "Bậc 3", name_lo: "ຂັ້ນ 3", min_revenue_kip: 12000000, max_revenue_kip: 25000000, immediate_discount: 5, quarter_end_reward: 4, total_benefit: 9 },
  { tier_id: "tier_4", name_vi: "Bậc 4", name_lo: "ຂັ້ນ 4", min_revenue_kip: 25000000, max_revenue_kip: Number.MAX_SAFE_INTEGER, immediate_discount: 5, quarter_end_reward: 5, total_benefit: 10 }
];

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  // Load query params or session storage if any
  const urlParams = new URLSearchParams(window.location.search);
  const refParam = urlParams.get('ref') || '';
  if (refParam) {
    const codeInput = document.getElementById('referralCode');
    if (codeInput) codeInput.value = refParam;
  }

  // Check saved session in storage safely
  try {
    const savedSession = sessionStorage.getItem('nnc_b2b_session');
    if (savedSession) {
      const data = JSON.parse(savedSession);
      registrationInfo = data.registrationInfo;
      participantId = data.participantId || '';
      referralLocked = data.referralLocked || false;
      programViewed = data.programViewed || false;
      targetTierId = data.targetTierId || '';
      if (data.rewardResultId) {
        rewardResult = WHEEL_SEGMENTS.find(s => s.id === data.rewardResultId);
        hasSpun = true;
      }
      // Restore to the correct step based on saved progress
      if (registrationInfo && hasSpun) {
        setFlowState('cart');
      } else if (registrationInfo && programViewed) {
        setFlowState('wheel');
      } else if (registrationInfo) {
        setFlowState('program');
      }
    }
  } catch (e) {
    console.error('Session storage reading error:', e);
  }

  // Set default quantities to 0
  PRODUCTS_DATA.forEach(p => quantities[p.id] = 0);

  renderProducts();
  renderSurveyChips();
  updateWheelLockVisual();
  updateSimulation(simulatedRevenue);
  initCountdownTimer();

  // Keep sticky stepper right below the header at any screen size
  const syncHeaderOffset = () => {
    const hd = document.querySelector('.app-header');
    if (hd) document.documentElement.style.setProperty('--header-h', hd.offsetHeight + 'px');
  };
  syncHeaderOffset();
  window.addEventListener('resize', syncHeaderOffset);
  drawLuckyWheel();
  
  // Highlight spin button
  const spinBtn = document.getElementById('btn-spin-wheel');
  if (spinBtn) spinBtn.classList.add('pulse-border');

  // Trigger auto-validation of referral code if pre-loaded
  if (refParam) {
    validateReferralCode();
  }

  updateStepperVisual();
});

// ===== Data logging to Google Sheet (Apps Script Web App) =====
function logEvent(eventType, extra) {
  if (!CONFIG.sheetWebhookUrl) return;
  const payload = {
    event: eventType,
    timestamp: new Date().toISOString(),
    participantId: participantId || '',
    lang: currentLang,
    fullname: registrationInfo ? registrationInfo.fullname : '',
    phone: registrationInfo ? registrationInfo.phone : '',
    business: registrationInfo ? registrationInfo.business : '',
    province: registrationInfo ? registrationInfo.province : '',
    refCode: registrationInfo ? (registrationInfo.refCode || '') : '',
    preferredContact: registrationInfo ? registrationInfo.preferredContact : '',
    surveyInterests: registrationInfo && registrationInfo.surveyInterests ? registrationInfo.surveyInterests.join(', ') : '',
    reward: rewardResult ? rewardResult.nameVi : '',
    targetTier: (function(){ const t = NNC_ACCUMULATION_TIERS.find(x => x.tier_id === targetTierId); return t ? t.name_vi : ''; })(),
    ...(extra || {})
  };
  try {
    fetch(CONFIG.sheetWebhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      keepalive: true,
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    }).catch(err => console.warn('Sheet log failed:', err));
  } catch (err) {
    console.warn('Sheet log failed:', err);
  }
}

// Clean referral code from participant id (alphanumeric only)
function getMyReferralCode() {
  const tail = (participantId || '').replace(/[^a-z0-9]/gi, '').slice(-5).toUpperCase() || 'GUEST';
  return CONFIG.referralPrefix + tail;
}

// Stepper visual rendering
function updateStepperVisual() {
  const stateToStep = { discover: 0, register: 0, program: 1, wheel: 2, cart: 3, completion: 4 };
  const currentIndex = stateToStep[flowState] !== undefined ? stateToStep[flowState] : 0;
  
  for (let i = 1; i <= 5; i++) {
    const node = document.getElementById(`step-node-${i}`);
    const modalNode = document.getElementById(`modal-step-node-${i}`);
    
    [node, modalNode].forEach(el => {
      if (!el) return;
      if (i - 1 <= currentIndex) {
        el.className = 'stepper-step active';
      } else {
        el.className = 'stepper-step';
      }
      if (i - 1 === currentIndex) {
        el.classList.add('current');
      }
    });
    
    const line = document.getElementById(`step-line-${i}`);
    const modalLine = document.getElementById(`modal-step-line-${i}`);
    [line, modalLine].forEach(l => {
      if (!l) return;
      if (i - 1 < currentIndex) {
        l.className = 'stepper-line active';
      } else {
        l.className = 'stepper-line';
      }
    });
  }
}

function closeFunnelModal() {
  const overlay = document.getElementById('funnel-modal-overlay');
  if (overlay) overlay.style.display = 'none';
  document.body.style.overflow = '';
  if (flowState !== 'wheel') {
    flowState = 'discover';
    updateStepperVisual();
  }
}

// Flow state transitions
function setFlowState(nextState) {
  flowState = nextState;
  updateStepperVisual();
  updateWheelLockVisual();

  const overlay = document.getElementById('funnel-modal-overlay');
  const registerCard = document.getElementById('register-card');
  const programCard = document.getElementById('program-card');
  const orderCard = document.getElementById('order-form-card');
  const completionCard = document.getElementById('completion-card');
  const spinBtn = document.getElementById('btn-spin-wheel');

  const show = (el, on) => { if (el) el.style.display = on ? 'block' : 'none'; };

  if (flowState === 'discover') {
    if (overlay) overlay.style.display = 'none';
    document.body.style.overflow = '';
    if (spinBtn) spinBtn.classList.add('pulse-border');
  } else if (flowState === 'wheel') {
    if (overlay) overlay.style.display = 'none';
    document.body.style.overflow = '';
    if (spinBtn) {
      spinBtn.disabled = false;
      spinBtn.classList.add('pulse-border');
    }
    scrollToId('target-wheel-box');
  } else {
    // Open Popup Modal Overlay over screen!
    if (overlay) overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    show(registerCard, flowState === 'register');
    show(programCard, flowState === 'program');
    show(orderCard, flowState === 'cart');
    show(completionCard, flowState === 'completion');

    if (flowState === 'cart') {
      renderOrderProductsList();
      calculateOrderTotals();
    } else if (flowState === 'completion') {
      const code = getMyReferralCode();
      const myCodeEl = document.getElementById('my-referral-code');
      const myLinkEl = document.getElementById('my-referral-link');
      if (myCodeEl) myCodeEl.innerText = code;
      if (myLinkEl) myLinkEl.innerText = `${window.location.origin}/?ref=${code}`;
      renderCompletionTierProgress();
    }
  }
}

// Wheel lock overlay + spin button visibility
function updateWheelLockVisual() {
  const overlay = document.getElementById('wheel-lock-overlay');
  const spinBtn = document.getElementById('btn-spin-wheel');
  const unlocked = (flowState === 'wheel') || hasSpun;
  if (overlay) overlay.style.display = unlocked ? 'none' : 'flex';
  if (spinBtn) {
    spinBtn.style.display = unlocked && !hasSpun ? '' : (unlocked ? 'none' : 'none');
    if (flowState === 'wheel' && !hasSpun) spinBtn.style.display = '';
  }
}

// Interactive target-tier selection (active choice instead of passive reading)
function renderProgramTiersTable() {
  const grid = document.getElementById('tier-target-grid');
  if (!grid) return;
  const fmtM = (v) => (v / 1000000).toLocaleString(currentLang === 'vi' ? 'vi-VN' : 'lo-LA');
  grid.innerHTML = NNC_ACCUMULATION_TIERS.map(t => {
    const name = currentLang === 'vi' ? t.name_vi : t.name_lo;
    const range = t.max_revenue_kip === Number.MAX_SAFE_INTEGER
      ? (currentLang === 'vi' ? `Từ ${fmtM(t.min_revenue_kip)} triệu KIP trở lên` : `ຕັ້ງແຕ່ ${fmtM(t.min_revenue_kip)} ລ້ານກີບ ຂຶ້ນໄປ`)
      : (currentLang === 'vi' ? `${fmtM(t.min_revenue_kip)} – dưới ${fmtM(t.max_revenue_kip)} triệu KIP` : `${fmtM(t.min_revenue_kip)} – ຕ່ຳກວ່າ ${fmtM(t.max_revenue_kip)} ລ້ານກີບ`);
    const detail = currentLang === 'vi'
      ? `5% ngay + ${t.quarter_end_reward}% cuối quý`
      : `5% ທັນທີ + ${t.quarter_end_reward}% ທ້າຍໄຕມາດ`;
    const sel = targetTierId === t.tier_id ? ' selected' : '';
    return `<button type="button" class="tier-target-card${sel}" data-tier="${t.tier_id}" onclick="selectTargetTier('${t.tier_id}')">
      <span class="ttc-name">${name}</span>
      <span class="ttc-range">${range}</span>
      <span class="ttc-detail">${detail}</span>
      <span class="ttc-total">${t.total_benefit}%</span>
    </button>`;
  }).join('');
  updateTierBenefitPreview();
}

function selectTargetTier(tierId) {
  targetTierId = tierId;
  renderProgramTiersTable();
  const btn = document.getElementById('btn-unlock-wheel');
  if (btn) btn.disabled = false;
}

// Concrete money preview for the chosen tier — makes the program tangible
function updateTierBenefitPreview() {
  const box = document.getElementById('tier-benefit-preview');
  if (!box) return;
  if (!targetTierId) { box.style.display = 'none'; return; }
  const t = NNC_ACCUMULATION_TIERS.find(x => x.tier_id === targetTierId);
  if (!t) return;
  // Illustrative revenue: lower bound of the tier (unbounded top tier uses its floor)
  const exampleRev = t.min_revenue_kip;
  const immediate = exampleRev * (t.immediate_discount / 100);
  const quarter = exampleRev * (t.quarter_end_reward / 100);
  const total = immediate + quarter;
  const name = currentLang === 'vi' ? t.name_vi : t.name_lo;
  box.innerHTML = currentLang === 'vi'
    ? `Ví dụ với <strong>${name}</strong>: doanh số ${exampleRev.toLocaleString()} KIP → giảm ngay <strong>${immediate.toLocaleString()} KIP</strong> + thưởng cuối quý <strong>${quarter.toLocaleString()} KIP</strong> = tiết kiệm <strong class="tbp-total">${total.toLocaleString()} KIP</strong>.`
    : `ຕົວຢ່າງ <strong>${name}</strong>: ຍອດ ${exampleRev.toLocaleString()} ກີບ → ຫຼຸດທັນທີ <strong>${immediate.toLocaleString()} ກີບ</strong> + ໂບນັດທ້າຍໄຕມາດ <strong>${quarter.toLocaleString()} ກີບ</strong> = ປະຢັດ <strong class="tbp-total">${total.toLocaleString()} ກີບ</strong>.`;
  box.style.display = 'block';
}

// Program gate: a target tier must be actively chosen
function onProgramAckChange() {
  const acknowledged = document.getElementById('program-ack')?.checked;
  const btn = document.getElementById('btn-unlock-wheel');
  if (btn) btn.disabled = !acknowledged;
}

function confirmProgramViewed() {
  if (!document.getElementById('program-ack')?.checked) return;
  programViewed = true;
  try {
    const saved = sessionStorage.getItem('nnc_b2b_session');
    const data = saved ? JSON.parse(saved) : {};
    data.programViewed = true;
    data.targetTierId = targetTierId;
    sessionStorage.setItem('nnc_b2b_session', JSON.stringify(data));
  } catch (e) { console.error('Session write error:', e); }
  logEvent('program_reviewed');
  setFlowState('wheel');
}

// The selection surface is the only pre-wheel step: derive its active tier
// directly from the quantities instead of asking visitors to repeat a target choice.
function unlockWheelFromSelection() {
  let totalKip = 0;
  PRODUCTS_DATA.forEach(p => { totalKip += (quantities[p.id] || 0) * p.price; });
  const activeTier = [...NNC_ACCUMULATION_TIERS].reverse().find(t => totalKip >= t.min_revenue_kip) || NNC_ACCUMULATION_TIERS[0];
  targetTierId = activeTier.tier_id;
  programViewed = true;
  try {
    const saved = sessionStorage.getItem('nnc_b2b_session');
    const data = saved ? JSON.parse(saved) : {};
    data.programViewed = true;
    data.targetTierId = targetTierId;
    sessionStorage.setItem('nnc_b2b_session', JSON.stringify(data));
  } catch (e) { console.error('Session write error:', e); }
  logEvent('selection_confirmed', { targetTier: targetTierId, totalKip });
  setFlowState('wheel');
}

// Completion screen: show tier progress based on the reference order just built
function renderCompletionTierProgress() {
  const box = document.getElementById('completion-tier-progress');
  if (!box) return;
  let totalKip = 0;
  PRODUCTS_DATA.forEach(p => { totalKip += (quantities[p.id] || 0) * p.price; });

  if (totalKip <= 0) {
    box.innerHTML = currentLang === 'vi'
      ? 'Bắt đầu nhập hàng trong Q3 để tích lũy doanh số — chỉ từ <strong>2.000.000 KIP</strong> là đạt Bậc 1 (tổng lợi ích 7%).'
      : 'ເລີ່ມສັ່ງຊື້ໃນໄຕມາດ 3 ເພື່ອສະສົມຍອດຂາຍ — ພຽງ <strong>2.000.000 ກີບ</strong> ກໍຮອດຂັ້ນ 1 (ຜົນປະໂຫຍດລວມ 7%).';
    return;
  }

  let activeTier = null;
  for (let i = NNC_ACCUMULATION_TIERS.length - 1; i >= 0; i--) {
    if (totalKip >= NNC_ACCUMULATION_TIERS[i].min_revenue_kip) { activeTier = NNC_ACCUMULATION_TIERS[i]; break; }
  }
  // Prefer the customer's own chosen target; fall back to next tier up
  const chosen = targetTierId ? NNC_ACCUMULATION_TIERS.find(x => x.tier_id === targetTierId) : null;
  let nextTier = activeTier
    ? NNC_ACCUMULATION_TIERS[NNC_ACCUMULATION_TIERS.indexOf(activeTier) + 1]
    : NNC_ACCUMULATION_TIERS[0];
  if (chosen && totalKip < chosen.min_revenue_kip) nextTier = chosen;

  const tierName = activeTier ? (currentLang === 'vi' ? activeTier.name_vi : activeTier.name_lo) : (currentLang === 'vi' ? 'Chưa đạt bậc' : 'ຍັງບໍ່ຮອດຂັ້ນ');
  let html = currentLang === 'vi'
    ? `Đơn tham khảo của anh/chị: <strong>${totalKip.toLocaleString()} KIP</strong> — đang ở <strong>${tierName}</strong>.`
    : `ບິນອ້າງອີງຂອງທ່ານ: <strong>${totalKip.toLocaleString()} ກີບ</strong> — ຢູ່ <strong>${tierName}</strong>.`;
  if (nextTier) {
    const diff = nextTier.min_revenue_kip - totalKip;
    const nname = currentLang === 'vi' ? nextTier.name_vi : nextTier.name_lo;
    html += currentLang === 'vi'
      ? ` Nhập thêm <strong>${diff.toLocaleString()} KIP</strong> trong quý để lên <strong>${nname}</strong> (tổng lợi ích ${nextTier.total_benefit}%).`
      : ` ສັ່ງຊື້ເພີ່ມ <strong>${diff.toLocaleString()} ກີບ</strong> ໃນໄຕມາດ ເພື່ອຂຶ້ນ <strong>${nname}</strong> (ຜົນປະໂຫຍດລວມ ${nextTier.total_benefit}%).`;
  }
  box.innerHTML = html;
}

// Switch Language
function switchLanguage(lang) {
  // re-render dynamic blocks after applying translations (deferred below)
  currentLang = lang;
  document.documentElement.lang = lang;
  document.getElementById('btn-lang-vi').className = lang === 'vi' ? 'active' : '';
  document.getElementById('btn-lang-lo').className = lang === 'lo' ? 'active' : '';
  
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (TRANSLATIONS[lang][key]) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.setAttribute('placeholder', TRANSLATIONS[lang][key]);
      } else {
        el.innerHTML = TRANSLATIONS[lang][key];
      }
    }
  });

  renderProducts();
  renderSurveyChips();
  renderProgramTiersTable();
  updateWheelLockVisual();
  updateSimulation(simulatedRevenue);
  drawLuckyWheel();
  updateStepperVisual();

  // If in cart step, refresh order rows text
  if (flowState === 'cart') {
    renderOrderProductsList();
    calculateOrderTotals();
  }

  // Update validation status message lang if validated
  const codeInput = document.getElementById('referralCode');
  const statusEl = document.getElementById('referral-status-msg');
  if (codeInput && codeInput.disabled && statusEl) {
    statusEl.innerText = TRANSLATIONS[currentLang]['form.referral_valid'];
  }

  // Update countdown clock labels
  const daysEl = document.getElementById('days');
  if (daysEl) {
    daysEl.nextElementSibling.innerText = lang === 'vi' ? 'ngày' : 'ວັນ';
    document.getElementById('hours').nextElementSibling.innerText = lang === 'vi' ? 'giờ' : 'ຊົ່ວໂມງ';
    document.getElementById('minutes').nextElementSibling.innerText = lang === 'vi' ? 'phút' : 'ນາທີ';
    document.getElementById('seconds').nextElementSibling.innerText = lang === 'vi' ? 'giây' : 'ວິນາທີ';
  }
}

// Render Products catalog grid
function renderProducts() {
  const flagshipContainer = document.getElementById('flagship-products-grid');
  const supportContainer = document.getElementById('support-products-grid');
  if (!flagshipContainer || !supportContainer) return;
  
  let flagshipHtml = '';
  let supportHtml = '';

  const flagships = ['tadimax', 'cv-mox-1000', 'nc-cv-mox-625'];

  PRODUCTS_DATA.forEach(p => {
    const badge = currentLang === 'vi' ? p.badgeVi : p.badgeLo;
    const desc = currentLang === 'vi' ? p.descVi : p.descLo;
    const isFlagship = flagships.includes(p.id);
    const isInterested = interestedProductsSet.has(p.id);
    
    const actionBtnHtml = isInterested 
      ? `<button type="button" class="btn-card-view font-black" style="background-color:#10b981; color:white; border-color:#10b981;" onclick="toggleInterestFromCard('${p.id}')">✓</button>`
      : `<button type="button" class="btn-card-view" onclick="showProductModal('${p.id}')">
          <svg class="icon-eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>`;

    const cardHtml = `
      <div class="product-card" id="card-${p.id}" style="${isInterested ? 'border-color: #34d399; box-shadow: 0 20px 40px rgba(16, 185, 129, 0.1);' : ''}">
        <div class="product-card-visual" onclick="showProductModal('${p.id}')">
          <span class="product-card-badge">${badge}</span>
          <span class="product-number-badge">${String(PRODUCTS_DATA.indexOf(p) + 1).padStart(2, '0')}</span>
          <img src="${p.image}" alt="${p.name}" class="product-card-img" onerror="this.src='images/nnc-logo-160.webp'">
        </div>
        <div class="product-card-info">
          <h3 class="product-card-name" onclick="showProductModal('${p.id}')">${p.name}</h3>
          <span class="product-card-pack">${p.pack}</span>
          <p class="product-card-desc">${desc.substring(0, 105)}...</p>
          <div class="product-card-bottom">
            <div class="product-card-price">
              <span data-i18n="products.price_label">Đại lý KIP</span>
              <strong>${p.price.toLocaleString()} KIP</strong>
            </div>
            ${actionBtnHtml}
          </div>
        </div>
      </div>
    `;
    
    if (isFlagship) {
      flagshipHtml += cardHtml;
    } else {
      supportHtml += cardHtml;
    }
  });
  
  flagshipContainer.innerHTML = flagshipHtml;
  supportContainer.innerHTML = supportHtml;
}

// Quick survey chips (products of interest) inside the registration form
function renderSurveyChips() {
  const wrap = document.getElementById('survey-products-chips');
  if (!wrap) return;
  wrap.innerHTML = PRODUCTS_DATA.map(p => {
    const active = interestedProductsSet.has(p.id) ? ' active' : '';
    const name = p.name;
    return `<button type="button" class="survey-chip${active}" data-pid="${p.id}" onclick="toggleSurveyChip('${p.id}')">${name}</button>`;
  }).join('');
}

function toggleSurveyChip(productId) {
  if (interestedProductsSet.has(productId)) {
    interestedProductsSet.delete(productId);
  } else {
    interestedProductsSet.add(productId);
  }
  renderSurveyChips();
  // keep product-card hearts in sync
  if (typeof renderProducts === 'function') renderProducts();
}

function toggleInterestFromCard(productId) {
  if (interestedProductsSet.has(productId)) {
    interestedProductsSet.delete(productId);
  } else {
    interestedProductsSet.add(productId);
  }
  renderProducts();
}

// Product Details Modal
function showProductModal(productId) {
  const p = PRODUCTS_DATA.find(item => item.id === productId);
  if (!p) return;
  
  selectedModalProductId = productId;
  document.getElementById('modal-product-img').src = p.image;
  document.getElementById('modal-product-img').onerror = function() { this.src = 'images/nnc-logo-160.webp'; };
  document.getElementById('modal-product-name').innerText = p.name;
  document.getElementById('modal-product-cat').innerText = p.category === 'herbal' ? (currentLang === 'vi' ? 'Thảo dược' : 'ຢາສະໝຸນໄພ') : (currentLang === 'vi' ? 'Kháng sinh' : 'ຢາຕ້ານເຊື້ອ');
  document.getElementById('modal-product-desc').innerText = currentLang === 'vi' ? p.descVi : p.descLo;
  document.getElementById('modal-product-formulation').innerText = p.formulation;
  document.getElementById('modal-product-pack').innerText = p.pack;
  document.getElementById('modal-product-price').innerText = p.price.toLocaleString() + ' KIP';
  
  updateModalInterestButton();
  document.getElementById('product-modal').classList.add('active');
}

function hideProductModal() {
  document.getElementById('product-modal').classList.remove('active');
}

function closeProductModal(e) {
  hideProductModal();
}

function updateModalInterestButton() {
  const btn = document.getElementById('modal-interest-btn');
  const isInterested = interestedProductsSet.has(selectedModalProductId);
  
  if (isInterested) {
    btn.className = 'btn-toggle-interest selected';
    btn.innerText = currentLang === 'vi' ? '✓ Đang quan tâm sản phẩm này' : '✓ ສົນໃຈຜະລິດຕະພັນນີ້ແລ້ວ';
  } else {
    btn.className = 'btn-toggle-interest';
    btn.innerText = currentLang === 'vi' ? 'Tôi quan tâm sản phẩm này' : 'ຂ້ອຍສົນໃຈຜະລິດຕະພັນນີ້';
  }
}

function toggleModalProductInterest() {
  if (interestedProductsSet.has(selectedModalProductId)) {
    interestedProductsSet.delete(selectedModalProductId);
  } else {
    interestedProductsSet.add(selectedModalProductId);
  }
  updateModalInterestButton();
  renderProducts();
}

// Accumulation Profit Simulator
function setSimulatedRevenue(val) {
  document.getElementById('revenue-slider').value = val;
  updateSimulation(val);
}

function updateSimulation(value) {
  simulatedRevenue = parseInt(value);
  document.getElementById('sim-revenue-text').innerText = simulatedRevenue.toLocaleString() + ' KIP';
  
  let directRate = 0.05;
  let quarterRate = 0;
  let tierName = '';
  let nextTierMin = 0;
  let nextTierName = '';
  let nextTierRate = 0;

  if (simulatedRevenue >= 25000000) {
    quarterRate = 0.05;
    tierName = currentLang === 'vi' ? 'Bậc 4 (Thưởng lũy tiến tối đa)' : 'ຂັ້ນ 4 (ໂບນັດສູງສຸດ)';
  } else if (simulatedRevenue >= 12000000) {
    quarterRate = 0.04;
    tierName = currentLang === 'vi' ? 'Bậc 3' : 'ຂັ້ນ 3';
    nextTierMin = 25000000;
    nextTierName = currentLang === 'vi' ? 'Bậc 4' : 'ຂັ້ນ 4';
    nextTierRate = 5;
  } else if (simulatedRevenue >= 6000000) {
    quarterRate = 0.03;
    tierName = currentLang === 'vi' ? 'Bậc 2' : 'ຂັ້ນ 2';
    nextTierMin = 12000000;
    nextTierName = currentLang === 'vi' ? 'Bậc 3' : 'ຂັ້ນ 3';
    nextTierRate = 4;
  } else if (simulatedRevenue >= 2000000) {
    quarterRate = 0.02;
    tierName = currentLang === 'vi' ? 'Bậc 1' : 'ຂັ້ນ 1';
    nextTierMin = 6000000;
    nextTierName = currentLang === 'vi' ? 'Bậc 2' : 'ຂັ້ນ 2';
    nextTierRate = 3;
  } else {
    quarterRate = 0;
    tierName = currentLang === 'vi' ? 'Chưa đạt Bậc tích lũy' : 'ບໍ່ທັນຮອດຂັ້ນສະສົມ';
    nextTierMin = 2000000;
    nextTierName = currentLang === 'vi' ? 'Bậc 1' : 'ຂັ້ນ 1';
    nextTierRate = 2;
  }

  const immediateDiscount = simulatedRevenue * directRate;
  const quarterReward = simulatedRevenue * quarterRate;
  const totalSavings = immediateDiscount + quarterReward;

  document.getElementById('sim-immediate-val').innerText = immediateDiscount.toLocaleString() + ' KIP';
  document.getElementById('sim-quarter-rate').innerText = `(${Math.round(quarterRate * 100)}%)`;
  document.getElementById('sim-quarter-val').innerText = quarterReward.toLocaleString() + ' KIP';
  document.getElementById('sim-total-val').innerText = totalSavings.toLocaleString() + ' KIP';
  document.getElementById('sim-tier-name-badge').innerText = (currentLang === 'vi' ? 'Bậc tích lũy dự kiến: ' : 'ຂັ້ນສະສົມທີ່ຄາດໄວ້: ') + tierName;

  const nudgeBox = document.getElementById('next-tier-nudge-box');
  if (nudgeBox) {
    if (nextTierMin > 0) {
      const diff = nextTierMin - simulatedRevenue;
      const msg = currentLang === 'vi'
        ? `Nhập sỉ thêm <strong>${diff.toLocaleString()} KIP</strong> để đạt <strong>${nextTierName}</strong> (Tăng thưởng cuối quý lên <strong>${nextTierRate}%</strong>).`
        : `ສັ່ງຊື້ເພີ່ມ <strong>${diff.toLocaleString()} KIP</strong> ເພື່ອຂຶ້ນ <strong>${nextTierName}</strong> (ເພີ່ມໂບນັດທ້າຍໄຕມາດເປັນ <strong>${nextTierRate}%</strong>).`;
      nudgeBox.innerHTML = msg;
      nudgeBox.style.display = 'block';
    } else {
      nudgeBox.style.display = 'none';
    }
  }
}

// Referral Code validation & locking logic
function validateReferralCode() {
  const input = document.getElementById('referralCode');
  const btn = document.getElementById('btn-validate-ref');
  const statusEl = document.getElementById('referral-status-msg');
  if (!input || !btn || !statusEl) return;
  
  const val = input.value.trim();
  if (val.length < 4) {
    statusEl.innerText = TRANSLATIONS[currentLang]['form.referral_invalid'];
    statusEl.className = 'referral-status-msg error';
    return;
  }
  
  // Lock input and validate
  input.disabled = true;
  btn.disabled = true;
  statusEl.innerText = TRANSLATIONS[currentLang]['form.referral_valid'];
  statusEl.className = 'referral-status-msg success';
  referralLocked = true;
}

// Handle Form registration submission
function handleFormSubmit(e) {
  e.preventDefault();
  
  const fullname = document.getElementById('fullname').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const business = document.getElementById('businessName').value.trim();
  const province = document.getElementById('province').value.trim();
  const refCode = document.getElementById('referralCode').value.trim();
  
  if (!fullname) {
    alert(currentLang === 'vi' ? 'Vui lòng nhập Họ và tên người phụ trách!' : 'ກະລຸນາປ້ອນ ຊື່ ແລະ ນາມສະກຸນ!');
    document.getElementById('fullname').focus();
    return;
  }
  
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  if (!phone || cleanPhone.length < 8) {
    alert(currentLang === 'vi' ? 'Vui lòng nhập số điện thoại hợp lệ (tối thiểu 8 chữ số)!' : 'ກະລຸນາປ້ອນ ເບີໂທລະສັບ ທີ່ຖືກຕ້ອງ (ຢ່າງຕ່ຳ 8 ຕົວເລກ)!');
    document.getElementById('phone').focus();
    return;
  }

  if (!business) {
    alert(currentLang === 'vi' ? 'Vui lòng nhập Tên Nhà thuốc / Phòng khám!' : 'ກະລຸນາປ້ອນ ຊື່ຮ້ານຢາ / ຄລີນິກ!');
    document.getElementById('businessName').focus();
    return;
  }

  if (!province) {
    alert(currentLang === 'vi' ? 'Vui lòng nhập Tỉnh / Thành phố!' : 'ກະລຸນາປ້ອນ ແຂວງ / ນະຄອນ!');
    document.getElementById('province').focus();
    return;
  }

  const contactRadio = document.querySelector('input[name="preferredContact"]:checked');
  const preferredContact = contactRadio ? contactRadio.value : 'whatsapp';

  const surveyInterests = Array.from(interestedProductsSet);
  registrationInfo = { fullname, phone, business, province, refCode, preferredContact, surveyInterests };
  
  // Generate a mock participant ID
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  participantId = `wa-nnc-${Date.now().toString(36)}-${randomSuffix}`;
  
  // Save in session storage safely
  try {
    sessionStorage.setItem('nnc_b2b_session', JSON.stringify({ 
      registrationInfo, 
      participantId,
      referralLocked,
      rewardResultId: rewardResult ? rewardResult.id : null 
    }));
  } catch (err) {
    console.error('Session write error:', err);
  }

  // Pre-fill interests checklist in the order form with catalog selections
  PRODUCTS_DATA.forEach(p => {
    quantities[p.id] = interestedProductsSet.has(p.id) ? 1 : 0;
  });

  logEvent('register');

  // Move to mandatory program-review step (gate B)
  setFlowState('program');
}

// Draw HTML5 Canvas Lucky Wheel (6 Segments)
function drawLuckyWheel() {
  const canvas = document.getElementById('lucky-wheel-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  const center = size / 2;
  const radius = center - 10;
  const numSegments = WHEEL_SEGMENTS.length;
  const anglePerSegment = (Math.PI * 2) / numSegments;
  
  ctx.clearRect(0, 0, size, size);
  
  WHEEL_SEGMENTS.forEach((seg, i) => {
    const startAngle = i * anglePerSegment;
    const endAngle = startAngle + anglePerSegment;
    
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = seg.color;
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(startAngle + anglePerSegment / 2);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = seg.textColor;
    ctx.font = `bold ${currentLang === 'lo' ? '10px' : '11px'} 'Inter', sans-serif`;
    
    const text = currentLang === 'vi' ? seg.nameVi : seg.nameLo;
    ctx.fillText(text, radius - 20, 0);
    ctx.restore();
  });
  
  // Center Pin
  ctx.beginPath();
  ctx.arc(center, center, 24, 0, Math.PI * 2);
  ctx.fillStyle = '#d9b45e';
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 8;
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(center, center, 14, 0, Math.PI * 2);
  ctx.fillStyle = '#f59e0b';
  ctx.fill();
}

// Spin Wheel interaction
function spinWheel() {
  if (isSpinning) return;

  // Funnel gate: registration + program review required before spinning
  if (flowState === 'discover') {
    setFlowState('register');
    return;
  }
  if (flowState === 'register') {
    scrollToId('funnel-content-section');
    return;
  }
  if (flowState === 'program') {
    scrollToId('program-card');
    return;
  }
  if (flowState !== 'wheel' || hasSpun) return;

  isSpinning = true;
  const spinBtn = document.getElementById('btn-spin-wheel');
  if (spinBtn) {
    spinBtn.disabled = true;
    spinBtn.classList.remove('pulse-border');
  }
  
  const numSegments = WHEEL_SEGMENTS.length;
  // Weighted random pick (weight per segment; falls back to uniform)
  const totalWeight = WHEEL_SEGMENTS.reduce((sum, seg) => sum + (seg.weight || 1), 0);
  let roll = Math.random() * totalWeight;
  let targetIndex = 0;
  for (let i = 0; i < numSegments; i++) {
    roll -= (WHEEL_SEGMENTS[i].weight || 1);
    if (roll <= 0) { targetIndex = i; break; }
  }
  const targetSegmentCenterAngle = (targetIndex + 0.5) * (360 / numSegments);
  let segmentOffsetAngle = 270 - targetSegmentCenterAngle;
  if (segmentOffsetAngle < 0) {
    segmentOffsetAngle += 360;
  }
  const totalTargetRotation = 1800 + segmentOffsetAngle;
  
  const canvasWrapper = document.querySelector('.wheel-outer-ring');
  canvasWrapper.style.transition = 'transform 4.5s cubic-bezier(0.1, 0.8, 0.15, 1)';
  canvasWrapper.style.transform = `rotate(${totalTargetRotation}deg)`;
  
  rewardResult = WHEEL_SEGMENTS[targetIndex];
  
  // Save result in session storage safely
  try {
    const saved = sessionStorage.getItem('nnc_b2b_session');
    if (saved) {
      const data = JSON.parse(saved);
      data.rewardResultId = rewardResult.id;
      sessionStorage.setItem('nnc_b2b_session', JSON.stringify(data));
    }
  } catch (e) {
    console.error('Session write error during spin:', e);
  }
  
  setTimeout(() => {
    isSpinning = false;
    hasSpun = true;
    updateWheelLockVisual();
    logEvent('spin_result');
    showResultModal(rewardResult.id);
  }, 4700);
}

// Show Result Pop-up
function showResultModal(rewardId) {
  const details = REWARD_DETAILS[rewardId];
  const name = currentLang === 'vi' ? details.nameVi : details.nameLo;
  const cond = currentLang === 'vi' ? details.condVi : details.condLo;
  
  document.getElementById('result-reward-name').innerText = name;
  document.getElementById('result-reward-condition').innerText = cond;
  
  const code = getMyReferralCode();
  document.getElementById('my-referral-code').innerText = code;
  document.getElementById('my-referral-link').innerText = `${window.location.origin}/?ref=${code}`;
  
  document.getElementById('result-modal').classList.add('active');
}

function proceedToCartStep() {
  document.getElementById('result-modal').classList.remove('active');
  setFlowState('cart');
}

// Stepper navigation / focus
function focusWheel() {
  if (flowState === 'discover') {
    setFlowState('register');
  } else if (flowState === 'register') {
    scrollToId('funnel-content-section');
  } else {
    scrollToId('target-wheel-box');
    const btn = document.getElementById('btn-spin-wheel');
    if (btn) {
      btn.style.animation = 'none';
      void btn.offsetWidth;
      btn.style.animation = 'wiggle-spin-btn 0.5s ease-in-out';
    }
  }
}

// Order Form checklist generator
function renderOrderProductsList() {
  const container = document.getElementById('order-products-list');
  if (!container) return;
  
  let html = '';
  PRODUCTS_DATA.forEach(p => {
    const qty = quantities[p.id] || 0;
    const itemTotal = qty * p.price;
    html += `
      <li class="order-product-item" id="order-item-${p.id}">
        <div class="order-item-visual">
          <img src="${p.image}" alt="${p.name}" onerror="this.src='images/nnc-logo-160.webp'">
        </div>
        <div class="order-item-details">
          <h4>${p.name}</h4>
          <span class="pack-size">${p.pack}</span>
          <span class="unit-price">${p.price.toLocaleString()} KIP</span>
        </div>
        <div class="order-item-controls">
          <div class="qty-total-mobile sm-hidden">
            <span>Total: ${itemTotal.toLocaleString()} KIP</span>
          </div>
          <div class="qty-control-buttons">
            <button type="button" class="btn-qty-minus" onclick="changeOrderQty('${p.id}', -1)">−</button>
            <input type="number" class="qty-input" value="${qty}" min="0" onchange="setOrderQty('${p.id}', this.value)" style="width:40px; text-align:center; border:none; font-weight:700; font-family:var(--font-mono); font-size:1rem; -moz-appearance:textfield; outline:none; background:transparent;" />
            <button type="button" class="btn-qty-plus" onclick="changeOrderQty('${p.id}', 1)">+</button>
          </div>
          <div class="qty-total-desktop md-visible">
            <span>${itemTotal.toLocaleString()} KIP</span>
          </div>
        </div>
      </li>
    `;
  });
  container.innerHTML = html;
}

function setOrderQty(productId, value) {
  let val = parseInt(value, 10);
  if (isNaN(val) || val < 0) val = 0;
  quantities[productId] = val;
  renderOrderProductsList();
  calculateOrderTotals();
}

function changeOrderQty(productId, delta) {
  if (quantities[productId] === undefined) quantities[productId] = 0;
  quantities[productId] = Math.max(0, quantities[productId] + delta);
  renderOrderProductsList();
  calculateOrderTotals();
}

function calculateOrderTotals() {
  let totalKip = 0;
  PRODUCTS_DATA.forEach(p => {
    const qty = quantities[p.id] || 0;
    totalKip += qty * p.price;
  });
  
  // Determine tier
  let activeTier = null;
  for (let i = NNC_ACCUMULATION_TIERS.length - 1; i >= 0; i--) {
    if (totalKip >= NNC_ACCUMULATION_TIERS[i].min_revenue_kip) {
      activeTier = NNC_ACCUMULATION_TIERS[i];
      break;
    }
  }

  const invoiceBox = document.getElementById('order-invoice-box');
  const formCard = document.getElementById('order-form-card');
  
  if (invoiceBox) {
    if (activeTier && activeTier.immediate_discount > 0) {
      const discountAmount = totalKip * (activeTier.immediate_discount / 100);
      const finalAmount = totalKip - discountAmount;
      const tierName = currentLang === 'vi' ? activeTier.name_vi : activeTier.name_lo;
      
      invoiceBox.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:12px;">
          <div class="invoice-header" style="margin-bottom:0;">${currentLang === 'vi' ? 'TỔNG QUAN ĐƠN HÀNG' : 'ລວມບິນສັ່ງຊື້'}</div>
          <div style="font-weight:900; font-size:1.05rem; color:#059669; text-transform:uppercase;">${tierName}</div>
        </div>
        <div class="invoice-row text-muted">
          <span>${currentLang === 'vi' ? 'Tổng tiền hàng:' : 'ມູນຄ່າສິນຄ້າ:'}</span>
          <span>${totalKip.toLocaleString()} KIP</span>
        </div>
        <div class="invoice-row discount-row">
          <span>${currentLang === 'vi' ? 'Chiết khấu' : 'ສ່ວນຫຼຸດ'} (${activeTier.immediate_discount}%):</span>
          <span>- ${discountAmount.toLocaleString()} KIP</span>
        </div>
        <div class="invoice-divider"></div>
        <div class="invoice-row total-row">
          <span>${currentLang === 'vi' ? 'TỔNG THANH TOÁN:' : 'ຍອດລວມທີ່ຕ້ອງຈ່າຍ:'}</span>
          <span>${finalAmount.toLocaleString()} KIP</span>
        </div>
        <div class="invoice-bonus">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>
          ${currentLang === 'vi' ? 'Quyền lợi thêm:' : 'ສິດທິປະໂຫຍດເພີ່ມເຕີມ:'} ${currentLang === 'vi' ? 'Thưởng cuối quý' : 'ລາງວັນທ້າຍໄຕມາດ'} ${activeTier.quarter_end_reward}%
        </div>
      `;
      formCard.classList.add('tier-active-theme');
    } else {
      invoiceBox.innerHTML = `
        <div class="invoice-header">${currentLang === 'vi' ? 'TỔNG QUAN ĐƠN HÀNG' : 'ລວມບິນສັ່ງຊື້'}</div>
        <div class="invoice-row total-row" style="margin-top:8px;">
          <span>${currentLang === 'vi' ? 'Tổng thanh toán:' : 'ຍອດລວມທີ່ຕ້ອງຈ່າຍ:'}</span>
          <span>${totalKip.toLocaleString()} KIP</span>
        </div>
        <div class="invoice-bonus text-muted" style="background:transparent; border:none; padding:0; margin-top:12px; font-weight:500;">
          ${currentLang === 'vi' ? 'Chưa đạt mức tích lũy tối thiểu (2.000.000 KIP)' : 'ຍັງບໍ່ບັນລຸຂັ້ນສະສົມຂັ້ນຕ່ຳ (2.000.000 KIP)'}
        </div>
      `;
      formCard.classList.remove('tier-active-theme');
    }

    // Append target tier nudge inside invoice box if applicable
    if (targetTierId) {
      const target = NNC_ACCUMULATION_TIERS.find(x => x.tier_id === targetTierId);
      if (target) {
        const tName = currentLang === 'vi' ? target.name_vi : target.name_lo;
        let nudgeHtml = '';
        if (totalKip >= target.min_revenue_kip) {
          nudgeHtml = currentLang === 'vi'
            ? `<div class="order-target-nudge reached">🎯 Đơn này đã đạt mục tiêu <strong>${tName}</strong> anh/chị chọn (tổng lợi ích ${target.total_benefit}%).</div>`
            : `<div class="order-target-nudge reached">🎯 ບິນນີ້ບັນລຸເປົ້າໝາຍ <strong>${tName}</strong> ທີ່ທ່ານເລືອກ (ຜົນປະໂຫຍດ ${target.total_benefit}%).</div>`;
        } else {
          const diff = target.min_revenue_kip - totalKip;
          nudgeHtml = currentLang === 'vi'
            ? `<div class="order-target-nudge">🎯 Mục tiêu anh/chị đã chọn: <strong>${tName}</strong> — đơn này còn thiếu <strong>${diff.toLocaleString()} KIP</strong> để đạt (doanh số tích lũy cả quý).</div>`
            : `<div class="order-target-nudge">🎯 ເປົ້າໝາຍທີ່ທ່ານເລືອກ: <strong>${tName}</strong> — ບິນນີ້ຍັງຂາດ <strong>${diff.toLocaleString()} ກີບ</strong> (ນັບຍອດສະສົມທັງໄຕມາດ).</div>`;
        }
        invoiceBox.innerHTML += nudgeHtml;
      }
    }
  }
}

// PDF rules viewer modal toggles
function openRulesPdfModal() {
  document.getElementById('rules-pdf-modal').classList.add('active');
}
function hideRulesPdfModal() {
  document.getElementById('rules-pdf-modal').classList.remove('active');
}
function closeRulesPdfModal(e) {
  hideRulesPdfModal();
}

// Invoice Preview canvas modal toggles
function openInvoicePreview() {
  document.getElementById('invoice-preview-modal').classList.add('active');
  generateInvoicePreview();
}
function hideInvoicePreviewModal() {
  document.getElementById('invoice-preview-modal').classList.remove('active');
}
function closeInvoicePreviewModal(e) {
  hideInvoicePreviewModal();
}

// Generate Invoice Preview on HTML5 Canvas
function generateInvoicePreview() {
  const canvas = document.getElementById('invoice-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  const width = 1240;
  const height = 1754;
  canvas.width = width;
  canvas.height = height;
  
  // Fill background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  
  // Brand Header
  ctx.fillStyle = '#0f5d49';
  ctx.fillRect(0, 0, width, 180);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('NNC PHARMA CO., LTD.', width / 2, 80);
  
  const isLao = currentLang === 'lo';
  ctx.font = 'normal 32px sans-serif';
  ctx.fillText(isLao ? 'ໃບສັ່ງຊື້ອ້າງອີງ (B2B Q3/2026)' : 'ĐƠN HÀNG THAM KHẢO (B2B Q3/2026)', width / 2, 140);
  
  // Info block
  ctx.fillStyle = '#102a24';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(isLao ? 'ຂໍ້ມູນລູກຄ້າ / Thông tin khách hàng' : 'Thông tin khách hàng / ຂໍ້ມູນລູກຄ້າ', 80, 260);
  
  ctx.font = 'normal 24px sans-serif';
  ctx.fillText(`${isLao ? 'ຊື່' : 'Họ tên'}: ${registrationInfo.fullname}`, 80, 310);
  ctx.fillText(`${isLao ? 'ເbີໂທ' : 'SĐT'}: ${registrationInfo.phone}`, 80, 350);
  ctx.fillText(`${isLao ? 'ຫົວໜ່ວຍ' : 'Đơn vị'}: ${registrationInfo.business}`, 80, 390);
  ctx.fillText(`${isLao ? 'ແຂວງ' : 'Tỉnh/TP'}: ${registrationInfo.province}`, 80, 430);
  
  const code = getMyReferralCode();
  ctx.fillText(`${isLao ? 'ລະຫັດແນະນຳ' : 'Mã giới thiệu'}: ${code}`, 650, 310);
  ctx.fillText(`${isLao ? 'ລະຫັດເຂົ້າຮ່ວມ' : 'Mã tham gia'}: ${participantId}`, 650, 350);
  ctx.fillText(`${isLao ? 'ສິດທິອ້າງອີງ' : 'Quyền lợi'}: ${rewardResult ? (isLao ? rewardResult.nameLo : rewardResult.nameVi) : 'N/A'}`, 650, 390);
  
  // Table headers
  const startY = 520;
  ctx.fillStyle = '#f3f4f6';
  ctx.fillRect(80, startY, width - 160, 60);
  
  ctx.fillStyle = '#374151';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('STT', 100, startY + 40);
  ctx.fillText(isLao ? 'ສິນຄ້າ' : 'Sản phẩm', 180, startY + 40);
  ctx.fillText(isLao ? 'ຈຳນວນ' : 'Số lượng', 700, startY + 40);
  ctx.fillText(isLao ? 'ລາຄາ' : 'Đơn giá', 850, startY + 40);
  ctx.fillText(isLao ? 'ລວມ (KIP)' : 'Thành tiền', 1000, startY + 40);
  
  let currentY = startY + 100;
  let index = 1;
  let totalKip = 0;
  
  PRODUCTS_DATA.forEach((p) => {
    const qty = quantities[p.id] || 0;
    if (qty > 0) {
      const rowTotal = qty * p.price;
      totalKip += rowTotal;
      
      ctx.fillStyle = '#111827';
      ctx.font = 'normal 24px sans-serif';
      ctx.fillText(index.toString(), 100, currentY);
      ctx.fillText(p.name, 180, currentY);
      
      ctx.fillStyle = '#6b7280';
      ctx.font = 'normal 20px sans-serif';
      ctx.fillText(p.pack, 180, currentY + 30);
      
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(qty.toString(), 700, currentY);
      ctx.fillText(p.price.toLocaleString(), 850, currentY);
      ctx.fillText(rowTotal.toLocaleString(), 1000, currentY);
      
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(80, currentY + 50);
      ctx.lineTo(width - 80, currentY + 50);
      ctx.stroke();
      
      currentY += 90;
      index++;
    }
  });
  
  if (index === 1) {
    ctx.fillStyle = '#6b7280';
    ctx.font = 'italic 24px sans-serif';
    ctx.fillText(isLao ? '(ຍັງບໍ່ມີສິນຄ້າ)' : '(Chưa có sản phẩm)', 180, currentY);
    currentY += 90;
  }
  
  currentY += 20;
  ctx.fillStyle = '#103e32';
  ctx.font = 'bold 32px sans-serif';
  ctx.fillText(isLao ? 'ຍອດລວມ:' : 'Tổng cộng:', 700, currentY);
  ctx.fillText(`${totalKip.toLocaleString()} KIP`, 950, currentY);
  
  let activeTier = null;
  for (let i = NNC_ACCUMULATION_TIERS.length - 1; i >= 0; i--) {
    if (totalKip >= NNC_ACCUMULATION_TIERS[i].min_revenue_kip) {
      activeTier = NNC_ACCUMULATION_TIERS[i];
      break;
    }
  }
  
  currentY += 60;
  ctx.fillStyle = '#059669';
  ctx.font = 'bold 24px sans-serif';
  if (activeTier) {
    ctx.fillText(`${isLao ? 'ບັນລຸ' : 'Đạt'}: ${isLao ? activeTier.name_lo : activeTier.name_vi}`, 700, currentY);
    ctx.fillStyle = '#4b5563';
    ctx.font = 'normal 20px sans-serif';
    ctx.fillText(`(CK: ${activeTier.immediate_discount}% | ${isLao ? 'ລາງວັນ' : 'Thưởng'}: ${activeTier.quarter_end_reward}%)`, 700, currentY + 35);
  } else {
    ctx.fillText(isLao ? 'ຍັງບໍ່ບັນລຸຂັ້ນສະສົມ' : 'Chưa đạt bậc tích lũy', 700, currentY);
  }
  
  const footerY = height - 120;
  ctx.fillStyle = '#f3f4f6';
  ctx.fillRect(0, footerY, width, 120);
  
  ctx.fillStyle = '#374151';
  ctx.font = 'normal 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(isLao ? 'ໃບສັ່ງຊື້ນີ້ເປັນພຽງຂໍ້ມູນອ້າງອີງ ເພື່ອສະດວກໃນການໃຫ້ຄຳປຶກສາຜ່ານ WhatsApp.' : 'Đơn hàng này chỉ mang tính tham khảo để hỗ trợ tư vấn qua WhatsApp.', width / 2, footerY + 50);
  ctx.fillText(`NNC Pharma Hotline: +8562099806327`, width / 2, footerY + 80);
}

function downloadInvoiceImage() {
  const canvas = document.getElementById('invoice-canvas');
  if (!canvas) return;
  const link = document.createElement('a');
  link.download = `nnc-b2b-order-${registrationInfo.phone}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// Comprehensive WhatsApp message builder aggregating 100% customer journey data
function buildWhatsAppSummary(headline) {
  const isLao = currentLang === 'lo';
  let msg = isLao 
    ? `ສະບາຍດີ NNC Pharma,\n${headline || 'ຂ້ອຍຕ້ອງການຮັບຄຳປຶກສາ B2B Q3/2026'}:\n\n`
    : `Xin chào NNC Pharma,\n${headline || 'Tôi muốn tư vấn chương trình B2B Q3/2026'}:\n\n`;

  // 1. Customer Info
  if (registrationInfo) {
    msg += isLao 
      ? `👤 ຂໍ້ມູນລູກຄ້າ:\n- ຊື່: ${registrationInfo.fullname}\n- ເບີໂທ: ${registrationInfo.phone}\n- ຮ້ານ/ຄລີນິກ: ${registrationInfo.business}\n- ແຂວງ: ${registrationInfo.province}\n`
      : `👤 THÔNG TIN KHÁCH HÀNG:\n- Họ tên: ${registrationInfo.fullname}\n- SĐT: ${registrationInfo.phone}\n- Cơ sở: ${registrationInfo.business}\n- Tỉnh/TP: ${registrationInfo.province}\n`;
    if (registrationInfo.refCode) {
      msg += isLao ? `- ລະຫັດແນະນຳທີ່ໃຊ້: ${registrationInfo.refCode}\n` : `- Mã giới thiệu dùng: ${registrationInfo.refCode}\n`;
    }
    msg += `\n`;
  }

  // 2. Target Tier
  const targetT = targetTierId ? NNC_ACCUMULATION_TIERS.find(x => x.tier_id === targetTierId) : null;
  if (targetT) {
    msg += isLao
      ? `🎯 ເປົ້າໝາຍໄຕມາດ: ${targetT.name_lo} (${targetT.total_benefit}%)\n`
      : `🎯 MỤC TIÊU DOANH SỐ QUÝ: ${targetT.name_vi} (${targetT.total_benefit}%)\n`;
  }

  // 3. Lucky Wheel Reward
  if (rewardResult) {
    msg += isLao
      ? `🎁 ຂອງຂວັນວົງລໍ້: ${rewardResult.nameLo}\n`
      : `🎁 QUÀ VÒNG QUAY: ${rewardResult.nameVi}\n`;
  }

  // 4. Cart / Order items
  let totalKip = 0;
  let hasItems = false;
  let itemsList = '';
  PRODUCTS_DATA.forEach(p => {
    const qty = quantities[p.id] || 0;
    if (qty > 0) {
      itemsList += `  + ${p.name}: ${qty} ${isLao ? 'ກ່ອງ/ຂວດ' : 'hộp/chai'}\n`;
      hasItems = true;
      totalKip += qty * p.price;
    }
  });

  if (hasItems) {
    msg += isLao
      ? `\n📦 ດອນຮ່າງສິນຄ້າ:\n${itemsList}👉 ຍອດລວມ: ${totalKip.toLocaleString()} KIP\n`
      : `\n📦 ĐƠN HÀNG THAM KHẢO:\n${itemsList}👉 Tổng tiền sỉ: ${totalKip.toLocaleString()} KIP\n`;
  }

  // 5. App Ref Code & Participant ID
  const code = getMyReferralCode();
  msg += isLao
    ? `\n🆔 ລະຫັດເຂົ້າຮ່ວມ: ${participantId || 'GUEST'}\n🔗 ລະຫັດແນະນຳຂອງຂ້ອຍ: ${code}`
    : `\n🆔 Mã tham gia: ${participantId || 'GUEST'}\n🔗 Mã giới thiệu của bạn: ${code}`;

  return msg;
}

// Prefilled WhatsApp order submission
function submitOrderWhatsApp() {
  const headline = currentLang === 'lo' ? 'ຂ້ອຍຕ້ອງການສົ່ງໃບສັ່ງຊື້ອ້າງອີງ' : 'Tôi muốn gửi đơn hàng tham khảo B2B';
  const msg = buildWhatsAppSummary(headline);

  window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  logEvent('submit_whatsapp_order');
  
  // Transition to Completion
  setFlowState('completion');
}

function skipOrderForm() {
  logEvent('order_skip');
  setFlowState('completion');
}

// Clipboard copy helper
function copyToClipboard(type) {
  const text = type === 'code' 
    ? document.getElementById('my-referral-code').innerText 
    : document.getElementById('my-referral-link').innerText;
  
  navigator.clipboard.writeText(text).then(() => {
    alert(currentLang === 'vi' ? '✓ Đã sao chép vào bộ nhớ tạm!' : '✓ ສຳເລັດການຄັດລອກ!');
  });
}

// General WhatsApp contact redirect
function openWhatsApp(intent) {
  let headline = '';
  if (intent === 'completion') {
    headline = currentLang === 'lo' ? 'ຂ້ອຍໄດ້ສົ່ງໃບສັ່ງຊື້ອ້າງອີງແລ້ວ' : 'Tôi đã gửi đơn hàng tham khảo';
  } else {
    headline = currentLang === 'lo' ? 'ຂ້ອຍຕ້ອງການຮັບຄຳປຶກສາ B2B Q3/2026' : 'Tôi muốn nhận tư vấn về chương trình B2B Q3/2026';
  }
  const message = buildWhatsAppSummary(headline);
  window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
}

function inquireProductWhatsApp() {
  const p = PRODUCTS_DATA.find(item => item.id === selectedModalProductId);
  if (!p) return;
  const headline = currentLang === 'vi'
    ? `Tôi muốn được tư vấn sỉ sản phẩm ${p.name}`
    : `ຂ້ອຍຕ້ອງການຮັບຄຳປຶກສາຂາຍສົ່ງ ${p.name}`;
  const message = buildWhatsAppSummary(headline);
  window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
}

function claimRewardWhatsApp() {
  const headline = currentLang === 'vi'
    ? 'Tôi muốn xác nhận & nhận phần quà Vòng quay B2B'
    : 'ຂ້ອຍຕ້ອງການຢືນຢັນ & ຮັບຂອງຂວັນວົງລໍ້ B2B';
  const message = buildWhatsAppSummary(headline);
  logEvent('claim_whatsapp');
  window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  // After claiming via WhatsApp, reveal the reference order (cart) step
  proceedToCartStep();
}

// Real-time Countdown clock
function initCountdownTimer() {
  const targetDate = new Date(CONFIG.campaignEndDate).getTime();
  
  const timerInterval = setInterval(() => {
    const now = new Date().getTime();
    const diff = targetDate - now;
    
    if (diff <= 0) {
      clearInterval(timerInterval);
      return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    const dEl = document.getElementById('days');
    const hEl = document.getElementById('hours');
    const mEl = document.getElementById('minutes');
    const sEl = document.getElementById('seconds');

    if (dEl) dEl.innerText = String(days).padStart(2, '0');
    if (hEl) hEl.innerText = String(hours).padStart(2, '0');
    if (mEl) mEl.innerText = String(minutes).padStart(2, '0');
    if (sEl) sEl.innerText = String(seconds).padStart(2, '0');
  }, 1000);
}

// Utility scroll
function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

// Close all active modals/popups using Escape key
function closeAllModals() {
  const modals = ['product-modal', 'rules-pdf-modal', 'invoice-preview-modal', 'result-modal'];
  modals.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeAllModals();
  }
});

// PDF Scroll to unlock logic
function onPdfScroll() {
  const pdfContainer = document.getElementById('program-pdf-preview');
  const ackCheckbox = document.getElementById('program-ack');
  const ackLabel = document.getElementById('program-ack-label');
  
  if (!pdfContainer || !ackCheckbox || !ackCheckbox.disabled) return;
  
  // Check if user has scrolled near the bottom (within 20px)
  if (pdfContainer.scrollTop + pdfContainer.clientHeight >= pdfContainer.scrollHeight - 20) {
    // Unlock the checkbox
    ackCheckbox.disabled = false;
    ackLabel.style.opacity = '1';
    ackLabel.style.cursor = 'pointer';
    
    // Optional: Auto-check it for them or let them check it manually
    // ackCheckbox.checked = true;
    // onProgramAckChange();
    
    // Change label text back to original
    const span = ackLabel.querySelector('span');
    if (span) {
      span.textContent = currentLang === 'vi' ? 'Tôi đã xem và hiểu chương trình tích lũy Q3/2026 của NNC Pharma.' : 'ຂ້ອຍໄດ້ອ່ານແລະເຂົ້າໃຈໂຄງການສະສົມ Q3/2026 ຂອງ NNC Pharma ແລ້ວ.';
    }
  }
}
