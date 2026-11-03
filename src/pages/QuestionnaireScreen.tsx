import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { LoadingOverlay } from '../components/LoadingOverlay'
import { Questionnaire, type QuestionnaireSubmitPayload } from '../components/Questionnaire'
import { useSession } from '../context/SessionContext'
import { useSettings } from '../context/SettingsContext'
import { requestFullscreen } from '../lib/fullscreen'

export function QuestionnaireScreen() {
  const navigate = useNavigate()
  const { index } = useParams<{ index: string }>()
  const {
    hydrated,
    isSessionActive,
    isSessionComplete,
    conditionOrder,
    currentIndex,
    getConditionByIndex,
    submitResult,
    participantId,
  } = useSession()
  const { messages, t } = useSettings()
  const numericIndex = Number(index ?? 0)
  const condition = getConditionByIndex(numericIndex)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [transitioning, setTransitioning] = useState(false)

  useEffect(() => {
    if (!hydrated) return
    if (!isSessionActive) {
      navigate('/', { replace: true })
      return
    }
    if (isSessionComplete) {
      navigate('/summary', { replace: true })
      return
    }
    if (Number.isNaN(numericIndex) || numericIndex < 0) {
      navigate(`/media/${currentIndex}`, { replace: true })
      return
    }
    if (numericIndex >= conditionOrder.length) {
      navigate('/summary', { replace: true })
      return
    }
    if (numericIndex !== currentIndex) {
      navigate(`/media/${currentIndex}`, { replace: true })
      return
    }
    // Request fullscreen when entering questionnaire screen
    requestFullscreen()
  }, [
    hydrated,
    isSessionActive,
    isSessionComplete,
    numericIndex,
    conditionOrder.length,
    currentIndex,
    navigate,
  ])

  const handleSubmit = async (values: QuestionnaireSubmitPayload) => {
    if (!condition) return
    setIsSubmitting(true)
    try {
      await Promise.resolve(submitResult(values))
      setTransitioning(true)
      const nextIndex = numericIndex + 1
      window.setTimeout(() => {
        if (nextIndex < conditionOrder.length) {
          navigate(`/media/${nextIndex}`, { replace: true })
        } else {
          navigate('/summary', { replace: true })
        }
      }, 500)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!hydrated || !condition) {
    return null
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-100 via-white to-neutral-200 px-3 py-8 sm:px-4 sm:py-12 md:px-6 md:py-16 transition-colors duration-300 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      {transitioning && <LoadingOverlay message={t('loading.savingResponses')} />}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-5xl space-y-4 sm:space-y-6 md:space-y-8"
      >
        <section className="space-y-4 sm:space-y-6 rounded-2xl sm:rounded-3xl border border-neutral-200 bg-white/95 p-4 sm:p-6 md:p-8 shadow-soft backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/80">
          <div className="space-y-3 sm:space-y-4">
            <span className="text-xs uppercase tracking-[0.35em] text-brand-500 dark:text-brand-300">
              {messages.questionnaireScreen.badge}
            </span>
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-neutral-900 dark:text-neutral-100">
              {messages.questionnaireScreen.title}
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300">{messages.questionnaireScreen.intro}</p>
          </div>

          <div className="grid gap-3 sm:gap-4 rounded-2xl border border-brand-100 bg-brand-50/50 p-3 sm:p-4 text-xs sm:text-sm text-brand-800 dark:border-brand-400/40 dark:bg-brand-400/10 dark:text-brand-100 grid-cols-1 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-brand-500 dark:text-brand-200">
                {messages.result.participantLabel}
              </p>
              <p className="mt-1 sm:mt-2 text-lg sm:text-xl font-semibold text-brand-900 dark:text-brand-100 break-all">{participantId || '—'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-brand-500 dark:text-brand-200">
                {messages.result.table.condition}
              </p>
              <p className="mt-1 sm:mt-2 text-lg sm:text-xl font-semibold capitalize text-brand-900 dark:text-brand-100">
                {messages.media.conditionLabels[condition]}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-brand-500 dark:text-brand-200">
                {t('media.conditionProgress', { current: numericIndex + 1, total: conditionOrder.length })}
              </p>
              <p className="mt-1 sm:mt-2 text-lg sm:text-xl font-semibold text-brand-900 dark:text-brand-100">
                {numericIndex + 1} / {conditionOrder.length}
              </p>
            </div>
          </div>
        </section>

        <Questionnaire onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </motion.main>
    </div>
  )
}

