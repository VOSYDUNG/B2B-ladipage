import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, Check, ClipboardCheck, RotateCcw, Sparkles } from 'lucide-react';
import { NNC_PRODUCTS, NNC_QUIZ_QUESTIONS, normalizeNncProductInterests, type NncQuizQuestion } from '@/config/nnc-b2b-rewards';

interface QuestionnaireFlowProps {
  initialAnswers?: Record<string, unknown>;
  onComplete: (answers: Record<string, unknown>) => void;
  onAnswerSelected?: (field: string, value: unknown, questionId: string, step: number) => void;
}

const LOCAL_STORAGE_KEY = 'nnc_q3_campaign_quiz_drafts_v2';
const QUESTION_STEPS = [
  [NNC_QUIZ_QUESTIONS[0]],
  [NNC_QUIZ_QUESTIONS[1]],
  [NNC_QUIZ_QUESTIONS[2]],
  [NNC_QUIZ_QUESTIONS[3]],
  [NNC_QUIZ_QUESTIONS[4], NNC_QUIZ_QUESTIONS[5]]
] as const;

function normalizeDraftAnswers(input: Record<string, unknown>): Record<string, unknown> {
  if (!Object.prototype.hasOwnProperty.call(input, 'product_interests')) return { ...input };
  return { ...input, product_interests: normalizeNncProductInterests(input.product_interests) };
}

export function QuestionnaireFlow({ initialAnswers = {}, onComplete, onAnswerSelected }: QuestionnaireFlowProps) {
  const { i18n } = useTranslation();
  const isLao = i18n.language === 'lo';
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const sectionInView = useInView(sectionRef, { amount: 0.12 });
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Record<string, unknown>>(() => normalizeDraftAnswers(initialAnswers));
  const [restored, setRestored] = useState(false);
  const questions = QUESTION_STEPS[step];
  const question = questions[0];
  const progress = ((step + 1) / QUESTION_STEPS.length) * 100;
  const railProgress = QUESTION_STEPS.length > 1
    ? (step / (QUESTION_STEPS.length - 1)) * 100
    : 100;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as Record<string, unknown>;
      const merged = normalizeDraftAnswers({ ...initialAnswers, ...parsed });
      setAnswers(merged);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
      setRestored(Object.keys(parsed).length > 0);
      const firstMissing = QUESTION_STEPS.findIndex((stepQuestions) => stepQuestions.some((item) => {
        const value = merged[item.field];
        return value == null || value === '' || (Array.isArray(value) && value.length === 0);
      }));
      if (firstMissing > 0) setStep(firstMissing);
    } catch {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [initialAnswers]);

  const save = (next: Record<string, unknown>) => {
    const normalized = normalizeDraftAnswers(next);
    setAnswers(normalized);
    try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(normalized)); } catch { /* storage is optional */ }
  };

  const choose = (targetQuestion: NncQuizQuestion, value: string) => {
    const current = answers[targetQuestion.field];
    const nextValue = targetQuestion.type === 'multi'
      ? (Array.isArray(current) && current.includes(value) ? current.filter((item) => item !== value) : [...(Array.isArray(current) ? current : []), value])
      : value;
    const next = { ...answers, [targetQuestion.field]: nextValue };
    save(next);
    onAnswerSelected?.(targetQuestion.field, nextValue, targetQuestion.id, step + 1);
  };

  const hasAnswer = (targetQuestion: NncQuizQuestion) => {
    const value = answers[targetQuestion.field];
    return value != null && value !== '' && (!Array.isArray(value) || value.length > 0);
  };
  const valid = questions.every(hasAnswer);

  const next = () => {
    if (!valid) return;
    if (step < QUESTION_STEPS.length - 1) {
      setDirection(1);
      setStep((current) => current + 1);
    }
    else {
      const normalized = normalizeDraftAnswers(answers);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      onComplete(normalized);
    }
  };

  const previous = () => {
    setDirection(-1);
    setStep((current) => Math.max(0, current - 1));
  };

  const questionMotion = {
    enter: (travelDirection: number) => ({ opacity: 0, x: reduceMotion ? 0 : travelDirection * 28 }),
    center: { opacity: 1, x: 0 },
    exit: (travelDirection: number) => ({ opacity: 0, x: reduceMotion ? 0 : travelDirection * -22 })
  };

  const optionMotion = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 8 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section ref={sectionRef} id="quiz" data-analytics-section="quiz" data-section-order="5" className="relative overflow-hidden bg-[#0d2e26] py-12 text-white sm:py-14">
      <motion.div
        aria-hidden="true"
        animate={sectionInView && !reduceMotion ? { scale: [1.02, 1.075, 1.02], x: ['0%', '1.5%', '0%'] } : { scale: 1.02, x: '0%' }}
        transition={{ duration: 20, repeat: sectionInView && !reduceMotion ? Number.POSITIVE_INFINITY : 0, ease: 'easeInOut' }}
        className="pointer-events-none absolute -inset-[5%] opacity-25 mix-blend-screen"
      >
        <picture className="absolute inset-0">
          <source type="image/avif" srcSet="/assets/nnc-b2b-rewards/visual/ambient-journey-glass-orbits-v1.avif" />
          <source type="image/webp" srcSet="/assets/nnc-b2b-rewards/visual/ambient-journey-glass-orbits-v1.webp" />
          <img src="/assets/nnc-b2b-rewards/visual/ambient-journey-glass-orbits-v1-source.png" width="1983" height="793" alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
        </picture>
      </motion.div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#071f19]/96 via-[#0d2e26]/88 to-[#123c31]/94" />
      <motion.div
        aria-hidden="true"
        animate={sectionInView && !reduceMotion ? { rotate: [0, 12, 0], scale: [0.96, 1.04, 0.96] } : { rotate: 0, scale: 1 }}
        transition={{ duration: 16, repeat: sectionInView && !reduceMotion ? Number.POSITIVE_INFINITY : 0, ease: 'easeInOut' }}
        className="pointer-events-none absolute -left-32 top-4 h-96 w-96 rounded-full border border-emerald-200/10 shadow-[0_0_100px_rgba(52,211,153,.12)]"
      />
      <div className="relative mx-auto grid min-w-0 max-w-6xl gap-5 px-4 sm:px-6 lg:grid-cols-[0.68fr_1.32fr] lg:gap-8 lg:px-8">
        <motion.div initial={{ opacity: 0, x: reduceMotion ? 0 : -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: reduceMotion ? 0.12 : 0.52, ease: [0.22, 1, 0.36, 1] }} className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <span className={`inline-flex items-center gap-2 text-xs font-black text-emerald-300 ${isLao ? 'tracking-normal' : 'uppercase tracking-[0.2em]'}`}><ClipboardCheck className="h-4 w-4" />{isLao ? '5 ຂັ້ນຕອນສັ້ນ' : '5 lựa chọn ngắn'}</span>
          <h2 className={`mt-2 text-balance text-2xl font-black sm:mt-3 sm:text-4xl ${isLao ? 'tracking-normal' : 'tracking-[-0.04em]'}`}>{isLao ? 'ເລືອກຄວາມຕ້ອງການເພື່ອເປີດສິດທິ' : 'Chọn nhu cầu của anh/chị để mở khóa quyền lợi'}</h2>
          <p className="mt-2 text-[11px] font-medium leading-5 text-emerald-50/65 sm:mt-3 sm:text-xs sm:leading-6">{isLao ? 'ຄຳຕອບຊ່ວຍ NNC ກຽມເນື້ອຫາສິນຄ້າ ແລະ ການຊ່ວຍເຫຼືອທີ່ເໝາະສົມ. ບໍ່ແມ່ນການວິນິດໄສ ຫຼື ຄຳແນະນຳທາງການແພດ.' : 'Câu trả lời giúp NNC chuẩn bị nội dung sản phẩm và hỗ trợ phù hợp; không phải chẩn đoán hay tư vấn y khoa.'}</p>
          <div className="mt-5 flex items-center gap-4">
            <div role="progressbar" aria-label={isLao ? 'ຄວາມຄືບໜ້າແບບສອບຖາມ' : 'Tiến độ câu hỏi'} aria-valuemin={1} aria-valuemax={QUESTION_STEPS.length} aria-valuenow={step + 1} className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10"><motion.div animate={{ width: `${progress}%` }} transition={{ duration: reduceMotion ? 0.08 : 0.35, ease: [0.22, 1, 0.36, 1] }} className="h-full rounded-full bg-amber-300" /></div>
            <span className="font-mono text-xs font-black text-amber-300">{String(step + 1).padStart(2, '0')} / 05</span>
          </div>
          <div aria-hidden="true" className="relative mt-4 hidden grid-cols-5 sm:grid">
            <span className="absolute left-[1.05rem] right-[1.05rem] top-[1.05rem] h-px bg-white/15" />
            <span className="absolute left-[1.05rem] right-[1.05rem] top-[1.05rem] h-px">
              <motion.span
                animate={{ width: `${railProgress}%` }}
                transition={{ duration: reduceMotion ? 0.08 : 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="block h-full bg-gradient-to-r from-emerald-300 to-amber-300 shadow-[0_0_12px_rgba(252,211,77,.65)]"
              />
            </span>
            {QUESTION_STEPS.map((items, index) => {
              const complete = index < step;
              const current = index === step;
              return (
                <div key={items[0].id} className="relative z-10 flex flex-col items-center gap-2">
                  <motion.span
                    animate={current && sectionInView && !reduceMotion ? { boxShadow: ['0 0 0 0 rgba(252,211,77,.32)', '0 0 0 8px rgba(252,211,77,0)', '0 0 0 0 rgba(252,211,77,0)'] } : { boxShadow: '0 0 0 0 rgba(252,211,77,0)' }}
                    transition={{ duration: 1.8, repeat: current && sectionInView && !reduceMotion ? Number.POSITIVE_INFINITY : 0, ease: 'easeOut' }}
                    className={`grid h-[2.1rem] w-[2.1rem] place-items-center rounded-full border text-[10px] font-black ${current ? 'border-amber-200 bg-amber-300 text-[#17352b]' : complete ? 'border-emerald-200 bg-emerald-300 text-[#17352b]' : 'border-white/20 bg-[#12382f] text-emerald-50/55'}`}
                  >
                    {complete ? <Check className="h-3.5 w-3.5" /> : index + 1}
                  </motion.span>
                  <span className={`font-mono text-[9px] font-black ${current ? 'text-amber-300' : complete ? 'text-emerald-200' : 'text-white/35'}`}>Q{index + 1}</span>
                </div>
              );
            })}
          </div>
          <AnimatePresence initial={false}>
            {restored && <motion.p role="status" initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0.08 : 0.22 }} className="mt-4 inline-flex items-center gap-2 text-[11px] font-bold text-emerald-200/70"><RotateCcw className="h-3.5 w-3.5" />{isLao ? 'ກູ້ຄືນຄຳຕອບກ່ອນໜ້າແລ້ວ' : 'Đã khôi phục câu trả lời trước'}</motion.p>}
          </AnimatePresence>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.18 }} transition={{ duration: reduceMotion ? 0.12 : 0.5, delay: reduceMotion ? 0 : 0.06 }} className="relative min-w-0 overflow-hidden rounded-xl border border-white/10 bg-white p-4 text-[#102a24] shadow-[0_35px_100px_-50px_rgba(0,0,0,.75)] sm:min-h-[500px] sm:p-6">
          <motion.span aria-hidden="true" animate={{ scaleX: progress / 100 }} transition={{ duration: reduceMotion ? 0.08 : 0.35, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-x-0 top-0 h-1 origin-left bg-gradient-to-r from-emerald-500 via-emerald-300 to-amber-300" />
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div key={questions.map((item) => item.id).join('-')} custom={direction} variants={questionMotion} initial="enter" animate="center" exit="exit" transition={{ duration: reduceMotion ? 0.08 : 0.26, ease: [0.22, 1, 0.36, 1] }}>
              <div className="flex items-start justify-between gap-4">
                <span className="font-mono text-xs font-black text-emerald-600">Q{step + 1}</span>
                {questions.some((item) => item.type === 'multi') && <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black text-emerald-700">{isLao ? 'ເລືອກໄດ້ຫຼາຍຂໍ້' : 'Có thể chọn nhiều'}</span>}
              </div>
              {questions.map((currentQuestion, questionIndex) => (
                <div key={currentQuestion.id} className={questionIndex > 0 ? 'mt-6 border-t border-slate-100 pt-6' : ''}>
                  <h3 aria-live="polite" className={`mt-4 break-words text-balance font-black sm:mt-5 ${questions.length > 1 ? 'text-lg leading-tight sm:text-xl' : isLao ? 'text-xl leading-[1.4] tracking-normal sm:text-2xl' : 'text-2xl leading-tight tracking-[-0.03em] sm:text-3xl'}`}>{isLao ? currentQuestion.question_lo : currentQuestion.question_vi}</h3>
                  <div className={questions.length > 1 ? 'mt-3' : 'mt-5 sm:mt-7'}>
                    {currentQuestion.field === 'product_interests' ? (
                      <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.035 } } }} className="grid gap-2 sm:grid-cols-2">
                        {NNC_PRODUCTS.map((product) => {
                          const selected = Array.isArray(answers[currentQuestion.field]) && (answers[currentQuestion.field] as unknown[]).includes(product.product_id);
                          return (
                            <motion.button key={product.product_id} type="button" onClick={() => choose(currentQuestion, product.product_id)} variants={optionMotion} whileHover={reduceMotion ? undefined : { x: 3 }} whileTap={reduceMotion ? undefined : { scale: 0.985 }} aria-pressed={selected} className={`group flex min-h-20 items-center gap-3 rounded-2xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${selected ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200 hover:border-emerald-300'}`}>
                              <span className="grid h-14 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-white p-1"><img src={product.packshot_url} width="160" height="140" alt="" loading="lazy" decoding="async" className="h-full w-full object-contain" /></span>
                              <span className="min-w-0 flex-1"><strong className="block text-sm font-black">{product.canonical_name}</strong><small className={`mt-1 block truncate text-[10px] font-semibold ${product.source_status === 'source_locked' ? 'text-slate-400' : 'text-amber-700'}`}>{product.source_status === 'source_locked' ? product.formulation : (isLao ? 'ລໍ NNC ກວດສອບ' : 'Chờ NNC đối soát')}</small></span>
                              <SelectMark selected={selected} reduceMotion={Boolean(reduceMotion)} />
                            </motion.button>
                          );
                        })}
                      </motion.div>
                    ) : (
                      <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.04 } } }} className={questions.length > 1 ? 'grid grid-cols-2 gap-2' : 'grid gap-2'} role={currentQuestion.type === 'single' ? 'radiogroup' : 'group'} aria-label={isLao ? currentQuestion.question_lo : currentQuestion.question_vi}>
                        {currentQuestion.options.map((option) => {
                          const current = answers[currentQuestion.field];
                          const selected = Array.isArray(current) ? current.includes(option.value) : current === option.value;
                          return <motion.button key={option.value} type="button" onClick={() => choose(currentQuestion, option.value)} variants={optionMotion} whileHover={reduceMotion ? undefined : { x: 3 }} whileTap={reduceMotion ? undefined : { scale: 0.99 }} role={currentQuestion.type === 'single' ? 'radio' : undefined} aria-checked={currentQuestion.type === 'single' ? selected : undefined} aria-pressed={currentQuestion.type === 'multi' ? selected : undefined} className={`flex min-h-12 w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-[11px] font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 sm:text-xs ${selected ? 'border-emerald-600 bg-emerald-50 text-emerald-900' : 'border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-slate-50'}`}><SelectMark selected={selected} reduceMotion={Boolean(reduceMotion)} /><span>{isLao ? option.label_lo : option.label_vi}</span></motion.button>;
                        })}
                      </motion.div>
                    )}
                    {hasAnswer(currentQuestion) && <p role="status" className="mt-3 flex items-center gap-2 text-[10px] font-bold text-emerald-700"><Check className="h-3.5 w-3.5" />{currentQuestion.field === 'product_interests' ? (isLao ? 'ບັນທຶກສິນຄ້າທີ່ສົນໃຈແລ້ວ' : 'Đã ghi nhận sản phẩm anh/chị quan tâm.') : (isLao ? 'ບັນທຶກການເລືອກແລ້ວ' : 'Đã ghi nhận lựa chọn của anh/chị.')}</p>}
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex min-w-0 items-center justify-between gap-2 border-t border-slate-100 pt-4 sm:mt-8 sm:gap-3 sm:pt-6">
            <motion.button type="button" onClick={previous} disabled={step === 0} whileTap={reduceMotion ? undefined : { scale: 0.96 }} aria-label={isLao ? 'ກັບຄືນ' : 'Quay lại'} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-3 text-[11px] font-black text-slate-500 transition hover:bg-slate-100 disabled:opacity-30 sm:min-h-12 sm:px-4 sm:text-xs"><ArrowLeft className="h-4 w-4" /><span className="hidden sm:inline">{isLao ? 'ກັບຄືນ' : 'Quay lại'}</span></motion.button>
            <motion.button type="button" onClick={next} disabled={!valid} whileTap={reduceMotion ? undefined : { scale: 0.97 }} className="inline-flex min-h-11 min-w-0 items-center gap-1.5 rounded-full bg-[#103e32] px-4 text-[11px] font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 sm:min-h-12 sm:gap-2 sm:px-6 sm:text-xs">
              {step === QUESTION_STEPS.length - 1 ? <Sparkles className="h-4 w-4" /> : null}
              {step === QUESTION_STEPS.length - 1 ? (isLao ? 'ຢືນຢັນຄຳຕອບ' : 'Xác nhận để mở khóa') : (isLao ? 'ຕໍ່ໄປ' : 'Tiếp tục')}
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function SelectMark({ selected, reduceMotion }: { selected: boolean; reduceMotion: boolean }) {
  return (
    <motion.span animate={{ scale: selected && !reduceMotion ? [1, 1.12, 1] : 1 }} transition={{ duration: reduceMotion ? 0.08 : 0.2 }} className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border transition ${selected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 bg-white'}`}>
      <AnimatePresence initial={false}>
        {selected && <motion.span initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.5 }} transition={{ duration: reduceMotion ? 0.08 : 0.16 }} aria-hidden="true"><Check className="h-3.5 w-3.5" /></motion.span>}
      </AnimatePresence>
    </motion.span>
  );
}
