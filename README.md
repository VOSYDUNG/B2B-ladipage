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
