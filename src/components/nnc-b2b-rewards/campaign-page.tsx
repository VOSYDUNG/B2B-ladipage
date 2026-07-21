import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Check, Sparkles, Lock, X, Download, FileText } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import * as Dialog from '@radix-ui/react-dialog';
import {
  appendNncWhatsAppReference,
  getNncCampaignPhase,
  normalizeNncProductInterests,
  NNC_CAMPAIGN_CONFIG,
  NNC_WHATSAPP_PATH,
  NNC_WHEEL_SEGMENTS,
  type NncWheelSegment
} from '@/config/nnc-b2b-rewards';
import {
  canParticipateInNncCampaign,
  NNC_PRODUCTION_UAT_OPEN
} from '@/config/nnc-production-uat';
import { landingParams, trackEvent, type AnalyticsPayload } from '@/lib/analytics';
import { useSectionAnalytics } from '@/hooks/use-section-analytics';
import type { AppLanguage } from '@/types';
import { ProductDiscovery } from './product-discovery';
import { AccumulationCalculator } from './accumulation-calculator';
import { RegistrationForm, type NncRegistrationValues } from './registration-form';
import { HeroWheel } from './hero-wheel';
import { RewardModal } from './reward-modal';
import { CampaignMomentumBand, JourneyConnector, MotionStepMarker } from './campaign-motion';
import { readNncParticipantSession, writeNncParticipantSession } from './participant-session';

interface NncCampaignPageProps {
  lang?: AppLanguage;
  setLang?: (language: AppLanguage) => void;
  landingId?: string;
  campaignId?: string;
  templateId?: string;
  landingVersion?: number;
}

type Flow = 'discover' | 'register' | 'tier_select' | 'wheel';

export function NncB2BRewardsCampaignPage({
  lang = 'vi',
  setLang,
  landingId = NNC_CAMPAIGN_CONFIG.landing_id,
  campaignId = NNC_CAMPAIGN_CONFIG.campaign_id,
  templateId = NNC_CAMPAIGN_CONFIG.template_id,
  landingVersion = 2
}: NncCampaignPageProps) {
  const { t } = useTranslation();
  const isLao = lang === 'lo';
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smoothScrollProgress = useSpring(scrollYProgress, { stiffness: 150, damping: 28, mass: 0.18 });
  const heroRef = useRef<HTMLElement>(null);
  const journeyRef = useRef<HTMLElement>(null);
  const { scrollYProgress: journeyProgress } = useScroll({ target: journeyRef, offset: ['start 85%', 'end 35%'] });
  const smoothJourneyProgress = useSpring(journeyProgress, { stiffness: 120, damping: 26, mass: 0.24 });
  const journeyBackdropY = useTransform(journeyProgress, [0, 1], [-18, 24]);
  const landingViewTracked = useRef(false);
  const questionStarted = useRef(false);
  const participantSessionChecked = useRef(false);
  const [flow, setFlow] = useState<Flow>('discover');
  const [policyOpen, setPolicyOpen] = useState(false);
  const [journeyActionStep, setJourneyActionStep] = useState(0);
  const [interestedProductIds, setInterestedProductIds] = useState<string[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, unknown>>({});
  const [registration, setRegistration] = useState<NncRegistrationValues | null>(null);
  const [participantRecord, setParticipantRecord] = useState<{ participantId: string; referralCode: string } | null>(null);
  const [rewardResult, setRewardResult] = useState<NncWheelSegment | null>(null);
  const [isWhatsAppFallback, setIsWhatsAppFallback] = useState(false);
  const [showFloatingCta, setShowFloatingCta] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [hasSpun, setHasSpun] = useState(false);
  const [rewardModalOpen, setRewardModalOpen] = useState(false);
  const [cartItems, setCartItems] = useState<Array<{ product_id: string; quantity: number }>>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const referralCodeFromUrl = useMemo(() => new URLSearchParams(window.location.search).get('ref') ?? '', []);
  const campaignPhase = useMemo(() => getNncCampaignPhase(), []);
  const canParticipate = canParticipateInNncCampaign(campaignPhase);
  const journeyFlowStep = flow === 'register' ? 1 : flow === 'tier_select' ? 2 : flow === 'wheel' ? 3 : 0;
  const visibleJourneyStep = Math.max(journeyActionStep, journeyFlowStep);
  const effectiveTemplateId = templateId === 'nnc_b2b_rewards_v1'
    ? NNC_CAMPAIGN_CONFIG.template_id
    : templateId;

  const campaignContext = useMemo(() => landingParams({ landingId, campaignId, templateId: effectiveTemplateId, variantId: 'clinical-progress', language: lang, landingVersion }), [campaignId, effectiveTemplateId, landingId, landingVersion, lang]);
  useSectionAnalytics(campaignContext);

  const trackCampaignEvent = useCallback((eventName: string, params: AnalyticsPayload = {}) => {
    void trackEvent(eventName, { ...campaignContext, ...params });
  }, [campaignContext]);

  useEffect(() => {
    if (participantSessionChecked.current) return;
    participantSessionChecked.current = true;
    if (!canParticipate) return;
    try {
      const persisted = readNncParticipantSession(window.sessionStorage, { campaignId, landingId, landingVersion });
      if (!persisted) return;
      setQuizAnswers(persisted.quizAnswers);
      const productInterests = normalizeNncProductInterests(
        Array.isArray(persisted.quizAnswers.product_interests)
          ? persisted.quizAnswers.product_interests
          : []
      );
      setInterestedProductIds(productInterests);
      setRegistration(persisted.registration);
      setParticipantRecord(persisted.participantRecord);
      if (persisted.rewardResultId) {
        const reward = NNC_WHEEL_SEGMENTS.find(x => x.reward_id === persisted.rewardResultId);
        if (persisted.cartItems) setCartItems(persisted.cartItems);
        if (persisted.cartTotal) setCartTotal(persisted.cartTotal);
        if (reward) {
          setRewardResult(reward);
          setHasSpun(true);
          const index = NNC_WHEEL_SEGMENTS.findIndex((item) => item.reward_id === reward.reward_id);
          const segment = 360 / NNC_WHEEL_SEGMENTS.length;
          setRotation(270 - (index * segment + segment / 2));
          setFlow('wheel');
        } else {
          setFlow('wheel');
        }
      } else {
        setFlow('wheel');
      }
      trackCampaignEvent('participant_session_restored', { storage_scope: 'tab_session' });
    } catch {
      // Browser storage is optional; a fresh journey remains available.
    }
  }, [campaignId, canParticipate, landingId, landingVersion, trackCampaignEvent]);

  useEffect(() => {
    const title = isLao ? 'ໂຄງການ B2B Q3/2026 · NNC Pharma' : 'Tích lũy B2B Q3/2026 · NNC Pharma';
    const description = isLao
      ? 'ໂຄງການ B2B NNC Pharma ທີ່ປະເທດລາວ ແຕ່ 01/08/2026 ຫາ 30/09/2026.'
      : 'Chương trình B2B NNC Pharma tại Lào từ 01/08/2026 đến 30/09/2026: 7 sản phẩm và 4 bậc tích lũy.';
    const previousTitle = document.title;
    const previousLanguage = document.documentElement.lang;
    const descriptionMeta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = descriptionMeta?.content;
    const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    const ogDescription = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
    const previousOgTitle = ogTitle?.content;
    const previousOgDescription = ogDescription?.content;

    document.title = title;
    document.documentElement.lang = lang;
    if (descriptionMeta) descriptionMeta.content = description;
    if (ogTitle) ogTitle.content = title;
    if (ogDescription) ogDescription.content = description;

    return () => {
      document.title = previousTitle;
      document.documentElement.lang = previousLanguage;
      if (descriptionMeta && previousDescription !== undefined) descriptionMeta.content = previousDescription;
      if (ogTitle && previousOgTitle !== undefined) ogTitle.content = previousOgTitle;
      if (ogDescription && previousOgDescription !== undefined) ogDescription.content = previousOgDescription;
    };
  }, [isLao, lang]);

  useEffect(() => {
    if (landingViewTracked.current) return;
    landingViewTracked.current = true;
    trackCampaignEvent('landing_view', {
      page_path: window.location.pathname,
      referral_present: Boolean(referralCodeFromUrl)
    });
  }, [referralCodeFromUrl, trackCampaignEvent]);

  useEffect(() => {
    const update = () => setShowFloatingCta(window.scrollY > 720 && window.scrollY < document.body.scrollHeight - window.innerHeight - 420);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  const scrollTo = useCallback((id: string) => {
    window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start'
      });
    });
  }, [reduceMotion]);

  useEffect(() => {
    if (flow === 'discover') return;
    const targetId = flow === 'register' ? 'registration' : flow === 'wheel' ? 'wheel' : '';
    if (!targetId) return;
    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById(targetId);
      if (!target) return;
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      const heading = target.querySelector<HTMLElement>('h2');
      if (heading) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [flow, reduceMotion]);

  const startFlow = (entryCta: string = 'support_section') => {
    if (!canParticipate) {
      trackCampaignEvent('campaign_unavailable', { campaign_phase: campaignPhase, entry_cta: entryCta });
      scrollTo('campaign-status');
      return;
    }
    setFlow('register');
    trackCampaignEvent('form_start', { entry_cta: entryCta });
  };

  const toggleProductInterest = (productId: string) => setInterestedProductIds((current) => {
    const selected = current.includes(productId);
    trackCampaignEvent('product_interest', { product_id: productId, action: selected ? 'deselect' : 'select' });
    return selected ? current.filter((id) => id !== productId) : [...current, productId];
  });

  const handleRegistration = async (values: NncRegistrationValues) => {
    trackCampaignEvent('registration_validated', { preferred_contact: values.preferredContact, referral_used: Boolean(values.referralCodeUsed) });
    if (values.referralCodeUsed) trackCampaignEvent('referral_code_submit', { source: referralCodeFromUrl ? 'url' : 'manual' });
    
    const { createNncReferralCode, saveB2BParticipant } = await import('@/lib/lead-service');
    const referralCodeOwned = await createNncReferralCode();
    
    const randomSuffix = globalThis.crypto?.randomUUID?.().slice(0, 8)
      ?? Math.random().toString(36).slice(2, 10);
    const participantId = `lead-v1-nnc-${Date.now().toString(36)}-${randomSuffix}`;

    const submitResult = await saveB2BParticipant(participantId, {
      phone: values.phone,
      role: values.role,
      businessName: values.businessName,
      referralCodeUsed: values.referralCodeUsed
    });

    trackCampaignEvent('participant_submit', {
      mode: submitResult.mode,
      referral_used: Boolean(values.referralCodeUsed)
    });
    trackCampaignEvent('wheel_unlock', { allocation_mode: 'provisional_preview' });
    
    const persistedParticipant = { participantId: submitResult.id, referralCode: referralCodeOwned };
    try {
      writeNncParticipantSession(window.sessionStorage, {
        campaignId,
        landingId,
        landingVersion,
        savedAt: Date.now(),
        participantRecord: persistedParticipant,
        registration: values,
        quizAnswers: {}
      });
    } catch {
      // Storage may be unavailable: answers_json: JSON.stringify(normalizedQuizAnswers)
    }
    setRegistration(values);
    setParticipantRecord(persistedParticipant);
    setIsWhatsAppFallback(false);
    setFlow('tier_select');
  };

  const handleTierSelected = async (items: Array<{ product_id: string; quantity: number }>, total: number) => {
    setCartItems(items);
    setCartTotal(total);
    if (!participantRecord) return;
    const { saveB2BParticipant } = await import('@/lib/lead-service');
    try {
      await saveB2BParticipant(participantRecord.participantId, {
        cartItems: items,
        cartTotal: total
      });
      const persisted = readNncParticipantSession(window.sessionStorage, { campaignId, landingId, landingVersion });
      if (persisted) {
        persisted.cartItems = items;
        persisted.cartTotal = total;
        writeNncParticipantSession(window.sessionStorage, persisted);
      }
    } catch (err) {
      console.error('Failed to save cart:', err);
    }
    setFlow('wheel');
  };

  const handleRewardSelected = async (reward: NncWheelSegment) => {
    if (!registration || !participantRecord) throw new Error('Participant must be persisted before previewing a benefit group');
    
    const { saveB2BParticipant } = await import('@/lib/lead-service');
    try {
      await saveB2BParticipant(participantRecord.participantId, {
        rewardId: reward.reward_id
      });
    } catch (err) {
      console.error('Failed to save reward:', err);
    }

    trackCampaignEvent('reward_preview_selected', {
      reward_id: reward.reward_id,
      approval_status: reward.approval_status,
      allocation_mode: 'provisional_preview'
    });
    return participantRecord;
  };

  const handleSpinClick = async () => {
    if (isSpinning || rewardResult) return;
    setIsSpinning(true);
    trackCampaignEvent('wheel_spin', { attempt_no: 1, allocation_mode: 'provisional_preview' });

    // Choose weighted reward segment
    const provisional = NNC_WHEEL_SEGMENTS.filter((item) => item.approval_status === 'provisional');
    if (provisional.length === 0) {
      setIsSpinning(false);
      return;
    }
    const totalWeight = provisional.reduce((sum, item) => sum + item.weight, 0);
    let pointer = Math.random() * totalWeight;
    const reward = provisional.find((item) => ((pointer -= item.weight) <= 0)) ?? provisional[0];

    const index = NNC_WHEEL_SEGMENTS.findIndex((item) => item.reward_id === reward.reward_id);
    const segment = 360 / NNC_WHEEL_SEGMENTS.length;
    
    // Set rotation degrees
    const targetRotation = (reduceMotion ? 0 : 360 * 6) + 270 - (index * segment + segment / 2);
    setRotation(targetRotation);

    try {
      const minimumMotion = new Promise((resolve) => window.setTimeout(resolve, reduceMotion ? 250 : 4500));
      await Promise.all([handleRewardSelected(reward), minimumMotion]);
      setRewardResult(reward);
      setHasSpun(true);
      
      // Update session storage
      try {
        const persisted = readNncParticipantSession(window.sessionStorage, { campaignId, landingId, landingVersion });
        if (persisted) {
          persisted.rewardResultId = reward.reward_id;
          writeNncParticipantSession(window.sessionStorage, persisted);
        }
      } catch (err) {
        console.error('Session write error during spin:', err);
      }

      // Show reward congratulations modal
      setRewardModalOpen(true);
      trackCampaignEvent('reward_result_view', { reward_id: reward.reward_id, approval_status: reward.approval_status, allocation_mode: 'provisional_preview' });
    } catch (cause) {
      console.error('Spin execution failed', cause);
    } finally {
      setIsSpinning(false);
    }
  };

  const handleCartSubmit = async (items: Array<{ product_id: string; quantity: number }>, total: number) => {
    if (!participantRecord) return;
    const { saveB2BParticipant } = await import('@/lib/lead-service');
    try {
      await saveB2BParticipant(participantRecord.participantId, {
        cartItems: items,
        cartTotal: total
      });
    } catch (err) {
      console.error('Failed to save cart items:', err);
    }
  };

  const handleWhatsAppClick = async () => {
    if (!participantRecord) return;
    const { saveB2BParticipant } = await import('@/lib/lead-service');
    try {
      await saveB2BParticipant(participantRecord.participantId, {
        whatsappClickedAt: true
      });
    } catch (err) {
      console.error('Failed to save WhatsApp click event:', err);
    }
  };

  const whatsapp = (message: string, location: string, intent: string, extras: AnalyticsPayload = {}) => {
    trackCampaignEvent('whatsapp_click', { cta_location: location, intent, ...extras });
    const referenceSubject = typeof extras.product_id === 'string' ? extras.product_id : undefined;
    const referencedMessage = appendNncWhatsAppReference(message, intent, referenceSubject);
    window.open(`https://wa.me/${NNC_WHATSAPP_PATH}?text=${encodeURIComponent(referencedMessage)}`, '_blank', 'noopener,noreferrer');
  };

  const handleRegistrationWhatsAppFallback = (values: NncRegistrationValues) => {
    const randomSuffix = globalThis.crypto?.randomUUID?.().slice(0, 8)
      ?? Math.random().toString(36).slice(2, 10);
    const fallbackParticipant = {
      participantId: `wa-nnc-${Date.now().toString(36)}-${randomSuffix}`,
      referralCode: ''
    };
    trackCampaignEvent('registration_whatsapp_fallback', {
      form_id: 'nnc-rewards-order',
      reason: 'firestore_submission_failed'
    });
    trackCampaignEvent('wheel_unlock', {
      allocation_mode: 'provisional_preview',
      handoff_mode: 'whatsapp_fallback'
    });
    setRegistration(values);
    setParticipantRecord(fallbackParticipant);
    setIsWhatsAppFallback(true);
    setFlow('tier_select'); // setFlow('wheel')
  };

  const changeLanguage = (nextLanguage: AppLanguage) => {
    if (!setLang || nextLanguage === lang) return;
    trackCampaignEvent('language_change', { from_language: lang, to_language: nextLanguage });
    setLang(nextLanguage);
  };

  const handleProgramView = useCallback(() => {
    trackCampaignEvent('program_view', { section_id: 'accumulation' });
  }, [trackCampaignEvent]);

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="nnc-campaign min-h-screen overflow-x-hidden bg-white font-sans text-[#102a24] selection:bg-emerald-200"
        data-language={lang}
        data-translation-status={isLao ? 'provisional' : 'source-locked'}
      >
      <a href="#main-content" className="fixed left-3 top-3 z-[70] -translate-y-24 rounded-full bg-[#103e32] px-5 py-3 text-xs font-black text-white shadow-xl transition focus:translate-y-0">{isLao ? 'ໄປຫາເນື້ອຫາຫຼັກ' : 'Đi tới nội dung chính'}</a>
      <header className="relative sticky top-0 z-40 border-b border-emerald-950/5 bg-white/88 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })} className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
            <img src="/assets/nnc-b2b-rewards/web/nnc-logo-160.webp" width="160" height="160" alt="NNC Pharma" className="h-10 w-10 object-contain" />
            <div className="text-left leading-none"><strong className="block text-sm font-black tracking-wide text-emerald-800">NNC PHARMA</strong><span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">B2B · Q3 2026 · Laos</span></div>
          </button>
          <nav aria-label={isLao ? 'ເມນູແຄມເປນ' : 'Điều hướng chiến dịch'} className="hidden items-center gap-7 text-xs font-bold text-slate-600 lg:flex">
            <button type="button" onClick={() => scrollTo('products')} className="rounded-sm transition hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">{isLao ? 'ຜະລິດຕະພັນ' : 'Sản phẩm'}</button>
            <button type="button" onClick={() => scrollTo('accumulation')} className="rounded-sm transition hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">{isLao ? 'ການສະສົມ' : 'Tích lũy'}</button>
            <button type="button" onClick={() => whatsapp(isLao ? 'ສະບາຍດີ NNC Pharma, ຂ້ອຍຕ້ອງການຮັບຄຳປຶກສາໂຄງການ B2B Q3/2026.' : 'Xin chào NNC Pharma, tôi muốn được tư vấn chương trình B2B Q3/2026.', 'header', 'campaign_consultation')} className="rounded-sm transition hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">WhatsApp</button>
          </nav>
          <div className="flex items-center gap-2">
            {setLang && <div role="group" className="flex rounded-full border border-slate-200 bg-slate-50 p-1" aria-label={isLao ? 'ເລືອກພາສາ' : 'Chọn ngôn ngữ'}><button type="button" onClick={() => changeLanguage('vi')} aria-pressed={lang === 'vi'} className={`rounded-full px-3 py-2 text-[10px] font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${lang === 'vi' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-400'}`}>VI</button><button type="button" onClick={() => changeLanguage('lo')} aria-pressed={lang === 'lo'} className={`rounded-full px-3 py-2 text-[10px] font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${lang === 'lo' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-400'}`}>ລາວ</button></div>}
            <button type="button" onClick={() => { trackCampaignEvent('header_cta_click', { destination: 'products' }); scrollTo('products'); }} aria-label={isLao ? 'ເບິ່ງໂຄງການ' : 'Xem chương trình'} className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#103e32] text-white transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 sm:hidden"><ArrowRight className="h-4 w-4" /></button>
            <button type="button" onClick={() => { trackCampaignEvent('header_cta_click', { destination: 'products' }); scrollTo('products'); }} className="hidden min-h-11 items-center gap-2 rounded-full bg-[#103e32] px-5 text-xs font-black text-white transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 sm:inline-flex">{isLao ? 'ເບິ່ງໂຄງການ' : 'Xem chương trình'}<ArrowRight className="h-4 w-4" /></button>
          </div>
        </div>
        <motion.div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-gradient-to-r from-emerald-500 via-amber-300 to-emerald-700" style={{ scaleX: reduceMotion ? 1 : smoothScrollProgress }} />
      </header>

      {isLao && (
        <div role="status" lang="vi" className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-[10px] font-black uppercase tracking-[0.12em] text-amber-900">
          Bản tiếng Lào tạm thời · Pending NNC language approval
        </div>
      )}

      {campaignPhase !== 'active' && !NNC_PRODUCTION_UAT_OPEN && (
        <div id="campaign-status" role="status" className={`border-b px-4 py-3 text-center text-xs font-bold leading-5 ${campaignPhase === 'upcoming' ? 'border-sky-200 bg-sky-50 text-sky-900' : 'border-slate-200 bg-slate-100 text-slate-700'}`}>
          {campaignPhase === 'upcoming'
            ? (isLao ? 'ໂຄງການເປີດຮັບຂໍ້ມູນແຕ່ 01/08/2026. ທ່ານຍັງສາມາດເບິ່ງສິນຄ້າ ແລະ ນະໂຍບາຍໄດ້.' : 'Chương trình mở tiếp nhận từ 01/08/2026. Anh/chị vẫn có thể xem sản phẩm và chính sách trước.')
            : (isLao ? 'ໂຄງການໄດ້ສິ້ນສຸດໃນ 30/09/2026. ກະລຸນາຕິດຕໍ່ NNC ເພື່ອຮັບນະໂຍບາຍປັດຈຸບັນ.' : 'Chương trình đã kết thúc ngày 30/09/2026. Vui lòng liên hệ NNC để nhận chính sách hiện hành.')}
        </div>
      )}

      <main id="main-content" tabIndex={-1}>
        <section ref={heroRef} data-analytics-section="hero" data-section-order="1" className="relative overflow-hidden bg-gradient-to-br from-[#0a2a22] via-[#051612] to-[#04100d] text-white py-12 lg:py-20">
          <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
            <div className="absolute -left-1/4 -top-1/4 h-2/3 w-2/3 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="absolute -right-1/4 -bottom-1/4 h-2/3 w-2/3 rounded-full bg-amber-400/8 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              
              {/* Left Column: Text & Buttons */}
              <motion.div 
                initial={{ opacity: 0, x: reduceMotion ? 0 : -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ duration: reduceMotion ? 0.1 : 0.6, ease: [0.22, 1, 0.36, 1] }} 
                className="flex flex-col items-start text-left"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/20 bg-amber-400/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-amber-300"><Sparkles className="h-3 w-3" />{t('nnc.hero.badge')}</span>
                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[9px] font-black text-slate-300">01/08/2026 — 30/09/2026</span>
                </div>
                
                <p className="mt-4 text-[9px] font-black uppercase tracking-[0.13em] text-emerald-350 sm:text-[10px]">
                  {isLao ? 'ສຳລັບຄູ່ຮ່ວມ B2B ຂອງ NNC' : 'NNC PHARMA · CHƯƠNG TRÌNH TRI ÂN ĐỐI TÁC B2B Q3/2026'}
                </p>
                
                <h1 className={`mt-2 font-black text-white ${isLao ? 'text-[1.8rem] leading-[1.22] tracking-normal sm:text-[2.1rem] lg:text-[clamp(2rem,3.1vw,2.85rem)]' : 'text-[1.85rem] leading-[1.05] tracking-[-0.04em] sm:text-[2.25rem] md:text-[clamp(1.8rem,3vw,2.5rem)]'}`}>
                  {isLao ? 'ໝູນແມ່ນໄດ້ຂອງຂວັນ 100%' : '100% QUAY LÀ TRÚNG QUÀ'} <br />
                  <span className="text-amber-300">{isLao ? 'ສ່ວນຫຼຸດສະສົມສູງສຸດ 10%' : 'CHIẾT KHẤU TÍCH LŨY ĐẾN 10%'}</span>
                </h1>
                
                <p className="mt-3 max-w-[31rem] text-[11px] font-semibold leading-[1.6] text-slate-300 sm:text-xs">
                  {isLao 
                    ? 'ສະເພາະຮ້ານຢາ & ຄລີນິກ ຢູ່ ລາວ. ສຳເລັດ 2 ຂັ້ນຕອນເພື່ອປົດລັອກການໝູນ — ທຸກການໝູນມີຂອງຂວັນ.'
                    : 'Dành riêng cho Bác sĩ, Nhà thuốc & Phòng khám tại Lào. Hoàn thành 2 bước khảo sát để mở khóa lượt quay sỉ gộp 100% trúng quà.'}
                </p>
                
                <div className="mt-6 flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <button 
                    type="button" 
                    onClick={() => {
                      if (flow === 'discover' || flow === 'register') {
                        scrollTo('funnel-journey');
                        setFlow('register');
                      } else if (flow === 'tier_select') {
                        scrollTo('funnel-journey');
                      } else if (flow === 'wheel') {
                        if (hasSpun) setRewardModalOpen(true);
                        else void handleSpinClick();
                      } else {
                        scrollTo('funnel-journey');
                      }
                    }} 
                    className="inline-flex min-h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-amber-300 hover:bg-amber-200 px-6 text-[11px] font-black text-emerald-950 shadow-xl shadow-amber-950/20 transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 sm:text-xs cursor-pointer select-none"
                  >
                    {(() => {
                      if (flow === 'discover' || flow === 'register') {
                        return isLao ? 'ປົດລັອກການໝູນດຽວນີ້' : 'MỞ KHÓA LƯỢT QUAY NGAY';
                      }
                      if (flow === 'tier_select') {
                        return isLao ? 'ເລືອກເປົ້າໝາຍເພື່ອໝູນ' : 'CHỌN BẬC TÍCH LŨY DE QUAY';
                      }
                      if (flow === 'wheel') {
                        return hasSpun 
                          ? (isLao ? 'ເບິ່ງລາງວັນຂອງຂ້ອຍ' : 'XEM LẠI PHẦN QUÀ')
                          : (isLao ? 'ໝູນວົງລໍ້ລາງວັນ!' : 'QUAY THƯỞNG NGAY!');
                      }
                      return isLao ? 'ເບິ່ງໃບສັ່ງຊື້ອ້າງອີງ' : 'XEM ĐƠN HÀNG THAM KHẢO';
                    })()}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  
                  <button 
                    type="button" 
                    onClick={() => setPolicyOpen(true)} 
                    data-policy-trigger
                    className="inline-flex min-h-11 w-full sm:w-auto items-center justify-center px-4 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-[11px] font-black text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:text-xs cursor-pointer"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {isLao ? 'ເບິ່ງນະໂຍບາຍເຕັມ (PDF)' : 'XEM CHÍNH SÁCH ĐẦY ĐỦ'}
                  </button>
                </div>
              </motion.div>

              {/* Right Column: Visualizer Wheel */}
              <motion.div
                initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.94 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ duration: reduceMotion ? 0.1 : 0.6, delay: reduceMotion ? 0 : 0.1, ease: [0.22, 1, 0.36, 1] }}
                id="wheel"
                className="w-full scroll-mt-20"
              >
                <HeroWheel
                  locked={flow !== 'wheel' && !hasSpun}
                  isSpinning={isSpinning}
                  rotation={rotation}
                  onLockClick={() => {
                    scrollTo('funnel-journey');
                    if (flow === 'discover') setFlow('register');
                  }}
                  onSpinClick={() => {
                    if (hasSpun) setRewardModalOpen(true);
                    else void handleSpinClick();
                  }}
                  hasSpun={hasSpun}
                  isLao={isLao}
                />
                {flow === 'wheel' && !hasSpun && (
                  <div role="status" className="mx-auto mt-3 flex max-w-md items-center justify-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-400/10 px-4 py-2 text-center text-[11px] font-black text-emerald-100">
                    <Sparkles className="h-4 w-4 text-amber-300" />
                    {isLao ? 'Vòng quay đã mở khóa' : 'Vòng quay đã mở khóa — nhấn để quay nhận quyền lợi'}
                  </div>
                )}
              </motion.div>

            </div>
          </div>
        </section>

        <CampaignMomentumBand isLao={isLao} />

        <section ref={journeyRef} id="journey" data-analytics-section="steps" data-section-order="2" className="relative overflow-hidden bg-white py-10 sm:py-12">
          <motion.div style={{ y: reduceMotion ? 0 : journeyBackdropY }} className="pointer-events-none absolute -inset-y-10 inset-x-0 opacity-65 will-change-transform" aria-hidden="true">
            <picture className="absolute inset-0">
              <source type="image/avif" srcSet="/assets/nnc-b2b-rewards/visual/ambient-journey-glass-orbits-v1.avif" />
              <source type="image/webp" srcSet="/assets/nnc-b2b-rewards/visual/ambient-journey-glass-orbits-v1.webp" />
              <img src="/assets/nnc-b2b-rewards/visual/ambient-journey-glass-orbits-v1-source.png" width="1983" height="793" alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-b from-white/55 via-white/75 to-white" />
          </motion.div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
              <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.55 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}><span className={`text-[10px] font-black text-emerald-700 ${isLao ? 'tracking-normal' : 'uppercase tracking-[0.18em]'}`}>{isLao ? 'ການເດີນທາງ' : 'Hành trình tham gia'}</span><h2 className={`mt-2 text-2xl font-black sm:text-3xl ${isLao ? 'tracking-normal' : 'tracking-[-0.035em]'}`}>{isLao ? 'ຈາກການຄົ້ນຫາ ໄປຫາການຊ່ວຍສັ່ງຊື້' : 'Từ tìm hiểu đến hỗ trợ đặt hàng'}</h2></motion.div>
              <motion.p initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.55 }} transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.08, ease: [0.22, 1, 0.36, 1] }} className="max-w-2xl text-xs font-medium leading-6 text-slate-500 lg:justify-self-end">{isLao ? 'ເບິ່ງສິນຄ້າ, ເລືອກ 5 ຂັ້ນຕອນ, ບັນທຶກຂໍ້ມູນ ແລະ ໃຫ້ NNC ຊ່ວຍຜ່ານ WhatsApp.' : 'Khám phá sản phẩm, hiểu chính sách, hoàn thành 5 lựa chọn ngắn và nhận hỗ trợ đặt hàng qua WhatsApp.'}</motion.p>
            </div>
            <ol className="relative mt-7 grid gap-2.5 pl-11 lg:grid-cols-5 lg:gap-3 lg:pl-0 lg:pt-9">
              <JourneyConnector progress={smoothJourneyProgress} />
              {[
                { title: isLao ? 'ຄົ້ນພົບ' : 'Khám phá', detail: isLao ? '7 ຜະລິດຕະພັນ' : '7 sản phẩm', destination: 'products' },
                { title: isLao ? 'ລົງທະບຽນ' : 'Đăng ký', detail: isLao ? 'ຂໍ້ມູນລູກຄ້າ' : 'Thông tin tham gia', destination: 'funnel-journey' },
                { title: isLao ? 'ໝຸນວົງລໍ້' : 'Quay thưởng', detail: isLao ? 'ຮັບສິດທິ' : 'Nhận quyền lợi', destination: flow === 'discover' || flow === 'register' ? 'funnel-journey' : 'main-content' },
                { title: isLao ? 'ໃບສັ່ງຊື້' : 'Đơn hàng', detail: isLao ? 'ສ້າງໃບສັ່ງຊື້ອ້າງອີງ' : 'Lên đơn tham khảo', destination: flow === 'discover' || flow === 'register' || flow === 'wheel' ? 'funnel-journey' : 'funnel-journey' },
                { title: isLao ? 'ຮັບການຊ່ວຍ' : 'Nhận hỗ trợ', detail: 'WhatsApp · 020 9980 6327', destination: 'whatsapp' }
              ].map(({ title, detail, destination }, index) => (
                <motion.li
                  key={title}
                  initial={{ opacity: 0, y: reduceMotion ? 0 : 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.42 }}
                  transition={{ duration: reduceMotion ? 0.1 : 0.42, delay: reduceMotion ? 0 : index * 0.07, ease: [0.22, 1, 0.36, 1] }}
                  className="relative"
                >
                  <MotionStepMarker index={index} progress={smoothJourneyProgress} reached={index <= visibleJourneyStep} current={index === visibleJourneyStep} />
                  <motion.button
                    type="button"
                    aria-current={index === visibleJourneyStep ? 'step' : undefined}
                    aria-label={`${title}. ${detail}`}
                    onClick={() => {
                      setJourneyActionStep((current) => Math.max(current, index));
                      trackCampaignEvent('journey_step_click', { step_id: `step_${index + 1}`, destination });
                      if (index === 0) {
                        scrollTo('products');
                        return;
                      }
                      if (index === 1 || index === 2) {
                        if (flow === 'discover') startFlow(index === 1 ? 'journey_needs' : 'journey_registration');
                        else scrollTo(destination);
                        return;
                      }
                      if (index === 3) {
                        scrollTo('accumulation');
                        return;
                      }
                      whatsapp(
                        isLao ? 'ສະບາຍດີ NNC Pharma, ຂ້ອຍຕ້ອງການຮັບຄຳປຶກສາໂຄງການ B2B Q3/2026.' : 'Xin chào NNC Pharma, tôi muốn được tư vấn chương trình B2B Q3/2026.',
                        'journey',
                        'campaign_consultation'
                      );
                    }}
                    whileHover={reduceMotion ? undefined : { y: -5, scale: 1.01 }}
                    whileTap={reduceMotion ? undefined : { y: -1, scale: 0.985 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className={`group relative flex min-h-24 w-full touch-manipulation flex-col overflow-hidden rounded-xl border p-4 text-left shadow-sm transition-[border-color,background-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 lg:min-h-28 ${index === visibleJourneyStep ? 'border-emerald-400 bg-white shadow-[0_20px_45px_-30px_rgba(16,62,50,0.65)]' : index < visibleJourneyStep ? 'border-emerald-200 bg-emerald-50/75 hover:border-emerald-300 hover:bg-emerald-50' : 'border-slate-200 bg-white/80 hover:border-emerald-300 hover:bg-white hover:shadow-[0_18px_40px_-30px_rgba(16,62,50,0.55)]'}`}
                  >
                    <span className={`absolute inset-x-0 top-0 h-1 origin-left transition-transform duration-300 ${index <= visibleJourneyStep ? 'scale-x-100 bg-gradient-to-r from-emerald-500 to-amber-300' : 'scale-x-0 bg-emerald-400 group-hover:scale-x-100 group-focus-visible:scale-x-100'}`} aria-hidden="true" />
                    <span className="font-mono text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600">0{index + 1}</span>
                    <strong className="mt-2 block text-base leading-tight text-[#102a24]">{title}</strong>
                    <span className="mt-1 block max-w-[13rem] pr-7 text-[11px] font-semibold leading-4 text-slate-500">{detail}</span>
                    <span className={`absolute bottom-3 right-3 grid h-7 w-7 place-items-center rounded-full transition-colors duration-200 ${index === visibleJourneyStep ? 'bg-[#103e32] text-white' : 'bg-emerald-50 text-emerald-700 group-hover:bg-[#103e32] group-hover:text-white group-active:bg-emerald-700'}`} aria-hidden="true">
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </span>
                  </motion.button>
                </motion.li>
              ))}
            </ol>
          </div>
        </section>



        <section id="funnel-journey" className="bg-[#f4f8f6] py-12 sm:py-16 border-t border-slate-100">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            
            {/* Step 1: Registration Form */}
            {(flow === 'discover' || flow === 'register') && (
              <div id="registration" className="scroll-mt-20">
                <RegistrationForm 
                  referralCodeFromUrl={referralCodeFromUrl} 
                  onRegistered={handleRegistration} 
                  onWhatsAppFallback={handleRegistrationWhatsAppFallback} 
                  onFormStart={() => trackCampaignEvent('form_start', { form_id: 'nnc-rewards-order' })}
                  interestedProductIds={interestedProductIds}
                  toggleProductInterest={toggleProductInterest}
                />
              </div>
            )}

            {/* Step 2: Target Tier Selector */}
            {flow === 'tier_select' && (
              <div id="tier-selection" className="scroll-mt-20 bg-white border border-emerald-950/8 p-6 sm:p-8 rounded-3xl shadow-xl shadow-emerald-950/5 relative overflow-hidden">
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-amber-300" />
                <div className="text-center mb-6">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-250 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-800">
                    {isLao ? 'ຂັ້ນຕອນ 2 / 2' : 'BƯỚC 2/2 ĐỂ MỞ KHÓA VÒNG QUAY'}
                  </span>
                  <h3 className="mt-3 text-xl font-black text-[#102a24] sm:text-2xl">
                    {isLao ? 'ເລືອກຂັ້ນສະສົມເປົ້າໝາຍ' : 'Chương trình Tích lũy Doanh số Q3/2026'}
                  </h3>
                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    {isLao 
                      ? 'ເລືອກຈຳນວນເປົ້າໝາຍໄຕມາດ 3 ຂອງທ່ານເພື່ອປົດລັອກວົງລໍ້ລາງວັນ:' 
                      : 'Dành cho đối tác B2B. Chạm chọn bậc mục tiêu doanh số quý anh/chị nhắm tới để mở khóa vòng quay:'}
                  </p>
                </div>

                <AccumulationCalculator
                  isSelectionMode={true}
                  onTierSelected={handleTierSelected}
                />

                <div className="mt-6 border-t border-slate-100 pt-5 text-left">
                  <ul className="space-y-2 text-[11px] font-semibold text-slate-500 leading-relaxed list-disc list-inside">
                    <li>{isLao ? 'ສ່ວນຫຼຸດທັນທີ 5% ໃນທຸກໆບິນສັ່ງຊື້.' : 'Giảm ngay 5% trực tiếp trên mọi hóa đơn nhập hàng.'}</li>
                    <li>{isLao ? 'ໂບນັດທ້າຍໄຕມາດ 2% ຫາ 5% ຂອງຍອດສະສົມທັງໝົດ.' : 'Thưởng cuối quý tích lũy gộp đơn từ 2% đến 5% suốt quý.'}</li>
                    <li>{isLao ? 'ໝາຍເຫດ: ບໍ່ສາມາດໃຊ້ຮ່ວມກັບໂຄງການ 30+1 ໄດ້.' : 'Lưu ý: Chương trình bán sỉ không áp dụng đồng thời với quà tặng lẻ 30+1.'}</li>
                  </ul>
                </div>
              </div>
            )}

            {/* The wheel itself is the next surface; retain no intermediate guide card. */}
            {false && flow === 'wheel' && (
              <div id="wheel-guide" className="scroll-mt-20 bg-white border border-emerald-950/8 p-5 sm:p-6 rounded-2xl shadow-lg shadow-emerald-950/5 text-center relative overflow-hidden max-w-lg mx-auto">
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-amber-300" />
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-250 mx-auto mb-3 shadow-sm animate-pulse">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                </div>
                <h3 className="text-lg font-black text-[#102a24] sm:text-xl">
                  {isLao ? 'ປົດລັອກວົງລໍ້ສຳເລັດ!' : 'Đã mở khóa lượt quay!'}
                </h3>
                <p className="mt-2 text-[11px] font-medium text-slate-500 leading-relaxed">
                  {isLao 
                    ? 'ກະລຸນາເລື່ອນຂຶ້ນເທິງ (ຫຼື ກົດປຸ່ມລຸ່ມນີ້) ເພື່ອໝູນວົງລໍ້.' 
                    : 'Quyền lợi sỉ gộp Q3 đã sẵn sàng. Hãy cuộn lên đầu trang (hoặc nhấn nút bên dưới) để thực hiện lượt quay.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    scrollTo('main-content');
                    // wait smooth scroll then spin
                    window.setTimeout(() => {
                      void handleSpinClick();
                    }, 700);
                  }}
                  className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-amber-300 px-6 text-[11px] font-black text-[#102a24] hover:bg-amber-250 transition shadow-sm cursor-pointer select-none"
                >
                  {isLao ? 'ໝູນວົງລໍ້ດຽວນີ້' : 'QUAY VÒNG QUAY NGAY'}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}



          </div>
        </section>

        <RewardModal
          open={rewardModalOpen}
          onOpenChange={setRewardModalOpen}
          reward={rewardResult}
          participantId={participantRecord?.participantId ?? ''}
          referralCodeOwned={participantRecord?.referralCode ?? ''}
          isWhatsAppFallback={isWhatsAppFallback}
          registration={registration}
          onWhatsAppClick={handleWhatsAppClick}
          cartItems={cartItems}
          cartTotal={cartTotal}
          isLao={isLao}
        />
      </main>

      <footer className="border-t border-white/10 bg-[#06140f] py-8 text-emerald-50/55">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-end lg:px-8">
          <div><div className="flex items-center gap-3"><img src="/assets/nnc-b2b-rewards/web/nnc-logo-160.webp" width="160" height="160" alt="NNC Pharma" className="h-10 w-10 object-contain" /><strong className="text-sm font-black tracking-wide text-white">NNC PHARMA CO., LTD.</strong></div><p className="mt-4 max-w-xl text-xs font-medium leading-6">{isLao ? 'ໂຄງການ B2B Q3/2026 ສຳລັບແພດ, ຄລີນິກ, ຮ້ານຂາຍຢາ ແລະ ຄູ່ຮ່ວມ B2B ໃນປະເທດລາວ.' : 'Chương trình B2B Q3/2026 dành cho bác sĩ, phòng khám, nhà thuốc và đối tác B2B tại Lào.'}</p></div>
          <div className="lg:text-right"><button type="button" onClick={() => whatsapp(isLao ? 'ສະບາຍດີ NNC Pharma, ຂ້ອຍຕ້ອງການຮັບຄຳປຶກສາໂຄງການ B2B Q3/2026.' : 'Xin chào NNC Pharma, tôi muốn được tư vấn chương trình B2B Q3/2026.', 'footer', 'campaign_consultation')} className="inline-flex items-center gap-2 text-sm font-black text-emerald-300 hover:text-emerald-200"><FaWhatsapp size={16} />{NNC_CAMPAIGN_CONFIG.whatsapp.display}</button><p className="mt-3 text-[10px] font-bold uppercase tracking-[0.12em]">01/08/2026 — 30/09/2026</p></div>
        </div>
      </footer>

      <AnimatePresence>
        {showFloatingCta && flow === 'discover' && <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} className="fixed inset-x-3 bottom-3 z-30 mx-auto max-w-md sm:bottom-6"><button type="button" onClick={() => { trackCampaignEvent('floating_cta_click', { destination: 'accumulation' }); scrollTo('accumulation'); }} className="flex min-h-15 w-full items-center justify-between rounded-full border border-white/10 bg-[#103e32]/95 px-6 text-sm font-black text-white shadow-2xl shadow-emerald-950/35 backdrop-blur-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"><span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-amber-300" />{isLao ? 'ເບິ່ງນະໂຍບາຍສະສົມ' : 'Xem chính sách tích lũy'}</span><ArrowRight className="h-4 w-4" /></button></motion.div>}
      </AnimatePresence>

      <Dialog.Root open={policyOpen} onOpenChange={setPolicyOpen}>
        <AnimatePresence>
          {policyOpen && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-[#06140f]/85 backdrop-blur-sm" />
              </Dialog.Overlay>
              <Dialog.Content asChild>
                <motion.div initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.95 }} transition={{ duration: 0.2 }} className="fixed inset-4 z-[60] flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:inset-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[90vh] sm:w-[90vw] sm:max-w-4xl sm:-translate-x-1/2 sm:-translate-y-1/2">
                  <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-4">
                    <Dialog.Title className="text-sm font-black text-slate-800">
                      {isLao ? 'ນະໂຍບາຍ B2B ທັງໝົດ' : 'Chính sách B2B đầy đủ'}
                    </Dialog.Title>
                    <Dialog.Close className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700">
                      <X className="h-4 w-4" />
                    </Dialog.Close>
                  </div>
                  
                  <div className="flex-1 bg-slate-100 overflow-y-auto h-[60vh] min-h-[400px]">
                    <img 
                      src="/assets/nnc-b2b-rewards/pdf-pages/page-1.jpg" 
                      alt="NNC B2B Policy" 
                      className="w-full h-auto"
                      loading="eager"
                    />
                  </div>
                  
                  <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-white px-5 py-4">
                    <a 
                      href="/assets/nnc-b2b-rewards/NNC_B2B_Policy_Lao.pdf" 
                      download 
                      className="flex items-center gap-2 rounded-xl bg-[#103e32] px-5 py-2.5 text-xs font-black text-white shadow-lg transition hover:bg-emerald-700"
                    >
                      <Download className="h-4 w-4" />
                      {isLao ? 'ດາວໂຫຼດ PDF' : 'Tải xuống PDF'}
                    </a>
                    <Dialog.Close asChild>
                      <button type="button" className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50">
                        {isLao ? 'ປິດ' : 'Đóng'}
                      </button>
                    </Dialog.Close>
                  </div>
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>
      </div>
    </MotionConfig>
  );
}
