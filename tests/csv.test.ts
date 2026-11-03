import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { escapeCsvValue, resultsToFullCsv, UTF8_BOM } from '../src/lib/csv'
import { syntheticSession } from './helpers/fixtures'

/** Small RFC 4180 parser so tests check what a spreadsheet would actually read. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"'
        i += 1
      } else if (char === '"') {
        quoted = false
      } else {
        field += char
      }
    } else if (char === '"') {
      quoted = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\r' && text[i + 1] === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
      i += 1
    } else {
      field += char
    }
  }
  row.push(field)
  rows.push(row)
  return rows
}

describe('escapeCsvValue', () => {
  it('leaves plain values unquoted', () => {
    assert.equal(escapeCsvValue('video'), 'video')
    assert.equal(escapeCsvValue(-12), '-12')
    assert.equal(escapeCsvValue(0), '0')
  })

  it('represents missing values as an empty field', () => {
    assert.equal(escapeCsvValue(null), '')
    assert.equal(escapeCsvValue(undefined), '')
  })

  it('quotes commas, quotes, line breaks and surrounding spaces', () => {
    assert.equal(escapeCsvValue('a,b'), '"a,b"')
    assert.equal(escapeCsvValue('say "hi"'), '"say ""hi"""')
    assert.equal(escapeCsvValue('line1\nline2'), '"line1\nline2"')
    assert.equal(escapeCsvValue('line1\r\nline2'), '"line1\r\nline2"')
    assert.equal(escapeCsvValue(' padded '), '" padded "')
  })

  it('round-trips tricky values through a CSV parser', () => {
    const values = ['a,b', 'say "hi"', 'x\r\ny', ' lead', 'Größe']
    const parsed = parseCsv(values.map(escapeCsvValue).join(','))
    assert.deepEqual(parsed, [values])
  })
})

describe('resultsToFullCsv (individual session export)', () => {
  const session = syntheticSession()
  const csv = resultsToFullCsv({
    results: session.results,
    participantId: session.participantId,
    sessionId: session.sessionId,
    consentSignedAt: session.consentSignedAt,
    demographicData: session.demographicData,
  })
  const rows = parseCsv(csv)

  it('has a header and one row per condition with a stable column count', () => {
    assert.equal(rows.length, 4)
    assert.equal(rows[0].length, 30)
    assert.ok(rows.every((row) => row.length === rows[0].length))
  })

  it('does not export the participant name', () => {
    assert.ok(!rows[0].includes('Participant Name'))
    assert.equal(rows[0][0], 'Participant ID')
    assert.equal(rows[0][1], 'Session ID')
    assert.equal(rows[1][1], session.sessionId)
  })

  it('keeps the existing derived measures', () => {
    const header = rows[0]
    const audio = rows.find((row) => row[header.indexOf('Condition')] === 'audio')!
    assert.equal(audio[header.indexOf('Real Duration (sec)')], '192')
    assert.equal(audio[header.indexOf('Estimated Duration (sec)')], '240')
    assert.equal(audio[header.indexOf('Temporal Bias (sec)')], '48')
    assert.equal(audio[header.indexOf('Immersion Mean')], '2.80')
    assert.equal(audio[header.indexOf('Engagement Mean')], '4.00')
    assert.equal(audio[header.indexOf('Overall Engagement')], '3.40')
  })

  it('uses CRLF line endings and leaves the BOM to the download step', () => {
    assert.ok(csv.includes('\r\n'))
    assert.ok(!csv.startsWith(UTF8_BOM))
    assert.equal(UTF8_BOM, '﻿')
  })

  it('returns an empty string for a session without results', () => {
    assert.equal(resultsToFullCsv({ results: [], participantId: 'SYNTH-0001' }), '')
  })
})
