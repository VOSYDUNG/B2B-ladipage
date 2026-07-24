import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Goal 6: Remove the showcase grid
html = re.sub(r'<div class="wheel-rewards-showcase-grid">.*?</div>\s*<button type="button" class="btn-proceed-cart"', '<button type="button" class="btn-proceed-cart"', html, flags=re.DOTALL)

# Goal 8: Add title header for order form
order_header = """<div class="wheel-showcase-header" style="margin-bottom: 1.5rem;">
          <span class="showcase-tag" data-i18n="stepper.step4">BƯỚC 4/5: LÊN ĐƠN HÀNG</span>
          <h3 data-i18n="cart.title">Lên Đơn Hàng Tích Lũy</h3>
        </div>"""
html = html.replace('<div class="order-form-products">', order_header + '\n        <div class="order-form-products">')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
