// Vite inlines VITE_* variables into the public bundle. Only put values here that may be public:
// the Apps Script web app URL qualifies, credentials or tokens never do.
export const GOOGLE_SHEETS_WEB_APP_URL: string = import.meta.env.VITE_GOOGLE_SHEETS_WEB_APP_URL ?? ''
