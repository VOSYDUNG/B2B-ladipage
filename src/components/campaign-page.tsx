import * as Accordion from '@radix-ui/react-accordion'
import * as Tabs from '@radix-ui/react-tabs'
import {
  ArrowRight,
  BadgeCheck,
  Box,
  Building2,
  Check,
  ChevronDown,
  CircleDollarSign,
  ClipboardCheck,
  Gift,
  ZoomIn,
  Menu,
  PackageCheck,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
  X,
  Play,
  Video,
  Facebook,
  Phone
} from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SectionHeading } from '@/components/ui/section-heading'
import { SafeText } from '@/components/ui/safe-text'
import { LeadDialog } from '@/components/lead-dialog'
import { campaignConfig } from '@/config/campaign'
import { getVariantContent, pendingMedicalClaims } from '@/content/content'
import { useOnceInView } from '@/hooks/use-once-in-view'
import { campaignParams, trackEvent } from '@/lib/analytics'
import { useSeo } from '@/hooks/use-seo'
import { useSectionAnalytics } from '@/hooks/use-section-analytics'
import { useScrollTracking } from '@/hooks/use-scroll-tracking'
import { useTranslation } from 'react-i18next'
import { cn, formatLak } from '@/lib/utils'
import type { LandingVariant } from '@/types'
import { SpotlightCard } from '@/components/ui/spotlight-card'
import { NumberTicker } from '@/components/ui/number-ticker'

const benefitIcons = [PackageCheck, Store, Gift, Users]

export function CampaignPage({
  variant,
  lang,
  setLang,
  campaignId = 'VG5_KMK_LAO_2026',
  landingId = 'vg5-kmk',
  landingVersion = 1,
}: {
  variant: LandingVariant
  lang: 'vi' | 'lo'
  setLang: (l: 'vi'|'lo') => void
  campaignId?: string
  landingId?: string
  landingVersion?: number
}) {
  const { t, i18n } = useTranslation()
  const reducedMotion = useReducedMotion()
  const [menuOpen, setMenuOpen] = useState(false)
  const [leadOpen, setLeadOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<'basic' | 'advanced'>('basic')
  const [reward, setReward] = useState<'product' | 'cash'>('product')
  const [showStickyCta, setShowStickyCta] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyCta(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useSeo(lang, variant);
  const analyticsContext = useMemo(
    () => campaignParams(variant, lang, campaignId, landingId, landingVersion),
    [campaignId, landingId, landingVersion, lang, variant],
  )

  useScrollTracking(variant, lang, campaignId, landingId, landingVersion);
  useSectionAnalytics(analyticsContext)
  useEffect(() => {
    void trackEvent('page_view', {
      ...analyticsContext,
      page_path: window.location.pathname
    })
  }, [analyticsContext])

  const openLead = useCallback(
    (pkg: 'basic' | 'advanced', location: string) => {
      setSelectedPackage(pkg)
      setLeadOpen(true)
      void trackEvent('select_promotion', {
        ...analyticsContext,
        promotion_id: pkg,
        promotion_name: campaignConfig.packages[pkg].name,
        creative_slot: location,
        selected_package: pkg,
      })
    },
    [analyticsContext],
  )

  const packageRef = useOnceInView<HTMLDivElement>(() => {
    void trackEvent('view_promotion', {
      ...analyticsContext,
      promotion_id: 'package_section',
      promotion_name: 'B2B pharmacy packages',
      creative_slot: 'package_comparison',
    })
  })

  const reveal = reducedMotion
    ? {}
    : { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-80px' } }

  return (
    <div className={cn("min-h-screen overflow-x-hidden bg-[#f8fbf8] text-emerald-950", lang === 'lo' ? "lang-lo break-keep" : "lang-vi")}>
      <header className="sticky top-0 z-50 border-b border-emerald-950/8 bg-[#f8fbf8]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#top" className="flex items-center gap-3" aria-label="Về đầu trang">
            <div className="grid size-11 place-items-center overflow-hidden rounded-xl bg-white shadow-sm border border-slate-100">
              <img src="/nnc-logo.png" alt="NNC Logo" className="w-full h-full object-contain p-1" />
            </div>
            <div>
              <p className="text-sm font-extrabold leading-none">NNC Pharma Laos</p>
              <p className="mt-1 text-[11px] font-semibold text-emerald-700">Pharmacy Partner Program</p>
            </div>
          </a>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Điều hướng chính">
            {[
              ['#benefits', t('nav.benefits')],
              ['#products', t('nav.products')],
              ['#packages', t('nav.packages')],
              ['#display', t('nav.display')],
              ['#process', t('nav.process')],
            ].map(([href, label]) => (
              <a key={href} className="text-sm font-bold text-slate-600 transition hover:text-emerald-800" href={href}>
                {label}
              </a>
            ))}
          </nav>

          
          <div className="flex items-center gap-2">
            <button onClick={() => setLang('vi')} className={`text-xs font-bold px-2 py-1 rounded ${lang === 'vi' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-400 hover:text-slate-600'}`}>VI</button>
            <button onClick={() => setLang('lo')} className={`text-xs font-bold px-2 py-1 rounded ${lang === 'lo' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-400 hover:text-slate-600'}`}>LO</button>
          </div>

          <div className="hidden lg:block">
            <Button onClick={() => openLead('basic', 'header')}>{t('primaryCta')}</Button>
          </div>
          <button className="grid size-11 place-items-center rounded-full border border-emerald-950/10 lg:hidden" onClick={() => setMenuOpen((v) => !v)} aria-label="Mở menu">
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-emerald-950/8 bg-white lg:hidden">
              <nav className="grid gap-1 p-4">
                {[
                  ['#benefits', 'Quyền lợi nhà thuốc'],
                  ['#products', 'Sản phẩm'],
                  ['#packages', 'Gói bán hàng'],
                  ['#display', 'Chương trình trưng bày'],
                  ['#process', 'Cách tham gia'],
                ].map(([href, label]) => (
                  <a key={href} className="rounded-2xl px-4 py-3 text-sm font-bold hover:bg-emerald-50" href={href} onClick={() => setMenuOpen(false)}>
                    {label}
                  </a>
                ))}
                <Button className="mt-2 w-full" onClick={() => openLead('basic', 'mobile_menu')}>{t('primaryCta')}</Button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main id="top">
        <section data-analytics-section="hero" data-section-order="1" className="relative isolate overflow-hidden border-b border-emerald-950/5">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_20%,rgba(163,230,53,.18),transparent_30%),radial-gradient(circle_at_10%_5%,rgba(16,185,129,.12),transparent_25%)]" />
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-18 lg:grid-cols-[1.02fr_.98fr] lg:px-8 lg:py-24">
            <motion.div {...reveal}>
              <Badge className="border-emerald-700/15 bg-emerald-100/80 text-emerald-800">
                <Sparkles className="mr-2 size-3.5" /> {t('eyebrow')}
              </Badge>
              <h1 className={cn("mt-6 max-w-3xl text-4xl font-black leading-[1.05] tracking-[-0.055em] text-emerald-950 sm:text-5xl lg:text-7xl", lang === 'vi' ? 'text-balance' : 'text-pretty')}>
                <SafeText text={t('headline') as string} />
              </h1>
              <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-slate-600 sm:text-xl">
                <SafeText text={t('subheadline') as string} />
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" onClick={() => openLead('basic', 'hero')}>
                  {t('primaryCta')} <ArrowRight className="size-5" />
                </Button>
                <Button size="lg" variant="secondary" onClick={() => document.querySelector('#packages')?.scrollIntoView({ behavior: 'smooth' })}>
                  {t('secondaryCta')}
                </Button>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
                {(t('trustItems', { returnObjects: true }) as string[]).map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm font-bold text-emerald-900">
                    <Check className="size-4 text-emerald-600" /> {item}
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div {...reveal} className="relative h-full flex flex-col justify-center mt-10 lg:mt-0">
              <div className="absolute -inset-8 -z-10 rounded-full bg-lime-300/20 blur-3xl" />
              <div className="relative overflow-hidden rounded-[2.2rem] border border-white/80 bg-white p-2 shadow-[0_35px_100px_rgba(15,81,50,.18)]">
                <div className="aspect-[16/9] w-full overflow-hidden rounded-[1.8rem] bg-emerald-50">
                  <iframe
                    className="w-full h-full border-none"
                    src="https://www.youtube.com/embed/lBsfYZFfyAs"
                    title={t('ui.video.title') as string}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* NEW Stats Section for Trust & Retention */}
        <section data-analytics-section="trust_stats" data-section-order="2" className="border-b border-emerald-950/5 bg-emerald-950 text-white py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4 text-center">
              {[
                { label: 'Nhà thuốc đối tác', value: 500, suffix: '+' },
                { label: 'Tăng trưởng doanh thu', value: 30, suffix: '%' },
                { label: 'Khách hàng hài lòng', value: 98, suffix: '%' },
                { label: 'Năm kinh nghiệm', value: 15, suffix: '+' }
              ].map((stat, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}>
                  <div className="text-3xl sm:text-5xl font-black tracking-tighter text-lime-300">
                    <NumberTicker value={stat.value} delay={0.2} />{stat.suffix}
                  </div>
                  <p className="mt-2 text-sm font-semibold text-emerald-100">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="benefits" data-analytics-section="benefits" data-section-order="3" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <SectionHeading eyebrow={t('ui.benefitsB2bEyebrow')} title={t('ui.benefitsB2bTitle')} description={t('ui.benefitsB2bDesc')} />
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {(t('benefits', { returnObjects: true }) as {title: string, body: string}[]).map((benefit, index) => {
              const Icon = benefitIcons[index]
              return (
                <motion.div key={benefit.title} {...reveal} transition={{ delay: index * 0.06 }} className="h-full">
                  <SpotlightCard className="h-full border border-slate-200/60 shadow-sm">
                    <Card className="h-full p-6 bg-transparent border-none shadow-none">
                      <div className="grid size-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-800"><Icon className="size-6" /></div>
                      <h3 className="mt-6 text-xl font-extrabold tracking-[-0.025em]">{benefit.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{benefit.body}</p>
                    </Card>
                  </SpotlightCard>
                </motion.div>
              )
            })}
          </div>
        </section>

        <section id="products" data-analytics-section="products" data-section-order="4" className="border-y border-emerald-950/5 bg-white py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow={t('ui.productSectionTitle')} title={t('ui.productSectionSubtitle')} description={t('ui.productSectionDesc')} />

            <div className="mt-14 grid gap-8 lg:grid-cols-2">
              <ProductCard
                productId="vg5"
                title={t('products.vg5.name')}
                image="/assets/vg5_detail"
                facts={(t('products.vg5.facts', { returnObjects: true }) as string[])}
                description={t('products.vg5.description')}
                claims={(variant === 'medical-preview') ? (t('claims.vg5', { returnObjects: true }) as string[]) : undefined}
                variant={variant}
                campaignId={campaignId}
                landingId={landingId}
                landingVersion={landingVersion}
              />
              <ProductCard
                productId="kmk"
                title={t('products.kmk.name')}
                subtitle={t('products.kmk.latinName')}
                image="/assets/kmk_lifestyle"
                facts={(t('products.kmk.facts', { returnObjects: true }) as string[])}
                description={t('products.kmk.description')}
                claims={(variant === 'medical-preview') ? (t('claims.kmk', { returnObjects: true }) as string[]) : undefined}
                variant={variant}
                campaignId={campaignId}
                landingId={landingId}
                landingVersion={landingVersion}
              />
            </div>


          </div>
        </section>

        <section id="packages" data-analytics-section="packages" data-section-order="5" ref={packageRef} className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <SectionHeading eyebrow={t('ui.packages.eyebrow')} title={t('ui.packages.title')} description={t('ui.packages.desc')} />
          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            <motion.div {...reveal} transition={{ delay: 0.1 }}>
              <PackageCard pkg="basic" onSelect={() => openLead('basic', 'package_card')} variant={variant} campaignId={campaignId} landingId={landingId} landingVersion={landingVersion} />
            </motion.div>
            <motion.div {...reveal} transition={{ delay: 0.2 }}>
              <PackageCard pkg="advanced" featured onSelect={() => openLead('advanced', 'package_card')} variant={variant} campaignId={campaignId} landingId={landingId} landingVersion={landingVersion} />
            </motion.div>
          </div>
        </section>

        <section id="display" data-analytics-section="display_program" data-section-order="6" className="overflow-hidden bg-emerald-950 py-20 text-white lg:py-28">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[.95fr_1.05fr] lg:px-8">
            <motion.div {...reveal}>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-lime-300">{t('ui.display.eyebrow')}</p>
              <h2 className="mt-4 text-balance text-4xl font-extrabold tracking-[-0.045em] sm:text-5xl">{t('ui.display.title')}</h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-emerald-100/75">{t('ui.display.desc')}</p>

              <Tabs.Root value={reward} onValueChange={(value) => {
                const next = value as 'product' | 'cash'
                setReward(next)
                void trackEvent('select_reward_option', {
                  ...analyticsContext,
                  reward_option: next
                })
              }} className="mt-8">
                <Tabs.List className="inline-flex rounded-full bg-white/8 p-1">
                  <Tabs.Trigger value="product" className="rounded-full px-5 py-3 text-sm font-bold text-emerald-100 data-[state=active]:bg-lime-300 data-[state=active]:text-emerald-950">{t('ui.display.productTab')}</Tabs.Trigger>
                  <Tabs.Trigger value="cash" className="rounded-full px-5 py-3 text-sm font-bold text-emerald-100 data-[state=active]:bg-lime-300 data-[state=active]:text-emerald-950">{t('ui.display.cashTab')}</Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content value="product" className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/6 p-6">
                  <Gift className="size-7 text-lime-300" />
                  <p className="mt-4 text-lg font-extrabold">{t('ui.displayReward.monthly')}</p>
                  <p className="mt-2 text-emerald-100/70">{t('ui.displayReward.completion')}</p>
                </Tabs.Content>
                <Tabs.Content value="cash" className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/6 p-6">
                  <CircleDollarSign className="size-7 text-lime-300" />
                  <p className="mt-4 text-lg font-extrabold">{t('ui.displayReward.cashMonthly')}</p>
                  <p className="mt-2 text-emerald-100/70">{t('ui.displayReward.cashMethod')}</p>
                </Tabs.Content>
              </Tabs.Root>

              <div className="mt-8 grid grid-cols-3 gap-3">
                {[t('ui.display.month1'), t('ui.display.month2'), t('ui.display.month3')].map((month, index) => (
                  <div key={month} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                    <p className="text-xs font-bold text-lime-300">0{index + 1}</p>
                    <p className="mt-2 text-sm font-extrabold">{month}</p>
                    <p className="mt-1 text-xs text-emerald-100/60">{t('ui.display.action')}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div {...reveal} className="relative">
              <div className="absolute -inset-10 rounded-full bg-lime-300/10 blur-3xl" />
              <picture className="relative block overflow-hidden rounded-[2rem] border border-white/12 bg-white/5 p-2 shadow-2xl">
                <source srcSet="/assets/combo.png" type="image/webp" />
                <img src="/assets/combo.png" alt="Hình minh họa bao bì VG-5 và Ker Mao Khang" loading="lazy" width="1672" height="941" className="w-full h-auto rounded-[1.6rem] object-contain" />
              </picture>
            </motion.div>
          </div>
        </section>

        <section data-analytics-section="posm" data-section-order="7" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_.9fr]">
            <motion.div {...reveal} className="relative overflow-hidden rounded-[2.2rem] border border-emerald-950/8 bg-white p-2 shadow-[0_30px_100px_rgba(15,81,50,.12)]">
              <picture>
                <source srcSet="/assets/MOCKUPOSM.png" type="image/webp" />
                <img src="/assets/MOCKUPOSM.png" alt="Mô phỏng kệ POSM chứa VG-5 và Ker Mao Khang" loading="lazy" width="1672" height="941" className="w-full h-auto rounded-[1.8rem] object-contain" />
              </picture>
              <button className="absolute right-6 top-6 grid size-12 place-items-center rounded-full bg-white text-emerald-950 shadow-lg" aria-label="Phóng to hình POSM" onClick={() => void trackEvent('click_posm', { ...analyticsContext, asset_id: 'vg5_kmk_display', interaction_type: 'zoom' })}>
                <ZoomIn className="size-5" />
              </button>
            </motion.div>
            <motion.div {...reveal}>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-emerald-700">{t('ui.posm.eyebrow')}</p>
              <h2 className="mt-4 text-balance text-4xl font-extrabold tracking-[-0.045em] sm:text-5xl">{t('ui.posm.title')}</h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">{t('ui.posm.desc')}</p>
              <ul className="mt-7 grid gap-4">
                {[t('ui.posm.bullet1'), t('ui.posm.bullet2'), t('ui.posm.bullet3')].map((item) => (
                  <li key={item} className="flex gap-3 text-sm font-semibold leading-6 text-emerald-950"><Check className="mt-0.5 size-5 shrink-0 text-emerald-600" />{item}</li>
                ))}
              </ul>
            </motion.div>
          </div>
        </section>

        <section id="process" data-analytics-section="process" data-section-order="8" className="border-y border-emerald-950/5 bg-white py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="Cách tham gia" title="Từ đăng ký đến nhận quyền lợi" description="Quy trình ngắn, dễ theo dõi và có Sales hỗ trợ ở các bước nghiệp vụ." />
            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                [t('ui.process.step1'), PackageCheck],
                [t('ui.process.step2'), ClipboardCheck],
                [t('ui.process.step3'), PhoneCall],
                [t('ui.process.step4'), Box],
                [t('ui.process.step5'), Store],
                [t('ui.process.step6'), Building2],
                [t('ui.process.step7'), BadgeCheck],
                [t('ui.process.step8'), Gift],
              ].map(([label, Icon], index) => (
                <motion.div key={String(label)} {...reveal} transition={{ delay: index * 0.04 }}>
                  <Card className="relative h-full p-5">
                    <span className="absolute right-5 top-5 text-xs font-black text-emerald-700/35">0{index + 1}</span>
                    <div className="grid size-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-800"><Icon className="size-5" /></div>
                    <p className="mt-5 text-base font-extrabold">{String(label)}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section data-analytics-section="final_cta" data-section-order="9" className="mx-4 my-20 lg:my-28 sm:mx-6 lg:mx-auto lg:max-w-7xl relative">
          <motion.div {...reveal} className="overflow-hidden rounded-[2.5rem] bg-[linear-gradient(135deg,#064e3b,#0f766e)] text-white shadow-2xl relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 px-6 py-12 sm:px-10 lg:px-16 lg:py-16">
              <div className="flex-1 text-center lg:text-left flex flex-col justify-center">
                <p className="m-0 text-xs font-extrabold uppercase tracking-[0.22em] text-lime-300">{t('ui.process.eyebrow')}</p>
                <h2 className="m-0 mt-4 text-balance text-3xl font-extrabold tracking-[-0.04em] sm:text-5xl">{t('ui.process.title')}</h2>
                <p className="m-0 mt-4 max-w-2xl text-emerald-100/75 mx-auto lg:mx-0">{t('ui.process.desc')}</p>
              </div>
              <div className="shrink-0">
                <Button variant="gold" size="lg" className="shadow-xl shadow-amber-500/20 hover:scale-105 transition-transform" onClick={() => openLead('basic', 'final_cta')}>{t('ui.process.cta')} <ArrowRight className="size-5" /></Button>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-emerald-950/8 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <img src="/nnc-logo.png" alt="NNC Logo" className="h-16 w-auto mb-4" />
          <p className="font-extrabold text-emerald-950">NNC Pharma Laos</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{t('safety')}</p>
          
          <div className="mt-6 flex items-center justify-center gap-6">
            <a href="https://www.facebook.com/kaemaokhang" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-600 hover:text-emerald-700 transition-colors">
              <Facebook className="size-5" />
              <span className="text-sm font-semibold">Kaemaokhang</span>
            </a>
            <a href="tel:+8562099806327" className="flex items-center gap-2 text-slate-600 hover:text-emerald-700 transition-colors">
              <Phone className="size-5" />
              <span className="text-sm font-semibold">+856 20 99 806 327</span>
            </a>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showStickyCta && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-x-3 bottom-3 z-40 lg:hidden"
          >
            <Button className="w-full shadow-[0_18px_50px_rgba(6,78,59,.35)]" size="lg" onClick={() => openLead('basic', 'sticky_mobile')}>{t('primaryCta')} <ArrowRight className="size-5" /></Button>
          </motion.div>
        )}
      </AnimatePresence>

      <LeadDialog 
        open={leadOpen} 
        onOpenChange={setLeadOpen} 
        variant={variant} 
        initialPackage={selectedPackage} 
        lang={lang} 
        campaignId={campaignId}
        landingId={landingId}
        landingVersion={landingVersion}
      />
    </div>
  )
}

function ProductCard({
  productId,
  title,
  subtitle,
  image,
  facts,
  description,
  claims,
  variant,
  campaignId,
  landingId,
  landingVersion,
}: {
  productId: string
  title: string
  subtitle?: string
  image: string
  facts: readonly string[]
  description: string
  claims?: string[]
  variant: LandingVariant
  campaignId: string
  landingId: string
  landingVersion: number
}) {
  const { t, i18n } = useTranslation()
  const onVisible = useCallback(() => {
    void trackEvent('view_product', {
      ...campaignParams(variant, i18n.language, campaignId, landingId, landingVersion),
      product_id: productId,
      section_id: 'products'
    })
  }, [productId, variant, campaignId, landingId, landingVersion, i18n.language])
  const ref = useOnceInView<HTMLDivElement>(onVisible)

  return (
    <div ref={ref} className="h-full">
      <SpotlightCard className="h-full border-slate-200/60 shadow-sm">
        <Card className="group flex h-full flex-col overflow-hidden p-2 bg-transparent border-none shadow-none">
          <div className="relative shrink-0 overflow-hidden rounded-[1.45rem] bg-emerald-50">
        <picture>
          <source srcSet={`${image}.png`} type="image/webp" />
          <img src={`${image}.png`} alt={`Hình minh họa ${title}`} loading="lazy" width="1448" height="1086" className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-[1.025]" />
        </picture>
      </div>
      <div className="flex flex-grow flex-col p-5 sm:p-7">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-emerald-700">Sản phẩm chương trình</p>
        <h3 className="mt-2 text-3xl font-black tracking-[-0.04em]">{title}</h3>
        {subtitle && <p className="mt-1 text-sm font-bold text-slate-500">{subtitle}</p>}
        <ul className="mt-5 grid gap-2">
          {facts.map((fact) => <li key={fact} className="flex gap-2 text-sm font-semibold text-emerald-950"><Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />{fact}</li>)}
        </ul>
        <p className="mt-5 flex-grow text-sm leading-7 text-slate-600">{description}</p>
        {claims && (
          <div className="mt-6 shrink-0 rounded-2xl bg-emerald-50/80 p-5">
            <p className="text-xs font-extrabold uppercase tracking-[.15em] text-emerald-800">{t('ui.medicalBenefitsTitle')}</p>
            <ul className="mt-3 grid gap-2 text-sm font-semibold text-emerald-950">
              {claims.map((claim) => <li key={claim} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-emerald-600" /> {claim}</li>)}
            </ul>
          </div>
        )}
      </div>
        </Card>
      </SpotlightCard>
    </div>
  )
}

function PackageCard({
  pkg,
  featured,
  onSelect,
  variant,
  campaignId,
  landingId,
  landingVersion,
}: {
  pkg: 'basic' | 'advanced'
  featured?: boolean
  onSelect: () => void
  variant: LandingVariant
  campaignId: string
  landingId: string
  landingVersion: number
}) {
  const { t, i18n } = useTranslation()
  const item = campaignConfig.packages[pkg]
  return (
    <Card className={cn('relative overflow-hidden p-7 sm:p-9 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl', featured && 'border-emerald-700 bg-emerald-950 text-white shadow-[0_35px_100px_rgba(6,78,59,.25)]')}>
      {featured && <Badge className="absolute right-6 top-6 border-lime-300/30 bg-lime-300 text-emerald-950">{t('ui.packages.featuredBadge')}</Badge>}
      <p className={cn('text-xs font-extrabold uppercase tracking-[0.2em] text-emerald-700', featured && 'text-lime-300')}>{pkg === 'basic' ? t('ui.packages.basicLabel') : t('ui.packages.advancedLabel')}</p>
      <h3 className="mt-3 text-3xl font-black tracking-[-0.04em]"><SafeText text={t(`ui.packageItems.${pkg}.name`) as string} /></h3>
      <div className="mt-8">
        <p className={cn('text-sm font-semibold text-slate-500', featured && 'text-emerald-100/65')}>{t('ui.packages.threshold')}</p>
        <p className="mt-1 text-4xl font-black tracking-[-0.045em]">{formatLak(item.threshold)}</p>
      </div>
      <div className={cn('mt-7 rounded-2xl bg-emerald-50 p-5', featured && 'bg-white/8')}>
        <p className={cn('text-xs font-bold uppercase tracking-[.14em] text-emerald-700', featured && 'text-lime-300')}>{t('ui.packages.combo')}</p>
        <p className="mt-2 font-extrabold"><SafeText text={t(`ui.packageItems.${pkg}.inventory`) as string} /></p>
        <p className={cn('mt-2 text-sm text-slate-600', featured && 'text-emerald-100/70')}>{t('ui.packages.totalSuggest')}: {formatLak(item.suggestedTotal)}</p>
      </div>
      <ul className="mt-7 grid gap-4">
        <li className="flex gap-3 text-sm font-semibold"><Gift className={cn('size-5 shrink-0 text-emerald-600', featured && 'text-lime-300')} /><SafeText text={t(`ui.packageItems.${pkg}.gift`) as string} /></li>
        <li className="flex gap-3 text-sm font-semibold"><Store className={cn('size-5 shrink-0 text-emerald-600', featured && 'text-lime-300')} /><SafeText text={t(`ui.packageItems.${pkg}.posm`) as string} /></li>
      </ul>
      <Button className="mt-8 w-full" size="lg" variant={featured ? 'gold' : 'primary'} onClick={() => {
        onSelect()
        void trackEvent('select_promotion', {
          ...campaignParams(variant, i18n.language, campaignId, landingId, landingVersion),
          promotion_id: pkg,
          promotion_name: item.name,
          creative_slot: 'package_card'
        })
      }}>
        {t('ui.packages.select')} {t(`ui.packageItems.${pkg}.name`).toLowerCase()} <ArrowRight className="size-5" />
      </Button>
    </Card>
  )
}
