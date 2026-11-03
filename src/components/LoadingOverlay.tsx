import { motion } from 'framer-motion'
import { useSettings } from '../context/SettingsContext'

interface LoadingOverlayProps {
  message?: string
}

export function LoadingOverlay({ message }: LoadingOverlayProps) {
  const { messages, t } = useSettings()
  const resolvedMessage = message ?? t('loading.preparingNext')

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-neutral-900/50 backdrop-blur-sm dark:bg-neutral-950/70">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="flex min-w-[280px] flex-col items-center gap-4 rounded-3xl border border-white/10 bg-white/90 p-8 text-center shadow-soft dark:border-neutral-700 dark:bg-neutral-900/90"
      >
        <span className="h-12 w-12 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
        <p className="text-sm font-medium text-brand-700 dark:text-brand-300">{resolvedMessage}</p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{messages.loading.keepWindowOpen}</p>
      </motion.div>
    </div>
  )
}
