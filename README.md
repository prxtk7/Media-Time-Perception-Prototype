# Media Time Perception Prototype

A browser-based experiment that presents the same content as a video, an audio podcast and a text article, asks participants how long each one lasted, and records their estimates alongside immersion and engagement ratings. Completed sessions are stored centrally in a Google Sheet through a Google Apps Script web app and can be downloaded as one cumulative CSV dataset.

Built as a group project in an HCI/psychology course during the first semester (winter term 2025) of my Master's studies. This repository is my portfolio version of that prototype: the group's experiment is unchanged, and I have since reworked its data collection, media timing, tests and documentation. [My contribution](#my-contribution) separates the two.

## Contents

- [Overview](#overview)
- [Research background and problem statement](#research-background-and-problem-statement)
- [Research objectives](#research-objectives)
- [Experimental methodology](#experimental-methodology)
- [HCI and psychology relevance](#hci-and-psychology-relevance)
- [My contribution](#my-contribution)
- [Experimental workflow](#experimental-workflow)
- [Implemented features](#implemented-features)
- [Technology stack](#technology-stack)
- [Architecture and data flow](#architecture-and-data-flow)
- [Participant data schema and CSV structure](#participant-data-schema-and-csv-structure)
- [Individual session export](#individual-session-export)
- [Cumulative dataset collection and export](#cumulative-dataset-collection-and-export)
- [Google Sheets and Apps Script configuration](#google-sheets-and-apps-script-configuration)
- [Prerequisites](#prerequisites)
- [Local installation and setup](#local-installation-and-setup)
- [Environment variables](#environment-variables)
- [Development commands](#development-commands)
- [Production build and deployment](#production-build-and-deployment)
- [Testing and verification](#testing-and-verification)
- [Data privacy and research ethics](#data-privacy-and-research-ethics)
- [Known limitations and research considerations](#known-limitations-and-research-considerations)
- [Troubleshooting](#troubleshooting)
- [Repository structure](#repository-structure)
- [Future improvements](#future-improvements)

## Overview

Participants complete three conditions on one topic (virtual reality in gaming and entertainment):

1. **Video**: a short video, about 3 min 12 s.
2. **Audio**: a podcast without accompanying text, about 3 min 9 s.
3. **Text**: an article read at the participant's own pace.

After each condition they estimate its duration and answer a short questionnaire. The app measures how long the video or audio actually played, or how long the participant spent reading, so every observation pairs a *perceived* duration with a *measured* one.

Four different things happen with the data, and they are easy to confuse:

| | What it is | Who uses it |
|---|---|---|
| **Running the experiment locally** | `npm run dev`; the full participant flow in your browser. Works without any Google setup. | Developers, pilot testing |
| **Individual session export** | A CSV for the one session just completed, downloaded on the summary screen. A local copy only. | Experimenter at the device |
| **Central submission** | The summary screen sends the completed session to the Apps Script, which appends it to the study Sheet. | Automatic |
| **Cumulative dataset download** | One CSV of all complete sessions, downloaded from inside the Google Sheet. | Researchers with access to the Sheet |

## Research background and problem statement

Perceived duration is not a direct readout of clock time: attention, engagement and memory shape how long an activity feels. Prior work linked immersion in video games to reduced awareness of time passing (Sanders & Cairns, 2010; Michailidis et al., 2018) and reviewed how attention and memory drive duration judgements (Block, 2014). Most of this work studies games or interactive systems. The group's study design asks whether the same effect appears across everyday media formats when the content is held constant and only the modality changes.

## Research objectives

The experiment investigates whether the format in which the same content is presented (video, audio or text) changes how long people think it lasted, and whether that difference goes together with how immersed and engaged they felt. The group's study design document ([`docs/research/study-design.txt`](docs/research/study-design.txt)) states:

- **RQ1:** Does subjective time perception differ significantly across media types (short video, audio-only podcast, text) when exposure duration is held constant?
- **RQ2:** Do levels of immersion and engagement differ across media modalities?
- **RQ3:** Is temporal bias (over- or underestimation of elapsed time) associated with self-reported immersion and engagement?
- **H1:** Media that are more immersive and engaging will make people feel that less time has passed than less immersive media.

The planned analysis in that document is within-subjects ANOVA for RQ1 and RQ2 and correlations for RQ3. This repository contains the instrument only. It contains no collected data, sample size or results.

## Experimental methodology

As implemented in this prototype:

- **Design:** within-subjects. Every participant completes all three conditions once.
- **Independent variable:** media modality.

  | Condition | Stimulus | Length |
  |---|---|---|
  | Video | “Virtual Reality in Gaming and Entertainment” (`public/media/Video.mp4`, H.264/AAC), no playback controls | 192 s |
  | Audio | Podcast on the same topic (`public/media/virtual-reality-audio.m4a`, AAC), no text shown | 189 s |
  | Text | Article on the same topic, about 370 words (`src/data/mediaContent.ts`), self-paced | Varies |

- **Order:** counterbalanced across the six possible orders (Latin square, `src/lib/latinSquare.ts`), assigned from a participant counter on the device.
- **Measured duration:** for video and audio, the time the media was actually playing; for text, the time from *Start Reading* to *I have finished reading* (see [Timing](docs/data-schema.md#timing)).
- **Dependent measures after each condition:** estimated duration (minutes and seconds), temporal bias (estimate − measured duration, in seconds and %), confidence in the estimate, five immersion items, five engagement items and familiarity with the topic, all on 1–5 scales.
- **Covariates recorded once:** age, frequency of short-video, audio and text use, caffeine today and when, current alertness.
- **Controls against time cues:** no media controls, fullscreen requested, instructions not to check the time, no duration shown anywhere.

## HCI and psychology relevance

- **Psychology:** operationalizes temporal bias as estimated minus measured duration and relates it to standard immersion/engagement self-report items, controlling descriptively for familiarity, media habits, caffeine and alertness.
- **HCI:** the instrument itself is an interaction-design problem. Playback controls are hidden so participants cannot see elapsed time, the app requests fullscreen to hide the system clock, the text condition starts its timer only when the participant chooses to begin reading, and the questionnaire cannot be submitted incomplete. Each choice trades experimental control against participant comfort.
- **Research software:** a study is only as good as its data pipeline. Much of the portfolio work here is about making sure every completed session is stored once, intact, and only where the consent text says it will be.

## My contribution

### Original group project (winter term 2025)

The prototype was a group project. The technical implementation of the application and its original architecture were primarily the work of a teammate. My contributions to the group project were:

- **Questionnaires:** I designed the participant questionnaires.
- **Media conditions:** I worked on implementing the three experimental media conditions.
- **CSV reporting:** I contributed to the CSV reporting functionality.
- **Coordination:** I coordinated the group and integrated the contributions of the different members.
- **Research documentation:** I contributed to the research documentation.

### Portfolio improvements (individual work after the course)

Starting from the group's code, I reviewed the data handling end to end and made the following changes on my own:

- **Centralised Google Sheets data collection.** The original integration sent data in `no-cors` mode, so it could never see whether a save worked and always reported success. I rewrote the Apps Script and the client so that the script validates each complete session (three conditions, value ranges, consistency of derived measures) and returns a result the app can read.
- **Submission handling and duplicate protection.** Each session gets a UUID when it starts. The Apps Script appends under a script lock, so simultaneous submissions cannot overwrite each other, and ignores a `SubmissionID` it has already stored, so retries never create duplicates. The browser retries transient failures and only tells the participant their responses were saved after the server confirmed it. I also fixed the original script erasing 0-second values (`value || ''`) and its duplicate check, which never matched because Sheets had turned the timestamps into dates.
- **Cumulative CSV export.** Researchers download all complete sessions as one Excel-friendly CSV from a menu inside the Google Sheet, protected by Google sign-in and the Sheet's sharing settings, instead of merging one file per participant.
- **Media playback and timing accuracy.** The local copies of the stimuli had become Git LFS pointer files, so video and audio could not play; I restored the original files, verified by their SHA-256 hashes. The playback timer previously started at the Play click, ran on even if playback failed, and fell back to an assumed 180 s when nothing was measured. It now counts only the time the media is actually playing, records 0 when nothing played, and shows an error when a file cannot be played.
- **Privacy fixes.** Participant names are no longer exported or sent to the Sheet, as the consent text promises, and participant data is no longer written to the browser console.
- **Automated testing.** 41 automated tests, including the real Apps Script running against an in-memory spreadsheet, plus local browser walkthroughs with synthetic participants covering network failures and real media playback.
- **Technical documentation and setup instructions.** This README, the guides in [`docs/`](docs/) and environment-based configuration (`.env.example`).

## Experimental workflow

| Step | Route | What happens | Data recorded |
|---|---|---|---|
| 1. Welcome and consent | `/` | Study information, important instructions, consent summary; a pseudonymous ID (`PT-XXXXXX`) is generated and can be copied or regenerated; full name and consent checkbox are required. | Name (browser only), participant ID, consent time |
| 2. Demographics | `/demographics` | Age, frequency of short-video/audio/text use, caffeine today and when, current alertness. | Demographics |
| 3. Instructions | `/instructions` | Task instructions; do not check the time. | – |
| 4. Condition 1–3 | `/media/:index` | One condition per screen in a counterbalanced order (6 orders, Latin square). Video/audio: **Play**, no controls, optional **Skip to Questionnaire**. Text: **Start Reading**, then **I have finished reading**. Fullscreen is requested. | Measured duration |
| 5. Questionnaire 1–3 | `/questionnaire/:index` | Duration estimate (minutes + seconds), confidence, 5 immersion items, 5 engagement items, familiarity, all on 1–5 scales, all required. | Estimate and ratings |
| 6. Debriefing and completion | `/summary` | Debriefing text; the session is submitted centrally and its status is shown; the individual CSV downloads automatically and on request; **Start a new participant** clears the session. | Central submission |

**Exit study** in the top bar clears the session at any point. The session is kept in `localStorage`, so a reload continues where the participant was.

## Implemented features

- Six-screen participant flow with route guards that keep participants on the current step.
- Latin-square counterbalancing of the three conditions.
- Measured durations for every condition, including self-paced reading time.
- Required-field validation for demographics and questionnaires.
- English/German UI (the video and audio stimuli are English), light/dark theme.
- Session persistence across reloads; explicit reset for the next participant.
- Individual session CSV export (automatic and button).
- Central submission to Google Sheets with validation, idempotent retries, locking and an honest status message.
- Cumulative CSV export from the Sheet, limited to complete sessions.

## Technology stack

| Technology | Role |
|---|---|
| React 19 + TypeScript 5.9 | UI and application logic (strict mode) |
| Vite 7 | Dev server, production build, `VITE_*` environment variables |
| React Router 7 | One route per experiment step |
| React Context + `localStorage` | Session and settings state that survives reloads |
| Tailwind CSS 3 (+ typography plugin) | Styling, dark mode |
| Framer Motion | Screen transitions |
| Headless UI | Accessible radio groups for Likert scales |
| Native `<video>` / `<audio>` | Stimulus playback without controls (`react-player` is still listed in `package.json` but not used) |
| Google Apps Script + Google Sheets | Central data store and researcher export; no other backend |
| Node test runner + `tsx` | Unit and integration tests |
| ESLint 9 | Linting |
| Netlify | Static hosting of the original deployment (`netlify.toml`) |

## Architecture and data flow

```
┌───────────────────────────── Browser (static SPA) ─────────────────────────────┐
│ Welcome → Demographics → Instructions → [Media → Questionnaire] ×3 → Summary  │
│        SessionContext ⇄ localStorage (mtp_session_state_v1)                    │
│                                                         │                      │
│                       src/lib/csv.ts ── individual CSV ─┤                      │
│        src/lib/dataset.ts (buildSubmission) → src/lib/googleSheets.ts          │
└─────────────────────────────────────────────────────────┼──────────────────────┘
                                POST text/plain JSON      │   ▲ {ok, status}
                                                          ▼   │
                        Google Apps Script web app (google-apps-script.js)
                        validate → lock → skip if SubmissionID exists → append
                                                          │
                                                          ▼
                        Google Sheet, tab "Responses"  ──(Sheet menu, signed-in researcher)──▶ cumulative CSV
```

1. During the session, all state lives in React context and is mirrored to `localStorage`. Nothing leaves the browser before the summary screen.
2. On the summary screen, `buildSubmission` turns the session into three rows. It refuses incomplete sessions.
3. `submitToGoogleSheets` POSTs them with a 20 s timeout and up to two retries for network errors, timeouts and busy/server errors. Every retry carries the same `SubmissionID`.
4. The Apps Script answers `saved`, `duplicate`, `invalid`, `busy` or `error`. Only `saved`/`duplicate` count as success; the confirmation is stored in the session so a reload does not resend.

## Participant data schema and CSV structure

One row per participant × condition, three rows per session. The central dataset has 39 columns:

`SubmissionID, ParticipantID, ConsentDate, ParticipantNumber, LatinSquareOrder, ConditionOrder, Language, Age, ShortVideosFrequency, AudioFrequency, TextFrequency, CaffeineConsumed, CaffeineTimeAgo, AlertnessLevel, Condition, ConditionPosition, RealDurationSeconds, EstimatedDurationSeconds, TemporalBiasSeconds, TemporalBiasPercent, ConfidenceRating, Immersion_Absorbed, Immersion_Focused, Immersion_LostAwareness, Immersion_UnawareSurroundings, Immersion_LostTrackTime, Immersion_Mean, Engagement_Engaging, Engagement_MentallyInvolved, Engagement_HeldAttention, Engagement_Interested, Engagement_Motivated, Engagement_Mean, OverallEngagement, Familiarity, Timestamp, Date, Time, ReceivedAt`

Key definitions:

- `TemporalBiasSeconds = EstimatedDurationSeconds − RealDurationSeconds` (positive = overestimation).
- `TemporalBiasPercent` is empty when the real duration is 0.
- Means are item averages with two decimals; `OverallEngagement` is the mean of the immersion and engagement means.
- All timestamps are ISO 8601 UTC. Missing values are empty cells; zeros are kept.

Example (fictional values, abridged):

```csv
SubmissionID,ParticipantID,ConditionOrder,Condition,ConditionPosition,RealDurationSeconds,EstimatedDurationSeconds,TemporalBiasSeconds,TemporalBiasPercent
0b7f2a52-3c1d-4e8f-9a6b-1c2d3e4f5a6b,PT-EXAMPL,A-T-V,audio,1,190,240,50,26.32
0b7f2a52-3c1d-4e8f-9a6b-1c2d3e4f5a6b,PT-EXAMPL,A-T-V,text,2,95,150,55,57.89
0b7f2a52-3c1d-4e8f-9a6b-1c2d3e4f5a6b,PT-EXAMPL,A-T-V,video,3,193,170,-23,-11.92
```

Full column reference, allowed values, validation and completeness rules: [`docs/data-schema.md`](docs/data-schema.md).

## Individual session export

On the summary screen, `time-perception-<ParticipantID>-<YYYY-MM-DD>.csv` downloads about one second after the page opens, and again whenever **Download CSV** is pressed. It holds the three rows of that session in the original human-readable column layout (30 columns), with `Session ID` instead of the participant name. It is UTF-8 with a byte-order mark and CRLF line endings, so it opens correctly in Excel.

This file is a local copy for the experimenter. It is not proof that the session reached the central dataset; the status message above the buttons is.

## Cumulative dataset collection and export

Every completed session is appended to the `Responses` tab of the study Sheet, so the Sheet always holds the cumulative dataset. To download it:

1. Open the Sheet as a user it is shared with.
2. **Media Time Perception → Download dataset (CSV)**.
3. You get `media-time-perception-dataset-YYYY-MM-DD.csv`, containing all complete sessions (incomplete ones are counted and skipped).

The app itself has no way to read the dataset: the web app only accepts submissions, and the export runs inside Google Sheets under the signed-in user's permissions. Details and alternatives: [`docs/cumulative-export.md`](docs/cumulative-export.md).

## Google Sheets and Apps Script configuration

Short version (full steps and the security model in [`docs/google-sheets-setup.md`](docs/google-sheets-setup.md)):

1. Create a Google Sheet and share it only with the research team.
2. **Extensions → Apps Script**, paste [`google-apps-script.js`](google-apps-script.js), save.
3. **Deploy → New deployment → Web app**, *Execute as: Me*, *Who has access: Anyone*. Copy the `/exec` URL.
4. Put the URL into `VITE_GOOGLE_SHEETS_WEB_APP_URL` (see below).
5. After any script change: **Manage deployments → Edit → New version**.

*Who has access: Anyone* is necessary because participants are not signed in, and it means anyone with the URL can submit (but not read) data. Treat the endpoint as public. Use a **separate test Sheet** for development so synthetic sessions never mix with real data.

## Prerequisites

- Node.js 20.19+ or 22.12+ (required by Vite 7) and npm. Developed with Node 24 on Windows 11.
- Git with [Git LFS](https://git-lfs.com/) for the video and audio stimuli.
- A current Chromium-based browser, Firefox or Safari, and headphones for the audio condition.
- For central collection only: a Google account that can create Sheets and Apps Script projects.

## Local installation and setup

PowerShell:

```powershell
git lfs install
git clone https://github.com/<your-account>/Media-Time-Perception-Prototype.git
cd Media-Time-Perception-Prototype
git lfs pull                                    # downloads public/media/*.mp4 and *.m4a
(Get-Item public/media/Video.mp4).Length        # 137563336; ~134 bytes means you only have the LFS pointer
npm ci
Copy-Item .env.example .env.local               # optional, only for central collection
npm run dev
```

If the media files are still pointers after `git lfs pull`, the clone has no LFS objects to download; see [Troubleshooting](docs/troubleshooting.md#video-or-audio-never-shows-a-play-button--the-media-could-not-be-played).

Open the URL Vite prints (default `http://localhost:5173`). Without `.env.local` the whole experiment works, and the summary screen states that central collection is not configured.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `VITE_GOOGLE_SHEETS_WEB_APP_URL` | No | Apps Script web app URL, `https://script.google.com/macros/s/<DEPLOYMENT_ID>/exec`. Empty disables central submission; a malformed value is reported on the summary screen. |
| `VITE_VIDEO_URL` | No | Alternative location of the video stimulus. Default `/media/Video.mp4`. |
| `VITE_AUDIO_URL` | No | Alternative location of the audio stimulus. Default `/media/virtual-reality-audio.m4a`. |

Vite reads `.env.local` at startup (restart `npm run dev` after editing) and inlines every `VITE_*` variable into the public bundle at build time. **Never store secrets in `VITE_*` variables.** `.env` and `.env.*` are git-ignored except `.env.example`.

## Development commands

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm test` | Unit and integration tests (`tests/**/*.test.ts`) |
| `npm run lint` | ESLint |
| `npm run build` | Type-check all projects (`tsc -b`, including tests) and build to `dist/` |
| `npm run preview` | Serve the production build locally |

## Production build and deployment

```powershell
$env:VITE_GOOGLE_SHEETS_WEB_APP_URL = "https://script.google.com/macros/s/<DEPLOYMENT_ID>/exec"
npm run build
npm run preview
```

`dist/` is a static site. `netlify.toml` builds with `npm run build`, publishes `dist` and rewrites all routes to `index.html` for client-side routing. Set `VITE_GOOGLE_SHEETS_WEB_APP_URL` in the hosting provider's environment settings and rebuild whenever it changes. A public portfolio demo should be built **without** the variable (or with a test deployment) so visitors cannot add rows to the research Sheet.

The media files are large (video about 137 MB) and tracked with Git LFS. Check that your host's build fetches LFS files, or upload `public/media/` separately; otherwise the deployed site serves the small pointer files and no Play button appears.

## Testing and verification

| Check | Result |
|---|---|
| `npm test` | 41 tests passing |
| `npm run build` | Passing |
| `npm run lint` | 0 errors; 7 warnings, all pre-existing React-hooks/fast-refresh warnings in the original screens |
| Headless-browser walkthrough (local script, not part of the repository) | 3 synthetic sessions: normal save, lost server response with automatic retry (stored once), endpoint outage with honest failure and manual retry; reload does not resend; individual CSV has BOM and no name; console shows no participant data |
| Real-playback walkthrough (headless Edge, genuine media, real mouse click on Play; local script, not part of the repository) | Full video recorded 193 s (file 192.2 s); full audio with a 6 s pause recorded 190 s (file 189.4 s, wall clock 196 s); audio skipped after 8 s recorded 9 s; skip before Play 0 s; video served as an LFS pointer showed the playback error and recorded 0 s; text 3 s |
| Live Google deployment | Manually tested with two test sessions: both reached the `Responses` tab, and the cumulative CSV from the Sheet menu matched the two individual CSVs. The media files were missing during that test, so video/audio durations were 0; real playback was verified separately (row above) |

What the tests cover and how to run the live check: [`docs/testing.md`](docs/testing.md).

## Data privacy and research ethics

This prototype collects data from human participants. It does not claim any ethics approval or legal compliance; those depend on how and where the study is run.

What is collected and where it goes:

| Data | Browser `localStorage` | Central Sheet | Individual CSV |
|---|---|---|---|
| Full name | Yes, until *Start a new participant* / *Exit study* | **No** | **No** |
| Participant ID, consent time, demographics, ratings, durations, timestamps | Yes | Yes | Yes |
| UI language, submission ID, receipt time | – | Yes | Session ID only |

- The welcome screen requires a full name for the consent record and states that exported data contains the anonymized participant ID only. The original version still exported the name to the CSV and the Sheet; this version does not. **Flagged for review:** the app keeps no separate consent record, so if the team needs signed consent records they must be collected outside the app.
- **Flagged for review:** the consent text also says “No personal data will be stored”. Age, media habits, caffeine intake and timestamps linked to a pseudonymous ID are arguably personal data under GDPR. The consent wording has not been changed in this version; it should be reviewed by whoever is responsible for the study.
- Nothing about participants is written to the browser console.
- The Sheet is the only central copy. Restrict its sharing, and decide how long data is kept.
- Sheets created with the original version may contain participant names in their first tab; the new script never touches that tab. Removing them is a decision for the research team.
- No real participant data is part of this repository. `*.csv` and `*.xlsx` are git-ignored; test fixtures are labelled synthetic.

## Known limitations and research considerations

- **Limited live testing.** The Google integration has been tested live with two test sessions. Concurrent submissions, lock contention and long-term behaviour have only been tested against the in-memory stand-in.
- **Public write endpoint.** Anyone with the web app URL can submit plausible-looking sessions. Nobody can read data through it.
- **Video/audio duration counts only actual playback.** It sums the intervals between the media's `playing` event and the next `pause`/`waiting`/`ended`, so start-up delay, buffering and pauses are excluded. It does not detect whether the participant was watching: a muted device or a tab in the background still counts as playback. Text duration is wall-clock time between Start Reading and I have finished reading.
- **0 s means no measured exposure.** Skipping before Play, a media file that fails to load (the screen then shows an error), or opening the questionnaire by URL all record 0. Check `RealDurationSeconds` before analysis.
- **Stimulus length vs. study design.** The study design and the consent text describe three-minute media; the files are about 192 s and 189 s. The design document's analysis plan uses a fixed three minutes as the actual duration for video and audio, whereas the dataset records the measured playback time. Which one to use is an analysis decision.
- **Measures in the design document that the app does not collect.** The design document lists mind-wandering and arousal as post-condition measures and a time estimate in seconds. The app asks for the estimate in minutes and seconds, records alertness once before the conditions, and has no mind-wandering item.
- **Counterbalancing is per device.** The Latin-square counter lives in each browser's `localStorage`, so on many single-use devices most participants get the first order. It balances properly only on a shared lab machine.
- **Old local sessions.** A session completed with the original version and still in a browser's `localStorage` gets a new submission ID on first load and would be submitted once more, to the new `Responses` tab.
- **Stored name until reset.** If a participant closes the tab instead of using *Start a new participant*, their name stays in that browser.
- **Language.** Video and audio stimuli are English only; the German UI translates the text stimulus and questionnaires. The design document assumes English throughout; `Language` records which UI was used.

## Troubleshooting

Most problems show a short technical detail on the summary screen. Common cases:

- **“Central data collection is not set up”**: `VITE_GOOGLE_SHEETS_WEB_APP_URL` is empty or malformed; fix it and restart the dev server or rebuild.
- **`invalid-response`**: the deployment is not set to *Anyone*, or the URL is outdated.
- **No Play button / “The media could not be played (Media error 4)”**: `public/media/*` are Git LFS pointer files, not media. See the troubleshooting guide.
- **Sheet has rows but the app reports failure**: see the CORS note in the troubleshooting guide.

Full table: [`docs/troubleshooting.md`](docs/troubleshooting.md).

## Repository structure

```
├── google-apps-script.js        Apps Script: validation, idempotent append, health check, Sheet export menu
├── src/
│   ├── pages/                   One screen per step (Welcome, Demographics, Instructions, Media, Questionnaire, Summary)
│   ├── components/              MediaPlayer, Questionnaire, ResultExport, SubmissionStatus, SettingsBar, shared/Button
│   ├── context/                 SessionContext (session state + localStorage), SettingsContext (language, theme)
│   ├── data/                    mediaContent.ts (stimuli), translations.ts (EN/DE texts)
│   ├── lib/
│   │   ├── dataset.ts           Central schema, derived measures, buildSubmission
│   │   ├── googleSheets.ts      Submission client (timeout, retries, result parsing)
│   │   ├── csv.ts               Individual session CSV
│   │   ├── config.ts            Reads VITE_GOOGLE_SHEETS_WEB_APP_URL (media URLs: data/mediaContent.ts)
│   │   └── latinSquare.ts, storage.ts, id.ts, fullscreen.ts
│   └── types.ts
├── tests/                       Node test runner suites + in-memory Apps Script runtime
├── public/media/                Stimuli (Git LFS) and article.txt
├── docs/
│   ├── data-schema.md, google-sheets-setup.md, cumulative-export.md, testing.md, troubleshooting.md
│   ├── research/                Study design document and screen texts from the group project
│   └── archive/                 Original group documentation (outdated, kept for reference)
├── .env.example, netlify.toml, vite.config.ts, tsconfig*.json, eslint.config.js
```

## Future improvements

- Record whether each video/audio condition was played to the end or skipped, so analysis does not have to infer it from durations (needs agreement on the scientific variables).
- Assign counterbalancing orders centrally (for example from the Apps Script) instead of per device.
- Also track `visibilitychange`, so playback in a background tab can be flagged.
- Rate-limit or sign submissions to make fake rows harder to add.
- An end-to-end browser test in CI using a disposable test Sheet.
- Remove the unused `react-player` dependency and the remaining pre-existing lint warnings.

## References

- Block, R. A. (2014). *Cognitive models of psychological time*. Psychology Press.
- Sanders, T., & Cairns, P. (2010). Time perception, immersion and music in videogames. *Proceedings of the 24th BCS Interaction Specialist Group Conference (HCI 2010)*.
- Michailidis, L., Balaguer-Ballester, E., & He, X. (2018). Flow and immersion in video games: The aftermath of a conceptual challenge. *Frontiers in Psychology, 9*, 1682.
