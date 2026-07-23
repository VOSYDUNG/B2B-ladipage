import re

with open("script.js", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("của cả 7 sản phẩm", "của cả 6 sản phẩm")
content = content.replace("Doanh số 7 sản phẩm", "Doanh số 6 sản phẩm")
content = content.replace("ຍອດຂາຍທັງ 7 ຜະລິດຕະພັນ", "ຍອດຂາຍທັງ 6 ຜະລິດຕະພັນ")
content = content.replace("ຍອດຂາຍ 7 ຜະລິດຕະພັນ", "ຍອດຂາຍ 6 ຜະລິດຕະພັນ")
content = content.replace("quantity of 7 products", "quantity of 6 products")
content = content.replace("7 Participating Products", "6 Participating Products")

with open("script.js", "w", encoding="utf-8") as f:
    f.write(content)

with open("index.html", "r", encoding="utf-8") as f:
    content_html = f.read()

content_html = content_html.replace("7 dòng sản phẩm", "6 dòng sản phẩm")

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content_html)

print("Updated 7 to 6 in script.js and index.html")
