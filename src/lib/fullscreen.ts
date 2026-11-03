/**
 * Utility functions for managing fullscreen mode.
 */

type LegacyFullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void
  mozRequestFullScreen?: () => Promise<void> | void
  msRequestFullscreen?: () => Promise<void> | void
}

type LegacyFullscreenDocument = Document & {
  webkitExitFullscreen?: () => Promise<void> | void
  mozCancelFullScreen?: () => Promise<void> | void
  msExitFullscreen?: () => Promise<void> | void
}

export async function requestFullscreen(): Promise<void> {
  const element = document.documentElement as LegacyFullscreenElement

  try {
    if (element.requestFullscreen) {
      await element.requestFullscreen()
    } else if (element.webkitRequestFullscreen) {
      await element.webkitRequestFullscreen()
    } else if (element.mozRequestFullScreen) {
      await element.mozRequestFullScreen()
    } else if (element.msRequestFullscreen) {
      await element.msRequestFullscreen()
    }
  } catch (error) {
    console.warn('Fullscreen request failed:', error)
  }
}

export async function exitFullscreen(): Promise<void> {
  const doc = document as LegacyFullscreenDocument

  try {
    if (doc.exitFullscreen) {
      await doc.exitFullscreen()
    } else if (doc.webkitExitFullscreen) {
      await doc.webkitExitFullscreen()
    } else if (doc.mozCancelFullScreen) {
      await doc.mozCancelFullScreen()
    } else if (doc.msExitFullscreen) {
      await doc.msExitFullscreen()
    }
  } catch (error) {
    console.warn('Exit fullscreen failed:', error)
  }
}
