/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_SHEETS_WEB_APP_URL?: string
  readonly VITE_VIDEO_URL?: string
  readonly VITE_AUDIO_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
