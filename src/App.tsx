import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import type { User as FirebaseUser } from 'firebase/auth';

// Import Types
import {
  UnifiedLead,
  AppLanguage,
  AnalyticsEvent,
  LeadActivity,
  CrmRole,
  CrmUserSession,
  LandingDailyStat,
  AiLeadFeature,
  LeadIntegrationWorkspace,
  WebhookDeliveryDetail
} from './types';

import { Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  landingRegistry,
  type AssetReplacementJob,
  type LandingClaim,
  type LandingAsset,
  type LandingFormDefinition,
  type LandingRegistryEntry,
  type LandingVersion,
  type LandingWorkspacePermissions,
} from '@/config/landing-registry';
import { getLandingRuntimeConfig } from '@/lib/landing-service';
import type { AssetUploadPhase, LandingCommand } from '@/lib/admin-landing-service';
import type { IntegrationFilters } from '@/lib/admin-integration-service';

const NncB2BRewardsCampaignPage = lazy(() => (
  import('@/components/nnc-b2b-rewards/campaign-page').then((module) => ({
    default: module.NncB2BRewardsCampaignPage
  }))
));

const getAuthTools = async () => {
  const [{ auth }, authModule] = await Promise.all([
    import('./firebase'),
    import('firebase/auth')
  ]);
  return { auth, ...authModule };
};

const getFirestoreTools = async () => {
  const [{ db }, firestoreModule] = await Promise.all([
    import('./firebase'),
    import('firebase/firestore')
  ]);
  return { db, ...firestoreModule };
};





export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const { i18n } = useTranslation();
  const initialLanguage = i18n.resolvedLanguage?.split('-')[0];
  const [lang, setLangState] = useState<AppLanguage>(
    initialLanguage === 'lo' || initialLanguage === 'en' ? initialLanguage : 'vi'
  );
  const setLang = (l: AppLanguage) => {
    setLangState(l);
    void i18n.changeLanguage(l);
  };

  useEffect(() => {
    const syncLanguage = (nextLanguage: string) => {
      const normalized = nextLanguage.split('-')[0];
      setLangState(normalized === 'lo' || normalized === 'en' ? normalized : 'vi');
    };
    i18n.on('languageChanged', syncLanguage);
    return () => i18n.off('languageChanged', syncLanguage);
  }, [i18n]);
  const [authReady, setAuthReady] = useState(false);
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Suspense fallback={<div className="min-h-screen bg-white" aria-label="Loading application" />}>
        <Routes>
        {/* The ONLY route is the NNC B2B Rewards Campaign */}
        <Route path="*" element={
          <NncB2BRewardsCampaignPage
            lang={lang === 'en' ? 'vi' : lang}
            setLang={setLang}
            landingId="nnc-b2b-online-rewards-q3-2026"
            campaignId="NNC_B2B_ONLINE_REWARDS_Q3_2026"
            templateId="nnc_b2b_rewards_v2"
            landingVersion={2}
          />
        } />
        </Routes>
      </Suspense>

    </div>
  );
}
