/** Synthetic sessions for tests. None of these values come from real participants. */
import type { SessionSnapshot } from '../../src/lib/dataset'
import type { ConditionResult, MediaCondition } from '../../src/types'

export function syntheticResult(condition: MediaCondition, overrides: Partial<ConditionResult> = {}): ConditionResult {
  return {
    participantId: 'SYNTH-0001',
    condition,
    realDurationSec: condition === 'text' ? 95 : 192,
    estimatedTimeSec: 240,
    confidence: 3,
    immersion1: 4,
    immersion2: 3,
    immersion3: 2,
    immersion4: 2,
    immersion5: 3,
    engagement1: 4,
    engagement2: 4,
    engagement3: 5,
    engagement4: 4,
    engagement5: 3,
    familiarity: 2,
    timestamp: '2025-11-20T10:15:30.000Z',
    ...overrides,
  }
}

export function syntheticSession(overrides: Partial<SessionSnapshot> = {}): SessionSnapshot {
  const conditionOrder: MediaCondition[] = overrides.conditionOrder ?? ['audio', 'text', 'video']
  return {
    sessionId: '0b7f2a52-3c1d-4e8f-9a6b-1c2d3e4f5a6b',
    participantId: 'SYNTH-0001',
    consentSignedAt: '2025-11-20T10:00:00.000Z',
    participantNumber: 4,
    orderNumber: 4,
    language: 'en',
    demographicData: {
      age: 27,
      shortVideosFrequency: 'often',
      audioFrequency: 'sometimes',
      textFrequency: 'very_often',
      caffeineConsumed: true,
      caffeineTimeAgo: '1_to_3_hours',
      alertness: 4,
    },
    results: conditionOrder.map((condition, index) =>
      syntheticResult(condition, {
        participantId: overrides.participantId ?? 'SYNTH-0001',
        timestamp: `2025-11-20T10:${String(10 + index * 5).padStart(2, '0')}:00.000Z`,
      }),
    ),
    ...overrides,
    conditionOrder,
  }
}
