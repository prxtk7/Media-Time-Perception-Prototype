import type { SubmissionPayload } from './dataset'

/**
 * Client for the Google Apps Script web app in google-apps-script.js.
 *
 * The request is a CORS "simple request" (POST with a text/plain body), so the browser
 * sends no preflight, which Apps Script cannot answer, and the JSON response stays
 * readable. The original implementation used `mode: 'no-cors'` and reported success
 * without ever seeing the response.
 *
 * This module never logs participant data.
 */

export type SubmissionFailureReason =
  | 'not-configured'
  | 'invalid-config'
  | 'timeout'
  | 'network'
  | 'invalid-response'
  | 'rejected'
  | 'server-error'

export type SubmissionResult =
  | { ok: true; status: 'saved' | 'duplicate'; rowsAdded: number }
  | { ok: false; reason: SubmissionFailureReason; message: string }

export interface SubmitOptions {
  fetchImpl?: typeof fetch
  timeoutMs?: number
  /** Extra attempts after the first one, for transient failures only. */
  retries?: number
  retryDelayMs?: number
  sleep?: (ms: number) => Promise<void>
}

const APPS_SCRIPT_URL_PATTERN = /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/

export type EndpointCheck =
  | { ok: true; url: string }
  | { ok: false; reason: 'not-configured' | 'invalid-config'; message: string }

export function checkEndpointUrl(rawUrl: string | undefined): EndpointCheck {
  const url = (rawUrl ?? '').trim()
  if (!url) {
    return { ok: false, reason: 'not-configured', message: 'VITE_GOOGLE_SHEETS_WEB_APP_URL is not set.' }
  }
  if (!APPS_SCRIPT_URL_PATTERN.test(url)) {
    return {
      ok: false,
      reason: 'invalid-config',
      message: 'VITE_GOOGLE_SHEETS_WEB_APP_URL must look like https://script.google.com/macros/s/<deployment-id>/exec',
    }
  }
  return { ok: true, url }
}

const TRANSIENT_REASONS: SubmissionFailureReason[] = ['timeout', 'network', 'server-error']

function defaultSleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

async function attemptSubmission(
  url: string,
  payload: SubmissionPayload,
  fetchImpl: typeof fetch,
  timeoutMs: number,
): Promise<SubmissionResult> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  let responseText: string
  try {
    const response = await fetchImpl(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      redirect: 'follow',
      signal: controller.signal,
    })
    responseText = await response.text()
    if (!response.ok) {
      return { ok: false, reason: 'server-error', message: `Endpoint answered HTTP ${response.status}.` }
    }
  } catch (error) {
    if (controller.signal.aborted) {
      return { ok: false, reason: 'timeout', message: `No answer within ${Math.round(timeoutMs / 1000)} s.` }
    }
    return {
      ok: false,
      reason: 'network',
      message: error instanceof Error ? error.message : 'Network request failed.',
    }
  } finally {
    clearTimeout(timer)
  }

  let body: unknown
  try {
    body = JSON.parse(responseText)
  } catch {
    // Typically a Google sign-in or error page: the deployment is not public or the URL is wrong.
    return { ok: false, reason: 'invalid-response', message: 'Endpoint did not answer with JSON.' }
  }
  if (!body || typeof body !== 'object') {
    return { ok: false, reason: 'invalid-response', message: 'Endpoint answered with an unexpected value.' }
  }
  const { ok, status, rowsAdded, error } = body as Record<string, unknown>
  if (ok === true && (status === 'saved' || status === 'duplicate')) {
    return { ok: true, status, rowsAdded: typeof rowsAdded === 'number' ? rowsAdded : 0 }
  }
  const message = typeof error === 'string' ? error : 'Endpoint reported a failure.'
  if (status === 'invalid') return { ok: false, reason: 'rejected', message }
  if (status === 'busy' || status === 'error') return { ok: false, reason: 'server-error', message }
  return { ok: false, reason: 'invalid-response', message }
}

/**
 * Sends one completed session. Retries reuse the same payload (and therefore the same
 * submission ID), which the Apps Script treats idempotently.
 */
export async function submitToGoogleSheets(
  rawUrl: string | undefined,
  payload: SubmissionPayload,
  options: SubmitOptions = {},
): Promise<SubmissionResult> {
  const endpoint = checkEndpointUrl(rawUrl)
  if (!endpoint.ok) return endpoint

  const fetchImpl: typeof fetch = options.fetchImpl ?? ((input, init) => fetch(input, init))
  const timeoutMs = options.timeoutMs ?? 20_000
  const retries = options.retries ?? 2
  const retryDelayMs = options.retryDelayMs ?? 2_000
  const sleep = options.sleep ?? defaultSleep

  let result = await attemptSubmission(endpoint.url, payload, fetchImpl, timeoutMs)
  for (let attempt = 1; attempt <= retries && !result.ok && TRANSIENT_REASONS.includes(result.reason); attempt += 1) {
    await sleep(retryDelayMs * attempt)
    result = await attemptSubmission(endpoint.url, payload, fetchImpl, timeoutMs)
  }
  return result
}
