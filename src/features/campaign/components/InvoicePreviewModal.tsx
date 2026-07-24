import React, { useRef, useEffect } from 'react';
import type { CartLine, Locale, RegistrationData } from '../model/types';
import { PRODUCTS } from '../model/config';
import { calculateCartTotal, formatKip } from '../model/math';

interface InvoicePreviewModalProps {
  isOpen: boolean;
  cart: CartLine[];
  registration: RegistrationData | null;
  locale: Locale;
  onClose: () => void;
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  isOpen,
  cart,
  registration,
  locale,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 750;

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header bar
    ctx.fillStyle = '#083D33';
    ctx.fillRect(0, 0, canvas.width, 100);

    // Header title
    ctx.fillStyle = '#F0B429';
    ctx.font = 'bold 22px "Be Vietnam Pro", sans-serif';
    ctx.fillText('NNC PHARMA LAOS · B2B Q3/2026', 30, 45);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px "Be Vietnam Pro", sans-serif';
    ctx.fillText(locale === 'lo' ? 'ບິນສັ່ງຊື້ອ້າງອີງ (DRAFT INVOICE)' : 'BẢN THIẾT KẾ ĐƠN HÀNG THAM KHẢO', 30, 75);

    // Customer Info Box
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(30, 120, 540, 100);
    ctx.strokeStyle = '#E2E8F0';
    ctx.strokeRect(30, 120, 540, 100);

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 14px "Be Vietnam Pro", sans-serif';
    ctx.fillText(`${locale === 'lo' ? 'ຂະແໜງ/ຮ້ານ:' : 'Cơ sở:'} ${registration?.businessName || 'Khách hàng B2B'}`, 45, 145);
    ctx.font = '13px "Be Vietnam Pro", sans-serif';
    ctx.fillText(`${locale === 'lo' ? 'ຊື່:' : 'Họ tên:'} ${registration?.fullName || 'N/A'} - SĐT: ${registration?.phone || 'N/A'}`, 45, 170);
    ctx.fillText(`${locale === 'lo' ? 'ແຂວງ:' : 'Tỉnh/TP:'} ${registration?.province || 'Vientiane'}`, 45, 195);

    // Table Header
    let y = 250;
    ctx.fillStyle = '#083D33';
    ctx.fillRect(30, y, 540, 30);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px "Be Vietnam Pro", sans-serif';
    ctx.fillText(locale === 'lo' ? 'ຜະລິດຕະພັນ' : 'SẢN PHẨM', 45, y + 20);
    ctx.fillText(locale === 'lo' ? 'ຈຳນວນ' : 'SL', 340, y + 20);
    ctx.fillText(locale === 'lo' ? 'ລາຄາ' : 'ĐƠN GIÁ', 400, y + 20);
    ctx.fillText(locale === 'lo' ? 'ລວມ' : 'THÀNH TIỀN', 490, y + 20);

    y += 35;

    // Cart items
    const totals = calculateCartTotal(cart, PRODUCTS);
    let itemCount = 0;

    cart.forEach((line) => {
      const p = PRODUCTS.find((item) => item.id === line.productId);
      if (!p || line.quantity <= 0) return;
      itemCount++;

      ctx.fillStyle = itemCount % 2 === 0 ? '#F8FAFC' : '#FFFFFF';
      ctx.fillRect(30, y - 15, 540, 30);

      ctx.fillStyle = '#1E293B';
      ctx.font = '12px "Be Vietnam Pro", sans-serif';
      ctx.fillText(p.name, 45, y + 5);
      ctx.fillText(String(line.quantity), 345, y + 5);
      ctx.fillText(`${formatKip(p.priceKip)}`, 400, y + 5);
      ctx.fillText(`${formatKip(p.priceKip * line.quantity)}`, 490, y + 5);

      y += 30;
    });

    // Summary Box
    y += 20;
    ctx.strokeStyle = '#CBD5E1';
    ctx.beginPath();
    ctx.moveTo(30, y);
    ctx.lineTo(570, y);
    ctx.stroke();

    y += 30;
    ctx.fillStyle = '#475569';
    ctx.font = '13px "Be Vietnam Pro", sans-serif';
    ctx.fillText(locale === 'lo' ? 'ລວມສິນຄ້າ:' : 'Tổng tiền hàng:', 330, y);
    ctx.fillText(`${formatKip(totals.subtotalKip)} KIP`, 470, y);

    y += 25;
    ctx.fillStyle = '#059669';
    ctx.fillText(locale === 'lo' ? 'ຫຼຸດທັນທີ 5%:' : 'Giảm ngay 5%:', 330, y);
    ctx.fillText(`-${formatKip(totals.immediateDiscountKip)} KIP`, 470, y);

    y += 30;
    ctx.fillStyle = '#083D33';
    ctx.font = 'bold 15px "Be Vietnam Pro", sans-serif';
    ctx.fillText(locale === 'lo' ? 'ຄາດຄະເນຫຼັງຫຼຸດ:' : 'Tạm tính sau giảm:', 330, y);
    ctx.fillStyle = '#D97706';
    ctx.fillText(`${formatKip(totals.payableKip)} KIP`, 460, y);

    // Footer note
    y += 60;
    ctx.fillStyle = '#94A3B8';
    ctx.font = 'italic 11px "Be Vietnam Pro", sans-serif';
    ctx.fillText('NNC Pharma Laos · Báo giá mang tính tham khảo trước khi tư vấn chính thức qua WhatsApp.', 45, y);
  }, [isOpen, cart, registration, locale]);

  if (!isOpen) return null;

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `nnc-draft-invoice-${registration?.phone || 'b2b'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="modal-overlay active" onClick={onClose}>
      <div className="modal-card pdf-modal-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="btn-modal-close" onClick={onClose}>
          ×
        </button>
        <div className="modal-header">
          <h3>{locale === 'lo' ? 'ເບິ່ງບິນສັ່ງຊື້ອ້າງອີງ' : 'Xem trước bản PDF / Đơn hàng nháp'}</h3>
        </div>
        <div className="modal-body bg-slate-100 flex-center" style={{ overflowX: 'auto', padding: '1rem' }}>
          <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto', border: '1px solid #CBD5E1', borderRadius: '8px' }} />
        </div>
        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            {locale === 'lo' ? 'ປິດ' : 'Đóng'}
          </button>
          <button type="button" className="btn-primary" onClick={handleDownload}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>{locale === 'lo' ? 'ດາວໂຫຼດຮູບພາບ' : 'Tải xuống hình ảnh'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
