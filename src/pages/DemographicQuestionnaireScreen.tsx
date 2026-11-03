import { RadioGroup } from '@headlessui/react'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LoadingOverlay } from '../components/LoadingOverlay'
import { Button } from '../components/shared/Button'
import { useSession } from '../context/SessionContext'
import { useSettings } from '../context/SettingsContext'
import { requestFullscreen } from '../lib/fullscreen'

type MediaFrequency = 'very_rarely' | 'rarely' | 'sometimes' | 'often' | 'very_often'
type CaffeineTime = 'less_than_1_hour' | '1_to_3_hours' | 'more_than_3_hours'
type AlertnessLevel = 1 | 2 | 3 | 4 | 5

interface LocalDemographicData {
  age: number | ''
  shortVideosFrequency: MediaFrequency | null
  audioFrequency: MediaFrequency | null
  textFrequency: MediaFrequency | null
  caffeineConsumed: boolean | null
  caffeineTimeAgo: CaffeineTime | null
  alertness: AlertnessLevel | null
}

const mediaFrequencyOptions: { value: MediaFrequency; label: string }[] = [
  { value: 'very_rarely', label: 'Very rarely' },
  { value: 'rarely', label: 'Rarely' },
  { value: 'sometimes', label: 'Sometimes' },
  { value: 'often', label: 'Often' },
  { value: 'very_often', label: 'Very often' },
]

const caffeineTimeOptions: { value: CaffeineTime; label: string }[] = [
  { value: 'less_than_1_hour', label: 'Less than 1 hour ago' },
  { value: '1_to_3_hours', label: '1–3 hours ago' },
  { value: 'more_than_3_hours', label: 'More than 3 hours ago' },
]

const alertnessOptions: { value: AlertnessLevel; label: string }[] = [
  { value: 1, label: '1 — Very tired' },
  { value: 2, label: '2 — Tired' },
  { value: 3, label: '3 — Neutral' },
  { value: 4, label: '4 — Alert' },
  { value: 5, label: '5 — Very alert' },
]

export function DemographicQuestionnaireScreen() {
  const navigate = useNavigate()
  const { hydrated, isSessionActive, setDemographicData } = useSession()
  const { messages, t } = useSettings()
  const [transitioning, setTransitioning] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<LocalDemographicData>({
    age: '',
    shortVideosFrequency: null,
    audioFrequency: null,
    textFrequency: null,
    caffeineConsumed: null,
    caffeineTimeAgo: null,
    alertness: null,
  })

  useEffect(() => {
    if (!hydrated) return
    if (!isSessionActive) {
      navigate('/', { replace: true })
      return
    }
    // Request fullscreen when entering demographics screen
    requestFullscreen()
  }, [hydrated, isSessionActive, navigate])

  const isValid = () => {
    return (
      formData.age !== '' &&
      formData.age > 0 &&
      formData.shortVideosFrequency !== null &&
      formData.audioFrequency !== null &&
      formData.textFrequency !== null &&
      formData.caffeineConsumed !== null &&
      (formData.caffeineConsumed === false || formData.caffeineTimeAgo !== null) &&
      formData.alertness !== null
    )
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const newErrors: Record<string, string> = {}

    if (formData.age === '' || formData.age <= 0) {
      newErrors.age = messages.demographics.ageRequired
    }
    if (formData.shortVideosFrequency === null) {
      newErrors.shortVideosFrequency = messages.demographics.mediaUsageRequired
    }
    if (formData.audioFrequency === null) {
      newErrors.audioFrequency = messages.demographics.mediaUsageRequired
    }
    if (formData.textFrequency === null) {
      newErrors.textFrequency = messages.demographics.mediaUsageRequired
    }
    if (formData.caffeineConsumed === null) {
      newErrors.caffeineConsumed = messages.demographics.caffeineRequired
    }
    if (formData.caffeineConsumed === true && formData.caffeineTimeAgo === null) {
      newErrors.caffeineTimeAgo = messages.demographics.caffeineRequired
    }
    if (formData.alertness === null) {
      newErrors.alertness = messages.demographics.alertnessRequired
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    
    // Store demographic data in session context
    setDemographicData({
      age: formData.age as number,
      shortVideosFrequency: formData.shortVideosFrequency ?? undefined,
      audioFrequency: formData.audioFrequency ?? undefined,
      textFrequency: formData.textFrequency ?? undefined,
      caffeineConsumed: formData.caffeineConsumed ?? undefined,
      caffeineTimeAgo: formData.caffeineTimeAgo ?? undefined,
      alertness: formData.alertness ?? undefined,
    })
    setTransitioning(true)
    window.setTimeout(() => {
      navigate('/instructions')
    }, 500)
  }

  if (!hydrated) {
    return null
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-100 via-white to-neutral-200 px-3 py-8 sm:px-4 sm:py-12 md:px-6 md:py-16 transition-colors duration-300 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      {transitioning && <LoadingOverlay message={t('loading.loadingInstructions')} />}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-3xl space-y-6 sm:space-y-8 rounded-2xl sm:rounded-3xl border border-neutral-200 bg-white/95 p-6 sm:p-8 md:p-10 shadow-soft backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/80"
      >
        <header className="space-y-3 sm:space-y-4">
          <span className="text-xs uppercase tracking-[0.35em] text-brand-500 dark:text-brand-300">
            {messages.demographics.badge}
          </span>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-neutral-900 dark:text-neutral-100">
            {messages.demographics.title}
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300">{messages.demographics.intro}</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Age */}
          <div className="space-y-2">
            <label htmlFor="age" className="text-base font-medium text-neutral-700 dark:text-neutral-200">
              {messages.demographics.ageLabel}
            </label>
            <input
              id="age"
              type="number"
              min={1}
              max={120}
              value={formData.age}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  age: e.target.value === '' ? '' : Number(e.target.value),
                }))
              }
              className={clsx(
                'w-full rounded-xl sm:rounded-2xl border border-neutral-200 bg-white px-4 sm:px-5 py-3 text-base font-medium text-neutral-800 shadow-sm transition focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-100 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100',
                errors.age && 'border-red-400 focus:ring-red-100 dark:border-red-500',
              )}
              placeholder={messages.demographics.agePlaceholder}
            />
            {errors.age && <p className="text-sm text-red-500 dark:text-red-400">{errors.age}</p>}
          </div>

          {/* Media Usage Habits */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {messages.demographics.mediaUsageHeading}
              </h2>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                {messages.demographics.mediaUsageDescription}
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                  a) {messages.demographics.mediaUsageShortVideos}
                </label>
                <RadioGroup
                  value={formData.shortVideosFrequency ?? undefined}
                  onChange={(value: MediaFrequency | null) =>
                    setFormData((prev) => ({ ...prev, shortVideosFrequency: value }))
                  }
                  className="grid grid-cols-5 gap-1.5 sm:gap-2"
                >
                  {mediaFrequencyOptions.map((option) => (
                    <RadioGroup.Option key={option.value} value={option.value}>
                      {({ checked }) => (
                        <button
                          type="button"
                          className={clsx(
                            'flex h-9 sm:h-10 w-full items-center justify-center rounded-lg sm:rounded-xl border text-xs transition',
                            checked
                              ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm dark:border-brand-400 dark:bg-brand-400/20 dark:text-brand-200'
                              : 'border-neutral-200 bg-white text-neutral-500 hover:border-brand-200 hover:text-brand-600 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-brand-400 dark:hover:text-brand-200',
                          )}
                        >
                          {option.label}
                        </button>
                      )}
                    </RadioGroup.Option>
                  ))}
                </RadioGroup>
                {errors.shortVideosFrequency && (
                  <p className="text-sm text-red-500 dark:text-red-400">{errors.shortVideosFrequency}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                  b) {messages.demographics.mediaUsageAudio}
                </label>
                <RadioGroup
                  value={formData.audioFrequency ?? undefined}
                  onChange={(value: MediaFrequency | null) =>
                    setFormData((prev) => ({ ...prev, audioFrequency: value }))
                  }
                  className="grid grid-cols-5 gap-1.5 sm:gap-2"
                >
                  {mediaFrequencyOptions.map((option) => (
                    <RadioGroup.Option key={option.value} value={option.value}>
                      {({ checked }) => (
                        <button
                          type="button"
                          className={clsx(
                            'flex h-9 sm:h-10 w-full items-center justify-center rounded-lg sm:rounded-xl border text-xs transition',
                            checked
                              ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm dark:border-brand-400 dark:bg-brand-400/20 dark:text-brand-200'
                              : 'border-neutral-200 bg-white text-neutral-500 hover:border-brand-200 hover:text-brand-600 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-brand-400 dark:hover:text-brand-200',
                          )}
                        >
                          {option.label}
                        </button>
                      )}
                    </RadioGroup.Option>
                  ))}
                </RadioGroup>
                {errors.audioFrequency && (
                  <p className="text-sm text-red-500 dark:text-red-400">{errors.audioFrequency}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                  c) {messages.demographics.mediaUsageText}
                </label>
                <RadioGroup
                  value={formData.textFrequency ?? undefined}
                  onChange={(value: MediaFrequency | null) =>
                    setFormData((prev) => ({ ...prev, textFrequency: value }))
                  }
                  className="grid grid-cols-5 gap-1.5 sm:gap-2"
                >
                  {mediaFrequencyOptions.map((option) => (
                    <RadioGroup.Option key={option.value} value={option.value}>
                      {({ checked }) => (
                        <button
                          type="button"
                          className={clsx(
                            'flex h-9 sm:h-10 w-full items-center justify-center rounded-lg sm:rounded-xl border text-xs transition',
                            checked
                              ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm dark:border-brand-400 dark:bg-brand-400/20 dark:text-brand-200'
                              : 'border-neutral-200 bg-white text-neutral-500 hover:border-brand-200 hover:text-brand-600 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-brand-400 dark:hover:text-brand-200',
                          )}
                        >
                          {option.label}
                        </button>
                      )}
                    </RadioGroup.Option>
                  ))}
                </RadioGroup>
                {errors.textFrequency && (
                  <p className="text-sm text-red-500 dark:text-red-400">{errors.textFrequency}</p>
                )}
              </div>
            </div>
          </div>

          {/* Caffeine Consumption */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {messages.demographics.caffeineHeading}
              </h2>
              <p className="mt-1 text-sm font-medium text-neutral-700 dark:text-neutral-200">
                {messages.demographics.caffeineQuestion}
              </p>
            </div>
            <RadioGroup
              value={formData.caffeineConsumed ?? undefined}
              onChange={(value: boolean | null) =>
                setFormData((prev) => ({
                  ...prev,
                  caffeineConsumed: value,
                  caffeineTimeAgo: value ? prev.caffeineTimeAgo : null,
                }))
              }
              className="flex gap-4"
            >
              <RadioGroup.Option value={true}>
                {({ checked }) => (
                  <button
                    type="button"
                    className={clsx(
                      'rounded-xl border px-6 py-3 text-sm font-medium transition',
                      checked
                        ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm dark:border-brand-400 dark:bg-brand-400/20 dark:text-brand-200'
                        : 'border-neutral-200 bg-white text-neutral-500 hover:border-brand-200 hover:text-brand-600 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-brand-400 dark:hover:text-brand-200',
                    )}
                  >
                    {messages.demographics.caffeineYes}
                  </button>
                )}
              </RadioGroup.Option>
              <RadioGroup.Option value={false}>
                {({ checked }) => (
                  <button
                    type="button"
                    className={clsx(
                      'rounded-xl border px-6 py-3 text-sm font-medium transition',
                      checked
                        ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm dark:border-brand-400 dark:bg-brand-400/20 dark:text-brand-200'
                        : 'border-neutral-200 bg-white text-neutral-500 hover:border-brand-200 hover:text-brand-600 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-brand-400 dark:hover:text-brand-200',
                    )}
                  >
                    {messages.demographics.caffeineNo}
                  </button>
                )}
              </RadioGroup.Option>
            </RadioGroup>
            {errors.caffeineConsumed && (
              <p className="text-sm text-red-500 dark:text-red-400">{errors.caffeineConsumed}</p>
            )}

            {formData.caffeineConsumed === true && (
              <div className="space-y-2 pl-4">
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                  {messages.demographics.caffeineFollowUp}
                </p>
                <RadioGroup
                  value={formData.caffeineTimeAgo ?? undefined}
                  onChange={(value: CaffeineTime | null) =>
                    setFormData((prev) => ({ ...prev, caffeineTimeAgo: value }))
                  }
                  className="space-y-2"
                >
                  {caffeineTimeOptions.map((option) => (
                    <RadioGroup.Option key={option.value} value={option.value}>
                      {({ checked }) => (
                        <button
                          type="button"
                          className={clsx(
                            'flex w-full items-center gap-3 rounded-xl border px-4 py-2 text-sm transition',
                            checked
                              ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm dark:border-brand-400 dark:bg-brand-400/20 dark:text-brand-200'
                              : 'border-neutral-200 bg-white text-neutral-500 hover:border-brand-200 hover:text-brand-600 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-brand-400 dark:hover:text-brand-200',
                          )}
                        >
                          <span
                            className={clsx(
                              'h-4 w-4 rounded-full border-2',
                              checked
                                ? 'border-brand-500 bg-brand-500 dark:border-brand-400 dark:bg-brand-400'
                                : 'border-neutral-300 dark:border-neutral-600',
                            )}
                          />
                          {option.label}
                        </button>
                      )}
                    </RadioGroup.Option>
                  ))}
                </RadioGroup>
                {errors.caffeineTimeAgo && (
                  <p className="text-sm text-red-500 dark:text-red-400">{errors.caffeineTimeAgo}</p>
                )}
              </div>
            )}
          </div>

          {/* Current State / Alertness */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {messages.demographics.alertnessHeading}
              </h2>
              <p className="mt-1 text-sm font-medium text-neutral-700 dark:text-neutral-200">
                {messages.demographics.alertnessQuestion}
              </p>
            </div>
            <RadioGroup
              value={formData.alertness ?? undefined}
              onChange={(value: AlertnessLevel | null) => setFormData((prev) => ({ ...prev, alertness: value }))}
              className="grid grid-cols-5 gap-1.5 sm:gap-2"
            >
              {alertnessOptions.map((option) => (
                <RadioGroup.Option key={option.value} value={option.value}>
                  {({ checked }) => (
                    <button
                      type="button"
                      className={clsx(
                        'flex h-10 sm:h-12 w-full items-center justify-center rounded-xl sm:rounded-2xl border text-xs sm:text-sm font-medium transition',
                        checked
                          ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm dark:border-brand-400 dark:bg-brand-400/20 dark:text-brand-200'
                          : 'border-neutral-200 bg-white text-neutral-500 hover:border-brand-200 hover:text-brand-600 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-brand-400 dark:hover:text-brand-200',
                      )}
                    >
                      {option.value}
                    </button>
                  )}
                </RadioGroup.Option>
              ))}
            </RadioGroup>
            {errors.alertness && <p className="text-sm text-red-500 dark:text-red-400">{errors.alertness}</p>}
          </div>

          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={!isValid()} className="w-full sm:w-auto">
              {messages.demographics.continueButton}
            </Button>
          </div>
        </form>
      </motion.main>
    </div>
  )
}
