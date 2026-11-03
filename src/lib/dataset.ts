import type { ConditionResult, DemographicData, Language, MediaCondition } from '../types'

/**
 * Central dataset schema (one row per participant x condition).
 *
 * The column names match the ones the original Apps Script wrote to Google Sheets
 * (chosen for JASP), with three changes:
 * - `ParticipantName` is no longer collected centrally (the consent text promises
 *   that exported data contains the anonymized participant ID only).
 * - `SubmissionID` identifies one completed session and makes retries idempotent.
 * - `Language` records the UI language, since the text stimulus differs per language.
 * `ReceivedAt` is set by the Apps Script, never by the browser.
 *
 * Keep this list in sync with `COLUMNS` in google-apps-script.js.
 */
export const DATASET_SCHEMA_VERSION = 2

export const DATASET_COLUMNS = [
  'SubmissionID',
  'ParticipantID',
  'ConsentDate',
  'ParticipantNumber',
  'LatinSquareOrder',
  'ConditionOrder',
  'Language',
  'Age',
  'ShortVideosFrequency',
  'AudioFrequency',
  'TextFrequency',
  'CaffeineConsumed',
  'CaffeineTimeAgo',
  'AlertnessLevel',
  'Condition',
  'ConditionPosition',
  'RealDurationSeconds',
  'EstimatedDurationSeconds',
  'TemporalBiasSeconds',
  'TemporalBiasPercent',
  'ConfidenceRating',
  'Immersion_Absorbed',
  'Immersion_Focused',
  'Immersion_LostAwareness',
  'Immersion_UnawareSurroundings',
  'Immersion_LostTrackTime',
  'Immersion_Mean',
  'Engagement_Engaging',
  'Engagement_MentallyInvolved',
  'Engagement_HeldAttention',
  'Engagement_Interested',
  'Engagement_Motivated',
  'Engagement_Mean',
  'OverallEngagement',
  'Familiarity',
  'Timestamp',
  'Date',
  'Time',
  'ReceivedAt',
] as const

export type DatasetColumn = (typeof DATASET_COLUMNS)[number]

/** Missing values are always `null` in the payload and an empty cell in the sheet/CSV. */
export type DatasetValue = string | number | null

export type DatasetRow = Record<Exclude<DatasetColumn, 'ReceivedAt'>, DatasetValue>

export interface SubmissionPayload {
  schemaVersion: number
  submissionId: string
  rows: DatasetRow[]
}

export interface SessionSnapshot {
  sessionId: string
  participantId: string
  consentSignedAt?: string
  participantNumber?: number
  orderNumber?: number
  conditionOrder: MediaCondition[]
  language: Language
  demographicData?: DemographicData
  results: ConditionResult[]
}

export interface ConditionMeasures {
  immersionMean: number
  engagementMean: number
  overallEngagement: number
  temporalBias: number
  /** `null` when the real duration is 0, because the percentage is undefined. */
  temporalBiasPercent: number | null
}

const CONDITION_CODES: Record<MediaCondition, string> = { video: 'V', audio: 'A', text: 'T' }

function round2(value: number) {
  return parseFloat(value.toFixed(2))
}

export function computeMeasures(result: ConditionResult): ConditionMeasures {
  const immersionMean =
    (result.immersion1 + result.immersion2 + result.immersion3 + result.immersion4 + result.immersion5) / 5
  const engagementMean =
    (result.engagement1 + result.engagement2 + result.engagement3 + result.engagement4 + result.engagement5) / 5
  const overallEngagement = (immersionMean + engagementMean) / 2
  const temporalBias = result.estimatedTimeSec - result.realDurationSec
  const temporalBiasPercent =
    result.realDurationSec > 0 ? round2((temporalBias / result.realDurationSec) * 100) : null
  return { immersionMean, engagementMean, overallEngagement, temporalBias, temporalBiasPercent }
}

function orNull<T>(value: T | undefined | null | ''): T | null {
  return value === undefined || value === null || value === '' ? null : value
}

/**
 * Builds the payload for one completed session. Throws if the session is not complete,
 * so partial sessions can never be submitted as complete observations.
 */
export function buildSubmission(session: SessionSnapshot): SubmissionPayload {
  const { conditionOrder, results } = session
  if (!session.sessionId) throw new Error('Session has no submission ID')
  if (!session.participantId) throw new Error('Session has no participant ID')
  if (conditionOrder.length === 0) throw new Error('Session has no condition order')

  const conditionOrderString = conditionOrder.map((condition) => CONDITION_CODES[condition]).join('-')
  const demographics = session.demographicData ?? {}
  const caffeineConsumed =
    demographics.caffeineConsumed === undefined ? null : demographics.caffeineConsumed ? 'Yes' : 'No'

  const rows = conditionOrder.map((condition, index): DatasetRow => {
    const result = results.find((entry) => entry.condition === condition)
    if (!result) throw new Error(`Session is missing the ${condition} condition`)
    const measures = computeMeasures(result)
    return {
      SubmissionID: session.sessionId,
      ParticipantID: session.participantId,
      ConsentDate: orNull(session.consentSignedAt),
      ParticipantNumber: orNull(session.participantNumber),
      LatinSquareOrder: orNull(session.orderNumber),
      ConditionOrder: conditionOrderString,
      Language: session.language,
      Age: orNull(demographics.age),
      ShortVideosFrequency: orNull(demographics.shortVideosFrequency),
      AudioFrequency: orNull(demographics.audioFrequency),
      TextFrequency: orNull(demographics.textFrequency),
      CaffeineConsumed: caffeineConsumed,
      CaffeineTimeAgo: caffeineConsumed === 'Yes' ? orNull(demographics.caffeineTimeAgo) : null,
      AlertnessLevel: orNull(demographics.alertness),
      Condition: condition,
      ConditionPosition: index + 1,
      RealDurationSeconds: result.realDurationSec,
      EstimatedDurationSeconds: result.estimatedTimeSec,
      TemporalBiasSeconds: measures.temporalBias,
      TemporalBiasPercent: measures.temporalBiasPercent,
      ConfidenceRating: result.confidence,
      Immersion_Absorbed: result.immersion1,
      Immersion_Focused: result.immersion2,
      Immersion_LostAwareness: result.immersion3,
      Immersion_UnawareSurroundings: result.immersion4,
      Immersion_LostTrackTime: result.immersion5,
      Immersion_Mean: round2(measures.immersionMean),
      Engagement_Engaging: result.engagement1,
      Engagement_MentallyInvolved: result.engagement2,
      Engagement_HeldAttention: result.engagement3,
      Engagement_Interested: result.engagement4,
      Engagement_Motivated: result.engagement5,
      Engagement_Mean: round2(measures.engagementMean),
      OverallEngagement: round2(measures.overallEngagement),
      Familiarity: result.familiarity,
      // Timestamp, Date and Time are all UTC (the original Time column used the browser's local time).
      Timestamp: result.timestamp,
      Date: result.timestamp.slice(0, 10),
      Time: result.timestamp.slice(11, 19),
    }
  })

  return { schemaVersion: DATASET_SCHEMA_VERSION, submissionId: session.sessionId, rows }
}

/** RFC 4122 v4 UUID; falls back to getRandomValues where randomUUID is unavailable (non-secure contexts). */
export function generateSubmissionId(): string {
  const cryptoApi = globalThis.crypto
  if (typeof cryptoApi?.randomUUID === 'function') return cryptoApi.randomUUID()
  const bytes = new Uint8Array(16)
  cryptoApi.getRandomValues(bytes)
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}
