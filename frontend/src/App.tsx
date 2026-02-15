import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Overview from './pages/Overview'
import StreamingAnomalies from './pages/StreamingAnomalies'
import GovernanceConsent from './pages/GovernanceConsent'
import DataSharing from './pages/DataSharing'
import AskQuestion from './pages/AskQuestion'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/streaming-anomalies" element={<StreamingAnomalies />} />
        <Route path="/governance-consent" element={<GovernanceConsent />} />
        <Route path="/data-sharing" element={<DataSharing />} />
        <Route path="/ask-question" element={<AskQuestion />} />
      </Routes>
    </Layout>
  )
}

export default App
