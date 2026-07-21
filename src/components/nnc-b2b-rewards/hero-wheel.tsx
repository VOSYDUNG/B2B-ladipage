import { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Lock, MousePointer2 } from 'lucide-react';
import { NNC_WHEEL_SEGMENTS } from '@/config/nnc-b2b-rewards';

interface HeroWheelProps {
  locked: boolean;
  isSpinning: boolean;
  rotation: number;
  onLockClick: () => void;
  onSpinClick: () => void;
  hasSpun: boolean;
  isLao: boolean;
}

const palette = ['#0f5d49', '#148465', '#31a77e', '#5fbc8e', '#d7a844', '#ee7b52'];

export function HeroWheel({
  locked,
  isSpinning,
  rotation,
  onLockClick,
  onSpinClick,
  hasSpun,
  isLao
}: HeroWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const size = canvas.width;
    const center = size / 2;
    const radius = center - 8;
    const angle = (Math.PI * 2) / NNC_WHEEL_SEGMENTS.length;

    ctx.clearRect(0, 0, size, size);
    NNC_WHEEL_SEGMENTS.forEach((_, index) => {
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, index * angle, (index + 1) * angle);
      ctx.closePath();
      ctx.fillStyle = palette[index % palette.length];
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(index * angle + angle / 2);
      ctx.fillStyle = '#fff';
      ctx.font = '900 18px ui-monospace, SFMono-Regular, Menlo, monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(index + 1).padStart(2, '0'), radius - 24, 0);
      ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(center, center, 34, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#f1ca69';
    ctx.lineWidth = 7;
    ctx.stroke();
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-[420px] aspect-square flex items-center justify-center">
      {/* Background glow when spinning */}
      <motion.div
        animate={isSpinning && !reduceMotion ? { scale: [1, 1.08, 1], opacity: [0.65, 1, 0.65] } : { scale: 1, opacity: 0.75 }}
        transition={{ duration: 1.4, repeat: isSpinning && !reduceMotion ? Infinity : 0, ease: 'easeInOut' }}
        className="pointer-events-none absolute inset-10 rounded-full bg-emerald-400/25 blur-3xl"
      />

      {/* Selector pointer indicator */}
      <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2" aria-hidden="true">
        <motion.div
          animate={isSpinning && !reduceMotion ? { y: [0, 5, 0] } : { y: 0 }}
          transition={{ duration: 0.8, repeat: isSpinning && !reduceMotion ? Infinity : 0, ease: 'easeInOut' }}
        >
          <MousePointer2 className="h-10 w-10 rotate-180 fill-amber-300 text-amber-300 drop-shadow-lg" />
        </motion.div>
      </div>

      {/* Spinning Canvas Wheel */}
      <motion.div
        animate={{ rotate: rotation }}
        transition={{ duration: reduceMotion ? 0.2 : 4.5, ease: [0.12, 0.72, 0.16, 1] }}
        className="relative mx-auto aspect-square w-full max-w-[380px] overflow-hidden rounded-full border-[8px] border-[#d9b45e] bg-white shadow-[0_30px_90px_-20px_rgba(16,180,120,.45)]"
      >
        <canvas
          ref={canvasRef}
          width={560}
          height={560}
          className="h-full w-full"
          role="img"
          aria-label={isLao ? 'ວົງລໍ້ລາງວັນ 6 ພາກສ່ວນ' : 'Vòng quay may mắn 6 phân khúc'}
        >
          {isLao ? 'ວົງລໍ້ລາງວັນ 6 ພາກສ່ວນ' : 'Vòng quay may mắn 6 phân khúc'}
        </canvas>
      </motion.div>

      {/* Locked Glassmorphic Overlay */}
      <AnimatePresence>
        {locked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onLockClick}
            className="absolute inset-2 z-20 flex cursor-pointer flex-col items-center justify-center rounded-full bg-[#06140f]/80 p-6 text-center backdrop-blur-md transition-all duration-300 hover:bg-[#06140f]/75 border border-white/10"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 mb-3 shadow-[0_0_20px_rgba(251,191,36,0.15)] animate-pulse">
              <Lock className="h-7 w-7" />
            </div>
            <p className="max-w-[200px] text-[11px] font-black leading-5 text-white/90">
              {isLao
                ? 'ສຳເລັດ 2 ຂັ້ນຕອນເພື່ອປົດລັອກການໝູນລາງວັນ 100%'
                : 'Hoàn thành 2 bước để mở khóa lượt quay 100% trúng quà'}
            </p>
            <span className="mt-3 text-[10px] font-bold uppercase tracking-wider text-amber-300 underline underline-offset-4 decoration-amber-400/50">
              {isLao ? 'ກົດເພື່ອເລີ່ມຕົ້ນ →' : 'Bấm để bắt đầu →'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unlocked & Ready Spin Button overlay */}
      {!locked && !hasSpun && (
        <button
          type="button"
          onClick={onSpinClick}
          disabled={isSpinning}
          className="absolute z-20 h-20 w-20 rounded-full bg-amber-300 border-4 border-white text-emerald-950 font-black text-[11px] uppercase tracking-wider shadow-2xl shadow-emerald-950/40 hover:bg-amber-200 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-85 disabled:cursor-wait flex flex-col items-center justify-center cursor-pointer select-none animate-bounce"
          style={{ animationDuration: '2s' }}
        >
          <span>{isLao ? 'ໝູນ' : 'Quay'}</span>
          <span className="text-[8px] font-bold text-emerald-800">{isLao ? 'ເລີຍ' : 'Ngay'}</span>
        </button>
      )}
    </div>
  );
}
