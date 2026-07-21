import { Award, CalendarDays, Check, Gift, LockKeyhole, Plus } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { WL_PRODUCTS, WL_PROMOTION_THRESHOLDS, getWhiteLotusPromotionRules } from '@/config/white-lotus'
import { cn } from '@/lib/utils'

const tierStyles = {
  4: {
    labelVi: 'Mức 1 · mốc 4',
    labelLo: 'ລະດັບ 1 · 4',
    productsVi: 'Lotofex 200 · Fexentrix 60/120',
    productsLo: 'Lotofex 200 · Fexentrix 60/120',
    header: 'border-slate-600 bg-slate-700 text-white',
    eligible: 'border-slate-300 bg-slate-100 text-slate-700',
    reached: 'scale-[1.04] border-slate-700 bg-slate-800 text-white ring-2 ring-slate-300 shadow-md',
  },
  6: {
    labelVi: 'Mức 1 · mốc 6',
    labelLo: 'ລະດັບ 1 · 6',
    productsVi: 'Etorilux 120',
    productsLo: 'Etorilux 120',
    header: 'border-teal-600 bg-teal-700 text-white',
    eligible: 'border-teal-300 bg-teal-50 text-teal-800',
    reached: 'scale-[1.04] border-teal-700 bg-teal-700 text-white ring-2 ring-teal-200 shadow-md',
  },
  12: {
    labelVi: 'Mức 2',
    labelLo: 'ລະດັບ 2',
    productsVi: 'Cả 4 sản phẩm',
    productsLo: 'ທັງ 4 ຜະລິດຕະພັນ',
    header: 'border-amber-400 bg-gradient-to-b from-slate-950 to-amber-950 text-amber-200 border-b-2 border-b-amber-400',
    eligible: 'border-amber-300 bg-amber-50 text-amber-900',
    reached: 'scale-[1.08] border-amber-400 bg-gradient-to-br from-yellow-300 via-amber-500 to-yellow-600 text-white ring-2 ring-amber-200 shadow-[0_4px_14px_rgba(245,158,11,0.35)] font-black',
  },
} as const

const productStyles = {
  'fexentrix-60': {
    reached: 'scale-[1.05] border-purple-600 bg-purple-600 text-white ring-2 ring-purple-100 shadow-md shadow-purple-500/25',
    eligible: 'border-purple-200 bg-purple-50/30 text-purple-600 hover:border-purple-300',
  },
  'etorilux-120': {
    reached: 'scale-[1.05] border-rose-600 bg-rose-600 text-white ring-2 ring-rose-100 shadow-md shadow-rose-500/25',
    eligible: 'border-rose-200 bg-rose-50/30 text-rose-600 hover:border-rose-300',
  },
  'fexentrix-120': {
    reached: 'scale-[1.05] border-orange-600 bg-orange-600 text-white ring-2 ring-orange-100 shadow-md shadow-orange-500/25',
    eligible: 'border-orange-200 bg-orange-50/30 text-orange-600 hover:border-orange-300',
  },
  'lotofex-200': {
    reached: 'scale-[1.05] border-blue-600 bg-blue-600 text-white ring-2 ring-blue-100 shadow-md shadow-blue-500/25',
    eligible: 'border-blue-200 bg-blue-50/30 text-blue-600 hover:border-blue-300',
  },
} as const

const levelOneRewardImage = '/assets/white-lotus/web/multi-vitamin-level-1.jpg'

function PromotionRewardLegend({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-3 border-t border-slate-200" data-testid="promotion-reward-legend">
      <div className="col-span-2 flex items-center gap-2 border-r border-teal-200 bg-teal-50 px-3 py-2">
        <div className={cn(
          'flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-teal-200 bg-white shadow-sm',
          compact ? 'h-9 w-9' : 'h-12 w-12',
        )}>
          <img
            src={levelOneRewardImage}
            alt={`${t('wl.promotion.multi_vitamin')} - ${t('wl.promotion.level_one_reward')}`}
            className="h-full w-full object-contain p-0.5"
          />
        </div>
        <div className="min-w-0 text-left">
          <div className="text-[9px] font-black uppercase text-teal-800">{t('wl.promotion.level_one_reward')}</div>
          <div className="truncate text-[10px] font-bold text-slate-800 sm:text-xs">{t('wl.promotion.multi_vitamin')}</div>
          {!compact && <div className="text-[9px] leading-tight text-slate-500">{t('wl.promotion.level_one_applies')}</div>}
        </div>
      </div>
      <div className="flex min-w-0 items-center bg-amber-50 px-2 py-2 text-left">
        <div>
          <div className="text-[9px] font-black uppercase text-amber-900">{t('wl.promotion.level_two_reward')}</div>
          <div className="text-[9px] font-semibold leading-tight text-slate-600">
            {t('wl.promotion.program_product')}
          </div>
          {!compact && <div className="mt-0.5 text-[8px] text-slate-500">{t('wl.promotion.level_two_confirmation')}</div>}
        </div>
      </div>
    </div>
  )
}

export function PromotionTierMatrix({
  quantities,
  isLao,
  compact = false,
}: {
  quantities?: Record<string, number>
  isLao: boolean
  compact?: boolean
}) {
  const highestReachedThreshold = quantities
    ? Math.max(
      0,
      ...WL_PRODUCTS.flatMap(product => (
        getWhiteLotusPromotionRules(product.product_id)
          .filter(rule => (quantities[product.product_id] || 0) >= rule.buy_quantity)
          .map(rule => rule.buy_quantity)
      )),
    )
    : 0

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border bg-white transition-all duration-500',
        highestReachedThreshold === 12
          ? 'border-amber-300 shadow-[0_14px_34px_rgba(180,136,28,0.20)]'
          : highestReachedThreshold === 6
            ? 'border-teal-300 shadow-[0_12px_28px_rgba(13,148,136,0.16)]'
            : highestReachedThreshold === 4
              ? 'border-slate-400 shadow-lg shadow-slate-900/10'
              : 'border-slate-200 shadow-sm',
      )}
      data-testid="promotion-tier-matrix"
    >
      <div className="grid grid-cols-[minmax(7rem,1.35fr)_repeat(3,minmax(4.25rem,0.7fr))] border-b border-slate-700 text-center text-[9px] font-black uppercase">
        <div className="bg-slate-900 px-2 py-1.5 text-slate-500" />
        <div className="col-span-2 border-l border-teal-600 bg-teal-800 px-2 py-1.5 text-teal-50">
          {isLao ? 'ລະດັບ 1' : 'Mức 1'}
        </div>
        <div className="border-l border-amber-400 bg-emerald-950 px-2 py-1.5 text-amber-200">
          {isLao ? 'ລະດັບ 2' : 'Mức 2'}
        </div>
      </div>
      <div className="grid grid-cols-[minmax(7rem,1.35fr)_repeat(3,minmax(4.25rem,0.7fr))] border-b border-slate-200">
        <div className="flex items-end bg-slate-900 px-3 py-2 text-[10px] font-extrabold uppercase text-slate-300">
          {isLao ? 'ສິນຄ້າ' : 'Sản phẩm'}
        </div>
        {WL_PROMOTION_THRESHOLDS.map(threshold => {
          const style = tierStyles[threshold]
          return (
            <div key={threshold} className={cn('border-l px-1.5 py-2 text-center', style.header)}>
              <div className="text-sm font-black">{threshold}+1</div>
              {!compact && <div className="mt-0.5 text-[9px] font-bold uppercase">{isLao ? style.labelLo : style.labelVi}</div>}
            </div>
          )
        })}
      </div>

      {WL_PRODUCTS.map((product, index) => {
        const rules = getWhiteLotusPromotionRules(product.product_id)
        const quantity = quantities?.[product.product_id] || 0
        return (
          <div
            key={product.product_id}
            className={cn(
              'group grid grid-cols-[minmax(7rem,1.35fr)_repeat(3,minmax(4.25rem,0.7fr))] transition-colors hover:bg-slate-50',
              index < WL_PRODUCTS.length - 1 && 'border-b border-slate-100',
            )}
          >
            <div className="flex min-w-0 items-center gap-2 bg-white/90 px-3 py-2.5 transition-colors group-hover:bg-white">
              {!compact && <img src={product.packshot_url} alt="" className="h-7 w-9 shrink-0 object-contain drop-shadow-sm" />}
              <span className="truncate text-[11px] font-bold text-slate-800 sm:text-xs">{product.canonical_name}</span>
            </div>
            {WL_PROMOTION_THRESHOLDS.map(threshold => {
              const rule = rules.find(item => item.buy_quantity === threshold)
              const reached = Boolean(rule && quantity >= threshold)
              const prodStyle = productStyles[product.product_id as keyof typeof productStyles]
              const style = tierStyles[threshold]
              
              let cellClass = ''
              if (!rule) {
                cellClass = 'border-transparent bg-slate-50 text-slate-200'
              } else if (reached) {
                if (threshold === 12) {
                  cellClass = style.reached
                } else {
                  cellClass = prodStyle.reached
                }
              } else {
                cellClass = prodStyle.eligible
              }

              return (
                <div key={threshold} className="flex items-center justify-center border-l border-slate-100 p-1.5 transition-colors group-hover:bg-white/70">
                  <div
                    aria-label={rule
                      ? `${product.canonical_name}: ${threshold}+1${reached ? ', reached' : ''}`
                      : `${product.canonical_name}: not applicable at ${threshold}+1`}
                    className={cn(
                      'flex h-7 w-full max-w-14 items-center justify-center rounded-md border text-[10px] font-black transition-all duration-300',
                      cellClass
                    )}
                  >
                    {rule ? (
                      reached ? (
                        <Check className="h-3.5 w-3.5 stroke-[3px]" aria-hidden="true" />
                      ) : (
                        <Check className="h-3.5 w-3.5 opacity-40" aria-hidden="true" />
                      )
                    ) : (
                      <LockKeyhole className="h-3 w-3 opacity-20" aria-hidden="true" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )
      })}
      <PromotionRewardLegend compact={compact} />
      {!compact && (
        <p className="border-t border-slate-200 bg-slate-50 px-3 py-2 text-[10px] leading-relaxed text-slate-500">
          {isLao
            ? 'ເຄື່ອງໝາຍສະແດງຈຸດທີ່ນຳໃຊ້. ຂອງແຖມບໍ່ລວມກັນ ແລະ Sales ຈະຢືນຢັນ.'
            : 'Dấu kiểm thể hiện mốc áp dụng. Ưu đãi không cộng dồn; Sales xác nhận quà cuối cùng.'}
        </p>
      )}
    </div>
  )
}

export function PromotionTierRail({ isLao }: { isLao: boolean }) {
  const { t } = useTranslation()
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 15 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-5xl text-left"
      data-testid="promotion-tier-rail"
    >
      {/* Title Header */}
      <div className="relative flex flex-wrap items-end justify-between gap-3 pb-4 mb-8 border-b border-slate-200">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-emerald-800 text-white rounded-xl shadow-sm">
            <Gift className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
              {isLao ? 'ໂປຣໂມຊັ່ນ NNC Pharma ສຳລັບຮ້ານຂາຍຢາ' : 'Ưu đãi NNC Pharma dành cho nhà thuốc'}
            </div>
            <div className="mt-0.5 text-base font-black text-slate-900">
              {isLao ? 'ເລືອກມົ້ວທີ່ເໝາະສົມ · ຮັບຂອງແຖມພິເສດ' : 'Chọn mốc phù hợp · Nhận quà theo sản phẩm'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
          <CalendarDays className="h-4 w-4 text-rose-600" aria-hidden="true" />
          <span>{isLao ? 'ຮອດ 30/09/2026' : 'Đến 30/09/2026'}</span>
        </div>
      </div>

      {/* Grid of 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: 4+1 */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={shouldReduceMotion ? undefined : { y: -6, scale: 1.01 }}
          className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl shadow-slate-100 flex flex-col justify-between relative overflow-hidden group transition-all duration-300 hover:border-slate-300 hover:shadow-2xl"
        >
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                {isLao ? 'ລະດັບ 1' : 'Mức 1'}
              </span>
              <span className="bg-slate-100 text-slate-800 text-xs font-black px-2.5 py-1 rounded-full">
                {isLao ? 'ຂັ້ນຕໍ່າ 4 ກ່ອງ' : 'Min 4 hộp'}
              </span>
            </div>
            
            <div className="text-3xl font-black text-slate-900 mb-2">
              4+1
            </div>
            
            <div className="text-[11px] font-semibold text-slate-500 leading-relaxed min-h-[3rem] mb-6">
              <div className="font-extrabold text-slate-700 mb-1">{isLao ? 'ສິນຄ້າທີ່ຮ່ວມລາຍການ:' : 'Sản phẩm áp dụng:'}</div>
              Lotofex 200 · Fexentrix 60 · Fexentrix 120
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 flex items-center gap-3">
            <div className="w-12 h-12 shrink-0 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-1">
              <img src={levelOneRewardImage} alt="" className="h-full w-full object-contain" />
            </div>
            <div className="min-w-0">
              <div className="text-[9px] font-black uppercase text-rose-500 tracking-wider mb-0.5">{isLao ? 'ຂອງແຖມ' : 'Quà tặng'}</div>
              <div className="text-xs font-black text-slate-800 truncate">1 Multi Vitamin NC</div>
            </div>
          </div>
        </motion.div>

        {/* Card 2: 6+1 */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={shouldReduceMotion ? undefined : { y: -6, scale: 1.01 }}
          className="bg-white border border-teal-100 rounded-3xl p-6 shadow-xl shadow-teal-50/30 flex flex-col justify-between relative overflow-hidden group transition-all duration-300 hover:border-teal-300 hover:shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50/40 rounded-full blur-xl -mr-6 -mt-6 group-hover:bg-teal-100/50 transition-colors" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black uppercase text-teal-600 tracking-wider">
                {isLao ? 'ລະດັບ 1' : 'Mức 1'}
              </span>
              <span className="bg-teal-50 text-teal-800 text-xs font-black px-2.5 py-1 rounded-full border border-teal-100">
                {isLao ? 'ຂັ້ນຕໍ່າ 6 ກ່ອງ' : 'Min 6 hộp'}
              </span>
            </div>
            
            <div className="text-3xl font-black text-teal-700 mb-2">
              6+1
            </div>
            
            <div className="text-[11px] font-semibold text-slate-500 leading-relaxed min-h-[3rem] mb-6">
              <div className="font-extrabold text-teal-700 mb-1">{isLao ? 'ສິນຄ້າທີ່ຮ່ວມລາຍການ:' : 'Sản phẩm áp dụng:'}</div>
              Etorilux 120
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 flex items-center gap-3 relative z-10">
            <div className="w-12 h-12 shrink-0 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-1">
              <img src={levelOneRewardImage} alt="" className="h-full w-full object-contain" />
            </div>
            <div className="min-w-0">
              <div className="text-[9px] font-black uppercase text-rose-500 tracking-wider mb-0.5">{isLao ? 'ຂອງແຖມ' : 'Quà tặng'}</div>
              <div className="text-xs font-black text-slate-800 truncate">1 Multi Vitamin NC</div>
            </div>
          </div>
        </motion.div>

        {/* Card 3: 12+1 (Super Deal!) */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileHover={shouldReduceMotion ? undefined : { y: -6, scale: 1.01 }}
          className="bg-gradient-to-br from-emerald-950 to-slate-950 border border-amber-500/30 rounded-3xl p-6 shadow-xl shadow-amber-900/10 flex flex-col justify-between relative overflow-hidden group transition-all duration-300 hover:border-amber-400 hover:shadow-[0_10px_30px_rgba(245,158,11,0.15)]"
        >
          {/* Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                {isLao ? 'ລະດັບ 2' : 'Mức 2'}
              </span>
              <span className="bg-amber-400/10 text-amber-300 text-xs font-black px-2.5 py-1 rounded-full border border-amber-500/20">
                {isLao ? 'ຂັ້ນຕໍ່າ 12 ກ່ອງ' : 'Min 12 hộp'}
              </span>
            </div>
            
            <div className="text-3xl font-black text-amber-400 mb-1 flex items-center gap-2">
              <span>12+1</span>
              <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded bg-amber-400 text-slate-950 animate-pulse">
                HOT DEAL
              </span>
            </div>
            
            <div className="text-[11px] font-semibold text-slate-400 leading-relaxed min-h-[3rem] mb-6">
              <div className="font-extrabold text-amber-300 mb-1">{isLao ? 'ສິນຄ້າທີ່ຮ່ວມລາຍການ:' : 'Sản phẩm áp dụng:'}</div>
              {isLao ? 'ທັງ 4 ຜະລິດຕະພັນໃໝ່' : 'Áp dụng cho cả 4 sản phẩm'}
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 flex items-center gap-3 relative z-10">
            <div className="w-12 h-12 shrink-0 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center p-1.5 text-2xl">
              🎁
            </div>
            <div className="min-w-0">
              <div className="text-[9px] font-black uppercase text-amber-400 tracking-wider mb-0.5">
                {isLao ? 'ຂອງແຖມພິເສດ' : 'Quà tặng đặc quyền'}
              </div>
              <div className="text-xs font-black text-white whitespace-normal leading-tight">
                {isLao ? 'ເລືອກຟຣີ 1 ກ່ອງ ໃນ 4 ຜະລິດຕະພັນໃໝ່' : 'Tự chọn 1 hộp trong 4 sản phẩm mới'}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-center text-[10px] font-semibold text-slate-500 bg-slate-100/50 py-2.5 rounded-2xl">
        <Award className="h-4 w-4 text-amber-600" aria-hidden="true" />
        <span>
          {isLao
            ? 'ເງື່ອນໄຂນຳໃຊ້ຕາມແຕ່ລະສິນຄ້າ · ຂອງແຖມບໍ່ລວມກັນ · Sales ຢືນຢັນກ່ອນສຳເລັດການສັ່ງຊື້'
            : 'Mốc áp dụng theo từng sản phẩm · Ưu đãi không cộng dồn · Sales xác nhận trước khi hoàn tất đơn'}
        </span>
      </div>
    </motion.div>
  )
}
