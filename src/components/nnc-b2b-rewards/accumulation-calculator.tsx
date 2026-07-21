import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';
import { Crown, Gem, Info, ShieldCheck, Sparkles, ArrowRight, Plus, Minus } from 'lucide-react';
import { NNC_ACCUMULATION_TIERS, NNC_PRODUCTS } from '@/config/nnc-b2b-rewards';

interface AccumulationCalculatorProps {
  onProgramView?: () => void;
  isSelectionMode?: boolean;
  onTierSelected?: (cartItems: Array<{ product_id: string; quantity: number }>, cartTotal: number) => void;
}

const formatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const kip = new Intl.NumberFormat('en-US');
const minimumExamples = [140000, 480000, 1080000, 2500000];

const TIER_THEMES = [
  {
    id: 'mint',
    section: 'bg-[#0d2e26]',
    veil: 'bg-[radial-gradient(circle_at_82%_18%,rgba(52,211,153,.18),transparent_36%)]',
    ambient: 'from-[#071f19]/65 via-[#0d2e26]/48 to-[#0d2e26]/90',
    accent: 'text-emerald-300',
    accentLine: 'bg-emerald-300',
    directCard: 'border-emerald-200/15 bg-emerald-50/[0.07]',
    totalCard: 'border-lime-200/25 bg-lime-200/10',
    totalText: 'text-lime-300',
    portfolio: 'border-emerald-200/15 bg-emerald-950/25 shadow-[0_22px_70px_-38px_rgba(52,211,153,.45)]',
    activeCard: 'border-emerald-300 bg-white text-[#102a24] shadow-[0_24px_80px_-30px_rgba(52,211,153,0.65)]',
    reachedCard: 'border-emerald-300/35 bg-[#153f35]/90 text-white',
    idleCard: 'border-white/10 bg-[#12382f]/80 text-white hover:border-emerald-200/35 hover:bg-[#184438]',
    rail: 'from-emerald-300 via-emerald-300 to-lime-300 shadow-[0_0_16px_rgba(110,231,183,.85)]',
    calculator: 'border-emerald-200/25 shadow-[0_40px_120px_-50px_rgba(16,185,129,.48)]',
    result: 'bg-emerald-50 text-emerald-900',
    resultAccent: 'text-emerald-700',
    icon: ShieldCheck
  },
  {
    id: 'aqua',
    section: 'bg-[#073536]',
    veil: 'bg-[radial-gradient(circle_at_78%_16%,rgba(34,211,238,.2),transparent_38%)]',
    ambient: 'from-[#052526]/60 via-[#073536]/48 to-[#062d2d]/92',
    accent: 'text-cyan-200',
    accentLine: 'bg-cyan-200',
    directCard: 'border-cyan-200/20 bg-cyan-100/[0.08]',
    totalCard: 'border-teal-200/25 bg-teal-200/12',
    totalText: 'text-cyan-200',
    portfolio: 'border-cyan-200/20 bg-cyan-950/25 shadow-[0_22px_76px_-36px_rgba(34,211,238,.52)]',
    activeCard: 'border-cyan-300 bg-gradient-to-r from-white to-cyan-50 text-[#082f31] shadow-[0_24px_85px_-28px_rgba(34,211,238,.72)]',
    reachedCard: 'border-cyan-300/40 bg-[#0b4545]/90 text-white',
    idleCard: 'border-white/10 bg-[#0a3d3e]/82 text-white hover:border-cyan-200/40 hover:bg-[#0c4a4b]',
    rail: 'from-cyan-200 via-cyan-300 to-teal-200 shadow-[0_0_18px_rgba(103,232,249,.9)]',
    calculator: 'border-cyan-200/35 shadow-[0_40px_125px_-48px_rgba(34,211,238,.55)]',
    result: 'bg-cyan-50 text-cyan-950',
    resultAccent: 'text-cyan-700',
    icon: Sparkles
  },
  {
    id: 'champagne',
    section: 'bg-[#183126]',
    veil: 'bg-[radial-gradient(circle_at_80%_15%,rgba(250,204,21,.2),transparent_39%)]',
    ambient: 'from-[#0c241b]/62 via-[#183126]/46 to-[#11271e]/92',
    accent: 'text-amber-200',
    accentLine: 'bg-amber-200',
    directCard: 'border-emerald-100/15 bg-emerald-50/[0.07]',
    totalCard: 'border-amber-200/35 bg-amber-200/12',
    totalText: 'text-amber-300',
    portfolio: 'border-amber-200/25 bg-[#2b2e1c]/35 shadow-[0_24px_82px_-34px_rgba(250,204,21,.54)]',
    activeCard: 'border-amber-300 bg-gradient-to-r from-[#fffdf7] to-amber-50 text-[#30240b] shadow-[0_26px_90px_-28px_rgba(250,204,21,.72)]',
    reachedCard: 'border-amber-300/40 bg-[#294334]/90 text-white',
    idleCard: 'border-white/10 bg-[#203b2e]/82 text-white hover:border-amber-200/40 hover:bg-[#294737]',
    rail: 'from-emerald-200 via-amber-200 to-amber-300 shadow-[0_0_20px_rgba(253,230,138,.9)]',
    calculator: 'border-amber-200/40 shadow-[0_42px_130px_-46px_rgba(250,204,21,.55)]',
    result: 'bg-amber-50 text-amber-950',
    resultAccent: 'text-amber-700',
    icon: Gem
  },
  {
    id: 'crown',
    section: 'bg-[#071f20]',
    veil: 'bg-[radial-gradient(circle_at_82%_14%,rgba(251,191,36,.28),transparent_42%)]',
    ambient: 'from-[#031718]/58 via-[#071f20]/42 to-[#06191a]/94',
    accent: 'text-yellow-200',
    accentLine: 'bg-yellow-200',
    directCard: 'border-emerald-200/20 bg-emerald-100/[0.08]',
    totalCard: 'border-yellow-200/45 bg-yellow-200/15',
    totalText: 'text-yellow-300',
    portfolio: 'border-yellow-200/35 bg-[#17291f]/45 shadow-[0_26px_92px_-30px_rgba(251,191,36,.7)]',
    activeCard: 'border-yellow-300 bg-gradient-to-r from-[#fffdf5] via-white to-yellow-50 text-[#2d2409] shadow-[0_28px_100px_-26px_rgba(251,191,36,.8)]',
    reachedCard: 'border-yellow-300/45 bg-[#183b31]/92 text-white',
    idleCard: 'border-white/12 bg-[#0d302d]/86 text-white hover:border-yellow-200/45 hover:bg-[#123b35]',
    rail: 'from-emerald-200 via-yellow-200 to-yellow-300 shadow-[0_0_24px_rgba(253,224,71,.95)]',
    calculator: 'border-yellow-200/45 shadow-[0_44px_145px_-42px_rgba(251,191,36,.68)]',
    result: 'bg-gradient-to-br from-yellow-50 to-amber-100 text-amber-950',
    resultAccent: 'text-amber-800',
    icon: Crown
  }
] as const;

export function AccumulationCalculator({ onProgramView, isSelectionMode = false, onTierSelected }: AccumulationCalculatorProps) {
  const { i18n } = useTranslation();
  const isLao = i18n.language === 'lo';
  const reduceMotion = useReducedMotion();
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    NNC_PRODUCTS.forEach(p => initial[p.product_id] = 0);
    return initial;
  });

  const handleQuantityChange = (productId: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(0, prev[productId] + delta)
    }));
  };

  const revenue = useMemo(() => NNC_PRODUCTS.reduce((sum, p) => sum + (quantities[p.product_id] * p.price_vientiane_kip), 0), [quantities]);
  const sectionRef = useRef<HTMLElement>(null);
  const sectionInView = useInView(sectionRef, { amount: 0.12 });
  const programViewed = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !onProgramView) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting || entry.intersectionRatio < 0.5 || programViewed.current) return;
      programViewed.current = true;
      onProgramView();
      observer.disconnect();
    }, { threshold: [0.5] });
    observer.observe(section);
    return () => observer.disconnect();
  }, [onProgramView]);

  const result = useMemo(() => {
    const tier = [...NNC_ACCUMULATION_TIERS].reverse().find((item) => revenue >= item.min_revenue_kip) ?? null;
    if (!tier) return {
      tier: null,
      immediate: null,
      quarter: null,
      total: null,
      quarterRate: 0,
      totalRate: null
    };
    const quarterRate = tier?.quarter_end_reward ?? 0;
    const totalRate = tier.total_benefit;
    return {
      tier,
      immediate: Math.round(revenue * 0.05),
      quarter: Math.round(revenue * quarterRate / 100),
      total: Math.round(revenue * totalRate / 100),
      quarterRate,
      totalRate
    };
  }, [revenue]);

  const nextTier = useMemo(() => {
    return NNC_ACCUMULATION_TIERS.find((tier) => revenue < tier.min_revenue_kip) || null;
  }, [revenue]);

  const activeTierIndex = result.tier
    ? NNC_ACCUMULATION_TIERS.findIndex((tier) => tier.tier_id === result.tier?.tier_id)
    : -1;
  const themeIndex = Math.max(activeTierIndex, 0);
  const theme = TIER_THEMES[themeIndex];
  const ThemeIcon = theme.icon;
  return (
    <section ref={sectionRef} id="accumulation" data-analytics-section="accumulation" data-section-order="4" className={`relative overflow-hidden py-12 text-white transition-colors duration-700 sm:py-14 ${theme.section}`}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme.id}
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.08 : 0.55 }}
          className={`pointer-events-none absolute inset-0 ${theme.veil}`}
        />
      </AnimatePresence>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-[4%] opacity-55"
        animate={sectionInView && !reduceMotion ? { scale: [1.01, 1.065, 1.01], x: ['0%', '-1.5%', '0%'] } : { scale: 1.01, x: '0%' }}
        viewport={{ amount: 0.15 }}
        transition={reduceMotion ? undefined : { duration: 18, ease: 'easeInOut', repeat: Number.POSITIVE_INFINITY }}
      >
        <picture className="absolute inset-0">
          <source type="image/avif" srcSet="/assets/nnc-b2b-rewards/visual/ambient-progression-emerald-gold-v1.avif" />
          <source type="image/webp" srcSet="/assets/nnc-b2b-rewards/visual/ambient-progression-emerald-gold-v1.webp" />
          <img src="/assets/nnc-b2b-rewards/visual/ambient-progression-emerald-gold-v1-source.png" width="1983" height="793" alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
        </picture>
        <div className={`absolute inset-0 bg-gradient-to-b transition-colors duration-700 ${theme.ambient}`} />
      </motion.div>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 top-10 h-96 w-96 rounded-full bg-current blur-3xl"
        animate={{ opacity: 0.07 + themeIndex * 0.025, scale: 1 + themeIndex * 0.12 }}
        transition={{ duration: reduceMotion ? 0.08 : 0.7 }}
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8">
          <motion.div
            initial={{ opacity: 0, x: reduceMotion ? 0 : -26 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: reduceMotion ? 0.12 : 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className={`inline-flex items-center gap-2 text-[10px] font-extrabold transition-colors duration-500 ${theme.accent} ${isLao ? 'tracking-normal' : 'uppercase tracking-[0.18em]'}`}>
              <span className={`h-px w-6 transition-colors duration-500 ${theme.accentLine}`} />
              <ThemeIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {isLao ? 'ນະໂຍບາຍສະສົມຍອດ' : 'Cơ chế tích lũy'}
            </span>
            <h2 className={`mt-3 text-balance text-3xl font-black sm:text-4xl ${isLao ? 'tracking-normal' : 'tracking-[-0.04em]'}`}>
              {isLao ? 'ທຸກຄຳສັ່ງຊື້ພາທ່ານໄປຫາຂັ້ນຕໍ່ໄປ' : 'Mỗi đơn đều có lợi ích ngay'}
            </h2>
            <p className="mt-3 max-w-xl text-xs font-medium leading-6 text-emerald-50/70 sm:text-sm">
              {isLao
                ? 'ຮັບສ່ວນຫຼຸດ 5% ໃນທັນທີ ແລະ ຮັບເພີ່ມ 2%–5% ເມື່ອສະຫຼຸບຍອດສະສົມທ້າຍໄຕມາດ.'
                : 'Mỗi lần mua tiếp giúp anh/chị tiến gần hơn tới bậc quyền lợi cao hơn. Nhận ngay 5% trên hóa đơn và thêm 2%–5% theo tổng doanh số cuối quý.'}
            </p>



            {/* Keep the selected tier and the monetary benefit beside the programme promise. */}
            <AnimatePresence mode="wait">
              <motion.div
                key={theme.id}
                initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduceMotion ? 0 : -10 }}
                transition={{ duration: reduceMotion ? 0.08 : 0.35 }}
                className={`mt-4 rounded-2xl border p-4 sm:p-5 backdrop-blur-md transition-all duration-500 ${isSelectionMode ? 'sticky top-20 z-20 shadow-2xl' : ''} ${theme.calculator}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <motion.div
                      animate={sectionInView && !reduceMotion ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                      transition={{ duration: 2.2, repeat: sectionInView && !reduceMotion ? Infinity : 0, ease: 'easeInOut' }}
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border ${result.tier ? theme.activeCard : 'border-white/15 bg-white/5'}`}
                    >
                      <ThemeIcon className={`h-5 w-5 ${result.tier ? theme.resultAccent : 'text-white/40'}`} />
                    </motion.div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-black text-white">{result.tier ? (isLao ? result.tier.name_lo : result.tier.name_vi) : (isLao ? 'ຍັງບໍ່ເຖິງຂັ້ນ 1' : 'Chưa đạt mốc Bậc 1')}</h3>
                      <p className={`mt-0.5 text-[10px] font-bold ${theme.accent}`}>{result.tier ? (isLao ? `ສ່ວນຫຼຸດລວມ ${result.totalRate}%` : `Tổng chiết khấu ${result.totalRate}%`) : (isLao ? 'ເພີ່ມສິນຄ້າເພື່ອເບິ່ງສິດທິ' : 'Thêm sản phẩm để xem quyền lợi')}</p>
                    </div>
                  </div>
                  <div className={`flex shrink-0 flex-col items-end rounded-xl px-3 py-2 ${theme.result}`}>
                    <span className="text-[9px] font-bold uppercase tracking-wider opacity-60">{isLao ? 'ປະຢັດ' : 'Tiết kiệm'}</span>
                    <strong className={`text-base font-black tabular-nums sm:text-lg ${theme.resultAccent}`}>{formatter.format(result.total || 0)} <span className="text-[9px]">KIP</span></strong>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-1">
                  {NNC_ACCUMULATION_TIERS.map((tier, index) => {
                    const active = result.tier?.tier_id === tier.tier_id;
                    const reached = index <= activeTierIndex;
                    const tierTheme = TIER_THEMES[index];
                    const TierIcon = tierTheme.icon;
                    return <div key={tier.tier_id} className={`flex min-w-0 items-center justify-center gap-1 rounded-lg border px-1.5 py-2 text-center ${active ? tierTheme.activeCard : reached ? tierTheme.reachedCard : 'border-white/8 bg-white/[0.03]'}`}><TierIcon className={`h-3.5 w-3.5 shrink-0 ${active ? tierTheme.resultAccent : reached ? 'text-white/80' : 'text-white/25'}`} /><span className={`text-[10px] font-black ${active ? tierTheme.resultAccent : reached ? 'text-white/90' : 'text-white/30'}`}>{isLao ? tier.name_lo : tier.name_vi} {tier.total_benefit}%</span></div>;
                  })}
                </div>
                {revenue > 0 && <div className="mt-3 flex flex-wrap justify-between gap-x-3 gap-y-1 rounded-lg border border-white/8 bg-white/[0.04] px-3 py-2 text-[10px] font-bold text-white/80"><span>{isLao ? 'ສ່ວນຫຼຸດ 5%' : 'CK trực tiếp 5%'}: <b className="font-mono text-white">{formatter.format(result.immediate || 0)}</b></span><span>{isLao ? 'ທ້າຍໄຕມາດ' : 'Cuối quý'} {result.quarterRate}%: <b className={`font-mono ${theme.accent}`}>{formatter.format(result.quarter || 0)}</b></span></div>}
                {isSelectionMode && <button type="button" onClick={() => { const items = NNC_PRODUCTS.map(p => ({ product_id: p.product_id, quantity: quantities[p.product_id] })).filter(item => item.quantity > 0); onTierSelected?.(items, revenue); }} className={`mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-5 text-[11px] font-black text-white shadow-lg transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 ${themeIndex >= 2 ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-700 hover:bg-emerald-600'}`}>{isLao ? 'Xác nhận lựa chọn & mở khóa vòng quay' : 'XÁC NHẬN LỰA CHỌN & MỞ KHÓA VÒNG QUAY'}<ArrowRight className="h-4 w-4" /></button>}
              </motion.div>
            </AnimatePresence>

            <motion.div initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.7 }} transition={{ duration: reduceMotion ? 0.1 : 0.35, delay: reduceMotion ? 0 : 0.16 }} className={`mt-4 rounded-xl border p-4.5 backdrop-blur-md ${theme.portfolio}`}>
              <div className="flex items-center justify-between gap-3">
                <div><span className="text-[10px] font-black uppercase tracking-[0.13em] text-white/65">{isLao ? 'ເລືອກຜະລິດຕະພັນທີ່ສົນໃຈ' : 'Khám phá sản phẩm phù hợp'}</span><p className="mt-1 text-[11px] font-semibold text-emerald-100/70">{isLao ? 'ເລືອກຈຳນວນເພື່ອເບິ່ງສິດທິຂອງທ່ານ' : 'Chọn số lượng sản phẩm quan tâm để mở khóa quyền lợi của bạn'}</p></div>
                <button type="button" onClick={() => document.querySelector<HTMLButtonElement>('[data-policy-trigger]')?.click()} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-amber-200/30 bg-amber-200/10 px-3 py-2 text-[10px] font-black text-amber-100 transition hover:bg-amber-200/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"><Info className="h-3.5 w-3.5" />PDF</button>
              </div>
              
              <div className="mt-4 bg-white/5 rounded-xl border border-white/10 overflow-hidden divide-y divide-white/5">
                {NNC_PRODUCTS.map((product) => (
                  <div key={product.product_id} className="flex flex-col sm:flex-row sm:items-center p-3 sm:p-4 gap-3 sm:gap-4 transition hover:bg-white/5">
                    <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-lg bg-white/10 p-1 sm:p-2">
                      <img src={product.packshot_url} alt={product.canonical_name} className="h-full w-full object-contain drop-shadow-md" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[12px] sm:text-[13px] font-black text-white truncate">{product.canonical_name}</h4>
                      <p className="mt-0.5 text-[10px] sm:text-[11px] font-bold text-emerald-300">{isLao ? 'ເລືອກຈຳນວນທີ່ສົນໃຈ' : 'Chọn số lượng quan tâm'}</p>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0">
                      <div className="flex h-9 w-28 sm:w-32 items-center justify-between rounded-md border border-white/20 bg-white/10 px-1 shadow-sm">
                        <button 
                          type="button" 
                          onClick={() => handleQuantityChange(product.product_id, -1)}
                          className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded text-white hover:bg-white/20 focus:outline-none transition"
                        >
                          <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                        <span className="text-[13px] font-bold text-white tabular-nums">{quantities[product.product_id]}</span>
                        <button 
                          type="button" 
                          onClick={() => handleQuantityChange(product.product_id, 1)}
                          className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded text-emerald-300 hover:bg-white/20 focus:outline-none transition"
                        >
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
            </motion.div>

            {false && <motion.div initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.75 }} transition={{ duration: reduceMotion ? 0.1 : 0.35, delay: reduceMotion ? 0 : 0.18 }} className="mt-3 rounded-xl border border-amber-200/20 bg-[#ffe7a3] p-3.5 text-[#4b3410]">
              <div className="flex items-start gap-2.5">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <span className={`text-[10px] font-black ${isLao ? 'tracking-normal' : 'uppercase tracking-[0.16em]'}`}>{isLao ? 'ໝາຍເຫດ' : 'Lưu ý chương trình'}</span>
                  <p lang="vi" className="mt-1 text-[11px] font-bold leading-5">
                    Chương trình bán lẻ KHÔNG áp dụng đồng thời chương trình hàng tặng 30+1.
                  </p>
                </div>
              </div>
            </motion.div>}
          </motion.div>

          {/* Tier status is intentionally placed above the product picker. */}
          {false && <AnimatePresence mode="wait">
            <motion.div className={`mt-6 rounded-2xl border p-4 sm:p-5 backdrop-blur-md transition-all duration-500 ${theme.calculator}`}>
              {/* Tier badge + savings highlight */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={sectionInView && !reduceMotion ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                    transition={{ duration: 2.2, repeat: sectionInView && !reduceMotion ? Infinity : 0, ease: 'easeInOut' }}
                    className={`grid h-10 w-10 sm:h-12 sm:w-12 shrink-0 place-items-center rounded-xl border ${result.tier ? theme.activeCard : 'border-white/15 bg-white/5'}`}
                  >
                    <ThemeIcon className={`h-5 w-5 sm:h-6 sm:w-6 ${result.tier ? theme.resultAccent : 'text-white/40'}`} />
                  </motion.div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-black text-white">
                      {result.tier ? (isLao ? result.tier.name_lo : result.tier.name_vi) : (isLao ? 'ຍັງບໍ່ເຖິງຂັ້ນ 1' : 'Chưa đạt mốc Bậc 1')}
                    </h3>
                    <p className={`text-[10px] sm:text-[11px] font-bold ${theme.accent}`}>
                      {result.tier
                        ? (isLao ? `ສ່ວນຫຼຸດລວມ ${result.totalRate}% · ປະຢັດ ${formatter.format(result.total || 0)} KIP` : `Tổng chiết khấu ${result.totalRate}% · Tiết kiệm ${formatter.format(result.total || 0)} KIP`)
                        : (isLao ? 'ເພີ່ມສິນຄ້າເພື່ອເບິ່ງສິດທິ' : 'Thêm sản phẩm để xem quyền lợi')}
                    </p>
                  </div>
                </div>
                {result.total != null && result.total > 0 && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`hidden sm:flex flex-col items-end shrink-0 rounded-xl px-4 py-2.5 ${theme.result}`}
                  >
                    <span className="text-[9px] font-bold uppercase tracking-wider opacity-60">{isLao ? 'ປະຢັດ' : 'Tiết kiệm'}</span>
                    <strong className={`text-lg sm:text-xl font-black tabular-nums ${theme.resultAccent}`}>{formatter.format(result.total)} <span className="text-[10px]">KIP</span></strong>
                  </motion.div>
                )}
              </div>

              {/* Tier progress rail */}
              <div className="mt-4 flex items-center gap-1">
                {NNC_ACCUMULATION_TIERS.map((tier, index) => {
                  const active = result.tier?.tier_id === tier.tier_id;
                  const reached = index <= activeTierIndex;
                  const tierTheme = TIER_THEMES[index];
                  const TierIcon = tierTheme.icon;
                  return (
                    <div key={tier.tier_id} className="flex-1 min-w-0">
                      <div className={`relative flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 sm:px-3 sm:py-2.5 transition-all duration-500 ${
                        active
                          ? `${tierTheme.activeCard} shadow-lg`
                          : reached
                            ? `${tierTheme.reachedCard}`
                            : 'border-white/8 bg-white/[0.03]'
                      }`}>
                        {active && (
                          <motion.span
                            layoutId={reduceMotion ? undefined : 'tier-glow'}
                            className="pointer-events-none absolute inset-0 rounded-lg ring-2 ring-inset ring-white/20"
                            transition={{ duration: 0.3 }}
                          />
                        )}
                        <TierIcon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 ${active ? tierTheme.resultAccent : reached ? 'text-white/80' : 'text-white/25'}`} />
                        <div className="min-w-0 hidden sm:block">
                          <span className={`block text-[9px] sm:text-[10px] font-black truncate ${active ? 'text-inherit' : reached ? 'text-white' : 'text-white/35'}`}>
                            {isLao ? tier.name_lo : tier.name_vi}
                          </span>
                        </div>
                        <span className={`text-[10px] sm:text-xs font-black tabular-nums shrink-0 ${active ? tierTheme.resultAccent : reached ? 'text-white/90' : 'text-white/25'}`}>
                          {tier.total_benefit}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Breakdown row */}
              {revenue > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-lg border border-white/8 bg-white/[0.04] px-3 py-2.5 text-[10px] sm:text-[11px] font-bold text-white/80"
                >
                  <span>{isLao ? 'ສ່ວນຫຼຸດ 5%:' : 'CK trực tiếp 5%:'} <span className="font-mono text-white">{formatter.format(result.immediate || 0)}</span></span>
                  <span>{isLao ? 'ທ້າຍໄຕມາດ' : 'Cuối quý'} <span className={`font-mono ${theme.accent}`}>{result.quarterRate}%: {formatter.format(result.quarter || 0)}</span></span>
                  <span className={`font-black ${theme.accent}`}>{isLao ? 'ລວມ' : 'Tổng'}: {formatter.format(result.total || 0)} KIP</span>
                </motion.div>
              )}

              {/* Next tier nudge */}
              {nextTier && revenue > 0 && (
                <p className={`mt-2.5 text-[10px] font-bold leading-normal ${theme.accent}`}>
                  ↑ {isLao
                    ? `ເພີ່ມ ${formatter.format(nextTier.min_revenue_kip - revenue)} KIP → ${nextTier.name_lo} (${nextTier.total_benefit}%)`
                    : `Thêm ${formatter.format(nextTier.min_revenue_kip - revenue)} KIP → ${nextTier.name_vi} (${nextTier.total_benefit}%)`}
                </p>
              )}
            </motion.div>
          </AnimatePresence>}

          {/* View policy button */}
          {false && <div className="mt-4 flex items-center justify-center">
            <button
              type="button"
              onClick={() => {
                const policyBtn = document.querySelector<HTMLButtonElement>('[data-policy-trigger]');
                policyBtn?.click();
              }}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[10px] font-bold text-white/70 hover:bg-white/10 hover:text-white transition cursor-pointer"
            >
              <Info className="h-3.5 w-3.5" />
              {isLao ? 'ເບິ່ງນະໂຍບາຍສະສົມອີກຄັ້ງ' : 'Xem lại chính sách tích lũy (PDF)'}
            </button>
          </div>}

          {false && isSelectionMode && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
              <button
                type="button"
                onClick={() => {
                  const items = NNC_PRODUCTS.map(p => ({ product_id: p.product_id, quantity: quantities[p.product_id] })).filter(item => item.quantity > 0);
                  onTierSelected?.(items, revenue);
                }}
                className={`inline-flex min-h-14 items-center justify-center gap-3 rounded-full px-8 text-[11px] sm:text-xs font-black text-white shadow-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 hover:-translate-y-0.5 cursor-pointer w-full sm:w-auto ${themeIndex >= 2 ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-950/20' : 'bg-emerald-800 hover:bg-emerald-700 shadow-emerald-950/20'}`}
              >
                {isLao ? 'ຢືນຢັນໃບສັ່ງຊື້ & ປົດລັອກວົງລໍ້' : 'LƯU ĐƠN NHÁP & MỞ KHÓA VÒNG QUAY'}
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  onTierSelected?.([], 0);
                }}
                className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 px-8 text-[11px] font-black text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white w-full sm:w-auto"
              >
                {isLao ? 'ຂ້າມຂັ້ນຕອນນີ້' : 'BỎ QUA VÀ QUAY NGAY'}
              </button>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
