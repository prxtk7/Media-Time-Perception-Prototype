/**
 * Runs the real google-apps-script.js against an in-memory spreadsheet.
 * This is the local stand-in for the end-to-end test; it does not prove the live
 * Google deployment works (see docs/testing.md).
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildSubmission, DATASET_COLUMNS } from '../src/lib/dataset'
import { loadAppsScript } from './helpers/appsScript'
import { syntheticSession } from './helpers/fixtures'

const SESSION_A = syntheticSession()
const SESSION_B = syntheticSession({
  sessionId: '6f1e9d3c-8b2a-4c5d-8e7f-0a1b2c3d4e5f',
  participantId: 'SYNTH-0002',
  conditionOrder: ['video', 'audio', 'text'],
  orderNumber: 1,
  participantNumber: 7,
})

function sheetRows(runtime: ReturnType<typeof loadAppsScript>) {
  return runtime.spreadsheet.getSheetByName('Responses')?.rows ?? []
}

describe('Apps Script doPost', () => {
  it('stores a valid submission with the expected header', () => {
    const runtime = loadAppsScript()
    const response = runtime.post(buildSubmission(SESSION_A))
    assert.deepEqual(response, {
      ok: true,
      status: 'saved',
      submissionId: SESSION_A.sessionId,
      rowsAdded: 3,
    })
    const rows = sheetRows(runtime)
    assert.deepEqual(rows[0], [...DATASET_COLUMNS])
    assert.equal(rows.length, 4)
    assert.equal(runtime.lock.acquired, 1)
    assert.equal(runtime.lock.released, 1)
  })

  it('appends distinct sessions, ignores retries and never overwrites earlier rows', () => {
    const runtime = loadAppsScript()
    runtime.post(buildSubmission(SESSION_A))
    const afterFirst = structuredClone(sheetRows(runtime))

    assert.equal(runtime.post(buildSubmission(SESSION_B)).status, 'saved')
    const retry = runtime.post(buildSubmission(SESSION_A))
    assert.deepEqual(retry, { ok: true, status: 'duplicate', submissionId: SESSION_A.sessionId, rowsAdded: 0 })

    const rows = sheetRows(runtime)
    assert.equal(rows.length, 1 + 6)
    assert.deepEqual(rows.slice(0, afterFirst.length), afterFirst, 'earlier rows must be unchanged')
    const ids = rows.slice(1).map((row) => row[0])
    assert.deepEqual(ids, [...Array(3).fill(SESSION_A.sessionId), ...Array(3).fill(SESSION_B.sessionId)])
  })

  it('keeps two sessions of the same participant ID as separate observations', () => {
    const runtime = loadAppsScript()
    runtime.post(buildSubmission(SESSION_A))
    const sameParticipantNewSession = syntheticSession({ sessionId: 'a3c5e7f9-1b2d-4f6a-8c0e-2d4f6a8c0e1b' })
    assert.equal(runtime.post(buildSubmission(sameParticipantNewSession)).status, 'saved')
    assert.equal(sheetRows(runtime).length, 1 + 6)
  })

  it('writes zeros and missing values faithfully', () => {
    const runtime = loadAppsScript()
    const session = syntheticSession({
      demographicData: { ...SESSION_A.demographicData, caffeineConsumed: false, caffeineTimeAgo: undefined },
    })
    session.results[0] = { ...session.results[0], realDurationSec: 0, estimatedTimeSec: 382 }
    runtime.post(buildSubmission(session))
    const [header, first] = sheetRows(runtime)
    const cell = (column: string) => first[header.indexOf(column)]
    assert.equal(cell('RealDurationSeconds'), 0)
    assert.equal(cell('TemporalBiasSeconds'), 382)
    assert.equal(cell('TemporalBiasPercent'), '')
    assert.equal(cell('CaffeineTimeAgo'), '')
    assert.match(String(cell('ReceivedAt')), /^\d{4}-\d{2}-\d{2}T/)
  })

  it('rejects malformed or incomplete submissions without writing', () => {
    const runtime = loadAppsScript()
    const valid = buildSubmission(SESSION_A)
    const cases: Array<[string, unknown]> = [
      ['not json', '{oops'],
      ['empty', ''],
      ['two rows', { ...valid, rows: valid.rows.slice(0, 2) }],
      ['bad id', { ...valid, submissionId: 'not-a-uuid' }],
      ['wrong schema', { ...valid, schemaVersion: 1 }],
      ['missing age', { ...valid, rows: valid.rows.map((row) => ({ ...row, Age: null })) }],
      ['likert out of range', { ...valid, rows: valid.rows.map((row, i) => (i === 0 ? { ...row, ConfidenceRating: 9 } : row)) }],
      ['duplicate condition', { ...valid, rows: valid.rows.map((row) => ({ ...row, Condition: 'video' })) }],
      ['tampered bias', { ...valid, rows: valid.rows.map((row) => ({ ...row, TemporalBiasSeconds: 1 })) }],
      ['mixed participants', { ...valid, rows: valid.rows.map((row, i) => (i === 2 ? { ...row, ParticipantID: 'OTHER' } : row)) }],
      ['too large', JSON.stringify({ ...valid, padding: 'x'.repeat(60_000) })],
    ]
    for (const [label, body] of cases) {
      const response = runtime.post(body)
      assert.equal(response.ok, false, label)
      assert.equal(response.status, 'invalid', label)
    }
    assert.equal(sheetRows(runtime).length, 0)
    assert.equal(runtime.lock.acquired, 0, 'invalid payloads must not take the lock')
  })

  it('reports busy when the lock is unavailable', () => {
    const runtime = loadAppsScript()
    runtime.lock.available = false
    const response = runtime.post(buildSubmission(SESSION_A))
    assert.equal(response.status, 'busy')
    assert.equal(sheetRows(runtime).length, 0)
  })

  it('refuses to append below an edited header', () => {
    const runtime = loadAppsScript()
    runtime.post(buildSubmission(SESSION_A))
    sheetRows(runtime)[0][1] = 'ParticipantName'
    const response = runtime.post(buildSubmission(SESSION_B))
    assert.equal(response.status, 'error')
    assert.equal(sheetRows(runtime).length, 4)
  })

  it('grows the sheet when it is full', () => {
    const runtime = loadAppsScript()
    runtime.post(buildSubmission(SESSION_A))
    runtime.spreadsheet.getSheetByName('Responses')!.maxRows = 4
    assert.equal(runtime.post(buildSubmission(SESSION_B)).status, 'saved')
    assert.equal(sheetRows(runtime).length, 7)
  })

  it('doGet is a health check that returns no data', () => {
    const runtime = loadAppsScript()
    runtime.post(buildSubmission(SESSION_A))
    const body = JSON.parse(runtime.doGet().getContent())
    assert.deepEqual(body, { ok: true, service: 'media-time-perception', schemaVersion: 2 })
  })
})

describe('Apps Script cumulative export', () => {
  it('exports all complete sessions into one CSV with a stable header', () => {
    const runtime = loadAppsScript()
    runtime.post(buildSubmission(SESSION_A))
    runtime.post(buildSubmission(SESSION_B))
    runtime.post(buildSubmission(SESSION_A))

    const result = runtime.buildDatasetExport(runtime.spreadsheet)
    assert.match(result.filename, /^media-time-perception-dataset-\d{4}-\d{2}-\d{2}\.csv$/)
    assert.equal(result.submissionCount, 2)
    assert.equal(result.rowCount, 6)
    assert.equal(result.excludedSubmissions, 0)

    const lines = result.csv.split('\r\n')
    assert.equal(lines.length, 7)
    assert.equal(lines[0], DATASET_COLUMNS.join(','))
    assert.ok(lines.every((line) => line.split(',').length === DATASET_COLUMNS.length))
    assert.ok(lines.slice(1, 4).every((line) => line.startsWith(SESSION_A.sessionId)))
    assert.ok(lines.slice(4).every((line) => line.startsWith(SESSION_B.sessionId)))
  })

  it('excludes incomplete groups that were edited into the sheet by hand', () => {
    const runtime = loadAppsScript()
    runtime.post(buildSubmission(SESSION_A))
    const sheet = runtime.spreadsheet.getSheetByName('Responses')!
    sheet.rows.push([...sheet.rows[1]].map((cell, index) => (index === 0 ? 'manual-row' : cell)))
    const result = runtime.buildDatasetExport(runtime.spreadsheet)
    assert.equal(result.submissionCount, 1)
    assert.equal(result.excludedSubmissions, 1)
  })

  it('handles an empty dataset', () => {
    const runtime = loadAppsScript()
    const result = runtime.buildDatasetExport(runtime.spreadsheet)
    assert.equal(result.rowCount, 0)
    assert.equal(result.csv, DATASET_COLUMNS.join(','))
  })
})
