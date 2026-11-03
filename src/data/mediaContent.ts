import type { LocalizedParagraphs, LocalizedText, MediaCondition } from '../types'

/**
 * Media files are located in /public/media/
 * - Video: Uses VITE_VIDEO_URL or falls back to /media/Video.mp4
 * - Audio: Uses VITE_AUDIO_URL or falls back to /media/virtual-reality-audio.m4a
 * - Article: /media/article.txt (content is embedded below)
 */
export const MEDIA_DURATION_SECONDS = 180

// Get media URLs from environment variables or use local paths as fallback
const VIDEO_URL = import.meta.env.VITE_VIDEO_URL || '/media/Video.mp4'
const AUDIO_URL = import.meta.env.VITE_AUDIO_URL || '/media/virtual-reality-audio.m4a'

export interface MediaMeta {
  type: MediaCondition
  title: LocalizedText
  topic: LocalizedText
  description: LocalizedText
  url?: string
  poster?: string
  transcriptUrl?: string
  article?: {
    heading: LocalizedText
    paragraphs: LocalizedParagraphs
  }
}

export const MEDIA_SEQUENCE: MediaCondition[] = ['video', 'audio', 'text']

export const MEDIA_CONTENT: Record<MediaCondition, MediaMeta> = {
  video: {
    type: 'video',
    title: {
      en: 'Virtual Reality in Gaming and Entertainment',
      de: 'Virtuelle Realität in Spielen und Unterhaltung',
    },
    topic: {
      en: 'Technology',
      de: 'Technologie',
    },
    description: {
      en: 'Video about virtual reality in gaming and entertainment.',
      de: 'Video über virtuelle Realität in Spielen und Unterhaltung.',
    },
    url: VIDEO_URL,
  },
  audio: {
    type: 'audio',
    title: {
      en: 'Podcast: Virtual Reality',
      de: 'Podcast: Virtuelle Realität',
    },
    topic: {
      en: 'Technology',
      de: 'Technologie',
    },
    description: {
      en: 'Audio podcast about virtual reality in gaming and entertainment.',
      de: 'Audio-Podcast über virtuelle Realität in Spielen und Unterhaltung.',
    },
    url: AUDIO_URL,
  },
  text: {
    type: 'text',
    title: {
      en: 'Article: Virtual Reality in Gaming and Entertainment',
      de: 'Artikel: Virtuelle Realität in Spielen und Unterhaltung',
    },
    topic: {
      en: 'Technology',
      de: 'Technologie',
    },
    description: {
      en: 'Article about virtual reality in gaming and entertainment.',
      de: 'Artikel über virtuelle Realität in Spielen und Unterhaltung.',
    },
    article: {
      heading: {
        en: 'Virtual Reality in Gaming and Entertainment',
        de: 'Virtuelle Realität in Spielen und Unterhaltung',
      },
      paragraphs: {
        en: [
          'Virtual Reality (VR) has emerged as one of the most transformative technologies in the gaming and entertainment industry. By creating immersive, computer-generated environments that users can interact with in real time, VR has redefined how audiences experience digital content. Unlike traditional media, which relies on screens and passive interaction, virtual reality places users directly inside the experience, making them active participants rather than mere observers.',
          'In the gaming industry, virtual reality has introduced a new level of immersion and realism. VR games allow players to step into virtual worlds where they can look around, move, and interact naturally using motion controllers and head-mounted displays. This technology enhances the sense of presence, making players feel as though they are physically inside the game environment.',
          'Beyond gaming, virtual reality is reshaping the entertainment industry as a whole. In film and media, VR enables immersive storytelling where viewers can explore scenes from multiple perspectives rather than watching a fixed frame. This new storytelling format is being explored by filmmakers, artists, and media companies seeking innovative ways to connect with audiences.',
          'VR has also made a significant impact on live entertainment and events. Virtual concerts, theater performances, and sports events allow users to attend experiences remotely while still feeling present in the venue. Artists and event organizers can reach global audiences without physical limitations, while fans enjoy front-row experiences from the comfort of their homes. This has proven especially valuable in situations where physical gatherings are restricted, highlighting VR\'s potential as a powerful alternative platform for live entertainment.',
          'Despite its advantages, virtual reality still faces challenges. High equipment costs, technical limitations, and physical discomfort such as motion sickness can hinder widespread adoption. However, as technology continues to evolve, hardware is becoming more affordable, lighter, and more user-friendly, while software tools are improving accessibility for developers.',
          'In conclusion, virtual reality is revolutionizing gaming and entertainment by delivering immersive, interactive, and engaging experiences. It is transforming how games are played, how stories are told, and how audiences connect with entertainment content. As VR technology continues to advance, it is expected to play an increasingly central role in the future of digital entertainment, offering limitless possibilities for creativity, innovation, and human interaction.',
        ],
        de: [
          'Virtuelle Realität (VR) hat sich als eine der transformativsten Technologien in der Gaming- und Unterhaltungsindustrie etabliert. Durch die Schaffung immersiver, computergenerierter Umgebungen, mit denen Benutzer in Echtzeit interagieren können, hat VR neu definiert, wie Publikum digitale Inhalte erlebt. Im Gegensatz zu traditionellen Medien, die auf Bildschirme und passive Interaktion angewiesen sind, versetzt virtuelle Realität Benutzer direkt in die Erfahrung und macht sie zu aktiven Teilnehmern anstatt bloßer Beobachter.',
          'In der Gaming-Industrie hat virtuelle Realität ein neues Maß an Immersion und Realismus eingeführt. VR-Spiele ermöglichen es Spielern, in virtuelle Welten einzutreten, in denen sie sich umsehen, bewegen und natürlich mit Bewegungssteuerungen und Head-Mounted Displays interagieren können. Diese Technologie verstärkt das Gefühl der Präsenz und lässt Spieler das Gefühl haben, sich physisch in der Spielumgebung zu befinden.',
          'Über Gaming hinaus prägt virtuelle Realität die gesamte Unterhaltungsindustrie neu. In Film und Medien ermöglicht VR immersives Storytelling, bei dem Zuschauer Szenen aus mehreren Perspektiven erkunden können, anstatt einen festen Rahmen zu beobachten. Dieses neue Storytelling-Format wird von Filmemachern, Künstlern und Medienunternehmen erforscht, die innovative Wege suchen, um mit Publikum in Kontakt zu treten.',
          'VR hat auch erhebliche Auswirkungen auf Live-Unterhaltung und Veranstaltungen. Virtuelle Konzerte, Theateraufführungen und Sportereignisse ermöglichen es Benutzern, Erfahrungen aus der Ferne zu besuchen und sich dennoch im Veranstaltungsort präsent zu fühlen. Künstler und Veranstalter können globale Publikum ohne physische Einschränkungen erreichen, während Fans Frontreihen-Erlebnisse vom Komfort ihrer Häuser aus genießen. Dies hat sich besonders in Situationen als wertvoll erwiesen, in denen physische Versammlungen eingeschränkt sind, was VR\'s Potenzial als mächtige alternative Plattform für Live-Unterhaltung hervorhebt.',
          'Trotz ihrer Vorteile steht virtuelle Realität noch vor Herausforderungen. Hohe Gerätekosten, technische Einschränkungen und physisches Unbehagen wie Reisekrankheit können die weitverbreitete Adoption behindern. Während sich die Technologie jedoch weiterentwickelt, wird Hardware erschwinglicher, leichter und benutzerfreundlicher, während Software-Tools die Zugänglichkeit für Entwickler verbessern.',
          'Zusammenfassend revolutioniert virtuelle Realität Gaming und Unterhaltung durch die Bereitstellung immersiver, interaktiver und ansprechender Erfahrungen. Sie transformiert, wie Spiele gespielt werden, wie Geschichten erzählt werden und wie Publikum mit Unterhaltungsinhalten verbindet. Während sich die VR-Technologie weiterentwickelt, wird erwartet, dass sie eine zunehmend zentrale Rolle in der Zukunft der digitalen Unterhaltung spielt und grenzenlose Möglichkeiten für Kreativität, Innovation und menschliche Interaktion bietet.',
        ],
      },
    },
  },
}
