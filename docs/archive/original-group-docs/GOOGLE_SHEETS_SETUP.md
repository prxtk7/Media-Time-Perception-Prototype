> **Archived.** This file documents the original group version of the prototype and is kept for reference only. It describes an older data schema (including a participant-name column) and setup steps that no longer match the code. Follow the current documentation in [`README.md`](../../../README.md) and [`docs/`](../../).

# Google Sheets Integration Setup Guide

This guide will help you set up automatic data export to Google Sheets.

## Step 1: Create Google Apps Script

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit

2. Go to **Extensions** > **Apps Script**

3. Delete any existing code and paste the contents of `google-apps-script.js`

4. Click **Save** (💾) and give your project a name (e.g., "Media Time Study Data")

## Step 2: Deploy as Web App

1. Click **Deploy** > **New deployment**

2. Click the gear icon (⚙️) next to "Select type" and choose **Web app**

3. Configure the deployment:

   - **Description**: "Media Time Study Data Handler" (optional)
   - **Execute as**: Me
   - **Who has access**: Anyone

4. Click **Deploy**

5. **Copy the Web App URL** - it will look like:
   ```
   https://script.google.com/macros/s/AKfycby.../exec
   ```

## Step 3: Configure the Application

1. Create a `.env` file in the project root (copy from `.env.example` if it exists)

2. Add your Web App URL:

   ```env
   VITE_GOOGLE_SHEETS_WEB_APP_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   ```

3. Restart your development server:
   ```bash
   npm run dev
   ```

## Step 4: Test the Integration

1. Complete a test session in the application

2. When you reach the Summary screen, data should automatically be sent to Google Sheets

3. Check your Google Sheet - you should see new rows with the participant data

## Troubleshooting

### Data not appearing in Google Sheets

1. **Check the Web App URL**: Make sure it's correct in your `.env` file
2. **Check browser console**: Open Developer Tools (F12) and look for errors
3. **Check Apps Script logs**: In Apps Script, go to **Executions** to see if there are errors
4. **Verify permissions**: Make sure the Web App is set to "Anyone" access

### CORS Errors

The script uses `no-cors` mode, so you won't see response data. If data isn't appearing:

- Check the Apps Script execution logs
- Verify the Web App URL is correct
- Make sure the sheet is accessible

### Testing the Script Manually

1. In Apps Script, select the `testDoPost` function
2. Click **Run** (▶️)
3. Authorize the script if prompted
4. Check the **Executions** tab for results
5. Check your Google Sheet for the test data

## Data Structure

Each row in Google Sheets contains:

- Participant information (ID, name, consent date)
- Demographics (age, media usage, caffeine, alertness)
- Condition data (video/audio/text)
- Time perception metrics (real duration, estimated duration, temporal bias)
- Immersion scores (5 items + mean)
- Engagement scores (5 items + mean)
- Familiarity rating
- Timestamp

## Security Notes

- The Web App URL should be kept private
- Data is sent over HTTPS
- No authentication is required (Web App is set to "Anyone")
- Consider adding authentication for production use
