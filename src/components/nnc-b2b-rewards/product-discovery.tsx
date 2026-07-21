import { useCallback, useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import useEmblaCarousel from 'embla-carousel-react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, Info, Plus, X } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { NNC_PRODUCTS, type NncProduct } from '@/config/nnc-b2b-rewards';

interface ProductDiscoveryProps {
  interestedProductIds: string[];
  toggleInterest: (productId: string) => void;
  onWhatsAppInquire: (product: NncProduct) => void;
  onProductView?: (productId: string) => void;
}

const kip = new Intl.NumberFormat('en-US');

const getProductB2BBadge = (productId: string, isLao: boolean) => {
  const badges: Record<string, { vi: string, lo: string }> = {
    'tadimax': { vi: 'Best-Seller · Lợi nhuận sỉ tốt', lo: 'ຂາຍດີທີ່ສຸດ · ກຳໄລດີ' },
    'bai-thach': { vi: 'Thảo dược bán chạy nhất', lo: 'ສະໝຸນໄພຂາຍດີທີ່ສຸດ' },
    'cv-mox-1000': { vi: 'Kháng sinh chủ lực phòng khám', lo: 'ຢາຕ້ານເຊື້ອຫຼັກ' },
    'nc-cv-mox-625': { vi: 'Biên lợi nhuận cao', lo: 'ກຳໄລສູງ' },
    'cv-mox-228.5': { vi: 'Dễ kê đơn · Phổ biến trẻ em', lo: 'ສຳລັບເດັກນ້ອຍ · ຍອດນິຍົມ' },
    'cefixad-100mg': { vi: 'Kháng sinh phổ rộng bán chạy', lo: 'ຢາຕ́ານເຊື້ອຂາຍດີ' },
    'azihadi': { vi: 'Kê đơn ngắn ngày hiệu quả', lo: 'ໃຊ້ໄລຍະສັ້ນມີປະສິດທິຜົນ' },
  };
  return badges[productId] ? (isLao ? badges[productId].lo : badges[productId].vi) : '';
};

const getProductCommercialDescription = (productId: string, isLao: boolean) => {
  const descriptions: Record<string, { vi: string, lo: string }> = {
    'tadimax': { 
      vi: 'Dòng sản phẩm thảo dược hỗ trợ điều trị phì đại lành tính tuyến tiền liệt có tỷ lệ quay vòng kê đơn cao nhất tại thị trường Lào. Mang lại doanh số ổn định và biên lợi nhuận sỉ cực tốt cho nhà thuốc.',
      lo: 'ຜະລິດຕະພັນສະໝຸນໄພຊ່ວຍປິ່ນປົວຕ່ອມລູກໝາກໃຫຍ່ທີ່ມີອັດຕາການໝູນວຽນສັ່ງຊື້ສູງສຸດໃນຕະຫຼາດລາວ. ຊ່ວຍໃຫ້ຮ້ານຢາມີຍອດຂາຍຄົງທີ່ ແລະກຳໄລດີ.'
    },
    'bai-thach': { 
      vi: 'Thảo dược hỗ trợ điều trị sỏi thận, sỏi mật nổi tiếng của NNC Pharma. Sản phẩm thông dụng, dễ tư vấn, được các phòng khám và nhà thuốc tin dùng nhờ hiệu quả lâm sàng vượt trội và tỷ lệ giữ chân khách hàng cao.',
      lo: 'ສະໝຸນໄພຊ່ວຍປິ່ນປົວນິ້ວໃນໝາກໄຂ່ຫຼັງ, ນິ້ວໃນຖົງນ້ຳບີທີ່ມີຊື່ສຽງຂອງ NNC Pharma. ຜະລິດຕະພັນທີ່ໃຊ້ງ່າຍ, ແນະນຳງ່າຍ, ໄດ້ຮັບຄວາມໄວ້ວາງໃຈຈາກຄລີນິກ ແລະຮ້ານຢາ.'
    },
    'cv-mox-1000': { 
      vi: 'Kháng sinh kết hợp Amoxicillin và Acid Clavulanic hàm lượng cao 1000mg. Là mặt hàng bắt buộc phải có tại tủ thuốc của phòng khám, giúp hỗ trợ điều trị hiệu quả các nhiễm khuẩn hô hấp, tiết niệu.',
      lo: 'ຢາຕ້ານເຊື້ອປະສົມ Amoxicillin ແລະ Acid Clavulanic ປະລິມານສູງ 1000mg. ເປັນສິນຄ້າທີ່ຈຳເປັນຕ້ອງມີໃນຕູ້ຢາຂອງຄລີນິກ, ຊ່ວຍປິ່ນປົວການຕິດເຊື້ອທາງເດີນຫາຍໃຈ.'
    },
    'nc-cv-mox-625': { 
      vi: 'Kháng sinh phối hợp tiêu chuẩn tỷ lệ vàng 500mg/125mg dạng hộp lớn 100 viên. Phù hợp cho đơn thuốc dài ngày tại phòng khám, mang lại biên lợi nhuận sỉ tích lũy cực lớn cho đối tác nhập số lượng lớn.',
      lo: 'ຢາຕ້ານເຊື້ອປະສົມມາດຕະຖານອັດຕາຄຳ 500mg/125mg ແບບກ່ອງໃຫຍ່ 100 ເມັດ. ເໝາະສຳລັບການຈັດຢາໄລຍະສັ້ນ ແລະຍາວໃນຄລີນິກ, ໃຫ້ກຳໄລສະສົມສູງ.'
    },
    'cv-mox-228.5': { 
      vi: 'Kháng sinh dạng cốm pha hỗn dịch uống cho trẻ em vị ngọt dễ uống, chai 60ml tiêu chuẩn. Sản phẩm đặc biệt dễ kê đơn cho đối tượng nhi khoa, là SKU thu hút lượt mua lặp lại thường xuyên tại nhà thuốc.',
      lo: 'ຢາຕ້ານເຊື້ອແບບຜົງປະສົມນ້ຳດື່ມສຳລັບເດັກນ້ອຍ ຣົດຊາດຫວານດື່ມງ່າຍ, ຂວດ 60ml ມາດຕະຖານ. ຜະລິດຕະພັນທີ່ແນະນຳງ່າຍສຳລັບເດັກນ້ອຍ, ຊ່ວຍດຶງດູດລູກຄ້າກັບມາຊື້ຊ້ຳ.'
    },
    'cefixad-100mg': { 
      vi: 'Hỗn dịch kháng sinh Cefixime 100mg/5ml chai 30ml vị ngọt tự nhiên, lựa chọn hàng đầu cho các bệnh lý nhiễm khuẩn tai mũi họng nhi khoa. Sản phẩm có hạn dùng dài, lưu kho an toàn.',
      lo: 'ຢາຕ້ານເຊື້ອ Cefixime 100mg/5ml ຂວດ 30ml ຣົດຊາດຫວານທຳມະຊາດ, ທາງເລືອກທຳອິດສຳລັບການຕິດເຊື້ອຫູ ຄໍ ດັງ ໃນເດັກນ້ອຍ. ຜະລິດຕະພັນມີອາຍຸການໃຊ້ງານຍາວ, ເກັບຮັກສາປອດໄພ.'
    },
    'azihadi': { 
      vi: 'Kháng sinh thế hệ mới Azithromycin 200mg/5ml dạng hỗn dịch chai 30ml. Liệu trình kê đơn ngắn ngày (chỉ 3-5 ngày), hiệu quả nhanh chóng giúp gia tăng uy tín điều trị của bác sĩ/phòng khám.',
      lo: 'ຢາຕ້ານເຊື້ອລຸ້ນໃໝ່ Azithromycin 200mg/5ml ແບບນ້ຳຂວດ 30ml. ໄລຍະເວລາການໃຊ້ຢາສັ້ນ (ພຽງ 3-5 ວັນ), ເຫັນຜົນໄວ ຊ່ວຍເພີ່ມຄວາມໜ້າເຊື່ອຖືໃນການປິ່ນປົວ.'
    },
  };
  return descriptions[productId] ? (isLao ? descriptions[productId].lo : descriptions[productId].vi) : '';
};

export function ProductDiscovery({
  interestedProductIds,
  toggleInterest,
  onWhatsAppInquire,
  onProductView
}: ProductDiscoveryProps) {
  const { i18n } = useTranslation();
  const isLao = i18n.language === 'lo';
  const reduceMotion = useReducedMotion();
  const [selectedProduct, setSelectedProduct] = useState<NncProduct | null>(null);
  const [visibleRange, setVisibleRange] = useState({ first: 0, last: 0 });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    skipSnaps: false,
    slidesToScroll: 1,
    loop: false
  });

  const syncIndex = useCallback(() => {
    if (!emblaApi) return;
    const visibleSlides = emblaApi.slidesInView().sort((a, b) => a - b);
    const fallbackIndex = emblaApi.selectedScrollSnap();
    setVisibleRange({
      first: visibleSlides.at(0) ?? fallbackIndex,
      last: visibleSlides.at(-1) ?? fallbackIndex
    });
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    syncIndex();
    emblaApi.on('select', syncIndex);
    emblaApi.on('reInit', syncIndex);
    emblaApi.on('slidesInView', syncIndex);
    return () => {
      emblaApi.off('select', syncIndex);
      emblaApi.off('reInit', syncIndex);
      emblaApi.off('slidesInView', syncIndex);
    };
  }, [emblaApi, syncIndex]);

  const openProduct = (product: NncProduct) => {
    setSelectedProduct(product);
    onProductView?.(product.product_id);
  };

  return (
    <section id="products" data-analytics-section="products" data-section-order="3" className="relative overflow-hidden bg-[#f7faf8] py-12 sm:py-14">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: reduceMotion ? 0.12 : 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end"
        >
          <div className="max-w-3xl">
            <span className="mb-2 inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-emerald-700">
              <span className="h-px w-6 bg-emerald-600" />
              {isLao ? 'ຜະລິດຕະພັນໃນໂຄງການ' : 'Danh mục chính thức'}
            </span>
            <h2 className={`text-balance text-3xl font-black text-[#102a24] sm:text-4xl ${isLao ? 'tracking-normal' : 'tracking-[-0.035em]'}`}>
              {isLao ? '7 ຜະລິດຕະພັນ · ສະສົມຍອດຮ່ວມກັນ' : '7 sản phẩm · một hành trình tích lũy chung'}
            </h2>
            <p className="mt-3 max-w-2xl text-xs font-medium leading-6 text-slate-600 sm:text-sm">
              {isLao
                ? 'ຍອດຊື້ຈາກທັງ 7 ຜະລິດຕະພັນຖືກລວມສະສົມຕະຫຼອດໄລຍະໂຄງການ.'
                : 'Doanh số từ cả 7 sản phẩm được cộng dồn trong suốt chương trình, không tính riêng từng sản phẩm.'}
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: reduceMotion ? 0 : 18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: reduceMotion ? 0.12 : 0.4, delay: reduceMotion ? 0 : 0.12 }}
            className="flex items-center gap-3 lg:hidden"
          >
            <span aria-live="polite" className="mr-2 font-mono text-xs font-bold text-slate-500">
              {String(visibleRange.first + 1).padStart(2, '0')}
              {visibleRange.last > visibleRange.first ? `–${String(visibleRange.last + 1).padStart(2, '0')}` : ''}
              {' / '}{String(NNC_PRODUCTS.length).padStart(2, '0')}
            </span>
            <motion.button type="button" onClick={() => emblaApi?.scrollPrev()} disabled={!canScrollPrev} whileTap={reduceMotion ? undefined : { scale: 0.92 }} aria-controls="nnc-products-carousel" aria-label={isLao ? 'ກັບຄືນ' : 'Sản phẩm trước'} className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-emerald-600 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
              <ArrowLeft className="h-4 w-4" />
            </motion.button>
            <motion.button type="button" onClick={() => emblaApi?.scrollNext()} disabled={!canScrollNext} whileTap={reduceMotion ? undefined : { scale: 0.92 }} aria-controls="nnc-products-carousel" aria-label={isLao ? 'ຕໍ່ໄປ' : 'Sản phẩm tiếp theo'} className="grid h-9 w-9 place-items-center rounded-full bg-[#103e32] text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </motion.div>
        </motion.div>

        <motion.div
          ref={emblaRef}
          id="nnc-products-carousel"
          role="region"
          aria-roledescription="carousel"
          aria-label={isLao ? '7 ຜະລິດຕະພັນ' : '7 sản phẩm trong chương trình'}
          initial={{ opacity: 0, y: reduceMotion ? 0 : 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: reduceMotion ? 0.12 : 0.55, delay: reduceMotion ? 0 : 0.08 }}
          className="overflow-hidden pb-4 pt-1 lg:overflow-visible"
        >
          <div className="-ml-4 flex touch-pan-y lg:ml-0 lg:grid lg:grid-cols-4 lg:gap-4">
            {NNC_PRODUCTS.map((product, index) => {
              const interested = interestedProductIds.includes(product.product_id);
              return (
                <motion.div
                  key={product.product_id}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${index + 1} / ${NNC_PRODUCTS.length}: ${product.canonical_name}`}
                  initial={{ opacity: 0, x: reduceMotion ? 0 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: reduceMotion ? 0.1 : 0.38, delay: reduceMotion ? 0 : Math.min(index * 0.045, 0.18) }}
                  className="min-w-0 flex-[0_0_100%] pl-4 sm:flex-[0_0_50%] lg:block lg:pl-0"
                >
                  <motion.article
                    data-selected={interested || undefined}
                    whileHover={reduceMotion ? undefined : { y: -7, scale: 1.006 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className={`group flex h-full min-h-[380px] flex-col overflow-hidden rounded-xl border transition-[border-color,background-color,box-shadow] duration-300 active:shadow-[0_16px_35px_-26px_rgba(16,62,50,0.5)] ${interested ? 'border-emerald-400 bg-gradient-to-b from-emerald-50/55 via-white to-white shadow-[0_24px_65px_-34px_rgba(5,150,105,0.55)] ring-1 ring-inset ring-emerald-200/70' : 'border-emerald-950/8 bg-white shadow-[0_20px_70px_-45px_rgba(16,62,50,0.45)] hover:border-emerald-200 hover:shadow-[0_28px_75px_-38px_rgba(16,62,50,0.55)]'}`}
                  >
                    <motion.button type="button" onClick={() => openProduct(product)} whileTap={reduceMotion ? undefined : { scale: 0.985 }} className="relative flex h-52 w-full touch-manipulation items-center justify-center overflow-hidden bg-gradient-to-br from-white via-white to-emerald-50/70 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500 lg:h-44">
                      <picture className="absolute inset-0">
                        <source type="image/avif" srcSet={`${product.scene_asset_stem}.avif`} />
                        <source type="image/webp" srcSet={`${product.scene_asset_stem}.webp`} />
                        <img src={`${product.scene_asset_stem}.png`} width="1024" height="1024" alt={product.canonical_name} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03] group-active:scale-[1.015] motion-reduce:transform-none motion-reduce:transition-none" />
                      </picture>
                      <span className={`pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.72),transparent_52%)] transition-opacity duration-500 ${interested ? 'opacity-70' : 'opacity-0 group-hover:opacity-60 group-active:opacity-40'}`} aria-hidden="true" />
                      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#071913]/35 to-transparent" />
                      <span className="absolute left-5 top-5 rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-600 backdrop-blur">
                        {product.category === 'Herbal' ? (isLao ? 'ສະໝຸນໄພ' : 'Thảo dược') : (isLao ? 'ຢາຕ້ານເຊື້ອ' : 'Kháng sinh')}
                      </span>
                      {getProductB2BBadge(product.product_id, isLao) && (
                        <span className="absolute left-5 bottom-4 rounded-lg bg-amber-400 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-900 shadow-sm animate-pulse">
                          {getProductB2BBadge(product.product_id, isLao)}
                        </span>
                      )}
                      <span className="absolute right-5 top-5 rounded-full bg-white/80 px-2 py-1 font-mono text-xs font-bold text-slate-500 backdrop-blur">{String(index + 1).padStart(2, '0')}</span>
                    </motion.button>
                    <div className="flex flex-1 flex-col p-4.5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-black tracking-tight text-[#102a24]">{product.canonical_name}</h3>
                          <p lang="vi" className="mt-1 text-[10px] font-bold leading-4 text-slate-500">{product.pack_size}</p>
                          <p lang={product.source_status === 'source_locked' ? 'vi' : undefined} className={`mt-0.5 min-h-4 text-[9px] font-semibold leading-4 ${product.source_status === 'source_locked' ? 'text-slate-400' : 'text-amber-700'}`}>{product.source_status === 'source_locked' ? product.formulation : (isLao ? 'ລໍ NNC ກວດສອບ' : 'Chờ NNC đối soát')}</p>
                        </div>
                        <motion.button type="button" onClick={() => openProduct(product)} whileTap={reduceMotion ? undefined : { scale: 0.9 }} aria-label={`${isLao ? 'ເບິ່ງ' : 'Xem'} ${product.canonical_name}`} className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full border border-slate-200 px-2.5 text-[9px] font-black text-slate-500 transition hover:border-emerald-600 hover:text-emerald-700">
                          <Info className="h-4 w-4" />
                          {isLao ? 'ເບິ່ງ' : 'Xem nhanh'}
                        </motion.button>
                      </div>
                      <div className="mt-3 flex items-end justify-between gap-3 border-t border-slate-100 pt-3">
                        <div>
                          <span className="block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">{isLao ? 'ລາຄາວຽງຈັນ' : 'Giá tại Vientiane'}</span>
                          <strong className="mt-1 block font-mono text-base text-emerald-800">{kip.format(product.price_vientiane_kip)} KIP</strong>
                        </div>
                        <motion.button type="button" onClick={() => toggleInterest(product.product_id)} whileTap={reduceMotion ? undefined : { scale: 0.94 }} aria-pressed={interested} className={`inline-flex min-h-10 touch-manipulation items-center gap-1.5 rounded-full px-3 text-[11px] font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${interested ? 'bg-emerald-100 text-emerald-800 shadow-sm ring-1 ring-inset ring-emerald-300' : 'bg-[#103e32] text-white shadow-sm hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md active:translate-y-0'}`}>
                          <AnimatePresence mode="wait" initial={false}>
                            <motion.span key={interested ? 'selected' : 'unselected'} initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.7 }} transition={{ duration: reduceMotion ? 0.08 : 0.16 }} aria-hidden="true">
                              {interested ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                            </motion.span>
                          </AnimatePresence>
                          {interested ? (isLao ? 'ເລືອກແລ້ວ' : 'Đã quan tâm') : (isLao ? 'ສົນໃຈ' : 'Tôi quan tâm')}
                        </motion.button>
                      </div>
                    </div>
                  </motion.article>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.8 }} transition={{ duration: reduceMotion ? 0.1 : 0.35 }} className="mt-3 flex items-start gap-2 text-[11px] font-medium leading-5 text-slate-500">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
          {isLao
            ? 'ຮູບພາບ ແລະ ຂໍ້ມູນຜະລິດຕະພັນແມ່ນສະໜອງໂດຍ NNC.'
            : 'Hình ảnh và thông tin nhận diện sản phẩm do NNC cung cấp.'}
        </motion.p>
      </div>

      <Dialog.Root open={Boolean(selectedProduct)} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <AnimatePresence initial={false}>
          {selectedProduct && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild>
                <motion.div className="fixed inset-0 z-50 bg-[#071913]/75 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0.1 : 0.2 }} />
              </Dialog.Overlay>
              <Dialog.Content className="fixed inset-0 z-50 flex items-end justify-center p-0 focus:outline-none sm:items-center sm:p-4">
                <motion.div initial={{ opacity: 0, y: reduceMotion ? 0 : 40, scale: reduceMotion ? 1 : 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: reduceMotion ? 0 : 24, scale: reduceMotion ? 1 : 0.98 }} transition={reduceMotion ? { duration: 0.1 } : { type: 'spring', damping: 28, stiffness: 260 }} className="pointer-events-auto relative max-h-[88svh] w-full overflow-y-auto rounded-t-[1.5rem] border border-emerald-950/10 bg-white p-5 shadow-2xl sm:max-h-[92vh] sm:max-w-[900px] sm:rounded-[1.5rem] sm:p-8">
                  <Dialog.Close className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500" aria-label={isLao ? 'ປິດ' : 'Đóng'}>
                    <X className="h-5 w-5" />
                  </Dialog.Close>
                  <div className="grid gap-7 md:grid-cols-[0.95fr_1.05fr] md:items-center">
                    <motion.div initial={{ opacity: 0, x: reduceMotion ? 0 : -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: reduceMotion ? 0.1 : 0.35, delay: reduceMotion ? 0 : 0.08 }} className="overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-slate-50 to-emerald-50">
                      <picture>
                        <source type="image/avif" srcSet={`${selectedProduct.scene_asset_stem}.avif`} />
                        <source type="image/webp" srcSet={`${selectedProduct.scene_asset_stem}.webp`} />
                        <img src={`${selectedProduct.scene_asset_stem}.png`} width="1024" height="1024" alt={selectedProduct.canonical_name} className="aspect-square h-full w-full object-cover" />
                      </picture>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, x: reduceMotion ? 0 : 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: reduceMotion ? 0.1 : 0.35, delay: reduceMotion ? 0 : 0.12 }}>
                      <Dialog.Title className="pr-14 text-3xl font-black tracking-[-0.035em] text-[#102a24]">{selectedProduct.canonical_name}</Dialog.Title>
                      <Dialog.Description className="mt-3 text-sm font-semibold leading-relaxed text-slate-600">
                        {getProductCommercialDescription(selectedProduct.product_id, isLao) || (
                          selectedProduct.source_status === 'source_locked'
                            ? (isLao ? selectedProduct.source_note_lo : selectedProduct.source_note_vi)
                            : (isLao ? 'ຮູບບັນຈຸພັນຮັກສາຕາມ catalogue NNC; ຊື່/ສ່ວນປະກອບກຳລັງລໍ NNC ກວດສອບຂ້າມເອກະສານ.' : 'Bao bì được giữ theo catalogue NNC; tên/hoạt chất đang chờ NNC đối soát chéo tài liệu.')
                        )}
                      </Dialog.Description>
                      <dl className="mt-6 divide-y divide-slate-100 border-y border-slate-100">
                        {[
                          [isLao ? 'ສ່ວນປະກອບ / ຄວາມແຮງ' : 'Hoạt chất / nhận diện', selectedProduct.source_status === 'source_locked' ? selectedProduct.formulation : (isLao ? 'ກຳລັງລໍຖ້າ NNC ກວດສອບເອກະສານລະບຸຕົວຕົນ.' : 'Đang chờ NNC đối soát tài liệu nhận diện.')],
                          [isLao ? 'ຮູບແບບບັນຈຸ' : 'Quy cách', selectedProduct.pack_size],
                          [isLao ? 'ລາຄາວຽງຈັນ' : 'Giá tại Vientiane', `${kip.format(selectedProduct.price_vientiane_kip)} KIP`]
                        ].map(([label, value]) => (
                          <div key={label} className="grid grid-cols-[0.9fr_1.1fr] gap-4 py-4">
                            <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</dt>
                            <dd lang={label === (isLao ? 'ລາຄາວຽງຈັນ' : 'Giá tại Vientiane') ? undefined : 'vi'} className="text-right text-sm font-black text-slate-800">{value}</dd>
                          </div>
                        ))}
                      </dl>
                      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <motion.button type="button" onClick={() => onWhatsAppInquire(selectedProduct)} whileTap={reduceMotion ? undefined : { scale: 0.97 }} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-black text-white transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                          <FaWhatsapp size={16} />
                          {isLao ? 'ປຶກສາຜ່ານ WhatsApp' : 'Tư vấn qua WhatsApp'}
                        </motion.button>
                        <motion.button type="button" onClick={() => { toggleInterest(selectedProduct.product_id); setSelectedProduct(null); }} whileTap={reduceMotion ? undefined : { scale: 0.97 }} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 px-5 text-sm font-black text-slate-700 transition hover:border-emerald-500 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                          {interestedProductIds.includes(selectedProduct.product_id) ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          {interestedProductIds.includes(selectedProduct.product_id) ? (isLao ? 'ເລືອກແລ້ວ' : 'Đã chọn') : (isLao ? 'ເພີ່ມຄວາມສົນໃຈ' : 'Thêm quan tâm')}
                        </motion.button>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>
    </section>
  );
}
