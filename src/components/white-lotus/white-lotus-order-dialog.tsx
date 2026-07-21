import * as Dialog from '@radix-ui/react-dialog'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, LoaderCircle, Send, X, Store, MapPin, User, Phone, Plus, Minus, Award, LockKeyhole } from 'lucide-react'
import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { submitWhiteLotusOrder } from '@/lib/lead-service'
import {
  WL_PRODUCTS,
  WL_PROMOTION,
  getHighestEligibleWhiteLotusPromotionRule,
  getNextWhiteLotusPromotionRule,
  getWhiteLotusPromotionRules,
} from '@/config/white-lotus'
import { publicFormContracts } from '@/config/form-contracts'
import { landingParams, trackEvent } from '@/lib/analytics'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import type { AppLanguage } from '@/types'
import { PromotionTierMatrix } from './promotion-tier-matrix'

const schema = z.object({
  pharmacyName: z.string().trim().min(2, 'Nhập tên nhà thuốc'),
  province: z.string().trim().min(2, 'Nhập tên tỉnh/thành phố'),
  contactName: z.string().trim().min(2, 'Nhập tên người liên hệ'),
  phone: z.string().trim().regex(/^\+?[0-9\s-]{8,18}$/, 'Số điện thoại không hợp lệ'),
  consent: z.boolean().refine((value) => value, { message: 'Vui lòng đồng ý' }),
})

type OrderFormValues = z.infer<typeof schema>

function ConfettiEffect({ trigger }: { trigger: number }) {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string; size: number }[]>([])

  useEffect(() => {
    if (trigger === 0) return
    const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#a3e635']
    const newParticles = Array.from({ length: 60 }).map((_, i) => ({
      id: Math.random() + i,
      x: (Math.random() - 0.5) * 360,
      y: (Math.random() - 0.5) * 180 - 160,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4
    }))
    setParticles(newParticles)
    const timer = setTimeout(() => setParticles([]), 2000)
    return () => clearTimeout(timer)
  }, [trigger])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, scale: 0, x: 0, y: 100 }}
          animate={{
            opacity: [1, 1, 0],
            scale: [0, 1.2, 0.5],
            x: p.x,
            y: p.y + 350,
            rotate: Math.random() * 360
          }}
          transition={{ duration: 1.8, ease: 'easeOut' }}
          className="absolute left-1/2 bottom-0 rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
        />
      ))}
    </div>
  )
}

export function WhiteLotusOrderDialog({
  open,
  onOpenChange,
  lang,
  initialProductId = null,
  landingId = 'white-lotus',
  campaignId = 'WL_NEW_PRODUCTS_2026_Q3',
  landingVersion = 1,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  lang: AppLanguage
  initialProductId?: string | null
  landingId?: string
  campaignId?: string
  landingVersion?: number
}) {
  const { t, i18n } = useTranslation()
  const isLao = i18n.language === 'lo'
  const [success, setSuccess] = useState(false)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [confettiTrigger, setConfettiTrigger] = useState(0)
  const [showUpgradePopup, setShowUpgradePopup] = useState(false)
  const [upgradeLevelInfo, setUpgradeLevelInfo] = useState<any>(null)

  const partnerLevel = useMemo(() => {
    const reached12Count = WL_PRODUCTS.filter(p => (quantities[p.product_id] || 0) >= 12).length
    const reached1Count = WL_PRODUCTS.filter(p => {
      const q = quantities[p.product_id] || 0
      if (p.product_id === 'etorilux-120') {
        return q >= 6 && q < 12
      }
      return q >= 4 && q < 12
    }).length

    const reachedAnyCount = WL_PRODUCTS.filter(p => {
      const q = quantities[p.product_id] || 0
      return p.product_id === 'etorilux-120' ? q >= 6 : q >= 4
    }).length

    if (reached12Count === 4) {
      return {
        level: 5,
        badgeVi: 'Đối tác Hoàng Gia 👑',
        badgeLo: 'ພັນທະມິດລາຊະວົງ 👑',
        class: 'bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white shadow-rose-500/30 animate-pulse border border-pink-400/50 font-black',
        descVi: 'Mức đối tác Hoàng Gia - Đạt mốc 12+1 cho cả 4 sản phẩm!',
        descLo: 'ລະດັບລາຊະວົງ - ບັນລຸ 12+1 ສໍາລັບທັງ 4 ຜະລິດຕະພັນ!'
      }
    }
    if (reached12Count === 3) {
      return {
        level: 4,
        badgeVi: 'Đối tác Kim Cương 💎',
        badgeLo: 'ພັນທະມິດເພັດ 💎',
        class: 'bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 text-white shadow-cyan-500/30 animate-pulse border border-cyan-300/50',
        descVi: 'Mức đối tác Kim Cương - Đạt mốc 12+1 cho 3 sản phẩm!',
        descLo: 'ລະດັບສູງສຸດ - ເລືອກຮັບ 3+ ກ່ອງຟຣີ!'
      }
    }
    if (reached12Count >= 1) {
      return {
        level: 3,
        badgeVi: 'Đối tác Vàng 👑',
        badgeLo: 'ພັນທະມິດຄຳ 👑',
        class: 'bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-slate-950 shadow-amber-500/40 border border-amber-300 font-extrabold',
        descVi: 'Mức đối tác Vàng - Đã kích hoạt mốc 12+1!',
        descLo: 'ລະດັບຄຳ - ເປີດນຳໃຊ້ລະດັບ 12+1 ແລ້ວ!'
      }
    }
    if (reached1Count >= 2) {
      return {
        level: 2,
        badgeVi: 'Đối tác Bạc 🌟',
        badgeLo: 'ພັນທະມິດເງິນ 🌟',
        class: 'bg-gradient-to-r from-slate-300 to-slate-400 text-slate-900 border border-slate-200 font-bold',
        descVi: 'Mức đối tác Bạc - Nhận sủi Multi-Vitamin lũy kế!',
        descLo: 'ລະດັບເງິນ - ຮັບຢາເມັດຟອງຟູ Multi-Vitamin ສະສົມ!'
      }
    }
    if (reachedAnyCount >= 1) {
      return {
        level: 1,
        badgeVi: 'Đối tác Đồng hành 🤝',
        badgeLo: 'ພັນທະມິດຮ່ວມທາງ 🤝',
        class: 'bg-gradient-to-r from-amber-600 to-amber-700 text-white border border-amber-500 font-bold',
        descVi: 'Kích hoạt mốc ưu đãi đầu tiên!',
        descLo: 'ເປີດນຳໃຊ້ລະດັບທຳອິດແລ້ວ!'
      }
    }
    return {
      level: 0,
      badgeVi: 'Thành viên mới',
      badgeLo: 'ສະມາຊິກໃໝ່',
      class: 'bg-slate-100 text-slate-500 border border-slate-200',
      descVi: 'Chọn số lượng để kích hoạt mốc ưu đãi',
      descLo: 'ເລືອກຈຳນວນເພື່ອຮັບໂປຣໂມຊັ່ນ'
    }
  }, [quantities])

  const activeGradients = useMemo(() => {
    const activeThemes: { color: string; glow: string }[] = []
    
    if ((quantities['fexentrix-60'] || 0) >= 4) activeThemes.push({ color: '#9333ea', glow: 'rgba(147, 51, 234, 0.25)' })
    if ((quantities['etorilux-120'] || 0) >= 6) activeThemes.push({ color: '#e11d48', glow: 'rgba(225, 29, 72, 0.25)' })
    if ((quantities['fexentrix-120'] || 0) >= 4) activeThemes.push({ color: '#ea580c', glow: 'rgba(234, 88, 12, 0.25)' })
    if ((quantities['lotofex-200'] || 0) >= 4) activeThemes.push({ color: '#2563eb', glow: 'rgba(37, 99, 235, 0.25)' })

    const has12Tier = WL_PRODUCTS.some(p => (quantities[p.product_id] || 0) >= 12)
    if (has12Tier) {
      activeThemes.push({ color: '#d97706', glow: 'rgba(217, 119, 6, 0.35)' })
    }

    if (activeThemes.length === 0) {
      return {
        bgStyle: {},
        containerClass: 'bg-slate-50 border-slate-200 text-slate-800',
        titleClass: 'text-slate-900',
        descClass: 'text-slate-500 shadow-none',
        shadowStyle: {}
      }
    }

    const colors = activeThemes.map(t => t.color)
    const glows = activeThemes.map(t => t.glow)

    let backgroundStyle = {}
    if (colors.length === 1) {
      backgroundStyle = { background: `linear-gradient(135deg, ${colors[0]}12 0%, ${colors[0]}22 100%)` }
    } else {
      backgroundStyle = { background: `linear-gradient(135deg, ${colors.map(c => c + '12').join(', ')})` }
    }

    return {
      bgStyle: backgroundStyle,
      containerClass: cn(
        'w-full border-b p-4 sm:p-5 transition-all duration-500 md:w-[56%] md:overflow-y-auto md:border-b-0 md:border-r md:p-6 border-slate-200/80 flex flex-col shrink-0 md:shrink',
        has12Tier && 'border-amber-400'
      ),
      titleClass: has12Tier ? 'text-amber-950 font-black' : 'text-slate-900',
      descClass: has12Tier ? 'text-slate-700' : 'text-slate-500',
      shadowStyle: { boxShadow: `0 0 20px ${glows[0] || 'rgba(0,0,0,0)'}` }
    }
  }, [quantities])

  const summaryTheme = useMemo(() => {
    switch (partnerLevel.level) {
      case 5:
        return {
          cardClass: 'border-pink-500 bg-gradient-to-br from-purple-950 via-slate-900 to-rose-950 text-white shadow-[0_4px_16px_rgba(236,72,153,0.15)]',
          titleClass: 'text-pink-200 font-extrabold',
          descClass: 'text-pink-100/90 font-semibold',
          iconClass: 'text-pink-400 animate-pulse',
          borderSep: 'border-pink-500/25'
        }
      case 4:
        return {
          cardClass: 'border-cyan-500 bg-gradient-to-br from-cyan-950 via-slate-900 to-indigo-950 text-white shadow-[0_4px_16px_rgba(6,182,212,0.15)]',
          titleClass: 'text-cyan-200 font-extrabold',
          descClass: 'text-cyan-100/90 font-semibold',
          iconClass: 'text-cyan-400 animate-pulse',
          borderSep: 'border-cyan-500/25'
        }
      case 3:
        return {
          cardClass: 'border-amber-400 bg-gradient-to-br from-amber-950 via-slate-900 to-amber-900/90 text-white shadow-[0_4px_16px_rgba(245,158,11,0.15)]',
          titleClass: 'text-amber-300 font-extrabold',
          descClass: 'text-amber-200/90 font-semibold',
          iconClass: 'text-amber-400 animate-pulse',
          borderSep: 'border-amber-500/25'
        }
      case 2:
        return {
          cardClass: 'border-slate-400 bg-gradient-to-br from-slate-800 to-slate-950 text-white',
          titleClass: 'text-slate-100 font-bold',
          descClass: 'text-slate-300/90 font-semibold',
          iconClass: 'text-slate-300',
          borderSep: 'border-slate-500/25'
        }
      case 1:
        return {
          cardClass: 'border-amber-600 bg-gradient-to-br from-amber-900 to-amber-950 text-white',
          titleClass: 'text-amber-200 font-bold',
          descClass: 'text-amber-300/90 font-semibold',
          iconClass: 'text-amber-400',
          borderSep: 'border-amber-800/20'
        }
      default:
        return {
          cardClass: 'border-slate-200 bg-slate-50 text-slate-800',
          titleClass: 'text-slate-700 font-bold',
          descClass: 'text-slate-500 font-semibold',
          iconClass: 'text-slate-400',
          borderSep: 'border-slate-200'
        }
    }
  }, [partnerLevel])

  const [prevLevel, setPrevLevel] = useState(0)
  useEffect(() => {
    if (partnerLevel.level > prevLevel && partnerLevel.level > 0) {
      setConfettiTrigger(prev => prev + 1)
      setUpgradeLevelInfo(partnerLevel)
      setShowUpgradePopup(true)
      const timer = setTimeout(() => setShowUpgradePopup(false), 2800)
      return () => clearTimeout(timer)
    }
    setPrevLevel(partnerLevel.level)
  }, [partnerLevel.level, prevLevel])

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      consent: false,
    },
  })

  // Initialize quantities when modal opens
  useEffect(() => {
    if (open) {
      setSuccess(false)
      const initialQs: Record<string, number> = {}
      WL_PRODUCTS.forEach(p => {
        initialQs[p.product_id] = p.product_id === initialProductId ? 1 : 0
      })
      setQuantities(initialQs)
      reset()
      void trackEvent('form_start', {
        ...landingParams({
          landingId,
          campaignId,
          templateId: 'white_lotus_order_v1',
          variantId: 'default',
          language: lang,
          landingVersion,
        }),
        form_location: 'white_lotus_order_dialog',
        form_id: publicFormContracts.whiteLotusProductOrder.formId,
        form_version: publicFormContracts.whiteLotusProductOrder.versionNumber,
        flow_key: publicFormContracts.whiteLotusProductOrder.flowKey,
      })
    }
  }, [campaignId, initialProductId, landingId, landingVersion, lang, open, reset])

  const totalQuantity = useMemo(() => {
    return (Object.values(quantities) as number[]).reduce((sum, q) => sum + q, 0)
  }, [quantities])

  const totalAmount = useMemo(() => {
    return WL_PRODUCTS.reduce((sum, p) => sum + (p.price_vientiane_lak * (quantities[p.product_id] || 0)), 0)
  }, [quantities])

  const promotionStatus = useMemo(() => {
    return WL_PRODUCTS
      .map(product => {
        const quantity = quantities[product.product_id] || 0
        if (quantity <= 0) return null
        return {
          product,
          quantity,
          eligibleRule: getHighestEligibleWhiteLotusPromotionRule(product.product_id, quantity),
          nextRule: getNextWhiteLotusPromotionRule(product.product_id, quantity),
        }
      })
      .filter(status => status !== null)
  }, [quantities])

  const eligiblePromotionCount = promotionStatus.filter(status => status.eligibleRule).length
  const hasPromotion = eligiblePromotionCount > 0
  const currentTopThreshold = Math.max(
    0,
    ...promotionStatus.map(status => status.eligibleRule?.buy_quantity || 0),
  )

  const updateQuantity = (productId: string, delta: number) => {
    setQuantities(prev => {
      const current = prev[productId] || 0
      const next = Math.max(0, current + delta)
      return { ...prev, [productId]: next }
    })
  }

  async function onSubmit(values: OrderFormValues) {
    if (totalQuantity === 0) {
      setError('root.serverError', {
        type: 'manual',
        message: isLao ? 'ກະລຸນາເລືອກຢ່າງໜ້ອຍ 1 ສິນຄ້າ' : 'Vui lòng chọn ít nhất 1 sản phẩm',
      })
      return
    }

    try {
      const items = (Object.entries(quantities) as [string, number][])
        .filter(([_, q]) => q > 0)
        .map(([id, q]) => ({ product_id: id, quantity: q }))

      const orderData = {
        ...values,
        items
      }

      await submitWhiteLotusOrder(orderData, lang, campaignId, landingId, landingVersion)
      setSuccess(true)
      
      await trackEvent('generate_lead', {
        ...landingParams({
          landingId,
          campaignId,
          templateId: 'white_lotus_order_v1',
          variantId: 'default',
          language: lang,
          landingVersion,
        }),
        currency: 'LAK',
        value: totalAmount,
        total_quantity: totalQuantity,
        reward_applied: hasPromotion ? WL_PROMOTION.program_code : 'none',
        promotion_eligible_sku_count: eligiblePromotionCount,
        form_id: publicFormContracts.whiteLotusProductOrder.formId,
        form_version: publicFormContracts.whiteLotusProductOrder.versionNumber,
        flow_key: publicFormContracts.whiteLotusProductOrder.flowKey,
      })
    } catch (err) {
      console.error('Submission error:', err)
      setError('root.serverError', {
        type: 'server',
        message: isLao ? 'ມີຂໍ້ຜິດພາດເກີດຂຶ້ນ. ກະລຸນາລອງໃໝ່ພາຍຫຼັງ.' : 'Có lỗi xảy ra. Vui lòng thử lại sau.',
      })
    }
  }

  if (!open) return null

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-1.5rem)] sm:w-full max-w-5xl -translate-x-1/2 -translate-y-1/2 p-0 outline-none sm:p-6 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="relative flex h-auto max-h-[90vh] md:h-[780px] md:max-h-[95vh] flex-col overflow-y-auto md:overflow-hidden rounded-2xl bg-white shadow-2xl md:flex-row">
            
            <Dialog.Close
              aria-label={isLao ? 'ປິດ' : 'Đóng'}
              className="absolute right-4 top-4 z-20 rounded-full bg-white/90 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors shadow-sm"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">{isLao ? 'ປິດ' : 'Đóng'}</span>
            </Dialog.Close>

            {success ? (
              <div className="flex flex-col items-center justify-center p-12 text-center w-full min-h-[400px]">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-green/10">
                  <Check className="h-10 w-10 text-brand-green" />
                </div>
                <h2 className="mb-2 text-2xl font-black text-slate-900">
                  {isLao ? 'ຂອບໃຈທີ່ສັ່ງຊື້!' : 'Cảm ơn bạn đã đặt hàng!'}
                </h2>
                <p className="mb-8 max-w-md text-slate-600">
                  {isLao ? 'Sales ຈະຕິດຕໍ່ຫາທ່ານເພື່ອຢືນຢັນການສັ່ງຊື້.' : 'Sales khu vực sẽ liên hệ để xác nhận đơn hàng.'}
                </p>
                <Button onClick={() => onOpenChange(false)} className="bg-brand-green text-white hover:bg-brand-green-dark">
                  {isLao ? 'ປິດໜ້າຈໍ' : 'Đóng cửa sổ'}
                </Button>
              </div>
            ) : (
              <>
                {/* Confetti Explosion Layer */}
                <ConfettiEffect trigger={confettiTrigger} />

                {/* Left Side: Cart */}
                <div 
                  className={activeGradients.containerClass}
                  style={{ ...activeGradients.bgStyle, ...activeGradients.shadowStyle }}
                >
                  <div className="md:my-auto w-full flex flex-col">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-2 mt-4 md:mt-0">
                    <h2 className={cn('text-xl font-black transition-colors duration-500', activeGradients.titleClass)}>
                      {isLao ? 'ເລືອກສິນຄ້າ ຮັບຂອງແຖມ' : 'Chọn sản phẩm'}
                    </h2>
                    {partnerLevel.level > 0 && (
                      <span className={cn('text-[9px] px-2.5 py-0.5 rounded-full font-black border uppercase tracking-wider shadow-sm transition-all duration-500', partnerLevel.class)}>
                        {isLao ? partnerLevel.badgeLo : partnerLevel.badgeVi}
                      </span>
                    )}
                  </div>
                  <p className={cn('mb-4 text-xs leading-relaxed transition-colors duration-500', activeGradients.descClass)}>
                    {isLao ? 'ປັບຈຳນວນເພື່ອເບິ່ງເງື່ອນໄຂ 4+1, 6+1 ຫຼື 12+1 ຂອງແຕ່ລະສິນຄ້າ.' : 'Chọn số lượng và theo dõi mốc ưu đãi áp dụng cho từng sản phẩm.'}
                  </p>

                  {/* PromotionTierMatrix was removed on both desktop and mobile as requested to use inline chips instead */}
                  
                  <div className="mb-4 space-y-2">
                    {WL_PRODUCTS.map(product => {
                      const qty = quantities[product.product_id] || 0
                      const reachedRule = getHighestEligibleWhiteLotusPromotionRule(product.product_id, qty)
                      const rules = getWhiteLotusPromotionRules(product.product_id)
                      return (
                        <div key={product.product_id} className="flex items-center gap-2 sm:gap-3 rounded-lg border border-slate-200 bg-white p-2 sm:p-2.5 shadow-sm">
                          <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
                            <img src={product.packshot_url} alt={product.canonical_name} className="h-9 w-12 sm:h-11 sm:w-14 shrink-0 object-contain" />
                            <div className="flex-1">
                              <h4 className="truncate text-xs sm:text-sm font-bold text-slate-900 flex items-center">
                                {product.canonical_name}
                              </h4>
                              <div className="text-[10px] sm:text-xs font-bold text-brand-green">
                                {new Intl.NumberFormat(isLao ? 'lo-LA' : 'vi-VN', { style: 'currency', currency: 'LAK', maximumFractionDigits: 0 }).format(product.price_vientiane_lak)}
                              </div>
                              {/* Responsive Inline Promo Chips */}
                              <div className="flex flex-wrap gap-1 mt-1">
                                {rules.map(rule => {
                                  const isReached = qty >= rule.buy_quantity
                                  return (
                                    <span key={rule.buy_quantity} className={cn(
                                      "text-[8px] sm:text-[9px] font-bold px-1 sm:px-1.5 py-0.5 rounded border flex items-center gap-0.5 transition-all duration-300 uppercase tracking-wide",
                                      isReached
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm"
                                        : "bg-slate-50 text-slate-400 border-slate-200"
                                    )}>
                                      {isReached ? <Check className="w-2 h-2 sm:w-2.5 sm:h-2.5 stroke-[3px]" /> : <LockKeyhole className="w-1.5 h-1.5 sm:w-2 sm:h-2 opacity-50" />}
                                      {rule.buy_quantity}+{rule.gift_quantity}
                                    </span>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        <div className="flex h-7.5 sm:h-9 shrink-0 items-center gap-0.5 sm:gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                          <button 
                            type="button" 
                            onClick={() => updateQuantity(product.product_id, -1)}
                            aria-label={`${isLao ? 'ຫຼຸດຈຳນວນ' : 'Giảm số lượng'} ${product.canonical_name}`}
                            data-testid={`quantity-decrease-${product.product_id}`}
                            className="rounded-md p-1 sm:p-1.5 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
                          >
                            <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                          <span data-testid={`quantity-value-${product.product_id}`} className="w-5 sm:w-7 text-center text-xs sm:text-sm font-black">{quantities[product.product_id] || 0}</span>
                          <button 
                            type="button" 
                            onClick={() => updateQuantity(product.product_id, 1)}
                            aria-label={`${isLao ? 'ເພີ່ມຈຳນວນ' : 'Tăng số lượng'} ${product.canonical_name}`}
                            data-testid={`quantity-increase-${product.product_id}`}
                            className="rounded-md p-1 sm:p-1.5 text-brand-green transition hover:bg-brand-green/10"
                          >
                            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                      );
                    })}
                  </div>

                  <div data-testid="promotion-summary" className={cn(
                    'rounded-xl border p-3 transition-colors duration-500',
                    summaryTheme.cardClass
                  )}>
                    <div className="flex items-start gap-3 mb-2">
                      <Award className={cn('h-5 w-5 transition-colors duration-500', summaryTheme.iconClass)} />
                      <div>
                        <h4 className={cn('font-bold transition-colors duration-500', summaryTheme.titleClass)}>
                          {t('wl.promotion.headline')}
                        </h4>
                        <p className={cn('text-xs font-semibold transition-colors duration-500', summaryTheme.descClass)}>
                          {t(hasPromotion ? 'wl.promotion.eligible' : 'wl.promotion.not_eligible')}
                        </p>
                      </div>
                    </div>
                    {promotionStatus.length > 0 && (
                      <div className={cn('mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 border-t pt-2 transition-colors duration-500 text-[11px]', summaryTheme.borderSep)}>
                        {promotionStatus.map(({ product, quantity, eligibleRule, nextRule }) => (
                          <div key={product.product_id} className="leading-tight">
                            <span className="font-bold">{product.canonical_name}:</span>{' '}
                            {eligibleRule
                              ? t('wl.promotion.highest_threshold', { level: eligibleRule.level, threshold: eligibleRule.buy_quantity })
                              : nextRule
                                ? t('wl.promotion.next_threshold', {
                                    count: nextRule.buy_quantity - quantity,
                                    level: nextRule.level,
                                    threshold: nextRule.buy_quantity,
                                  })
                                : null}
                          </div>
                        ))}
                      </div>
                    )}
                    <p className={cn('mt-2 border-t pt-2 text-[10px] leading-relaxed transition-colors duration-500', summaryTheme.borderSep, partnerLevel.level > 0 ? 'text-white/60' : 'text-slate-500')}>
                      {t('wl.promotion.sales_confirmation')}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className={cn('font-bold', currentTopThreshold === 12 ? 'text-emerald-100' : 'text-slate-500')}>{isLao ? 'ລວມທັງໝົດ:' : 'Tổng cộng:'}</span>
                    <span className={cn('text-2xl font-black', currentTopThreshold === 12 ? 'text-amber-300' : 'text-rose-600')}>
                      {new Intl.NumberFormat(isLao ? 'lo-LA' : 'vi-VN', { style: 'currency', currency: 'LAK', maximumFractionDigits: 0 }).format(totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

                {/* Right Side: Form */}
                <div className="w-full bg-white p-4 sm:p-6 md:w-[44%] md:overflow-y-auto md:p-7 flex flex-col shrink-0 md:shrink">
                  <div className="md:my-auto w-full flex flex-col">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-4 sm:mb-6">
                      {isLao ? 'ຂໍ້ມູນການຕິດຕໍ່' : 'Thông tin liên hệ'}
                    </h2>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
                    <div className="space-y-2">
                      <div className="relative">
                        <Store className="absolute left-3 top-3 h-4 w-4 sm:left-3.5 sm:top-3.5 sm:h-5 sm:w-5 text-slate-400" />
                        <input
                          {...register('pharmacyName')}
                          placeholder={t('ui.form.pharmacyName')}
                          className={cn(
                            "w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 sm:py-3 pl-10 sm:pl-11 pr-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-green focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-green transition-all",
                            errors.pharmacyName && "border-red-500 focus:border-red-500 focus:ring-red-500"
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 sm:left-3.5 sm:top-3.5 sm:h-5 sm:w-5 text-slate-400" />
                        <input
                          {...register('province')}
                          placeholder={t('ui.form.province')}
                          className={cn(
                            "w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 sm:py-3 pl-10 sm:pl-11 pr-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-green focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-green transition-all",
                            errors.province && "border-red-500 focus:border-red-500 focus:ring-red-500"
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 sm:left-3.5 sm:top-3.5 sm:h-5 sm:w-5 text-slate-400" />
                        <input
                          {...register('contactName')}
                          placeholder={t('ui.form.contactName')}
                          className={cn(
                            "w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 sm:py-3 pl-10 sm:pl-11 pr-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-green focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-green transition-all",
                            errors.contactName && "border-red-500 focus:border-red-500 focus:ring-red-500"
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 sm:left-3.5 sm:top-3.5 sm:h-5 sm:w-5 text-slate-400" />
                        <input
                          {...register('phone')}
                          type="tel"
                          placeholder={t('ui.form.phone')}
                          className={cn(
                            "w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 sm:py-3 pl-10 sm:pl-11 pr-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-green focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-green transition-all",
                            errors.phone && "border-red-500 focus:border-red-500 focus:ring-red-500"
                          )}
                        />
                      </div>
                    </div>

                    <div className="pt-1.5">
                      <label className="flex items-start gap-2.5 sm:gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4 cursor-pointer hover:bg-slate-100 transition-colors">
                        <div className="flex h-5 items-center">
                          <input
                            type="checkbox"
                            {...register('consent')}
                            className="h-4 w-4 rounded border-slate-300 text-brand-green focus:ring-brand-green"
                          />
                        </div>
                        <div className="text-[10px] sm:text-xs leading-relaxed text-slate-600">
                          {t('ui.form.consentText')}
                        </div>
                      </label>
                      {errors.consent && (
                        <p className="mt-1 text-xs text-red-500">{errors.consent.message}</p>
                      )}
                    </div>

                    {errors.root?.serverError && (
                      <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
                        {errors.root.serverError.message}
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isSubmitting || totalQuantity === 0}
                      className="w-full h-11 sm:h-14 rounded-xl bg-[#008A5E] text-sm sm:text-base font-bold text-white hover:bg-[#00704C] disabled:opacity-50 transition-all shadow-lg shadow-[#008A5E]/25"
                    >
                      {isSubmitting ? (
                        <>
                          <LoaderCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                          {isLao ? 'ກຳລັງສົ່ງ...' : 'Đang gửi...'}
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                          {t('ui.form.submit', 'Gửi Đăng Ký')}
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </div>
              </>
            )}
            
            {/* Level Upgrade Modal Overlay */}
            <AnimatePresence>
              {showUpgradePopup && upgradeLevelInfo && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md p-6 text-center text-white rounded-2xl"
                >
                  <motion.div
                    initial={{ scale: 0.3, y: 100 }}
                    animate={{ scale: [0.3, 1.1, 1], y: 0 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="relative max-w-sm flex flex-col items-center p-6"
                  >
                    <div className="text-6xl mb-4 animate-bounce">🏆</div>
                    
                    <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest mb-1">
                      {isLao ? 'ຍິນດີນຳ!' : 'Chúc mừng nâng cấp!'}
                    </span>
                    
                    <h3 className="text-2xl font-black mb-3">
                      {isLao ? 'ທ່ານໄດ້ຮັບລະດັບ' : 'Đạt danh hiệu mới!'}
                    </h3>
                    
                    <div className={cn('px-6 py-3 rounded-2xl text-base font-black shadow-lg mb-4 border tracking-wide uppercase', upgradeLevelInfo.class)}>
                      {isLao ? upgradeLevelInfo.badgeLo : upgradeLevelInfo.badgeVi}
                    </div>
                    
                    <p className="text-xs text-slate-300 font-bold max-w-xs leading-relaxed">
                      {isLao ? upgradeLevelInfo.descLo : upgradeLevelInfo.descVi}
                    </p>

                    <button
                      onClick={() => setShowUpgradePopup(false)}
                      className="mt-6 text-xs text-slate-400 hover:text-white underline font-bold transition-colors"
                    >
                      {isLao ? 'ປິດ' : 'Bỏ qua'}
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
