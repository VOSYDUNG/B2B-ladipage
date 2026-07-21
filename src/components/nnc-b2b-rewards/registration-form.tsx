import { useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, Building2, Check, LoaderCircle, MapPin, Phone, Sparkles, Tag, UserRound } from 'lucide-react';
import { isValidNncPhone, NNC_PRODUCTS } from '@/config/nnc-b2b-rewards';

export interface NncRegistrationValues {
  fullName: string;
  phone: string;
  businessName: string;
  role: string;
  referralCodeUsed: string;
  preferredContact: 'whatsapp' | 'phone' | 'other';
}

interface RegistrationFormProps {
  referralCodeFromUrl: string;
  onRegistered: (values: NncRegistrationValues) => Promise<void>;
  onWhatsAppFallback: (values: NncRegistrationValues) => void;
  onFormStart?: () => void;
  interestedProductIds: string[];
  toggleProductInterest: (productId: string) => void;
}

export function RegistrationForm({ referralCodeFromUrl, onRegistered, onWhatsAppFallback, onFormStart, interestedProductIds, toggleProductInterest }: RegistrationFormProps) {
  const { i18n } = useTranslation();
  const isLao = i18n.language === 'lo';
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const sectionInView = useInView(sectionRef, { amount: 0.12 });
  const formStarted = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const schema = useMemo(() => z.object({
    fullName: z.string().trim().min(2, isLao ? 'ກະລຸນາປ້ອນຊື່.' : 'Vui lòng nhập họ tên.').max(160),
    phone: z.string().trim().max(24).refine(isValidNncPhone, isLao ? 'ກະລຸນາກວດເບີໂທ.' : 'Vui lòng nhập số điện thoại có 8–15 chữ số.'),
    businessName: z.string().trim().min(2, isLao ? 'ກະລຸນາປ້ອນຊື່ຫົວໜ່ວຍ.' : 'Vui lòng nhập tên đơn vị.').max(160),
    role: z.string().trim().min(2, isLao ? 'ກະລຸນາເລືອກບົດບາດ.' : 'Vui lòng chọn vai trò.').max(100),
    referralCodeUsed: z.string().trim().max(80, isLao ? 'ລະຫັດຍາວເກີນໄປ.' : 'Mã giới thiệu quá dài.').optional(),
    preferredContact: z.enum(['whatsapp', 'phone', 'other']),
    consent: z.literal(true, { error: isLao ? 'ກະລຸນາຢືນຢັນການຕິດຕໍ່.' : 'Vui lòng đồng ý để NNC liên hệ.' })
  }), [isLao]);

  type FormValues = z.infer<typeof schema>;
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      phone: '',
      businessName: '',
      role: '',
      referralCodeUsed: referralCodeFromUrl,
      preferredContact: 'whatsapp',
      consent: false
    }
  });

  const onSubmit = async (values: FormValues) => {
    if (submitting) return;
    setSubmitError('');
    setSubmitting(true);
    const normalizedValues: NncRegistrationValues = {
      fullName: values.fullName.trim(),
      phone: values.phone.trim(),
      businessName: values.businessName.trim(),
      role: values.role.trim(),
      referralCodeUsed: values.referralCodeUsed?.trim() ?? '',
      preferredContact: values.preferredContact
    };
    try {
      await onRegistered(normalizedValues);
    } catch (cause) {
      console.error('NNC participant submission failed', cause);
      onWhatsAppFallback(normalizedValues);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormFocus = () => {
    if (formStarted.current) return;
    formStarted.current = true;
    onFormStart?.();
  };

  return (
    <section ref={sectionRef} id="registration" data-analytics-section="registration" data-section-order="6" className="relative overflow-hidden bg-[#f4f8f6] py-12 sm:py-14">
      <motion.div
        aria-hidden="true"
        animate={sectionInView && !reduceMotion ? { scale: [1.02, 1.065, 1.02], x: ['0%', '-1.2%', '0%'] } : { scale: 1.02, x: '0%' }}
        transition={{ duration: 22, repeat: sectionInView && !reduceMotion ? Number.POSITIVE_INFINITY : 0, ease: 'easeInOut' }}
        className="pointer-events-none absolute -inset-[5%] opacity-55"
      >
        <picture className="absolute inset-0">
          <source type="image/avif" srcSet="/assets/nnc-b2b-rewards/visual/ambient-journey-glass-orbits-v1.avif" />
          <source type="image/webp" srcSet="/assets/nnc-b2b-rewards/visual/ambient-journey-glass-orbits-v1.webp" />
          <img src="/assets/nnc-b2b-rewards/visual/ambient-journey-glass-orbits-v1-source.png" width="1983" height="793" alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
        </picture>
      </motion.div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#f4f8f6]/96 via-[#f4f8f6]/78 to-[#edf8f2]/92" />
      <div className="relative mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:items-start lg:gap-8 lg:px-8">
        <motion.div initial={{ opacity: 0, x: reduceMotion ? 0 : -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: reduceMotion ? 0.12 : 0.52, ease: [0.22, 1, 0.36, 1] }} className="lg:sticky lg:top-28">
          <span className={`inline-flex items-center gap-2 text-xs font-extrabold text-emerald-700 ${isLao ? 'tracking-normal' : 'uppercase tracking-[0.2em]'}`}><span className="h-px w-8 bg-emerald-600" />{isLao ? 'ຂັ້ນຕອນບັນທຶກຂໍ້ມູນ' : 'Bước lưu thông tin tham gia'}</span>
          <h2 className={`mt-3 text-balance text-3xl font-black text-[#102a24] sm:text-4xl ${isLao ? 'tracking-normal' : 'tracking-[-0.04em]'}`}>
            {isLao ? 'ໃຫ້ NNC ເຂົ້າໃຈຄວາມຕ້ອງການຂອງທ່ານ' : 'Giúp NNC hiểu đúng nhu cầu của anh/chị'}
          </h2>
          <p className="mt-5 max-w-lg text-sm font-medium leading-7 text-slate-600">
            {isLao ? 'ຂໍ້ມູນນີ້ໃຊ້ເພື່ອ NNC ຕິດຕໍ່ສະໜັບສະໜູນນະໂຍບາຍຂາຍສົ່ງ ແລະ ຄວາມສົນໃຈທີ່ທ່ານເລືອກ.' : 'Thông tin được dùng để NNC liên hệ hỗ trợ chính sách sỉ và nhu cầu anh/chị vừa chọn.'}
          </p>
          <motion.div role="list" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.65 }} variants={{ hidden: {}, visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.06 } } }} className="relative mt-7 space-y-3">
            <span aria-hidden="true" className="absolute bottom-5 left-[0.8rem] top-5 w-px bg-emerald-950/10" />
            <motion.span aria-hidden="true" initial={{ scaleY: 0 }} whileInView={{ scaleY: 0.52 }} viewport={{ once: true, amount: 0.65 }} transition={{ duration: reduceMotion ? 0.08 : 0.5, ease: [0.22, 1, 0.36, 1] }} className="absolute bottom-5 left-[0.8rem] top-5 w-px origin-top bg-gradient-to-b from-emerald-500 to-amber-400 shadow-[0_0_10px_rgba(16,185,129,.3)]" />
            {[
              isLao ? 'ສຳເລັດ 4/5 ຂັ້ນຕອນແລ້ວ' : 'Anh/chị đã hoàn thành 4/5 bước',
              isLao ? 'ຂໍ້ມູນໃຊ້ເພື່ອຊ່ວຍເຫຼືອຄວາມຕ້ອງການທີ່ເລືອກ' : 'Thông tin chỉ dùng để NNC hỗ trợ nhu cầu đã chọn',
              isLao ? 'ຢືນຢັນຂໍ້ມູນເພື່ອເປີດວົງສິດທິ' : 'Chỉ còn xác nhận thông tin để mở vòng quay'
            ].map((item, index) => (
              <motion.div role="listitem" key={item} variants={{ hidden: { opacity: 0, x: reduceMotion ? 0 : -8 }, visible: { opacity: 1, x: 0 } }} transition={{ duration: reduceMotion ? 0.08 : 0.28 }} className="relative z-10 flex items-start gap-3 text-xs font-bold leading-5 text-slate-600">
                <motion.span
                  aria-hidden="true"
                  animate={index === 1 && sectionInView && !reduceMotion ? { boxShadow: ['0 0 0 0 rgba(245,158,11,.25)', '0 0 0 7px rgba(245,158,11,0)', '0 0 0 0 rgba(245,158,11,0)'] } : { boxShadow: '0 0 0 0 rgba(245,158,11,0)' }}
                  transition={{ duration: 1.8, repeat: index === 1 && sectionInView && !reduceMotion ? Number.POSITIVE_INFINITY : 0, ease: 'easeOut' }}
                  className={`grid h-[1.65rem] w-[1.65rem] shrink-0 place-items-center rounded-full border ${index === 0 ? 'border-emerald-500 bg-emerald-500 text-white' : index === 1 ? 'border-amber-400 bg-amber-100 text-amber-800' : 'border-emerald-950/10 bg-white text-slate-400'}`}
                >
                  {index === 0 ? <Check className="h-3.5 w-3.5" /> : <span className="font-mono text-[9px] font-black">0{index + 1}</span>}
                </motion.span>
                <span className="pt-0.5">{item}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.form initial={{ opacity: 0, y: reduceMotion ? 0 : 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: reduceMotion ? 0.12 : 0.55, delay: reduceMotion ? 0 : 0.06, ease: [0.22, 1, 0.36, 1] }} onSubmit={handleSubmit(onSubmit)} onFocusCapture={handleFormFocus} className="relative overflow-hidden rounded-xl border border-emerald-950/8 bg-white p-5 shadow-[0_30px_100px_-55px_rgba(16,62,50,0.55)] sm:p-6" noValidate>
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-300 to-amber-300" />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field fieldId="nnc-full-name" icon={UserRound} label={isLao ? 'ຊື່ຜູ້ຕິດຕໍ່' : 'Họ tên người liên hệ'} error={errors.fullName?.message} reduceMotion={Boolean(reduceMotion)} delay={0}>
              <input id="nnc-full-name" maxLength={160} autoComplete="name" aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? 'nnc-full-name-error' : undefined} {...register('fullName')} placeholder={isLao ? 'ຊື່ ແລະ ນາມສະກຸນ' : 'Nguyễn Văn A'} className={inputClass(Boolean(errors.fullName))} />
            </Field>
            <Field fieldId="nnc-phone" icon={Phone} label={isLao ? 'ເບີໂທລະສັບ' : 'Số điện thoại'} error={errors.phone?.message} reduceMotion={Boolean(reduceMotion)} delay={0.035}>
              <input id="nnc-phone" type="tel" inputMode="tel" maxLength={24} autoComplete="tel" aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'nnc-phone-error' : undefined} {...register('phone')} placeholder="020 9980 6327" className={inputClass(Boolean(errors.phone))} />
            </Field>
            <Field fieldId="nnc-business" icon={Building2} label={isLao ? 'ຮ້ານ / ຄລີນິກ / ຫົວໜ່ວຍ' : 'Nhà thuốc / Phòng khám / Đơn vị'} error={errors.businessName?.message} reduceMotion={Boolean(reduceMotion)} delay={0.07} wide>
              <input id="nnc-business" maxLength={160} autoComplete="organization" aria-invalid={Boolean(errors.businessName)} aria-describedby={errors.businessName ? 'nnc-business-error' : undefined} {...register('businessName')} placeholder={isLao ? 'ຊື່ຫົວໜ່ວຍ' : 'Tên đơn vị'} className={inputClass(Boolean(errors.businessName))} />
            </Field>
            <Field fieldId="nnc-role" icon={UserRound} label={isLao ? 'ບົດບາດ / ຕຳແໜ່ງ' : 'Vai trò / Đối tác'} error={errors.role?.message} reduceMotion={Boolean(reduceMotion)} delay={0.105}>
              <select id="nnc-role" aria-invalid={Boolean(errors.role)} aria-describedby={errors.role ? 'nnc-role-error' : undefined} {...register('role')} className={inputClass(Boolean(errors.role))}>
                <option value="">{isLao ? '-- ເລືອກບົດບາດ --' : '-- Chọn vai trò --'}</option>
                <option value="doctor">{isLao ? 'ທ່ານໝໍ (Bác sĩ)' : 'Bác sĩ'}</option>
                <option value="clinic">{isLao ? 'ຄລີນິກ (Phòng khám)' : 'Phòng khám'}</option>
                <option value="pharmacy">{isLao ? 'ຮ້ានຂາຍຢາ (Nhà thuốc)' : 'Nhà thuốc'}</option>
                <option value="agent">{isLao ? 'ຕົວແທນຈໍາຫນ່າຍ (Đại lý)' : 'Đại lý'}</option>
                <option value="other">{isLao ? 'ອື່ນໆ (Khác)' : 'Khác'}</option>
              </select>
            </Field>
            <Field fieldId="nnc-referral" icon={Tag} label={isLao ? 'ລະຫັດແນະນຳ (ຖ້າມີ)' : 'Mã giới thiệu (nếu có)'} error={errors.referralCodeUsed?.message} reduceMotion={Boolean(reduceMotion)} delay={0.14}>
              <input id="nnc-referral" maxLength={80} readOnly={Boolean(referralCodeFromUrl) || submitting} aria-invalid={Boolean(errors.referralCodeUsed)} aria-describedby={`${errors.referralCodeUsed ? 'nnc-referral-error ' : ''}nnc-referral-hint`} {...register('referralCodeUsed')} placeholder="NNC-…" className={`${inputClass(Boolean(errors.referralCodeUsed))} ${referralCodeFromUrl || submitting ? 'cursor-not-allowed bg-slate-100' : ''}`} />
            </Field>
          </div>
          <p id="nnc-referral-hint" className="mt-2 text-[11px] font-semibold leading-5 text-slate-500">{isLao ? 'NNC ຈະກວດສອບລະຫັດກ່ອນບັນທຶກ; ລະຫັດບໍ່ໄດ້ຢືນຢັນສິດທິໂດຍອັດຕະໂນມັດ.' : 'Mã giới thiệu sẽ được NNC đối chiếu; mã không tự động xác nhận quyền lợi.'}</p>

          <fieldset className="mt-6">
            <legend className="text-xs font-black uppercase tracking-[0.13em] text-slate-500">{isLao ? 'ຊ່ອງທາງຕິດຕໍ່ທີ່ສະດວກ' : 'Kênh liên hệ ưu tiên'}</legend>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[['whatsapp', 'WhatsApp'], ['phone', isLao ? 'ໂທ' : 'Gọi điện'], ['other', isLao ? 'ອື່ນໆ' : 'Khác']].map(([value, label]) => (
                <label key={value} className="relative cursor-pointer">
                  <input type="radio" value={value} {...register('preferredContact')} className="peer sr-only" />
                  <motion.span whileTap={reduceMotion ? undefined : { scale: 0.97 }} className="flex min-h-12 items-center justify-center rounded-xl border border-slate-200 px-2 text-xs font-bold text-slate-600 transition peer-checked:border-emerald-600 peer-checked:bg-emerald-50 peer-checked:text-emerald-800 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-500">{label}</motion.span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-6 sm:col-span-2">
            <div className="rounded-2xl border border-emerald-950/10 bg-gradient-to-b from-emerald-50/50 to-white p-5 sm:p-6">
              <div className="mb-4 text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-emerald-800">
                  <Sparkles className="h-3 w-3" /> {isLao ? 'ລາຍການສິນຄ້າ' : 'DANH MỤC SẢN PHẨM'}
                </span>
                <h3 className="mt-3 text-lg font-black text-[#102a24]">
                  {isLao ? '7 ຜະລິດຕະພັນຍຸດທະສາດ Q3' : '7 sản phẩm chiến lược Q3'}
                </h3>
                <p className="mt-2 text-[11px] font-medium leading-5 text-slate-500">
                  {isLao ? 'ເລືອກຜະລິດຕະພັນທີ່ທ່ານສົນໃຈເພື່ອໃຫ້ NNC ໃຫ້ຄຳປຶກສາໄດ້ດີທີ່ສຸດ (ເລືອກໄດ້ຫຼາຍ).' : 'Chạm chọn các sản phẩm anh/chị quan tâm để NNC tư vấn chính sách tốt nhất.'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {NNC_PRODUCTS.map((product) => {
                  const selected = interestedProductIds.includes(product.product_id);
                  return (
                    <button
                      key={product.product_id}
                      type="button"
                      onClick={() => toggleProductInterest(product.product_id)}
                      className={`group relative flex cursor-pointer flex-col items-center justify-between overflow-hidden rounded-xl border p-3 text-center transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                        selected
                          ? 'border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-900/10'
                          : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full border transition-colors ${selected ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 bg-slate-100 text-transparent'}`}>
                        <Check className="h-3 w-3" />
                      </div>
                      <img
                        src={product.packshot_url}
                        alt=""
                        loading="lazy"
                        className={`h-20 w-auto object-contain transition-transform duration-300 ${selected ? 'scale-110 drop-shadow-md' : 'group-hover:scale-105'}`}
                      />
                      <span className={`mt-3 text-[10px] font-bold leading-tight ${selected ? 'text-emerald-900' : 'text-slate-600'}`}>
                        {product.canonical_name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 sm:col-span-2">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.13em] text-slate-500">
              {isLao ? 'ນະໂຍບາຍໂຄງການ' : 'Chi tiết chính sách & cơ chế tích lũy'}
            </span>
            <div className="overflow-hidden rounded-2xl border border-emerald-950/10 shadow-sm">
              <img 
                src="/assets/nnc-b2b-rewards/pdf-pages/page-1.jpg" 
                alt="Program Rules" 
                className="w-full h-auto block"
                loading="lazy"
              />
            </div>
          </div>

          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 transition-colors hover:bg-emerald-50 sm:col-span-2">
            <input type="checkbox" aria-invalid={Boolean(errors.consent)} aria-describedby={errors.consent ? 'nnc-consent-error' : undefined} {...register('consent')} className="mt-0.5 h-5 w-5 rounded border-emerald-300 accent-emerald-600 focus:ring-emerald-500" />
            <span className="text-xs font-semibold leading-5 text-emerald-900">
              {isLao 
                ? 'ຂ້ອຍເຂົ້າໃຈໂຄງການ ແລະ ຍິນຍອມໃຫ້ NNC ບັນທຶກຂໍ້ມູນເຂົ້າຮ່ວມ, ພ້ອມຕິດຕໍ່ເພື່ອໃຫ້ຄຳປຶກສາ.' 
                : 'Tôi đã hiểu rõ chương trình và cơ chế tích lũy. Tôi đồng ý để NNC ghi nhận thông tin tham gia và liên hệ theo kênh tôi chọn để tư vấn sản phẩm, chính sách sỉ và hỗ trợ đặt hàng.'}
            </span>
          </label>
          <AnimatePresence initial={false}>
            {errors.consent && <motion.p id="nnc-consent-error" initial={{ opacity: 0, y: reduceMotion ? 0 : -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0.08 : 0.18 }} className="mt-2 text-xs font-bold text-rose-600">{errors.consent.message}</motion.p>}
          </AnimatePresence>

          <AnimatePresence initial={false}>
            {submitError && <motion.p role="alert" initial={{ opacity: 0, y: reduceMotion ? 0 : -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0.08 : 0.2 }} className="mt-4 rounded-xl bg-rose-50 p-4 text-xs font-bold leading-5 text-rose-700">{submitError}</motion.p>}
          </AnimatePresence>

          <motion.button type="submit" disabled={submitting} whileHover={submitting || reduceMotion ? undefined : { y: -1 }} whileTap={submitting || reduceMotion ? undefined : { scale: 0.985 }} className="mt-6 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-[#103e32] px-6 text-sm font-black text-white shadow-lg shadow-emerald-950/15 transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
            {submitting ? <LoaderCircle className="h-5 w-5 animate-spin motion-reduce:animate-none" /> : <Check className="h-5 w-5" />}
            {submitting ? (isLao ? 'ກຳລັງບັນທຶກ…' : 'Đang lưu thông tin…') : (isLao ? 'ບັນທຶກ ແລະ ສືບຕໍ່' : 'Lưu thông tin & tiếp tục')}
            {!submitting && <ArrowRight className="h-4 w-4" />}
          </motion.button>
        </motion.form>
      </div>
    </section>
  );
}

function inputClass(invalid: boolean) {
  return `h-13 w-full rounded-xl border bg-slate-50 px-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-300 focus:bg-white focus:ring-4 ${invalid ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100'}`;
}

function Field({ fieldId, icon: Icon, label, error, wide, reduceMotion, delay, children }: { fieldId: string; icon: typeof UserRound; label: string; error?: string; wide?: boolean; reduceMotion: boolean; delay: number; children: ReactNode }) {
  return (
    <motion.label initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.7 }} transition={{ duration: reduceMotion ? 0.08 : 0.25, delay: reduceMotion ? 0 : delay }} className={wide ? 'sm:col-span-2' : ''}>
      <span className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.13em] text-slate-500"><Icon className="h-3.5 w-3.5 text-emerald-700" />{label}</span>
      {children}
      <AnimatePresence initial={false}>
        {error && <motion.span id={`${fieldId}-error`} initial={{ opacity: 0, y: reduceMotion ? 0 : -3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0.08 : 0.16 }} className="mt-1.5 block text-xs font-bold text-rose-600">{error}</motion.span>}
      </AnimatePresence>
    </motion.label>
  );
}
