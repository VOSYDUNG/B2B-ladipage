import json
import pandas as pd

# Load JSON
with open('d:/WORK/LandipageB2B/translations.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Define groupings to represent the flow of the screen from top to bottom
FLOW_GROUPS = [
    ('nav', '1. Thanh Điều Hướng (Navigation)'),
    ('hero', '2. Màn Hình Chính (Hero Section)'),
    ('stepper', '3. Thanh Tiến Độ Bước (Stepper)'),
    ('trust', '4. Niềm Tin (Trust Badges)'), # Might not be in the current json, but just in case
    ('program', '5. Modal Xác Nhận Chính Sách (Gate)'),
    ('products', '6. Danh Mục Sản Phẩm (Catalog)'),
    ('survey', '7. Khảo Sát Nhu Cầu (Survey)'),
    ('acc', '8. Bảng Quyền Lợi (Accumulation Policy)'),
    ('calc', '9. Bảng Tính Lợi Nhuận (Calculator)'),
    ('wheel', '10. Vòng Quay May Mắn (Lucky Wheel)'),
    ('reward', '11. Cơ Cấu Quà Tặng (Rewards List)'),
    ('form', '12. Form Đăng Ký (Registration Form)'),
    ('modal', '13. Popup Sản Phẩm (Product Modal)'),
    ('cart', '14. Lên Đơn Hàng (Cart/Invoice)'),
    ('invoice', '15. PDF Báo Giá Nháp (Invoice PDF Modal)'),
    ('result', '16. Kết Quả Quay & Liên Kết (Results/Referral)'),
    ('referral_cta', '17. Banner Mời Đồng Nghiệp (Referral CTA)'),
    ('completion', '18. Màn Hình Hoàn Tất (Completion Screen)'),
    ('pdf', '19. PDF Chi Tiết (PDF Brochure)'),
    ('rules', '20. Thể Lệ Chương Trình (Rules Modal)'),
    ('footer', '21. Chân Trang (Footer)')
]

def get_group_name(key):
    prefix = key.split('.')[0]
    for pfx, name in FLOW_GROUPS:
        if prefix == pfx:
            return name
    return '22. Các Thành Phần Khác'

def create_excel_for_lang(lang_code, filename):
    lang_data = data.get(lang_code, {})
    
    rows = []
    for key, value in lang_data.items():
        rows.append({
            'Màn Hình / Vị Trí': get_group_name(key),
            'Key Code (Tham chiếu code)': key,
            'Nội Dung Hiển Thị': value,
            'Ghi Chú': ''
        })
        
    df = pd.DataFrame(rows)
    
    # Sort by the Group Name so it flows chronologically
    df.sort_values(by='Màn Hình / Vị Trí', inplace=True)
    df.reset_index(drop=True, inplace=True)
    df.index += 1
    df.index.name = 'STT'
    
    # Write to Excel with formatting using Pandas ExcelWriter
    with pd.ExcelWriter(filename, engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name=f'NNC_B2B_{lang_code.upper()}')
        
        workbook = writer.book
        worksheet = writer.sheets[f'NNC_B2B_{lang_code.upper()}']
        
        # Adjust column widths
        worksheet.column_dimensions['A'].width = 5
        worksheet.column_dimensions['B'].width = 40
        worksheet.column_dimensions['C'].width = 25
        worksheet.column_dimensions['D'].width = 80
        worksheet.column_dimensions['E'].width = 30
        
        # Enable wrap text for column D
        for cell in worksheet['D']:
            cell.alignment = cell.alignment.copy(wrapText=True, vertical='top')

create_excel_for_lang('vi', 'd:/WORK/LandipageB2B/NNC_Translations_VI.xlsx')
create_excel_for_lang('lo', 'd:/WORK/LandipageB2B/NNC_Translations_LO.xlsx')

print('Excel files generated successfully!')
