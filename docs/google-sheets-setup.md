# Google Sheets and Apps Script setup

Central data collection works like this:

```
browser (summary screen) --POST JSON--> Apps Script web app (doPost) --append--> Google Sheet, tab "Responses"
researcher (signed in to Google) --Sheet menu--> cumulative CSV download
```

There is no other server and no database. The Sheet is the dataset.

> **Use a separate test Sheet first.** Do not point a development build at the Sheet that holds real participant data. Create a second Sheet and deployment for testing, and only switch the production build's URL once the test deployment works.

## 1. Create the Sheet

1. Create a new Google Sheet in the Google account that will own the study data (for example `Media Time Perception – data`).
2. Share it only with the researchers who need the data. **Sharing settings are the only access control for the dataset**; do not enable “Anyone with the link”.

The script creates a tab called `Responses` with the header row on the first submission. If you reuse the Sheet from the original group version, its existing tab is left untouched (see [Migrating from the original version](#migrating-from-the-original-version)).

## 2. Add the script

1. In the Sheet, open **Extensions → Apps Script**.
2. Replace the contents of `Code.gs` with the contents of [`google-apps-script.js`](../google-apps-script.js) from this repository.
3. Save.
4. Optional check: select `selfTestValidation` in the toolbar and click **Run**. Authorize the script when asked. The execution log should show `[]`, which means a synthetic payload passed validation. This function does not write to the Sheet.

## 3. Deploy it as a web app

1. **Deploy → New deployment**, type **Web app**.
2. **Execute as:** *Me*. **Who has access:** *Anyone*.
3. Click **Deploy** and copy the **Web app URL**. It looks like `https://script.google.com/macros/s/<DEPLOYMENT_ID>/exec`.

After changing the script later, use **Deploy → Manage deployments → Edit (pencil) → Version: New version**. Editing the code without a new version does not change what the URL runs. Creating a *new deployment* instead gives you a new URL, which must then be configured again.

### What these settings mean for security

- *Who has access: Anyone* is required because participants are anonymous and are not signed in to Google. The endpoint therefore **cannot authenticate who submits data**. Anyone who obtains the URL (it is visible in the public JavaScript bundle) can submit rows that pass validation. Validation, the payload size limit and the duplicate check reduce accidental damage; they do not stop deliberate fake submissions. Check `ReceivedAt` and session plausibility before analysis.
- *Execute as: Me* means the script runs with the owner's permission to edit this Sheet. It only touches the Sheet it is bound to.
- The endpoint has **no read access** to the data. `doGet` only answers a health check (`{"ok":true,"service":"media-time-perception","schemaVersion":2}`), and `doPost` only appends. Error responses never echo submitted data.
- The URL is not a secret and must not be treated as one. Never put credentials, tokens or private keys into `VITE_*` variables: Vite inlines them into the public bundle.

## 4. Configure the app

Local development (PowerShell):

```powershell
Copy-Item .env.example .env.local
notepad .env.local   # set VITE_GOOGLE_SHEETS_WEB_APP_URL=https://script.google.com/macros/s/<DEPLOYMENT_ID>/exec
npm run dev           # restart the dev server after every change to .env.local
```

Netlify: **Site configuration → Environment variables → Add variable** `VITE_GOOGLE_SHEETS_WEB_APP_URL`, then trigger a new deploy. The variable is read at build time; changing it has no effect until the site is rebuilt. `netlify.toml` already excludes this key from Netlify's secret scanner because it is meant to be public.

If the variable is missing or does not look like an Apps Script `/exec` URL, the summary screen says that central collection is not configured and shows the reason. Nothing is sent.

## 5. Verify the deployment

1. Open the web app URL in a browser. You should see the health-check JSON from `doGet`.
2. Run one session with a clearly synthetic name against the **test** Sheet. The summary screen should say “Your responses have been saved.” and the `Responses` tab should gain three rows with the same `SubmissionID`.
3. Reload the summary page. No new rows should appear.
4. Download the cumulative CSV (see [cumulative-export.md](cumulative-export.md)).

The browser reads the Apps Script answer through a CORS simple request (POST, `text/plain` body). This round trip and the Sheet-menu export have been checked against a live deployment with test sessions; step 2 repeats that check for your own deployment. If the Sheet gains rows but the app reports a failure, see [troubleshooting.md](troubleshooting.md).

## Migrating from the original version

The original script wrote to the first tab with a different header (including `ParticipantName`) and could not deduplicate reliably. The new script:

- writes only to the `Responses` tab and refuses to append if that tab's header does not match the current schema;
- never reads, changes or deletes the old tab.

Decide with the research team what happens to the old tab. It may contain participant names that the consent text said would not be exported; that is an ethics/data-protection decision, not a technical one. Do not copy old rows into `Responses`: they lack `SubmissionID` and use the old column layout.
