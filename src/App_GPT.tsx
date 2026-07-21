import { Navigate, Route, Routes } from 'react-router-dom'
import { CampaignPage } from '@/components/campaign-page'

const claimPreviewEnabled = import.meta.env.VITE_ENABLE_MEDICAL_CLAIM_PREVIEW === 'true'
const defaultVariant = import.meta.env.VITE_DEFAULT_VARIANT === 'medical-preview' && claimPreviewEnabled
  ? 'medical-preview'
  : 'safe'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CampaignPage variant={defaultVariant} />} />
      <Route path="/safe" element={<CampaignPage variant="safe" />} />
      <Route
        path="/claim-preview"
        element={claimPreviewEnabled ? <CampaignPage variant="medical-preview" /> : <Navigate to="/safe" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
