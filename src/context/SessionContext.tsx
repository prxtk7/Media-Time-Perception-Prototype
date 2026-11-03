import type { ReactNode } from 'react'
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react'
import type { MediaMeta } from '../data/mediaContent'
import { MEDIA_CONTENT } from '../data/mediaContent'
import { generateSubmissionId } from '../lib/dataset'
import { getLatinSquareOrder, getOrderNumber } from '../lib/latinSquare'
import { clearStorage, readFromStorage, writeToStorage } from '../lib/storage'
import type { ConditionResult, DemographicData, MediaCondition } from '../types'

export type { DemographicData }

const STORAGE_KEY = 'mtp_session_state_v1'
const PARTICIPANT_COUNTER_KEY = 'mtp_participant_counter_v1'

/** Set once the Apps Script confirmed that it stored this session (saved or duplicate). */
export interface CentralSubmissionRecord {
  status: 'saved' | 'duplicate'
  confirmedAt: string
}

interface SessionState {
  /** Stable ID of this session; used as SubmissionID so retries cannot create duplicate rows. */
  sessionId: string
  participantId: string
  consentGiven: boolean
  participantName: string
  consentSignatureDataUrl?: string
  consentSignedAt?: string
  conditionOrder: MediaCondition[]
  orderNumber?: number // Latin-square order number (1-6)
  participantNumber?: number // Value of this device's participant counter when the session started
  currentIndex: number
  results: ConditionResult[]
  startedAt?: string
  readingDurationSec?: number
  demographicData?: DemographicData
  centralSubmission?: CentralSubmissionRecord
}

interface StartSessionPayload {
  participantId: string
  participantName: string
  consentSignedAt: string
  consentSignatureDataUrl?: string
}

interface SessionContextValue {
  hydrated: boolean
  sessionId: string
  participantId: string
  consentGiven: boolean
  participantName: string
  consentSignatureDataUrl?: string
  consentSignedAt?: string
  conditionOrder: MediaCondition[]
  currentIndex: number
  currentCondition: MediaCondition | null
  results: ConditionResult[]
  isSessionActive: boolean
  isSessionComplete: boolean
  startSession: (payload: StartSessionPayload) => void
  submitResult: (result: Omit<ConditionResult, 'participantId' | 'condition' | 'realDurationSec' | 'timestamp'>) => void
  markConsent: (value: boolean) => void
  resetSession: () => void
  getConditionByIndex: (index: number) => MediaCondition | null
  getMediaMeta: (condition: MediaCondition) => MediaMeta
  setReadingStartTime: (durationSec: number) => void
  setDemographicData: (data: DemographicData) => void
  demographicData?: DemographicData
  orderNumber?: number
  participantNumber?: number
  centralSubmission?: CentralSubmissionRecord
  markCentralSubmission: (status: CentralSubmissionRecord['status']) => void
}

const defaultState: SessionState = {
  sessionId: '',
  participantId: '',
  consentGiven: false,
  participantName: '',
  consentSignatureDataUrl: undefined,
  consentSignedAt: undefined,
  conditionOrder: [],
  currentIndex: 0,
  results: [],
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>(defaultState)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const stored = readFromStorage<SessionState>(STORAGE_KEY)
    if (stored) {
      setState((prev) => ({
        ...prev,
        ...stored,
        participantName: stored.participantName ?? '',
        // Sessions stored before submission IDs existed get one on first load.
        sessionId: stored.sessionId || (stored.participantId ? generateSubmissionId() : ''),
      }))
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    writeToStorage(STORAGE_KEY, state)
  }, [hydrated, state])

  const currentCondition = useMemo<MediaCondition | null>(() => {
    if (!state.conditionOrder.length) return null
    if (state.currentIndex >= state.conditionOrder.length) return null
    return state.conditionOrder[state.currentIndex]
  }, [state])

  const isSessionActive = Boolean(state.participantId && state.conditionOrder.length)
  const isSessionComplete =
    isSessionActive && state.results.length === state.conditionOrder.length && state.conditionOrder.length > 0

  const startSession = useCallback(
    ({ participantId, participantName, consentSignedAt, consentSignatureDataUrl }: StartSessionPayload) => {
      // Get or increment participant counter for Latin-square
      let participantCounter = readFromStorage<number>(PARTICIPANT_COUNTER_KEY) || 0
      participantCounter += 1
      writeToStorage(PARTICIPANT_COUNTER_KEY, participantCounter)
      
      // Get condition order using Latin-square method
      const conditionOrder = getLatinSquareOrder(participantCounter)
      const orderNumber = getOrderNumber(participantCounter)
      
      const newState: SessionState = {
        sessionId: generateSubmissionId(),
        participantId,
        consentGiven: true,
        participantName,
        consentSignedAt,
        consentSignatureDataUrl,
        conditionOrder,
        orderNumber,
        participantNumber: participantCounter,
        currentIndex: 0,
        results: [],
        startedAt: new Date().toISOString(),
      }
      setState(newState)
    },
    [setState],
  )

  const submitResult = useCallback<SessionContextValue['submitResult']>(
    (resultPayload) => {
      setState((prev) => {
        if (!prev.conditionOrder.length) {
          return prev
        }
        const condition = prev.conditionOrder[Math.min(prev.currentIndex, prev.conditionOrder.length - 1)]
        // Measured duration (text: reading time, video/audio: time the media was actually playing).
        // If nothing was measured (questionnaire opened without the media screen), record 0 rather than
        // substituting the stimulus' nominal length, which would be a fabricated exposure time.
        const realDurationSec = prev.readingDurationSec ?? 0
        const fullResult: ConditionResult = {
          participantId: prev.participantId,
          condition,
          realDurationSec,
          timestamp: new Date().toISOString(),
          ...resultPayload,
        }
        const updatedResults = [...prev.results.filter((entry) => entry.condition !== condition), fullResult]
        const nextIndex = Math.min(prev.currentIndex + 1, prev.conditionOrder.length)
        return { ...prev, results: updatedResults, currentIndex: nextIndex, readingDurationSec: undefined }
      })
    },
    [setState],
  )

  const setReadingStartTime = useCallback((durationSec: number) => {
    setState((prev) => ({ ...prev, readingDurationSec: durationSec }))
  }, [])

  const setDemographicData = useCallback((data: DemographicData) => {
    setState((prev) => ({ ...prev, demographicData: data }))
  }, [])

  const markConsent = useCallback((value: boolean) => {
    setState((prev) => ({ ...prev, consentGiven: value }))
  }, [])

  const markCentralSubmission = useCallback((status: CentralSubmissionRecord['status']) => {
    setState((prev) => ({ ...prev, centralSubmission: { status, confirmedAt: new Date().toISOString() } }))
  }, [])

  const resetSession = useCallback(() => {
    setState({ ...defaultState })
    clearStorage(STORAGE_KEY)
  }, [])

  const getConditionByIndex = useCallback(
    (index: number) => {
      if (index < 0 || index >= state.conditionOrder.length) return null
      return state.conditionOrder[index]
    },
    [state.conditionOrder],
  )

  const getMediaMeta = useCallback(
    (condition: MediaCondition) => {
      return MEDIA_CONTENT[condition]
    },
    [],
  )

  const value: SessionContextValue = {
    hydrated,
    sessionId: state.sessionId,
    participantId: state.participantId,
    consentGiven: state.consentGiven,
    participantName: state.participantName,
    consentSignatureDataUrl: state.consentSignatureDataUrl,
    consentSignedAt: state.consentSignedAt,
    conditionOrder: state.conditionOrder,
    currentIndex: state.currentIndex,
    currentCondition,
    results: state.results,
    isSessionActive,
    isSessionComplete,
    startSession,
    submitResult,
    markConsent,
    resetSession,
    getConditionByIndex,
    getMediaMeta,
    setReadingStartTime,
    setDemographicData,
    demographicData: state.demographicData,
    orderNumber: state.orderNumber,
    participantNumber: state.participantNumber ?? (readFromStorage<number>(PARTICIPANT_COUNTER_KEY) || undefined),
    centralSubmission: state.centralSubmission,
    markCentralSubmission,
  }

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}
