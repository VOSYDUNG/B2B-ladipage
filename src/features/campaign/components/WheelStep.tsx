import React, { useRef, useState, useEffect } from 'react';
import type { Reward, Locale, SpinResult } from '../model/types';
import { REWARDS } from '../model/config';

interface WheelStepProps {
  locale: Locale;
  onSpinComplete: (result: SpinResult, reward: Reward) => void;
}

export const WheelStep: React.FC<WheelStepProps> = ({ locale, onSpinComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);

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

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + anglePerSegment / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px "Be Vietnam Pro", sans-serif';
      const reward = REWARDS[i];
      const text = locale === 'lo' ? reward.shortLo : reward.shortVi;
      ctx.fillText(text, radius - 15, 4);
      ctx.restore();
    }
  }, [locale]);

  const selectWeightedReward = (): Reward => {
    const totalWeight = REWARDS.reduce((acc, r) => acc + r.weight, 0);
    let random = Math.random() * totalWeight;
    for (const reward of REWARDS) {
      if (random < reward.weight) {
        return reward;
      }
      random -= reward.weight;
    }
    return REWARDS[0];
  };

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);

    const winningReward = selectWeightedReward();
    const winningIndex = winningReward.wheelIndex;

    const numSegments = REWARDS.length;
    const segmentAngle = 360 / numSegments;
    // Calculate rotation to align segment with pointer at top (270 deg)
    const targetAngle = 360 * 5 + (270 - winningIndex * segmentAngle - segmentAngle / 2);

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.transition = 'transform 4s cubic-bezier(0.15, 0.9, 0.25, 1)';
      canvas.style.transform = `rotate(${targetAngle}deg)`;
    }

    setTimeout(() => {
      setIsSpinning(false);
      const result: SpinResult = {
        rewardId: winningReward.id,
        createdAt: new Date().toISOString(),
        referralCode: `NNC-REF-${Math.floor(10000 + Math.random() * 90000)}`,
      };
      onSpinComplete(result, winningReward);
    }, 4200);
  };

  return (
    <div className="wheel-showcase-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
      <div className="wheel-showcase-header">
        <span className="showcase-tag">
          {locale === 'lo' ? 'ໝູນຂອງຂວັນ 100%' : 'VÒNG QUAY TRI ÂN ĐỐI TÁC'}
        </span>
        <h3>{locale === 'lo' ? 'ສິດໝູນຂອງທ່ານ' : 'Lượt quay đặc quyền Quý 3 của anh/chị'}</h3>
        <p className="showcase-subtitle">
          {locale === 'lo'
            ? '100% ໝູນໄດ້ຂອງຂວັນ. NNC ຈະຢືນຢັນຜ່ານ WhatsApp.'
            : '100% lượt quay đều mang về quà tặng. Chuyên viên NNC sẽ xác nhận và trao quà qua WhatsApp.'}
        </p>
      </div>

      <div className="hero-visual" style={{ margin: '1.5rem auto' }}>
        <div className="wheel-box-wrapper" style={{ margin: '0 auto' }}>
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
            onClick={handleSpin}
            style={{ cursor: isSpinning ? 'wait' : 'pointer' }}
          >
            {isSpinning
              ? (locale === 'lo' ? 'ກຳລັງໝູນ…' : 'ĐANG QUAY…')
              : (locale === 'lo' ? 'ໝູນຮັບຂອງຂວັນ' : 'QUAY NGAY')}
          </div>
        </div>
      </div>

      <button
        type="button"
        className="btn-proceed-cart"
        disabled={isSpinning}
        onClick={handleSpin}
        style={{
          background: 'linear-gradient(135deg, #f0b429, #f7cf5c)',
          color: '#12281f',
          padding: '0.8rem 2rem',
          borderRadius: '50px',
          fontWeight: 700,
          border: 'none',
          cursor: isSpinning ? 'not-allowed' : 'pointer',
        }}
      >
        <span>{isSpinning ? (locale === 'lo' ? 'ກຳລັງໝູນ…' : 'ĐANG QUAY...') : (locale === 'lo' ? 'ໝູນຮັບຂອງຂວັນ' : 'QUAY NHẬN QUÀ NGAY →')}</span>
      </button>
    </div>
  );
};
