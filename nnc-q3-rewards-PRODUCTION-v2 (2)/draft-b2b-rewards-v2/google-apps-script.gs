/**
 * NNC PHARMA — Q3/2026 REWARDS LANDING PAGE
 * Google Apps Script: nhận dữ liệu từ landing page và ghi vào Google Sheet.
 *
 * CÁCH CÀI ĐẶT: xem file HUONG-DAN-CAI-DAT.md (5 phút, miễn phí).
 * Sau khi Deploy, copy "Web app URL" dán vào CONFIG.sheetWebhookUrl trong script.js.
 */

var SHEET_NAME = 'Leads';

var HEADERS = [
  'Thời gian', 'Sự kiện', 'Mã tham gia', 'Ngôn ngữ',
  'Họ tên', 'SĐT', 'Nhà thuốc/Phòng khám', 'Tỉnh/TP',
  'Mã giới thiệu nhập vào', 'Kênh liên hệ', 'Sản phẩm quan tâm',
  'Bậc mục tiêu quý', 'Quà trúng', 'Đơn hàng', 'Tổng đơn (KIP)'
];

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#0F3A30').setFontColor('#FFFFFF');
      sheet.setFrozenRows(1);
    }

    var eventLabels = {
      register: 'Đăng ký + khảo sát',
      program_target: 'Chọn bậc mục tiêu',
      spin_result: 'Quay trúng quà',
      claim_whatsapp: 'Bấm nhận quà WhatsApp',
      order_submit: 'Gửi đơn qua WhatsApp',
      order_skip: 'Bỏ qua đơn hàng'
    };

    sheet.appendRow([
      new Date(),
      eventLabels[data.event] || data.event || '',
      data.participantId || '',
      data.lang || '',
      data.fullname || '',
      "'" + (data.phone || ''),         // dấu ' giữ số 0 đầu SĐT
      data.business || '',
      data.province || '',
      data.refCode || '',
      data.preferredContact || '',
      data.surveyInterests || '',
      data.targetTier || '',
      data.reward || '',
      data.orderItems || '',
      data.orderTotalKip || ''
    ]);

    return ContentService.createTextOutput('OK');
  } catch (err) {
    return ContentService.createTextOutput('ERROR: ' + err);
  }
}

/** Chạy hàm này 1 lần trong editor để kiểm tra quyền và tạo sheet. */
function testSetup() {
  var fake = {
    postData: {
      contents: JSON.stringify({
        event: 'register',
        participantId: 'test-123',
        lang: 'vi',
        fullname: 'Khách Test',
        phone: '02099999999',
        business: 'Nhà thuốc Test',
        province: 'Vientiane',
        surveyInterests: 'Tadimax; CV Mox 1000'
      })
    }
  };
  doPost(fake);
}
