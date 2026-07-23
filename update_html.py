import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# Replace hardcoded 0.5% texts
content = content.replace("Giới thiệu Đối tác: Nhận 5% hoa hồng &amp; +0.5% chiết khấu!", "Mở rộng mạng lưới đối tác — nhận ngay 5% giá trị đơn đầu tiên")
content = content.replace("Giới thiệu Đồng nghiệp - Nhận thêm 0.5% chiết khấu", "Giới thiệu đồng nghiệp — nhận 5% giá trị đơn đầu của họ")
content = content.replace("Chia sẻ chương trình này tới đồng nghiệp. Anh/chị sẽ nhận thêm 0.5% chiết khấu tích lũy đơn sỉ gộp khi người được giới thiệu phát sinh doanh số đơn hàng đầu tiên.", "Chia sẻ mã dành riêng này tới đồng nghiệp sở hữu quầy thuốc/phòng khám. Khi họ chốt đơn đầu tiên cùng NNC, 5% giá trị đơn được khấu trừ trực tiếp vào đơn nhập kế tiếp của anh/chị. Đơn cử: đơn 10 triệu KIP — anh/chị nhận về 500.000 KIP.")

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)

print("Updated index.html")
