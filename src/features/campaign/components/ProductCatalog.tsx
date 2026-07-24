import React from 'react';
import type { Product, Locale } from '../model/types';
import { PRODUCTS } from '../model/config';
import { formatKip } from '../model/math';

interface ProductCatalogProps {
  locale: Locale;
  onSelectProduct: (product: Product) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  locale,
  onSelectProduct,
}) => {
  const flagships = PRODUCTS.filter((p) => p.isFlagship);
  const supports = PRODUCTS.filter((p) => !p.isFlagship);

  return (
    <section id="products" className="products-section">
      <div className="products-bg-decorations">
        <div className="glow-orb orb-1"></div>
        <div className="glow-orb orb-2"></div>
      </div>
      <div className="section-header">
        <span className="section-tag">
          {locale === 'lo' ? 'ຜະລິດຕະພັນໃນໂຄງການ' : 'DANH MỤC CHÍNH THỨC'}
        </span>
        <h2 className="section-title">
          {locale === 'lo'
            ? '7 ຜະລິດຕະພັນລວມຍອດຂາຍດຽວກັນ'
            : '7 Dòng Sản Phẩm Tích Lũy Doanh Số Q3'}
        </h2>
        <p className="section-desc">
          {locale === 'lo'
            ? 'ລາຄາໃນໜ້ານີ້ເປັນລາຄາອ້າງອີງ. NNC ຈະຢືນຢັນເມື່ອໃຫ້ຄຳປຶກສາ.'
            : 'Xem thông tin sản phẩm và chính sách kinh doanh sỉ. Cả 7 sản phẩm đều cộng dồn chung doanh số lũy tiến.'}
        </p>
      </div>

      <div className="asymmetric-catalog-container">
        {/* Flagships Row */}
        <div className="catalog-row-title">
          {locale === 'lo'
            ? 'ຜະລິດຕະພັນຫຼັກ (3 ຜະລິດຕະພັນ)'
            : 'DÒNG SẢN PHẨM CHỦ LỰC KÊ ĐƠN (3 SẢN PHẨM CHÍNH)'}
        </div>
        <div className="products-asym-grid flagship-grid">
          {flagships.map((product) => (
            <div
              className="product-card flagship-card"
              key={product.id}
              onClick={() => onSelectProduct(product)}
              style={{ cursor: 'pointer' }}
            >
              <div className="product-badge-flagship">FLAGSHIP</div>
              <div className="product-img-wrapper">
                <img src={product.image} alt={product.name} />
              </div>
              <div className="product-content">
                <span className="product-cat">
                  {locale === 'lo' ? product.categoryLo : product.categoryVi}
                </span>
                <h3 className="product-name">{product.name}</h3>
                <p className="product-pack">
                  {locale === 'lo' ? product.packLo : product.packVi}
                </p>
                <div className="product-price-row">
                  <span className="price-label">Giá sỉ:</span>
                  <span className="price-value">{formatKip(product.priceKip)} KIP</span>
                </div>
                <button
                  type="button"
                  className="btn-product-detail"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectProduct(product);
                  }}
                >
                  {locale === 'lo' ? 'ເບິ່ງລາຍລະອຽດ' : 'Xem chi tiết'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Support Row */}
        <div className="catalog-row-title mt-row" style={{ marginTop: '2.5rem' }}>
          {locale === 'lo'
            ? 'ຜະລິດຕະພັນເສີມ (4 ຜະລິດຕະພັນ)'
            : 'DANH MỤC THẢO DƯỢC & KHÁNG SINH PEDIATRIC BỔ TRỢ (4 SẢN PHẨM)'}
        </div>
        <div className="products-asym-grid support-grid">
          {supports.map((product) => (
            <div
              className="product-card support-card"
              key={product.id}
              onClick={() => onSelectProduct(product)}
              style={{ cursor: 'pointer' }}
            >
              <div className="product-img-wrapper">
                <img src={product.image} alt={product.name} />
              </div>
              <div className="product-content">
                <span className="product-cat">
                  {locale === 'lo' ? product.categoryLo : product.categoryVi}
                </span>
                <h3 className="product-name">{product.name}</h3>
                <p className="product-pack">
                  {locale === 'lo' ? product.packLo : product.packVi}
                </p>
                <div className="product-price-row">
                  <span className="price-label">Giá sỉ:</span>
                  <span className="price-value">{formatKip(product.priceKip)} KIP</span>
                </div>
                <button
                  type="button"
                  className="btn-product-detail"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectProduct(product);
                  }}
                >
                  {locale === 'lo' ? 'ເບິ່ງລາຍລະອຽດ' : 'Xem chi tiết'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
