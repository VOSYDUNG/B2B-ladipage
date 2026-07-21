import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowRight, PhoneCall, Building2, PackageCheck, TrendingUp, BadgeCheck, FlaskConical, CheckCircle2, Clock3, ShoppingCart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { WL_CAMPAIGN_CONFIG } from '@/config/white-lotus'
import { ProductCatalog } from './product-catalog'
import { ProgramDetails } from './program-details'
import { SpotlightCard } from '@/components/ui/spotlight-card'
import { WhiteLotusOrderDialog } from './white-lotus-order-dialog'
import { SampleRequestDialog } from './sample-request-dialog'
import { HcpGate } from './hcp-gate'
import { landingParams, trackEvent as trackAnalyticsEvent } from '@/lib/analytics'
import { useSectionAnalytics } from '@/hooks/use-section-analytics'
import { AppLanguage } from '@/types'
import { PromotionTierRail } from './promotion-tier-matrix'

interface WhiteLotusCampaignPageProps {
  lang?: AppLanguage;
  setLang?: (l: AppLanguage) => void;
  landingId?: string;
  campaignId?: string;
  templateId?: string;
  landingVersion?: number;
}

export function WhiteLotusCampaignPage({
  lang = 'vi',
  setLang,
  landingId = WL_CAMPAIGN_CONFIG.landing_id,
  campaignId = WL_CAMPAIGN_CONFIG.campaign_id,
  templateId = WL_CAMPAIGN_CONFIG.template_id,
  landingVersion = 1,
}: WhiteLotusCampaignPageProps) {
  const { t, i18n } = useTranslation()
  const isLao = i18n.language === 'lo'
  const [leadOpen, setLeadOpen] = useState(false)
  const [sampleOpen, setSampleOpen] = useState(false)
  const [hcpGateOpen, setHcpGateOpen] = useState(false)
  const [hcpAccepted, setHcpAccepted] = useState(false)
  const [pendingCatalogUrl, setPendingCatalogUrl] = useState<string | null>(null)
  const [interestedProduct, setInterestedProduct] = useState<string | null>(null)
  const [sampleProduct, setSampleProduct] = useState<string | null>(null)
  const [showFloatingCart, setShowFloatingCart] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowFloatingCart(true)
      } else {
        setShowFloatingCart(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const campaignContext = useMemo(
    () => landingParams({
      landingId,
      campaignId,
      templateId,
      variantId: 'default',
      language: lang,
      landingVersion,
    }),
    [campaignId, landingId, landingVersion, lang, templateId],
  )

  const trackCampaignEvent = (eventName: string, params: Record<string, string | number | boolean | undefined> = {}) => {
    void trackAnalyticsEvent(eventName, {
      ...campaignContext,
      ...params,
    })
  }

  useSectionAnalytics(campaignContext)

  useEffect(() => {
    trackCampaignEvent('page_view', { page_path: window.location.pathname })
  }, [campaignContext])

  const handleViewCatalog = (catalogUrl: string) => {
    if (!hcpAccepted) {
      setPendingCatalogUrl(catalogUrl)
      setHcpGateOpen(true)
      trackCampaignEvent('hcp_gate_triggered', { trigger: 'view_catalog' })
      return
    }
    trackCampaignEvent('download_catalog', { file_url: catalogUrl })
  }

  const handleHcpAccept = () => {
    setHcpAccepted(true)
    trackCampaignEvent('hcp_gate_accepted')
    if (pendingCatalogUrl) {
      window.open(pendingCatalogUrl, '_blank')
      trackCampaignEvent('download_catalog', { file_url: pendingCatalogUrl })
      setPendingCatalogUrl(null)
    }
  }

  const handleInterested = (productId: string) => {
    setInterestedProduct(productId)
    setLeadOpen(true)
    trackCampaignEvent('select_promotion', {
      promotion_id: productId,
      creative_slot: 'cta_button'
    })
  }

  const handleSampleRequest = (productId: string | null) => {
    setSampleProduct(productId)
    setSampleOpen(true)
    trackCampaignEvent('sample_request_open', {
      product_id: productId || 'all',
      creative_slot: 'sample_cta'
    })
  }

  const branches = [
    "LPB-Tip", "LPB-Minh", "Pakse", "Savan", "Saysomboun", "Paklai", "Phon hong"
  ]

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 font-sans selection:bg-[#008A5E]/20 text-slate-800">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/nnc-logo.png" alt="NNC Pharma" className="h-10 w-10 shrink-0 object-contain sm:h-11 sm:w-11" />
            <div className="min-w-0 leading-tight">
              <div className="text-sm font-black text-[#007A51] sm:text-base">NNC PHARMA</div>
              <div className="hidden text-[10px] font-bold uppercase text-slate-500 sm:block">White Lotus · New Products</div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {setLang && (
              <div className="flex items-center bg-slate-100 rounded-full p-1 border border-slate-200">
                <button
                  onClick={() => setLang('vi')}
                  className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 ${lang === 'vi' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <span className="text-sm">🇻🇳</span> <span className="hidden sm:inline">VI</span>
                </button>
                <button
                  onClick={() => setLang('lo')}
                  className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 ${lang === 'lo' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <span className="text-sm">🇱🇦</span> <span className="hidden sm:inline">LA</span>
                </button>
              </div>
            )}
            <button 
              onClick={() => handleInterested('header_cta')}
              className="flex items-center gap-2 text-xs sm:text-sm font-bold text-white bg-[#008A5E] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full hover:bg-[#00704C] transition-colors shadow-sm whitespace-nowrap"
            >
              {t('wl.hero.cta_header')}
            </button>
          </div>
        </div>
      </header>

      {/* Section 1: Hero Section */}
      <section data-analytics-section="hero" data-section-order="1" className="relative overflow-hidden border-b border-slate-100 bg-slate-50 pb-20 pt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center">
            {/* Text Content */}
            <div className="w-full max-w-4xl text-center mb-12">
              <div className="mb-8 flex justify-center">
                <PromotionTierRail isLao={isLao} />
              </div>
              
              <h1 className={`${isLao ? 'text-3xl md:text-5xl lg:text-6xl leading-[1.3]' : 'text-4xl md:text-5xl lg:text-6xl leading-[1.1]'} font-black tracking-tight text-slate-900 mb-6`}>
                {t('wl.hero.title_part1')} <br />
                <span className="text-[#07834F]">{t('wl.hero.title_part2')}</span>
              </h1>
              
              <p className={`${isLao ? 'text-lg' : 'text-xl'} font-bold text-slate-700 mb-4`}>
                {t('wl.hero.subtitle')}
              </p>
              <p className="text-base text-slate-500 mb-10 max-w-2xl mx-auto">
                {t('wl.hero.description')}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={() => handleInterested('hero_cta')}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#007A51] px-6 py-3 text-base sm:px-10 sm:py-4 sm:text-lg font-bold text-white shadow-lg shadow-emerald-900/15 transition-all hover:-translate-y-0.5 hover:bg-[#005F40] hover:shadow-xl sm:w-auto"
                >
                  {t('wl.hero.cta_main')} <ArrowRight className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* Image Content */}
            <div className="w-full">
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-[#008A5E]/30 border border-slate-100/50 group">
                <img 
                  src="/assets/white-lotus/web/hero-final.png" 
                  alt="White Lotus New Products campaign"
                  className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-[1.02]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Highlights */}
      <section data-analytics-section="highlights" data-section-order="2" className="pb-20 relative z-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Desktop Version */}
          <div className="hidden md:grid grid-cols-3 gap-6 lg:gap-8">
            <SpotlightCard className="bg-white p-8 lg:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100/80 flex flex-col items-center text-center h-full transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-blue-500/5">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center mb-8 shrink-0 shadow-lg shadow-blue-500/20">
                <PackageCheck className="w-8 h-8" />
              </div>
              <h3 className={`${isLao ? 'text-xl' : 'text-[1.35rem]'} font-black text-slate-800 mb-4`}>{t('wl.highlights.title1')}</h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                {t('wl.highlights.desc1')}
              </p>
            </SpotlightCard>

            <SpotlightCard className="bg-white p-8 lg:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100/80 flex flex-col items-center text-center h-full transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-rose-500/5">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 text-white rounded-2xl flex items-center justify-center mb-8 shrink-0 shadow-lg shadow-rose-500/20">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className={`${isLao ? 'text-xl' : 'text-[1.35rem]'} font-black text-slate-800 mb-4`}>{t('wl.highlights.title2')}</h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                {t('wl.highlights.desc2')}
              </p>
            </SpotlightCard>

            <SpotlightCard className="bg-white p-8 lg:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100/80 flex flex-col items-center text-center h-full transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-emerald-500/5">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl flex items-center justify-center mb-8 shrink-0 shadow-lg shadow-emerald-500/20">
                <BadgeCheck className="w-8 h-8" />
              </div>
              <h3 className={`${isLao ? 'text-xl' : 'text-[1.35rem]'} font-black text-slate-800 mb-4`}>{t('wl.highlights.title3')}</h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                {t('wl.highlights.desc3')}
              </p>
            </SpotlightCard>
          </div>

          {/* Mobile Version (Compact, Row-based layout) */}
          <div className="grid md:hidden grid-cols-1 gap-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-md shadow-slate-200/40">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-blue-500/10">
                <PackageCheck className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-black text-slate-900 mb-0.5">{t('wl.highlights.title1')}</h4>
                <p className="text-[11px] leading-relaxed text-slate-500">{t('wl.highlights.desc1')}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-md shadow-slate-200/40">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-rose-500/10">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-black text-slate-900 mb-0.5">{t('wl.highlights.title2')}</h4>
                <p className="text-[11px] leading-relaxed text-slate-500">{t('wl.highlights.desc2')}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-md shadow-slate-200/40">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/10">
                <BadgeCheck className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-black text-slate-900 mb-0.5">{t('wl.highlights.title3')}</h4>
                <p className="text-[11px] leading-relaxed text-slate-500">{t('wl.highlights.desc3')}</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Section 3: Product Catalog */}
      <ProductCatalog 
        onViewCatalog={handleViewCatalog}
        onInterested={handleInterested}
        onSampleRequest={handleSampleRequest}
        onTrackEvent={trackCampaignEvent}
      />

      {/* Sample Request Banner – Premium Clean Design */}
      <section data-analytics-section="sample_request" data-section-order="4" className="py-16 bg-white relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="relative overflow-hidden rounded-2xl border border-emerald-800 bg-[#07583B] shadow-xl">
            <div className="relative flex flex-col lg:flex-row items-center justify-between gap-10 p-8 sm:p-12 lg:p-16">
              {/* Left: icon + text */}
              <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left gap-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-wider">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-300"></div>
                  {isLao ? 'ສຳລັບຮ້ານຂາຍຢາ ແລະ ທ່ານໝໍ' : 'Dành cho Nhà thuốc & Bác sĩ'}
                </div>

                <div>
                  <h3 className={`${isLao ? 'text-3xl' : 'text-3xl sm:text-4xl'} mb-4 font-extrabold leading-tight tracking-tight text-white`}>
                    {isLao ? 'ຂໍຮັບຕົວຢ່າງ / ເອກະສານ' : 'Đăng ký mẫu và tài liệu'}
                  </h3>
                  <p className="text-emerald-50 text-base sm:text-lg leading-relaxed max-w-2xl opacity-90 font-medium">
                    {isLao
                      ? 'ສົ່ງຄຳຮ້ອງຂໍຕົວຢ່າງ ຫຼື Catalog. Sales ຈະຢືນຢັນຜູ້ຮັບ, ສິນຄ້າ ແລະ ຈຳນວນທີ່ມີ.'
                      : 'Gửi yêu cầu nhận mẫu hoặc catalog. Sales khu vực sẽ xác nhận đối tượng, sản phẩm và số lượng hiện có.'}
                  </p>
                </div>

                {/* Trust signals */}
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start mt-2">
                  {[
                    { text: isLao ? 'Sales ຢືນຢັນ' : 'Sales xác nhận', icon: <CheckCircle2 className="h-4 w-4" /> },
                    { text: isLao ? 'ຕາມຈຳນວນທີ່ມີ' : 'Theo số lượng hiện có', icon: <Clock3 className="h-4 w-4" /> },
                    { text: isLao ? '4 ສິນຄ້າໃໝ່' : '4 sản phẩm mới', icon: <PackageCheck className="h-4 w-4" /> }
                  ].map(tag => (
                    <div key={tag.text} className="flex items-center gap-1.5 text-emerald-100 font-medium text-sm">
                      <span className="text-emerald-300">{tag.icon}</span>
                      <span>{tag.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: CTA button */}
              <div className="shrink-0 flex flex-col items-center gap-4">
                <button
                  onClick={() => handleSampleRequest(null)}
                  className="group flex items-center justify-center gap-3 bg-white text-[#00704C] hover:bg-emerald-50 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 w-full sm:w-auto"
                >
                  <FlaskConical className="w-5 h-5 text-[#008A5E]" />
                  <span>{isLao ? 'ລົງທະບຽນຮັບຕົວຢ່າງ' : 'Đăng ký nhận mẫu ngay'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Section 4: Program Details */}
      <ProgramDetails />

      {/* Section 5: CTA & Footer */}
      <section data-analytics-section="final_cta" data-section-order="6" className="bg-slate-900 pt-20 pb-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white/5 rounded-3xl p-8 md:p-12 border border-white/10 mb-16 text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="max-w-2xl">
              <h2 className={`${isLao ? 'text-2xl' : 'text-3xl'} font-black text-white mb-4`}>
                {t('wl.footer.title')}
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                {t('wl.footer.desc')}
              </p>
            </div>
            <button 
              onClick={() => handleInterested('footer_cta')}
              className="shrink-0 flex items-center justify-center gap-2 rounded-full bg-lime-400 px-10 py-5 text-emerald-950 text-lg font-black shadow-[0_0_40px_rgba(163,230,53,0.3)] hover:bg-lime-300 hover:scale-105 transition-all"
            >
              {t('wl.footer.cta')} <ArrowRight className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-b border-white/10 pb-12 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-white p-1.5 shadow-sm">
                  <img src="/nnc-logo.png" alt="NNC Pharma" className="h-full w-full object-contain" />
                </div>
                <div>
                  <div className="text-xl font-black tracking-tight text-white">NNC PHARMA</div>
                  <div className="text-xs font-bold uppercase text-emerald-200">White Lotus · New Products</div>
                </div>
              </div>
              <p className="text-slate-400 text-sm max-w-sm mb-6 leading-relaxed">
                {t('wl.footer.about')}
              </p>
              <div className="flex flex-col gap-4">
                <a href={`tel:${WL_CAMPAIGN_CONFIG.contact.hotline}`} className="flex items-center gap-3 text-white hover:text-lime-300 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">{t('wl.footer.hotline_label')}</div>
                    <div className="font-black text-xl">{WL_CAMPAIGN_CONFIG.contact.hotline}</div>
                  </div>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-lime-300" /> {t('wl.footer.branches')}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {branches.map(branch => (
                  <div key={branch} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 text-center hover:bg-white/10 transition-colors cursor-default">
                    {branch}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <p>{t('wl.footer.copyright')}</p>
            <div className="flex items-center gap-6 text-right max-w-md">
              <p>{t('wl.footer.safety')}</p>
            </div>
          </div>
        </div>
      </section>

      <HcpGate 
        open={hcpGateOpen} 
        onOpenChange={setHcpGateOpen}
        onAccept={handleHcpAccept}
      />

      <WhiteLotusOrderDialog 
        open={leadOpen}
        onOpenChange={setLeadOpen}
        lang={lang}
        initialProductId={interestedProduct}
        landingId={landingId}
        campaignId={campaignId}
        landingVersion={landingVersion}
      />

      <SampleRequestDialog
        open={sampleOpen}
        onOpenChange={setSampleOpen}
        lang={lang}
        initialProductId={sampleProduct}
        landingId={landingId}
        campaignId={campaignId}
        landingVersion={landingVersion}
      />

      {/* Floating Action Button (Cart) */}
      <AnimatePresence>
        {showFloatingCart && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <button
              onClick={() => handleInterested('floating_cart')}
              className="flex items-center gap-2.5 rounded-full bg-emerald-800 hover:bg-emerald-950 text-white font-black px-6 py-4 shadow-[0_8px_30px_rgba(6,78,59,0.45)] hover:shadow-[0_8px_30px_rgba(6,78,59,0.7)] transition-all border border-emerald-700/50 hover:scale-105 active:scale-95 group cursor-pointer"
            >
              <ShoppingCart className="w-5 h-5 group-hover:animate-bounce" />
              <span className="text-sm tracking-wide">
                {isLao ? 'ສັ່ງຊື້ ແລະ ຮັບໂປຣໂມຊັ່ນ' : 'ĐẶT HÀNG NHẬN ƯU ĐÃI'}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
