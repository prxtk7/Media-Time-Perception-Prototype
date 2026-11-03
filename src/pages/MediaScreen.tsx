import { motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { LoadingOverlay } from '../components/LoadingOverlay'
import { MediaPlayer } from '../components/MediaPlayer'
import { Button } from '../components/shared/Button'
import { useSession } from '../context/SessionContext'
import { useSettings } from '../context/SettingsContext'
import { requestFullscreen } from '../lib/fullscreen'

export function MediaScreen() {
  const navigate = useNavigate()
  const { index } = useParams<{ index: string }>()
  const {
    hydrated,
    isSessionActive,
    conditionOrder,
    currentIndex,
    getConditionByIndex,
    isSessionComplete,
    setReadingStartTime,
  } = useSession()
  const { t, messages } = useSettings()
  const numericIndex = Number(index ?? 0)
  const condition = getConditionByIndex(numericIndex)
  const [playing, setPlaying] = useState(false) // Start as false - wait for user to click Play
  const [transitioning, setTransitioning] = useState(false)
  const [readingStarted, setReadingStarted] = useState(false)
  const [, setPlaybackStarted] = useState(false) // Track if user clicked Play
  const [mediaError, setMediaError] = useState<string | null>(null)
  const completionRef = useRef(false)
  const timerRef = useRef<number | null>(null)
  // Video/audio exposure = time the media element was actually playing: summed from each
  // 'playing' event to the next 'pause'/'waiting'/'ended'. Time before playback starts,
  // buffering stalls and pauses are not counted. Monotonic clock (performance.now).
  const exposureMsRef = useRef(0)
  const playingSinceRef = useRef<number | null>(null)
  const readingStartTimeRef = useRef<number | null>(null)

  const closeExposureSegment = useCallback(() => {
    if (playingSinceRef.current === null) return
    exposureMsRef.current += performance.now() - playingSinceRef.current
    playingSinceRef.current = null
  }, [])

  const measuredExposureSec = useCallback(() => {
    closeExposureSegment()
    return Math.round(exposureMsRef.current / 1000)
  }, [closeExposureSegment])

  const triggerCompletion = useCallback(() => {
    if (completionRef.current) return
    completionRef.current = true
    setPlaying(false)
    setTransitioning(true)
    window.setTimeout(() => {
      navigate(`/questionnaire/${numericIndex}`)
    }, 400)
  }, [navigate, numericIndex])

  const handleStartReading = useCallback(() => {
    if (condition !== 'text') return
    setReadingStarted(true)
    readingStartTimeRef.current = Date.now() // Start timer when reading begins
    if (setReadingStartTime) {
      setReadingStartTime(0) // Reset reading time
    }
  }, [condition, setReadingStartTime])

  // Callback when user clicks Play button. Exposure is only counted once the media is actually playing.
  const handlePlayButtonClick = useCallback(() => {
    if (condition === 'text') return

    setMediaError(null)
    setPlaybackStarted(true)
    setPlaying(true)

    // Safety net in case 'ended' never fires: after 10 minutes, finish with the exposure measured so far.
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
    }
    timerRef.current = window.setTimeout(() => {
      if (setReadingStartTime) {
        setReadingStartTime(measuredExposureSec())
      }
      triggerCompletion()
    }, 600 * 1000)
  }, [condition, triggerCompletion, setReadingStartTime, measuredExposureSec])

  const handlePlaybackStarted = useCallback(() => {
    if (completionRef.current || playingSinceRef.current !== null) return
    playingSinceRef.current = performance.now()
  }, [])

  const handleMediaError = useCallback((error: Error) => {
    closeExposureSegment()
    setMediaError(error.message)
  }, [closeExposureSegment])

  // Callback when media actually ends (video/audio finished playing) - STOP TIMER
  const handleMediaEnded = useCallback(() => {
    if (condition === 'text') return
    if (completionRef.current) return
    
    // Clear the fallback timer since media ended naturally
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    
    const actualDuration = measuredExposureSec()

    // Store the actual duration (this will be used in submitResult)
    if (setReadingStartTime) {
      setReadingStartTime(actualDuration)
    }
    
    triggerCompletion()
  }, [condition, triggerCompletion, setReadingStartTime, measuredExposureSec])

  const handleTextContinue = useCallback(() => {
    if (completionRef.current) return
    if (condition !== 'text') return
    
    // Stop the timer and calculate reading duration
    const readingDuration = readingStartTimeRef.current 
      ? Math.round((Date.now() - readingStartTimeRef.current) / 1000)
      : 0
    
    if (setReadingStartTime) {
      setReadingStartTime(readingDuration)
    }
    
    // Clear any timers
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    
    triggerCompletion()
  }, [condition, triggerCompletion, setReadingStartTime])

  const handleSkip = useCallback(() => {
    if (completionRef.current) return
    if (condition === 'text') return // Skip only for video and audio
    
    // Clear the timer
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    
    // Exposure up to the skip point (0 if the media never actually played)
    const actualDuration = measuredExposureSec()

    if (setReadingStartTime) {
      setReadingStartTime(actualDuration)
    }

    triggerCompletion()
  }, [condition, triggerCompletion, setReadingStartTime, measuredExposureSec])

  useEffect(() => {
    if (!hydrated) return
    if (!isSessionActive) {
      navigate('/')
      return
    }
    if (isSessionComplete) {
      navigate('/summary')
      return
    }

    if (Number.isNaN(numericIndex) || numericIndex < 0 || numericIndex >= conditionOrder.length) {
      navigate(`/media/${currentIndex}`)
      return
    }

    if (numericIndex !== currentIndex) {
      navigate(`/media/${currentIndex}`)
      return
    }

    setPlaying(false) // Don't auto-play - wait for user to click Play
    setPlaybackStarted(false) // Reset playback started state
    setMediaError(null)
    completionRef.current = false
    exposureMsRef.current = 0
    playingSinceRef.current = null
    
    // Clear any existing timers
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    
    // For text condition, reset reading started state
    if (condition === 'text') {
      setReadingStarted(false)
      readingStartTimeRef.current = null
      if (setReadingStartTime) {
        setReadingStartTime(0) // Reset reading time
      }
    } else {
      // For video and audio, exposure starts with the media's 'playing' event
      readingStartTimeRef.current = null
    }

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [
    hydrated,
    isSessionActive,
    isSessionComplete,
    numericIndex,
    conditionOrder.length,
    currentIndex,
    navigate,
    triggerCompletion,
    condition,
    setReadingStartTime,
  ])


  // Request fullscreen when entering media screen
  useEffect(() => {
    if (hydrated && isSessionActive && condition) {
      requestFullscreen()
    }

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [hydrated, isSessionActive, condition])

  if (!condition) {
    return null
  }

  return (
    <div className="relative flex min-h-screen flex-col justify-center bg-gradient-to-br from-neutral-100 via-white to-neutral-200 px-2 sm:px-3 md:px-4 py-4 sm:py-6 md:py-8 transition-colors duration-300 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      {transitioning && <LoadingOverlay message={t('loading.loadingQuestionnaire')} />}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="mx-auto flex w-full max-w-6xl flex-col gap-3 sm:gap-4 md:gap-6"
      >
        {/* Minimal header - only show essential info */}
        <div className="flex items-center justify-between gap-2 rounded-xl sm:rounded-2xl border border-neutral-200/50 bg-white/60 p-2 sm:p-3 backdrop-blur dark:border-neutral-700/50 dark:bg-neutral-900/60">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs uppercase tracking-wider text-brand-500 dark:text-brand-300 whitespace-nowrap">
              {t('media.conditionProgress', { current: numericIndex + 1, total: conditionOrder.length })}
            </p>
            <span className="text-neutral-300 dark:text-neutral-600">•</span>
            <p className="text-[10px] sm:text-xs text-neutral-600 dark:text-neutral-300 truncate">
              {messages.media.conditionLabels[condition]}
            </p>
          </div>
        </div>

        {condition === 'text' && !readingStarted ? (
          <div className="flex flex-col items-center gap-3 sm:gap-4 md:gap-6 rounded-xl sm:rounded-2xl border border-neutral-200 bg-white/80 p-4 sm:p-6 md:p-8 shadow-soft backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/70">
            <p className="text-center text-xs sm:text-sm md:text-base text-neutral-700 dark:text-neutral-200 px-2">
              {messages.media.textStartReadingMessage}
            </p>
            <Button size="lg" onClick={handleStartReading} className="w-full sm:w-auto min-w-[160px] sm:min-w-[200px]">
              {messages.media.textStartReadingButton}
            </Button>
          </div>
        ) : (
          <>
            <MediaPlayer 
              condition={condition} 
              playing={playing} 
              onPlayButtonClick={handlePlayButtonClick}
              onPlaybackStarted={handlePlaybackStarted}
              onPlaybackInterrupted={closeExposureSegment}
              onMediaEnded={handleMediaEnded}
              onError={handleMediaError}
              showText={condition !== 'text' || readingStarted} 
            />

            {condition === 'text' ? (
              <div className="flex flex-col items-center gap-2 sm:gap-3 md:gap-4 rounded-xl sm:rounded-2xl border border-neutral-200/50 bg-white/60 p-3 sm:p-4 md:p-6 backdrop-blur dark:border-neutral-700/50 dark:bg-neutral-900/60">
                <Button size="lg" onClick={handleTextContinue} className="w-full sm:w-auto min-w-[160px] sm:min-w-[200px]">
                  {messages.media.textContinueButton}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 sm:gap-3 md:gap-4 rounded-xl sm:rounded-2xl border border-neutral-200/50 bg-white/60 p-3 sm:p-4 md:p-6 backdrop-blur dark:border-neutral-700/50 dark:bg-neutral-900/60">
                {mediaError && (
                  <p role="alert" className="text-center text-xs sm:text-sm text-rose-700 dark:text-rose-200">
                    {messages.media.playbackError} ({mediaError})
                  </p>
                )}
                <Button size="lg" variant="secondary" onClick={handleSkip} className="w-full sm:w-auto min-w-[160px] sm:min-w-[200px]">
                  {messages.media.skipButton}
                </Button>
              </div>
            )}
          </>
        )}
      </motion.main>
    </div>
  )
}
