import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Gift, X, Check, Copy, Share2 } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { NncWheelSegment, appendNncWhatsAppReference, NNC_WHATSAPP_PATH, NNC_PRODUCTS } from '@/config/nnc-b2b-rewards';
import type { NncRegistrationValues } from './registration-form';

interface RewardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reward: NncWheelSegment | null;
  participantId: string;
  referralCodeOwned: string;
  isWhatsAppFallback: boolean;
  registration: NncRegistrationValues | null;
  onWhatsAppClick: () => void;
  cartItems: Array<{ product_id: string; quantity: number }>;
  cartTotal: number;
  isLao: boolean;
}

export function RewardModal({
  open,
  onOpenChange,
  reward,
  participantId,
  referralCodeOwned,
  isWhatsAppFallback,
  registration,
  onWhatsAppClick,
  cartItems,
  cartTotal,
  isLao
}: RewardModalProps) {
  const reduceMotion = useReducedMotion();
  const [copied, setCopied] = useState<'code' | 'link' | ''>('');

  if (!reward) return null;

  const shareUrl = `${window.location.origin}/lp/nnc-b2b-online-rewards-q3-2026?ref=${encodeURIComponent(referralCodeOwned)}`;

  const copy = async (value: string, kind: 'code' | 'link') => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      window.setTimeout(() => setCopied(''), 1800);
    } catch {
      // Fallback alert or silent fail
    }
  };

  const name = isLao ? reward.name_lo : reward.name_vi;
  const desc = isLao ? reward.description_lo : reward.description_vi;
  const cond = isLao ? reward.condition_text_lo : reward.condition_text_vi;

  const formatCartText = () => {
    if (!cartItems || cartItems.length === 0) return isLao ? 'ບໍ່ມີ' : 'không có';
    const lines = cartItems
      .filter(item => item.quantity > 0)
      .map(item => {
        const product = NNC_PRODUCTS.find(p => p.product_id === item.product_id);
        return product ? `- ${product.canonical_name}: ${item.quantity}` : '';
      })
      .filter(Boolean);
    if (lines.length === 0) return isLao ? 'ບໍ່ມີ' : 'không có';
    const formatter = new Intl.NumberFormat('en-US');
    lines.push(`\n${isLao ? 'ຍອດລວມປະມານ' : 'Tổng dự kiến'}: ${formatter.format(cartTotal)} KIP`);
    return '\n' + lines.join('\n');
  };

  const whatsappMessage = registration ? appendNncWhatsAppReference(
    isLao
      ? `ສະບາຍດີ NNC Pharma,\n\nຊື່: ${registration.fullName}\nເບີໂທ: ${registration.phone}\nຫົວໜ່ວຍ: ${registration.businessName}\nບົດບາດ: ${registration.role}\nລະຫັດແນະນຳທີ່ໃຊ້: ${registration.referralCodeUsed || 'ບໍ່ມີ'}\nສິດທິທີ່ເປີດ: ${reward.name_lo}\nໃບສັ່ງຊື້ອ້າງອີງ: ${formatCartText()}\n\n${isWhatsAppFallback ? 'ລະຫັດຊ່ວຍເຫຼືອ' : 'ລະຫັດເຂົ້າຮ່ວມ'}: ${participantId}${isWhatsAppFallback ? '\n\nຂໍ້ມູນອອນລາຍຍັງບໍ່ໄດ້ບັນທຶກ. ກະລຸນາ NNC ຮັບຂໍ້ມູນນີ້ຜ່ານ WhatsApp.' : ''}\n\nກະລຸນາ NNC ຢືນຢັນ, ໃຫ້ຄຳປຶກສາ ແລະ ຊ່ວຍສັ່ງຊື້.`
      : `Xin chào NNC Pharma,\n\nTôi là: ${registration.fullName}\nSố điện thoại: ${registration.phone}\nĐơn vị: ${registration.businessName}\nVai trò: ${registration.role}\nMã giới thiệu đã dùng: ${registration.referralCodeUsed || 'không có'}\nQuyền lợi vừa mở: ${reward.name_vi}\nĐơn nháp tham khảo: ${formatCartText()}\n\n${isWhatsAppFallback ? 'Mã phiên hỗ trợ' : 'Mã tham gia'}: ${participantId}${isWhatsAppFallback ? '\n\nDữ liệu trực tuyến chưa được ghi nhận. Nhờ NNC tiếp nhận thủ công thông tin này qua WhatsApp.' : ''}\n\nNhờ NNC xác nhận quyền lợi, tư vấn và hỗ trợ đặt hàng.`,
    'reward_confirmation',
    reward.reward_id
  ) : '';

  const whatsappUrl = `https://wa.me/${NNC_WHATSAPP_PATH}?text=${encodeURIComponent(whatsappMessage)}`;

  const handleWhatsAppAction = () => {
    onWhatsAppClick();
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] bg-[#06140f]/85 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.95 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-4 z-[60] flex flex-col justify-between overflow-y-auto rounded-3xl bg-white shadow-2xl sm:inset-auto sm:left-1/2 sm:top-1/2 sm:max-h-[90vh] sm:w-[90vw] sm:max-w-xl sm:-translate-x-1/2 sm:-translate-y-1/2 border border-emerald-950/10 p-6"
              >
                {/* Reward sparkles overlay decor */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                  <div className="absolute -left-1/4 -top-1/4 h-2/3 w-2/3 rounded-full bg-emerald-500/10 blur-3xl" />
                  <div className="absolute -right-1/4 -bottom-1/4 h-2/3 w-2/3 rounded-full bg-amber-400/10 blur-3xl" />
                </div>

                <div className="relative flex flex-col items-center text-center">
                  <Dialog.Close className="absolute right-0 top-0 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer">
                    <X className="h-4 w-4" />
                  </Dialog.Close>

                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600 border border-amber-200 shadow-md mt-2 mb-4 animate-bounce">
                    <Gift className="h-6 w-6" />
                  </div>

                  <Dialog.Title className="text-2xl font-black text-[#102a24]">
                    {isLao ? 'ຂໍສະແດງຄວາມຍິນດີ!' : 'Chúc mừng anh/chị!'}
                  </Dialog.Title>

                  <Dialog.Description className="mt-2 text-xs font-semibold text-slate-500">
                    {isLao
                      ? 'ຜົນສິດທິອ້າງອີງໄດ້ຮັບການບັນທຶກສຳເລັດແລ້ວ. ທ່ານໝູນໄດ້:'
                      : 'Quyền lợi sỉ Q3 đã được ghi nhận thành công. Anh/chị đã trúng:'}
                  </Dialog.Description>

                  {/* Won reward badge */}
                  <div className="w-full mt-5 rounded-2xl bg-gradient-to-br from-[#103e32] via-[#0d342a] to-[#071913] p-5 text-white border border-emerald-950 shadow-lg relative overflow-hidden">
                    <h3 className="text-lg font-black leading-tight text-amber-300">
                      {name}
                    </h3>
                    <p className="mt-2 text-xs font-semibold leading-relaxed text-emerald-100/80">
                      {desc}
                    </p>
                    <div className="mt-4 border-t border-white/10 pt-3 text-left">
                      <span className="text-[9px] font-black uppercase tracking-[0.14em] text-amber-200/70">
                        {isLao ? 'ເງື່ອນໄຂ' : 'Điều kiện áp dụng'}
                      </span>
                      <p className="mt-1 text-[11px] font-bold leading-relaxed text-emerald-50/90">
                        {cond}
                      </p>
                    </div>
                  </div>

                  {/* Referral sharing panel */}
                  {!isWhatsAppFallback && referralCodeOwned && (
                    <div className="w-full mt-6 text-left border-t border-slate-100 pt-5">
                      <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800">
                        {isLao ? 'ແນະນຳເພື່ອນຮ່ວມວິຊາຊີບ - ຮັບສ່ວນຫຼຸດເພີ່ມ 0.5%' : 'Giới thiệu đồng nghiệp - Nhận thêm 0.5% chiết khấu'}
                      </h4>
                      <p className="mt-1 text-[11px] font-semibold leading-relaxed text-slate-500">
                        {isLao
                          ? 'ແບ່ງປັນໂຄງການນີ້ໃຫ້ເພື່ອນຮ່ວມງານ. ທ່ານຈະໄດ້ຮັບສ່ວນຫຼຸດສະສົມເພີ່ມ 0.5% ເມື່ອຜູ້ຖືກແນະນຳມີຍອດຊື້ຄັ້ງທຳອິດ.'
                          : 'Chia sẻ chương trình tới đồng nghiệp. Anh/chị nhận thêm 0.5% chiết khấu tích lũy đơn sỉ gộp khi người được giới thiệu phát sinh đơn hàng đầu tiên.'}
                      </p>

                      <div className="grid gap-3 sm:grid-cols-2 mt-4">
                        {/* Copy Code */}
                        <div className="min-w-0">
                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">{isLao ? 'ລະຫັດແນະນຳ' : 'Mã giới thiệu'}</span>
                          <div className="mt-1.5 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-1.5 pl-3">
                            <code className="truncate text-[10px] font-bold text-slate-700">{referralCodeOwned}</code>
                            <button
                              type="button"
                              onClick={() => copy(referralCodeOwned, 'code')}
                              className="inline-flex min-h-8 shrink-0 items-center gap-1 rounded-lg bg-white border border-slate-150 px-2.5 text-[9px] font-black text-emerald-700 shadow-sm transition hover:bg-emerald-50 cursor-pointer"
                            >
                              {copied === 'code' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                              {copied === 'code' ? 'OK' : (isLao ? 'ຄັດລອກ' : 'Copy')}
                            </button>
                          </div>
                        </div>

                        {/* Copy Link */}
                        <div className="min-w-0">
                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">{isLao ? 'ລິ້ງແນະນຳ' : 'Link giới thiệu'}</span>
                          <div className="mt-1.5 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-1.5 pl-3">
                            <code className="truncate text-[10px] font-bold text-slate-700">{shareUrl}</code>
                            <button
                              type="button"
                              onClick={() => copy(shareUrl, 'link')}
                              className="inline-flex min-h-8 shrink-0 items-center gap-1 rounded-lg bg-white border border-slate-150 px-2.5 text-[9px] font-black text-emerald-700 shadow-sm transition hover:bg-emerald-50 cursor-pointer"
                            >
                              {copied === 'link' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                              {copied === 'link' ? 'OK' : (isLao ? 'ຄັດລອກ' : 'Copy')}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="w-full mt-6 grid gap-2">
                    <button
                      type="button"
                      onClick={handleWhatsAppAction}
                      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-xs font-black text-white hover:bg-emerald-700 transition cursor-pointer"
                    >
                      <FaWhatsapp size={18} />
                      {isLao ? 'ຮັບສ່ວນຫຼຸດຜ່ານ WhatsApp' : 'Nhận quyền lợi qua WhatsApp B2B'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
