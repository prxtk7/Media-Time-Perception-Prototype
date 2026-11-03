import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LoadingOverlay } from '../components/LoadingOverlay'
import { Button } from '../components/shared/Button'
import { useSession } from '../context/SessionContext'
import { useSettings } from '../context/SettingsContext'
import { generateParticipantId } from '../lib/id'

const containerVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

export function WelcomeScreen() {
  const navigate = useNavigate()
  const {
    startSession,
    hydrated,
    isSessionActive,
    participantId,
    participantName,
    markConsent,
    consentGiven,
  } = useSession()
  const { messages, t } = useSettings()
  const [assignedId, setAssignedId] = useState(() => generateParticipantId())
  const [fullName, setFullName] = useState(participantName)
  const [consent, setConsent] = useState(consentGiven)
  const [transitioning, setTransitioning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle')

  useEffect(() => {
    if (!hydrated) return
    setAssignedId((prev) => (participantId ? participantId : prev))
    setFullName((prev) => (participantName ? participantName : prev))
    setConsent(consentGiven)
  }, [hydrated, participantId, participantName, consentGiven])

  const handleSubmit = () => {
    if (!fullName.trim()) {
      setError(messages.welcome.nameRequired)
      return
    }
    if (!consent) {
      setError(messages.welcome.consentRequired)
      return
    }
    setError(null)
    markConsent(true)
    startSession({
      participantId: assignedId,
      participantName: fullName.trim(),
      consentSignedAt: new Date().toISOString(),
    })
    setTransitioning(true)
    window.setTimeout(() => {
      navigate('/demographics')
    }, 650)
  }

  const handleGenerateNewId = () => {
    const newId = generateParticipantId()
    setAssignedId(newId)
    setCopyStatus('idle')
  }

  const handleCopyId = async () => {
    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard unavailable')
      }
      await navigator.clipboard.writeText(assignedId)
      setCopyStatus('copied')
    } catch (copyError) {
      console.error(copyError)
      setCopyStatus('failed')
    } finally {
      window.setTimeout(() => setCopyStatus('idle'), 2500)
    }
  }

  const handleConsentToggle = (checked: boolean) => {
    setConsent(checked)
    markConsent(checked)
    if (!checked) {
      setError(null)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-100 via-white to-neutral-200 px-3 py-8 sm:px-4 sm:py-12 md:px-6 md:py-16 transition-colors duration-300 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      {transitioning && <LoadingOverlay message={t('loading.loadingInstructions')} />}
      <motion.main
        variants={containerVariants}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-3xl space-y-6 sm:space-y-8 rounded-2xl sm:rounded-3xl border border-neutral-200 bg-white/95 p-6 sm:p-8 md:p-10 shadow-soft backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/80"
      >
        <div className="space-y-3 sm:space-y-4">
          <span className="text-xs uppercase tracking-[0.35em] text-brand-500 dark:text-brand-300">
            {messages.welcome.badge}
          </span>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-neutral-900 dark:text-neutral-100">
            {messages.welcome.title}
          </h1>
          <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">✓ Updated: January 19, 2026</p>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300">{messages.welcome.description}</p>
        </div>

        <div className="space-y-3 sm:space-y-4 rounded-2xl border border-neutral-200 bg-white/90 p-4 sm:p-5 dark:border-neutral-700 dark:bg-neutral-900/70">
          <h2 className="font-display text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            {messages.welcome.importantInstructionsHeading}
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-neutral-600 dark:text-neutral-300">
            {(messages.welcome.importantInstructions || []).map((instruction: string, index: number) => (
              <li key={index}>{instruction}</li>
            ))}
          </ul>
        </div>

        {isSessionActive && (
          <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-4 text-sm text-brand-700 dark:border-brand-400/40 dark:bg-brand-400/10 dark:text-brand-200">
            {t('welcome.resumeWarning', { id: participantId })}
          </div>
        )}

        <form
          className="space-y-4 sm:space-y-6"
          onSubmit={(event) => {
            event.preventDefault()
            handleSubmit()
          }}
        >
          <div className="space-y-3 sm:space-y-4 rounded-2xl border border-neutral-200 bg-white/90 p-4 sm:p-5 dark:border-neutral-700 dark:bg-neutral-900/70">
          <div className="space-y-2">
              <label htmlFor="participantName" className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                {messages.welcome.nameLabel}
            </label>
            <input
                id="participantName"
              type="text"
                value={fullName}
                onChange={(event) => {
                  setFullName(event.target.value)
                  if (error && event.target.value.trim()) {
                    setError(null)
                  }
                }}
              className="w-full rounded-xl sm:rounded-2xl border border-neutral-200 bg-white px-4 sm:px-5 py-3 text-base font-medium text-neutral-800 shadow-sm transition focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-100 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
                placeholder={messages.welcome.namePlaceholder}
                autoComplete="name"
              required
            />
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">{messages.welcome.nameHelper}</p>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4 rounded-2xl border border-neutral-200 bg-white/90 p-4 sm:p-5 dark:border-neutral-700 dark:bg-neutral-900/70">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex-1">
                <p className="text-xs uppercase tracking-[0.32em] text-brand-500 dark:text-brand-300">
                  {messages.welcome.participantLabel}
                </p>
                <p className="mt-2 font-mono text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-neutral-100 break-all">{assignedId}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <Button type="button" variant="ghost" size="md" onClick={handleCopyId} className="flex-1 sm:flex-none min-w-[120px]">
                  {copyStatus === 'copied'
                    ? messages.welcome.copySuccess
                    : copyStatus === 'failed'
                      ? messages.welcome.copyFailure
                      : messages.welcome.copyId}
                </Button>
                <Button type="button" variant="secondary" size="md" onClick={handleGenerateNewId} className="flex-1 sm:flex-none min-w-[120px]">
                  {messages.welcome.regenerateId}
                </Button>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">{messages.welcome.idHelper}</p>
          </div>

          <div className="space-y-3 sm:space-y-4 rounded-2xl border border-neutral-200 bg-white/90 p-4 sm:p-5 dark:border-neutral-700 dark:bg-neutral-900/70">
            <div className="space-y-2 sm:space-y-3">
              <h2 className="font-display text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                {messages.welcome.consentHeading}
              </h2>
              <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
                {messages.welcome.consentParagraphs.map((paragraph: string, index: number) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>

          </div>

          <label className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white/90 p-4 text-sm text-neutral-700 shadow-inner dark:border-neutral-700 dark:bg-neutral-900/70 dark:text-neutral-200">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => handleConsentToggle(event.target.checked)}
              className="mt-1 h-4 w-4 sm:h-5 sm:w-5 rounded border border-neutral-300 text-brand-600 focus:ring-brand-500 dark:border-neutral-600 flex-shrink-0"
              required
            />
            <span className="text-xs sm:text-sm">{messages.welcome.consentText}</span>
          </label>

          {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <p className="text-xs uppercase tracking-[0.35em] text-neutral-400 dark:text-neutral-500 text-center sm:text-left">
              {messages.welcome.stats}
            </p>
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              {messages.welcome.startButton}
            </Button>
          </div>
        </form>
      </motion.main>
    </div>
  )
}
