import { useEffect, useMemo, useReducer } from 'react';
import { CampaignFlow } from '../features/campaign/components/CampaignFlow';
import { Facts } from '../features/campaign/components/Facts';
import { Footer } from '../features/campaign/components/Footer';
import { Header } from '../features/campaign/components/Header';
import { Hero } from '../features/campaign/components/Hero';
import { PolicySection } from '../features/campaign/components/PolicySection';
import { ProductCatalog } from '../features/campaign/components/ProductCatalog';
import { RewardShowcase } from '../features/campaign/components/RewardShowcase';
import { campaignReducer } from '../features/campaign/model/reducer';
import { loadCampaignState, saveCampaignState } from '../features/campaign/model/storage';
import type { CampaignStep } from '../features/campaign/model/types';
import { createCampaignRepository } from '../features/campaign/services';
import { buildWhatsAppUrl } from '../shared/lib/whatsapp';

export default function App() {
  const [state, dispatch] = useReducer(campaignReducer, undefined, loadCampaignState);
  const repository = useMemo(() => createCampaignRepository(), []);

  useEffect(() => {
    saveCampaignState(state);
    document.body.dataset.locale = state.locale;
    document.documentElement.lang = state.locale === 'vi' ? 'vi' : 'lo';
  }, [state]);

  const openFlow = (step?: Exclude<CampaignStep, 'browse'>) => {
    const resolvedStep = step
      ?? (state.spin
        ? 'cart'
        : state.registration && state.policyAcknowledged
          ? 'spin'
          : state.registration
            ? 'policy'
            : 'register');
    dispatch({ type: 'OPEN_FLOW', step: resolvedStep });
  };

  const addProduct = (productId: string) => {
    const current = state.cart.find((line) => line.productId === productId)?.quantity ?? 0;
    dispatch({ type: 'SET_CART_QUANTITY', productId, quantity: current + 1 });
    openFlow(state.spin ? 'cart' : undefined);
  };

  return (
    <>
      <Header
        locale={state.locale}
        onLocaleChange={(locale) => dispatch({ type: 'SET_LOCALE', locale })}
        onOpenWhatsApp={() => window.open(buildWhatsAppUrl(state), '_blank', 'noopener,noreferrer')}
      />
      <main>
        <Hero locale={state.locale} onStart={() => openFlow()} />
        <Facts locale={state.locale} />
        <ProductCatalog locale={state.locale} onAddProduct={addProduct} />
        <PolicySection locale={state.locale} />
        <RewardShowcase locale={state.locale} />
      </main>
      <Footer locale={state.locale} />
      <CampaignFlow state={state} dispatch={dispatch} repository={repository} />
    </>
  );
}
