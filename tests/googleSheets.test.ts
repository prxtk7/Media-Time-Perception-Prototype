import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildSubmission } from '../src/lib/dataset'
import { checkEndpointUrl, submitToGoogleSheets } from '../src/lib/googleSheets'
import { syntheticSession } from './helpers/fixtures'

const URL_OK = 'https://script.google.com/macros/s/AKfycbTESTONLY_deployment-id/exec'
const payload = buildSubmission(syntheticSession())
const noSleep = async () => undefined

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

function scriptedFetch(responses: Array<() => Promise<Response>>) {
  const calls: RequestInit[] = []
  const fetchImpl = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    calls.push(init ?? {})
    const next = responses[Math.min(calls.length - 1, responses.length - 1)]
    return next()
  }) as typeof fetch
  return { fetchImpl, calls }
}

describe('checkEndpointUrl', () => {
  it('reports a missing URL as not configured', () => {
    assert.deepEqual(checkEndpointUrl(''), {
      ok: false,
      reason: 'not-configured',
      message: 'VITE_GOOGLE_SHEETS_WEB_APP_URL is not set.',
    })
    assert.equal(checkEndpointUrl(undefined).ok, false)
  })

  it('rejects URLs that are not Apps Script /exec deployments', () => {
    for (const url of [
      'http://script.google.com/macros/s/abc/exec',
      'https://script.google.com/macros/s/abc/dev',
      'https://docs.google.com/spreadsheets/d/abc/edit',
      'https://example.com/exec',
    ]) {
      const check = checkEndpointUrl(url)
      assert.equal(check.ok, false, url)
      assert.equal(!check.ok && check.reason, 'invalid-config', url)
    }
    assert.deepEqual(checkEndpointUrl(` ${URL_OK} `), { ok: true, url: URL_OK })
  })
})

describe('submitToGoogleSheets', () => {
  it('sends a CORS simple request with the JSON payload as text/plain', async () => {
    const { fetchImpl, calls } = scriptedFetch([async () => jsonResponse({ ok: true, status: 'saved', rowsAdded: 3 })])
    const result = await submitToGoogleSheets(URL_OK, payload, { fetchImpl, sleep: noSleep })
    assert.deepEqual(result, { ok: true, status: 'saved', rowsAdded: 3 })
    assert.equal(calls.length, 1)
    assert.equal(calls[0].method, 'POST')
    assert.equal(calls[0].mode, undefined, 'must not use no-cors, which hides the response')
    assert.deepEqual(calls[0].headers, { 'Content-Type': 'text/plain;charset=utf-8' })
    assert.deepEqual(JSON.parse(String(calls[0].body)), payload)
  })

  it('treats a duplicate as success', async () => {
    const { fetchImpl } = scriptedFetch([async () => jsonResponse({ ok: true, status: 'duplicate', rowsAdded: 0 })])
    assert.deepEqual(await submitToGoogleSheets(URL_OK, payload, { fetchImpl, sleep: noSleep }), {
      ok: true,
      status: 'duplicate',
      rowsAdded: 0,
    })
  })

  it('does not call the network when the endpoint is not configured', async () => {
    const { fetchImpl, calls } = scriptedFetch([async () => jsonResponse({ ok: true, status: 'saved' })])
    const result = await submitToGoogleSheets('', payload, { fetchImpl })
    assert.equal(result.ok, false)
    assert.equal(!result.ok && result.reason, 'not-configured')
    assert.equal(calls.length, 0)
  })

  it('retries network failures with the same payload, then reports failure', async () => {
    const { fetchImpl, calls } = scriptedFetch([
      async () => {
        throw new TypeError('Failed to fetch')
      },
    ])
    const result = await submitToGoogleSheets(URL_OK, payload, { fetchImpl, sleep: noSleep, retries: 2 })
    assert.equal(result.ok, false)
    assert.equal(!result.ok && result.reason, 'network')
    assert.equal(calls.length, 3)
    assert.ok(calls.every((call) => call.body === calls[0].body), 'retries must reuse the submission ID')
  })

  it('recovers when a retry succeeds', async () => {
    const { fetchImpl, calls } = scriptedFetch([
      async () => {
        throw new TypeError('Failed to fetch')
      },
      async () => jsonResponse({ ok: true, status: 'saved', rowsAdded: 3 }),
    ])
    const result = await submitToGoogleSheets(URL_OK, payload, { fetchImpl, sleep: noSleep })
    assert.equal(result.ok, true)
    assert.equal(calls.length, 2)
  })

  it('times out a request that never answers', async () => {
    const fetchImpl = ((_input: RequestInfo | URL, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
      })) as typeof fetch
    const result = await submitToGoogleSheets(URL_OK, payload, { fetchImpl, timeoutMs: 20, retries: 0 })
    assert.equal(result.ok, false)
    assert.equal(!result.ok && result.reason, 'timeout')
  })

  it('does not retry a rejected (invalid) submission', async () => {
    const { fetchImpl, calls } = scriptedFetch([
      async () => jsonResponse({ ok: false, status: 'invalid', error: 'Row 1: Age is required.' }),
    ])
    const result = await submitToGoogleSheets(URL_OK, payload, { fetchImpl, sleep: noSleep })
    assert.deepEqual(result, { ok: false, reason: 'rejected', message: 'Row 1: Age is required.' })
    assert.equal(calls.length, 1)
  })

  it('reports an HTML answer (for example a Google sign-in page) as an invalid response', async () => {
    const { fetchImpl } = scriptedFetch([async () => new Response('<!doctype html><title>Sign in</title>', { status: 200 })])
    const result = await submitToGoogleSheets(URL_OK, payload, { fetchImpl, sleep: noSleep })
    assert.equal(!result.ok && result.reason, 'invalid-response')
  })

  it('reports HTTP errors and a busy server as server errors after retrying', async () => {
    const { fetchImpl, calls } = scriptedFetch([
      async () => new Response('oops', { status: 500 }),
      async () => jsonResponse({ ok: false, status: 'busy', error: 'busy' }),
    ])
    const result = await submitToGoogleSheets(URL_OK, payload, { fetchImpl, sleep: noSleep, retries: 1 })
    assert.equal(!result.ok && result.reason, 'server-error')
    assert.equal(calls.length, 2)
  })
})
