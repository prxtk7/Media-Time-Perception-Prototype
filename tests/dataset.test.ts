import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildSubmission, DATASET_COLUMNS, DATASET_SCHEMA_VERSION, generateSubmissionId } from '../src/lib/dataset'
import { syntheticResult, syntheticSession } from './helpers/fixtures'

describe('buildSubmission', () => {
  it('creates one row per condition in presentation order', () => {
    const payload = buildSubmission(syntheticSession())
    assert.equal(payload.schemaVersion, DATASET_SCHEMA_VERSION)
    assert.deepEqual(
      payload.rows.map((row) => [row.Condition, row.ConditionPosition]),
      [
        ['audio', 1],
        ['text', 2],
        ['video', 3],
      ],
    )
    assert.ok(payload.rows.every((row) => row.ConditionOrder === 'A-T-V'))
    assert.ok(payload.rows.every((row) => row.SubmissionID === payload.submissionId))
  })

  it('uses every dataset column except the server-side ReceivedAt', () => {
    const [row] = buildSubmission(syntheticSession()).rows
    assert.deepEqual(Object.keys(row), DATASET_COLUMNS.filter((column) => column !== 'ReceivedAt'))
  })

  it('never includes the participant name', () => {
    const json = JSON.stringify(buildSubmission(syntheticSession()))
    assert.ok(!/name/i.test(json))
  })

  it('computes bias and means with the existing formulas', () => {
    const [audio] = buildSubmission(syntheticSession()).rows
    assert.equal(audio.TemporalBiasSeconds, 48)
    assert.equal(audio.TemporalBiasPercent, 25)
    assert.equal(audio.Immersion_Mean, 2.8)
    assert.equal(audio.Engagement_Mean, 4)
    assert.equal(audio.OverallEngagement, 3.4)
  })

  it('keeps a zero real duration and leaves the bias percentage missing instead of 0', () => {
    const session = syntheticSession()
    session.results[0] = syntheticResult('audio', { realDurationSec: 0, estimatedTimeSec: 382 })
    const [audio] = buildSubmission(session).rows
    assert.equal(audio.RealDurationSeconds, 0)
    assert.equal(audio.TemporalBiasSeconds, 382)
    assert.equal(audio.TemporalBiasPercent, null)
  })

  it('represents missing caffeine time as null when no caffeine was consumed', () => {
    const session = syntheticSession({
      demographicData: { ...syntheticSession().demographicData, caffeineConsumed: false, caffeineTimeAgo: undefined },
    })
    const [row] = buildSubmission(session).rows
    assert.equal(row.CaffeineConsumed, 'No')
    assert.equal(row.CaffeineTimeAgo, null)
  })

  it('derives UTC Date and Time from the ISO timestamp', () => {
    const [row] = buildSubmission(syntheticSession()).rows
    assert.equal(row.Timestamp, '2025-11-20T10:10:00.000Z')
    assert.equal(row.Date, '2025-11-20')
    assert.equal(row.Time, '10:10:00')
  })

  it('refuses incomplete sessions', () => {
    const session = syntheticSession()
    session.results = session.results.slice(0, 2)
    assert.throws(() => buildSubmission(session), /missing the video condition/)
    assert.throws(() => buildSubmission(syntheticSession({ sessionId: '' })), /submission ID/)
  })
})

describe('generateSubmissionId', () => {
  it('produces distinct v4 UUIDs', () => {
    const ids = new Set(Array.from({ length: 50 }, generateSubmissionId))
    assert.equal(ids.size, 50)
    for (const id of ids) assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
  })
})
