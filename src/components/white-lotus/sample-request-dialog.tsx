import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Package, FileText, Check, ClipboardCheck, Phone, User, MapPin, Store, PackageCheck, Info, Send } from 'lucide-react'
import { WL_PRODUCTS } from '@/config/white-lotus'
import { publicFormContracts } from '@/config/form-contracts'
import { cn } from '@/lib/utils'
import { landingParams, trackEvent } from '@/lib/analytics'
import { submitWhiteLotusSampleRequest } from '@/lib/lead-service'

interface SampleRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lang: 'vi' | 'lo' | 'en'
  initialProductId?: string | null
  landingId?: string
  campaignId?: string
  landingVersion?: number
}

type SampleRequestValues = {
  pharmacyName: string
  contactName: string
  phone: string
  province: string
}

type NeedType = 'sample' | 'catalog' | 'both'

export function SampleRequestDialog({
  open,
  onOpenChange,
  lang,
  initialProductId,
  landingId = 'white-lotus',
  campaignId = 'WL_NEW_PRODUCTS_2026_Q3',
  landingVersion = 1,
}: SampleRequestDialogProps) {
  const { t } = useTranslation()
  const isLao = lang === 'lo'
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<string[]>(
    initialProductId && initialProductId !== 'header_cta' && initialProductId !== 'footer_cta'
      ? [initialProductId]
      : []
  )
  const [needType, setNeedType] = useState<NeedType>('both')

  const { register, handleSubmit, formState: { errors } } = useForm<SampleRequestValues>({
    defaultValues: { pharmacyName: '', contactName: '', phone: '', province: '' }
  })

  useEffect(() => {
    if (!open) return
    void trackEvent('form_start', {
      ...landingParams({
        landingId,
        campaignId,
        templateId: 'white_lotus_order_v1',
        variantId: 'default',
        language: lang,
        landingVersion,
      }),
      form_location: 'white_lotus_sample_request_dialog',
      form_id: publicFormContracts.whiteLotusSampleRequest.formId,
      form_version: publicFormContracts.whiteLotusSampleRequest.versionNumber,
      flow_key: publicFormContracts.whiteLotusSampleRequest.flowKey,
    })
  }, [campaignId, landingId, landingVersion, lang, open])

  const toggleProduct = (id: string) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const onSubmit = async (values: SampleRequestValues) => {
    if (selectedProducts.length === 0) return
    setIsSubmitting(true)
    try {
      await submitWhiteLotusSampleRequest({
        ...values,
        selectedProductIds: selectedProducts,
        needType,
      }, lang, campaignId, landingId, landingVersion)
      await trackEvent('generate_lead', {
        ...landingParams({
          landingId,
          campaignId,
          templateId: 'white_lotus_order_v1',
          variantId: 'default',
          language: lang,
          landingVersion,
        }),
        lead_type: 'SAMPLE_REQUEST',
        selected_product_count: selectedProducts.length,
        need_type: needType,
        form_id: publicFormContracts.whiteLotusSampleRequest.formId,
        form_version: publicFormContracts.whiteLotusSampleRequest.versionNumber,
        flow_key: publicFormContracts.whiteLotusSampleRequest.flowKey,
      })
      setSuccess(true)
    } catch (err) {
      console.error(err)
      alert(isLao ? 'ມີຂໍ້ຜິດພາດ. ກະລຸນາລອງໃໝ່.' : 'Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setSuccess(false)
    onOpenChange(false)
  }

  if (!open) return null

  const needTypes: { value: NeedType; label: string; desc: string; icon: React.ReactNode; active: string }[] = [
    {
      value: 'sample',
      label: isLao ? 'ຮັບຕົວຢ່າງ' : 'Nhận mẫu sản phẩm',
      desc: isLao ? 'Sales ກວດສອບເງື່ອນໄຂການຈັດຕົວຢ່າງ' : 'Sales kiểm tra điều kiện cấp mẫu',
      icon: <Package className="w-4 h-4" />,
      active: 'border-emerald-600 bg-emerald-50 text-emerald-900'
    },
    {
      value: 'catalog',
      label: isLao ? 'ຮັບເອກະສານສິນຄ້າ' : 'Nhận tài liệu sản phẩm',
      desc: isLao ? 'Sales ຈະສົ່ງເອກະສານທີ່ເໝາະສົມ' : 'Sales gửi tài liệu phù hợp sau khi xác nhận',
      icon: <FileText className="w-4 h-4" />,
      active: 'border-emerald-600 bg-emerald-50 text-emerald-900'
    },
    {
      value: 'both',
      label: isLao ? 'ຕົວຢ່າງ ແລະ ເອກະສານ' : 'Mẫu và tài liệu',
      desc: isLao ? 'ຕາມຈຳນວນທີ່ມີ ແລະ ການຢືນຢັນ' : 'Tùy tình trạng và xác nhận của Sales',
      icon: <PackageCheck className="w-4 h-4" />,
      active: 'border-emerald-600 bg-emerald-50 text-emerald-900'
    },
  ]

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        {/*
          MOBILE  : full-width bottom sheet, slides up from bottom
          DESKTOP : centered modal, wide (max-w-2xl)
        */}
        <Dialog.Content
          className={cn(
            'fixed z-50 outline-none duration-200',
            // Mobile bottom sheet
            'inset-x-0 bottom-0',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
            // Desktop: centered modal
            'sm:inset-auto sm:left-1/2 sm:top-1/2',
            'sm:-translate-x-1/2 sm:-translate-y-1/2',
            'sm:w-[92vw] sm:max-w-4xl',
            'sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:zoom-in-95',
            'sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=open]:slide-in-from-bottom-0'
          )}
        >
          {/* Card */}
          <div className={cn(
            'relative bg-white shadow-2xl flex flex-col overflow-hidden',
            // Mobile: rounded top corners only, max 92% viewport
            'max-h-[92dvh] rounded-t-2xl',
            // Desktop: fully rounded, limit height
            'sm:max-h-[90vh] sm:rounded-2xl'
          )}>

            {/* Drag handle – mobile only */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0">
              <div className="w-10 h-1 bg-slate-200 rounded-full" />
            </div>

            <Dialog.Close className="absolute right-4 top-4 z-20 rounded-full bg-white/90 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors shadow-sm">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Dialog.Close>

            {/* ── SUCCESS STATE ── */}
            {success ? (
              <div className="flex flex-col items-center justify-center p-12 text-center w-full min-h-[320px]">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
                  <Check className="h-10 w-10 text-[#008A5E]" />
                </div>
                <h2 className="mb-2 text-2xl font-black text-slate-900">
                  {isLao ? 'ຮັບ​ຄຳ​ຮ້ອງ​ຂໍ​ແລ້ວ!' : 'Đã ghi nhận yêu cầu!'}
                </h2>
                <p className="mb-8 max-w-sm text-slate-500 leading-relaxed">
                  {isLao
                    ? 'Sales ຈະຕິດຕໍ່ຫາທ່ານ ເພື່ອຢືນຢັນສິນຄ້າ ແລະ ຄວາມສາມາດໃນການຈ່າຍ.'
                    : 'Sales phụ trách khu vực sẽ liên hệ để xác nhận đối tượng, sản phẩm và khả năng cấp mẫu.'}
                </p>
                <button onClick={handleClose} className="bg-[#008A5E] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#00704C] transition-colors">
                  {isLao ? 'ປິດ' : 'Đóng'}
                </button>
              </div>
            ) : (
              /* ── FORM STATE ── */
              <div className="flex flex-col sm:flex-row overflow-hidden flex-1">

                {/* Context rail */}
                <div className="shrink-0 border-b border-emerald-900 bg-emerald-950 p-5 text-white sm:w-64 sm:border-b-0 sm:border-r sm:p-7">
                  <div>
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 bg-white/10">
                        <ClipboardCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-extrabold uppercase text-emerald-200">
                          WHITE LOTUS
                        </p>
                        <h2 className="text-base font-black leading-tight">
                          {isLao ? 'ຂໍຮັບ​ຕົວຢ່າງ / ເອກະສານ' : 'Đăng ký mẫu và tài liệu'}
                        </h2>
                      </div>
                    </div>
                    <p className="mb-5 text-sm leading-relaxed text-emerald-100/80">
                      {isLao
                        ? 'ສຳລັບຮ້ານຂາຍຢາ ແລະ ຜູ້ປະກອບວິຊາຊີບ. Sales ຈະກວດສອບ ແລະ ຢືນຢັນຄຳຂໍ.'
                        : 'Dành cho nhà thuốc và người hành nghề chuyên môn. Sales sẽ kiểm tra và xác nhận yêu cầu.'}
                    </p>

                    {/* Trust tags */}
                    <div className="flex flex-col gap-2">
                      {[
                        { icon: <Check className="h-4 w-4" />, text: isLao ? 'Sales ຢືນຢັນສິນຄ້າ' : 'Sales xác nhận sản phẩm' },
                        { icon: <PackageCheck className="h-4 w-4" />, text: isLao ? 'ຕາມຈຳນວນທີ່ມີ' : 'Theo số lượng hiện có' },
                        { icon: <FileText className="h-4 w-4" />, text: isLao ? '4 ສິນຄ້າໃໝ່ Q3/2026' : '4 sản phẩm mới Q3/2026' },
                      ].map(item => (
                        <div key={item.text} className="flex items-center gap-2 text-sm text-white/90">
                          <span className="text-emerald-300">{item.icon}</span>
                          <span>{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Disclaimer box */}
                  <div className="mt-6 hidden gap-2 rounded-lg border border-white/15 bg-white/5 p-3 text-xs leading-relaxed text-white/70 sm:flex">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                    <span>{isLao
                      ? 'ການຈ່າຍຕົວຢ່າງ ຂຶ້ນຢູ່ກັບເຂດ, ເປົ້າໝາຍ ແລະ ຈຳນວນທີ່ຍັງເຫຼືອ. ໃນກໍລະນີທີ່ຍັງບໍ່ມີ, ພວກເຮົາຈະສົ່ງ catalog.'
                      : 'Việc cấp mẫu phụ thuộc khu vực, đối tượng và số lượng còn lại. Sales sẽ đề xuất tài liệu phù hợp khi chưa có mẫu.'}</span>
                  </div>
                </div>

                {/* RIGHT PANEL – scrollable form */}
                <div className="flex-1 overflow-y-auto overscroll-contain">
                  <div className="p-5 sm:p-7 space-y-5">

                    {/* Step 1: Products */}
                    <div>
                      <p className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#008A5E] text-white flex items-center justify-center text-xs font-black shrink-0">1</span>
                        {isLao ? 'ເລືອກສິນຄ້າ:' : 'Chọn sản phẩm:'}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {WL_PRODUCTS.map(p => {
                          const sel = selectedProducts.includes(p.product_id)
                          return (
                            <button
                              key={p.product_id}
                              type="button"
                              onClick={() => toggleProduct(p.product_id)}
                              className={cn(
                                'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm font-bold transition-colors',
                                sel ? 'border-emerald-600 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'
                              )}
                            >
                              <div className={cn('w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all', sel ? 'border-[#008A5E] bg-[#008A5E]' : 'border-slate-300')}>
                                {sel && <Check className="w-2.5 h-2.5 text-white" />}
                              </div>
                              {p.canonical_name}
                            </button>
                          )
                        })}
                      </div>
                      {selectedProducts.length === 0 && (
                        <p className="mt-1.5 text-xs text-rose-600">{isLao ? 'ກະລຸນາເລືອກຢ່າງໜ້ອຍ 1 ສິນຄ້າ' : 'Vui lòng chọn ít nhất 1 sản phẩm'}</p>
                      )}
                    </div>

                    {/* Step 2: Need type */}
                    <div>
                      <p className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#008A5E] text-white flex items-center justify-center text-xs font-black shrink-0">2</span>
                        {isLao ? 'ທ່ານຕ້ອງການຫຍັງ?' : 'Bạn muốn nhận:'}
                      </p>
                      <div className="flex flex-col gap-2">
                        {needTypes.map(nt => (
                          <button
                            key={nt.value}
                            type="button"
                            onClick={() => setNeedType(nt.value)}
                            className={cn(
                              'flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm font-bold transition-colors',
                              needType === nt.value ? nt.active : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'
                            )}
                          >
                            <div className={cn('w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0', needType === nt.value ? 'border-current bg-current' : 'border-slate-300')}>
                              {needType === nt.value && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                            {nt.icon}
                            <div>
                              <div>{nt.label}</div>
                              <div className="text-xs font-normal opacity-70 mt-0.5">{nt.desc}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Mobile disclaimer */}
                    <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-800 sm:hidden">
                      <Info className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{isLao ? 'ການຈ່າຍຕົວຢ່າງ ຂຶ້ນຢູ່ກັບເຂດ ແລະ ຈຳນວນທີ່ຍັງເຫຼືອ.' : 'Việc cấp mẫu phụ thuộc khu vực, đối tượng và số lượng còn lại.'}</span>
                    </div>

                    {/* Step 3: Contact */}
                    <div>
                      <p className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#008A5E] text-white flex items-center justify-center text-xs font-black shrink-0">3</span>
                        {isLao ? 'ຂໍ້ມູນຕິດຕໍ່:' : 'Thông tin liên hệ:'}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="relative">
                          <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                          <input {...register('contactName', { required: true })}
                            placeholder={isLao ? 'ຊື່ຜູ້ຕິດຕໍ່ *' : 'Tên Nhà thuốc/Bác sĩ/Dược sĩ *'}
                            className={cn('w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-[#008A5E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#008A5E] transition-all text-sm', errors.contactName && 'border-red-400 bg-red-50')} />
                        </div>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                          <input {...register('phone', { required: true, pattern: /^[0-9+\s\-]{8,15}$/ })}
                            type="tel"
                            placeholder={isLao ? 'ເບີໂທລະສັບ *' : 'Số điện thoại *'}
                            className={cn('w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-[#008A5E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#008A5E] transition-all text-sm', errors.phone && 'border-red-400 bg-red-50')} />
                        </div>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                          <input {...register('province', { required: true })}
                            placeholder={isLao ? 'ແຂວງ/ນະຄອນ *' : 'Tỉnh/Thành phố *'}
                            className={cn('w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-[#008A5E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#008A5E] transition-all text-sm', errors.province && 'border-red-400 bg-red-50')} />
                        </div>
                        <div className="relative">
                          <Store className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                          <input {...register('pharmacyName')}
                            placeholder={isLao ? 'ຊື່ຮ້ານ/ສະຖາບັນ (ຖ້າມີ)' : 'Tên cơ sở – không bắt buộc'}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-[#008A5E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#008A5E] transition-all text-sm" />
                        </div>
                      </div>
                    </div>

                    {/* Submit */}
                    <div className="pb-4 mt-2">
                      <button
                        type="button"
                        disabled={isSubmitting || selectedProducts.length === 0}
                        onClick={handleSubmit(onSubmit)}
                        className="w-full relative flex items-center justify-center gap-2 rounded-xl bg-[#00704C] hover:bg-[#005c40] px-6 py-4 text-base font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            {isLao ? 'ກຳລັງສົ່ງ...' : 'Đang gửi...'}
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            {isLao ? 'ສົ່ງຄຳຂໍ' : 'Gửi yêu cầu'}
                          </>
                        )}
                      </button>
                      <p className="text-center text-xs text-slate-400 mt-2">
                        {isLao ? 'Sales ຕິດຕໍ່ຢືນຢັນ' : 'Sales sẽ liên hệ xác nhận'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
