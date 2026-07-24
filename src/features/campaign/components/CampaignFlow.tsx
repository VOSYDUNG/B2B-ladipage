import React from 'react';
import type { CampaignState, CampaignAction, Reward } from '../model/types';
import { REWARDS } from '../model/config';
import { RegistrationStep } from './RegistrationStep';
import { ProgramStep } from './ProgramStep';
import { WheelStep } from './WheelStep';
import { SpinResultModal } from './SpinResultModal';
import { CartStep } from './CartStep';
import { CompletionStep } from './CompletionStep';
import { RulesPdfModal } from './RulesPdfModal';
import { InvoicePreviewModal } from './InvoicePreviewModal';
import { ProductDetailModal } from './ProductDetailModal';
import { PRODUCTS } from '../model/config';

interface CampaignFlowProps {
  state: CampaignState;
  dispatch: React.Dispatch<CampaignAction>;
}

export const CampaignFlow: React.FC<CampaignFlowProps> = ({ state, dispatch }) => {
  if (!state.dialogOpen) return null;

  const currentStep = state.step;
  const locale = state.locale;

  const getStepNumber = () => {
    switch (currentStep) {
      case 'register':
        return 1;
      case 'policy':
        return 2;
      case 'spin':
        return 3;
      case 'cart':
        return 4;
      case 'complete':
        return 5;
      default:
        return 1;
    }
  };

  const currentStepNum = getStepNumber();

  const handleClose = () => {
    dispatch({ type: 'CLOSE_FLOW' });
  };

  const selectedProduct = state.selectedProductId
    ? PRODUCTS.find((p) => p.id === state.selectedProductId) || null
    : null;

  const wonReward: Reward | null = state.spin
    ? REWARDS.find((r) => r.id === state.spin?.rewardId) || REWARDS[0]
    : null;

  return (
    <div className="funnel-modal-overlay" style={{ display: 'flex' }} onClick={handleClose}>
      <div className="funnel-modal-card-container" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="btn-funnel-modal-close" onClick={handleClose}>
          ×
        </button>

        {/* Stepper Progress Indicator */}
        <div className="modal-stepper-wrapper mb-4" style={{ marginBottom: '1.5rem' }}>
          <div className="stepper-steps" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className={`stepper-step ${currentStepNum >= 1 ? 'active' : ''}`}>
              <div className="step-icon">1</div>
              <div className="step-label">{locale === 'lo' ? 'ລົງທະບຽນ' : 'Đăng ký'}</div>
            </div>
            <div className={`stepper-line ${currentStepNum >= 2 ? 'active' : ''}`} />
            <div className={`stepper-step ${currentStepNum >= 2 ? 'active' : ''}`}>
              <div className="step-icon">2</div>
              <div className="step-label">{locale === 'lo' ? 'ນະໂຍບາຍ' : 'Chương trình'}</div>
            </div>
            <div className={`stepper-line ${currentStepNum >= 3 ? 'active' : ''}`} />
            <div className={`stepper-step ${currentStepNum >= 3 ? 'active' : ''}`}>
              <div className="step-icon">3</div>
              <div className="step-label">{locale === 'lo' ? 'ໝູນຂອງຂວັນ' : 'Quay quà'}</div>
            </div>
            <div className={`stepper-line ${currentStepNum >= 4 ? 'active' : ''}`} />
            <div className={`stepper-step ${currentStepNum >= 4 ? 'active' : ''}`}>
              <div className="step-icon">4</div>
              <div className="step-label">{locale === 'lo' ? 'ສ້າງບິນ' : 'Đơn hàng'}</div>
            </div>
            <div className={`stepper-line ${currentStepNum >= 5 ? 'active' : ''}`} />
            <div className={`stepper-step ${currentStepNum >= 5 ? 'active' : ''}`}>
              <div className="step-icon">5</div>
              <div className="step-label">{locale === 'lo' ? 'ສຳເລັດ' : 'Hoàn thành'}</div>
            </div>
          </div>
        </div>

        {/* Step 1: Registration */}
        {currentStep === 'register' && (
          <RegistrationStep
            initialData={state.registration}
            locale={locale}
            onSubmit={(data) => {
              dispatch({ type: 'SAVE_REGISTRATION', registration: data });
              dispatch({ type: 'GO_TO_STEP', step: 'policy' });
            }}
          />
        )}

        {/* Step 2: Program Review & ACK */}
        {currentStep === 'policy' && (
          <ProgramStep
            locale={locale}
            selectedTierId={state.selectedTierId || 'tier-1'}
            acknowledged={state.policyAcknowledged}
            onSelectTier={(id) => dispatch({ type: 'SELECT_TIER', tierId: id })}
            onAcknowledge={(val) => dispatch({ type: 'ACKNOWLEDGE_POLICY', value: val })}
            onUnlockWheel={() => dispatch({ type: 'GO_TO_STEP', step: 'spin' })}
          />
        )}

        {/* Step 3: Wheel Spin or Spin Result */}
        {currentStep === 'spin' && !state.spin && (
          <WheelStep
            locale={locale}
            onSpinComplete={(result) => {
              dispatch({ type: 'SAVE_SPIN', spin: result });
            }}
          />
        )}

        {currentStep === 'spin' && state.spin && (
          <SpinResultModal
            reward={wonReward}
            spin={state.spin}
            registration={state.registration}
            locale={locale}
            onProceedToCart={() => dispatch({ type: 'GO_TO_STEP', step: 'cart' })}
          />
        )}

        {/* Step 4: Order Form (Cart) */}
        {currentStep === 'cart' && (
          <CartStep
            cart={state.cart}
            registration={state.registration}
            locale={locale}
            onSetQuantity={(id, qty) => dispatch({ type: 'SET_CART_QUANTITY', productId: id, quantity: qty })}
            onOpenInvoiceModal={() => dispatch({ type: 'SET_INVOICE_MODAL_OPEN', open: true })}
            onComplete={() => dispatch({ type: 'GO_TO_STEP', step: 'complete' })}
          />
        )}

        {/* Step 5: Completion */}
        {currentStep === 'complete' && (
          <CompletionStep
            state={state}
            onClose={handleClose}
          />
        )}

        {/* Rules PDF Modal */}
        <RulesPdfModal
          isOpen={state.rulesPdfOpen}
          locale={locale}
          onClose={() => dispatch({ type: 'SET_RULES_PDF_OPEN', open: false })}
        />

        {/* Invoice Canvas Preview Modal */}
        <InvoicePreviewModal
          isOpen={state.invoiceModalOpen}
          cart={state.cart}
          registration={state.registration}
          locale={locale}
          onClose={() => dispatch({ type: 'SET_INVOICE_MODAL_OPEN', open: false })}
        />

        {/* Product Detail Modal */}
        <ProductDetailModal
          product={selectedProduct}
          locale={locale}
          onClose={() => dispatch({ type: 'SET_SELECTED_PRODUCT_ID', productId: null })}
        />
      </div>
    </div>
  );
};
