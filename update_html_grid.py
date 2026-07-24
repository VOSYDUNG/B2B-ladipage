import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

new_grid = """<div class="wheel-rewards-showcase-grid">
          <div class="reward-showcase-item">
            <span class="rsi-icon">📱</span>
            <div class="rsi-info">
              <strong data-i18n="reward.samsung_title">Điện thoại Samsung Galaxy A16</strong>
              <small data-i18n="reward.samsung_desc">Phần quà đặc biệt</small>
            </div>
          </div>
          <div class="reward-showcase-item">
            <span class="rsi-icon">❤️</span>
            <div class="rsi-info">
              <strong data-i18n="reward.omron_title">Máy đo huyết áp Omron</strong>
              <small data-i18n="reward.omron_desc">Thiết bị y tế chính hãng</small>
            </div>
          </div>
          <div class="reward-showcase-item">
            <span class="rsi-icon">⚖️</span>
            <div class="rsi-info">
              <strong data-i18n="reward.scale_title">Cân sức khỏe điện tử</strong>
              <small data-i18n="reward.scale_desc">Cân điện tử tiện ích</small>
            </div>
          </div>
          <div class="reward-showcase-item">
            <span class="rsi-icon">🎫</span>
            <div class="rsi-info">
              <strong data-i18n="reward.v200k_title">Voucher 200.000 KIP</strong>
              <small data-i18n="reward.v200k_desc">Áp dụng vật tư y tế &amp; thuốc</small>
            </div>
          </div>
          <div class="reward-showcase-item">
            <span class="rsi-icon">🎫</span>
            <div class="rsi-info">
              <strong data-i18n="reward.v100k_title">Voucher 100.000 KIP</strong>
              <small data-i18n="reward.v100k_desc">Áp dụng vật tư y tế &amp; thuốc</small>
            </div>
          </div>
          <div class="reward-showcase-item">
            <span class="rsi-icon">💊</span>
            <div class="rsi-info">
              <strong data-i18n="reward.sample_title">Thuốc mẫu &lt;100k</strong>
              <small data-i18n="reward.sample_desc">1 trong 5 mã đạt chuẩn</small>
            </div>
          </div>
        </div>"""

html = re.sub(r'<div class="wheel-rewards-showcase-grid">.*?</div>\s*<button type="button" class="btn-proceed-cart"', new_grid + '\n\n        <button type="button" class="btn-proceed-cart"', html, flags=re.DOTALL)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
