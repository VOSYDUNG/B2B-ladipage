# TÀI LIỆU LƯU VẾT CHỈNH SỬA TEXT & LOGIC (TRACE LOG)
**Cập nhật lần cuối:** 24/07/2026 (Sau cuộc họp 13h30)
**Người thực hiện:** AI Assistant
**Mục đích tài liệu:** Lưu vết các thay đổi về Text so với log gốc của anh Sơn gửi (File Excel). Phục vụ cho việc dùng AI (Gemini) để dịch lại sang tiếng Lào trong tương lai và nắm bắt lý do tại sao một số nội dung bị cắt bỏ.

---

## 1. Các phần Text ĐÃ BỊ XÓA BỎ (Removed Texts)
Để tránh việc Gemini dịch thừa, những text sau đây đã bị xóa khỏi UI và không cần phải dịch lại sang tiếng Lào:

- **Khảo sát sản phẩm (Form):**
  - *Text bị xóa:* "KHẢO SÁT NHANH: SẢN PHẨM ANH/CHỊ ĐANG QUAN TÂM" & "Tôi quan tâm sản phẩm này" (và tất cả danh sách tên sản phẩm trong bảng khảo sát).
  - *Lý do xóa:* Rút ngắn Form đăng ký, tối ưu tỷ lệ chuyển đổi (Conversion Rate). Tránh bắt khách hàng click quá nhiều bước.
  - *Thời điểm xóa:* Cập nhật 13h30 ngày 24/07/2026.

- **Khối Cơ cấu giải thưởng ở Bước 3 (Showcase Grid):**
  - *Text bị xóa:* "Cơ Cấu 6 Phần Quà 100% Trúng" và "Mọi đơn hàng Q3 đều được áp dụng đồng thời các quyền lợi & quà tặng dưới đây:" tại Bước 3.
  - *Lý do xóa:* Tránh rườm rà. Muốn khách hàng khi tới Bước 3 là sẽ bấm quay luôn để có trải nghiệm nhanh, vì cơ cấu quà đã hiện rõ ở vòng quay.
  
- **Điều kiện áp dụng tại Popup Trúng Thưởng:**
  - *Text bị xóa:* Biến nội dung điều kiện áp dụng (Ví dụ: "Trừ trực tiếp 100.000 KIP vào hóa đơn nhập hàng...").
  - *Lý do xóa:* Tối ưu trải nghiệm sung sướng khi vừa trúng giải. Không làm tụt cảm xúc của khách hàng bằng những dòng điều kiện ràng buộc. (Lưu ý: Các câu điều kiện này vẫn được giữ ngầm trong JS nếu sau này cần dùng lại, nhưng KHÔNG hiển thị trên màn hình trúng).

---

## 2. Các phần Text ĐÃ BỊ SỬA ĐỔI / THÊM MỚI (New Texts to Translate)
Đây là những text MỚI không nằm trong file Excel của anh Sơn, hoặc đã được viết lại. **Cần dùng Gemini dịch sang Tiếng Lào cho các text này:**

### a. Đoạn mô tả Form Đăng ký (Chuẩn SEO)
- **Nguồn gốc cũ:** Text cũ (*"Thông tin giúp NNC trao quà đúng người..."*) là do AI (tôi) tự sinh ra trong các bản demo trước để lấp đầy layout. Không có trong file của a Sơn.
- **Text MỚI hiện tại:** *"Đăng ký thông tin chính xác để nhận báo giá sỉ thiết bị y tế và dược phẩm từ NNC Pharma. Chuyên viên của chúng tôi sẽ liên hệ hỗ trợ bạn 1-1 qua WhatsApp."*
- **Lý do đổi:** Viết lại chuẩn SEO và thể hiện đúng mục đích thu thập lead của chương trình.

### b. Loại hình kinh doanh (Business Type)
- **Text MỚI thêm vào:** 
  - *"Loại hình kinh doanh"*
  - *"Bệnh viện / Phòng khám"*
  - *"Nhà thuốc"*
- **Nguồn gốc:** Thêm mới theo yêu cầu họp 13h30. 

### c. Tiêu đề Lên Đơn (Bước 4)
- **Text MỚI thêm vào:** *"BƯỚC 4/5: LÊN ĐƠN HÀNG TÍCH LŨY"*
- **Nguồn gốc:** Bổ sung theo yêu cầu họp 13h30 vì layout trước đó bị hụt mất thẻ Heading, gây đứt đoạn UX.

### d. Ngày tháng năm sinh
- **Text MỚI thêm vào:** *"Ngày tháng năm sinh"*
- **Lý do:** Yêu cầu bổ sung dữ liệu khách hàng.

---

## 3. Các thay đổi về Thông số (Parameters)
- **WhatsApp Contact:** Số điện thoại cũ `020 9980 6327` (Text Placeholder của AI) -> Số chính thức: **`020 9535 5355`** (Mount data: `8562095355355`). Toàn bộ link Click to Chat và UI Text đều đã đồng bộ về số này. 

*(Tài liệu này được lưu tại thư mục gốc của dự án `TEXT_TRACE_LOG.md` để team dễ dàng truy xuất).*
