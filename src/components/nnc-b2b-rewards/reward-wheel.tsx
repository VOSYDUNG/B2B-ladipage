import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';
import { AlertCircle, ArrowRight, ArrowUpRight, CalendarDays, Check, Copy, Eye, Gift, LoaderCircle, MousePointer2, Share2, ShieldCheck } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { appendNncWhatsAppReference, NNC_CAMPAIGN_CONFIG, NNC_PRODUCTS, NNC_QUIZ_QUESTIONS, NNC_REWARD_RUNTIME_MODE, NNC_WHATSAPP_PATH, NNC_WHEEL_SEGMENTS, type NncWheelSegment } from '@/config/nnc-b2b-rewards';
import type { NncRegistrationValues } from './registration-form';

interface RewardWheelProps {
  registration: NncRegistrationValues;

  isWhatsAppFallback?: boolean;
  onRewardSelected: (reward: NncWheelSegment) => Promise<{ participantId: string; referralCode: string }>;
  onWheelSpin?: (attempt: number) => void;
  onReferralShare?: (shareType: string) => void;
  onResultVisible?: (reward: NncWheelSegment) => void;
  onWhatsAppClick?: (reward: NncWheelSegment) => void;
  onProceedToCart: () => void;
}

const palette = ['#0f5d49', '#148465', '#31a77e', '#5fbc8e', '#d7a844', '#ee7b52'];

export function RewardWheel({ registration, isWhatsAppFallback = false, onRewardSelected, onWheelSpin, onReferralShare, onResultVisible, onWhatsAppClick, onProceedToCart }: RewardWheelProps) {
  const { i18n } = useTranslation();
  const isLao = i18n.language === 'lo';
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const sectionInView = useInView(sectionRef, { amount: 0.12 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const attemptRef = useRef(0);
  const resultAnnouncedRef = useRef(false);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<NncWheelSegment | null>(null);
  const [participantId, setParticipantId] = useState('');
  const [referralCodeOwned, setReferralCodeOwned] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<'code' | 'link' | ''>('');

  const shareUrl = `${window.location.origin}/lp/${NNC_CAMPAIGN_CONFIG.landing_id}?ref=${encodeURIComponent(referralCodeOwned)}`;

  useEffect(() => {
    if (!result || !participantId || resultAnnouncedRef.current) return;
    resultAnnouncedRef.current = true;
    onResultVisible?.(result);
  }, [onResultVisible, participantId, result]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const size = canvas.width;
    const center = size / 2;
    const radius = center - 8;
    const angle = Math.PI * 2 / NNC_WHEEL_SEGMENTS.length;
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

  const choosePreviewGroup = (): NncWheelSegment | null => {
    if (NNC_REWARD_RUNTIME_MODE !== 'provisional_preview') return null;
    const provisional = NNC_WHEEL_SEGMENTS.filter((item) => item.approval_status === 'provisional');
    if (provisional.length === 0) return null;
    const total = provisional.reduce((sum, item) => sum + item.weight, 0);
    let pointer = Math.random() * total;
    return provisional.find((item) => ((pointer -= item.weight) <= 0)) ?? provisional[0];
  };

  const spin = async () => {
    if (isSpinning || result) return;
    setError('');
    setIsSpinning(true);
    attemptRef.current += 1;
    onWheelSpin?.(attemptRef.current);
    const reward = choosePreviewGroup();
    if (!reward) {
      setError(isLao ? 'ຍັງບໍ່ມີກຸ່ມສິດທິອ້າງອີງ. ກະລຸນາຕິດຕໍ່ NNC.' : 'Chưa có nhóm quyền lợi tham khảo. Vui lòng liên hệ NNC để được hỗ trợ.');
      setIsSpinning(false);
      return;
    }
    const index = NNC_WHEEL_SEGMENTS.findIndex((item) => item.reward_id === reward.reward_id);
    const segment = 360 / NNC_WHEEL_SEGMENTS.length;
    setRotation((reduceMotion ? 0 : 360 * 6) + 270 - (index * segment + segment / 2));
    try {
      const minimumMotion = new Promise((resolve) => window.setTimeout(resolve, reduceMotion ? 250 : 3200));
      const [submission] = await Promise.all([onRewardSelected(reward), minimumMotion]);
      setParticipantId(submission.participantId);
      setReferralCodeOwned(submission.referralCode);
      setResult(reward);
    } catch (cause) {
      console.error('NNC reward submission failed', cause);
      setError(isLao ? 'ຍັງບໍ່ສາມາດບັນທຶກໄດ້. ກະລຸນາກວດການເຊື່ອມຕໍ່ ແລະ ລອງໃໝ່.' : 'Chưa thể ghi nhận dữ liệu. Vui lòng kiểm tra kết nối và thử lại; chưa có quyền lợi nào được xác nhận.' );
    } finally {
      setIsSpinning(false);
    }
  };

  const copy = async (value: string, kind: 'code' | 'link') => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      window.setTimeout(() => setCopied(''), 1800);
      onReferralShare?.(kind);
    } catch {
      setError(isLao ? 'ບໍ່ສາມາດຄັດລອກໄດ້. ກະລຸນາເລືອກ ແລະ ຄັດລອກດ້ວຍຕົນເອງ.' : 'Không thể sao chép tự động. Vui lòng chọn và sao chép thủ công.');
    }
  };



  const whatsappMessage = result ? appendNncWhatsAppReference(
    isLao
      ? `ສະບາຍດີ NNC Pharma,\n\nຊື່: ${registration.fullName}\nເບີໂທ: ${registration.phone}\nຫົວໜ່ວຍ: ${registration.businessName}\nລະຫັດແນະນຳທີ່ໃຊ້: ${registration.referralCodeUsed || 'ບໍ່ມີ'}\nສິດທິທີ່ເປີດ: ${result.name_lo}\n${isWhatsAppFallback ? 'ລະຫັດຊ່ວຍເຫຼືອ' : 'ລະຫັດເຂົ້າຮ່ວມ'}: ${participantId}${isWhatsAppFallback ? '\n\nຂໍ້ມູນອອນລາຍຍັງບໍ່ໄດ້ບັນທຶກ. ກະລຸນາ NNC ຮັບຂໍ້ມູນນີ້ຜ່ານ WhatsApp.' : ''}\n\nກະລຸນາ NNC ຢືນຢັນ, ໃຫ້ຄຳປຶກສາ ແລະ ຊ່ວຍສັ່ງຊື້.`
      : `Xin chào NNC Pharma,\n\nTôi là: ${registration.fullName}\nSố điện thoại: ${registration.phone}\nĐơn vị: ${registration.businessName}\nMã giới thiệu đã dùng: ${registration.referralCodeUsed || 'không có'}\nQuyền lợi vừa mở: ${result.name_vi}\n${isWhatsAppFallback ? 'Mã phiên hỗ trợ' : 'Mã tham gia'}: ${participantId}${isWhatsAppFallback ? '\n\nDữ liệu trực tuyến chưa được ghi nhận. Nhờ NNC tiếp nhận thủ công thông tin này qua WhatsApp.' : ''}\n\nNhờ NNC xác nhận quyền lợi, tư vấn và hỗ trợ đặt hàng.`,
    'reward_confirmation',
    result.reward_id
  ) : '';
  const whatsappUrl = result ? `https://wa.me/${NNC_WHATSAPP_PATH}?text=${encodeURIComponent(whatsappMessage)}` : '';
  const referralShareMessage = appendNncWhatsAppReference(
    `${isLao ? 'ເບິ່ງໂຄງການ NNC Pharma Q3/2026:' : 'Xem chương trình tích lũy NNC Pharma Q3/2026:'} ${shareUrl}`,
    'referral_share',
    'whatsapp'
  );

  return (
    <section ref={sectionRef} id="wheel" data-analytics-section="wheel" data-section-order="7" className="relative overflow-hidden bg-[#071913] py-12 text-white sm:py-14">
      <motion.div
        aria-hidden="true"
        animate={sectionInView && !reduceMotion ? { scale: [1.02, 1.08, 1.02], x: ['0%', '-1.5%', '0%'] } : { scale: 1.02, x: '0%' }}
        transition={{ duration: 20, repeat: sectionInView && !reduceMotion ? Number.POSITIVE_INFINITY : 0, ease: 'easeInOut' }}
        className="pointer-events-none absolute -inset-[5%] opacity-45"
      >
        <picture className="absolute inset-0">
          <source type="image/avif" srcSet="/assets/nnc-b2b-rewards/visual/ambient-progression-emerald-gold-v1.avif" />
          <source type="image/webp" srcSet="/assets/nnc-b2b-rewards/visual/ambient-progression-emerald-gold-v1.webp" />
          <img src="/assets/nnc-b2b-rewards/visual/ambient-progression-emerald-gold-v1-source.png" width="1983" height="793" alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
        </picture>
      </motion.div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#04120e]/92 via-[#071913]/75 to-[#0b2b22]/94" />
      <motion.div
        aria-hidden="true"
        animate={sectionInView && !reduceMotion ? { rotate: [0, 18, 0], scale: [0.96, 1.04, 0.96] } : { rotate: 0, scale: 1 }}
        transition={{ duration: 18, repeat: sectionInView && !reduceMotion ? Number.POSITIVE_INFINITY : 0, ease: 'easeInOut' }}
        className="pointer-events-none absolute -left-40 top-10 h-[34rem] w-[34rem] rounded-full border border-amber-200/10 shadow-[0_0_120px_rgba(251,191,36,.08)]"
      />
      <motion.div
        aria-hidden="true"
        animate={sectionInView && !reduceMotion ? { rotate: [0, -14, 0], scale: [1.04, 0.98, 1.04] } : { rotate: 0, scale: 1 }}
        transition={{ duration: 22, repeat: sectionInView && !reduceMotion ? Number.POSITIVE_INFINITY : 0, ease: 'easeInOut' }}
        className="pointer-events-none absolute -right-52 bottom-0 h-[38rem] w-[38rem] rounded-full border border-emerald-200/10"
      />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait" initial={false}>
          {!result ? (
          <motion.div key="preview" initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }} whileInView={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduceMotion ? 0 : -14 }} viewport={{ once: true, amount: 0.16 }} transition={{ duration: reduceMotion ? 0.1 : 0.45, ease: [0.22, 1, 0.36, 1] }} className="grid gap-7 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <motion.div initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.35 }} transition={{ duration: reduceMotion ? 0.1 : 0.55 }} className="relative mx-auto w-full max-w-[420px]">
              <motion.div
                animate={isSpinning && sectionInView && !reduceMotion ? { scale: [1, 1.08, 1], opacity: [0.65, 1, 0.65] } : { scale: 1, opacity: 0.75 }}
                transition={{ duration: 1.4, repeat: isSpinning && sectionInView && !reduceMotion ? Infinity : 0, ease: 'easeInOut' }}
                className="pointer-events-none absolute inset-10 rounded-full bg-emerald-400/25 blur-3xl"
              />
              <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2" aria-hidden="true">
                <motion.div animate={isSpinning && sectionInView && !reduceMotion ? { y: [0, 5, 0] } : { y: 0 }} transition={{ duration: 0.8, repeat: isSpinning && sectionInView && !reduceMotion ? Infinity : 0, ease: 'easeInOut' }}>
                  <MousePointer2 className="h-10 w-10 rotate-180 fill-amber-300 text-amber-300 drop-shadow-lg" />
                </motion.div>
              </div>
              <motion.div animate={{ rotate: rotation }} transition={{ duration: reduceMotion ? 0.2 : 3.2, ease: [0.12, 0.72, 0.16, 1] }} className="relative mx-auto mt-7 aspect-square w-full max-w-[380px] overflow-hidden rounded-full border-[8px] border-[#d9b45e] bg-white shadow-[0_40px_100px_-25px_rgba(30,180,120,.55)]">
                <canvas ref={canvasRef} width={560} height={560} className="h-full w-full" role="img" aria-label={isLao ? 'ວົງເບິ່ງ 6 ກຸ່ມສິດທິອ້າງອີງ' : 'Vòng xem 6 nhóm quyền lợi tham khảo'}>6 nhóm quyền lợi tham khảo; NNC xác nhận trước khi áp dụng.</canvas>
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: reduceMotion ? 0 : 22 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: reduceMotion ? 0.1 : 0.48, delay: reduceMotion ? 0 : 0.08 }}>
              <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-amber-300"><Eye className="h-4 w-4" />{isLao ? 'ຕົວຢ່າງສິດທິ B2B' : 'Xem trước quyền lợi B2B'}</span>
              <h2 className={`mt-3 text-balance text-3xl font-black sm:text-4xl ${isLao ? 'tracking-normal' : 'tracking-[-0.04em]'}`}>{isLao ? 'ເບິ່ງກຸ່ມສິດທິອ້າງອີງ' : 'Xem nhóm quyền lợi tham khảo'}</h2>
              <p className="mt-3 text-xs font-medium leading-6 text-emerald-50/65">{isLao ? 'ນີ້ແມ່ນການສະແດງຕົວຢ່າງ; NNC ຈະຢືນຢັນປະເພດ, ເງື່ອນໄຂ ແລະ ຄວາມພ້ອມກ່ອນນຳໃຊ້.' : 'Đây là bước xem trước; NNC sẽ xác nhận loại quyền lợi, điều kiện và khả năng áp dụng qua WhatsApp.'}</p>
              <motion.ol initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.55 }} variants={{ hidden: {}, visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.045 } } }} className="mt-4 grid grid-cols-2 gap-2">
                {NNC_WHEEL_SEGMENTS.map((item, index) => (
                  <motion.li key={item.reward_id} variants={{ hidden: { opacity: 0, y: reduceMotion ? 0 : 7 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: reduceMotion ? 0.08 : 0.24 }} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-3 text-[11px] font-bold text-emerald-50/80"><span className="font-mono text-amber-300">{String(index + 1).padStart(2, '0')}</span>{isLao ? item.name_lo : item.name_vi}</motion.li>
                ))}
              </motion.ol>

              <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-300/20 bg-amber-300/10 p-4 text-xs font-bold leading-5 text-amber-100"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />{isLao ? 'ສິດທິທີ່ສະແດງເປັນຂໍ້ມູນອ້າງອີງ ແລະ ຕ້ອງໃຫ້ NNC ຢືນຢັນກ່ອນນຳໃຊ້.' : 'Các nhóm quyền lợi hiển thị mang tính tham khảo và cần NNC xác nhận trước khi áp dụng.'}</div>
              <p className="mt-3 flex items-center gap-2 text-[11px] font-bold text-emerald-100/60"><CalendarDays className="h-4 w-4" />01/08/2026 — 30/09/2026</p>
              <AnimatePresence initial={false}>
                {error && <motion.div role="alert" initial={{ opacity: 0, y: reduceMotion ? 0 : -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0.08 : 0.2 }} className="mt-4 flex items-start gap-2 rounded-xl bg-rose-500/15 p-4 text-xs font-bold leading-5 text-rose-100"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</motion.div>}
              </AnimatePresence>
              <motion.button type="button" onClick={spin} disabled={isSpinning} whileHover={isSpinning || reduceMotion ? undefined : { y: -2 }} whileTap={isSpinning || reduceMotion ? undefined : { scale: 0.985 }} className="mt-6 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-amber-300 px-6 text-sm font-black text-[#17352b] shadow-xl shadow-amber-950/20 transition hover:bg-amber-200 disabled:cursor-wait disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200">
                {isSpinning ? <LoaderCircle className="h-5 w-5 animate-spin motion-reduce:animate-none" /> : <Gift className="h-5 w-5" />}
                {isSpinning ? (isLao ? 'ກຳລັງເປີດຕົວຢ່າງ…' : 'Đang mở bản tham khảo…') : (isLao ? 'ເບິ່ງກຸ່ມສິດທິອ້າງອີງ' : 'Xem nhóm quyền lợi tham khảo')}
              </motion.button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div key="result" initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0.1 : 0.42, ease: [0.22, 1, 0.36, 1] }} className="mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-white text-[#102a24] shadow-[0_36px_100px_-48px_rgba(0,0,0,.8)]">
            <div className="grid min-w-0 lg:grid-cols-[0.88fr_1.12fr]">
              <motion.div initial={{ opacity: 0, x: reduceMotion ? 0 : -18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: reduceMotion ? 0.1 : 0.38, delay: reduceMotion ? 0 : 0.06 }} className="min-w-0 bg-gradient-to-br from-[#103e32] via-[#0e332a] to-[#0a241d] p-5 text-white sm:p-7">
                <div role="status" aria-live="polite" className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-amber-300"><Eye className="h-3.5 w-3.5" />{isLao ? 'ຜົນອ້າງອີງ' : 'Kết quả tham khảo'}</div>
                <h2 className="mt-4 break-words text-2xl font-black leading-tight tracking-tight sm:text-3xl">{isLao ? result.name_lo : result.name_vi}</h2>
                <p className="mt-3 text-xs font-medium leading-6 text-emerald-50/70">{isLao ? result.description_lo : result.description_vi}</p>
                <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.06] p-4">
                  <span className="text-[9px] font-black uppercase tracking-[0.14em] text-emerald-200/65">{isLao ? 'ເງື່ອນໄຂ' : 'Điều kiện áp dụng'}</span>
                  <p className="mt-1.5 text-[11px] font-bold leading-5 text-emerald-50/75">{isLao ? result.condition_text_lo : result.condition_text_vi}</p>
                </div>
                <p className="mt-4 text-[11px] font-bold leading-5 text-amber-100">{isLao ? 'ຜົນນີ້ບໍ່ແມ່ນການຈັດສັນລາງວັນ ຫຼື ຢືນຢັນສິດທິ.' : 'Kết quả này không phải phân bổ quà hoặc xác nhận quyền lợi.'}</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: reduceMotion ? 0 : 18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: reduceMotion ? 0.1 : 0.38, delay: reduceMotion ? 0 : 0.12 }} className="min-w-0 p-5 sm:p-7">
                <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700">{isWhatsAppFallback ? <FaWhatsapp size={15} /> : <Share2 className="h-3.5 w-3.5" />}{isWhatsAppFallback ? (isLao ? 'ສົ່ງຜົນໃຫ້ NNC' : 'Gửi kết quả qua WhatsApp') : (isLao ? 'ແບ່ງປັນແບບໜຶ່ງຂັ້ນ' : 'Chia sẻ một cấp')}</span>
                <h3 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">{isWhatsAppFallback ? (isLao ? 'ຢືນຢັນສິດທິຜ່ານ WhatsApp' : 'Xác nhận quyền lợi qua WhatsApp') : (isLao ? 'ສົ່ງໃຫ້ເພື່ອນຮ່ວມວິຊາຊີບ' : 'Gửi chương trình tới đồng nghiệp')}</h3>
                <p className="mt-2 text-[11px] font-medium leading-5 text-slate-500">{isWhatsAppFallback ? (isLao ? 'ການບັນທຶກອອນລາຍຂັດຂ້ອງ. ຜົນ ແລະ ຂໍ້ມູນທັງໝົດຈະຖືກສົ່ງໃຫ້ NNC ເພື່ອຮັບຕໍ່ດ້ວຍຕົນເອງ.' : 'Ghi nhận trực tuyến đang gián đoạn. Kết quả cùng toàn bộ thông tin sẽ được gửi cho NNC tiếp nhận thủ công.') : (isLao ? 'ລະຫັດນີ້ຊ່ວຍລະບຸຜູ້ແນະນຳໂດຍກົງ; ສິດທິນຳໃຊ້ຕາມກົດຂອງໂຄງການທີ່ NNC ຢືນຢັນ.' : 'Mã giúp xác định người giới thiệu trực tiếp; quyền lợi áp dụng theo thể lệ được NNC xác nhận.')}</p>
                {!isWhatsAppFallback && <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                  <ShareRow label={isLao ? 'ລະຫັດແນະນຳ' : 'Mã giới thiệu'} value={referralCodeOwned} copied={copied === 'code'} copyLabel={isLao ? 'ຄັດລອກ' : 'Sao chép'} onCopy={() => void copy(referralCodeOwned, 'code')} reduceMotion={Boolean(reduceMotion)} />
                  <ShareRow label={isLao ? 'ລິ້ງແບ່ງປັນ' : 'Link chia sẻ'} value={shareUrl} copied={copied === 'link'} copyLabel={isLao ? 'ຄັດລອກ' : 'Sao chép'} onCopy={() => void copy(shareUrl, 'link')} reduceMotion={Boolean(reduceMotion)} />
                </div>}
                <div className="mt-4 grid gap-2.5">
                  <motion.button type="button" onClick={onProceedToCart} whileTap={reduceMotion ? undefined : { scale: 0.985 }} className="inline-flex min-h-12 min-w-0 items-center justify-center gap-2 rounded-xl bg-amber-300 px-4 text-center text-xs font-black text-[#17352b] shadow-lg shadow-amber-950/20 transition hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">{isLao ? 'ສືບຕໍ່ສ້າງໃບສັ່ງຊື້ອ້າງອີງ' : 'Tiếp tục tạo đơn hàng tham khảo'}<ArrowRight className="h-4 w-4 shrink-0" /></motion.button>
                  {!isWhatsAppFallback && <motion.a href={`https://wa.me/?text=${encodeURIComponent(referralShareMessage)}`} target="_blank" rel="noreferrer" onClick={() => onReferralShare?.('whatsapp')} whileTap={reduceMotion ? undefined : { scale: 0.985 }} className="inline-flex min-h-12 min-w-0 items-center justify-center gap-2 rounded-xl bg-[#103e32] px-4 text-center text-xs font-black text-white transition hover:bg-emerald-700"><FaWhatsapp size={20} />{isLao ? 'ແບ່ງປັນ WhatsApp' : 'Chia sẻ WhatsApp'}</motion.a>}
                </div>
                <AnimatePresence initial={false}>
                  {error && <motion.div role="alert" initial={{ opacity: 0, y: reduceMotion ? 0 : -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0.08 : 0.2 }} className="mt-4 flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-xs font-bold leading-5 text-rose-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</motion.div>}
                </AnimatePresence>
              </motion.div>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function ShareRow({ label, value, copied, copyLabel, onCopy, reduceMotion }: { label: string; value: string; copied: boolean; copyLabel: string; onCopy: () => void; reduceMotion: boolean }) {
  return (
    <div className="mt-4 min-w-0">
      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">{label}</span>
      <div className="mt-1.5 flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 pl-3">
        <code className="min-w-0 flex-1 truncate text-[10px] font-bold text-slate-700">{value}</code>
        <motion.button type="button" onClick={onCopy} whileTap={reduceMotion ? undefined : { scale: 0.95 }} className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg bg-white px-2.5 text-[10px] font-black text-emerald-700 shadow-sm transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={copied ? 'copied' : 'copy'} initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.7 }} transition={{ duration: reduceMotion ? 0.08 : 0.15 }} className="inline-flex items-center gap-1.5">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? 'OK' : copyLabel}</motion.span>
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}
