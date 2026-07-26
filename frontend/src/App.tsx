import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import PageLoader from './components/PageLoader'

// Lazy-loaded routes → each page (and its heavy deps like recharts) ships as its
// own chunk, so the initial load only pulls the shell + the first route.
const Overview = lazy(() => import('./pages/Overview'))
const BusinessOverview = lazy(() => import('./pages/BusinessOverview'))
const StreamingAnomalies = lazy(() => import('./pages/StreamingAnomalies'))
const ReportsActions = lazy(() => import('./pages/ReportsActions'))
const GovernanceConsent = lazy(() => import('./pages/GovernanceConsent'))
const DataSharing = lazy(() => import('./pages/DataSharing'))
const AskQuestion = lazy(() => import('./pages/AskQuestion'))

function App() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/business-overview" element={<BusinessOverview />} />
          <Route path="/streaming-anomalies" element={<StreamingAnomalies />} />
          <Route path="/reports-actions" element={<ReportsActions />} />
          <Route path="/governance-consent" element={<GovernanceConsent />} />
          <Route path="/data-sharing" element={<DataSharing />} />
          <Route path="/ask-question" element={<AskQuestion />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

export default App
