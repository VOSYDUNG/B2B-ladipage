import React from 'react';
import type { CartLine, Locale, RegistrationData } from '../model/types';
import { PRODUCTS } from '../model/config';
import { calculateCartTotal, formatKip } from '../model/math';
import { buildWhatsAppUrl } from '../../../shared/lib/whatsapp';
import { sendLeadToGoogleSheet } from '../services/sheetService';

interface CartStepProps {
  cart: CartLine[];
  registration: RegistrationData | null;
  locale: Locale;
  onSetQuantity: (productId: string, quantity: number) => void;
  onOpenInvoiceModal: () => void;
  onComplete: () => void;
}

export const CartStep: React.FC<CartStepProps> = ({
  cart,
  registration,
  locale,
  onSetQuantity,
  onOpenInvoiceModal,
  onComplete,
}) => {
  const totals = calculateCartTotal(cart, PRODUCTS);

  const handleSendWhatsApp = async () => {
    const linesText = cart
      .map((line) => {
        const p = PRODUCTS.find((item) => item.id === line.productId);
        if (!p || line.quantity <= 0) return null;
        return `- ${p.name} (${p.packVi}): ${line.quantity} × ${formatKip(p.priceKip)} KIP = ${formatKip(p.priceKip * line.quantity)} KIP`;
      })
      .filter(Boolean)
      .join('\n');

    const text = locale === 'lo'
      ? `ສະບາຍດີ NNC Pharma Laos! ຂ້ອຍແມ່ນ ${registration?.fullName || ''} (${registration?.businessName || ''}). ຂ້ອຍຕ້ອງການສົ່ງບິນສັ່ງຊື້ອ້າງອີງ:\n\n${linesText}\n\nລວມສິນຄ້າ: ${formatKip(totals.subtotalKip)} KIP\nຫຼຸດ 5%: ${formatKip(totals.immediateDiscountKip)} KIP\nຄາດຄະເນຫຼັງຫຼຸດ: ${formatKip(totals.payableKip)} KIP.\n\nກະລຸນາຕິດຕໍ່ຢືນຢັນ.`
      : `Xin chào NNC Pharma Laos! Tôi là ${registration?.fullName || ''} đại diện ${registration?.businessName || ''} (SĐT: ${registration?.phone || ''}, ${registration?.province || 'Vientiane'}). Tôi gửi bản lên đơn tham khảo Q3:\n\n${linesText}\n\nTỔNG TIỀN HÀNG: ${formatKip(totals.subtotalKip)} KIP\nGIẢM NGAY 5%: ${formatKip(totals.immediateDiscountKip)} KIP\nTẠM TÍNH SAU GIẢM: ${formatKip(totals.payableKip)} KIP.\n\nXin chuyên viên liên hệ xác nhận đơn hàng và hướng dẫn nhận chiết khấu tích lũy.`;

    await sendLeadToGoogleSheet({
      action: 'order_submit',
      fullName: registration?.fullName,
      phone: registration?.phone,
      businessName: registration?.businessName,
      cartSubtotal: totals.subtotalKip,
      cartPayable: totals.payableKip,
    });

    window.open(buildWhatsAppUrl(text), '_blank');
    onComplete();
  };

  const handleSkip = async () => {
    await sendLeadToGoogleSheet({
      action: 'order_skip',
      fullName: registration?.fullName,
      phone: registration?.phone,
    });
    onComplete();
  };

  return (
    <div className="order-form-card" style={{ padding: '1.5rem' }}>
      <span aria-hidden="true" className="premium-card-border-line"></span>

      <div className="wheel-showcase-header" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <span className="showcase-tag">{locale === 'lo' ? 'ຂັ້ນ 4/5: ສ້າງບິນ' : 'BƯỚC 4/5: LÊN ĐƠN HÀNG'}</span>
        <h3>{locale === 'lo' ? 'ສ້າງບິນສັ່ງຊື້ອ້າງອີງ' : 'Lên Đơn Hàng Tích Lũy'}</h3>
        <p className="showcase-subtitle" style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
          {locale === 'lo'
            ? 'ປັບຈຳນວນເພື່ອເບິ່ງຍອດຄາດຄະເນ. ຍັງບໍ່ແມ່ນບິນຢືນຢັນ.'
            : 'Điều chỉnh số lượng 7 sản phẩm để xem bài toán kinh tế thực nhận.'}
        </p>
      </div>

      <div className="order-form-products" style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '0.5rem' }}>
        <ul className="order-products-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {PRODUCTS.map((product) => {
            const line = cart.find((l) => l.productId === product.id);
            const qty = line ? line.quantity : 0;

            return (
              <li
                key={product.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#062B24',
                  padding: '0.8rem 1rem',
                  borderRadius: '8px',
                  marginBottom: '0.8rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <img src={product.image} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                  <div>
                    <strong style={{ color: '#FFF', display: 'block', fontSize: '0.95rem' }}>{product.name}</strong>
                    <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>
                      {formatKip(product.priceKip)} KIP / {locale === 'lo' ? product.packLo : product.packVi}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => onSetQuantity(product.id, Math.max(0, qty - 1))}
                    style={{ background: '#083D33', color: '#F0B429', border: '1px solid #F0B429', borderRadius: '4px', width: '28px', height: '28px', cursor: 'pointer', fontWeight: 700 }}
                  >
                    -
                  </button>
                  <span style={{ color: '#FFF', fontWeight: 700, minWidth: '24px', textAlign: 'center' }}>{qty}</span>
                  <button
                    type="button"
                    onClick={() => onSetQuantity(product.id, qty + 1)}
                    style={{ background: '#083D33', color: '#F0B429', border: '1px solid #F0B429', borderRadius: '4px', width: '28px', height: '28px', cursor: 'pointer', fontWeight: 700 }}
                  >
                    +
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Invoice Summary Box */}
      <div className="order-invoice-box" style={{ background: '#083D33', borderRadius: '10px', padding: '1rem', marginBottom: '1.2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#CBD5E1', fontSize: '0.9rem' }}>
          <span>{locale === 'lo' ? 'ລວມສິນຄ້າ:' : 'Tổng tiền hàng:'}</span>
          <strong>{formatKip(totals.subtotalKip)} KIP</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#10B981', fontSize: '0.9rem' }}>
          <span>{locale === 'lo' ? 'ຫຼຸດທັນທີ 5%:' : 'Giảm ngay 5%:'}</span>
          <strong>-{formatKip(totals.immediateDiscountKip)} KIP</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', color: '#F0B429', fontSize: '1.1rem', fontWeight: 700 }}>
          <span>{locale === 'lo' ? 'ຄາດຄະເນຫຼັງຫຼຸດ:' : 'Tạm tính sau giảm:'}</span>
          <span>{formatKip(totals.payableKip)} KIP</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1rem' }}>
        <button
          type="button"
          onClick={onOpenInvoiceModal}
          style={{
            flex: 1,
            background: '#0F5747',
            color: '#FFF',
            border: '1px solid #146C59',
            borderRadius: '8px',
            padding: '0.6rem',
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <span>{locale === 'lo' ? 'ເບິ່ງບິນ (PDF)' : 'Xem bản PDF / Hình ảnh'}</span>
        </button>
      </div>

      <div className="invoice-actions-compact" style={{ display: 'flex', gap: '0.8rem' }}>
        <button
          type="button"
          className="btn-skip-compact"
          onClick={handleSkip}
          style={{ flex: 1, background: 'transparent', color: '#CBD5E1', border: '1px solid #475569', borderRadius: '8px', padding: '0.8rem', cursor: 'pointer' }}
        >
          {locale === 'lo' ? 'ຂ້າມ' : 'Bỏ qua & Hoàn tất'}
        </button>
        <button
          type="button"
          className="btn-whatsapp-compact"
          onClick={handleSendWhatsApp}
          style={{ flex: 2, background: '#25D366', color: '#FFF', border: 'none', borderRadius: '8px', padding: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.03-5.114-2.905-6.99C16.557 1.87 14.07 1.834 11.44 1.834c-5.44 0-9.868 4.42-9.872 9.867a9.813 9.813 0 0 0 1.5 4.85l-.988 3.606 3.69-.968zm11.233-6.84c-.303-.152-1.793-.884-2.071-.985-.278-.1-.482-.152-.68.152-.2.303-.774.985-.95 1.187-.176.202-.351.228-.654.076-.303-.152-1.278-.47-2.435-1.503-.9-.8-1.51-1.787-1.686-2.09-.176-.303-.02-.467.132-.618.136-.137.303-.351.455-.527.152-.176.202-.303.303-.506.1-.202.05-.38-.025-.53-.075-.152-.682-1.644-.934-2.253-.247-.597-.497-.516-.68-.527-.176-.01-.38-.012-.582-.012-.202 0-.53.076-.807.38-.278.303-1.062 1.037-1.062 2.529 0 1.493 1.087 2.935 1.238 3.137.152.202 2.138 3.262 5.18 4.58.724.313 1.289.5 1.73.64.728.23 1.39.197 1.91.12.58-.087 1.794-.733 2.048-1.443.254-.71.254-1.317.177-1.443-.077-.126-.278-.202-.582-.354z" />
          </svg>
          <span>{locale === 'lo' ? 'ສົ່ງບິນຜ່ານ WHATSAPP' : 'GỬI ĐƠN WHATSAPP'}</span>
        </button>
      </div>
    </div>
  );
};
