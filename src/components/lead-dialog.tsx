import * as Dialog from '@radix-ui/react-dialog'
import * as Select from '@radix-ui/react-select'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, ChevronDown, LoaderCircle, Send, X, Store, MapPin, User, Phone } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { campaignConfig } from '@/config/campaign'
import { publicFormContracts } from '@/config/form-contracts'
import { campaignParams, trackEvent } from '@/lib/analytics'
import { submitLead } from '@/lib/lead-service'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next';
import type { LandingVariant, LeadFormValues, AppLanguage } from '@/types'

const schema = z.object({
  pharmacyName: z.string().trim().min(2, 'pharmacyName'),
  province: z.string().trim().min(2, 'province'),
  contactName: z.string().trim().min(2, 'contactName'),
  phone: z.string().trim().regex(/^\+?[0-9\s-]{8,18}$/, 'phone'),
  selectedPackage: z.enum(['basic', 'advanced']),
  rewardOption: z.enum(['product', 'cash', 'undecided']),
  consent: z.boolean().refine((value) => value, { message: 'consent' }),
})

export function LeadDialog({
  open,
  onOpenChange,
  variant,
  lang,
  initialPackage = 'basic',
  campaignId = 'VG5_KMK_LAO_2026',
  landingId = 'vg5-kmk',
  landingVersion = 1,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  variant: LandingVariant
  lang: AppLanguage
  initialPackage?: 'basic' | 'advanced'
  campaignId?: string
  landingId?: string
  landingVersion?: number
}) {
  const [success, setSuccess] = useState(false)
  const { t } = useTranslation()
  const [resultMode, setResultMode] = useState<'api' | 'demo' | null>(null)
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      selectedPackage: initialPackage,
      rewardOption: 'undecided',
      consent: false,
    },
  })

  const watchedFields = watch(['pharmacyName', 'province', 'contactName', 'phone'])
  const filledCount = watchedFields.filter(v => v && v.length > 1).length
  const progressPercent = Math.max(10, (filledCount / 4) * 100)

  useEffect(() => {
    if (open) {
      setValue('selectedPackage', initialPackage)
      void trackEvent('form_start', {
        ...campaignParams(variant, lang, campaignId, landingId, landingVersion),
        selected_package: initialPackage,
        form_location: 'lead_dialog',
        form_id: publicFormContracts.vg5TradeOrder.formId,
        form_version: publicFormContracts.vg5TradeOrder.versionNumber,
        flow_key: publicFormContracts.vg5TradeOrder.flowKey,
      })
    }
  }, [initialPackage, open, setValue, variant, lang, campaignId, landingId, landingVersion])

  async function onSubmit(values: LeadFormValues) {
    try {
      const result = await submitLead(
        values,
        variant,
        lang,
        campaignId,
        landingId,
        landingVersion
      )
      setResultMode(result.mode)
      setSuccess(true)
      const value =
        values.selectedPackage === 'basic'
          ? campaignConfig.packages.basic.suggestedTotal
          : campaignConfig.packages.advanced.suggestedTotal

      await trackEvent('generate_lead', {
        ...campaignParams(variant, lang, campaignId, landingId, landingVersion),
        currency: 'LAK',
        value,
        selected_package: values.selectedPackage,
        reward_option: values.rewardOption,
        form_id: publicFormContracts.vg5TradeOrder.formId,
        form_version: publicFormContracts.vg5TradeOrder.versionNumber,
        flow_key: publicFormContracts.vg5TradeOrder.flowKey,
      })
    } catch (err) {
      console.error('Submission error:', err)
      setError('root.serverError', {
        type: 'server',
        message: t('ui.form.errors.serverError', 'Có lỗi xảy ra khi gửi đăng ký. Vui lòng thử lại sau.')
      })
    }
  }

  function close() {
    onOpenChange(false)
    setTimeout(() => {
      setSuccess(false)
      setResultMode(null)
      reset({ selectedPackage: initialPackage, rewardOption: 'undecided', consent: false })
    }, 250)
  }

  const fieldClass =
    'mt-2 min-h-12 w-full rounded-2xl border border-emerald-950/12 bg-white px-4 text-sm text-emerald-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10'

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-emerald-950/55 backdrop-blur-sm data-[state=open]:animate-in" />
        <Dialog.Content
          className={cn(
            'fixed inset-x-3 bottom-3 z-50 max-h-[92svh] overflow-y-auto rounded-[2rem] bg-[#fbfdfb] p-5 shadow-2xl outline-none sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:max-w-2xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:p-8',
          )}
        >
          <Dialog.Close asChild>
            <button
              className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-emerald-950/5 text-emerald-950 hover:bg-emerald-950/10"
              aria-label="Đóng"
            >
              <X className="size-5" />
            </button>
          </Dialog.Close>

          {success ? (
            <div className="py-8 text-center sm:py-12">
              <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                <Check className="size-8" />
              </div>
              <Dialog.Title className="mt-6 text-3xl font-extrabold tracking-[-0.04em] text-emerald-950">
                {t('ui.form.successTitle')}
              </Dialog.Title>
              <Dialog.Description className="mx-auto mt-4 max-w-lg text-base leading-7 text-slate-600">
                {t('ui.form.successDesc')}
              </Dialog.Description>
              {resultMode === 'demo' && (
                <p className="mx-auto mt-5 max-w-md rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  {t('ui.form.demoWarning')}
                </p>
              )}
              <Button className="mt-7" size="lg" onClick={close}>
                {t('ui.form.doneBtn')}
              </Button>
            </div>
          ) : (
            <>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-emerald-700">{t('ui.form.b2bBtn')}</p>
              <Dialog.Title className="mt-2 pr-12 text-3xl font-extrabold tracking-[-0.04em] text-emerald-950">
                {t('ui.form.title')}
              </Dialog.Title>
              <Dialog.Description className="mt-3 text-sm leading-6 text-slate-600">
                {t('ui.form.desc')}
              </Dialog.Description>

              {/* Progress Indicator for UX Retention */}
              <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-emerald-100/50">
                <div 
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500 ease-out" 
                  style={{ width: `${progressPercent}%` }} 
                />
              </div>

              <form className="mt-7 grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)} noValidate>
                <Field label={t('ui.form.pharmacyName')} error={errors.pharmacyName?.message ? t(`ui.form.errors.${errors.pharmacyName.message}`) : undefined}>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                    <input className={cn(fieldClass, 'pl-11')} placeholder={t('ui.form.placeholders.pharmacyName')} {...register('pharmacyName')} />
                  </div>
                </Field>
                <Field label={t('ui.form.province')} error={errors.province?.message ? t(`ui.form.errors.${errors.province.message}`) : undefined}>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                    <input className={cn(fieldClass, 'pl-11')} placeholder={t('ui.form.placeholders.province')} {...register('province')} />
                  </div>
                </Field>
                <Field label={t('ui.form.contactName')} error={errors.contactName?.message ? t(`ui.form.errors.${errors.contactName.message}`) : undefined}>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                    <input className={cn(fieldClass, 'pl-11')} placeholder={t('ui.form.placeholders.contactName')} {...register('contactName')} />
                  </div>
                </Field>
                <Field label={`${t('ui.form.phone')} hoặc WhatsApp`} error={errors.phone?.message ? t(`ui.form.errors.${errors.phone.message}`) : undefined}>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                    <input className={cn(fieldClass, 'pl-11')} inputMode="tel" placeholder="020 ..." {...register('phone')} />
                  </div>
                </Field>

                <Field label={t('ui.form.packageLabel')} error={errors.selectedPackage?.message}>
                  <Controller
                    control={control}
                    name="selectedPackage"
                    render={({ field }) => (
                      <Select.Root value={field.value} onValueChange={field.onChange}>
                        <Select.Trigger className={cn(fieldClass, 'flex items-center justify-between')}>
                          <Select.Value />
                          <Select.Icon><ChevronDown className="size-4" /></Select.Icon>
                        </Select.Trigger>
                        <Select.Portal>
                          <Select.Content className="z-[60] overflow-hidden rounded-2xl border border-emerald-950/10 bg-white p-1 shadow-xl">
                            <Select.Viewport>
                              <Select.Item value="basic" className="cursor-pointer rounded-xl px-4 py-3 text-sm outline-none data-[highlighted]:bg-emerald-50"><Select.ItemText>{t('ui.form.basicPackage')}</Select.ItemText></Select.Item>
                              <Select.Item value="advanced" className="cursor-pointer rounded-xl px-4 py-3 text-sm outline-none data-[highlighted]:bg-emerald-50"><Select.ItemText>{t('ui.form.advancedPackage')}</Select.ItemText></Select.Item>
                            </Select.Viewport>
                          </Select.Content>
                        </Select.Portal>
                      </Select.Root>
                    )}
                  />
                </Field>

                <Field label={t('ui.form.rewardLabel')} error={errors.rewardOption?.message}>
                  <Controller
                    control={control}
                    name="rewardOption"
                    render={({ field }) => (
                      <Select.Root value={field.value} onValueChange={field.onChange}>
                        <Select.Trigger className={cn(fieldClass, 'flex items-center justify-between')}>
                          <Select.Value />
                          <Select.Icon><ChevronDown className="size-4" /></Select.Icon>
                        </Select.Trigger>
                        <Select.Portal>
                          <Select.Content className="z-[60] overflow-hidden rounded-2xl border border-emerald-950/10 bg-white p-1 shadow-xl">
                            <Select.Viewport>
                              <Select.Item value="product" className="cursor-pointer rounded-xl px-4 py-3 text-sm outline-none data-[highlighted]:bg-emerald-50"><Select.ItemText>{t('ui.form.productReward')}</Select.ItemText></Select.Item>
                              <Select.Item value="cash" className="cursor-pointer rounded-xl px-4 py-3 text-sm outline-none data-[highlighted]:bg-emerald-50"><Select.ItemText>{t('ui.form.cashReward')}</Select.ItemText></Select.Item>
                              <Select.Item value="undecided" className="cursor-pointer rounded-xl px-4 py-3 text-sm outline-none data-[highlighted]:bg-emerald-50"><Select.ItemText>{t('ui.form.adviseReward')}</Select.ItemText></Select.Item>
                            </Select.Viewport>
                          </Select.Content>
                        </Select.Portal>
                      </Select.Root>
                    )}
                  />
                </Field>

                <label className="flex cursor-pointer items-start gap-3 sm:col-span-2">
                  <input type="checkbox" className="mt-1 size-4 accent-emerald-700" {...register('consent')} />
                  <span className="text-sm leading-6 text-slate-600">
                    {t('ui.form.consentText')}
                    {errors.consent && <span className="block text-red-600">{t(`ui.form.errors.${errors.consent.message}`)}</span>}
                  </span>
                </label>

                <div className="sm:col-span-2">
                  {errors.root?.serverError && (
                    <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 shadow-sm">
                      <X className="mt-0.5 size-5 shrink-0 text-red-500" />
                      <p>{errors.root.serverError.message}</p>
                    </div>
                  )}
                  <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <LoaderCircle className="size-5 animate-spin" /> : <Send className="size-5" />}
                    {t('ui.form.submitBtn')}
                  </Button>
                </div>
              </form>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="text-sm font-bold text-emerald-950">
      {label}
      {children}
      {error && <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>}
    </label>
  )
}
