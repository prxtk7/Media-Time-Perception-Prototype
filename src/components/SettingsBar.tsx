import { useNavigate } from 'react-router-dom'
import { useCallback } from 'react'
import { useSettings } from '../context/SettingsContext'
import { useSession } from '../context/SessionContext'

export function SettingsBar() {
  const { language, setLanguage, toggleTheme, theme, messages } = useSettings()
  const { isSessionActive, resetSession } = useSession()
  const navigate = useNavigate()

  const handleExit = useCallback(() => {
    const confirmed = window.confirm(messages.settings.exitConfirm)
    if (!confirmed) return
    resetSession()
    navigate('/')
  }, [messages.settings.exitConfirm, navigate, resetSession])

  return (
    <div className="fixed inset-x-0 top-2 sm:top-4 z-40 flex justify-end px-2 sm:px-3 md:px-4">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 rounded-full border border-neutral-200 bg-white/80 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs shadow-soft backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/70">
        <button
          type="button"
          onClick={handleExit}
          disabled={!isSessionActive}
          className="rounded-full border border-rose-200 bg-rose-50 px-2 sm:px-2.5 md:px-3 py-1 font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:border-neutral-300 disabled:bg-neutral-200 disabled:text-neutral-500 dark:border-rose-500/40 dark:bg-rose-500/15 dark:text-rose-200 dark:hover:bg-rose-500/25 dark:disabled:border-neutral-700 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-500 text-[10px] sm:text-xs whitespace-nowrap"
        >
          {messages.settings.exitLabel}
        </button>
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="hidden sm:inline font-semibold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-neutral-500 dark:text-neutral-400">
            {messages.settings.languageLabel}
          </span>
          <div className="flex overflow-hidden rounded-full border border-neutral-200 dark:border-neutral-700">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2 sm:px-2.5 md:px-3 py-1 font-semibold transition text-[10px] sm:text-xs ${
                language === 'en'
                  ? 'bg-brand-600 text-white'
                  : 'bg-transparent text-neutral-600 hover:bg-brand-50 hover:text-brand-600 dark:text-neutral-300 dark:hover:bg-neutral-800'
              }`}
            >
              {messages.settings.english}
            </button>
            <button
              type="button"
              onClick={() => setLanguage('de')}
              className={`px-2 sm:px-2.5 md:px-3 py-1 font-semibold transition text-[10px] sm:text-xs ${
                language === 'de'
                  ? 'bg-brand-600 text-white'
                  : 'bg-transparent text-neutral-600 hover:bg-brand-50 hover:text-brand-600 dark:text-neutral-300 dark:hover:bg-neutral-800'
              }`}
            >
              {messages.settings.german}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="hidden sm:inline font-semibold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-neutral-500 dark:text-neutral-400">
            {messages.settings.themeLabel}
          </span>
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-full border border-brand-200 bg-white px-2 sm:px-2.5 md:px-3 py-1 font-semibold text-brand-700 shadow-sm transition hover:bg-brand-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700 text-[10px] sm:text-xs whitespace-nowrap"
          >
            {theme === 'light' ? messages.settings.light : messages.settings.dark}
          </button>
        </div>
      </div>
    </div>
  )
}


