import { motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ResultExport } from '../components/ResultExport'
import type { SubmissionUiState } from '../components/SubmissionStatus'
import { SubmissionStatus } from '../components/SubmissionStatus'
import { useSession } from '../context/SessionContext'
import { useSettings } from '../context/SettingsContext'
import { GOOGLE_SHEETS_WEB_APP_URL } from '../lib/config'
import { buildSubmission } from '../lib/dataset'
import { exitFullscreen } from '../lib/fullscreen'
import { checkEndpointUrl, submitToGoogleSheets } from '../lib/googleSheets'

export function SummaryScreen() {
  const navigate = useNavigate()
  const {
    hydrated,
    isSessionComplete,
    results,
    sessionId,
    participantId,
    consentSignedAt,
    resetSession,
    demographicData,
    orderNumber,
    participantNumber,
    conditionOrder,
    centralSubmission,
    markCentralSubmission,
  } =
    useSession()
  const { messages, language } = useSettings()
  const endpoint = useMemo(() => checkEndpointUrl(GOOGLE_SHEETS_WEB_APP_URL), [])
  // Only async outcomes live in state; "saved" and "not configured" are derived below.
  const [requestState, setRequestState] = useState<SubmissionUiState>({ kind: 'sending' })
  const inFlightRef = useRef(false)

  useEffect(() => {
    if (!hydrated) return
    if (!isSessionComplete) {
      navigate('/')
      return
    }
    // Exit fullscreen when reaching summary screen
    exitFullscreen()
  }, [hydrated, isSessionComplete, navigate])

  const sendSubmission = useCallback(async () => {
    if (!endpoint.ok || inFlightRef.current) return
    inFlightRef.current = true
    try {
      const payload = buildSubmission({
        sessionId,
        participantId,
        consentSignedAt,
        participantNumber,
        orderNumber,
        conditionOrder,
        language,
        demographicData,
        results,
      })
      const result = await submitToGoogleSheets(endpoint.url, payload)
      if (result.ok) {
        markCentralSubmission(result.status)
      } else {
        setRequestState({ kind: 'failed', detail: `${result.reason}: ${result.message}` })
      }
    } catch (error) {
      setRequestState({ kind: 'failed', detail: error instanceof Error ? error.message : 'unknown error' })
    } finally {
      inFlightRef.current = false
    }
  }, [endpoint, sessionId, participantId, consentSignedAt, participantNumber, orderNumber, conditionOrder, language, demographicData, results, markCentralSubmission])

  // Submit automatically once per session. A confirmed submission is persisted in the
  // session, so reloading this screen does not send it again.
  useEffect(() => {
    if (!hydrated || !isSessionComplete || !results.length || centralSubmission) return
    void sendSubmission()
  }, [hydrated, isSessionComplete, results.length, centralSubmission, sendSubmission])

  const handleRetry = () => {
    setRequestState({ kind: 'sending' })
    void sendSubmission()
  }

  const submissionState: SubmissionUiState = !endpoint.ok
    ? { kind: 'not-configured', detail: endpoint.message }
    : centralSubmission
      ? { kind: 'saved' }
      : requestState

  const handleReset = () => {
    resetSession()
    navigate('/')
  }

  if (!results.length) {
    return null
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-100 via-white to-neutral-200 px-3 py-8 sm:px-4 sm:py-12 md:px-6 md:py-16 transition-colors duration-300 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-3xl space-y-6 sm:space-y-8"
      >
        <div className="space-y-4 sm:space-y-6 rounded-2xl sm:rounded-3xl border border-neutral-200 bg-white/95 p-6 sm:p-8 md:p-10 shadow-soft backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/80">
          <header className="space-y-3 sm:space-y-4">
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-neutral-900 dark:text-neutral-100">
              {messages.result.title}
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300">{messages.result.subtitle}</p>
          </header>

          <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
            <p>{messages.result.debriefingParagraph1}</p>
            <p>{messages.result.debriefingParagraph2}</p>
            <p>{messages.result.debriefingParagraph3}</p>
            <p>{messages.result.debriefingParagraph4}</p>
            <p className="font-medium">{messages.result.debriefingParagraph5}</p>
          </div>

          <SubmissionStatus state={submissionState} onRetry={handleRetry} />

          <ResultExport
            results={results}
            participantId={participantId}
            sessionId={sessionId}
            consentSignedAt={consentSignedAt}
            demographicData={demographicData}
            onReset={handleReset}
          />
        </div>
      </motion.main>
    </div>
  )
}
