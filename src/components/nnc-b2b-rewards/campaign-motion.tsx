import { useEffect, useRef, useState } from 'react';
import { motion, useAnimationFrame, useMotionValue, useReducedMotion, useTransform, type MotionValue } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { CircleDot, Sparkles } from 'lucide-react';

interface CampaignMomentumBandProps {
  isLao: boolean;
}

export function CampaignMomentumBand({ isLao }: CampaignMomentumBandProps) {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const [hoverPaused, setHoverPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const loopWidthRef = useRef(0);
  const marqueeX = useMotionValue(0);
  const staticMode = Boolean(reduceMotion);

  const items = isLao ? [
    '7 ຜະລິດຕະພັນ NNC ແທ້',
    '4 ຂັ້ນສະສົມ Q3/2026',
    'ຫຼຸດທັນທີ 5% + ລາງວັນທ້າຍໄຕມາດ',
    'WhatsApp ຊ່ວຍເຫຼືອ 020 9980 6327',
    '01/08 — 30/09/2026'
  ] : [
    '7 sản phẩm chính hãng NNC',
    '4 bậc tích lũy Q3/2026',
    'Giảm ngay 5% + thưởng cuối quý',
    'WhatsApp hỗ trợ 020 9980 6327',
    '01/08 — 30/09/2026'
  ];

  const displayItems = staticMode ? items : [...items, ...items];

  useEffect(() => {
    if (staticMode || !trackRef.current) return;
    const track = trackRef.current;
    const measure = () => {
      loopWidthRef.current = track.scrollWidth / 2;
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [isLao, staticMode]);

  useAnimationFrame((_time, delta) => {
    const loopWidth = loopWidthRef.current;
    if (staticMode || hoverPaused || loopWidth <= 0) return;
    const nextX = marqueeX.get() - (Math.min(delta, 64) / 1000) * 34;
    marqueeX.set(nextX <= -loopWidth ? nextX + loopWidth : nextX);
  });

  return (
    <section aria-label={isLao ? 'ສະຫຼຸບໂຄງການ' : 'Tóm tắt chương trình'} className="relative overflow-hidden border-y border-emerald-950/10 bg-[#0a2e25] py-2 text-white">
      {!staticMode && <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[#0a2e25] to-transparent sm:w-20" />}
      {!staticMode && <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[#0a2e25] to-transparent sm:w-20" />}
      <motion.div
        ref={trackRef}
        role="list"
        aria-live="off"
        onPointerEnter={() => setHoverPaused(true)}
        onPointerLeave={() => setHoverPaused(false)}
        onFocusCapture={() => setHoverPaused(true)}
        onBlurCapture={() => setHoverPaused(false)}
        className={staticMode ? 'flex flex-wrap items-center justify-center px-4' : 'flex w-max items-center will-change-transform'}
        style={staticMode ? undefined : { x: marqueeX }}
      >
        {displayItems.map((item, index) => (
          <motion.div
            key={`${item}-${index}`}
            role="listitem"
            aria-hidden={!staticMode && index >= items.length}
            whileHover={reduceMotion ? undefined : { y: -1, scale: 1.015 }}
            whileTap={reduceMotion ? undefined : { scale: 0.985 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="group mx-1 flex shrink-0 items-center gap-2 rounded-full border border-transparent px-4 py-1 transition-colors duration-200 hover:border-white/15 hover:bg-white/10 active:bg-white/15 sm:px-5"
          >
            <span className="whitespace-nowrap text-[9px] font-black uppercase tracking-[0.1em] text-emerald-50 transition-colors group-hover:text-white sm:text-[10px]">{item}</span>
            <CircleDot className="h-3 w-3 text-amber-300 transition-transform duration-200 group-hover:scale-125" aria-hidden="true" />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

export function AmbientMotionField() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <motion.span
        className="absolute -right-20 top-10 h-56 w-56 rounded-full bg-emerald-300/15 blur-3xl"
        animate={reduceMotion ? undefined : { x: [0, -42, 12, 0], y: [0, 24, -12, 0], scale: [1, 1.16, 0.96, 1] }}
        transition={reduceMotion ? undefined : { duration: 14, ease: 'easeInOut', repeat: Number.POSITIVE_INFINITY }}
      />
      <span
        className="absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-amber-200/16 blur-3xl"
      />
      <span
        className="absolute right-[16%] top-[18%] grid h-10 w-10 place-items-center rounded-full border border-white/35 bg-white/10 text-amber-200 backdrop-blur"
      >
        <Sparkles className="h-4 w-4" />
      </span>
    </div>
  );
}

interface JourneyConnectorProps {
  progress: MotionValue<number>;
}

export function JourneyConnector({ progress }: JourneyConnectorProps) {
  const reduceMotion = useReducedMotion();

  return (
    <>
      <div className="pointer-events-none absolute bottom-8 left-[1.1rem] top-8 w-px overflow-hidden bg-emerald-950/10 lg:hidden" aria-hidden="true">
        <motion.div className="h-full origin-top bg-gradient-to-b from-emerald-500 via-amber-300 to-emerald-600" style={{ scaleY: reduceMotion ? 1 : progress }} />
      </div>
      <div className="pointer-events-none absolute left-[10%] right-[10%] top-[1.1rem] hidden h-px overflow-hidden bg-emerald-950/10 lg:block" aria-hidden="true">
        <motion.div className="h-full origin-left bg-gradient-to-r from-emerald-500 via-amber-300 to-emerald-600" style={{ scaleX: reduceMotion ? 1 : progress }} />
      </div>
    </>
  );
}

interface MotionStepMarkerProps {
  index: number;
  progress: MotionValue<number>;
  reached: boolean;
  current: boolean;
}

export function MotionStepMarker({ index, progress, reached, current }: MotionStepMarkerProps) {
  const reduceMotion = useReducedMotion();
  const start = Math.max(0, index * 0.17 - 0.04);
  const end = Math.min(1, start + 0.2);
  const nodeScale = useTransform(progress, [start, end], [0.72, 1]);
  const nodeOpacity = useTransform(progress, [start, end], [0.38, 1]);

  return (
    <motion.span
      className={`pointer-events-none absolute -left-[3.15rem] top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border font-mono text-[10px] font-black shadow-sm transition-colors duration-200 lg:-top-12 lg:left-1/2 lg:-translate-x-1/2 lg:translate-y-0 ${current ? 'border-amber-300 bg-[#103e32] text-white shadow-[0_0_0_6px_rgba(16,62,50,0.08)]' : reached ? 'border-emerald-300 bg-emerald-600 text-white' : 'border-emerald-200 bg-white text-emerald-700'}`}
      style={{ opacity: reduceMotion ? 1 : nodeOpacity }}
      aria-hidden="true"
    >
      <motion.span className="absolute -inset-1 rounded-full border border-current/20" style={{ scale: reduceMotion ? 1 : nodeScale }} />
      <span className="relative z-10">0{index + 1}</span>
    </motion.span>
  );
}
