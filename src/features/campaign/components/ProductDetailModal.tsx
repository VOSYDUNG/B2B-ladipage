import React from 'react';
import type { Product, Locale } from '../model/types';
import { formatKip } from '../model/math';
import { buildWhatsAppUrl } from '../../../shared/lib/whatsapp';

interface ProductDetailModalProps {
  product: Product | null;
  locale: Locale;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  locale,
  onClose,
}) => {
  if (!product) return null;

  const pack = locale === 'lo' ? product.packLo : product.packVi;
  const desc = locale === 'lo' ? product.descriptionLo : product.descriptionVi;
  const cat = locale === 'lo' ? product.categoryLo : product.categoryVi;

  const handleWhatsApp = () => {
    const text = locale === 'lo'
      ? `ສະບາຍດີ NNC Pharma Laos! ຂ້ອຍສົນໃຈຂໍ້ມູນລາຄາສີ ຜະລິດຕະພັນ: ${product.name} (${pack}). ກະລຸນາໃຫ້ຄຳປຶກສາ.`
      : `Xin chào NNC Pharma Laos! Tôi quan tâm đến thông tin giá sỉ sản phẩm: ${product.name} (${pack}). Xin tư vấn giúp tôi.`;
    window.open(buildWhatsAppUrl(text), '_blank');
  };

  return (
    <div className="modal-overlay active" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="btn-modal-close" onClick={onClose}>
          ×
        </button>
        <div className="modal-grid">
          <div className="modal-visual">
            <img src={product.image} alt={product.name} />
          </div>
          <div className="modal-info">
            <span className="product-category-badge">{cat || 'NNC Pharma'}</span>
            <h3 className="modal-product-title">{product.name}</h3>
            <p className="modal-product-desc">{desc}</p>

            <div className="modal-meta">
              {product.formulation && (
                <div className="meta-row">
                  <span>{locale === 'lo' ? 'ສ່ວນປະກອບ:' : 'Hoạt chất:'}</span>
                  <strong>{product.formulation}</strong>
                </div>
              )}
              <div className="meta-row">
                <span>{locale === 'lo' ? 'ຂະໜາດບັນຈຸ:' : 'Quy cách:'}</span>
                <strong>{pack}</strong>
              </div>
              <div className="meta-row font-large">
                <span>{locale === 'lo' ? 'ລາຄາສີ Vientiane:' : 'Giá sỉ Vientiane:'}</span>
                <strong className="text-emerald">{formatKip(product.priceKip)} KIP</strong>
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-whatsapp-inquire" onClick={handleWhatsApp}>
                <svg className="icon-whatsapp-btn" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.03-5.114-2.905-6.99C16.557 1.87 14.07 1.834 11.44 1.834c-5.44 0-9.868 4.42-9.872 9.867a9.813 9.813 0 0 0 1.5 4.85l-.988 3.606 3.69-.968zm11.233-6.84c-.303-.152-1.793-.884-2.071-.985-.278-.1-.482-.152-.68.152-.2.303-.774.985-.95 1.187-.176.202-.351.228-.654.076-.303-.152-1.278-.47-2.435-1.503-.9-.8-1.51-1.787-1.686-2.09-.176-.303-.02-.467.132-.618.136-.137.303-.351.455-.527.152-.176.202-.303.303-.506.1-.202.05-.38-.025-.53-.075-.152-.682-1.644-.934-2.253-.247-.597-.497-.516-.68-.527-.176-.01-.38-.012-.582-.012-.202 0-.53.076-.807.38-.278.303-1.062 1.037-1.062 2.529 0 1.493 1.087 2.935 1.238 3.137.152.202 2.138 3.262 5.18 4.58.724.313 1.289.5 1.73.64.728.23 1.39.197 1.91.12.58-.087 1.794-.733 2.048-1.443.254-.71.254-1.317.177-1.443-.077-.126-.278-.202-.582-.354z" />
                </svg>
                <span>{locale === 'lo' ? 'ປຶກສາສີຜ່ານ WhatsApp' : 'Tư vấn sỉ qua WhatsApp'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
