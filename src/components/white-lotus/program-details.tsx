import React from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar, MapPin, Gift } from 'lucide-react'
import { motion } from 'framer-motion'


import { WL_PRODUCTS, getWhiteLotusPromotionRules } from '@/config/white-lotus'
import { cn } from '@/lib/utils'

export function ProgramDetails() {
  const { t, i18n } = useTranslation()
  const isLao = i18n.language === 'lo'

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
  }

  return (
    <section data-analytics-section="program_details" data-section-order="5" className="py-24 bg-slate-50" id="program">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="relative overflow-hidden rounded-2xl border border-emerald-800 bg-[#07583B] p-6 text-white shadow-xl sm:p-8 md:p-12"
        >
          <div className="relative z-10">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-white/10 backdrop-blur-md text-white text-[10px] sm:text-xs font-black mb-8 sm:mb-10 uppercase tracking-widest border border-white/20 shadow-sm">
              <span className="relative flex h-2 sm:h-2.5 w-2 sm:w-2.5 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 sm:h-2.5 w-2 sm:w-2.5 bg-lime-400"></span>
              </span>
              {t('wl.program.badge')}
            </motion.div>

            <motion.h2 variants={itemVariants} className={`${isLao ? 'text-2xl sm:text-3xl md:text-4xl' : 'text-3xl sm:text-4xl md:text-5xl'} font-black mb-10 sm:mb-12 tracking-tight leading-[1.2] sm:leading-[1.15]`}>
              {t('wl.program.title')}
            </motion.h2>

            <div className="space-y-6 sm:space-y-8">
              <motion.div variants={itemVariants} className="flex items-start gap-4 sm:gap-5 group">
                <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-2xl sm:rounded-[1.25rem] bg-transparent flex items-center justify-center border-2 border-white/20 group-hover:border-lime-400 group-hover:bg-white/10 transition-all duration-300">
                  <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-lime-400" />
                </div>
                <div className="pt-0.5 sm:pt-1">
                  <h3 className="text-lg sm:text-xl font-bold mb-4 text-white">{isLao ? 'ໂປຣໂມຊັ່ນຕາມມົ້ກ' : 'Ưu đãi theo mốc'}</h3>
                  
                  {/* Visual product grid cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 max-w-2xl">
                    {WL_PRODUCTS.map(product => {
                      const rules = getWhiteLotusPromotionRules(product.product_id)
                      return (
                        <div key={product.product_id} className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3 hover:bg-white/10 hover:border-white/20 transition-all duration-300 shadow-sm">
                          <img src={product.packshot_url} className="w-10 h-8 object-contain shrink-0 filter brightness-110 drop-shadow-sm" alt="" />
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-xs text-white mb-1 leading-snug">{product.canonical_name}</h4>
                            <div className="flex flex-wrap gap-1">
                              {rules.map(rule => (
                                <span key={rule.buy_quantity} className={cn(
                                  "text-[8px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wider",
                                  rule.buy_quantity === 12
                                    ? "bg-amber-400/25 text-amber-300 border-amber-400/40"
                                    : "bg-emerald-400/20 text-emerald-300 border-emerald-400/40"
                                )}>
                                  {rule.buy_quantity}+1 {rule.buy_quantity === 12 ? (isLao ? 'ເລືອກຟຣີ' : 'Tự chọn') : 'Sủi'}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="flex items-start gap-4 sm:gap-5 group">
                <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-2xl sm:rounded-[1.25rem] bg-transparent flex items-center justify-center border-2 border-white/20 group-hover:border-lime-400 group-hover:bg-white/10 transition-all duration-300">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-lime-400" />
                </div>
                <div className="pt-0.5 sm:pt-1">
                  <h3 className="text-lg sm:text-xl font-bold mb-1 text-white">{t('wl.program.time_title')}</h3>
                  <p className="text-emerald-50/90 text-base sm:text-lg leading-relaxed">
                    {t('wl.program.time_desc_from')} <strong className="text-white font-extrabold">15/07/2026</strong> {t('wl.program.time_desc_to')} <strong className="text-white font-extrabold">30/09/2026</strong>.
                  </p>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="flex items-start gap-4 sm:gap-5 group">
                <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-2xl sm:rounded-[1.25rem] bg-transparent flex items-center justify-center border-2 border-white/20 group-hover:border-lime-400 group-hover:bg-white/10 transition-all duration-300">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-lime-400" />
                </div>
                <div className="pt-0.5 sm:pt-1">
                  <h3 className="text-lg sm:text-xl font-bold mb-1 text-white">{t('wl.program.target_title')}</h3>
                  <p className="text-emerald-50/90 text-base sm:text-lg leading-relaxed">
                    {t('wl.program.target_desc')}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
