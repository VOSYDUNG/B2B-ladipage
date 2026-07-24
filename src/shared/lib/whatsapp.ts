import { PRODUCTS, REWARDS, TIERS } from '../../features/campaign/model/config';
import { calculateCart, formatKip } from '../../features/campaign/model/math';
import type { CampaignState } from '../../features/campaign/model/types';

const DEFAULT_NUMBER = '8562095355355';

export function getWhatsAppNumber(): string {
  return (import.meta.env.VITE_WHATSAPP_NUMBER || DEFAULT_NUMBER).replace(/\D/g, '');
}

export function buildWhatsAppUrl(state: CampaignState): string {
  const number = getWhatsAppNumber();
  const registration = state.registration;
  const reward = REWARDS.find((candidate) => candidate.id === state.spin?.rewardId);
  const sampleProduct = PRODUCTS.find(
    (candidate) => candidate.id === state.spin?.sampleProductId,
  );
  const tier = TIERS.find((candidate) => candidate.id === state.selectedTierId);
  const cart = calculateCart(state.cart);
  const locale = state.locale;

  const lines =
    locale === 'lo'
      ? [
          'NNC B2B Q3/2026 — ຂໍຄຳປຶກສາ',
          `ຊື່: ${registration?.fullName ?? '-'}`,
          `ເບີໂທ: ${registration?.phone ?? '-'}`,
          `ສະຖານປະກອບການ: ${registration?.businessName ?? '-'}`,
          `ເປົ້າໝາຍ: ${tier?.nameLo ?? '-'}`,
          `ສິດ UAT: ${reward?.nameLo ?? '-'}${sampleProduct ? ` — ${sampleProduct.name}` : ''}`,
          `ບິນຮ່າງ: ${formatKip(cart.subtotalKip, 'lo')}`,
          'ກະລຸນາກວດສອບນະໂຍບາຍ, ຂອງຂວັນ ແລະ ລາຄາກ່ອນຢືນຢັນ.',
        ]
      : [
          'NNC B2B Q3/2026 — YÊU CẦU TƯ VẤN',
          `Họ tên: ${registration?.fullName ?? '-'}`,
          `Số điện thoại: ${registration?.phone ?? '-'}`,
          `Cơ sở: ${registration?.businessName ?? '-'}`,
          `Bậc mục tiêu: ${tier?.nameVi ?? '-'}`,
          `Quyền lợi UAT: ${reward?.nameVi ?? '-'}${sampleProduct ? ` — ${sampleProduct.name}` : ''}`,
          `Tổng đơn nháp: ${formatKip(cart.subtotalKip, 'vi')}`,
          'Vui lòng kiểm tra chính sách, quà tặng và giá trước khi xác nhận chính thức.',
        ];

  return `https://wa.me/${number}?text=${encodeURIComponent(lines.join('\n'))}`;
}
