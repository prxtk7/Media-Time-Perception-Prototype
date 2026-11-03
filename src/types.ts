export type MediaCondition = 'video' | 'audio' | 'text'

export type Language = 'en' | 'de'

export type ThemeMode = 'light' | 'dark'

export type LocalizedText = Record<Language, string>

export type LocalizedParagraphs = Record<Language, string[]>

export interface ConditionResult {
  participantId: string
  condition: MediaCondition
  realDurationSec: number
  estimatedTimeSec: number
  confidence: number
  immersion1: number
  immersion2: number
  immersion3: number
  immersion4: number
  immersion5: number
  engagement1: number
  engagement2: number
  engagement3: number
  engagement4: number
  engagement5: number
  familiarity: number
  timestamp: string
}

export type LikertScale = 1 | 2 | 3 | 4 | 5

export interface DemographicData {
  age?: number
  shortVideosFrequency?: string
  audioFrequency?: string
  textFrequency?: string
  caffeineConsumed?: boolean
  caffeineTimeAgo?: string
  alertness?: number
}
