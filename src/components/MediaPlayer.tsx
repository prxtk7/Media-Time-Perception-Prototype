import { motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSettings } from '../context/SettingsContext'
import { MEDIA_CONTENT } from '../data/mediaContent'
import type { MediaCondition } from '../types'
import { Button } from './shared/Button'

interface MediaPlayerProps {
  condition: MediaCondition
  playing: boolean
  onReady?: () => void
  onError?: (error: Error) => void
  onPlayButtonClick?: () => void // Callback when user clicks Play button
  onPlaybackStarted?: () => void // Media is actually rendering frames/audio ('playing' event)
  onPlaybackInterrupted?: () => void // Media stopped advancing ('pause' or 'waiting' event)
  onMediaEnded?: () => void // Callback when video/audio finishes playing (timer stops here)
  showText?: boolean
}

const containerVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

export function MediaPlayer({
  condition,
  playing,
  onReady,
  onError,
  onPlayButtonClick,
  onPlaybackStarted,
  onPlaybackInterrupted,
  onMediaEnded,
  showText = true,
}: MediaPlayerProps) {
  const { language, messages } = useSettings()
  const meta = useMemo(() => MEDIA_CONTENT[condition], [condition])
  const title = meta.title[language]
  const description = meta.description[language]
  const [userInteracted, setUserInteracted] = useState(false)
  const [playerReady, setPlayerReady] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const handlePlayerError = (event: unknown) => {
    const normalized = event instanceof Error ? event : new Error('Playback error')
    onError?.(normalized)
  }

  // Load errors arrive as an 'error' event; the element's MediaError code says why
  // (4 = source not supported, e.g. a Git LFS pointer file instead of the real media).
  const handleMediaElementError = (element: HTMLMediaElement) => {
    const code = element.error?.code
    handlePlayerError(new Error(code ? `Media error ${code}` : 'Media error'))
  }

  const handleUserInteraction = async () => {
    const element = condition === 'video' ? videoRef.current : condition === 'audio' ? audioRef.current : null
    if (!element) return
    setUserInteracted(true)
    onPlayButtonClick?.()
    try {
      // play() must be called synchronously inside the click handler; awaiting anything first
      // can drop the user-activation that browsers (notably Safari) require for audible playback.
      element.muted = false
      await element.play()
      // Exposure time starts on the 'playing' event, not here.
    } catch (error) {
      setUserInteracted(false) // show the Play button again so the participant can retry
      handlePlayerError(error)
    }
  }

  const handlePlayerReady = () => {
    setPlayerReady(true)
    onReady?.()
  }

  useEffect(() => {
    setUserInteracted(false)
    setPlayerReady(false)
  }, [condition])

  useEffect(() => {
    if (condition === 'video' && videoRef.current && userInteracted) {
      if (playing) {
        videoRef.current.play().catch(handlePlayerError)
      } else {
        videoRef.current.pause()
      }
    } else if (condition === 'audio' && audioRef.current && userInteracted) {
      if (playing) {
        audioRef.current.play().catch(handlePlayerError)
      } else {
        audioRef.current.pause()
      }
    }
  }, [condition, playing, userInteracted])

  const mediaCard = (() => {
    switch (condition) {
      case 'video':
        return (
          <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-black shadow-soft">
            <video
              ref={videoRef}
              src={meta.url ?? ''}
              className="h-full w-full object-contain"
              playsInline
              muted={!userInteracted}
              controls={false}
              onLoadedMetadata={handlePlayerReady}
              onPlaying={onPlaybackStarted}
              onPause={onPlaybackInterrupted}
              onWaiting={onPlaybackInterrupted}
              onEnded={onMediaEnded} // Stop timer when media ends
              onError={(e) => handleMediaElementError(e.currentTarget)}
            />
            {meta.poster && (
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
            )}
            {!userInteracted && playerReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Button
                  size="lg"
                  onClick={handleUserInteraction}
                  className="bg-white/90 text-black hover:bg-white min-w-[140px] sm:min-w-[160px]"
                >
                  {messages.media.playButton}
                </Button>
              </div>
            )}
          </div>
        )
      case 'audio':
        return (
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 p-4 sm:p-6 md:p-8 text-white shadow-soft">
            <div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm uppercase tracking-[0.35em] text-white/80">{messages.media.audioBadge}</p>
                <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-semibold mt-1 sm:mt-2">{title}</h2>
                <p className="mt-2 max-w-xl text-xs sm:text-sm text-white/80">{description}</p>
              </div>
              <div className="relative h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 mx-auto md:mx-0 flex-shrink-0">
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-white/30"
                  animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
                />
                <motion.div
                  className="absolute inset-6 rounded-full border-4 border-white"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
                />
                <div className="absolute inset-10 rounded-full bg-white text-center text-brand-600">
                  <div className="flex h-full items-center justify-center text-xs font-semibold uppercase tracking-[0.2em]">
                    {messages.media.audioInnerLabel}
                  </div>
                </div>
              </div>
            </div>
            <audio
              ref={audioRef}
              src={meta.url ?? ''}
              muted={!userInteracted}
              onLoadedMetadata={handlePlayerReady}
              onPlaying={onPlaybackStarted}
              onPause={onPlaybackInterrupted}
              onWaiting={onPlaybackInterrupted}
              onEnded={onMediaEnded} // Stop timer when media ends
              onError={(e) => handleMediaElementError(e.currentTarget)}
            />
            {!userInteracted && playerReady && (
              <div className="mt-3 sm:mt-4 flex justify-center">
                <Button
                  size="lg"
                  onClick={handleUserInteraction}
                  className="bg-white/90 text-brand-700 hover:bg-white w-full sm:w-auto min-w-[140px] sm:min-w-[160px]"
                >
                  {messages.media.playButton}
                </Button>
              </div>
            )}
          </div>
        )
      case 'text':
      default:
        if (!showText) {
          return null
        }
        return (
          <motion.article
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="prose prose-neutral prose-sm sm:prose-base max-w-3xl rounded-2xl sm:rounded-3xl border border-neutral-200 bg-white/90 p-4 sm:p-6 md:p-8 text-neutral-800 shadow-soft backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/80 dark:prose-invert"
          >
            <h2 className="font-display text-xl sm:text-2xl md:text-3xl text-brand-700 dark:text-brand-300">{meta.article?.heading[language]}</h2>
            {meta.article?.paragraphs[language]?.map((paragraph, index) => (
              <p key={index} className="text-sm sm:text-base leading-relaxed">{paragraph}</p>
            ))}
          </motion.article>
        )
    }
  })()

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="flex w-full flex-col gap-3 sm:gap-4 md:gap-5"
    >
      {/* Minimal header - focus on media */}
      {/* Only show title for text, title + description for video/audio */}
      {condition === 'text' ? (
        <div className="flex flex-col gap-1 sm:gap-1.5">
          <h1 className="font-display text-lg sm:text-xl md:text-2xl font-semibold text-neutral-900 dark:text-neutral-100 text-center sm:text-left">{title}</h1>
        </div>
      ) : (
        <div className="flex flex-col gap-1 sm:gap-1.5">
          <h1 className="font-display text-lg sm:text-xl md:text-2xl font-semibold text-neutral-900 dark:text-neutral-100 text-center sm:text-left">{title}</h1>
          {description && (
            <p className="max-w-3xl text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 text-center sm:text-left mx-auto sm:mx-0">{description}</p>
          )}
        </div>
      )}
      {mediaCard}
    </motion.div>
  )
}
