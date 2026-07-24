import React, { useState } from 'react';
import type { Locale } from '../model/types';
import { TIERS } from '../model/config';
import { calculateTierBenefits, formatKip } from '../model/math';

interface PolicySectionProps {
  locale: Locale;
  onOpenRulesPdf: () => void;
}

export const PolicySection: React.FC<PolicySectionProps> = ({
  locale,
  onOpenRulesPdf,
}) => {
  const [simulatedRevenue, setSimulatedRevenue] = useState(12000000);

  const benefits = calculateTierBenefits(simulatedRevenue);

  const getNextTierNudge = () => {
    if (simulatedRevenue < 6000000) {
      const remaining = 6000000 - simulatedRevenue;
      return locale === 'lo'
        ? `ເພີ່ມ ${formatKip(remaining)} KIP ເພື່ອຂຶ້ນ ຂັ້ນ 2 (ໂບນັດ 8%)`
        : `Nhập thêm ${formatKip(remaining)} KIP để lên Bậc 2 (Tổng thưởng 8%)`;
    }
    if (simulatedRevenue < 12000000) {
      const remaining = 12000000 - simulatedRevenue;
      return locale === 'lo'
        ? `ເພີ່ມ ${formatKip(remaining)} KIP ເພື່ອຂຶ້ນ ຂັ້ນ 3 (ໂບນັດ 9%)`
        : `Nhập thêm ${formatKip(remaining)} KIP để lên Bậc 3 (Tổng thưởng 9%)`;
    }
    if (simulatedRevenue < 25000000) {
      const remaining = 25000000 - simulatedRevenue;
      return locale === 'lo'
        ? `ເພີ່ມ ${formatKip(remaining)} KIP ເພື່ອຂຶ້ນ ຂັ້ນ 4 (ໂບນັດ 10%)`
        : `Nhập thêm ${formatKip(remaining)} KIP để lên Bậc 4 cao nhất (Tổng thưởng 10%)`;
    }
    return locale === 'lo'
      ? '🎉 ທ່ານໄດ້ບັນລຸ ຂັ້ນ 4 ສູງສຸດ (ໂບນັດ 10%)!'
      : '🎉 Bạn đã đạt Bậc 4 cao nhất — Nhận trọn vẹn 10% chiết khấu tích lũy!';
  };

  return (
    <section id="accumulation" className="calculator-section">
      <div className="calculator-container">
        {/* Left Column: Tiers Table */}
        <div className="policy-details">
          <span className="section-tag green">
            {locale === 'lo' ? 'ນະໂຍບາຍ Q3/2026' : 'BẢNG QUYỀN LỢI TÍCH LŨY'}
          </span>
          <h2 className="section-title white">
            {locale === 'lo' ? 'ສະສົມຜົນປະໂຫຍດ 4 ຂັ້ນ' : 'Cơ chế Doanh số gộp Lũy tiến'}
          </h2>
          <p className="section-desc text-white-60">
            {locale === 'lo'
              ? 'ບິນທີ່ຜ່ານເງື່ອນໄຂຫຼຸດທັນທີ 5%. ທ້າຍໄຕມາດຄິດໄລ່ໂບນັດຕາມຍອດສະສົມ.'
              : 'Nhập sỉ gộp đơn 6 dòng sản phẩm NNC, nhận chiết khấu trực tiếp trên đơn và thưởng cộng dồn suốt quý.'}
          </p>

          <div className="tiers-table">
            <div className="table-header">
              <span>{locale === 'lo' ? 'ຂັ້ນ' : 'Bậc tích lũy'}</span>
              <span>{locale === 'lo' ? 'ຍອດຂາຍ (KIP)' : 'Doanh số Quý (KIP)'}</span>
              <span>{locale === 'lo' ? 'ຫຼຸດທັນທີ' : 'Chiết khấu trực tiếp'}</span>
              <span>{locale === 'lo' ? 'ໂບນັດທ້າຍໄຕມາດ' : 'Thưởng cuối Quý'}</span>
              <span>{locale === 'lo' ? 'ລວມ' : 'Tổng lợi ích'}</span>
            </div>
            <div className="table-body">
              {TIERS.map((tier) => (
                <div
                  className="table-row"
                  key={tier.id}
                  onClick={() => setSimulatedRevenue(tier.minRevenueKip + 1000000)}
                  style={{ cursor: 'pointer' }}
                >
                  <strong>{locale === 'lo' ? tier.nameLo : tier.nameVi}</strong>
                  <span>
                    {formatKip(tier.minRevenueKip)} —{' '}
                    {tier.maxRevenueKip ? formatKip(tier.maxRevenueKip) : 'trở lên'}
                  </span>
                  <span className="direct">5%</span>
                  <span className="bonus">{tier.quarterRewardPercent}%</span>
                  <strong className="total">{tier.totalBenefitPercent}%</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="policy-note">
            <svg className="icon-info" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <span>
              {locale === 'lo'
                ? 'ບໍ່ໃຊ້ຮ່ວມກັບໂຄງການ 30+1.'
                : 'Chương trình bán lẻ KHÔNG áp dụng đồng thời chương trình hàng tặng 30+1.'}
            </span>
          </div>

          {/* PDF rules viewer button */}
          <button type="button" className="btn-view-rules-pdf" onClick={onOpenRulesPdf}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span>{locale === 'lo' ? 'ເບິ່ງນະໂຍບາຍ (PDF)' : 'Xem chi tiết chương trình (PDF)'}</span>
          </button>
        </div>

        {/* Right Column: Interactive Profit Simulator */}
        <div className="calculator-card">
          <h3>{locale === 'lo' ? 'ຄຳນວນຜົນປະໂຫຍດ' : 'Bảng tính Bài toán Kinh tế giả lập'}</h3>
          <p className="calc-subtitle">
            {locale === 'lo'
              ? 'ປັບຍອດຂາຍຄາດໝາຍເພື່ອເບິ່ງຜົນປະໂຫຍດ.'
              : 'Kéo thanh trượt để giả lập doanh số nhập sỉ và dòng tiền tiết kiệm được.'}
          </p>

          <div className="simulator-slider-wrapper">
            <div className="slider-labels">
              <span>{locale === 'lo' ? 'ຍອດຂາຍຄາດໝາຍ:' : 'Doanh số đặt hàng dự kiến:'}</span>
              <span className="simulated-value" id="sim-revenue-text">
                {formatKip(simulatedRevenue)} KIP
              </span>
            </div>
            <input
              type="range"
              id="revenue-slider"
              min="0"
              max="30000000"
              step="500000"
              value={simulatedRevenue}
              onChange={(e) => setSimulatedRevenue(Number(e.target.value))}
            />
            <div className="slider-ticks">
              <span>0</span>
              <span>6M KIP</span>
              <span>12M KIP</span>
              <span>25M+ KIP</span>
            </div>
          </div>

          {/* Results Panel */}
          <div className="sim-results-panel">
            <div className="sim-row">
              <span>{locale === 'lo' ? 'ຫຼຸດທັນທີ (5%):' : 'Giảm giá trực tiếp (5%):'}</span>
              <span className="sim-val">{formatKip(benefits.immediateDiscountKip)} KIP</span>
            </div>
            <div className="sim-row">
              <span>
                <span>{locale === 'lo' ? 'ໂບນັດທ້າຍໄຕມາດ:' : 'Thưởng cuối Quý tích lũy:'}</span>
                <strong className="sim-rate-badge"> ({benefits.quarterBonusPercent}%)</strong>
              </span>
              <span className="sim-val">{formatKip(benefits.quarterBonusKip)} KIP</span>
            </div>
            <div className="sim-row total-savings">
              <span>{locale === 'lo' ? 'ລວມຜົນປະໂຫຍດ:' : 'Tổng tiền sỉ tiết kiệm được:'}</span>
              <strong className="sim-valHighlight">{formatKip(benefits.totalBenefitKip)} KIP</strong>
            </div>
          </div>

          {/* Next Tier Nudge */}
          <div className="next-tier-nudge" style={{ background: '#062B24', padding: '0.8rem 1rem', borderRadius: '8px', borderLeft: '4px solid #F0B429', marginTop: '1rem', color: '#F0B429', fontSize: '0.9rem' }}>
            {getNextTierNudge()}
          </div>

          <div className="sim-tier-badge" style={{ marginTop: '1rem', color: '#10B981', fontWeight: 600 }}>
            {locale === 'lo' ? `ຂັ້ນຄາດໝາຍ: ${benefits.tierNameLo}` : `Bậc tích lũy dự kiến: ${benefits.tierNameVi}`}
          </div>
        </div>
      </div>
    </section>
  );
};
