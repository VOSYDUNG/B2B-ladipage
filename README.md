# NNC Pharma B2B Landing Page (Q3/2026)

Dự án Landing Page Tri ân Khách hàng B2B (Bác sĩ, Nhà thuốc, Phòng khám tại Lào) của NNC Pharma.
Dự án được tối ưu hóa theo kiến trúc **Web tĩnh thuần (Pure HTML/CSS/JS)** - Không sử dụng React/Build step giúp tải trang cực nhanh, đạt hiệu suất SEO cao và cực kỳ dễ dàng bảo trì hoặc chỉnh sửa bằng AI.

## 📁 Cấu trúc thư mục dự án

```text
B2B-ladipage/
├── index.html           # File giao diện HTML chính (Gồm 5 bước phễu & Vòng quay)
├── style.css            # Toàn bộ Style CSS & Responsive layout
├── script.js            # Logic phễu đăng ký, Vòng quay Canvas, WhatsApp & Google Sheet
├── images/              # Thư mục chứa hình ảnh sản phẩm & quà tặng
├── firebase.json        # Cấu hình Firebase Hosting
├── .firebaserc          # Cấu hình Firebase Project ID (sales-online-e8186)
├── google-apps-script.gs# Mã nguồn lưu Lead về Google Sheet (Xem HUONG-DAN-CAI-DAT.md)
└── README.md            # Tài liệu hướng dẫn dự án
```

## 🚀 Hướng dẫn chạy thử (Local Development)

Vì đây là dự án HTML/JS thuần, bạn không cần cài đặt Node.js hay `npm install`.

### Cách 1: Sử dụng VS Code Live Server (Khuyên dùng)
1. Mở thư mục này trong **VS Code**.
2. Cài extension **Live Server**.
3. Phải chuột vào `index.html` -> Chọn **Open with Live Server**.

### Cách 2: Sử dụng Firebase CLI
```powershell
firebase serve --only hosting
```
Truy cập: `http://localhost:5000`

---

## ⚙️ Cấu hình quan trọng (File `script.js`)

Mọi thông số cấu hình chính nằm ở ngay đầu file `script.js`:
```javascript
const CONFIG = {
  whatsappNumber: '8562099806327', // SĐT WhatsApp tư vấn B2B
  sheetWebhookUrl: '',             // Webhook Google Apps Script để lưu Lead về Sheet
  campaignEndDate: '2026-10-01T00:00:00+07:00', // Ngày hết hạn chương trình
  referralPrefix: 'NNC-REF-'       // Tiền tố mã giới thiệu
};
```

---

## 🌐 Deploy lên sản phẩm (Firebase Hosting)

Đã cấu hình sẵn cho Firebase Hosting. Để cập nhật trang web live trên internet:

```powershell
firebase deploy --only hosting
```

Trang live chính thức: [https://salesonlinennc.web.app](https://salesonlinennc.web.app)

---

## 🏗 Phương án Triển khai & Cấu trúc Hoạt động (Kiến trúc Hệ thống)

### 1. Kiến trúc Tổng thể (Architecture)
- **Frontend (Giao diện):** HTML5, CSS3, JavaScript thuần (Vanilla JS). Lý do chọn Vanilla JS là để tối ưu hóa cực đại tốc độ tải trang, giảm thiểu băng thông (đặc biệt quan trọng khi chạy Ads mạng 3G/4G), và giúp AI/Lập trình viên dễ dàng bảo trì mà không cần build tool (Webpack, Vite).
- **Hosting (Lưu trữ):** Firebase Hosting. Cung cấp CDN toàn cầu (Edge Caching) giúp tốc độ truy cập tại Lào cực kỳ nhanh.
- **Backend (Xử lý Dữ liệu):** Google Apps Script (GAS) + Google Sheets.
  - Form thu thập dữ liệu (Tên, SĐT, Kênh Liên hệ, Nhu cầu Sản phẩm...) được Gửi qua API HTTP POST (fetch) trực tiếp đến Webhook của Google Apps Script.
  - Apps Script xử lý, lưu trữ dữ liệu vào Google Sheets (như một Database mini) theo thời gian thực (Real-time).
- **Integration (Tích hợp):** WhatsApp API URL Schemes (`wa.me`). Khi khách lên thử đơn hàng, hệ thống bóc tách mảng giỏ hàng, đóng gói thành text JSON/String và gửi đẩy qua giao thức URL sang ứng dụng WhatsApp của người dùng.

### 2. Luồng Người dùng & UX/UI (User Flow)
1. **Bước 1: Form Đăng ký (Premium Form)** -> Khách hàng điền thông tin liên hệ và Tick chọn Nhu cầu sản phẩm (Chips).
2. **Bước 2: Xác nhận Thể lệ (PDF View)** -> Khách hàng buộc phải xem ảnh PDF chi tiết. Hệ thống có cơ chế kiểm soát thao tác cuộn: Người dùng **bắt buộc phải cuộn (scroll)** xuống tới cuối ảnh PDF thì hộp kiểm "Tôi đã xem và hiểu" mới được Mở khóa (Enable) tránh tình trạng lướt qua mà chưa đọc.
3. **Bước 3: Vòng Quay May Mắn (Lucky Wheel)** -> Ứng dụng thuật toán ngẫu nhiên (hoặc fix cứng tỷ lệ trúng) để quay ra quà tặng.
4. **Bước 4: Form Lên thử Đơn hàng (Invoice Form)** -> Giao diện chuẩn Hóa đơn siêu thị. Tính toán chiết khấu tự động (Real-time calculation). Tự động theo dõi mốc KIP để đổi màu hộp thành Xanh lá (Premium Tier) và nhảy % chiết khấu trực quan.
5. **Bước 5: Chốt Đơn (WhatsApp Handoff)** -> Gửi toàn bộ data về WhatsApp Hotline B2B.

### 3. Quản lý Cache & Phiên bản (Cache Busting Strategy)
- Do Firebase Hosting lưu Cache (CDN) rất cứng, khi deploy các bản cập nhật UI/UX, trình duyệt thường không nhận được thay đổi.
- **Phương án giải quyết:** Sử dụng tham số phiên bản `?v=X` ở cuối link file tĩnh (Ví dụ: `style.css?v=3` và `script.js?v=3`). Khi có cập nhật mới, chỉ cần đổi số version này trong file `index.html`, toàn bộ trình duyệt của người truy cập sẽ lập tức tải lại file mới nhất bỏ qua Local Cache.

### 4. Triển khai Thực tế (Deployment Workflow)
- **Local Dev:** Viết Code trên IDE (VS Code) / Antigravity IDE -> Kiểm tra bằng Live Server.
- **Commit:** `git add .` -> `git commit -m "nội dung"` -> `git push origin main` để lưu phiên bản gốc lên GitHub Repository (Quản lý Version Control).
- **Release:** Chạy lệnh `firebase deploy --only hosting` để đẩy source code lên hệ thống CDN toàn cầu của Google Firebase.
