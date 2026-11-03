# Troubleshooting

The summary screen shows a short technical detail under any error. The prefix tells you where to look.

| Message / detail | Meaning | Fix |
|---|---|---|
| “Central data collection is not set up …”, `VITE_GOOGLE_SHEETS_WEB_APP_URL is not set.` | The build has no endpoint URL. | Set the variable in `.env.local` (local) or Netlify (deploy) and restart the dev server / redeploy. |
| `… must look like https://script.google.com/macros/s/<deployment-id>/exec` | The URL is not an Apps Script `/exec` URL (for example a `/dev` URL or the Sheet URL). | Copy the **Web app URL** from *Deploy → Manage deployments*. |
| `invalid-response: Endpoint did not answer with JSON.` | Usually a Google sign-in page: the deployment is not set to *Who has access: Anyone*, or the URL belongs to a deleted deployment. | Check the deployment settings; open the URL in a private browser window, which should show the health-check JSON. |
| `network: Failed to fetch` | No connection, a blocker extension, or the browser could not read the response (CORS). | Check the connection and extensions. If the Sheet *did* receive the rows, the browser could not read Google's answer; see below. |
| `timeout: No answer within 20 s.` | Apps Script was slow (cold start) or unreachable. | Use **Try again**. Retries are safe: the same session is never stored twice. |
| `server-error: The dataset is busy …` | Another submission held the lock for 30 s. | **Try again**. |
| `server-error: The submission could not be stored.` | The script failed while writing, for example because the `Responses` header was edited. | Apps Script editor → **Executions** shows the logged error. Restore the header row exactly as in [data-schema.md](data-schema.md). |
| `rejected: Row 1: … is required.` (or another validation message) | The app sent data the script does not accept. Typically the deployed script and the app are different versions, or the participant reached the questionnaire without completing the demographics. | Deploy a new version of the current `google-apps-script.js`. The local CSV download still contains the session. |

## The Sheet receives rows but the app reports a failure

The app only shows “saved” when it can read the script's JSON answer. If Google ever stops sending a readable cross-origin answer, rows will arrive while the app reports `network`. Because storage is idempotent, pressing **Try again** is harmless; a successful retry answers `duplicate`. Report this case; it means the live CORS behaviour differs from the assumption described in [google-sheets-setup.md](google-sheets-setup.md).

## No “Media Time Perception” menu in the Sheet

Reload the Sheet and wait a few seconds. The menu only appears for users who can edit the Sheet and only if the script is bound to it (*Extensions → Apps Script* from inside the Sheet, not a standalone script).

## Video or audio never shows a Play button / “The media could not be played”

The Play button appears only after the browser has loaded the media metadata. If loading fails, the media screen shows “The media could not be played … (Media error 4)” and only **Skip to Questionnaire** remains, which records a real duration of 0.

The usual cause is that `public/media/Video.mp4` or `virtual-reality-audio.m4a` is a **Git LFS pointer** (a ~130-byte text file starting with `version https://git-lfs.github.com/spec/v1`) instead of the media:

```powershell
Get-Item public/media/* | Select-Object Name, Length
# Video.mp4                 137563336
# virtual-reality-audio.m4a   1177178
Get-Content public/media/Video.mp4 -TotalCount 1   # must NOT print "version https://git-lfs..."
```

`git lfs pull` only helps if the files are committed in this repository **and** their LFS objects were pushed to this repository's remote. Check with `git lfs ls-files`; an empty list means there is nothing for LFS to download. The genuine files can be identified by the SHA-256 in the pointer (`oid sha256:…`):

```powershell
Get-FileHash public/media/Video.mp4 -Algorithm SHA256
# 865859FD15EFCF21216B6F260BF8A8A13D41A90551F948499AD13027EFC6B9F6
Get-FileHash public/media/virtual-reality-audio.m4a -Algorithm SHA256
# 9EE2AAD4F6F5D8E5CC1B245C0FD7A487CDEC9AE765DE7C29D1513BC8C173F60B
```

`VITE_VIDEO_URL` and `VITE_AUDIO_URL` can point the app at copies hosted elsewhere instead of `public/media/`.

## The CSV did not download automatically

Browsers may block a download that is not triggered by a click. Use **Download CSV** on the summary screen.

## Restarting a participant on the same device

**Start a new participant** (summary screen) or **Exit study** (top bar) clears the stored session for this browser. Closing the tab does not; the session, including the entered name, stays in this browser's `localStorage` until one of these buttons is used.
