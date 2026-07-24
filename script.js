// Campaign & App Configurations
const CONFIG = {
  whatsappNumber: '8562095355355',
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
let quantities = {}; // holds ordering quantity of 6 products
let rewardResult = null; // won wheel segment object
let participantId = '';
let referralLocked = false;

// Translation Dictionaries (Vietnamese & Lao)
const TRANSLATIONS = {
  "vi": {
    "nav.products": "Sản phẩm",
    "nav.accumulation": "Tích lũy",
    "nav.wheel": "Vòng quay",
    "hero.eyebrow": "NNC PHARMA · CHƯƠNG TRÌNH TRI ÂN ĐỐI TÁC CHIẾN LƯỢC · QUÝ 3/2026",
    "hero.title_part1": "100% QUAY LÀ CÓ QUÀ",
    "hero.title_part2": "CHIẾT KHẤU TÍCH LŨY ĐẾN 10%",
    "hero.subtitle": "Đặc quyền dành riêng Nhà thuốc & Phòng khám tại Lào: quay nhận quà tri ân, xác nhận qua WhatsApp chỉ trong 1 phút, và khám phá chính sách chiết khấu tích lũy minh bạch theo từng bậc doanh số.",
    "hero.cta_main": "NHẬN LƯỢT QUAY ĐẶC QUYỀN",
    "hero.cta_secondary": "KHÁM PHÁ CHÍNH SÁCH CHIẾT KHẤU",
    "products.eyebrow": "DANH MỤC SẢN PHẨM",
    "products.title": "6 sản phẩm cộng dồn doanh số",
    "products.desc": "Doanh số của cả 7 sản phẩm được hợp nhất vào một mức tích lũy duy nhất — mỗi đơn hàng, dù mã nào, đều đưa anh/chị tiến gần bậc chiết khấu cao hơn.",
    "products.flagships_title": "NHÓM KHÁNG SINH KÊ ĐƠN CHỦ LỰC",
    "products.support_title": "NHÓM THẢO DƯỢC & NHI KHOA",
    "acc.eyebrow": "BẢNG QUYỀN LỢI TÍCH LŨY",
    "acc.title": "Cơ chế chiết khấu tích lũy 4 bậc",
    "acc.desc": "Chiết khấu 5% khấu trừ ngay trên từng hóa đơn. Cuối quý, NNC tri ân thêm 2–5% tính trên tổng doanh số tích lũy — doanh số càng cao, quyền lợi càng sâu.",
    "acc.tbl_tier": "Bậc",
    "acc.tbl_range": "Doanh số Quý (KIP)",
    "acc.tbl_direct": "Giảm trực tiếp",
    "acc.tbl_quarter": "Thưởng cuối Quý",
    "acc.tbl_total": "Tổng lợi ích",
    "acc.note": "Không áp dụng đồng thời với chương trình mua 30 tặng 1.",
    "calc.title": "Bảng tính quyền lợi thực nhận",
    "calc.subtitle": "Kéo thanh trượt theo doanh số dự kiến — quyền lợi của anh/chị hiển thị tức thì.",
    "calc.revenue_label": "Doanh số dự kiến:",
    "calc.immediate_label": "Giảm giá trực tiếp (5%):",
    "calc.quarter_label": "Thưởng cuối Quý tích lũy:",
    "calc.total_label": "Tổng quyền lợi thực nhận:",
    "calc.view_pdf": "Xem chính sách đầy đủ (PDF)",
    "form.title": "Xác nhận tham gia — chỉ 30 giây",
    "form.desc": "Thông tin giúp NNC trao quà đúng người, đúng quầy — và để chuyên viên tư vấn đồng hành cùng anh/chị qua WhatsApp một cách chu đáo nhất.",
    "form.fullname": "Họ tên người phụ trách",
    "form.phone": "Số điện thoại",
    "form.business": "Tên Quầy / Phòng khám",
    "form.province": "Tỉnh / Thành phố",
    "form.ref_code": "Mã giới thiệu (nếu có)",
    "form.contact_pref": "Kênh liên hệ ưu tiên",
    "form.call": "Gọi điện",
    "form.other": "Khác",
    "form.consent": "Tôi đồng ý để NNC Pharma lưu thông tin và tư vấn qua kênh liên hệ đã chọn.",
    "form.submit_btn": "XÁC NHẬN THAM GIA NGAY",
    "form.validate_btn": "Kiểm tra",
    "form.referral_valid": "✓ Mã giới thiệu hợp lệ và đã khóa",
    "form.referral_invalid": "Mã không hợp lệ (tối thiểu 4 ký tự)",
    "wheel.eyebrow": "VÒNG QUAY TRI ÂN ĐỐI TÁC",
    "wheel.title": "Lượt quay đặc quyền Quý 3 của anh/chị đã sẵn sàng",
    "wheel.desc": "100% lượt quay đều mang về quà tặng. Mọi phần quà được chuyên viên phụ trách khu vực xác nhận và trao qua WhatsApp — nhanh chóng, minh bạch, đúng cam kết.",
    "wheel.spin_btn": "QUAY NHẬN QUÀ NGAY",
    "modal.formulation": "Hoạt chất:",
    "modal.pack_size": "Quy cách:",
    "modal.price": "Giá sỉ Vientiane:",
    "modal.wa_btn": "Chat sỉ qua WhatsApp",
    "modal.interest_yes": "✓ Đã chọn quan tâm",
    "modal.interest_no": "Tôi quan tâm sản phẩm này",
    "result.congrats": "Chúc mừng anh/chị!",
    "result.win_intro": "Phần quà tri ân dành riêng cho anh/chị:",
    "result.condition": "Điều kiện áp dụng:",
    "result.ref_title": "Giới thiệu đồng nghiệp — nhận 5% giá trị đơn đầu của họ",
    "result.ref_desc": "Chia sẻ mã dành riêng này tới đồng nghiệp sở hữu quầy thuốc/phòng khám. Khi họ chốt đơn đầu tiên cùng NNC, 5% giá trị đơn được khấu trừ trực tiếp vào đơn nhập kế tiếp của anh/chị. Đơn cử: đơn 10 triệu KIP — anh/chị nhận về 500.000 KIP.",
    "result.ref_code": "Mã giới thiệu của bạn:",
    "result.ref_link": "Copy link chia sẻ:",
    "result.wa_claim_btn": "XÁC NHẬN QUÀ QUA WHATSAPP — CHỈ 1 CHẠM",
    "result.cta_next": "Trải nghiệm lên đơn đầu tiên",
    "stepper.step1": "Đăng ký",
    "stepper.step2": "Chính sách",
    "stepper.step3": "Quay quà",
    "stepper.step4": "Lên đơn",
    "stepper.step5": "Hoàn tất",
    "survey.title": "Chọn sản phẩm anh/chị muốn nhận báo giá sỉ ưu đãi",
    "survey.hint": "Chạm chọn (không giới hạn số mã). Chuyên viên sẽ gửi báo giá sỉ chi tiết qua WhatsApp dành riêng cho anh/chị.",
    "program.badge": "BƯỚC 2/2 — MỞ KHÓA VÒNG QUAY",
    "program.title": "Chính sách Tích lũy Doanh số Q3/2026",
    "program.desc": "Dành riêng Nhà thuốc & Phòng khám. Doanh số 7 sản phẩm được cộng gộp chung, từ 01/08 đến 30/09/2026.",
    "program.point1": "Giảm ngay 5% trực tiếp trên mọi hóa đơn nhập hàng.",
    "program.point2": "Cuối quý, nhận thêm 2% → 5% thưởng tính trên TOÀN BỘ doanh số tích lũy — càng về cuối quý, mỗi đơn hàng càng giá trị.",
    "program.point3": "Lưu ý: không áp dụng đồng thời với chương trình hàng tặng 30+1.",
    "program.ack": "Tôi đã đọc và nắm rõ chính sách tích lũy Q3/2026.",
    "program.choose_prompt": "Chọn <strong>mục tiêu doanh số Quý 3</strong> của anh/chị — NNC cam kết đồng hành để anh/chị chạm mốc:",
    "program.unlock_btn": "MỞ KHÓA VÒNG QUAY QUÀ TẶNG",
    "referral_cta.tag": "HOA HỒNG GIỚI THIỆU 5%",
    "referral_cta.title": "Mở rộng mạng lưới đối tác — nhận ngay 5% giá trị đơn đầu tiên",
    "referral_cta.desc": "Với mỗi đối tác mới do anh/chị giới thiệu, 5% giá trị đơn hàng đầu tiên của họ được khấu trừ trực tiếp vào đơn nhập kế tiếp của anh/chị. Đối tác mới vẫn hưởng trọn chính sách tích lũy — quyền lợi trọn vẹn cho cả đôi bên.",
    "wheel.locked_hint": "Hoàn thành 2 bước đăng ký để kích hoạt lượt quay 100% có quà",
    "wheel.locked_cta": "Bắt đầu ngay →",
    "wheel.showcase_tag": "100% QUAY LÀ CÓ QUÀ",
    "wheel.showcase_title": "Cơ cấu 6 phần quà Quý 3",
    "wheel.showcase_sub": "Toàn bộ quà tặng được cộng hưởng cùng chiết khấu tích lũy — quyền lợi song hành, không loại trừ:",
    "wheel.proceed_cart_btn": "LÊN THỬ ĐƠN HÀNG NGAY →",
    "reward.kit_title": "Bộ quà tác nghiệp NNC",
    "reward.kit_desc": "Khay đếm thuốc + sổ ghi toa + bút NNC",
    "reward.v200_title": "Voucher 200.000 KIP",
    "reward.v200_desc": "Trừ thẳng vào đơn từ 5tr KIP",
    "reward.ship_title": "Freeship 2 Đơn",
    "reward.ship_desc": "NNC lo 100% phí ship 2 đơn đầu",
    "reward.tadi_title": "Tặng 1 hộp Tadimax",
    "reward.tadi_desc": "Áp dụng cho đơn từ 3tr KIP",
    "reward.disc_title": "Thêm 1% Chiết Khấu",
    "reward.disc_desc": "Cộng thêm ngoài mức 5% chuẩn",
    "reward.v100_title": "Voucher 100.000 KIP",
    "reward.v100_desc": "Trừ thẳng vào đơn từ 2tr KIP",
    "pdf.title": "BẢNG QUYỀN LỢI TÍCH LŨY QUÝ 3/2026",
    "pdf.subtitle": "Bản tóm tắt dành cho Nhà Thuốc & Phòng Khám",
    "pdf.valid_until": "Áp dụng đến",
    "pdf.products_title": "6 MÃ HÀNG TÍCH LŨY",
    "pdf.products_note": "Doanh số của 6 mã hàng này được cộng dồn chung.",
    "pdf.table_title": "CƠ CHẾ THƯỞNG LŨY TIẾN",
    "pdf.tbl_tier": "Bậc",
    "pdf.tbl_range": "Doanh số Quý",
    "pdf.tbl_direct": "CK Trực tiếp",
    "pdf.tbl_quarter": "Thưởng Quý",
    "pdf.tbl_total": "Tổng",
    "pdf.tbl_max": "Tiền lời tối đa",
    "cart.eyebrow": "ĐƠN HÀNG NHÁP",
    "cart.title": "Thiết kế đơn hàng đầu tiên của anh/chị",
    "cart.subtitle": "Nhập số lượng — hệ thống tính chiết khấu theo thời gian thực. Đơn nháp được gửi qua WhatsApp để chuyên viên tư vấn mức giá và lịch giao tối ưu; hoàn toàn chưa phát sinh thanh toán.",
    "cart.summary_title": "Tổng quan lợi nhuận",
    "cart.preview_invoice": "Xem PDF Đơn Hàng",
    "cart.send_whatsapp": "GỬI ĐƠN NHÁP QUA WHATSAPP",
    "cart.skip": "Để sau — tôi muốn nhận quà trước",
    "rules.title": "Cơ chế tích lũy",
    "rules.close": "Đóng",
    "rules.download": "Tải ảnh",
    "invoice.title": "PDF Đơn Nháp",
    "invoice.close": "Đóng",
    "invoice.download": "Tải ảnh",
    "completion.title": "Hoàn tất! Quyền lợi của anh/chị đã được ghi nhận",
    "completion.desc": "Chuyên viên NNC sẽ chủ động kết nối WhatsApp trong giờ làm việc để trao quà và hoàn tất đơn chính thức. Anh/chị vui lòng lưu số 020 9535 5355 để không bỏ lỡ quyền lợi.",
    "completion.wa_btn": "KẾT NỐI WHATSAPP NGAY",
    "footer.desc": "Chương trình tri ân đối tác Quý 3/2026 — NNC Pharma đồng hành cùng Nhà thuốc & Phòng khám tại Lào. Mọi quà tặng và chiết khấu được xác nhận qua kênh WhatsApp chính thức: 020 9535 5355.",
    "reward.samsung_title": "Samsung Galaxy A16",
    "reward.samsung_desc": "Phần quà đặc biệt",
    "reward.omron_title": "Huyết áp Omron",
    "reward.omron_desc": "Thiết bị y tế chính hãng",
    "reward.scale_title": "Cân sức khỏe",
    "reward.scale_desc": "Cân điện tử tiện ích",
    "reward.v200k_title": "Voucher 200.000 KIP",
    "reward.v200k_desc": "Áp dụng vật tư y tế & thuốc",
    "reward.v100k_title": "Voucher 100.000 KIP",
    "reward.v100k_desc": "Áp dụng vật tư y tế & thuốc",
    "reward.sample_title": "Thuốc mẫu <100k",
    "reward.sample_desc": "1 trong 5 mã đạt chuẩn"
  },
  "lo": {
    "nav.products": "ສິນຄ້າ",
    "nav.accumulation": "ສະສົມຍອດ",
    "nav.wheel": "ໝູນຮັບໂຊກ",
    "hero.eyebrow": "NNC PHARMA · ໂຄງການຂອບໃຈຄູ່ຮ່ວມທຸລະກິດຍຸດທະສາດ · ໄຕມາດ 3/2026",
    "hero.title_part1": "ໝູນແມ່ນໄດ້ຂອງຂວັນ 100%",
    "hero.title_part2": "ສ່ວນຫຼຸດສະສົມສູງສຸດ 10%",
    "hero.subtitle": "ສິດທິພິເສດສະເພາະຮ້ານຢາ & ຄລີນິກ ຢູ່ ລາວ: ໝູນຮັບຂອງຂວັນ, ຢືນຢັນຜ່ານ WhatsApp ພຽງ 1 ນາທີ, ແລະ ຄົ້ນພົບນະໂຍບາຍສ່ວນຫຼຸດສະສົມທີ່ໂປ່ງໃສຕາມແຕ່ລະຂັ້ນຍອດຂາຍ.",
    "hero.cta_main": "ຮັບສິດໝູນພິເສດ",
    "hero.cta_secondary": "ຄົ້ນພົບນະໂຍບາຍສ່ວນຫຼຸດ",
    "products.eyebrow": "ໝວດຜະລິດຕະພັນ",
    "products.title": "6 ຜະລິດຕະພັນນັບຍອດຮວມກັນ",
    "products.desc": "ຍອດຂາຍທັງ 7 ຜະລິດຕະພັນຮວມເປັນຍອດສະສົມດຽວ — ແຕ່ລະບິນ, ບໍ່ວ່າລາຍການໃດ, ພາທ່ານເຂົ້າໃກ້ຂັ້ນສ່ວນຫຼຸດສູງຂຶ້ນ.",
    "products.flagships_title": "ກຸ່ມຢາຕ້ານເຊື້ອຕາມໃບສັ່ງແພດ ຫຼັກ",
    "products.support_title": "ກຸ່ມສະໝຸນໄພ & ເດັກນ້ອຍ",
    "acc.eyebrow": "ຕາຕະລາງຜົນປະໂຫຍດ",
    "acc.title": "ກົນໄກສ່ວນຫຼຸດສະສົມ 4 ຂັ້ນ",
    "acc.desc": "ສ່ວນຫຼຸດ 5% ຫັກທັນທີໃນແຕ່ລະໃບບິນ. ທ້າຍໄຕມາດ, NNC ຂອບໃຈເພີ່ມ 2–5% ຄິດຈາກຍອດສະສົມລວມ — ຍອດຍິ່ງສູງ, ຜົນປະໂຫຍດຍິ່ງເລິກ.",
    "acc.tbl_tier": "ຂັ້ນ",
    "acc.tbl_range": "ຍອດຂາຍໄຕມາດ",
    "acc.tbl_direct": "ຫຼຸດທັນທີ",
    "acc.tbl_quarter": "ໂບນັດໄຕມາດ",
    "acc.tbl_total": "ລວມຜົນປະໂຫຍດ",
    "acc.note": "ໂປຣນີ້ ບໍ່ສາມາດໃຊ້ຮ່ວມກັບໂປຣ 30 ແຖມ 1 ເດີ້.",
    "calc.title": "ຕາຕະລາງຄິດໄລ່ຜົນປະໂຫຍດຕົວຈິງ",
    "calc.subtitle": "ລາກແຖບເລື່ອນຕາມຍອດຂາຍຄາດໝາຍ — ຜົນປະໂຫຍດຂອງທ່ານສະແດງທັນທີ.",
    "calc.revenue_label": "ຍອດສັ່ງຊື້ຄາດໄວ້:",
    "calc.immediate_label": "ຫຼຸດທັນທີ (5%):",
    "calc.quarter_label": "ໂບນັດທ້າຍໄຕມາດ:",
    "calc.total_label": "ຜົນປະໂຫຍດລວມຕົວຈິງ:",
    "calc.view_pdf": "ເບິ່ງນະໂຍບາຍສະບັບເຕັມ (PDF)",
    "form.title": "ຢືນຢັນເຂົ້າຮ່ວມ — ພຽງ 30 ວິນາທີ",
    "form.desc": "ຂໍ້ມູນຊ່ວຍໃຫ້ NNC ມອບຂອງຂວັນຖືກຄົນ ຖືກຮ້ານ — ແລະ ໃຫ້ຜູ້ຊ່ຽວຊານທີ່ປຶກສາຕິດຕາມດູແລທ່ານຜ່ານ WhatsApp ຢ່າງຮອບຄອບທີ່ສຸດ.",
    "form.fullname": "ຊື່ ແລະ ນາມສະກຸນ",
    "form.phone": "ເບີໂທລະສັບ",
    "form.business": "ຊື່ຮ້ານຢາ / ຄລີນິກ",
    "form.province": "ແຂວງ / ນະຄອນ",
    "form.ref_code": "ລະຫັດຜູ້ແນະນຳ (ຖ້າມີ)",
    "form.contact_pref": "ຊ່ອງທາງຕິດຕໍ່",
    "form.call": "ໂທ",
    "form.other": "ອື່ນໆ",
    "form.consent": "ຂ້ອຍຍິນຍອມໃຫ້ NNC Pharma ເກັບຂໍ້ມູນ ແລະ ໃຫ້ຄຳປຶກສາຜ່ານຊ່ອງທາງທີ່ເລືອກ.",
    "form.submit_btn": "ຢືນຢັນເຂົ້າຮ່ວມດຽວນີ້",
    "form.validate_btn": "ກວດສອບ",
    "form.referral_valid": "✓ ລະຫັດແນະນຳຖືກຕ້ອງ",
    "form.referral_invalid": "ລະຫັດບໍ່ຖືກຕ້ອງ",
    "wheel.eyebrow": "ວົງລໍ້ຂອບໃຈຄູ່ຮ່ວມທຸລະກິດ",
    "wheel.title": "ສິດໝູນພິເສດ ໄຕມາດ 3 ຂອງທ່ານພ້ອມແລ້ວ",
    "wheel.desc": "ທຸກການໝູນນຳຂອງຂວັນມາໃຫ້ 100%. ທຸກລາງວັນຖືກຜູ້ຊ່ຽວຊານປະຈຳເຂດຢືນຢັນ ແລະ ມອບຜ່ານ WhatsApp — ວ່ອງໄວ, ໂປ່ງໃສ, ຕາມຄຳໝັ້ນສັນຍາ.",
    "wheel.spin_btn": "ໝູນຮັບຂອງຂວັນດຽວນີ້",
    "modal.formulation": "ສ່ວນປະກອບ:",
    "modal.pack_size": "ຂະໜາດບັນຈຸ:",
    "modal.price": "ລາຄາສົ່ງ Vientiane:",
    "modal.wa_btn": "ສົນທະນາ WhatsApp",
    "modal.interest_yes": "✓ ສົນໃຈແລ້ວ",
    "modal.interest_no": "ຂ້ອຍສົນໃຈໂຕນີ້",
    "result.congrats": "ຊົມເຊີຍທ່ານ!",
    "result.win_intro": "ຂອງຂວັນຂອບໃຈສະເພາະທ່ານ:",
    "result.condition": "ເງື່ອນໄຂນຳໃຊ້:",
    "result.ref_title": "ແນະນຳເພື່ອນຮ່ວມອາຊີບ — ຮັບ 5% ຂອງມູນຄ່າບິນທຳອິດຂອງເຂົາເຈົ້າ",
    "result.ref_desc": "ແບ່ງປັນລະຫັດສະເພາະນີ້ໃຫ້ເພື່ອນຮ່ວມອາຊີບທີ່ມີຮ້ານຢາ/ຄລີນິກ. ເມື່ອເຂົາເຈົ້າສະຫຼຸບບິນທຳອິດກັບ NNC, 5% ຂອງມູນຄ່າບິນຈະຫັກໂດຍກົງໃນບິນຄັ້ງຕໍ່ໄປຂອງທ່ານ. ຕົວຢ່າງ: ບິນ 10 ລ້ານກີບ — ທ່ານຮັບ 500.000 ກີບ.",
    "result.ref_code": "ລະຫັດແນະນຳຂອງທ່ານ:",
    "result.ref_link": "ກັອບປີ້ລິ້ງແຊຣ໌:",
    "result.wa_claim_btn": "ຢືນຢັນຂອງຂວັນຜ່ານ WHATSAPP — ພຽງແຕະດຽວ",
    "result.cta_next": "ທົດລອງຈັດບິນທຳອິດ",
    "stepper.step1": "ລົງທະບຽນ",
    "stepper.step2": "ນະໂຍບາຍ",
    "stepper.step3": "ໝູນຂອງຂວັນ",
    "stepper.step4": "ຈັດບິນ",
    "stepper.step5": "ສຳເລັດ",
    "survey.title": "ເລືອກຜະລິດຕະພັນທີ່ທ່ານຢາກຮັບໃບສະເໜີລາຄາຂາຍສົ່ງພິເສດ",
    "survey.hint": "ແຕະເລືອກ (ບໍ່ຈຳກັດຈຳນວນ). ຜູ້ຊ່ຽວຊານຈະສົ່ງໃບສະເໜີລາຄາຂາຍສົ່ງລະອຽດຜ່ານ WhatsApp ສະເພາະທ່ານ.",
    "program.badge": "ຂັ້ນຕອນ 2/2 — ປົດລັອກວົງລໍ້",
    "program.title": "ນະໂຍບາຍສະສົມຍອດຂາຍ ໄຕມາດ 3/2026",
    "program.desc": "ສະເພາະຮ້ານຢາ & ຄລີນິກ. ຍອດຂາຍ 7 ຜະລິດຕະພັນນັບຮວມກັນ, ແຕ່ 01/08 ຫາ 30/09/2026.",
    "program.point1": "ຫຼຸດທັນທີ 5% ໃນທຸກໃບບິນສັ່ງຊື້.",
    "program.point2": "ທ້າຍໄຕມາດ, ຮັບເພີ່ມ 2% → 5% ຄິດຈາກຍອດສະສົມ ທັງໝົດ — ຍິ່ງໃກ້ທ້າຍໄຕມາດ, ແຕ່ລະບິນຍິ່ງມີຄ່າ.",
    "program.point3": "ໝາຍເຫດ: ບໍ່ນຳໃຊ້ພ້ອມກັນກັບໂຄງການແຖມ 30+1.",
    "program.ack": "ຂ້ອຍໄດ້ອ່ານ ແລະ ເຂົ້າໃຈນະໂຍບາຍສະສົມ ໄຕມາດ 3/2026 ແລ້ວ.",
    "program.choose_prompt": "ເລືອກ <strong>ເປົ້າໝາຍຍອດຂາຍໄຕມາດ 3</strong> ຂອງທ່ານ — NNC ໝັ້ນສັນຍາຕິດຕາມສະໜັບສະໜູນໃຫ້ທ່ານບັນລຸເປົ້າ:",
    "program.unlock_btn": "ປົດລັອກວົງລໍ້ຂອງຂວັນ",
    "referral_cta.tag": "ຄ່າຄອມມິດຊັນແນະນຳ 5%",
    "referral_cta.title": "ຂະຫຍາຍເຄືອຂ່າຍຄູ່ຮ່ວມທຸລະກິດ — ຮັບທັນທີ 5% ຂອງມູນຄ່າບິນທຳອິດ",
    "referral_cta.desc": "ທຸກຄູ່ຮ່ວມທຸລະກິດໃໝ່ທີ່ທ່ານແນະນຳ, 5% ຂອງມູນຄ່າບິນທຳອິດຂອງເຂົາເຈົ້າຈະຫັກໂດຍກົງໃນບິນສັ່ງຊື້ຄັ້ງຕໍ່ໄປຂອງທ່ານ. ຄູ່ຮ່ວມໃໝ່ຍັງໄດ້ຮັບນະໂຍບາຍສະສົມເຕັມສ່ວນ — ຜົນປະໂຫຍດຄົບຖ້ວນທັງສອງຝ່າຍ.",
    "wheel.locked_hint": "ສຳເລັດ 2 ຂັ້ນຕອນລົງທະບຽນ ເພື່ອເປີດໃຊ້ສິດໝູນ 100% ມີຂອງຂວັນ",
    "wheel.locked_cta": "ເລີ່ມເລີຍ →",
    "wheel.showcase_tag": "ໝູນແມ່ນໄດ້ 100%",
    "wheel.showcase_title": "ໂຄງສ້າງ 6 ຂອງຂວັນ ໄຕມາດ 3",
    "wheel.showcase_sub": "ທຸກຂອງຂວັນເສີມກັນກັບສ່ວນຫຼຸດສະສົມ — ຜົນປະໂຫຍດຄຽງຄູ່ກັນ, ບໍ່ຕັດສິດກັນ:",
    "wheel.proceed_cart_btn": "ລອງຈັດບິນສັ່ງຊື້ເລີຍ →",
    "reward.kit_title": "ຊຸດເຄື່ອງມືເຮັດວຽກ NNC",
    "reward.kit_desc": "ຖາດນັບຢາ + ປຶ້ມບັນທຶກໃບສັ່ງຢາ + ບິກ NNC",
    "reward.v200_title": "ຄູປ໋ອງ 200.000 ກີບ",
    "reward.v200_desc": "ຫັກເລີຍ ສຳລັບບິນ 5 ລ້ານຂຶ້ນໄປ",
    "reward.ship_title": "ສົ່ງຟຣີ 2 ບິນ",
    "reward.ship_desc": "NNC ຈ່າຍຄ່າສົ່ງໃຫ້ 2 ບິນທຳອິດ",
    "reward.tadi_title": "ແຖມ Tadimax 1 ກັບ",
    "reward.tadi_desc": "ສຳລັບບິນ 3 ລ້ານຂຶ້ນໄປ",
    "reward.disc_title": "ສ່ວນຫຼຸດເພີ່ມ 1%",
    "reward.disc_desc": "ເພີ່ມຈາກ 5% ປົກກະຕິ",
    "reward.v100_title": "ຄູປ໋ອງ 100.000 ກີບ",
    "reward.v100_desc": "ຫັກເລີຍ ສຳລັບບິນ 2 ລ້ານຂຶ້ນໄປ",
    "pdf.title": "ຕາຕະລາງຜົນປະໂຫຍດ Q3/2026",
    "pdf.subtitle": "ສຳລັບຮ້ານຢາ ແລະ ຄລີນິກ",
    "pdf.valid_until": "ໃຊ້ໄດ້ຮອດ",
    "pdf.products_title": "6 ໄອເທັມ ສະສົມຍອດ",
    "pdf.products_note": "ຍອດຂາຍຂອງ 6 ໄອເທັມນີ້ ແມ່ນລວມກັນທັງໝົດ.",
    "pdf.table_title": "ໂບນັດແບບຂັ້ນໄດ",
    "pdf.tbl_tier": "ຂັ້ນ",
    "pdf.tbl_range": "ຍອດຂາຍໄຕມາດ",
    "pdf.tbl_direct": "ຫຼຸດທັນທີ",
    "pdf.tbl_quarter": "ໂບນັດໄຕມາດ",
    "pdf.tbl_total": "ລວມ",
    "pdf.tbl_max": "ກຳໄລສູງສຸດ",
    "cart.eyebrow": "ບິນສັ່ງຊື້ສະບັບຮ່າງ",
    "cart.title": "ອອກແບບບິນສັ່ງຊື້ທຳອິດຂອງທ່ານ",
    "cart.subtitle": "ໃສ່ຈຳນວນ — ລະບົບຄິດໄລ່ສ່ວນຫຼຸດແບບທັນທີ. ບິນຮ່າງສົ່ງຜ່ານ WhatsApp ໃຫ້ຜູ້ຊ່ຽວຊານແນະນຳລາຄາ ແລະ ຕາຕະລາງສົ່ງທີ່ເໝາະສົມ; ຍັງບໍ່ມີການຈ່າຍເງິນໃດໆ.",
    "cart.summary_title": "ສະຫຼຸບກຳໄລ",
    "cart.preview_invoice": "ເບິ່ງ PDF ໃບສັ່ງຊື້",
    "cart.send_whatsapp": "ສົ່ງບິນຮ່າງຜ່ານ WHATSAPP",
    "cart.skip": "ໄວ້ກ່ອນ — ຂ້ອຍຢາກຮັບຂອງຂວັນກ່ອນ",
    "rules.title": "ນະໂຍບາຍສະສົມ",
    "rules.close": "ປິດ",
    "rules.download": "ດາວໂຫຼດຮູບ",
    "invoice.title": "PDF ໃບສັ່ງຊື້",
    "invoice.close": "ປິດ",
    "invoice.download": "ດາວໂຫຼດຮູບ",
    "completion.title": "ສຳເລັດ! ຜົນປະໂຫຍດຂອງທ່ານຖືກບັນທຶກແລ້ວ",
    "completion.desc": "ຜູ້ຊ່ຽວຊານ NNC ຈະຕິດຕໍ່ຫາທ່ານທາງ WhatsApp ໃນໂມງເຮັດວຽກ ເພື່ອມອບຂອງຂວັນ ແລະ ສຳເລັດບິນທາງການ. ກະລຸນາບັນທຶກເບີ 020 9535 5355 ເພື່ອບໍ່ພາດຜົນປະໂຫຍດ.",
    "completion.wa_btn": "ເຊື່ອມຕໍ່ WHATSAPP ດຽວນີ້",
    "footer.desc": "ໂຄງການຂອບໃຈຄູ່ຮ່ວມທຸລະກິດ ໄຕມາດ 3/2026 — NNC Pharma ຄຽງຄູ່ຮ້ານຢາ & ຄລີນິກ ຢູ່ ລາວ. ທຸກຂອງຂວັນ ແລະ ສ່ວນຫຼຸດ ຢືນຢັນຜ່ານຊ່ອງທາງ WhatsApp ທາງການ: 020 9535 5355.",
    "reward.samsung_title": "ໂທລະສັບ Samsung Galaxy A16",
    "reward.samsung_desc": "ລາງວັນພິເສດ",
    "reward.omron_title": "ເຄື່ອງວັດແທກຄວາມດັນເລືອດ Omron",
    "reward.omron_desc": "ອຸປະກອນການແພດແທ້",
    "reward.scale_title": "ຊິງຊັ່ງນໍ້າໜັກດິຈິຕອນ",
    "reward.scale_desc": "ອຸປະກອນສະດວກສະບາຍ",
    "reward.v200k_title": "ບັດຂອງຂວັນ 200.000 KIP",
    "reward.v200k_desc": "ອຸປະກອນການແພດ ແລະ ຢາ",
    "reward.v100k_title": "ບັດຂອງຂວັນ 100.000 KIP",
    "reward.v100k_desc": "ອຸປະກອນການແພດ ແລະ ຢາ",
    "reward.sample_title": "ຢາຕົວຢ່າງ <100k",
    "reward.sample_desc": "1 ໃນ 5 ລະຫັດ"
  }
};

// 6 Participating Products Data
const PRODUCTS_DATA = [
  {
    id: 'tadimax',
    name: 'Tadimax',
    category: 'herbal',
    packVi: 'Hộp 21 viên x 2 vỉ',
    packLo: 'ກັບ 2 ແຜງ x 21 ເມັດ',
    price: 193000,
    badgeVi: 'Best-Seller · Lợi nhuận sỉ tốt',
    badgeLo: 'ຂາຍດີທີ່ສຸດ · ກຳໄລດີ',
    formulation: 'Trinh nữ hoàng cung, Bản lam căn, Cát cánh, v.v.',
    descVi: 'Dòng sản phẩm thảo dược hỗ trợ điều trị phì đại lành tính tuyến tiền liệt có tỷ lệ quay vòng kê đơn cao nhất tại thị trường Lào. Mang lại doanh số ổn định và biên lợi nhuận sỉ cực tốt cho nhà thuốc.',
    descLo: 'ຜະລິດຕະພັນສະໝຸນໄພປິ່ນປົວພະຍາດຕ່ອມລູກໝາກໃຫຍ່ ທີ່ມີອັດຕາການໝູນວຽນສູງສຸດໃນລາວ. ໃຫ້ຍອດຂາຍຄົງທີ່ ແລະກຳໄລສູງ.',
    image: 'images/tadimax.webp'
  },

  {
    id: 'cv-mox-1000',
    name: 'CV Mox 1000',
    category: 'antibiotic',
    packVi: 'Hộp 2 vỉ x 7 viên',
    packLo: 'ກັບ 2 ແຜງ x 7 ເມັດ',
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
    packVi: 'Hộp 10 vỉ x 10 viên',
    packLo: 'ກັບ 10 ແຜງ x 10 ເມັດ',
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
    packVi: 'Chai 60ml',
    packLo: 'ຕຸກ 60ml',
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
    packVi: 'Chai 30ml (100mg/5ml)',
    packLo: 'ຕຸກ 30ml (100mg/5ml)',
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
    packVi: 'Chai 30ml',
    packLo: 'ຕຸກ 30ml',
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
  { id: 'samsung', weight: 0, nameVi: 'Samsung Galaxy A16', nameLo: 'ໂທລະສັບ Samsung Galaxy A16', color: '#0f3a30', textColor: '#ffffff' },
  { id: 'omron', weight: 0, nameVi: 'Máy đo huyết áp Omron', nameLo: 'ເຄື່ອງວັດແທກຄວາມດັນເລືອດ Omron', color: '#fbbf24', textColor: '#102a24' },
  { id: 'scale', weight: 0, nameVi: 'Cân sức khỏe điện tử', nameLo: 'ຊິງຊັ່ງນໍ້າໜັກດິຈິຕອນ', color: '#104e40', textColor: '#ffffff' },
  { id: 'v200k', weight: 10, nameVi: 'Voucher 200.000 KIP', nameLo: 'ບັດຂອງຂວັນ 200.000 KIP', color: '#0f3a30', textColor: '#ffffff' },
  { id: 'v100k', weight: 45, nameVi: 'Voucher 100.000 KIP', nameLo: 'ບັດຂອງຂວັນ 100.000 KIP', color: '#60a5fa', textColor: '#ffffff' },
  { id: 'sample', weight: 45, nameVi: 'Thuốc mẫu <100k', nameLo: 'ຢາຕົວຢ່າງ <100k', color: '#104e40', textColor: '#ffffff' }
];

const REWARD_DETAILS = {
  samsung: {
    nameVi: 'Điện thoại Samsung Galaxy A16',
    nameLo: 'ໂທລະສັບ Samsung Galaxy A16',
    condVi: 'Phần quà đặc biệt từ NNC dành cho khách hàng may mắn.',
    condLo: 'ລາງວັນພິເສດຈາກ NNC ສຳລັບລູກຄ້າຜູ້ໂຊກດີ.'
  },
  omron: {
    nameVi: 'Máy đo huyết áp Omron',
    nameLo: 'ເຄື່ອງວັດແທກຄວາມດັນເລືອດ Omron',
    condVi: 'Thiết bị y tế chính hãng theo tiêu chuẩn Nhật Bản.',
    condLo: 'ອຸປະກອນການແພດແທ້ຕາມມາດຕະຖານຍີ່ປຸ່ນ.'
  },
  scale: {
    nameVi: 'Cân sức khỏe điện tử',
    nameLo: 'ຊິງຊັ່ງນໍ້າໜັກດິຈິຕອນ',
    condVi: 'Phần quà sức khỏe tiện ích cho gia đình và phòng khám.',
    condLo: 'ຂອງຂວັນສຸຂະພາບສະດວກສະບາຍສຳລັບຄອບຄົວ ແລະ ຄລີນິກ.'
  },
  v200k: {
    nameVi: 'Voucher 200.000 KIP VTYT & thuốc',
    nameLo: 'ບັດຂອງຂວັນ 200.000 KIP ອຸປະກອນການແພດ ແລະ ຢາ',
    condVi: 'Sử dụng để mua các mặt hàng vật tư y tế và thuốc tại NNC.',
    condLo: 'ໃຊ້ສຳລັບຊື້ອຸປະກອນການແພດ ແລະ ຢາຢູ່ NNC.'
  },
  v100k: {
    nameVi: 'Voucher 100.000 KIP VTYT & thuốc',
    nameLo: 'ບັດຂອງຂວັນ 100.000 KIP ອຸປະກອນການແພດ ແລະ ຢາ',
    condVi: 'Sử dụng để mua các mặt hàng vật tư y tế và thuốc tại NNC.',
    condLo: 'ໃຊ້ສຳລັບຊື້ອຸປະກອນການແພດ ແລະ ຢາຢູ່ NNC.'
  },
  sample: {
    nameVi: 'Thuốc mẫu <100k',
    nameLo: 'ຢາຕົວຢ່າງ <100k',
    condVi: 'Nhận ngẫu nhiên 1 trong 5 mã sản phẩm đạt chuẩn của chương trình.',
    condLo: 'ຮັບແບບສຸ່ມ 1 ໃນ 5 ລະຫັດຜະລິດຕະພັນທີ່ໄດ້ມາດຕະຖານຂອງໂຄງການ.'
  }
};


const NNC_ACCUMULATION_TIERS = [
  { tier_id: "tier_1", name_vi: "Bậc 1", name_lo: "ຂັ້ນ 1", min_revenue_kip: 2000000, max_revenue_kip: 6000000, immediate_discount: 5, quarter_end_reward: 2, total_benefit: 7 },
  { tier_id: "tier_2", name_vi: "Bậc 2", name_lo: "ຂັ້ນ 2", min_revenue_kip: 6000000, max_revenue_kip: 12000000, immediate_discount: 5, quarter_end_reward: 3, total_benefit: 8 },
  { tier_id: "tier_3", name_vi: "Bậc 3", name_lo: "ຂັ້ນ 3", min_revenue_kip: 12000000, max_revenue_kip: 25000000, immediate_discount: 5, quarter_end_reward: 4, total_benefit: 9 },
  { tier_id: "tier_4", name_vi: "Bậc 4", name_lo: "ຂັ້ນ 4", min_revenue_kip: 25000000, max_revenue_kip: Number.MAX_SAFE_INTEGER, immediate_discount: 5, quarter_end_reward: 5, total_benefit: 10 }
];

// Initialize Application
function updateAllTextContent() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key]) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.setAttribute('placeholder', TRANSLATIONS[currentLang][key]);
      } else {
        el.innerHTML = TRANSLATIONS[currentLang][key];
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Apply initial language translations based on currentLang
  updateAllTextContent();

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
  
  renderDynamicPdf();
  updateWheelLockVisual();
  updateSimulation(simulatedRevenue);
  initCountdownTimer();
  renderLiveTicker();

  // Keep sticky header offset synchronized at any screen size
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

// ===== Mock Live Activity Stream for Lao Customers (Hero Ticker) =====
const MOCK_LIVE_ACTIVITIES_LO = [
  { name: 'ຮ້ານຂາຍຢາ ດາວວຽງ', location: 'ນະຄອນຫຼວງວຽງຈັນ', reward: 'Voucher 200.000 KIP', timeAgo: '2 ນາທີກ່ອນ', icon: '🎁' },
  { name: 'ຄລີນິກ ສຸຂະພາບດີ', location: 'ຫຼວງພະບາງ', reward: 'ຊຸດຂອງຂວັນ NNC Pharma', timeAgo: '5 ນາທີກ່ອນ', icon: '🏆' },
  { name: 'ຮ້ານຂາຍຢາ ໄຊສະຫວ່າງ', location: 'ຈຳປາສັກ', reward: 'ຟຣີຄ່າສົ່ງ 2 ອໍເດີ', timeAgo: '7 ນາທີກ່ອນ', icon: '🚚' },
  { name: 'ໂຮງຢາ ມິດຕະພາບ', location: 'ສະຫວັນນະເຂດ', reward: 'Tadimax 1 ກ່ອງ', timeAgo: '11 ນາທີກ່ອນ', icon: '💊' },
  { name: 'ຄລີນິກ ປະຊາຊົນ', location: 'ນະຄອນຫຼວງວຽງຈັນ', reward: 'Voucher 100.000 KIP', timeAgo: '14 ນາທີກ່ອນ', icon: '🎫' },
  { name: 'ຮ້ານຂາຍຢາ ພອນໄຊ', location: 'ຄຳມ່ວນ', reward: 'ສ່ວນຫຼຸດ tích lũy 1%', timeAgo: '18 ນາທີກ່ອນ', icon: '✨' },
  { name: 'ໂຮງຢາ ອຸດົມໄຊ', location: 'ອຸດົມໄຊ', reward: 'ຊຸດຂອງຂວັນ NNC Pharma', timeAgo: '22 ນາທີກ່ອນ', icon: '🎁' },
  { name: 'ຄລີນິກ ເມືອງລາວ', location: 'ນະຄອນຫຼວງວຽງຈັນ', reward: 'Voucher 200.000 KIP', timeAgo: '26 ນາທີກ່ອນ', icon: '🏆' },
  { name: 'ຮ້ານຂາຍຢາ ບຸນມີ', location: 'ຫຼວງນ້ຳທາ', reward: 'ຟຣີຄ່າສົ່ງ 2 ອໍເດີ', timeAgo: '31 ນາທີກ່ອນ', icon: '🚚' },
  { name: 'ໂຮງຢາ ສີໂຄດຕະບອງ', location: 'ນະຄອນຫຼວງວຽງຈັນ', reward: 'Voucher 100.000 KIP', timeAgo: '35 ນາທີກ່ອນ', icon: '💊' },
  { name: 'ຄລີນິກ ສີສະເກດ', location: 'ວຽງຈັນ', reward: 'ຊຸດຂອງຂວັນ NNC Pharma', timeAgo: '41 ນາທີກ່ອນ', icon: '🎁' },
  { name: 'ຮ້ານຂາຍຢາ ລັດສະໝີ', location: 'ບໍລິຄຳໄຊ', reward: 'Tadimax 1 ກ່ອງ', timeAgo: '48 ນາທີກ່ອນ', icon: '✨' }
];

function renderLiveTicker() {
  const track = document.getElementById('ticker-track');
  if (!track) return;
  
  const itemsHtml = MOCK_LIVE_ACTIVITIES_LO.map(act => `
    <div class="ticker-item">
      <span class="ticker-icon">${act.icon}</span>
      <div class="ticker-content">
        <strong class="ticker-name">${act.name} <span class="ticker-loc">(${act.location})</span></strong>
        <span class="ticker-action">ໄດ້ຮັບ</span>
        <span class="ticker-reward">${act.reward}</span>
      </div>
      <span class="ticker-time">${act.timeAgo}</span>
    </div>
  `).join('');

  track.innerHTML = itemsHtml + itemsHtml;
}

function pushUserWinToTicker(rewardObj) {
  const track = document.getElementById('ticker-track');
  if (!track) return;

  const bName = registrationInfo && registrationInfo.business ? registrationInfo.business : 'ຮ້ານຂາຍຢາ Đối tác';
  const prov = registrationInfo && registrationInfo.province ? registrationInfo.province : 'Vientiane';
  const rName = rewardObj.nameLo || rewardObj.nameVi || 'Quà tặng NNC';

  const newActivity = {
    name: bName,
    location: prov,
    reward: rName,
    timeAgo: 'ຫາເພິ່ງນີ້',
    icon: '🎉'
  };

  MOCK_LIVE_ACTIVITIES_LO.unshift(newActivity);
  renderLiveTicker();
}


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
  const wheelCard = document.getElementById('wheel-showcase-card');
  const orderCard = document.getElementById('order-form-card');
  const completionCard = document.getElementById('completion-card');

  const show = (el, on) => { if (el) el.style.display = on ? 'block' : 'none'; };

  if (flowState === 'discover') {
    if (overlay) overlay.style.display = 'none';
    document.body.style.overflow = '';
  } else {
    // Open Popup Modal Overlay over screen!
    if (overlay) overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    show(registerCard, flowState === 'register');
    show(programCard, flowState === 'program');
    show(wheelCard, flowState === 'wheel');
    show(orderCard, flowState === 'cart');
    show(completionCard, flowState === 'completion');

    if (flowState === 'wheel') {
      // Step 3: Go outside, let user spin manually
      const overlay = document.getElementById('funnel-modal-overlay');
      if (overlay) overlay.style.display = 'none';
      setTimeout(() => {
        scrollToId('target-wheel-box');
      }, 100);
      return;
    }

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


function updateWheelLockVisual() {
  const overlay = document.getElementById('wheel-lock-overlay');
  const spinBtn = document.getElementById('btn-spin-wheel');
  if (overlay) overlay.style.display = 'none';
  if (spinBtn) {
    spinBtn.style.display = 'flex';
    if (flowState === 'wheel') {
      spinBtn.disabled = false;
      spinBtn.classList.add('pulse-border');
    } else {
      spinBtn.disabled = true;
      spinBtn.classList.remove('pulse-border');
    }
  }
}

function renderDynamicPdf() {
  const container = document.getElementById('dynamic-pdf-preview');
  if (!container) return;

  const t = TRANSLATIONS[currentLang];
  
  let productsHtml = '';
  PRODUCTS_DATA.forEach((p) => {
    let badgeText = '';
    if (currentLang === 'vi') {
      badgeText = p.category === 'herbal' ? 'Thảo dược' : 'Kháng sinh';
    } else {
      badgeText = p.category === 'herbal' ? 'ຢາພື້ນເມືອງ' : 'ຢາຕ້ານເຊື້ອ';
    }

    productsHtml += `
      <div class="dyn-pdf-prod">
        <div class="dyn-pdf-prod-badge">${badgeText}</div>
        <img src="${p.image}" alt="${p.name}">
        <h4>${p.name}</h4>
        <p>${currentLang === 'vi' ? p.packVi : p.packLo}</p>
      </div>
    `;
  });

  // Add the 8th item (text note)
  productsHtml += `
    <div class="dyn-pdf-prod-note">
      <p>${t['pdf.products_note']}</p>
    </div>
  `;

  let tableRowsHtml = '';
  const fmtM = (v) => (v / 1000000).toLocaleString(currentLang === 'vi' ? 'vi-VN' : 'lo-LA');
  
  NNC_ACCUMULATION_TIERS.forEach(tier => {
    let rangeText = tier.max_revenue_kip === Number.MAX_SAFE_INTEGER
      ? (currentLang === 'vi' ? `Từ ${fmtM(tier.min_revenue_kip)} triệu KIP` : `ຕັ້ງແຕ່ ${fmtM(tier.min_revenue_kip)} ລ້ານກີບ`)
      : (currentLang === 'vi' ? `Từ ${fmtM(tier.min_revenue_kip)} - dưới ${fmtM(tier.max_revenue_kip)} triệu` : `ຈາກ ${fmtM(tier.min_revenue_kip)} ຕ່ຳກວ່າ ${fmtM(tier.max_revenue_kip)} ລ້ານກີບ`);
    
    let maxReward = '';
    if (tier.tier_id === 'tier_1') maxReward = '420,000 KIP';
    if (tier.tier_id === 'tier_2') maxReward = '960,000 KIP';
    if (tier.tier_id === 'tier_3') maxReward = '2,250,000 KIP';
    if (tier.tier_id === 'tier_4') maxReward = currentLang === 'vi' ? 'Không giới hạn' : 'ບໍ່ຈຳກັດ';

    tableRowsHtml += `
      <tr>
        <td><strong>${tier.tier_id.replace('tier_', '')}</strong></td>
        <td><strong>${rangeText}</strong></td>
        <td>${tier.immediate_discount}%</td>
        <td>${tier.quarter_end_reward}%</td>
        <td class="dyn-pdf-total">${tier.total_benefit}%</td>
        <td class="dyn-pdf-max">${maxReward}</td>
      </tr>
    `;
  });

  container.innerHTML = `
    <div class="dyn-pdf-header">
      <h2>${t['pdf.title']}</h2>
      <h3>${t['pdf.subtitle']}</h3>
      <div class="dyn-pdf-date">${t['pdf.valid_until']} <span class="dyn-pdf-date-val">30/09/2026</span></div>
    </div>
    
    <div class="dyn-pdf-section">
      <div class="dyn-pdf-sec-title">
        <span class="dyn-pdf-sec-bar"></span>
        <h4>${t['pdf.products_title']}</h4>
      </div>
      <div class="dyn-pdf-products-grid">
        ${productsHtml}
      </div>
    </div>

    <div class="dyn-pdf-section">
      <div class="dyn-pdf-sec-title">
        <span class="dyn-pdf-sec-bar"></span>
        <h4>${t['pdf.table_title']}</h4>
      </div>
      <div class="dyn-pdf-table-wrapper">
        <table class="dyn-pdf-table">
          <thead>
            <tr>
              <th>${t['pdf.tbl_tier']}</th>
              <th>${t['pdf.tbl_range']}</th>
              <th>${t['pdf.tbl_direct']}</th>
              <th>${t['pdf.tbl_quarter']}</th>
              <th>${t['pdf.tbl_total']}</th>
              <th>${t['pdf.tbl_max']}</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>
      </div>
    </div>
  `;
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
  
  updateAllTextContent();

  renderProducts();
  
  renderDynamicPdf();
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
    const actionBtnHtml = `<button type="button" class="btn-card-view" onclick="showProductModal('${p.id}')">
          <svg class="icon-eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>`;

    const cardHtml = `
      <div class="product-card" id="card-${p.id}">
        <div class="product-card-visual" onclick="showProductModal('${p.id}')">
          <span class="product-card-badge">${badge}</span>
          <span class="product-number-badge">${String(PRODUCTS_DATA.indexOf(p) + 1).padStart(2, '0')}</span>
          <img src="${p.image}" alt="${p.name}" class="product-card-img" onerror="this.src='images/nnc-logo-160.webp'">
        </div>
        <div class="product-card-info">
          <h3 class="product-card-name" onclick="showProductModal('${p.id}')">${p.name}</h3>
          <span class="product-card-pack">${currentLang === 'vi' ? p.packVi : p.packLo}</span>
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
  document.getElementById('modal-product-pack').innerText = currentLang === 'vi' ? p.packVi : p.packLo;
  document.getElementById('modal-product-price').innerText = p.price.toLocaleString() + ' KIP';
  document.getElementById('product-modal').classList.add('active');
}

function hideProductModal() {
  document.getElementById('product-modal').classList.remove('active');
}

function closeProductModal(e) {
  hideProductModal();
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

  const dob = document.getElementById('dob').value;
  const businessTypeRadio = document.querySelector('input[name="businessType"]:checked');
  const businessType = businessTypeRadio ? businessTypeRadio.value : '';

  registrationInfo = { fullname, phone, business, province, refCode, dob, businessType };
  
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

  
  PRODUCTS_DATA.forEach(p => {
    quantities[p.id] = 0;
  });

  logEvent('register');

  // Move to mandatory program-review step (gate B)
  setFlowState('program');
}

// Marketing Conversion Nudge (Below Action Buttons)
function updateOrderMarketingNudge(totalKip) {
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
// Spin Wheel interaction
function spinWheel() {
  if (isSpinning) return;
  isSpinning = true;

  // Temporarily hide modal so the user can watch the wheel spin in the hero section
  const overlay = document.getElementById('funnel-modal-overlay');
  if (overlay) overlay.style.display = 'none';

  // Make sure we scroll to the hero wheel so it's fully in view
  scrollToId('target-wheel-box');

  const canvas = document.getElementById('lucky-wheel-canvas');
  if (!canvas) {
    isSpinning = false;
    return;
  }

  const btn = document.getElementById('btn-spin-wheel');
  if (btn) btn.disabled = true;

  // Spin animation
  const randomDeg = Math.floor(Math.random() * 360) + 1800; // at least 5 full spins
  canvas.style.transition = 'transform 4.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
  canvas.style.transform = `rotate(${randomDeg}deg)`;

  // Show result after spin ends
  setTimeout(() => {
    isSpinning = false;
    
    // Pick a random reward
    const keys = Object.keys(REWARD_DETAILS);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const details = REWARD_DETAILS[randomKey];
    
    rewardResult = {
      nameVi: details.nameVi,
      nameLo: details.nameLo
    };

    showResultModal(randomKey);
  }, 4700); // Wait 4.5s for spin + 0.2s padding
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
    const hasQty = qty > 0;
    html += `
      <li class="order-product-item ${hasQty ? 'has-qty' : ''}" id="order-item-${p.id}">
        <div class="order-item-visual">
          <img src="${p.image}" alt="${p.name}" onerror="this.src='images/nnc-logo-160.webp'">
        </div>
        <div class="order-item-details">
          <div class="item-name-row">
            <h4 class="item-name">${p.name}</h4>
            <span class="pack-size">(${currentLang === 'vi' ? p.packVi : p.packLo})</span>
          </div>
          <span class="unit-price">${p.price.toLocaleString()} KIP</span>
        </div>
        <div class="order-item-controls">
          <div class="qty-control-buttons">
            <button type="button" class="btn-qty-minus" onclick="changeOrderQty('${p.id}', -1)">−</button>
            <input type="number" class="qty-input" value="${qty}" min="0" onchange="setOrderQty('${p.id}', this.value)" />
            <button type="button" class="btn-qty-plus" onclick="changeOrderQty('${p.id}', 1)">+</button>
          </div>
          ${hasQty ? '' : ''}
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

function buildWhatsAppSummary(headline) {
  const isLao = currentLang === 'lo';
  let msg = isLao 
    ? `[B2B - NNC Pharma]\nສະບາຍດີ NNC,\n${headline || 'ຂ້ອຍຕ້ອງການຮັບຄຳປຶກສາ B2B Q3'}:\n\n`
    : `[B2B - NNC Pharma]\nXin chào NNC,\n${headline || 'Tôi muốn tư vấn chương trình B2B Q3'}:\n\n`;

  // 1. Customer Info
  if (registrationInfo) {
    msg += isLao 
      ? `📋 ຂໍ້ມູນລົງທະບຽນ:\n- ລູກຄ້າ: ${registrationInfo.fullname}\n- ເບີໂທ: ${registrationInfo.phone}\n- ຫົວໜ່ວຍ: ${registrationInfo.business}\n- ແຂວງ: ${registrationInfo.province}\n`
      : `📋 THÔNG TIN ĐĂNG KÝ:\n- Khách hàng: ${registrationInfo.fullname}\n- SĐT: ${registrationInfo.phone}\n- Đơn vị: ${registrationInfo.business}\n- Tỉnh/TP: ${registrationInfo.province}\n`;
    if (registrationInfo.refCode) {
      msg += isLao ? `- ລະຫັດແນະນຳ: ${registrationInfo.refCode}\n` : `- Mã giới thiệu: ${registrationInfo.refCode}\n`;
    }
    msg += `\n`;
  }

  // 2. Target Tier
  const targetT = targetTierId ? NNC_ACCUMULATION_TIERS.find(x => x.tier_id === targetTierId) : null;
  if (targetT) {
    msg += isLao
      ? `🎯 ເປົ້າໝາຍໄຕມາດ: ${targetT.name_lo}\n`
      : `🎯 MỤC TIÊU QUÝ: ${targetT.name_vi}\n`;
  }

  // 3. Lucky Wheel Reward
  if (rewardResult) {
    msg += isLao
      ? `🎁 ຖືກລາງວັນ: ${rewardResult.nameLo}\n\n`
      : `🎁 TRÚNG THƯỞNG: ${rewardResult.nameVi}\n\n`;
  }

  // 4. Cart / Order items
  let totalKip = 0;
  let hasItems = false;
  let itemsMsg = isLao ? `🛒 ໃບສັ່ງຊື້ອ້າງອີງ:\n` : `🛒 ĐƠN HÀNG DỰ KIẾN:\n`;
  
  PRODUCTS_DATA.forEach((p, idx) => {
    const qty = quantities[p.id] || 0;
    if (qty > 0) {
      hasItems = true;
      const sub = qty * p.price;
      totalKip += sub;
      itemsMsg += `${idx + 1}. ${p.name}: ${qty} x ${p.price.toLocaleString()} = ${sub.toLocaleString()}\n`;
    }
  });

  if (hasItems) {
    msg += itemsMsg;
    msg += isLao
      ? `\n=> ລວມຍອດຊຳລະ: ${totalKip.toLocaleString()} KIP\n`
      : `\n=> Tổng thanh toán: ${totalKip.toLocaleString()} KIP\n`;
  }

  return msg;
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

  // Determine next tier
  const nextTier = NNC_ACCUMULATION_TIERS.find(t => totalKip < t.min_revenue_kip);
  let nextTierHtml = '';
  if (nextTier) {
    const diff = nextTier.min_revenue_kip - totalKip;
    const nextName = currentLang === 'vi' ? nextTier.name_vi : nextTier.name_lo;
    const nextDisc = nextTier.immediate_discount;
    nextTierHtml = currentLang === 'vi' 
      ? `<div class="upsell-nudge">🔥 <strong>Cần thêm ${(diff).toLocaleString()} KIP</strong> để đạt <strong>${nextName}</strong> & hưởng <strong>chiết khấu ${nextDisc}%</strong>!</div>`
      : `<div class="upsell-nudge">🔥 <strong>ຊື້ເພີ່ມອີກ ${(diff).toLocaleString()} ກີບ</strong> ເພື່ອຂຶ້ນ <strong>${nextName}</strong> ແລະ ຮັບ <strong>ສ່ວນຫຼຸດ ${nextDisc}%</strong>!</div>`;
  } else if (activeTier) {
    const maxTierName = currentLang === 'vi' ? activeTier.name_vi : activeTier.name_lo;
    const maxDisc = activeTier.immediate_discount;
    nextTierHtml = currentLang === 'vi'
      ? `<div class="upsell-nudge" style="background:rgba(16,185,129,0.1); border-color:#10b981; color:#064e3b;">🎉 <strong>Chúc mừng!</strong> Bạn đã đạt mức tối đa <strong>${maxTierName}</strong> & hưởng <strong>chiết khấu ${maxDisc}%</strong>!</div>`
      : `<div class="upsell-nudge" style="background:rgba(16,185,129,0.1); border-color:#10b981; color:#064e3b;">🎉 <strong>ຊົມເຊີຍ!</strong> ທ່ານບັນລຸຂັ້ນສູງສຸດແລ້ວ <strong>${maxTierName}</strong> ພ້ອມຮັບ <strong>ສ່ວນຫຼຸດ ${maxDisc}%</strong>!</div>`;
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
        ${nextTierHtml}
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
        ${nextTierHtml}
      `;
      formCard.classList.remove('tier-active-theme');
    }
  }

  updateOrderMarketingNudge(totalKip);
}

// Marketing Conversion Nudge (Below Action Buttons)
function updateOrderMarketingNudge(totalKip) {
  const nudgeContainer = document.getElementById('order-marketing-nudge');
  if (nudgeContainer) {
    nudgeContainer.innerHTML = '';
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
      ctx.fillText(currentLang === 'vi' ? p.packVi : p.packLo, 180, currentY + 30);
      
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
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
