# HƯỚNG DẪN CÀI ĐẶT & GO-LIVE — NNC Q3/2026 Rewards Landing

## 1. Kết nối Google Sheet để lưu dữ liệu khách (5 phút, miễn phí)

Mỗi khi khách **đăng ký**, **quay trúng quà**, **bấm nhận quà WhatsApp**, **gửi đơn** hoặc **bỏ qua đơn**, trang sẽ tự ghi 1 dòng vào Google Sheet của anh. Không bị mất lead kể cả khi khách không bấm WhatsApp.

**Các bước:**

1. Vào https://sheets.new tạo một Google Sheet mới, đặt tên ví dụ: `NNC Q3 Rewards - Leads`.
2. Trên Sheet, vào menu **Tiện ích mở rộng (Extensions) → Apps Script**.
3. Xóa hết code mẫu, mở file `google-apps-script.gs` trong thư mục này, copy toàn bộ và dán vào.
4. Bấm **Lưu** (biểu tượng đĩa mềm).
5. Chạy thử: chọn hàm `testSetup` ở thanh trên → bấm **Run** → cấp quyền khi được hỏi (chọn tài khoản → Advanced → Go to... → Allow). Quay lại Sheet sẽ thấy sheet `Leads` có 1 dòng test.
6. Bấm **Triển khai (Deploy) → Tùy chọn triển khai mới (New deployment)**:
   - Loại: **Ứng dụng web (Web app)**
   - Execute as: **Me (tôi)**
   - Who has access: **Anyone (Bất kỳ ai)** ← bắt buộc, nếu không trang sẽ không gửi được dữ liệu
   - Bấm **Deploy** → copy **Web app URL** (dạng `https://script.google.com/macros/s/AKfy.../exec`)
7. Mở file `script.js`, dòng gần đầu:
   ```js
   sheetWebhookUrl: '',
   ```
   dán URL vào giữa 2 dấu nháy:
   ```js
   sheetWebhookUrl: 'https://script.google.com/macros/s/AKfy.../exec',
   ```
8. Upload lại `script.js` lên hosting. Xong.

> Lưu ý: nếu sau này sửa code Apps Script, phải **Deploy → Manage deployments → Edit → New version** thì thay đổi mới có hiệu lực.

## 2. Tỷ lệ trúng quà trên vòng quay (đã cài trọng số)

Sửa số `weight` trong `script.js` (mục `WHEEL_SEGMENTS`) nếu muốn đổi. Tổng không cần bằng 100 — chỉ là tỷ lệ tương đối.

| Quà | Tỷ lệ hiện tại | Chi phí ước tính/lượt trúng |
|---|---|---|
| Bộ quà văn phòng NNC | 25% | Thấp (sổ + bút + ô) |
| Voucher 100.000 KIP (đơn ≥ 2 triệu) | 22% | 100.000 KIP, tự bù bằng đơn |
| Miễn phí vận chuyển 2 đơn đầu | 20% | Thấp–vừa |
| Tặng 1 hộp Tadimax (đơn ≥ 3 triệu) | 15% | ~193.000 KIP |
| Chiết khấu thêm 1% đơn đầu (tối đa 300.000 KIP) | 12% | ≤ 300.000 KIP |
| Voucher 200.000 KIP (đơn ≥ 5 triệu) | 6% | 200.000 KIP |

## 3. Đưa lên hosting (Cloudflare Pages — miễn phí)

1. Vào https://dash.cloudflare.com → **Workers & Pages → Create → Pages → Upload assets**.
2. Kéo thả toàn bộ thư mục này (index.html, style.css, script.js, images/).
3. Đặt tên project, bấm Deploy → nhận link dạng `https://ten-project.pages.dev`.
4. Test đủ luồng trên điện thoại thật 1 lần trước khi gửi link cho khách.

## 4. Checklist trước khi chạy chương trình

- [ ] Đã dán `sheetWebhookUrl` và thấy dữ liệu test vào Sheet
- [ ] Số WhatsApp nhận tin: **020 9980 6327** — sale online đã biết mẫu tin nhắn khách gửi đến
- [ ] Giá trị 6 quà + tỷ lệ đã được duyệt nội bộ
- [ ] Giá sỉ 7 sản phẩm trong trang khớp bảng giá hiện hành (sửa trong `PRODUCTS_DATA`, file `script.js`)
- [ ] Ngày chạy: 01/08 – 30/09/2026 (sửa `campaignEndDate` trong `CONFIG` nếu đổi)
- [ ] Đã test đủ luồng: đăng ký → xem chương trình → quay → WhatsApp → giỏ hàng → hoàn tất, cả VI và Lào

## 5. Câu hỏi thường gặp

**Cột "Bậc mục tiêu quý" trong Sheet là gì?** — Là bậc doanh số khách tự chọn ở bước xem chương trình (bắt buộc chọn mới quay được). Đây là *ý định doanh số* của khách — sale nên ưu tiên chăm khách chọn Bậc 3–4.

**Khách quay được mấy lần?** — 1 lần/phiên trình duyệt. Khách xóa dữ liệu trình duyệt có thể quay lại; đối soát bằng SĐT trong Sheet, trùng SĐT chỉ tính lượt đầu.

**Trang có chạy được khi chưa cài Google Sheet không?** — Có, mọi thứ vẫn hoạt động, chỉ không lưu dữ liệu về Sheet (lead chỉ đến qua WhatsApp).

**Muốn đổi tên/điều kiện quà?** — Sửa `WHEEL_SEGMENTS` (tên trên vòng) và `REWARD_DETAILS` (tên đầy đủ + điều kiện) trong `script.js`, có sẵn cả bản Lào cạnh bản Việt.
