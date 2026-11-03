import { motion } from 'framer-motion'
import { useEffect, useMemo, useRef } from 'react'
import { useSettings } from '../context/SettingsContext'
import { resultsToFullCsv, UTF8_BOM } from '../lib/csv'
import type { ConditionResult, DemographicData } from '../types'
import { Button } from './shared/Button'

interface ResultExportProps {
  results: ConditionResult[]
  participantId: string
  sessionId?: string
  consentSignedAt?: string
  demographicData?: DemographicData
  onReset: () => void
}


export function ResultExport({
  results,
  participantId,
  sessionId,
  consentSignedAt,
  demographicData,
  onReset,
}: ResultExportProps) {
  const { messages } = useSettings()
  const csvContent = useMemo(
    () =>
      resultsToFullCsv({
        results,
        participantId,
        sessionId,
        consentSignedAt,
        demographicData,
      }),
    [results, participantId, sessionId, consentSignedAt, demographicData],
  )
  const autoDownloadedRef = useRef(false)



  const downloadCsv = () => {
    if (!csvContent) return
    const blob = new Blob([UTF8_BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const timestamp = new Date().toISOString().split('T')[0]
    link.href = url
    link.setAttribute('download', `time-perception-${participantId || 'unknown'}-${timestamp}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleDownload = () => {
    downloadCsv()
  }

  // Auto-download CSV when component mounts (experiment is done)
  useEffect(() => {
    if (csvContent && !autoDownloadedRef.current && results.length > 0) {
      // Small delay to ensure page is fully loaded
      const timer = setTimeout(() => {
        downloadCsv()
        autoDownloadedRef.current = true
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [csvContent, results.length])


  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-4xl rounded-2xl sm:rounded-3xl border border-neutral-200 bg-white/95 p-4 sm:p-6 md:p-8 shadow-soft backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/80"
    >
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <Button variant="ghost" onClick={onReset} className="w-full sm:w-auto">
          {messages.result.newParticipant}
        </Button>
        <Button variant="primary" size="lg" onClick={handleDownload} disabled={!csvContent} className="w-full sm:w-auto">
          {messages.result.downloadCsv}
        </Button>
      </div>
    </motion.section>
  )
}
