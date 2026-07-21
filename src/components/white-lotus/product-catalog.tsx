import React from 'react'
import { useTranslation } from 'react-i18next'
import { WL_PRODUCTS, getWhiteLotusPromotionRules } from '@/config/white-lotus'
import { Award, Boxes, FileText, FlaskConical, MessageSquareText, ShoppingCart, ArrowRight } from 'lucide-react'
import { PromotionTierRail } from './promotion-tier-matrix'

interface ProductCatalogProps {
  onViewCatalog: (catalogUrl: string) => void
  onInterested: (productId: string) => void
  onSampleRequest?: (productId: string | null) => void
  onTrackEvent?: (eventName: string, params: any) => void
}

export function ProductCatalog({ onViewCatalog, onInterested, onSampleRequest }: ProductCatalogProps) {
  const { t, i18n } = useTranslation()
  const isLao = i18n.language === 'lo'

  return (
    <section data-analytics-section="products" data-section-order="3" className="py-24 bg-slate-50 relative" id="products">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20 flex flex-col items-center">
          <p className="text-sm font-extrabold uppercase tracking-widest text-[#008A5E] mb-3">{t('wl.products.eyebrow')}</p>
          <h2 className={`${isLao ? 'text-3xl md:text-4xl' : 'text-4xl md:text-5xl'} mb-6 font-extrabold tracking-tight text-slate-900`}>{t('wl.products.title')}</h2>

          <button
            type="button"
            onClick={() => onInterested && onInterested('bulk_order')}
            className="group mt-6 flex w-full max-w-xl items-center gap-3 sm:gap-4 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-3.5 sm:px-5 sm:py-4 text-left text-white shadow-xl shadow-slate-950/20 transition-all hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-2xl active:translate-y-0 relative overflow-hidden"
          >
            {/* Shimmer overlay effect */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite] pointer-events-none" />
            
            <span className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/30">
              <Boxes className="h-6 w-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs sm:text-sm font-black uppercase text-amber-300 tracking-wider flex items-center gap-1.5">
                {isLao ? 'ສັ່ງຊື້ຂາຍສົ່ງ · ຮັບສ່ວນຫຼຸດສູງສຸດ' : 'Nhập Sỉ Toàn Quốc · Chiết Khấu Khủng'}
                <span className="inline-block text-[8px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded-full font-black animate-pulse">HOT</span>
              </span>
              <span className="mt-0.5 sm:mt-1 block text-[10px] sm:text-xs leading-relaxed text-slate-300 font-medium">
                {isLao ? 'ນະໂຍບາຍພິເສດ B2B & ຂອງແຖມສະສົມ. ກົດຮັບໃບສະເໜີລາຄາທັນທີ!' : 'Chính sách sỉ đặc quyền B2B & quà tặng tích lũy. Click nhận báo giá ngay!'}
              </span>
            </span>
            <span className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-transform group-hover:translate-x-1 group-hover:bg-white/20">
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </span>
          </button>
        </div>

        <div className="relative space-y-24">
          {/* Timeline connecting line (desktop only) */}
          <div className="absolute bottom-10 left-1/2 top-10 z-0 hidden w-px -translate-x-1/2 bg-slate-200 lg:block"></div>

          {WL_PRODUCTS.map((product, index) => {
            const isEven = index % 2 === 0
            
            let themeColor = 'group-hover:border-blue-400 group-hover:text-blue-600'
            let cardHover = 'hover:border-blue-300 hover:shadow-blue-200/50'
            if (product.product_id.includes('fexentrix-60')) {
              themeColor = 'group-hover:border-purple-400 group-hover:text-purple-600'
              cardHover = 'hover:border-purple-300 hover:shadow-purple-200/50'
            } else if (product.product_id.includes('etorilux')) {
              themeColor = 'group-hover:border-rose-400 group-hover:text-rose-600'
              cardHover = 'hover:border-rose-300 hover:shadow-rose-200/50'
            } else if (product.product_id.includes('fexentrix-120')) {
              themeColor = 'group-hover:border-orange-400 group-hover:text-orange-600'
              cardHover = 'hover:border-orange-300 hover:shadow-orange-200/50'
            }

            return (
              <div key={product.product_id} className="relative z-10 group">
                
                {/* Center node for timeline */}
                <div className={`hidden lg:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full border-4 border-slate-100 items-center justify-center shadow-sm z-20 transition-all duration-500 group-hover:scale-110 ${themeColor}`}>
                  <span className="text-[#008A5E] font-black">{index + 1}</span>
                </div>

                <div className={`flex flex-col lg:flex-row items-center gap-6 lg:gap-24 ${!isEven ? 'lg:flex-row-reverse' : ''}`}>
                  
                  {/* Image Column */}
                  <div className="w-full lg:w-1/2 relative group-hover:scale-105 transition-transform duration-500 flex justify-center z-10">
                    <img 
                      src={product.packshot_url} 
                      alt={product.canonical_name}
                      className="w-4/5 sm:w-2/3 lg:w-full h-auto object-contain drop-shadow-2xl relative z-10"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x600/f8fafc/94a3b8?text=Product+Image'
                      }}
                    />
                  </div>

                  {/* Text Column */}
                  <div className={`relative z-20 mx-2 -mt-16 flex w-full flex-col space-y-4 sm:space-y-6 rounded-2xl border border-slate-100 bg-white/95 p-5 shadow-xl shadow-slate-200/50 transition-all duration-300 sm:mx-8 sm:-mt-24 sm:p-8 lg:mx-0 lg:mt-0 lg:w-1/2 lg:space-y-8 lg:rounded-none lg:border-none lg:bg-transparent lg:p-0 lg:shadow-none ${cardHover}`}>
                    
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start justify-between">
                        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-none group-hover:-translate-y-1 transition-transform">{product.canonical_name}</h3>
                        <div className="bg-slate-100 text-slate-500 font-bold px-2.5 py-0.5 rounded-lg text-xs whitespace-nowrap">
                          {t(`wl.products.items.${product.product_id}.pack_size`, { defaultValue: product.pack_size })}
                        </div>
                      </div>
                      <p className="text-sm sm:text-lg lg:text-xl text-[#008A5E] font-bold">
                        {t(`wl.products.items.${product.product_id}.ingredients`, { defaultValue: product.active_ingredient })}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <Award className="h-4 w-4 text-amber-600" />
                        {getWhiteLotusPromotionRules(product.product_id).map(rule => (
                          <span key={rule.rule_id} className={rule.buy_quantity === 12
                            ? 'rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-[9px] font-black text-amber-900'
                            : 'rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-black text-emerald-800'}
                          >
                            {isLao ? 'ລະດັບ' : 'Mức'} {rule.level} · {rule.buy_quantity}+1
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex-grow text-base">
                      <div className="grid grid-cols-2 gap-2.5 pt-2">
                        <div className="bg-slate-100/50 p-3 sm:p-4 rounded-2xl flex flex-col justify-center">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">{t('wl.products.pack_size')}</span>
                          <span className="font-black text-slate-800 text-xs sm:text-base">{t(`wl.products.items.${product.product_id}.pack_size`, { defaultValue: product.pack_size })}</span>
                        </div>
                        <div className="bg-rose-50 p-3 sm:p-4 rounded-2xl flex flex-col justify-center min-w-0">
                          <span className="text-[9px] font-bold text-rose-400 uppercase tracking-widest block mb-0.5">{t('wl.products.price')}</span>
                          <span className="font-black text-rose-600 text-xs sm:text-base break-words whitespace-normal break-all sm:break-words">
                            {new Intl.NumberFormat(isLao ? 'lo-LA' : 'vi-VN', { style: 'currency', currency: 'LAK', maximumFractionDigits: 0 }).format(product.price_vientiane_lak)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2.5 mt-6">
                      {/* Primary CTA – Order */}
                      <button
                        onClick={() => onInterested(product.product_id)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 sm:py-4 text-sm sm:text-base font-black text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-emerald-900"
                      >
                        <ShoppingCart className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                        <span>{t('wl.products.order_cta')}</span>
                      </button>

                      {/* Secondary row – gated catalog + sample request */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => onViewCatalog(product.catalog_url)}
                          className="flex-1 flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-transparent px-2.5 py-2 text-[11px] sm:text-xs font-bold text-slate-600 hover:border-slate-300 hover:text-slate-800 transition-all cursor-pointer"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>{t('wl.products.pdf_catalog')}</span>
                        </button>
                        {onSampleRequest && (
                          <button
                            onClick={() => onSampleRequest(product.product_id)}
                            className="flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-2 text-[11px] sm:text-xs font-bold text-emerald-800 transition-all hover:bg-emerald-100"
                          >
                            <FlaskConical className="h-3.5 w-3.5" />
                            <span>{isLao ? 'ຂໍຮັບຕົວຢ່າງ' : 'Yêu cầu mẫu'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
