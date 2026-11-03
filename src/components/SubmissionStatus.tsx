import { useSettings } from '../context/SettingsContext'
import { Button } from './shared/Button'

export type SubmissionUiState =
  | { kind: 'sending' }
  | { kind: 'saved' }
  | { kind: 'not-configured'; detail: string }
  | { kind: 'failed'; detail: string }

interface SubmissionStatusProps {
  state: SubmissionUiState
  onRetry: () => void
}

export function SubmissionStatus({ state, onRetry }: SubmissionStatusProps) {
  const { messages, t } = useSettings()
  const copy = messages.result.submission

  if (state.kind === 'sending') {
    return (
      <p role="status" className="rounded-2xl border border-neutral-200 bg-white/90 p-4 text-sm text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900/70 dark:text-neutral-300">
        {copy.sending}
      </p>
    )
  }

  if (state.kind === 'saved') {
    return (
      <p role="status" className="rounded-2xl border border-brand-100 bg-brand-50/60 p-4 text-sm text-brand-700 dark:border-brand-400/40 dark:bg-brand-400/10 dark:text-brand-200">
        {copy.saved}
      </p>
    )
  }

  return (
    <div role="alert" className="space-y-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/15 dark:text-rose-200">
      <p>{state.kind === 'failed' ? copy.failed : copy.notConfigured}</p>
      <p className="text-xs opacity-80">{t('result.submission.technicalDetail', { detail: state.detail })}</p>
      {state.kind === 'failed' && (
        <Button variant="secondary" size="md" onClick={onRetry}>
          {copy.retry}
        </Button>
      )}
    </div>
  )
}
