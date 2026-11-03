# Testing and verification

## Automated tests

```powershell
npm test
```

Uses Node's built-in test runner through `tsx` (already a dev dependency). The suites in `tests/`:

| File | Covers |
|---|---|
| `csv.test.ts` | CSV escaping (commas, quotes, CR/LF, surrounding spaces, umlauts) checked with an RFC 4180 parser; individual export columns; no participant name; derived measures; CRLF. |
| `dataset.test.ts` | Building the central payload: one row per condition in presentation order, column set, no name, bias/means formulas, 0-second durations, missing caffeine time, UTC date/time, refusal of incomplete sessions, UUID generation. |
| `googleSheets.test.ts` | Submission client with a mocked `fetch`: request shape (CORS simple request, not `no-cors`), saved/duplicate, not configured / wrong URL, network failure with retries reusing the same payload, recovery on retry, timeout, rejected payloads not retried, HTML answers, HTTP errors and a busy server. |
| `appsScript.test.ts` | The real `google-apps-script.js`, executed in a Node `vm` against an in-memory spreadsheet (`tests/helpers/appsScript.ts`): storing a session, two distinct sessions plus a retry (no duplicate, earlier rows unchanged), same participant ID in two sessions, zeros and empty values, eleven malformed payloads rejected without writing, lock unavailable, edited header, sheet growth, health check without data, cumulative export (complete sessions only, stable header, empty dataset). |

All test data is synthetic (`tests/helpers/fixtures.ts`, IDs starting with `SYNTH-`).

## What the automated tests do not prove

The in-memory spreadsheet imitates only the Apps Script methods the script calls, and `npm test` never contacts Google or plays media. What has been checked beyond it:

- **Live Google deployment (manual):** two test sessions reached the `Responses` tab, and the cumulative CSV from the Sheet menu matched the two individual CSVs. Concurrent submissions and lock contention have not been tested live.
- **Media playback (local browser walkthrough):** the real video and audio files played in headless Edge after a real mouse click on Play. Full playback recorded 193 s (video) and 190 s (audio, with a 6 s pause excluded), skipping before Play recorded 0 s, and a broken media file showed the playback error and recorded 0 s. The walkthrough scripts are not part of the repository.

Repeat the live check in [google-sheets-setup.md](google-sheets-setup.md#5-verify-the-deployment) for every new deployment, against a **separate test Sheet**.

## Manual check with synthetic participants

1. Configure `.env.local` with the **test** deployment URL and run `npm run dev`.
2. Complete a session using a name such as `SYNTHETIC TEST 1`. Let the video and audio play to the end: `RealDurationSeconds` should be about 192 (video) and 189 (audio). Skipping before **Play** records 0 by design.
3. On the summary screen confirm “Your responses have been saved.”, the downloaded `time-perception-PT-…csv` (30 columns, no name) and three new rows in `Responses`.
4. Reload the summary screen: no new rows.
5. **Start a new participant**, complete a second session: three more rows with a different `SubmissionID`.
6. Download the cumulative CSV from the Sheet menu: two sessions, six rows.
7. Delete the test Sheet or its rows when done. Never run this against the real study Sheet.
