import { useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function App() {
  useEffect(() => {
    (window as any).db = db;
    (window as any).collection = collection;
    (window as any).addDoc = addDoc;
    (window as any).serverTimestamp = serverTimestamp;

    // We can directly call the script here or let it be loaded from public/script.js
    const script = document.createElement('script');
    script.src = '/script.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: `\n\n  <!-- Header -->\n  <header class=\"app-header\">\n    <div class=\"header-container\">\n      <div class=\"logo-area\">\n        <img src=\"/images/nnc-logo-160.webp\" alt=\"NNC Pharma\" class=\"logo-img\">\n        <div class=\"logo-text\">\n          <strong class=\"brand-name\">NNC PHARMA</strong>\n          <span class=\"brand-tag\">B2B \u00b7 Q3 2026 \u00b7 LAOS</span>\n        </div>\n      </div>\n      \n      <nav class=\"header-nav\">\n        <a href=\"#products\" data-i18n=\"nav.products\">S\u1ea3n ph\u1ea9m</a>\n        <a href=\"#accumulation\" data-i18n=\"nav.accumulation\">T\u00edch l\u0169y</a>\n        <a href=\"#hero-wheel-container\" data-i18n=\"nav.wheel\">V\u00f2ng quay</a>\n      </nav>\n\n      <div class=\"header-actions\">\n        <!-- Language Selector -->\n        <div class=\"lang-switch\">\n          <button type=\"button\" id=\"btn-lang-vi\" class=\"active\" onclick=\"switchLanguage('vi')\">VI</button>\n          <button type=\"button\" id=\"btn-lang-lo\" onclick=\"switchLanguage('lo')\">\u0ea5\u0eb2\u0ea7</button>\n        </div>\n        <button type=\"button\" class=\"btn-whatsapp-consult\" onclick=\"openWhatsApp('general')\">\n          <svg class=\"icon-whatsapp\" viewBox=\"0 0 24 24\" fill=\"currentColor\">\n            <path d=\"M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.03-5.114-2.905-6.99C16.557 1.87 14.07 1.834 11.44 1.834c-5.44 0-9.868 4.42-9.872 9.867a9.813 9.813 0 0 0 1.5 4.85l-.988 3.606 3.69-.968zm11.233-6.84c-.303-.152-1.793-.884-2.071-.985-.278-.1-.482-.152-.68.152-.2.303-.774.985-.95 1.187-.176.202-.351.228-.654.076-.303-.152-1.278-.47-2.435-1.503-.9-.8-1.51-1.787-1.686-2.09-.176-.303-.02-.467.132-.618.136-.137.303-.351.455-.527.152-.176.202-.303.303-.506.1-.202.05-.38-.025-.53-.075-.152-.682-1.644-.934-2.253-.247-.597-.497-.516-.68-.527-.176-.01-.38-.012-.582-.012-.202 0-.53.076-.807.38-.278.303-1.062 1.037-1.062 2.529 0 1.493 1.087 2.935 1.238 3.137.152.202 2.138 3.262 5.18 4.58.724.313 1.289.5 1.73.64.728.23 1.39.197 1.91.12.58-.087 1.794-.733 2.048-1.443.254-.71.254-1.317.177-1.443-.077-.126-.278-.202-.582-.354z\"/>\n          </svg>\n          <span>WhatsApp</span>\n        </button>\n      </div>\n    </div>\n  </header>\n\n  <!-- Hero Section with Integrated Wheel (The Play Hook) -->\n  
  <!-- Hero Section -->
  <section class=\"campaign-hero\" id=\"hero-wheel-container\">
    <picture class=\"campaign-hero__media\">
      <source media=\"(max-width: 767px)\" srcset=\"/images/visual_mobile.png\" />
      <img src=\"/images/visual_desktop.png\" alt=\"NNC Pharma B2B Campaign\" />
    </picture>
    <div class="campaign-hero__content">
      <div class="campaign-hero__copy">
        <p class="hero-eyebrow" data-i18n="hero.eyebrow">NNC PHARMA · CHƯƠNG TRÌNH TRI ÂN ĐỐI TÁC B2B Q3/2026</p>
        
        <h1 class="hero-title">
          <span data-i18n="hero.title_part1">100% QUAY LÀ TRÚNG QUÀ</span>
          <span class="highlight" data-i18n="hero.title_part2">CHIẾT KHẤU TÍCH LŨY ĐẾN 10%</span>
        </h1>
        
        <p class="hero-subtitle" data-i18n="hero.subtitle">
          Dành riêng Nhà thuốc & Phòng khám tại Lào. Hoàn thành 2 bước để mở khóa lượt quay — mọi lượt quay đều có quà.
        </p>

        <div class="campaign-hero__actions">
          <button type="button" class="btn-primary" onclick="setFlowState('register')" data-i18n="hero.cta_main">ĐĂNG KÝ THAM GIA NGAY</button>
          <button type="button" class="btn-secondary" onclick="setFlowState('register')" data-i18n="hero.cta_secondary">XEM CHƯƠNG TRÌNH</button>
        </div>
      </div>
    </div>
  </section>
  
  <!-- Live Winner Activity Ticker / Timeline Stream (Replaces static stepper under Hero) -->
  <section class="hero-live-ticker-section" id="hero-live-ticker">
    <div class="ticker-badge">
      <span class="pulse-live-dot"></span>
      <span class="ticker-badge-text" data-i18n="ticker.live_badge">TRỰC TIẾP</span>
    </div>
    <div class="ticker-track-wrapper">
      <div class="ticker-track" id="ticker-track">
        <!-- Live activity cards dynamically populated in script.js -->
      </div>
    </div>
  </section>


  <!-- Trust Badges & Shocking Hooks Section (Marketing Conversion Hook) -->
  <section class="trust-hooks-section">
    <div class="trust-container">
      <div class="trust-item">
        <div class="trust-icon-circle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <div class="trust-info">
          <h4 data-i18n="trust.title1">SẢN PHẨM CHÍNH HÃNG</h4>
          <p data-i18n="trust.desc1">Chất lượng kiểm định nghiêm ngặt</p>
        </div>
      </div>
      <div class="trust-item">
        <div class="trust-icon-circle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
        </div>
        <div class="trust-info">
          <h4 data-i18n="trust.title2">GIAO HÀNG SIÊU TỐC</h4>
          <p data-i18n="trust.desc2">Phân phối nhanh chóng toàn quốc</p>
        </div>
      </div>
      <div class="trust-item">
        <div class="trust-icon-circle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
        </div>
        <div class="trust-info">
          <h4 data-i18n="trust.title3">1.000+ PHẦN QUÀ SỈ</h4>
          <p data-i18n="trust.desc3">Tổng giá trị sỉ lên đến 500.000.000 KIP</p>
        </div>
      </div>
      <div class="trust-item">
        <div class="trust-icon-circle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <div class="trust-info">
          <h4 data-i18n="trust.title4">ĐỒNG HÀNH BỀN VỮNG</h4>
          <p data-i18n="trust.desc4">Hỗ trợ quầy kệ và tài liệu điều trị</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Product Catalog (Commercial Marketing Layout - Asymmetric 3 + 4 Grid) -->
  <section id="products" class="products-section">
    <div class="products-bg-decorations">
      <div class="glow-orb orb-1"></div>
      <div class="glow-orb orb-2"></div>
    </div>
    <div class="section-header">
      <span class="section-tag" data-i18n="products.eyebrow">DANH MỤC CHÍNH THỨC</span>
      <h2 class="section-title" data-i18n="products.title">7 Dòng Sản Phẩm Tích Lũy Doanh Số Q3</h2>
      <p class="section-desc" data-i18n="products.desc">Xem thông tin sản phẩm và chính sách kinh doanh sỉ. Cả 7 sản phẩm đều cộng dồn chung doanh số lũy tiến.</p>
    </div>

    <!-- Asymmetric 3 Flagships + 4 High-Rotation support grid -->
    <div class="asymmetric-catalog-container">
      
      <!-- Flagships Row (First tier: 3 items) -->
      <div class="catalog-row-title" data-i18n="products.flagships_title">DÒNG SẢN PHẨM CHỦ LỰC KÊ ĐƠN (3 SẢN PHẨM CHÍNH)</div>
      <div class="products-asym-grid flagship-grid" id="flagship-products-grid">
        <!-- JS dynamic flagship cards -->
      </div>

      <!-- Supporting Row (Second tier: 4 items) -->
      <div class="catalog-row-title mt-row" data-i18n="products.support_title">DANH MỤC THẢO DƯỢC & KHÁNG SINH PEDIATRIC BỔ TRỢ (4 SẢN PHẨM)</div>
      <div class="products-asym-grid support-grid" id="support-products-grid">
        <!-- JS dynamic support cards -->
      </div>

    </div>
  </section>

  <!-- Accumulation Policy & Interactive Profit Simulator -->
  <section id="accumulation" class="calculator-section">
    <div class="calculator-container">
      
      <!-- Left column: Tiers Policy Details -->
      <div class="policy-details">
        <span class="section-tag green" data-i18n="acc.eyebrow">BẢNG QUYỀN LỢI TÍCH LŨY</span>
        <h2 class="section-title white" data-i18n="acc.title">Cơ chế Doanh số gộp Lũy tiến</h2>
        <p class="section-desc text-white-60" data-i18n="acc.desc">Nhập sỉ gộp đơn 6 dòng sản phẩm NNC, nhận chiết khấu trực tiếp trên đơn và thưởng cộng dồn suốt quý.</p>
        
        <div class="tiers-table">
          <div class="table-header">
            <span data-i18n="acc.tbl_tier">Bậc tích lũy</span>
            <span data-i18n="acc.tbl_range">Doanh số Quý (KIP)</span>
            <span data-i18n="acc.tbl_direct">Chiết khấu trực tiếp</span>
            <span data-i18n="acc.tbl_quarter">Thưởng cuối Quý</span>
            <span data-i18n="acc.tbl_total">Tổng lợi ích</span>
          </div>
          <div class="table-body">
            <div class="table-row" onclick="setSimulatedRevenue(3000000)">
              <strong>Bậc 1</strong>
              <span>2,000,000 — 6,000,000</span>
              <span class="direct">5%</span>
              <span class="bonus">2%</span>
              <strong class="total">7%</strong>
            </div>
            <div class="table-row" onclick="setSimulatedRevenue(8000000)">
              <strong>Bậc 2</strong>
              <span>6,000,000 — 12,000,000</span>
              <span class="direct">5%</span>
              <span class="bonus">3%</span>
              <strong class="total">8%</strong>
            </div>
            <div class="table-row" onclick="setSimulatedRevenue(15000000)">
              <strong>Bậc 3</strong>
              <span>12,000,000 — 25,000,000</span>
              <span class="direct">5%</span>
              <span class="bonus">4%</span>
              <strong class="total">9%</strong>
            </div>
            <div class="table-row" onclick="setSimulatedRevenue(28000000)">
              <strong>Bậc 4</strong>
              <span>Từ 25,000,000 trở lên</span>
              <span class="direct">5%</span>
              <span class="bonus">5%</span>
              <strong class="total">10%</strong>
            </div>
          </div>
        </div>

        <div class="policy-note">
          <svg class="icon-info" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span data-i18n="acc.note">Chương trình bán lẻ KHÔNG áp dụng đồng thời chương trình hàng tặng 30+1.</span>
        </div>

        <!-- PDF rules viewer button -->
        <button type="button" class="btn-view-rules-pdf" onclick="openRulesPdfModal()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          <span data-i18n="calc.view_pdf">Xem chi tiết chương trình (PDF)</span>
        </button>
      </div>

      <!-- Right column: Profit Simulator Card -->
      <div class="calculator-card">
        <h3 data-i18n="calc.title">Bảng tính Bài toán Kinh tế giả lập</h3>
        <p class="calc-subtitle" data-i18n="calc.subtitle">Kéo thanh trượt để giả lập doanh số nhập sỉ và dòng tiền tiết kiệm được.</p>
        
        <div class="simulator-slider-wrapper">
          <div class="slider-labels">
            <span data-i18n="calc.revenue_label">Doanh số đặt hàng dự kiến:</span>
            <span class="simulated-value" id="sim-revenue-text">12,000,000 KIP</span>
          </div>
          <input type="range" id="revenue-slider" min="0" max="30000000" step="500000" value="12000000" oninput="updateSimulation(this.value)">
          <div class="slider-ticks">
            <span>0</span>
            <span>6M KIP</span>
            <span>12M KIP</span>
            <span>25M+ KIP</span>
          </div>
        </div>

        <!-- Simulated Results Panel -->
        <div class="sim-results-panel">
          <div class="sim-row">
            <span data-i18n="calc.immediate_label">Giảm giá trực tiếp (5%):</span>
            <span class="sim-val" id="sim-immediate-val">600,000 KIP</span>
          </div>
          <div class="sim-row">
            <span>
              <span data-i18n="calc.quarter_label">Thưởng cuối Quý tích lũy:</span>
              <strong class="sim-rate-badge" id="sim-quarter-rate">(4%)</strong>
            </span>
            <span class="sim-val" id="sim-quarter-val">480,000 KIP</span>
          </div>
          <div class="sim-row total-savings">
            <span data-i18n="calc.total_label">Tổng tiền sỉ tiết kiệm được:</span>
            <strong class="sim-valHighlight" id="sim-total-val">1,080,000 KIP</strong>
          </div>
        </div>

        <!-- Next Tier Nudge Alert -->
        <div class="next-tier-nudge" id="next-tier-nudge-box">
          <!-- JS dynamic nudges -->
        </div>

        <div class="sim-tier-badge" id="sim-tier-name-badge">
          Bậc tích lũy dự kiến: Bậc 3
        </div>
      </div>

    </div>
  </section>

  <!-- Funnel Content Section (Popup Modal Overlay - Zero Page Scroll, 100% Focused) -->
  <div class="funnel-modal-overlay" id="funnel-modal-overlay" style="display: none;">
    <div class="funnel-modal-card-container" onclick="event.stopPropagation()">
      <button type="button" class="btn-funnel-modal-close" onclick="closeFunnelModal()">×</button>
      
      <!-- Mini Stepper Indicator Progress -->
      <div class="modal-stepper-wrapper mb-4">
        <div class="stepper-steps">
          <div class="stepper-step active" id="modal-step-node-1">
            <div class="step-icon">1</div>
            <div class="step-label" data-i18n="stepper.step1">Đăng ký</div>
          </div>
          <div class="stepper-line" id="modal-step-line-1"></div>
          <div class="stepper-step" id="modal-step-node-2">
            <div class="step-icon">2</div>
            <div class="step-label" data-i18n="stepper.step2">Chương trình</div>
          </div>
          <div class="stepper-line" id="modal-step-line-2"></div>
          <div class="stepper-step" id="modal-step-node-3">
            <div class="step-icon">3</div>
            <div class="step-label" data-i18n="stepper.step3">Quay thưởng</div>
          </div>
          <div class="stepper-line" id="modal-step-line-3"></div>
          <div class="stepper-step" id="modal-step-node-4">
            <div class="step-icon">4</div>
            <div class="step-label" data-i18n="stepper.step4">Đơn hàng</div>
          </div>
          <div class="stepper-line" id="modal-step-line-4"></div>
          <div class="stepper-step" id="modal-step-node-5">
            <div class="step-icon">5</div>
            <div class="step-label" data-i18n="stepper.step5">Hoàn thành</div>
          </div>
        </div>
      </div>
      
      <!-- Registration Card -->
      <div class="premium-register-form-card" id="register-card" style="display: none;">
        <span aria-hidden="true" class="premium-card-border-line"></span>
        <h3 data-i18n="form.title">Thông tin Đăng ký Đối tác B2B</h3>
        <p class="form-subtitle-desc" data-i18n="form.desc">Đăng ký thông tin chính xác để nhận báo giá sỉ thiết bị y tế và dược phẩm từ NNC Pharma. Chuyên viên của chúng tôi sẽ liên hệ hỗ trợ bạn 1-1 qua WhatsApp.</p>
        
        <form id="b2b-register-form" onsubmit="handleFormSubmit(event)" class="premium-b2b-grid-form">
          <div class="premium-field">
            <span class="field-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span data-i18n="form.fullname">Họ và tên người phụ trách</span>
            </span>
            <input type="text" id="fullname" placeholder="Ví dụ: Nguyễn Văn A" required>
          </div>

          <div class="premium-field">
            <span class="field-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span data-i18n="form.phone">Số điện thoại liên hệ</span>
            </span>
            <input type="tel" id="phone" placeholder="020 9535 5355" required>
          </div>

          <div class="premium-field wide">
            <span class="field-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              <span data-i18n="form.business">Tên Cơ sở y tế</span>
            </span>
            <input type="text" id="businessName" placeholder="Ví dụ: Vientiane Clinic" required>
          </div>

          <div class="premium-field wide">
            <span class="field-title-legend" data-i18n="form.business_type">Loại hình kinh doanh</span>
            <div style="display: flex; gap: 1.5rem; margin-top: 0.5rem;">
              <label style="display: flex; align-items: center; gap: 0.5rem; color: #374151; font-weight: 500; font-size: 0.95rem; cursor: pointer;">
                <input type="radio" name="businessType" value="hospital_clinic" required style="width: 1.2rem; height: 1.2rem; accent-color: #10b981;">
                <span data-i18n="form.hospital">Bệnh viện / Phòng khám</span>
              </label>
              <label style="display: flex; align-items: center; gap: 0.5rem; color: #374151; font-weight: 500; font-size: 0.95rem; cursor: pointer;">
                <input type="radio" name="businessType" value="pharmacy" required style="width: 1.2rem; height: 1.2rem; accent-color: #10b981;">
                <span data-i18n="form.pharmacy">Nhà thuốc</span>
              </label>
            </div>
          </div>

          <div class="premium-field wide">
            <span class="field-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span data-i18n="form.dob">Ngày tháng năm sinh</span>
            </span>
            <input type="date" id="dob" required style="color-scheme: dark;">
          </div>

          <div class="premium-field">
            <span class="field-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span data-i18n="form.province">Tỉnh / Thành phố tại Lào</span>
            </span>
            <input type="text" id="province" placeholder="Ví dụ: Vientiane" required>
          </div>

          <div class="premium-field">
            <span class="field-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
              <span data-i18n="form.ref_code">Mã giới thiệu (nếu có)</span>
            </span>
            <div class="referral-input-wrapper">
              <input type="text" id="referralCode" placeholder="NNC-…">
              <button type="button" class="btn-validate-referral" id="btn-validate-ref" onclick="validateReferralCode()">
                <span data-i18n="form.validate_btn">Kiểm tra</span>
              </button>
            </div>
            <span class="referral-status-msg" id="referral-status-msg"></span>
          </div>



          <label class="premium-consent-box wide">
            <input type="checkbox" id="consent" required checked>
            <span data-i18n="form.consent">Tôi đồng ý để NNC ghi nhận thông tin tham gia, nhu cầu sản phẩm, mã giới thiệu và nhóm quyền lợi; đồng thời liên hệ theo kênh tôi chọn để tư vấn sản phẩm, chính sách sỉ và hỗ trợ đặt hàng.</span>
          </label>

          <div class="premium-form-actions wide">
            <button type="submit" class="btn-submit-premium">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              <span data-i18n="form.submit_btn">LƯU THÔNG TIN & TIẾP TỤC</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Mandatory Program Review Card (gate before wheel) -->
      <div class="program-review-card" id="program-card" style="display: none;">
        <span aria-hidden="true" class="premium-card-border-line"></span>

        <div class="dynamic-pdf-preview" id="dynamic-pdf-preview">
          <!-- Will be rendered via JS in renderDynamicPdf() -->
        </div>
        
        <!-- High-Conversion Referral CTA Banner (Before Checkbox & Unlock) -->
        <div class="program-referral-cta-banner">
          <div class="cta-banner-header">
            <span class="cta-banner-tag" data-i18n="referral_cta.tag">🔥 THƯỞNG GIỚI THIỆU 5%</span>
          </div>
          <div class="cta-banner-body">
            <div class="cta-banner-icon">🤝</div>
            <div class="cta-banner-text">
              <h4 data-i18n="referral_cta.title">Mở rộng mạng lưới đối tác — nhận ngay 5% giá trị đơn đầu tiên</h4>
              <p data-i18n="referral_cta.desc">Cả 2 cùng nhận ưu đãi &amp; tích lũy doanh số khi dùng mã giới thiệu.</p>
            </div>
          </div>
        </div>

        <label class="program-ack-box" id="program-ack-label" style="opacity: 1; cursor: pointer; transition: all 0.3s ease;">
          <input type="checkbox" id="program-ack" onchange="onProgramAckChange()">
          <span data-i18n="program.ack_text">Tôi đã xem và hiểu chương trình tích lũy Q3/2026 của NNC Pharma.</span>
        </label>

        <button type="button" class="btn-unlock-wheel" id="btn-unlock-wheel" disabled onclick="confirmProgramViewed()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
          <span data-i18n="program.unlock_btn">MỞ KHÓA VÒNG QUAY QUÀ TẶNG</span>
        </button>
      </div>

      <!-- Step 3: Lucky Wheel Showcase Card inside Modal -->
      <div class="wheel-showcase-card" id="wheel-showcase-card" style="display: none;">
        <div class="wheel-showcase-header">
          <span class="showcase-tag" data-i18n="wheel.showcase_tag">BƯỚC 3/5: VÒNG QUAY QUÀ TẶNG</span>
          <h3 data-i18n="wheel.showcase_title">Cơ Cấu 6 Phần Quà 100% Trúng</h3>
          <p class="showcase-subtitle" data-i18n="wheel.showcase_sub">Mọi đơn hàng Q3 đều được áp dụng đồng thời các quyền lợi &amp; quà tặng dưới đây:</p>
        </div>

        <div style="display: flex; justify-content: center; margin: 2rem 0;">
          <div class="wheel-box-wrapper" id="target-wheel-box">
          <div class="wheel-pointer">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L4 14h16L12 2z"></path>
            </svg>
          </div>
          <div class="wheel-outer-ring">
            <img id="lucky-wheel-canvas" src="/images/mock-wheel-vi.png" alt="Lucky Wheel" style="width: 100%; height: 100%; display: block;" />
          </div>
          <div class="btn-spin" id="btn-spin-wheel" onclick="spinWheel()" style="cursor: pointer;" data-i18n="wheel.center_emblem">100%<br>TRÚNG QUÀ</div>
        </div>
        </div>

        <button type="button" class="btn-proceed-cart" style="background: linear-gradient(135deg, #f0b429, #f7cf5c); color: #12281f;" onclick="spinWheel()">
          <span data-i18n="wheel.spin_btn">QUAY NGAY →</span>
        </button>
      </div>

      <!-- Order Form (Cart) Card -->
      <div class="order-form-card" id="order-form-card" style="display: none;">
        <span aria-hidden="true" class="premium-card-border-line"></span>

        <div class="wheel-showcase-header" style="margin-bottom: 1.5rem;">
          <span class="showcase-tag" data-i18n="stepper.step4">BƯỚC 4/5: LÊN ĐƠN HÀNG</span>
          <h3 data-i18n="cart.title">Lên Đơn Hàng Tích Lũy</h3>
        </div>
        <div class="order-form-products">
          <ul class="order-products-list" id="order-products-list">
            <!-- JS dynamic list items for ordering 7 products -->
          </ul>
        </div>

        <div class="order-invoice-box" id="order-invoice-box">
          <!-- JS dynamic invoice -->
        </div>
        
        <div class="invoice-actions-compact">
          <button type="button" class="btn-skip-compact" onclick="skipOrderForm()" data-i18n="cart.skip">Bỏ qua</button>
          <button type="button" class="btn-whatsapp-compact" onclick="submitOrderWhatsApp()">
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.03-5.114-2.905-6.99C16.557 1.87 14.07 1.834 11.44 1.834c-5.44 0-9.868 4.42-9.872 9.867a9.813 9.813 0 0 0 1.5 4.85l-.988 3.606 3.69-.968zm11.233-6.84c-.303-.152-1.793-.884-2.071-.985-.278-.1-.482-.152-.68.152-.2.303-.774.985-.95 1.187-.176.202-.351.228-.654.076-.303-.152-1.278-.47-2.435-1.503-.9-.8-1.51-1.787-1.686-2.09-.176-.303-.02-.467.132-.618.136-.137.303-.351.455-.527.152-.176.202-.303.303-.506.1-.202.05-.38-.025-.53-.075-.152-.682-1.644-.934-2.253-.247-.597-.497-.516-.68-.527-.176-.01-.38-.012-.582-.012-.202 0-.53.076-.807.38-.278.303-1.062 1.037-1.062 2.529 0 1.493 1.087 2.935 1.238 3.137.152.202 2.138 3.262 5.18 4.58.724.313 1.289.5 1.73.64.728.23 1.39.197 1.91.12.58-.087 1.794-.733 2.048-1.443.254-.71.254-1.317.177-1.443-.077-.126-.278-.202-.582-.354z"/></svg>
            <span data-i18n="cart.send_whatsapp">Gửi đơn WhatsApp</span>
          </button>
        </div>

        
      </div>

      <!-- Completion/Thank-you Card -->
      <div class="completion-card" id="completion-card" style="display: none;">
        <div class="completion-icon-circle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h3 data-i18n="completion.title">Cảm ơn bạn đã lên đơn!</h3>
        <p class="completion-desc" data-i18n="completion.desc">Đơn hàng tham khảo của bạn đã được ghi nhận. Đội ngũ NNC sẽ liên hệ qua WhatsApp sớm nhất để hỗ trợ.</p>
        <div class="completion-tier-progress" id="completion-tier-progress"></div>
        <button type="button" class="btn-completion-whatsapp" onclick="openWhatsApp('completion')">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.03-5.114-2.905-6.99C16.557 1.87 14.07 1.834 11.44 1.834c-5.44 0-9.868 4.42-9.872 9.867a9.813 9.813 0 0 0 1.5 4.85l-.988 3.606 3.69-.968zm11.233-6.84c-.303-.152-1.793-.884-2.071-.985-.278-.1-.482-.152-.68.152-.2.303-.774.985-.95 1.187-.176.202-.351.228-.654.076-.303-.152-1.278-.47-2.435-1.503-.9-.8-1.51-1.787-1.686-2.09-.176-.303-.02-.467.132-.618.136-.137.303-.351.455-.527.152-.176.202-.303.303-.506.1-.202.05-.38-.025-.53-.075-.152-.682-1.644-.934-2.253-.247-.597-.497-.516-.68-.527-.176-.01-.38-.012-.582-.012-.202 0-.53.076-.807.38-.278.303-1.062 1.037-1.062 2.529 0 1.493 1.087 2.935 1.238 3.137.152.202 2.138 3.262 5.18 4.58.724.313 1.289.5 1.73.64.728.23 1.39.197 1.91.12.58-.087 1.794-.733 2.048-1.443.254-.71.254-1.317.177-1.443-.077-.126-.278-.202-.582-.354z"/></svg>
          <span data-i18n="completion.wa_btn">Nhắn tin qua WhatsApp</span>
        </button>
      </div>

    </div>
  </div>

  <!-- PDF Rules Modal -->
  <div class="modal-overlay" id="rules-pdf-modal" onclick="closeRulesPdfModal(event)">
    <div class="modal-card pdf-modal-card" onclick="event.stopPropagation()">
      <button type="button" class="btn-modal-close" onclick="hideRulesPdfModal()">×</button>
      <div class="modal-header">
        <h3 data-i18n="rules.title">Chi tiết chương trình</h3>
      </div>
      <div class="modal-body bg-slate-100">
        <div class="pdf-image-wrapper">
          <img src="/images/page-1.png" alt="NNC B2B Q3 2026 Program Rules" class="pdf-page-img">
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn-secondary" onclick="hideRulesPdfModal()" data-i18n="rules.close">Đóng</button>
        <a href="images/page-1.png" download="nnc-b2b-program-rules.png" class="btn-primary-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          <span data-i18n="rules.download">Tải xuống hình ảnh</span>
        </a>
      </div>
    </div>
  </div>

  <!-- Invoice Preview Modal -->
  <div class="modal-overlay" id="invoice-preview-modal" onclick="closeInvoicePreviewModal(event)">
    <div class="modal-card pdf-modal-card" onclick="event.stopPropagation()">
      <button type="button" class="btn-modal-close" onclick="hideInvoicePreviewModal()">×</button>
      <div class="modal-header">
        <h3 data-i18n="invoice.title">Xem trước bản PDF</h3>
      </div>
      <div class="modal-body bg-slate-100 flex-center">
        <div class="canvas-container">
          <canvas id="invoice-canvas" class="invoice-canvas"></canvas>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn-secondary" onclick="hideInvoicePreviewModal()" data-i18n="invoice.close">Đóng</button>
        <button type="button" class="btn-primary" onclick="downloadInvoiceImage()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          <span data-i18n="invoice.download">Tải xuống hình ảnh</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Product Detail Modal (Popup) -->
  <div class="modal-overlay" id="product-modal" onclick="closeProductModal(event)">
    <div class="modal-card" onclick="event.stopPropagation()">
      <button type="button" class="btn-modal-close" onclick="hideProductModal()">×</button>
      <div class="modal-grid">
        <div class="modal-visual">
          <img src="" alt="" id="modal-product-img">
        </div>
        <div class="modal-info">
          <span class="product-category-badge" id="modal-product-cat">Thảo dược</span>
          <h3 class="modal-product-title" id="modal-product-name">Tadimax</h3>
          <p class="modal-product-desc" id="modal-product-desc">Mô tả sản phẩm...</p>
          
          <div class="modal-meta">
            <div class="meta-row">
              <span data-i18n="modal.formulation">Hoạt chất & Hàm lượng:</span>
              <strong id="modal-product-formulation">Thảo dược sỉ</strong>
            </div>
            <div class="meta-row">
              <span data-i18n="modal.pack_size">Quy cách đóng gói:</span>
              <strong id="modal-product-pack">Hộp 42 viên</strong>
            </div>
            <div class="meta-row font-large">
              <span data-i18n="modal.price">Giá sỉ đề xuất tại Vientiane:</span>
              <strong class="text-emerald" id="modal-product-price">193,000 KIP</strong>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-whatsapp-inquire" onclick="inquireProductWhatsApp()">
              <svg class="icon-whatsapp-btn" viewBox="0 0 24 24" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.03-5.114-2.905-6.99C16.557 1.87 14.07 1.834 11.44 1.834c-5.44 0-9.868 4.42-9.872 9.867a9.813 9.813 0 0 0 1.5 4.85l-.988 3.606 3.69-.968zm11.233-6.84c-.303-.152-1.793-.884-2.071-.985-.278-.1-.482-.152-.68.152-.2.303-.774.985-.95 1.187-.176.202-.351.228-.654.076-.303-.152-1.278-.47-2.435-1.503-.9-.8-1.51-1.787-1.686-2.09-.176-.303-.02-.467.132-.618.136-.137.303-.351.455-.527.152-.176.202-.303.303-.506.1-.202.05-.38-.025-.53-.075-.152-.682-1.644-.934-2.253-.247-.597-.497-.516-.68-.527-.176-.01-.38-.012-.582-.012-.202 0-.53.076-.807.38-.278.303-1.062 1.037-1.062 2.529 0 1.493 1.087 2.935 1.238 3.137.152.202 2.138 3.262 5.18 4.58.724.313 1.289.5 1.73.64.728.23 1.39.197 1.91.12.58-.087 1.794-.733 2.048-1.443.254-.71.254-1.317.177-1.443-.077-.126-.278-.202-.582-.354z"/>
              </svg>
              <span data-i18n="modal.wa_btn">Tư vấn sỉ qua WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Wheel Result Modal (Survey completion unlocks this final state) -->
  <div class="modal-overlay" id="result-modal">
    <div class="modal-card result-modal-card">
      <div class="reward-sparkle-bg"></div>
      <h2 data-i18n="result.congrats">Chúc mừng anh/chị!</h2>
      <p class="result-intro-text" data-i18n="result.win_intro">Quyền lợi sỉ Q3 đã được ghi nhận thành công. Anh/chị đã trúng:</p>
      
      <div class="reward-highlight-box">
        <svg class="icon-gift" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 12 20 22 4 22 4 12"></polyline>
          <rect x="2" y="7" width="20" height="5"></rect>
          <line x1="12" y1="22" x2="12" y2="7"></line>
          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
        </svg>
        <h3 id="result-reward-name">Voucher giảm giá 10% đơn hàng sỉ</h3>
      </div>


      <!-- Referral Sharing Section -->
      <div class="referral-sharing-area">
        <h4 data-i18n="result.ref_title">Giới thiệu đồng nghiệp — nhận 5% giá trị đơn đầu của họ</h4>
        <p class="ref-desc text-white-60" data-i18n="result.ref_desc">Chia sẻ mã dành riêng này tới đồng nghiệp sở hữu quầy thuốc/phòng khám. Khi họ chốt đơn đầu tiên cùng NNC, 5% giá trị đơn được khấu trừ trực tiếp vào đơn nhập kế tiếp của anh/chị. Đơn cử: đơn 10 triệu KIP — anh/chị nhận về 500.000 KIP.</p>
        
        <div class="share-links-grid">
          <div class="share-box">
            <span data-i18n="result.ref_code">Mã giới thiệu của bạn:</span>
            <div class="copy-input">
              <code id="my-referral-code">NNC-DR-88888</code>
              <button type="button" onclick="copyToClipboard('code')">Copy</button>
            </div>
          </div>
          <div class="share-box">
            <span data-i18n="result.ref_link">Link chia sẻ nhanh:</span>
            <div class="copy-input">
              <code id="my-referral-link">https://nnc-b2b.web.app...</code>
              <button type="button" onclick="copyToClipboard('link')">Copy</button>
            </div>
          </div>
        </div>
      </div>

      <div class="result-actions-btns">
        <button type="button" class="btn-proceed-cart btn-continue-claim" onclick="proceedToCartStep()">
          <span data-i18n="result.cta_next">Tiếp tục nhận quà</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
      </div>
    </div>
  </div>



  <!-- Footer -->
  <footer class="app-footer">
    <div class="footer-container">
      <div class="footer-info">
        <div class="logo-area">
          <img src="/images/nnc-logo-160.webp" alt="NNC Pharma" class="logo-img">
          <strong class="brand-name white">NNC PHARMA CO., LTD.</strong>
        </div>
        <p class="footer-desc" data-i18n="footer.desc">Chương trình B2B Q3/2026 dành riêng cho bác sĩ, phòng khám, nhà thuốc và đối tác sỉ chính hãng của NNC Pharma tại Lào.</p>
      </div>
      <div class="footer-contact">
        <div style="display: flex; gap: 24px; flex-wrap: wrap;">
<span class="contact-number" onclick="openWhatsApp('general', '8562095355355')" style="display: flex; align-items: center; gap: 8px;">
<svg class="icon-whatsapp-btn" viewBox="0 0 24 24" fill="currentColor" style="width: 24px; height: 24px;">
<path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.03-5.114-2.905-6.99C16.557 1.87 14.07 1.834 11.44 1.834c-5.44 0-9.868 4.42-9.872 9.867a9.813 9.813 0 0 0 1.5 4.85l-.988 3.606 3.69-.968zm11.233-6.84c-.303-.152-1.793-.884-2.071-.985-.278-.1-.482-.152-.68.152-.2.303-.774.985-.95 1.187-.176.202-.351.228-.654.076-.303-.152-1.278-.47-2.435-1.503-.9-.8-1.51-1.787-1.686-2.09-.176-.303-.02-.467.132-.618.136-.137.303-.351.455-.527.152-.176.202-.303.303-.506.1-.202.05-.38-.025-.53-.075-.152-.682-1.644-.934-2.253-.247-.597-.497-.516-.68-.527-.176-.01-.38-.012-.582-.012-.202 0-.53.076-.807.38-.278.303-1.062 1.037-1.062 2.529 0 1.493 1.087 2.935 1.238 3.137.152.202 2.138 3.262 5.18 4.58.724.313 1.289.5 1.73.64.728.23 1.39.197 1.91.12.58-.087 1.794-.733 2.048-1.443.254-.71.254-1.317.177-1.443-.077-.126-.278-.202-.582-.354z"/>
</svg>
020 9535 5355
</span>
<span class=\"contact-number\" onclick=\"openWhatsApp('general', '8562094535355')\" style=\"display: flex; align-items: center; gap: 8px;\">
<svg class=\"icon-whatsapp-btn\" viewBox=\"0 0 24 24\" fill=\"currentColor\" style=\"width: 24px; height: 24px;\">
<path d=\"M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.03-5.114-2.905-6.99C16.557 1.87 14.07 1.834 11.44 1.834c-5.44 0-9.868 4.42-9.872 9.867a9.813 9.813 0 0 0 1.5 4.85l-.988 3.606 3.69-.968zm11.233-6.84c-.303-.152-1.793-.884-2.071-.985-.278-.1-.482-.152-.68.152-.2.303-.774.985-.95 1.187-.176.202-.351.228-.654.076-.303-.152-1.278-.47-2.435-1.503-.9-.8-1.51-1.787-1.686-2.09-.176-.303-.02-.467.132-.618.136-.137.303-.351.455-.527.152-.176.202-.303.303-.506.1-.202.05-.38-.025-.53-.075-.152-.682-1.644-.934-2.253-.247-.597-.497-.516-.68-.527-.176-.01-.38-.012-.582-.012-.202 0-.53.076-.807.38-.278.303-1.062 1.037-1.062 2.529 0 1.493 1.087 2.935 1.238 3.137.152.202 2.138 3.262 5.18 4.58.724.313 1.289.5 1.73.64.728.23 1.39.197 1.91.12.58-.087 1.794-.733 2.048-1.443.254-.71.254-1.317.177-1.443-.077-.126-.278-.202-.582-.354z\"/>
</svg>
020 9453 5355
</span>
</div>        <span class=\"footer-time\">01/08/2026 \u2014 30/09/2026</span>\n      </div>\n    </div>\n    <div class=\"footer-bottom\">\n      <p>\u00a9 2026 NNC Pharma. All rights reserved. MKT Campaign Landing Page.</p>\n    </div>\n  </footer>\n\n  <!-- Scripts -->\n  ` }} />;
}
