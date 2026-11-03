# Data schema

The prototype produces two CSV formats from the same observations:

| | Central dataset | Individual session export |
|---|---|---|
| Where it comes from | `Responses` tab of the study's Google Sheet, written by `google-apps-script.js` | Generated in the browser on the summary screen (`src/lib/csv.ts`) |
| Scope | Every completed session that reached the Apps Script | One session |
| Column names | Analysis-friendly, no spaces (chosen for JASP) | Human-readable |
| Download | Researcher, from the Sheet ([cumulative-export.md](cumulative-export.md)) | Participant/experimenter device, automatic + button |

Both formats are **long**: one row per participant × condition, so every completed session has exactly three rows (video, audio, text).

The source of truth for the central columns is `DATASET_COLUMNS` in [`src/lib/dataset.ts`](../src/lib/dataset.ts); `COLUMN_SPECS` in [`google-apps-script.js`](../google-apps-script.js) must list the same columns in the same order. The schema version is `2` (`DATASET_SCHEMA_VERSION`); the original group version had no version and is called v1 here.

## Central dataset columns

| Column | Type | Unit / allowed values | Meaning |
|---|---|---|---|
| `SubmissionID` | text (UUID v4) | | Identifies one completed session. Generated when the session starts and reused for every retry. |
| `ParticipantID` | text | `PT-XXXXXX` | Pseudonymous ID shown on the welcome screen. Not guaranteed unique: the experimenter can regenerate it. |
| `ConsentDate` | text (ISO 8601, UTC) | | When the consent checkbox was confirmed and the session started. |
| `ParticipantNumber` | integer ≥ 1 | | Value of the participant counter **on the device that ran the session** (`localStorage`). Not a global sequence. |
| `LatinSquareOrder` | integer | 1–6 | Index of the counterbalanced condition order (`src/lib/latinSquare.ts`). |
| `ConditionOrder` | text | e.g. `V-A-T` | Presentation order: V = video, A = audio, T = text. |
| `Language` | text | `en`, `de` | UI language when the session was submitted. The text stimulus is shown in this language; video and audio are English. |
| `Age` | number | years, 1–120 | Self-reported. |
| `ShortVideosFrequency`, `AudioFrequency`, `TextFrequency` | text | `very_rarely`, `rarely`, `sometimes`, `often`, `very_often` | Media usage habits. |
| `CaffeineConsumed` | text | `Yes`, `No` | Caffeine today. |
| `CaffeineTimeAgo` | text | `less_than_1_hour`, `1_to_3_hours`, `more_than_3_hours`, empty | Empty when `CaffeineConsumed` is `No`. |
| `AlertnessLevel` | integer | 1 (very tired) – 5 (very alert) | |
| `Condition` | text | `video`, `audio`, `text` | |
| `ConditionPosition` | integer | 1–3 | Position of this condition in `ConditionOrder`. |
| `RealDurationSeconds` | integer ≥ 0 | seconds | Measured by the app, see [Timing](#timing). |
| `EstimatedDurationSeconds` | integer ≥ 1 | seconds | Participant's estimate (minutes × 60 + seconds). |
| `TemporalBiasSeconds` | integer | seconds | `EstimatedDurationSeconds − RealDurationSeconds`. Positive = overestimation. |
| `TemporalBiasPercent` | number | % (2 decimals) | `TemporalBiasSeconds / RealDurationSeconds × 100`. **Empty when `RealDurationSeconds` is 0** (undefined). |
| `ConfidenceRating` | integer | 1–5 | Confidence in the time estimate. |
| `Immersion_Absorbed` … `Immersion_LostTrackTime` | integer | 1–5 (strongly disagree – strongly agree) | Five immersion items, in questionnaire order. |
| `Immersion_Mean` | number | 1–5 (2 decimals) | Mean of the five immersion items. |
| `Engagement_Engaging` … `Engagement_Motivated` | integer | 1–5 | Five engagement items, in questionnaire order. |
| `Engagement_Mean` | number | 1–5 (2 decimals) | Mean of the five engagement items. |
| `OverallEngagement` | number | 1–5 (2 decimals) | Mean of `Immersion_Mean` and `Engagement_Mean`. |
| `Familiarity` | integer | 1–5 | Familiarity with the topic. |
| `Timestamp` | text (ISO 8601, UTC) | | When this condition's questionnaire was submitted. |
| `Date`, `Time` | text | `YYYY-MM-DD`, `HH:MM:SS` (UTC) | Derived from `Timestamp`. |
| `ReceivedAt` | text (ISO 8601, UTC) | | Set by the Apps Script when it stored the session. |

The full item wording is in [`src/data/translations.ts`](../src/data/translations.ts) (`questionnaire.likert`) and in [`docs/research/screen-text.txt`](research/screen-text.txt).

### Missing values

A missing value is an **empty cell** in the Sheet and an **empty field** in every CSV (and `null` in the JSON payload). Zero is a value, not a missing value: the original Apps Script wrote `value || ''`, which turned a 0-second duration or a 0-second bias into an empty cell; the current script keeps it.

Only two columns can legitimately be empty in the central dataset: `CaffeineTimeAgo` (no caffeine) and `TemporalBiasPercent` (real duration 0). Everything else is required and validated.

### What counts as a complete, exportable session

The Apps Script stores a session only if all of these hold, otherwise it stores nothing and answers `status: "invalid"`:

- exactly three rows, one each for `video`, `audio` and `text`;
- every required column present and within its allowed values;
- the participant/session columns identical on all three rows;
- `ConditionPosition` consistent with `ConditionOrder`;
- `TemporalBiasSeconds`, the means and `Date`/`Time` consistent with the values they are derived from.

The browser cannot submit an incomplete session at all (`buildSubmission` throws). The cumulative export additionally skips any `SubmissionID` that does not have exactly the three conditions, for example rows edited into the Sheet by hand, and reports how many it skipped.

### Integrity rules

- **No duplicates from retries.** A `SubmissionID` that is already in the `Responses` tab is acknowledged as `duplicate` and not written again. Duplicate detection never uses participant ID or timestamps, so two genuine sessions with the same participant ID stay separate.
- **No overwrites.** Rows are appended below the last row while holding the script lock, so two participants finishing at the same moment cannot write into the same rows.
- **Server save vs. local copy.** The summary screen says “Your responses have been saved” only after the Apps Script answered `saved` or `duplicate`. The individual CSV is a local copy and is downloaded regardless.
- **Text cells stay text.** ID and timestamp columns are formatted as plain text in the Sheet, so Google Sheets does not convert them to dates or numbers.

## Timing

Recorded by `src/pages/MediaScreen.tsx` and `src/components/MediaPlayer.tsx`:

- **Video / audio:** the time the media element was **actually playing**, summed over every interval from the browser's `playing` event to the next `pause`, `waiting` (buffering stall) or `ended` event, measured with the monotonic `performance.now()` clock and rounded to whole seconds. Time before playback starts, buffering stalls and pauses are not counted. The condition ends when the media ends or **Skip to Questionnaire** is pressed. If the media never played (skipped before Play, or the file could not be loaded), the value is 0. A 10-minute safety timer ends the condition with the exposure measured so far if `ended` never fires.
- **Text:** wall-clock time from **Start Reading** to **I have finished reading**.
- If no duration was recorded at all (the questionnaire was opened by URL without the media screen), the value is 0. No nominal stimulus length is ever substituted.

A full, uninterrupted playback therefore records about the file length: 192 s for the video, 189 s for the audio. The study design document treats both as three minutes. See *Known limitations* in the README before analysing durations.

*Change from the group version:* the original timer started at the Play **click** and used wall-clock time, so it included start-up delay and buffering; if `play()` failed it kept running with no media; and a missing measurement fell back to a fabricated 180 s.

## Individual session export (`time-perception-<ParticipantID>-<date>.csv`)

30 columns, in this order:

`Participant ID, Session ID, Consent Signed At, Age, Short Videos Frequency, Audio Frequency, Text Frequency, Caffeine Consumed, Caffeine Time Ago, Alertness, Condition, Real Duration (sec), Estimated Duration (sec), Temporal Bias (sec), Confidence, Immersion 1–5, Immersion Mean, Engagement 1–5, Engagement Mean, Overall Engagement, Familiarity, Timestamp`

`Session ID` equals `SubmissionID` in the central dataset, so a local file can be matched to its central rows. Means are written with two decimals. Rows follow the order in which the conditions were completed.

## Example (fictional values)

Central dataset, first columns of one session (abridged):

```csv
SubmissionID,ParticipantID,ConditionOrder,Language,Condition,ConditionPosition,RealDurationSeconds,EstimatedDurationSeconds,TemporalBiasSeconds,TemporalBiasPercent,Immersion_Mean,Engagement_Mean
0b7f2a52-3c1d-4e8f-9a6b-1c2d3e4f5a6b,PT-EXAMPL,A-T-V,en,audio,1,190,240,50,26.32,2.80,4.00
0b7f2a52-3c1d-4e8f-9a6b-1c2d3e4f5a6b,PT-EXAMPL,A-T-V,en,text,2,95,150,55,57.89,3.20,3.60
0b7f2a52-3c1d-4e8f-9a6b-1c2d3e4f5a6b,PT-EXAMPL,A-T-V,en,video,3,193,170,-23,-11.92,4.00,4.20
```

## Changes compared with the original group version

| Change | Reason |
|---|---|
| `ParticipantName` removed from the Sheet payload and the individual CSV | The consent text tells participants that exported data contains the anonymized participant ID only. The name is still entered on the welcome screen and kept in the browser for the session. |
| `SubmissionID` added (central), `Session ID` added (individual CSV) | Idempotent retries and matching local files to central rows. |
| `Language` added | The text stimulus differs between English and German. |
| `ReceivedAt` added | Server-side receipt time. |
| `TemporalBiasPercent` empty instead of 0 when the real duration is 0 | 0 % would read as a perfect estimate. |
| Zeros preserved | The old script erased them (`value \|\| ''`). |
| `Time` is UTC | It used the participant's local time while `Date` was UTC. |
| Data goes to a new `Responses` tab | Rows written by the old script (old header, may contain names) are left untouched in their original tab. |
