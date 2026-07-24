import React from 'react';
import type { Locale } from '../model/types';

interface RulesPdfModalProps {
  isOpen: boolean;
  locale: Locale;
  onClose: () => void;
}

export const RulesPdfModal: React.FC<RulesPdfModalProps> = ({
  isOpen,
  locale,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay active" onClick={onClose}>
      <div className="modal-card pdf-modal-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="btn-modal-close" onClick={onClose}>
          ×
        </button>
        <div className="modal-header">
          <h3>{locale === 'lo' ? 'ລາຍລະອຽດໂຄງການ' : 'Chi tiết chương trình'}</h3>
        </div>
        <div className="modal-body bg-slate-100">
          <div className="pdf-image-wrapper">
            <img
              src="/images/page-1.png"
              alt="NNC B2B Q3 2026 Program Rules"
              className="pdf-page-img"
            />
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            {locale === 'lo' ? 'ປິດ' : 'Đóng'}
          </button>
          <a
            href="/images/page-1.png"
            download="nnc-b2b-program-rules.png"
            className="btn-primary-link"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>{locale === 'lo' ? 'ດາວໂຫຼດຮູບພາບ' : 'Tải xuống hình ảnh'}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
