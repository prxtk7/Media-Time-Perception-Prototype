# Downloading the cumulative dataset

All completed sessions end up in the `Responses` tab of the study Sheet, so there is never a need to merge per-participant files.

## Recommended: the Sheet menu

1. Open the study Sheet while signed in with an account the Sheet is shared with.
2. Wait a few seconds for the **Media Time Perception** menu to appear (it is added by `onOpen`). On first use Google asks you to authorize the script.
3. **Media Time Perception → Download dataset (CSV)**.

The dialog downloads `media-time-perception-dataset-YYYY-MM-DD.csv` and reports how many sessions and rows it contains. The file:

- has the header row from [data-schema.md](data-schema.md) in a fixed column order;
- contains only complete sessions (three conditions per `SubmissionID`) and states how many incomplete ones were skipped;
- is UTF-8 with a byte-order mark and CRLF line endings, so Excel opens it with the right encoding; fields with commas, quotes, line breaks or surrounding spaces are quoted;
- says “No complete submissions yet” instead of downloading an empty file.

The export runs as the signed-in user inside Google Sheets. People without access to the Sheet cannot run it, and the public web app has no export endpoint.

## Alternative: plain Sheet download

**File → Download → Comma-separated values (.csv)** while the `Responses` tab is selected gives the same columns, but without the completeness filter and without the byte-order mark (Excel may then need **Data → From Text/CSV** with UTF-8).

## Opening the file

- **JASP / R / Python:** open the CSV directly. Each row is one participant × condition; use `ParticipantID` (or `SubmissionID`) as the subject identifier and `Condition` as the within-subject factor.
- **Excel:** double-click the file. ISO timestamps appear as text, which is intentional.

## Why not a download button in the app?

A button in the participant-facing app would need an endpoint that returns all records. With anonymous participants and no authentication, that endpoint would be readable by anyone who finds its URL, and a hidden button or obscure URL is not access control. Keeping the export inside Google Sheets means Google's own sign-in and the Sheet's sharing settings protect the data.
