import React from 'react';
import type { Locale } from '../model/types';

interface TrustBadgesProps {
  locale: Locale;
}

export const TrustBadges: React.FC<TrustBadgesProps> = ({ locale }) => {
  return (
    <section className="trust-hooks-section">
      <div className="trust-container">
        <div className="trust-item">
          <div className="trust-icon-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div className="trust-info">
            <h4>{locale === 'lo' ? 'ຜະລິດຕະພັນແທ້ 100%' : 'SẢN PHẨM CHÍNH HÃNG'}</h4>
            <p>{locale === 'lo' ? 'ກວດສອບຄຸນນະພາບຢ່າງເຂັ້ມງວດ' : 'Chất lượng kiểm định nghiêm ngặt'}</p>
          </div>
        </div>

        <div className="trust-item">
          <div className="trust-icon-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="1" y="3" width="15" height="13" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </div>
          <div className="trust-info">
            <h4>{locale === 'lo' ? 'ສົ່ງຮີບດ່ວນ' : 'GIAO HÀNG SIÊU TỐC'}</h4>
            <p>{locale === 'lo' ? 'ຈັດສົ່ງໄວທົ່ວປະເທດລາວ' : 'Phân phối nhanh chóng toàn quốc'}</p>
          </div>
        </div>

        <div className="trust-item">
          <div className="trust-icon-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 12 20 22 4 22 4 12" />
              <rect x="2" y="7" width="20" height="5" />
              <line x1="12" y1="22" x2="12" y2="7" />
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
            </svg>
          </div>
          <div className="trust-info">
            <h4>{locale === 'lo' ? '1.000+ ຂອງຂວັນ' : '1.000+ PHẦN QUÀ SỈ'}</h4>
            <p>{locale === 'lo' ? 'ມູນຄ່າລວມ 500.000.000 KIP' : 'Tổng giá trị sỉ lên đến 500.000.000 KIP'}</p>
          </div>
        </div>

        <div className="trust-item">
          <div className="trust-icon-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="trust-info">
            <h4>{locale === 'lo' ? 'ຮ່ວມມືຍາວນານ' : 'ĐỒNG HÀNH BỀN VỮNG'}</h4>
            <p>{locale === 'lo' ? 'ສະໜັບສະໜູນຕູ້ ແລະ ປຶ້ມປິ່ນປົວ' : 'Hỗ trợ quầy kệ và tài liệu điều trị'}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
