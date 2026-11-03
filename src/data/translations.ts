import type { Language } from '../types'

type TranslationTree = {
  settings: {
    languageLabel: string
    english: string
    german: string
    themeLabel: string
    light: string
    dark: string
    exitLabel: string
    exitConfirm: string
  }
  loading: {
    preparingNext: string
    loadingInstructions: string
    loadingFirstCondition: string
    loadingQuestionnaire: string
    savingResponses: string
    keepWindowOpen: string
  }
  welcome: {
    badge: string
    title: string
    description: string
    importantInstructionsHeading?: string
    importantInstructions?: string[]
    resumeWarning: string
    participantLabel: string
    participantPlaceholder: string
    nameLabel: string
    namePlaceholder: string
    nameHelper: string
    idHelper: string
    copyId: string
    copySuccess: string
    copyFailure: string
    regenerateId: string
    consentHeading: string
    consentParagraphs: string[]
    consentText: string
    nameRequired: string
    stats: string
    startButton: string
    idRequired: string
    consentRequired: string
  }
  instructions: {
    badge: string
    title: string
    intro: string
    duringHeading?: string
    duringPoints?: string[]
    afterHeading?: string
    afterPoints?: string[]
    importantNotesHeading?: string
    importantNotes?: string[]
    points?: string[]
    readyLabel?: string
    checklist?: string
    startButton: string
  }
  media: {
    participantLabel: string
    conditionProgress: string
    focusReminder: string
    stalledMessage: string
    errorMessage: string
    audioBadge: string
    audioInnerLabel: string
    conditionLabels: Record<'video' | 'audio' | 'text', string>
    textStartReadingMessage: string
    textStartReadingButton: string
    textContinueMessage: string
    textContinueButton: string
    skipMessage: string
    skipButton: string
    playbackError: string
    playButton: string
  }
  questionnaireScreen: {
    badge: string
    title: string
    intro: string
  }
  demographics: {
    badge: string
    title: string
    intro: string
    ageLabel: string
    agePlaceholder: string
    ageRequired: string
    mediaUsageHeading: string
    mediaUsageDescription: string
    mediaUsageShortVideos: string
    mediaUsageAudio: string
    mediaUsageText: string
    mediaUsageRequired: string
    caffeineHeading: string
    caffeineQuestion: string
    caffeineYes: string
    caffeineNo: string
    caffeineFollowUp: string
    caffeineFollowUpOptions: {
      lessThan1Hour: string
      oneToThreeHours: string
      moreThan3Hours: string
    }
    caffeineRequired: string
    alertnessHeading: string
    alertnessQuestion: string
    alertnessScale: {
      veryTired: string
      tired: string
      neutral: string
      alert: string
      veryAlert: string
    }
    alertnessRequired: string
    continueButton: string
  }
  questionnaire: {
    timeHeading: string
    timeDescription: string
    minutesLabel: string
    secondsLabel: string
    minutesPlaceholder: string
    secondsPlaceholder: string
    minutesAria: string
    secondsAria: string
    immersionHeading: string
    engagementHeading: string
    additionalFactorsHeading: string
    qualitativeHeading: string
    qualitativeDescription: string
    qualitativePlaceholder: string
    qualitativeHelper: string
    submit: string
    validation: {
      positiveDuration: string
      secondsRange: string
      required: string
      feedbackRequired: string
    }
    likert: {
      confidence: {
        label: string
        left: string
        right: string
      }
      immersion1: {
        label: string
        left: string
        right: string
      }
      immersion2: {
        label: string
        left: string
        right: string
      }
      immersion3: {
        label: string
        left: string
        right: string
      }
      immersion4: {
        label: string
        left: string
        right: string
      }
      immersion5: {
        label: string
        left: string
        right: string
      }
      engagement1: {
        label: string
        left: string
        right: string
      }
      engagement2: {
        label: string
        left: string
        right: string
      }
      engagement3: {
        label: string
        left: string
        right: string
      }
      engagement4: {
        label: string
        left: string
        right: string
      }
      engagement5: {
        label: string
        left: string
        right: string
      }
      familiarity: {
        label: string
        left: string
        right: string
      }
      absorption?: {
        label: string
        left: string
        right: string
      }
      enjoyment?: {
        label: string
        left: string
        right: string
      }
      attention?: {
        label: string
        left: string
        right: string
      }
      effort?: {
        label: string
        left: string
        right: string
      }
      lostTrackOfTime?: {
        label: string
        left: string
        right: string
      }
      mindWandering?: {
        label: string
        left: string
        right: string
      }
      arousal?: {
        label: string
        left: string
        right: string
      }
    }
  }
  result: {
    badge: string
    title: string
    subtitle: string
    debriefingParagraph1: string
    debriefingParagraph2: string
    debriefingParagraph3: string
    debriefingParagraph4: string
    debriefingParagraph5: string
    participantLabel: string
    meanErrorLabel: string
    actualDurationLabel: string
    consentHeading: string
    consentSignedAt: string
    consentParticipantName: string
    downloadSignature: string
    signatureAlt: string
    missingSignature: string
    qualitativeHeading: string
    qualitativeTitle: string
    qualitativeSubtitle: string
    table: {
      condition: string
      estimate: string
      actualDuration: string
      confidence: string
      engagement: string
      difference: string
    }
    newParticipant: string
    downloadCsv: string
    closingReminder: string
    secondsSuffix: string
    submission: {
      sending: string
      saved: string
      failed: string
      notConfigured: string
      retry: string
      technicalDetail: string
    }
  }
}

export const translations: Record<Language, TranslationTree> = {
  en: {
    settings: {
      languageLabel: 'Language',
      english: 'English',
      german: 'Deutsch',
      themeLabel: 'Theme',
      light: 'Light',
      dark: 'Dark',
      exitLabel: 'Exit study',
      exitConfirm: 'Exit the study? Unsaved progress will be cleared and you will return to the welcome screen.',
    },
    loading: {
      preparingNext: 'Preparing next condition…',
      loadingInstructions: 'Loading instructions…',
      loadingFirstCondition: 'Loading first condition…',
      loadingQuestionnaire: 'Loading questionnaire…',
      savingResponses: 'Saving responses…',
      keepWindowOpen: 'Please keep the window open.',
    },
    welcome: {
      badge: 'Time Perception Study',
      title: 'Welcome',
      description:
        'Thank you for taking part in this study. In this experiment, you will experience three short activities, each presented in a different media format (video, audio, and text). After each activity, you will be asked to answer a few short questions about your experience. The entire session will take approximately 15–20 minutes.',
      importantInstructionsHeading: 'Important Instructions',
      importantInstructions: [
        'During the experiment, focus naturally on the content, as you normally would.',
        'After each activity, you will be asked to estimate how long the activity lasted and answer a few questions about your experience.',
        'There are no right or wrong answers. We are interested only in your personal experience.',
        'Please do not check the time, use a phone, watch, or any other device that shows time during the experiment.',
        'When audio or video is presented, please use the provided headphones.',
        'If at any point you feel uncomfortable, you may stop the experiment without any negative consequences.',
      ],
      resumeWarning:
        'An active session for participant {{id}} was found. Starting again will overwrite the previous session data stored on this device.',
      participantLabel: 'Participant ID',
      participantPlaceholder: 'Enter assigned ID',
      nameLabel: 'Full name',
      namePlaceholder: 'First and last name',
      nameHelper: 'Used only for the consent record. It will not appear in exported data.',
      idHelper: 'Share this anonymized identifier with the participant; it appears in exports only.',
      copyId: 'Copy ID',
      copySuccess: 'Copied!',
      copyFailure: 'Copy unavailable',
      regenerateId: 'Generate new ID',
      consentHeading: 'Research consent summary',
      consentParagraphs: [
        'This prototype is part of a research study that examines how people perceive time across different media formats.',
        'You will experience three media conditions on the same topic. Video and audio conditions last three minutes each, while the text condition is self-paced. Each is followed by a short questionnaire about your impressions and time estimate.',
        'Your full name is stored only with this consent record. Exported data contains the anonymized participant ID only. No personal data will be stored or misused.',
        'Participation is voluntary. You may withdraw at any time by selecting the Exit option; any responses not yet exported will be removed from this device.',
      ],
      consentText: 'I have read the consent summary above and agree to participate in this prototype study. I understand that no personal data will be stored or misused.',
      nameRequired: 'Full name is required.',
      consentRequired: 'Consent is required before continuing.',
      stats: '3 conditions · ~9 minutes of media · 3 surveys',
      startButton: 'Continue',
      idRequired: 'Participant ID is required.',
    },
    instructions: {
      badge: 'Task Instructions',
      title: 'Task Instructions',
      intro:
        'In this experiment, you will complete three short activities, each presented in a different media format (video, audio, and text). Please read the following instructions carefully. These instructions apply to all parts of the experiment.',
      duringHeading: 'During each activity',
      duringPoints: [
        'Focus on the content naturally, as you normally would.',
        'Do not try to count time or use any strategies to track duration.',
        'Please do not check the time using a phone, watch, or any other device.',
      ],
      afterHeading: 'After each activity',
      afterPoints: [
        'You will be asked to estimate how long the activity lasted.',
        'You will then answer a few short questions about your experience (e.g., engagement, attention).',
        'There are no right or wrong answers. We are interested only in your personal perception.',
      ],
      importantNotesHeading: 'Important notes',
      importantNotes: [
        'Some activities will include audio or video. Please ensure you are wearing your headphones when required.',
        'One activity involves reading text. Please read at your normal pace.',
        'If you feel uncomfortable at any point, you may stop the experiment without penalty.',
      ],
      startButton: 'Start',
    },
    media: {
      participantLabel: 'Participant {{id}}',
      conditionProgress: 'Condition {{current}} of {{total}}',
      focusReminder: 'The media starts immediately. Please keep the tab focused until the questionnaire appears.',
      stalledMessage: 'If playback stalls, stay on this screen. The questionnaire will unlock automatically after three minutes.',
      errorMessage: 'Playback encountered an issue. Remain on this screen; the questionnaire will open as soon as the timer completes.',
      audioBadge: 'Podcast Session',
      audioInnerLabel: 'Audio',
      conditionLabels: {
        video: 'Video',
        audio: 'Podcast',
        text: 'Article',
      },
      textStartReadingMessage: 'Please click the button below when you are ready to start reading. The article will appear and the timer will begin.',
      textStartReadingButton: 'Start Reading',
      textContinueMessage: 'Take your time to read the article at your own pace. When you have finished reading, click the button below to continue.',
      textContinueButton: 'I have finished reading',
      skipMessage: 'If you wish to skip this media and proceed to the questionnaire, you can do so using the button below.',
      skipButton: 'Skip to Questionnaire',
      playbackError: 'The media could not be played. Please tell the researcher before continuing.',
      playButton: '▶ Play',
    },
    questionnaireScreen: {
      badge: 'Post-condition survey',
      title: 'Post-media questionnaire',
      intro: 'Please answer every item before continuing.',
    },
    demographics: {
      badge: 'Demographic Questions',
      title: 'Demographic Questions',
      intro: 'Before beginning the main tasks, please answer the following questions. Your responses will be used only for research purposes and will remain anonymous.',
      ageLabel: 'What is your age (in years)?',
      agePlaceholder: 'Enter your age',
      ageRequired: 'Age is required.',
      mediaUsageHeading: 'Media Usage Habits',
      mediaUsageDescription: 'How frequently do you usually engage with the following media types? (Please select one option for each.)',
      mediaUsageShortVideos: 'Short videos (e.g., online videos, reels, clips)',
      mediaUsageAudio: 'Audio-only content (e.g., podcasts, audiobooks)',
      mediaUsageText: 'Reading text content (e.g., articles, blogs, written stories)',
      mediaUsageRequired: 'Please select a frequency for all media types.',
      caffeineHeading: 'Caffeine Consumption',
      caffeineQuestion: 'Have you consumed caffeine today (e.g., coffee, tea, energy drinks)?',
      caffeineYes: 'Yes',
      caffeineNo: 'No',
      caffeineFollowUp: 'Approximately how long ago did you last consume caffeine?',
      caffeineFollowUpOptions: {
        lessThan1Hour: 'Less than 1 hour ago',
        oneToThreeHours: '1–3 hours ago',
        moreThan3Hours: 'More than 3 hours ago',
      },
      caffeineRequired: 'Please answer the caffeine consumption question.',
      alertnessHeading: 'Current State',
      alertnessQuestion: 'How alert do you feel right now?',
      alertnessScale: {
        veryTired: '1 — Very tired',
        tired: '2 — Tired',
        neutral: '3 — Neutral',
        alert: '4 — Alert',
        veryAlert: '5 — Very alert',
      },
      alertnessRequired: 'Please indicate your current alertness level.',
      continueButton: 'Continue',
    },
    questionnaire: {
      timeHeading: 'Time Estimation',
      timeDescription: 'Please estimate how long the previous activity lasted.',
      minutesLabel: 'Minutes',
      secondsLabel: 'Seconds',
      minutesPlaceholder: 'mm',
      secondsPlaceholder: 'ss',
      minutesAria: 'Estimated minutes',
      secondsAria: 'Estimated seconds',
      immersionHeading: 'Immersion',
      engagementHeading: 'Engagement',
      additionalFactorsHeading: 'Additional Factors',
      qualitativeHeading: 'Additional Feedback',
      qualitativeDescription: 'Please share any additional thoughts or feedback about your experience.',
      qualitativePlaceholder: 'Enter your feedback here...',
      qualitativeHelper: 'This feedback is optional but helps us understand your experience better.',
      submit: 'Submit responses',
      validation: {
        positiveDuration: 'Provide a positive duration before continuing.',
        secondsRange: 'Seconds must be between 0 and 59.',
        required: 'This rating is required.',
        feedbackRequired: 'Please provide feedback before continuing.',
      },
      likert: {
        confidence: {
          label: 'How confident are you in your time estimate?',
          left: 'Not confident at all',
          right: 'Extremely confident',
        },
        immersion1: {
          label: 'I felt absorbed while experiencing the media.',
          left: 'Strongly disagree',
          right: 'Strongly agree',
        },
        immersion2: {
          label: 'I became deeply focused on the media.',
          left: 'Strongly disagree',
          right: 'Strongly agree',
        },
        immersion3: {
          label: 'I lost awareness of my surroundings while experiencing the media.',
          left: 'Strongly disagree',
          right: 'Strongly agree',
        },
        immersion4: {
          label: 'I was unaware of things happening around me while experiencing the media.',
          left: 'Strongly disagree',
          right: 'Strongly agree',
        },
        immersion5: {
          label: 'I lost track of time while experiencing the media.',
          left: 'Strongly disagree',
          right: 'Strongly agree',
        },
        engagement1: {
          label: 'I found the media engaging.',
          left: 'Strongly disagree',
          right: 'Strongly agree',
        },
        engagement2: {
          label: 'I felt mentally involved while experiencing the media.',
          left: 'Strongly disagree',
          right: 'Strongly agree',
        },
        engagement3: {
          label: 'The media held my attention.',
          left: 'Strongly disagree',
          right: 'Strongly agree',
        },
        engagement4: {
          label: 'I was interested in the media throughout the experience.',
          left: 'Strongly disagree',
          right: 'Strongly agree',
        },
        engagement5: {
          label: 'I was motivated to keep paying attention to the media.',
          left: 'Strongly disagree',
          right: 'Strongly agree',
        },
        familiarity: {
          label: 'I was familiar with the topic or subject matter of the activity.',
          left: 'Not at all familiar',
          right: 'Extremely familiar',
        },
      },
    },
    result: {
      badge: 'Debriefing',
      title: 'Thank you for your participation.',
      subtitle: 'This study investigated how media modality (video, audio, text) influences subjective time perception and its relationship with immersion and engagement.',
      debriefingParagraph1: 'Your time estimates and self-report measures will be analyzed to examine whether temporal perception varies across media types and whether immersion and engagement predict temporal bias.',
      debriefingParagraph2: 'Some methodological details were withheld initially to minimize response bias, consistent with standard practices in perception research.',
      debriefingParagraph3: 'All data will be analyzed anonymously for research purposes only. Individual responses cannot be used to draw conclusions about any single participant.',
      debriefingParagraph4: 'If you have questions or require further information, please contact the research team using the contact details provided by the experimenter.',
      debriefingParagraph5: 'Thank you for your contribution to this research.',
      participantLabel: 'Participant ID',
      meanErrorLabel: 'Average signed error',
      actualDurationLabel: 'Actual duration per task',
      consentHeading: 'Consent record',
      consentSignedAt: 'Signed on',
      consentParticipantName: 'Participant name',
      downloadSignature: 'Download signature',
      signatureAlt: 'Participant consent signature',
      missingSignature: 'No signature was captured for this session.',
      qualitativeHeading: 'Qualitative insights',
      qualitativeTitle: 'Participant reflections by condition',
      qualitativeSubtitle: 'These comments remain on this device and are included in the CSV export.',
      table: {
        condition: 'Condition',
        estimate: 'Estimate (mm:ss)',
        actualDuration: 'Actual (mm:ss)',
        confidence: 'Confidence',
        engagement: 'Engagement',
        difference: 'Difference',
      },
      newParticipant: 'Start a new participant',
      downloadCsv: 'Download CSV',
      closingReminder: 'Download completed? You may now close this window.',
      secondsSuffix: 'sec',
      submission: {
        sending: 'Saving your responses…',
        saved: 'Your responses have been saved.',
        failed:
          'Your responses could not be saved to the study dataset. Please keep this window open and tell the researcher. You can also download a copy with the button below.',
        notConfigured:
          'Central data collection is not set up for this version of the study. Your responses are stored only on this device and in the CSV file you can download below.',
        retry: 'Try again',
        technicalDetail: 'Technical detail: {{detail}}',
      },
    },
  },
  de: {
    settings: {
      languageLabel: 'Sprache',
      english: 'Englisch',
      german: 'Deutsch',
      themeLabel: 'Darstellung',
      light: 'Hell',
      dark: 'Dunkel',
      exitLabel: 'Studie beenden',
      exitConfirm: 'Möchten Sie die Studie beenden? Nicht exportierte Fortschritte werden gelöscht und Sie kehren zur Startseite zurück.',
    },
    loading: {
      preparingNext: 'Nächste Bedingung wird vorbereitet…',
      loadingInstructions: 'Anleitung wird geladen…',
      loadingFirstCondition: 'Erste Bedingung wird geladen…',
      loadingQuestionnaire: 'Fragebogen wird geladen…',
      savingResponses: 'Antworten werden gespeichert…',
      keepWindowOpen: 'Bitte lassen Sie dieses Fenster geöffnet.',
    },
    welcome: {
      badge: 'Studie zur Zeitwahrnehmung',
      title: 'Willkommen',
      description:
        'Vielen Dank, dass Sie an dieser Studie teilnehmen. In diesem Experiment werden Sie drei kurze Aktivitäten erleben, die jeweils in einem anderen Medienformat (Video, Audio und Text) präsentiert werden. Nach jeder Aktivität werden Sie gebeten, einige kurze Fragen zu Ihrer Erfahrung zu beantworten. Die gesamte Sitzung dauert etwa 15–20 Minuten.',
      importantInstructionsHeading: 'Wichtige Anweisungen',
      importantInstructions: [
        'Während des Experiments konzentrieren Sie sich natürlich auf den Inhalt, wie Sie es normalerweise tun würden.',
        'Nach jeder Aktivität werden Sie gebeten, zu schätzen, wie lange die Aktivität gedauert hat, und einige Fragen zu Ihrer Erfahrung zu beantworten.',
        'Es gibt keine richtigen oder falschen Antworten. Wir interessieren uns nur für Ihre persönliche Erfahrung.',
        'Bitte schauen Sie während des Experiments nicht auf die Uhr, verwenden Sie kein Telefon, keine Uhr oder ein anderes Gerät, das die Zeit anzeigt.',
        'Wenn Audio oder Video präsentiert wird, verwenden Sie bitte die bereitgestellten Kopfhörer.',
        'Wenn Sie sich zu irgendeinem Zeitpunkt unwohl fühlen, können Sie das Experiment ohne negative Konsequenzen beenden.',
      ],
      resumeWarning:
        'Für die Teilnehmer-ID {{id}} wurde eine aktive Sitzung gefunden. Ein Neustart überschreibt die bisher lokal gespeicherten Daten.',
      participantLabel: 'Teilnehmer-ID',
      participantPlaceholder: 'Zugewiesene ID eingeben',
      nameLabel: 'Vollständiger Name',
      namePlaceholder: 'Vor- und Nachname',
      nameHelper: 'Nur für das Einwilligungsprotokoll. Dieser Name erscheint nicht in exportierten Daten.',
      idHelper:
        'Diese anonymisierte Kennung wird der teilnehmenden Person angezeigt und erscheint nur in exportierten Dateien.',
      copyId: 'ID kopieren',
      copySuccess: 'Kopiert!',
      copyFailure: 'Kopieren nicht möglich',
      regenerateId: 'Neue ID erzeugen',
      consentHeading: 'Zusammenfassung der Einwilligung',
      consentParagraphs: [
        'Dieser Prototyp ist Teil einer Studie zur Zeitwahrnehmung über unterschiedliche Medienformate.',
        'Sie erleben drei Medienbedingungen zum selben Thema. Video- und Audio-Bedingungen dauern jeweils drei Minuten, während die Text-Bedingung selbstbestimmt ist. Jede wird von einem kurzen Fragebogen zu Ihren Eindrücken und Ihrer Zeitschätzung begleitet.',
        'Ihr vollständiger Name wird nur zusammen mit dieser Einwilligung gespeichert. Exportierte Daten enthalten ausschließlich die anonymisierte Teilnehmer-ID. Keine persönlichen Daten werden gespeichert oder missbraucht.',
        'Die Teilnahme ist freiwillig. Über die Funktion „Studie beenden“ können Sie jederzeit aussteigen; nicht exportierte Antworten werden dabei von diesem Gerät entfernt.',
      ],
      consentText:
        'Ich habe die obigen Informationen gelesen und willige in die Teilnahme an diesem Prototyp ein. Ich verstehe, dass keine persönlichen Daten gespeichert oder missbraucht werden.',
      nameRequired: 'Bitte geben Sie Ihren vollständigen Namen an.',
      consentRequired: 'Die Einwilligung muss bestätigt werden, bevor es weitergeht.',
      stats: '3 Bedingungen · ca. 9 Minuten Medien · 3 Fragebögen',
      startButton: 'Weiter',
      idRequired: 'Die Teilnehmer-ID ist erforderlich.',
    },
    instructions: {
      badge: 'Aufgabenanweisungen',
      title: 'Aufgabenanweisungen',
      intro:
        'In diesem Experiment werden Sie drei kurze Aktivitäten absolvieren, die jeweils in einem anderen Medienformat (Video, Audio und Text) präsentiert werden. Bitte lesen Sie die folgenden Anweisungen sorgfältig. Diese Anweisungen gelten für alle Teile des Experiments.',
      duringHeading: 'Während jeder Aktivität',
      duringPoints: [
        'Konzentrieren Sie sich natürlich auf den Inhalt, wie Sie es normalerweise tun würden.',
        'Versuchen Sie nicht, die Zeit zu zählen oder Strategien zur Zeitverfolgung anzuwenden.',
        'Bitte schauen Sie nicht auf die Uhr mit einem Telefon, einer Uhr oder einem anderen Gerät.',
      ],
      afterHeading: 'Nach jeder Aktivität',
      afterPoints: [
        'Sie werden gebeten, zu schätzen, wie lange die Aktivität gedauert hat.',
        'Sie werden dann einige kurze Fragen zu Ihrer Erfahrung beantworten (z. B. Engagement, Aufmerksamkeit).',
        'Es gibt keine richtigen oder falschen Antworten. Wir interessieren uns nur für Ihre persönliche Wahrnehmung.',
      ],
      importantNotesHeading: 'Wichtige Hinweise',
      importantNotes: [
        'Einige Aktivitäten enthalten Audio oder Video. Bitte stellen Sie sicher, dass Sie Ihre Kopfhörer tragen, wenn dies erforderlich ist.',
        'Eine Aktivität beinhaltet das Lesen von Text. Bitte lesen Sie in Ihrem normalen Tempo.',
        'Wenn Sie sich zu irgendeinem Zeitpunkt unwohl fühlen, können Sie das Experiment ohne Strafe beenden.',
      ],
      startButton: 'Start',
    },
    media: {
      participantLabel: 'Teilnehmer {{id}}',
      conditionProgress: 'Bedingung {{current}} von {{total}}',
      focusReminder: 'Das Medium startet sofort. Bitte behalten Sie den Tab im Vordergrund, bis der Fragebogen erscheint.',
      stalledMessage:
        'Falls die Wiedergabe stockt, bleiben Sie auf diesem Bildschirm. Nach drei Minuten wird der Fragebogen automatisch freigeschaltet.',
      errorMessage:
        'Bei der Wiedergabe ist ein Problem aufgetreten. Bitte bleiben Sie hier; der Fragebogen öffnet sich, sobald der Timer endet.',
      audioBadge: 'Podcast-Sitzung',
      audioInnerLabel: 'Audio',
      conditionLabels: {
        video: 'Video',
        audio: 'Podcast',
        text: 'Artikel',
      },
      textStartReadingMessage: 'Bitte klicken Sie auf die Schaltfläche unten, wenn Sie bereit sind zu lesen. Der Artikel wird erscheinen und der Timer beginnt.',
      textStartReadingButton: 'Mit dem Lesen beginnen',
      textContinueMessage: 'Nehmen Sie sich Zeit, den Artikel in Ihrem eigenen Tempo zu lesen. Wenn Sie fertig sind, klicken Sie auf die Schaltfläche unten, um fortzufahren.',
      textContinueButton: 'Ich habe fertig gelesen',
      skipMessage: 'Wenn Sie dieses Medium überspringen und zum Fragebogen übergehen möchten, können Sie dies mit der Schaltfläche unten tun.',
      skipButton: 'Zum Fragebogen überspringen',
      playbackError: 'Das Medium konnte nicht abgespielt werden. Bitte informieren Sie die Versuchsleitung, bevor Sie fortfahren.',
      playButton: '▶ Abspielen',
    },
    questionnaireScreen: {
      badge: 'Fragebogen nach der Bedingung',
      title: 'Fragebogen zum Medienerlebnis',
      intro: 'Bitte beantworten Sie alle Punkte, bevor Sie fortfahren. Ihre Antworten bleiben lokal, bis Sie die CSV exportieren.',
    },
    demographics: {
      badge: 'Demografische Fragen',
      title: 'Demografische Fragen',
      intro: 'Bevor Sie mit den Hauptaufgaben beginnen, beantworten Sie bitte die folgenden Fragen. Ihre Antworten werden nur für Forschungszwecke verwendet und bleiben anonym.',
      ageLabel: 'Wie alt sind Sie (in Jahren)?',
      agePlaceholder: 'Geben Sie Ihr Alter ein',
      ageRequired: 'Das Alter ist erforderlich.',
      mediaUsageHeading: 'Mediennutzungsgewohnheiten',
      mediaUsageDescription: 'Wie häufig beschäftigen Sie sich normalerweise mit den folgenden Medientypen? (Bitte wählen Sie für jeden eine Option.)',
      mediaUsageShortVideos: 'Kurze Videos (z. B. Online-Videos, Reels, Clips)',
      mediaUsageAudio: 'Nur Audio-Inhalte (z. B. Podcasts, Hörbücher)',
      mediaUsageText: 'Textinhalte lesen (z. B. Artikel, Blogs, geschriebene Geschichten)',
      mediaUsageRequired: 'Bitte wählen Sie eine Häufigkeit für alle Medientypen.',
      caffeineHeading: 'Koffeinkonsum',
      caffeineQuestion: 'Haben Sie heute Koffein konsumiert (z. B. Kaffee, Tee, Energy-Drinks)?',
      caffeineYes: 'Ja',
      caffeineNo: 'Nein',
      caffeineFollowUp: 'Wie lange ist es ungefähr her, dass Sie zuletzt Koffein konsumiert haben?',
      caffeineFollowUpOptions: {
        lessThan1Hour: 'Weniger als 1 Stunde her',
        oneToThreeHours: '1–3 Stunden her',
        moreThan3Hours: 'Mehr als 3 Stunden her',
      },
      caffeineRequired: 'Bitte beantworten Sie die Frage zum Koffeinkonsum.',
      alertnessHeading: 'Aktueller Zustand',
      alertnessQuestion: 'Wie wach fühlen Sie sich gerade?',
      alertnessScale: {
        veryTired: '1 — Sehr müde',
        tired: '2 — Müde',
        neutral: '3 — Neutral',
        alert: '4 — Wach',
        veryAlert: '5 — Sehr wach',
      },
      alertnessRequired: 'Bitte geben Sie Ihr aktuelles Wachheitsniveau an.',
      continueButton: 'Weiter',
    },
    questionnaire: {
      timeHeading: 'Zeitschätzung',
      timeDescription: 'Bitte schätzen Sie, wie lange die vorherige Aktivität gedauert hat.',
      minutesLabel: 'Minuten',
      secondsLabel: 'Sekunden',
      minutesPlaceholder: 'mm',
      secondsPlaceholder: 'ss',
      minutesAria: 'Geschätzte Minuten',
      secondsAria: 'Geschätzte Sekunden',
      immersionHeading: 'Vertiefung',
      engagementHeading: 'Engagement',
      additionalFactorsHeading: 'Zusätzliche Faktoren',
      qualitativeHeading: 'Zusätzliches Feedback',
      qualitativeDescription: 'Bitte teilen Sie weitere Gedanken oder Feedback zu Ihrer Erfahrung mit.',
      qualitativePlaceholder: 'Geben Sie Ihr Feedback hier ein...',
      qualitativeHelper: 'Dieses Feedback ist optional, hilft uns aber, Ihre Erfahrung besser zu verstehen.',
      submit: 'Antworten abschicken',
      validation: {
        positiveDuration: 'Bitte geben Sie vor dem Fortfahren eine positive Dauer an.',
        secondsRange: 'Sekunden müssen zwischen 0 und 59 liegen.',
        required: 'Diese Bewertung ist erforderlich.',
        feedbackRequired: 'Bitte geben Sie Feedback an, bevor Sie fortfahren.',
      },
      likert: {
        confidence: {
          label: 'Wie sicher sind Sie sich bei Ihrer Zeitschätzung?',
          left: 'Überhaupt nicht sicher',
          right: 'Extrem sicher',
        },
        immersion1: {
          label: 'Ich fühlte mich vertieft, während ich das Medium erlebte.',
          left: 'Stimme überhaupt nicht zu',
          right: 'Stimme voll zu',
        },
        immersion2: {
          label: 'Ich wurde tief auf das Medium konzentriert.',
          left: 'Stimme überhaupt nicht zu',
          right: 'Stimme voll zu',
        },
        immersion3: {
          label: 'Ich verlor das Bewusstsein für meine Umgebung, während ich das Medium erlebte.',
          left: 'Stimme überhaupt nicht zu',
          right: 'Stimme voll zu',
        },
        immersion4: {
          label: 'Ich war mir nicht bewusst, was um mich herum geschah, während ich das Medium erlebte.',
          left: 'Stimme überhaupt nicht zu',
          right: 'Stimme voll zu',
        },
        immersion5: {
          label: 'Ich verlor das Zeitgefühl, während ich das Medium erlebte.',
          left: 'Stimme überhaupt nicht zu',
          right: 'Stimme voll zu',
        },
        engagement1: {
          label: 'Ich fand das Medium ansprechend.',
          left: 'Stimme überhaupt nicht zu',
          right: 'Stimme voll zu',
        },
        engagement2: {
          label: 'Ich fühlte mich mental beteiligt, während ich das Medium erlebte.',
          left: 'Stimme überhaupt nicht zu',
          right: 'Stimme voll zu',
        },
        engagement3: {
          label: 'Das Medium hielt meine Aufmerksamkeit.',
          left: 'Stimme überhaupt nicht zu',
          right: 'Stimme voll zu',
        },
        engagement4: {
          label: 'Ich war während des gesamten Erlebnisses am Medium interessiert.',
          left: 'Stimme überhaupt nicht zu',
          right: 'Stimme voll zu',
        },
        engagement5: {
          label: 'Ich war motiviert, dem Medium weiterhin Aufmerksamkeit zu schenken.',
          left: 'Stimme überhaupt nicht zu',
          right: 'Stimme voll zu',
        },
        familiarity: {
          label: 'Ich war mit dem Thema oder dem Gegenstand der Aktivität vertraut.',
          left: 'Überhaupt nicht vertraut',
          right: 'Extrem vertraut',
        },
      },
    },
    result: {
      badge: 'Nachbesprechung',
      title: 'Vielen Dank für Ihre Teilnahme.',
      subtitle: 'Diese Studie untersuchte, wie Medienmodalität (Video, Audio, Text) die subjektive Zeitwahrnehmung und ihre Beziehung zu Immersion und Engagement beeinflusst.',
      debriefingParagraph1: 'Während der Studie wurden Sie gebeten, zu schätzen, wie lange jede Aktivität gedauert hat, und Ihr Maß an Engagement, Aufmerksamkeit und Vertiefung zu berichten. Diese Maße ermöglichen es uns zu untersuchen, ob sich die subjektive Zeitwahrnehmung zwischen Medientypen unterscheidet und ob Gefühle wie Vertiefung, Genuss oder Gedankenabschweifung mit einer Über- oder Unterschätzung der Zeit zusammenhängen.',
      debriefingParagraph2: 'Einige Aspekte der Studie wurden zu Beginn in allgemeinen Begriffen beschrieben, um Ihre Antworten nicht zu beeinflussen. Dies ist eine übliche und genehmigte Forschungspraxis bei der Untersuchung von Wahrnehmung und Erfahrung.',
      debriefingParagraph3: 'Ihre Antworten werden anonym analysiert und nur für Forschungszwecke verwendet. Es gibt keine richtigen oder falschen Antworten, und einzelne Antworten können nicht verwendet werden, um Schlussfolgerungen über einen einzelnen Teilnehmer zu ziehen.',
      debriefingParagraph4: 'Wenn Sie Fragen zur Studie haben oder weitere Informationen wünschen, wenden Sie sich bitte an das Forschungsteam unter den vom Experimentator bereitgestellten Kontaktdaten.',
      debriefingParagraph5: 'Vielen Dank nochmals für Ihren wertvollen Beitrag.',
      participantLabel: 'Teilnehmer-ID',
      meanErrorLabel: 'Durchschnittlicher Fehler',
      actualDurationLabel: 'Tatsächliche Dauer pro Aufgabe',
      consentHeading: 'Einwilligungsnachweis',
      consentSignedAt: 'Unterzeichnet am',
      consentParticipantName: 'Name der Teilnehmerin/des Teilnehmers',
      downloadSignature: 'Unterschrift herunterladen',
      signatureAlt: 'Unterschrift der Teilnehmerin/des Teilnehmers',
      missingSignature: 'Für diese Sitzung wurde keine Unterschrift erfasst.',
      qualitativeHeading: 'Qualitative Einblicke',
      qualitativeTitle: 'Kommentare nach Bedingung',
      qualitativeSubtitle: 'Diese Notizen bleiben lokal gespeichert und sind im CSV-Export enthalten.',
      table: {
        condition: 'Bedingung',
        estimate: 'Schätzung (mm:ss)',
        actualDuration: 'Tatsächlich (mm:ss)',
        confidence: 'Sicherheit',
        engagement: 'Engagement',
        difference: 'Abweichung',
      },
      newParticipant: 'Neue Teilnehmerin / neuen Teilnehmer starten',
      downloadCsv: 'CSV herunterladen',
      closingReminder: 'Download erledigt? Sie können das Fenster jetzt schließen.',
      secondsSuffix: 'Sek.',
      submission: {
        sending: 'Ihre Antworten werden gespeichert …',
        saved: 'Ihre Antworten wurden gespeichert.',
        failed:
          'Ihre Antworten konnten nicht im Studiendatensatz gespeichert werden. Bitte lassen Sie dieses Fenster geöffnet und informieren Sie die Versuchsleitung. Über die Schaltfläche unten können Sie zusätzlich eine Kopie herunterladen.',
        notConfigured:
          'Die zentrale Datenerfassung ist für diese Version der Studie nicht eingerichtet. Ihre Antworten befinden sich nur auf diesem Gerät und in der CSV-Datei, die Sie unten herunterladen können.',
        retry: 'Erneut versuchen',
        technicalDetail: 'Technische Details: {{detail}}',
      },
    },
  },
}
