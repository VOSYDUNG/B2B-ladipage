import React, { useState } from 'react';
import type { Reward, Locale, SpinResult, RegistrationData } from '../model/types';
import { buildWhatsAppUrl } from '../../../shared/lib/whatsapp';

interface SpinResultModalProps {
  reward: Reward | null;
  spin: SpinResult | null;
  registration: RegistrationData | null;
  locale: Locale;
  onProceedToCart: () => void;
}

export const SpinResultModal: React.FC<SpinResultModalProps> = ({
  reward,
  spin,
  registration,
  locale,
  onProceedToCart,
}) => {
  const [copiedCodeMsg, setCopiedCodeMsg] = useState(false);
  const [copiedLinkMsg, setCopiedLinkMsg] = useState(false);

  if (!reward) return null;

  const rewardName = locale === 'lo' ? reward.nameLo : reward.nameVi;
  const condition = locale === 'lo' ? reward.conditionLo : reward.conditionVi;
  const refCode = spin?.referralCode || `NNC-REF-${Math.floor(10000 + Math.random() * 90000)}`;
  const refLink = `https://salesonlinennc.web.app/?ref=${refCode}`;

  const copyCode = () => {
    navigator.clipboard.writeText(refCode);
    setCopiedCodeMsg(true);
    setTimeout(() => setCopiedCodeMsg(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(refLink);
    setCopiedLinkMsg(true);
    setTimeout(() => setCopiedLinkMsg(false), 2000);
  };

  const handleClaimWhatsApp = () => {
    const text = locale === 'lo'
      ? `ສະບາຍດີ NNC Pharma Laos! ຂ້ອຍແມ່ນ ${registration?.fullName || ''} (${registration?.businessName || ''}). ຂ້ອຍໄດ້ໝູນໄດ້: ${rewardName}. ລະຫັດແນະນຳ: ${refCode}. ກະລຸນາຢືນຢັນ.`
      : `Xin chào NNC Pharma Laos! Tôi là ${registration?.fullName || ''} đại diện ${registration?.businessName || ''}. Tôi vừa quay trúng phần quà: ${rewardName}. Mã giới thiệu của tôi: ${refCode}. Xin hỗ trợ xác nhận quà tri ân.`;

    window.open(buildWhatsAppUrl(text), '_blank');
  };

  return (
    <div className="modal-card result-modal-card" style={{ padding: '2rem', textAlign: 'center' }}>
      <div className="reward-sparkle-bg"></div>
      <h2>{locale === 'lo' ? 'ຂໍສະແດງຄວາມຍິນດີ!' : 'Chúc mừng anh/chị!'}</h2>
      <p className="result-intro-text">
        {locale === 'lo'
          ? 'ຜົນປະໂຫຍດຂອງທ່ານໄດ້ຖືກບັນທຶກແລ້ວ. ທ່ານໄດ້ຮັບ:'
          : 'Quyền lợi sỉ Q3 đã được ghi nhận thành công. Anh/chị đã trúng:'}
      </p>

      <div className="reward-highlight-box" style={{ background: 'rgba(240, 180, 41, 0.15)', border: '2px solid #F0B429', borderRadius: '12px', padding: '1.2rem', margin: '1.2rem 0' }}>
        <svg className="icon-gift" viewBox="0 0 24 24" fill="none" stroke="#F0B429" strokeWidth="2" style={{ width: '40px', height: '40px', margin: '0 auto 0.5rem' }}>
          <polyline points="20 12 20 22 4 22 4 12"></polyline>
          <rect x="2" y="7" width="20" height="5"></rect>
          <line x1="12" y1="22" x2="12" y2="7"></line>
          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
        </svg>
        <h3 style={{ color: '#F0B429', fontSize: '1.4rem', margin: 0 }}>{rewardName}</h3>
        {condition && (
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginTop: '0.4rem' }}>
            ({condition})
          </p>
        )}
      </div>

      {/* Referral Sharing Section */}
      <div className="referral-sharing-area" style={{ background: '#062B24', borderRadius: '12px', padding: '1.2rem', marginBottom: '1.5rem', textAlign: 'left' }}>
        <h4 style={{ color: '#10B981', margin: '0 0 0.5rem' }}>
          {locale === 'lo'
            ? 'ແນະນຳເພື່ອນຮ່ວມງານ — ຮັບ 5% ຂອງບິນທຳອິດ'
            : 'Giới thiệu đồng nghiệp — nhận 5% giá trị đơn đầu của họ'}
        </h4>
        <p className="ref-desc text-white-60" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '1rem' }}>
          {locale === 'lo'
            ? 'ແບ່ງປັນລະຫັດນີ້ໃຫ້ເພື່ອນຮ່ວມງານ. ເມື່ອເຂົາເຈົ້າສັ່ງບິນທຳອິດ, ທ່ານຈະໄດ້ຮັບ 5% ຫຼຸດບິນຖັດໄປ.'
            : 'Chia sẻ mã dành riêng này tới đồng nghiệp sở hữu quầy thuốc/phòng khám. Khi họ chốt đơn đầu tiên cùng NNC, 5% giá trị đơn được khấu trừ trực tiếp vào đơn nhập kế tiếp của anh/chị.'}
        </p>

        <div className="share-links-grid" style={{ display: 'grid', gap: '1rem' }}>
          <div className="share-box">
            <span style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>
              {locale === 'lo' ? 'ລະຫັດແນະນຳ:' : 'Mã giới thiệu của bạn:'}
            </span>
            <div className="copy-input" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem' }}>
              <code style={{ background: '#083D33', padding: '0.5rem 0.8rem', borderRadius: '6px', color: '#F0B429', fontWeight: 700, flex: 1 }}>
                {refCode}
              </code>
              <button type="button" onClick={copyCode} style={{ background: '#10B981', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.5rem 1rem', cursor: 'pointer' }}>
                {copiedCodeMsg ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="share-box">
            <span style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>
              {locale === 'lo' ? 'ລິ້ງແບ່ງປັນ:' : 'Link chia sẻ nhanh:'}
            </span>
            <div className="copy-input" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem' }}>
              <code style={{ background: '#083D33', padding: '0.5rem 0.8rem', borderRadius: '6px', color: '#F0B429', fontSize: '0.8rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {refLink}
              </code>
              <button type="button" onClick={copyLink} style={{ background: '#10B981', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.5rem 1rem', cursor: 'pointer' }}>
                {copiedLinkMsg ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="result-actions-btns" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        <button
          type="button"
          onClick={handleClaimWhatsApp}
          style={{
            background: '#25D366',
            color: '#fff',
            border: 'none',
            borderRadius: '50px',
            padding: '0.9rem 1.5rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.03-5.114-2.905-6.99C16.557 1.87 14.07 1.834 11.44 1.834c-5.44 0-9.868 4.42-9.872 9.867a9.813 9.813 0 0 0 1.5 4.85l-.988 3.606 3.69-.968zm11.233-6.84c-.303-.152-1.793-.884-2.071-.985-.278-.1-.482-.152-.68.152-.2.303-.774.985-.95 1.187-.176.202-.351.228-.654.076-.303-.152-1.278-.47-2.435-1.503-.9-.8-1.51-1.787-1.686-2.09-.176-.303-.02-.467.132-.618.136-.137.303-.351.455-.527.152-.176.202-.303.303-.506.1-.202.05-.38-.025-.53-.075-.152-.682-1.644-.934-2.253-.247-.597-.497-.516-.68-.527-.176-.01-.38-.012-.582-.012-.202 0-.53.076-.807.38-.278.303-1.062 1.037-1.062 2.529 0 1.493 1.087 2.935 1.238 3.137.152.202 2.138 3.262 5.18 4.58.724.313 1.289.5 1.73.64.728.23 1.39.197 1.91.12.58-.087 1.794-.733 2.048-1.443.254-.71.254-1.317.177-1.443-.077-.126-.278-.202-.582-.354z" />
          </svg>
          <span>{locale === 'lo' ? 'ຢືນຢັນຜ່ານ WHATSAPP' : 'XÁC NHẬN QUÀ QUA WHATSAPP — CHỈ 1 CHẠM'}</span>
        </button>

        <button
          type="button"
          onClick={onProceedToCart}
          style={{
            background: 'transparent',
            color: '#F0B429',
            border: '1px solid #F0B429',
            borderRadius: '50px',
            padding: '0.7rem 1.5rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {locale === 'lo' ? 'ສ້າງບິນສັ່ງຊື້ອ້າງອີງ →' : 'Trải nghiệm lên đơn đầu tiên →'}
        </button>
      </div>
    </div>
  );
};
