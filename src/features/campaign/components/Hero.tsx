import React, { useEffect, useRef } from 'react';
import type { Locale } from '../model/types';
import { LIVE_TICKER_DATA, REWARDS } from '../model/config';

interface HeroProps {
  locale: Locale;
  onOpenRegister: () => void;
  onOpenPolicy: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  locale,
  onOpenRegister,
  onOpenPolicy,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Render static hero wheel preview on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    const numSegments = REWARDS.length;
    const anglePerSegment = (2 * Math.PI) / numSegments;

    ctx.clearRect(0, 0, width, height);

    // Segment colors
    const colors = ['#083D33', '#0F5747', '#146C59', '#1A836D', '#083D33', '#0F5747'];

    for (let i = 0; i < numSegments; i++) {
      const startAngle = i * anglePerSegment;
      const endAngle = startAngle + anglePerSegment;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.strokeStyle = '#F0B429';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Segment text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + anglePerSegment / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 13px "Be Vietnam Pro", sans-serif';
      const reward = REWARDS[i];
      const text = locale === 'lo' ? reward.shortLo : reward.shortVi;
      ctx.fillText(text, radius - 20, 5);
      ctx.restore();
    }
  }, [locale]);

  return (
    <>
      <section className="hero-section" id="hero-wheel-container">
        <div className="hero-overlay"></div>
        <div className="hero-container">
          {/* Left Content */}
          <div className="hero-card">
            <div className="hero-badges">
              <span className="badge-promo">
                <span className="pulse-dot"></span> B2B · Q3/2026
              </span>
              <span className="badge-date">01/08 — 30/09/2026</span>
            </div>

            <p className="hero-eyebrow">
              {locale === 'lo'
                ? 'NNC PHARMA · ໂຄງການ B2B Q3/2026'
                : 'NNC PHARMA · CHƯƠNG TRÌNH TRI ÂN ĐỐI TÁC B2B Q3/2026'}
            </p>

            <h1 className="hero-title">
              <span>{locale === 'lo' ? '100% ໝູນໄດ້ຂອງຂວັນ' : '100% QUAY LÀ TRÚNG QUÀ'}</span>
              <span className="highlight">
                {locale === 'lo' ? ' ໂບນັດສະສົມຮອດ 10%' : ' CHIẾT KHẤU TÍCH LŨY ĐẾN 10%'}
              </span>
            </h1>

            <p className="hero-subtitle">
              {locale === 'lo'
                ? 'ສຳລັບຮ້ານຂາຍຢາ ແລະ ຄລີນິກໃນລາວ. ລົງທະບຽນ, ເບິ່ງນະໂຍບາຍ ແລະ ເປີດສິດໝູນຮັບຜົນປະໂຫຍດ.'
                : 'Dành riêng Nhà thuốc & Phòng khám tại Lào. Hoàn thành 2 bước để mở khóa lượt quay — mọi lượt quay đều có quà.'}
            </p>

            <div className="hero-actions-btns">
              <button type="button" className="btn-primary" onClick={onOpenRegister}>
                {locale === 'lo' ? 'ລົງທະບຽນເປີດສິດໝູນ' : 'ĐĂNG KÝ THAM GIA NGAY'}
              </button>
              <button type="button" className="btn-secondary" onClick={onOpenPolicy}>
                {locale === 'lo' ? 'ເບິ່ງນະໂຍບາຍ' : 'KHÁM PHÁ CHÍNH SÁCH'}
              </button>
            </div>
          </div>

          {/* Right Content: Wheel Preview */}
          <div className="hero-visual">
            <div className="wheel-box-wrapper" id="target-wheel-box">
              <div className="wheel-pointer">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L4 14h16L12 2z"></path>
                </svg>
              </div>
              <div className="wheel-outer-ring">
                <canvas ref={canvasRef} width={400} height={400} />
              </div>
              <div
                className="btn-spin"
                onClick={onOpenRegister}
                style={{ cursor: 'pointer' }}
              >
                100%<br />{locale === 'lo' ? 'ໄດ້ຂອງຂວັນ' : 'TRÚNG QUÀ'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Winner Activity Ticker Stream */}
      <section className="hero-live-ticker-section" id="hero-live-ticker">
        <div className="ticker-badge">
          <span className="pulse-live-dot"></span>
          <span className="ticker-badge-text">{locale === 'lo' ? 'ສົດ' : 'TRỰC TIẾP'}</span>
        </div>
        <div className="ticker-track-wrapper">
          <div className="ticker-track">
            {LIVE_TICKER_DATA.concat(LIVE_TICKER_DATA).map((item, index) => (
              <div className="ticker-item" key={`${item.id}-${index}`}>
                <span className="ticker-name">{item.name}</span>
                <span className="ticker-reward">
                  {locale === 'lo' ? item.rewardLo : item.rewardVi}
                </span>
                <span className="ticker-time">
                  ({locale === 'lo' ? item.timeAgoLo : item.timeAgoVi})
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
