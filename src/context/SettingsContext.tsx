import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import type { Language, ThemeMode } from '../types'
import { translations } from '../data/translations'
import { readFromStorage, writeToStorage } from '../lib/storage'

const STORAGE_KEY = 'mtp_settings_v1'

type Messages = (typeof translations)['en']

interface SettingsState {
  language: Language
  theme: ThemeMode
}

interface SettingsContextValue {
  language: Language
  setLanguage: (language: Language) => void
  toggleLanguage: () => void
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
  messages: Messages
  t: (key: string, params?: Record<string, string | number>) => string
}

const defaultSettings: SettingsState = {
  language: 'en',
  theme: 'light',
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined)

function resolveTranslationValue(language: Language, key: string): unknown {
  const segments = key.split('.')
  let value: unknown = translations[language]
  for (const segment of segments) {
    if (value && typeof value === 'object' && segment in (value as Record<string, unknown>)) {
      value = (value as Record<string, unknown>)[segment]
    } else {
      return undefined
    }
  }
  return value
}

function interpolate(template: string, params: Record<string, string | number> | undefined): string {
  if (!params) return template
  return template.replace(/{{(.*?)}}/g, (_, token) => {
    const key = token.trim()
    return Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : ''
  })
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SettingsState>(() => {
    const stored = readFromStorage<SettingsState>(STORAGE_KEY)
    if (stored) {
      return stored
    }
    return defaultSettings
  })

  useEffect(() => {
    document.documentElement.lang = state.language
  }, [state.language])

  useEffect(() => {
    const root = document.documentElement
    if (state.theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [state.theme])

  useEffect(() => {
    writeToStorage(STORAGE_KEY, state)
  }, [state])

  const setLanguage = useCallback((language: Language) => {
    setState((prev) => ({ ...prev, language }))
  }, [])

  const toggleLanguage = useCallback(() => {
    setState((prev) => ({ ...prev, language: prev.language === 'en' ? 'de' : 'en' }))
  }, [])

  const setTheme = useCallback((theme: ThemeMode) => {
    setState((prev) => ({ ...prev, theme }))
  }, [])

  const toggleTheme = useCallback(() => {
    setState((prev) => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }))
  }, [])

  const messages = useMemo(() => translations[state.language], [state.language])

  const t = useCallback<SettingsContextValue['t']>(
    (key, params) => {
      const raw = resolveTranslationValue(state.language, key) ?? resolveTranslationValue('en', key)
      if (typeof raw === 'string') {
        return interpolate(raw, params)
      }
      return ''
    },
    [state.language],
  )

  const value: SettingsContextValue = {
    language: state.language,
    setLanguage,
    toggleLanguage,
    theme: state.theme,
    setTheme,
    toggleTheme,
    messages,
    t,
  }

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
