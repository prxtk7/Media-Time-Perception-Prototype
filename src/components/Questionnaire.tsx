import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { RadioGroup as HeadlessRadioGroup } from '@headlessui/react'
import clsx from 'clsx'
import { Button } from './shared/Button'
import type { LikertScale } from '../types'
import { useSettings } from '../context/SettingsContext'

// Wrapper component to ensure RadioGroup is always controlled
// Uses a sentinel value to prevent uncontrolled/controlled warnings
function ControlledRadioGroup<T extends string | number>({
  value,
  onChange,
  children,
  className,
}: {
  value: T | null | undefined
  onChange: (value: T) => void
  children: React.ReactNode
  className?: string
}) {
  // Use a sentinel value that won't match any real option
  // This ensures the component is always controlled
  const SENTINEL = '__UNSELECTED__' as T
  const controlledValue = value ?? SENTINEL

  const handleChange = (newValue: T) => {
    // Only call onChange if a real value was selected
    if (newValue !== SENTINEL) {
      onChange(newValue)
    }
  }

  return (
    <HeadlessRadioGroup value={controlledValue} onChange={handleChange} className={className}>
      {children}
    </HeadlessRadioGroup>
  )
}

export interface QuestionnaireSubmitPayload {
  estimatedTimeSec: number
  confidence: LikertScale
  immersion1: LikertScale
  immersion2: LikertScale
  immersion3: LikertScale
  immersion4: LikertScale
  immersion5: LikertScale
  engagement1: LikertScale
  engagement2: LikertScale
  engagement3: LikertScale
  engagement4: LikertScale
  engagement5: LikertScale
  familiarity: LikertScale
}

interface QuestionnaireProps {
  onSubmit: (values: QuestionnaireSubmitPayload) => Promise<void> | void
  isSubmitting?: boolean
}

interface QuestionnaireFormValues {
  estimatedMinutes: number | ''
  estimatedSeconds: number | ''
  confidence: LikertScale | null
  immersion1: LikertScale | null
  immersion2: LikertScale | null
  immersion3: LikertScale | null
  immersion4: LikertScale | null
  immersion5: LikertScale | null
  engagement1: LikertScale | null
  engagement2: LikertScale | null
  engagement3: LikertScale | null
  engagement4: LikertScale | null
  engagement5: LikertScale | null
  familiarity: LikertScale | null
}

type LikertQuestionId = Exclude<keyof QuestionnaireSubmitPayload, 'estimatedTimeSec'>

interface LikertQuestion {
  id: LikertQuestionId
  labelKey: string
  leftKey: string
  rightKey: string
}

// Updated to 1-5 scale
const likertScaleValues: LikertScale[] = [1, 2, 3, 4, 5]

const immersionQuestions: LikertQuestion[] = [
  {
    id: 'immersion1',
    labelKey: 'questionnaire.likert.immersion1.label',
    leftKey: 'questionnaire.likert.immersion1.left',
    rightKey: 'questionnaire.likert.immersion1.right',
  },
  {
    id: 'immersion2',
    labelKey: 'questionnaire.likert.immersion2.label',
    leftKey: 'questionnaire.likert.immersion2.left',
    rightKey: 'questionnaire.likert.immersion2.right',
  },
  {
    id: 'immersion3',
    labelKey: 'questionnaire.likert.immersion3.label',
    leftKey: 'questionnaire.likert.immersion3.left',
    rightKey: 'questionnaire.likert.immersion3.right',
  },
  {
    id: 'immersion4',
    labelKey: 'questionnaire.likert.immersion4.label',
    leftKey: 'questionnaire.likert.immersion4.left',
    rightKey: 'questionnaire.likert.immersion4.right',
  },
  {
    id: 'immersion5',
    labelKey: 'questionnaire.likert.immersion5.label',
    leftKey: 'questionnaire.likert.immersion5.left',
    rightKey: 'questionnaire.likert.immersion5.right',
  },
]

const engagementQuestions: LikertQuestion[] = [
  {
    id: 'engagement1',
    labelKey: 'questionnaire.likert.engagement1.label',
    leftKey: 'questionnaire.likert.engagement1.left',
    rightKey: 'questionnaire.likert.engagement1.right',
  },
  {
    id: 'engagement2',
    labelKey: 'questionnaire.likert.engagement2.label',
    leftKey: 'questionnaire.likert.engagement2.left',
    rightKey: 'questionnaire.likert.engagement2.right',
  },
  {
    id: 'engagement3',
    labelKey: 'questionnaire.likert.engagement3.label',
    leftKey: 'questionnaire.likert.engagement3.left',
    rightKey: 'questionnaire.likert.engagement3.right',
  },
  {
    id: 'engagement4',
    labelKey: 'questionnaire.likert.engagement4.label',
    leftKey: 'questionnaire.likert.engagement4.left',
    rightKey: 'questionnaire.likert.engagement4.right',
  },
  {
    id: 'engagement5',
    labelKey: 'questionnaire.likert.engagement5.label',
    leftKey: 'questionnaire.likert.engagement5.left',
    rightKey: 'questionnaire.likert.engagement5.right',
  },
]

const allQuestions: LikertQuestion[] = [
  {
    id: 'confidence',
    labelKey: 'questionnaire.likert.confidence.label',
    leftKey: 'questionnaire.likert.confidence.left',
    rightKey: 'questionnaire.likert.confidence.right',
  },
  ...immersionQuestions,
  ...engagementQuestions,
  {
    id: 'familiarity',
    labelKey: 'questionnaire.likert.familiarity.label',
    leftKey: 'questionnaire.likert.familiarity.left',
    rightKey: 'questionnaire.likert.familiarity.right',
  },
]

const initialValues: QuestionnaireFormValues = {
  estimatedMinutes: '',
  estimatedSeconds: '',
  confidence: null,
  immersion1: null,
  immersion2: null,
  immersion3: null,
  immersion4: null,
  immersion5: null,
  engagement1: null,
  engagement2: null,
  engagement3: null,
  engagement4: null,
  engagement5: null,
  familiarity: null,
}

function parsePositiveInt(value: number | ''): number {
  if (value === '') return 0
  return Math.max(0, Math.floor(Number(value)))
}

export function Questionnaire({ onSubmit, isSubmitting = false }: QuestionnaireProps) {
  const { t, messages } = useSettings()
  const [values, setValues] = useState<QuestionnaireFormValues>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isValid = useMemo(() => {
    const minutes = parsePositiveInt(values.estimatedMinutes)
    const seconds = parsePositiveInt(values.estimatedSeconds)
    const hasDuration = minutes > 0 || seconds > 0
    if (!hasDuration || seconds >= 60) {
      return false
    }
    return allQuestions.every((question) => values[question.id] !== null)
  }, [values])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const minutes = parsePositiveInt(values.estimatedMinutes)
    const seconds = parsePositiveInt(values.estimatedSeconds)
    const durationErrors: Record<string, string> = {}

    if (minutes === 0 && seconds === 0) {
      durationErrors.estimatedMinutes = messages.questionnaire.validation.positiveDuration
      durationErrors.estimatedSeconds = messages.questionnaire.validation.positiveDuration
    }

    if (seconds >= 60) {
      durationErrors.estimatedSeconds = messages.questionnaire.validation.secondsRange
    }

    const likertErrors: Record<string, string> = {}
    allQuestions.forEach((question) => {
      if (values[question.id] === null) {
        likertErrors[question.id] = messages.questionnaire.validation.required
      }
    })

    const combinedErrors = { ...durationErrors, ...likertErrors }

    if (Object.keys(combinedErrors).length > 0) {
      setErrors(combinedErrors)
      return
    }

    setErrors({})
    const totalSeconds = minutes * 60 + seconds

    await onSubmit({
      estimatedTimeSec: totalSeconds,
      confidence: values.confidence!,
      immersion1: values.immersion1!,
      immersion2: values.immersion2!,
      immersion3: values.immersion3!,
      immersion4: values.immersion4!,
      immersion5: values.immersion5!,
      engagement1: values.engagement1!,
      engagement2: values.engagement2!,
      engagement3: values.engagement3!,
      engagement4: values.engagement4!,
      engagement5: values.engagement5!,
      familiarity: values.familiarity!,
    })

    setValues(initialValues)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 sm:gap-8 rounded-2xl sm:rounded-3xl border border-neutral-200 bg-white/95 p-4 sm:p-6 md:p-8 shadow-soft backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/80"
    >
      {/* Time Estimation */}
      <div>
        <h2 className="font-display text-xl sm:text-2xl font-semibold text-brand-700 dark:text-brand-300">
          {messages.questionnaire.timeHeading}
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-neutral-500 dark:text-neutral-300">
          {messages.questionnaire.timeDescription}
        </p>
      </div>

      <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-200">
          {messages.questionnaire.minutesLabel}
          <input
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            aria-label={messages.questionnaire.minutesAria}
            value={values.estimatedMinutes}
            onChange={(event) =>
              setValues((prev) => ({
                ...prev,
                estimatedMinutes: event.target.value === '' ? '' : Number(event.target.value),
              }))
            }
            className={clsx(
              'w-full rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-base font-medium text-neutral-800 shadow-sm transition focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-100 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100',
              errors.estimatedMinutes && 'border-red-400 focus:ring-red-100 dark:border-red-500',
            )}
            placeholder={messages.questionnaire.minutesPlaceholder}
          />
          {errors.estimatedMinutes && (
            <p className="text-sm text-red-500 dark:text-red-400">{errors.estimatedMinutes}</p>
          )}
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-200">
          {messages.questionnaire.secondsLabel}
          <input
            type="number"
            min={0}
            max={59}
            step={1}
            inputMode="numeric"
            aria-label={messages.questionnaire.secondsAria}
            value={values.estimatedSeconds}
            onChange={(event) =>
              setValues((prev) => ({
                ...prev,
                estimatedSeconds: event.target.value === '' ? '' : Number(event.target.value),
              }))
            }
            className={clsx(
              'w-full rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-base font-medium text-neutral-800 shadow-sm transition focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-100 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100',
              errors.estimatedSeconds && 'border-red-400 focus:ring-red-100 dark:border-red-500',
            )}
            placeholder={messages.questionnaire.secondsPlaceholder}
          />
          {errors.estimatedSeconds && (
            <p className="text-sm text-red-500 dark:text-red-400">{errors.estimatedSeconds}</p>
          )}
        </label>
      </div>

      {/* Confidence */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-medium text-neutral-800 dark:text-neutral-100">
            {t('questionnaire.likert.confidence.label')}
          </h3>
          <div className="mt-1 flex items-center justify-between text-xs uppercase tracking-[0.32em] text-neutral-400 dark:text-neutral-500">
            <span>{t('questionnaire.likert.confidence.left')}</span>
            <span>{t('questionnaire.likert.confidence.right')}</span>
          </div>
        </div>
        <ControlledRadioGroup
          value={values.confidence}
          onChange={(value: LikertScale) => setValues((prev) => ({ ...prev, confidence: value }))}
          className="grid grid-cols-5 gap-1.5 sm:gap-2"
        >
          {likertScaleValues.map((option) => (
            <HeadlessRadioGroup.Option key={option} value={option}>
              {({ checked }) => (
                <button
                  type="button"
                  className={clsx(
                    'flex h-10 sm:h-12 w-full items-center justify-center rounded-xl sm:rounded-2xl border transition',
                    checked
                      ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm dark:border-brand-400 dark:bg-brand-400/20 dark:text-brand-200'
                      : 'border-neutral-200 bg-white text-neutral-500 hover:border-brand-200 hover:text-brand-600 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-brand-400 dark:hover:text-brand-200',
                  )}
                >
                  <span className="text-xs sm:text-sm font-semibold">{option}</span>
                </button>
              )}
            </HeadlessRadioGroup.Option>
          ))}
        </ControlledRadioGroup>
        {errors.confidence && <p className="text-xs text-red-500 dark:text-red-400">{errors.confidence}</p>}
      </div>

      {/* Experience During the Activity */}
      <div className="space-y-4 sm:space-y-6">
        <div>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
            Please indicate how much you agree or disagree with the following statements.
          </p>
        </div>

        {/* Immersion */}
        <div className="space-y-3 sm:space-y-4">
          <h2 className="font-display text-lg sm:text-xl font-semibold text-brand-700 dark:text-brand-300">
            {messages.questionnaire.immersionHeading}
          </h2>
          {immersionQuestions.map((question) => (
            <div key={question.id} className="space-y-4">
              <div>
                <p className="text-base font-medium text-neutral-800 dark:text-neutral-100">{t(question.labelKey)}</p>
                <div className="mt-1 flex items-center justify-between text-xs uppercase tracking-[0.32em] text-neutral-400 dark:text-neutral-500">
                  <span>{t(question.leftKey)}</span>
                  <span>{t(question.rightKey)}</span>
                </div>
              </div>
              <ControlledRadioGroup
                value={values[question.id]}
                onChange={(value: LikertScale) =>
                  setValues((prev) => ({ ...prev, [question.id]: value }))
                }
                className="grid grid-cols-5 gap-1.5 sm:gap-2"
              >
                {likertScaleValues.map((option) => (
                  <HeadlessRadioGroup.Option key={option} value={option}>
                    {({ checked }) => (
                      <button
                        type="button"
                        className={clsx(
                          'flex h-10 sm:h-12 w-full items-center justify-center rounded-xl sm:rounded-2xl border transition',
                          checked
                            ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm dark:border-brand-400 dark:bg-brand-400/20 dark:text-brand-200'
                            : 'border-neutral-200 bg-white text-neutral-500 hover:border-brand-200 hover:text-brand-600 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-brand-400 dark:hover:text-brand-200',
                        )}
                      >
                        <span className="text-xs sm:text-sm font-semibold">{option}</span>
                      </button>
                    )}
                  </HeadlessRadioGroup.Option>
                ))}
              </ControlledRadioGroup>
              {errors[question.id] && (
                <p className="text-xs text-red-500 dark:text-red-400">{errors[question.id]}</p>
              )}
            </div>
          ))}
        </div>

        {/* Engagement */}
        <div className="space-y-3 sm:space-y-4">
          <h2 className="font-display text-lg sm:text-xl font-semibold text-brand-700 dark:text-brand-300">
            {messages.questionnaire.engagementHeading}
          </h2>
          {engagementQuestions.map((question) => (
            <div key={question.id} className="space-y-4">
              <div>
                <p className="text-base font-medium text-neutral-800 dark:text-neutral-100">{t(question.labelKey)}</p>
                <div className="mt-1 flex items-center justify-between text-xs uppercase tracking-[0.32em] text-neutral-400 dark:text-neutral-500">
                  <span>{t(question.leftKey)}</span>
                  <span>{t(question.rightKey)}</span>
                </div>
              </div>
              <ControlledRadioGroup
                value={values[question.id]}
                onChange={(value: LikertScale) =>
                  setValues((prev) => ({ ...prev, [question.id]: value }))
                }
                className="grid grid-cols-5 gap-1.5 sm:gap-2"
              >
                {likertScaleValues.map((option) => (
                  <HeadlessRadioGroup.Option key={option} value={option}>
                    {({ checked }) => (
                      <button
                        type="button"
                        className={clsx(
                          'flex h-10 sm:h-12 w-full items-center justify-center rounded-xl sm:rounded-2xl border transition',
                          checked
                            ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm dark:border-brand-400 dark:bg-brand-400/20 dark:text-brand-200'
                            : 'border-neutral-200 bg-white text-neutral-500 hover:border-brand-200 hover:text-brand-600 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-brand-400 dark:hover:text-brand-200',
                        )}
                      >
                        <span className="text-xs sm:text-sm font-semibold">{option}</span>
                      </button>
                    )}
                  </HeadlessRadioGroup.Option>
                ))}
              </ControlledRadioGroup>
              {errors[question.id] && (
                <p className="text-xs text-red-500 dark:text-red-400">{errors[question.id]}</p>
              )}
            </div>
          ))}
        </div>

        {/* Additional Factors - Familiarity */}
        <div className="space-y-3 sm:space-y-4">
          <h2 className="font-display text-lg sm:text-xl font-semibold text-brand-700 dark:text-brand-300">
            {messages.questionnaire.additionalFactorsHeading}
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-base font-medium text-neutral-800 dark:text-neutral-100">
                {t('questionnaire.likert.familiarity.label')}
              </p>
              <div className="mt-1 flex items-center justify-between text-xs uppercase tracking-[0.32em] text-neutral-400 dark:text-neutral-500">
                <span>{t('questionnaire.likert.familiarity.left')}</span>
                <span>{t('questionnaire.likert.familiarity.right')}</span>
              </div>
            </div>
            <ControlledRadioGroup
              value={values.familiarity}
              onChange={(value: LikertScale) => setValues((prev) => ({ ...prev, familiarity: value }))}
              className="grid grid-cols-5 gap-2"
            >
              {likertScaleValues.map((option) => (
                <HeadlessRadioGroup.Option key={option} value={option}>
                  {({ checked }) => (
                    <button
                      type="button"
                      className={clsx(
                        'flex h-12 w-full items-center justify-center rounded-2xl border transition',
                        checked
                          ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm dark:border-brand-400 dark:bg-brand-400/20 dark:text-brand-200'
                          : 'border-neutral-200 bg-white text-neutral-500 hover:border-brand-200 hover:text-brand-600 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-brand-400 dark:hover:text-brand-200',
                      )}
                    >
                      <span className="text-sm font-semibold">{option}</span>
                    </button>
                  )}
                </HeadlessRadioGroup.Option>
              ))}
            </ControlledRadioGroup>
            {errors.familiarity && (
              <p className="text-xs text-red-500 dark:text-red-400">{errors.familiarity}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button type="submit" size="lg" loading={isSubmitting} disabled={!isValid || isSubmitting} className="w-full sm:w-auto">
          {messages.questionnaire.submit}
        </Button>
      </div>
    </form>
  )
}
