import type { Dispatch } from 'react';
import { Dialog } from '../../../shared/ui/Dialog';
import { buildWhatsAppUrl } from '../../../shared/lib/whatsapp';
import type { CampaignAction, CampaignState, RegistrationData, SpinResult } from '../model/types';
import { translate } from '../model/translations';
import type { CampaignRepository } from '../services/campaignRepository';
import { CartStep } from './CartStep';
import { CompletionStep } from './CompletionStep';
import { FlowProgress } from './FlowProgress';
import { ProgramStep } from './ProgramStep';
import { RegistrationStep } from './RegistrationStep';
import { WheelStep } from './WheelStep';

interface CampaignFlowProps {
  state: CampaignState;
  dispatch: Dispatch<CampaignAction>;
  repository: CampaignRepository;
}

export function CampaignFlow({ state, dispatch, repository }: CampaignFlowProps) {
  const locale = state.locale;
  const saving = state.firestoreStatus === 'saving';
  const setSaving = (status: CampaignState['firestoreStatus']) => dispatch({ type: 'SET_FIRESTORE_STATUS', status });

  const execute = async (task: () => Promise<void>): Promise<boolean> => {
    setSaving('saving');
    try {
      await task();
      setSaving('saved');
      return true;
    } catch (error) {
      console.error(error);
      setSaving('error');
      return false;
    }
  };

  const saveRegistration = async (registration: RegistrationData) => {
    const saved = await execute(() => repository.saveRegistration(registration));
    if (saved) dispatch({ type: 'SAVE_REGISTRATION', registration });
  };

  const continuePolicy = async () => {
    if (!state.registration || !state.selectedTierId || !state.policyAcknowledged) return;
    const saved = await execute(() => repository.savePolicyAcknowledgement({
      phone: state.registration!.phone,
      selectedTierId: state.selectedTierId!,
      policyVersion: 'Q3-2026-LAO-v1',
    }));
    if (saved) dispatch({ type: 'GO_TO_STEP', step: 'spin' });
  };

  const saveSpin = async (spin: SpinResult) => {
    if (!state.registration) return;
    const saved = await execute(() => repository.saveSpinPreview({ phone: state.registration!.phone, spin }));
    if (saved) dispatch({ type: 'SAVE_SPIN', spin });
  };

  const sendCart = async () => {
    if (!state.registration) return;
    const saved = await execute(() => repository.saveCartDraft({ phone: state.registration!.phone, cart: state.cart }));
    if (!saved) return;
    window.open(buildWhatsAppUrl(state), '_blank', 'noopener,noreferrer');
    dispatch({ type: 'GO_TO_STEP', step: 'complete' });
    void repository.saveCompletion(state);
  };

  const completeWithoutCart = () => {
    dispatch({ type: 'GO_TO_STEP', step: 'complete' });
    void repository.saveCompletion(state);
  };

  const title = state.step === 'browse'
    ? translate(locale, 'flow.register')
    : translate(locale, `flow.${state.step}`);

  return (
    <Dialog open={state.dialogOpen} title={title} closeLabel={translate(locale, 'common.close')} onClose={() => dispatch({ type: 'CLOSE_FLOW' })}>
      <div style={{ display: 'grid', gap: 28 }}>
        {state.firestoreStatus === 'error' && (
          <p role="alert" style={{ margin: 0, padding: '12px 14px', borderRadius: 12, background: '#fff0ed', color: '#9f2d20', fontSize: '.82rem' }}>
            {locale === 'vi' ? 'Không thể lưu dữ liệu. Vui lòng kiểm tra kết nối hoặc cấu hình Firebase rồi thử lại.' : 'ບໍ່ສາມາດບັນທຶກຂໍ້ມູນ. ກະລຸນາກວດສອບ Firebase ແລະ ລອງໃໝ່.'}
          </p>
        )}
        <FlowProgress step={state.step} locale={locale} />

        {state.step === 'register' && (
          <RegistrationStep locale={locale} initialValue={state.registration} saving={saving} onSubmit={saveRegistration} />
        )}

        {state.step === 'policy' && (
          <ProgramStep
            locale={locale}
            selectedTierId={state.selectedTierId}
            acknowledged={state.policyAcknowledged}
            saving={saving}
            onSelectTier={(tierId) => dispatch({ type: 'SELECT_TIER', tierId })}
            onAcknowledge={(value) => dispatch({ type: 'ACKNOWLEDGE_POLICY', value })}
            onBack={() => dispatch({ type: 'GO_TO_STEP', step: 'register' })}
            onContinue={continuePolicy}
          />
        )}

        {state.step === 'spin' && (
          <WheelStep
            locale={locale}
            spin={state.spin}
            saving={saving}
            onBack={() => dispatch({ type: 'GO_TO_STEP', step: 'policy' })}
            onSaveSpin={saveSpin}
            onContinue={() => dispatch({ type: 'GO_TO_STEP', step: 'cart' })}
          />
        )}

        {state.step === 'cart' && (
          <CartStep
            locale={locale}
            cart={state.cart}
            saving={saving}
            onQuantityChange={(productId, quantity) => dispatch({ type: 'SET_CART_QUANTITY', productId, quantity })}
            onBack={() => dispatch({ type: 'GO_TO_STEP', step: 'spin' })}
            onSend={sendCart}
            onSkip={completeWithoutCart}
          />
        )}

        {state.step === 'complete' && (
          <CompletionStep
            locale={locale}
            state={state}
            onWhatsApp={() => window.open(buildWhatsAppUrl(state), '_blank', 'noopener,noreferrer')}
            onClose={() => dispatch({ type: 'CLOSE_FLOW' })}
            onReset={() => dispatch({ type: 'RESET_FLOW' })}
          />
        )}
      </div>
    </Dialog>
  );
}
