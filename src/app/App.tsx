import { useEffect, useReducer } from 'react';
import { CampaignFlow } from '../features/campaign/components/CampaignFlow';
import { Footer } from '../features/campaign/components/Footer';
import { Header } from '../features/campaign/components/Header';
import { Hero } from '../features/campaign/components/Hero';
import { PolicySection } from '../features/campaign/components/PolicySection';
import { ProductCatalog } from '../features/campaign/components/ProductCatalog';
import { TrustBadges } from '../features/campaign/components/TrustBadges';
import { campaignReducer } from '../features/campaign/model/reducer';
import { loadCampaignState, saveCampaignState } from '../features/campaign/model/storage';
import type { CampaignStep, Product } from '../features/campaign/model/types';
import { buildWhatsAppUrl } from '../shared/lib/whatsapp';

export default function App() {
  const [state, dispatch] = useReducer(campaignReducer, undefined, loadCampaignState);

  useEffect(() => {
    saveCampaignState(state);
    document.body.dataset.locale = state.locale;
    document.documentElement.lang = state.locale === 'vi' ? 'vi' : 'lo';
  }, [state]);

  const openFlow = (step?: Exclude<CampaignStep, 'browse'>) => {
    const resolvedStep =
      step ??
      (state.spin
        ? 'cart'
        : state.registration && state.policyAcknowledged
        ? 'spin'
        : state.registration
        ? 'policy'
        : 'register');
    dispatch({ type: 'OPEN_FLOW', step: resolvedStep });
  };

  const handleSelectProduct = (product: Product) => {
    dispatch({ type: 'SET_SELECTED_PRODUCT_ID', productId: product.id });
    dispatch({ type: 'OPEN_FLOW', step: 'register' });
  };

  return (
    <>
      <Header
        locale={state.locale}
        onLocaleChange={(locale) => dispatch({ type: 'SET_LOCALE', locale })}
        onOpenWhatsApp={() =>
          window.open(
            buildWhatsAppUrl(
              state.locale === 'lo'
                ? 'ສະບາຍດີ NNC Pharma Laos! ຂ້ອຍຕ້ອງການປຶກສາໂຄງການ B2B Q3/2026.'
                : 'Xin chào NNC Pharma Laos! Tôi muốn tư vấn về chương trình B2B Q3/2026.'
            ),
            '_blank',
            'noopener,noreferrer'
          )
        }
      />
      <main>
        <Hero
          locale={state.locale}
          onOpenRegister={() => openFlow('register')}
          onOpenPolicy={() => {
            const policyEl = document.getElementById('accumulation');
            policyEl?.scrollIntoView({ behavior: 'smooth' });
          }}
        />
        <TrustBadges locale={state.locale} />
        <ProductCatalog
          locale={state.locale}
          onSelectProduct={handleSelectProduct}
        />
        <PolicySection
          locale={state.locale}
          onOpenRulesPdf={() => dispatch({ type: 'SET_RULES_PDF_OPEN', open: true })}
        />
      </main>
      <Footer locale={state.locale} />
      <CampaignFlow state={state} dispatch={dispatch} />
    </>
  );
}
