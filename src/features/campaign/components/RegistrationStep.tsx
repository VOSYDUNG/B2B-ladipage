import React, { useState } from 'react';
import type { RegistrationData, Locale, BusinessType } from '../model/types';
import { sendLeadToGoogleSheet } from '../services/sheetService';

interface RegistrationStepProps {
  initialData: RegistrationData | null;
  locale: Locale;
  onSubmit: (data: RegistrationData) => void;
}

export const RegistrationStep: React.FC<RegistrationStepProps> = ({
  initialData,
  locale,
  onSubmit,
}) => {
  const [fullName, setFullName] = useState(initialData?.fullName || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [businessName, setBusinessName] = useState(initialData?.businessName || '');
  const [businessType, setBusinessType] = useState<BusinessType>(initialData?.businessType || 'pharmacy');
  const [dob, setDob] = useState(initialData?.dob || '');
  const [province, setProvince] = useState(initialData?.province || 'Vientiane');
  const [referralCode, setReferralCode] = useState(initialData?.referralCode || '');
  const [refStatusMsg, setRefStatusMsg] = useState<{ text: string; isValid: boolean } | null>(null);
  const [consent, setConsent] = useState(initialData?.consent ?? true);

  const handleValidateRef = () => {
    const trimmed = referralCode.trim();
    if (trimmed.length >= 4) {
      setRefStatusMsg({
        text: locale === 'lo' ? '✓ ລະຫັດແນະນຳຖືກຕ້ອງ ແລະ ໄດ້ລັອກ' : '✓ Mã giới thiệu hợp lệ và đã khóa',
        isValid: true,
      });
    } else {
      setRefStatusMsg({
        text: locale === 'lo' ? 'ລະຫັດບໍ່ຖືກຕ້ອງ (ຢ່າງໜ້ອຍ 4 ຕົວອັກສອນ)' : 'Mã không hợp lệ (tối thiểu 4 ký tự)',
        isValid: false,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !businessName || !dob || !province || !consent) return;

    const data: RegistrationData = {
      fullName,
      phone,
      businessName,
      businessType,
      dob,
      province,
      referralCode,
      consent,
    };

    // Send lead data to Google Sheet webhook
    await sendLeadToGoogleSheet({
      action: 'register',
      fullName,
      phone,
      businessName,
      businessType,
      dob,
      province,
      referralCode,
    });

    onSubmit(data);
  };

  return (
    <div className="premium-register-form-card">
      <span aria-hidden="true" className="premium-card-border-line"></span>
      <h3>{locale === 'lo' ? 'ຂໍ້ມູນລົງທະບຽນ B2B' : 'Thông tin Đăng ký Đối tác B2B'}</h3>
      <p className="form-subtitle-desc">
        {locale === 'lo'
          ? 'ລົງທະບຽນຂໍ້ມູນທີ່ຖືກຕ້ອງເພື່ອຮັບໃບສະເໜີລາຄາສີ. ທີມງານ NNC ຈະຕິດຕໍ່ຜ່ານ WhatsApp.'
          : 'Đăng ký thông tin chính xác để nhận báo giá sỉ thiết bị y tế và dược phẩm từ NNC Pharma. Chuyên viên của chúng tôi sẽ liên hệ hỗ trợ bạn 1-1 qua WhatsApp.'}
      </p>

      <form onSubmit={handleSubmit} className="premium-b2b-grid-form">
        <div className="premium-field">
          <span className="field-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>{locale === 'lo' ? 'ຊື່ ແລະ ນາມສະກຸນ' : 'Họ và tên người phụ trách'}</span>
          </span>
          <input
            type="text"
            placeholder={locale === 'lo' ? 'ຕົວຢ່າງ: Somchai...' : 'Ví dụ: Nguyễn Văn A'}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div className="premium-field">
          <span className="field-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span>{locale === 'lo' ? 'ເບີໂທ' : 'Số điện thoại liên hệ'}</span>
          </span>
          <input
            type="tel"
            placeholder="020 9535 5355"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        <div className="premium-field wide">
          <span className="field-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            <span>{locale === 'lo' ? 'ຊື່ສະຖານປະກອບການ' : 'Tên Cơ Sở y tế / Nhà thuốc'}</span>
          </span>
          <input
            type="text"
            placeholder={locale === 'lo' ? 'ຕົວຢ່າງ: Vientiane Pharmacy' : 'Ví dụ: Nhà thuốc Vientiane'}
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
          />
        </div>

        <div className="premium-field wide">
          <span className="field-title-legend">{locale === 'lo' ? 'ປະເພດທຸລະກິດ' : 'Loại hình kinh doanh'}</span>
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#374151', fontWeight: 500, fontSize: '0.95rem', cursor: 'pointer' }}>
              <input
                type="radio"
                name="businessType"
                value="hospital_clinic"
                checked={businessType === 'hospital_clinic'}
                onChange={() => setBusinessType('hospital_clinic')}
                style={{ width: '1.2rem', height: '1.2rem', accentColor: '#10b981' }}
              />
              <span>{locale === 'lo' ? 'ໂຮງໝໍ / ຄລີນິກ' : 'Bệnh viện / Phòng khám'}</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#374151', fontWeight: 500, fontSize: '0.95rem', cursor: 'pointer' }}>
              <input
                type="radio"
                name="businessType"
                value="pharmacy"
                checked={businessType === 'pharmacy'}
                onChange={() => setBusinessType('pharmacy')}
                style={{ width: '1.2rem', height: '1.2rem', accentColor: '#10b981' }}
              />
              <span>{locale === 'lo' ? 'ຮ້ານຂາຍຢາ' : 'Nhà thuốc'}</span>
            </label>
          </div>
        </div>

        <div className="premium-field wide">
          <span className="field-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{locale === 'lo' ? 'ວັນເດືອນປີເກີດ' : 'Ngày tháng năm sinh'}</span>
          </span>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            required
            style={{ colorScheme: 'dark' }}
          />
        </div>

        <div className="premium-field">
          <span className="field-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{locale === 'lo' ? 'ແຂວງ / ນະຄອນ' : 'Tỉnh / Thành phố tại Lào'}</span>
          </span>
          <input
            type="text"
            placeholder="Vientiane"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            required
          />
        </div>

        <div className="premium-field">
          <span className="field-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
            <span>{locale === 'lo' ? 'ລະຫັດແນະນຳ (ຖ້າມີ)' : 'Mã giới thiệu (nếu có)'}</span>
          </span>
          <div className="referral-input-wrapper">
            <input
              type="text"
              placeholder="NNC-REF-..."
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
            />
            <button type="button" className="btn-validate-referral" onClick={handleValidateRef}>
              <span>{locale === 'lo' ? 'ກວດສອບ' : 'Kiểm tra'}</span>
            </button>
          </div>
          {refStatusMsg && (
            <span
              className="referral-status-msg"
              style={{ color: refStatusMsg.isValid ? '#10b981' : '#ef4444', fontSize: '0.85rem', marginTop: '0.3rem', display: 'block' }}
            >
              {refStatusMsg.text}
            </span>
          )}
        </div>

        <label className="premium-consent-box wide">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            required
          />
          <span>
            {locale === 'lo'
              ? 'ຂ້ອຍຍິນຍອມໃຫ້ NNC ບັນທຶກຂໍ້ມູນ ແລະ ຕິດຕໍ່ເພື່ອໃຫ້ຄຳປຶກສາ.'
              : 'Tôi đồng ý để NNC ghi nhận thông tin tham gia, nhu cầu sản phẩm, mã giới thiệu và nhóm quyền lợi; đồng thời liên hệ theo kênh tôi chọn để tư vấn sản phẩm, chính sách sỉ và hỗ trợ đặt hàng.'}
          </span>
        </label>

        <div className="premium-form-actions wide">
          <button type="submit" className="btn-submit-premium">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{locale === 'lo' ? 'ບັນທຶກ ແລະ ຕໍ່ໄປ' : 'LƯU THÔNG TIN & TIẾP TỤC'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
