import { AnimatePresence } from 'framer-motion'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { ScrollToTop } from './components/ScrollToTop'
import { SettingsBar } from './components/SettingsBar'
import { DemographicQuestionnaireScreen } from './pages/DemographicQuestionnaireScreen'
import { InstructionsScreen } from './pages/InstructionsScreen'
import { MediaScreen } from './pages/MediaScreen'
import { QuestionnaireScreen } from './pages/QuestionnaireScreen'
import { SummaryScreen } from './pages/SummaryScreen'
import { WelcomeScreen } from './pages/WelcomeScreen'

function AnimatedAppRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/demographics" element={<DemographicQuestionnaireScreen />} />
        <Route path="/instructions" element={<InstructionsScreen />} />
        <Route path="/media/:index" element={<MediaScreen />} />
        <Route path="/questionnaire/:index" element={<QuestionnaireScreen />} />
        <Route path="/summary" element={<SummaryScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 transition-colors duration-300 dark:bg-neutral-950 dark:text-neutral-100">
      <ScrollToTop />
      <SettingsBar />
      <AnimatedAppRoutes />
    </div>
  )
}
