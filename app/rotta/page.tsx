'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/Card'
import Button from '@/components/Button'
import { supabase } from '@/lib/supabaseClient'
import { getSession, getOrCreateUserAgency } from '@/lib/auth'

interface RottaMessage {
  title: string
  message: string
  tone: 'positive' | 'neutral' | 'invite'
  icon: string
}

export default function RottaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [rotta, setRotta] = useState<RottaMessage | null>(null)

  useEffect(() => {
    const loadRotta = async () => {
      const session = await getSession()
      if (!session) {
        router.push('/')
        return
      }

      const agencyId = await getOrCreateUserAgency()
      if (!agencyId) {
        router.push('/onboarding')
        return
      }

      // Calcola post ultima settimana
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - 7)

      const { data: recentPosts } = await supabase
        .from('posts')
        .select('id, status')
        .eq('agency_id', agencyId)
        .gte('created_at', weekStart.toISOString())

      const publishedCount = recentPosts?.filter(
        p => p.status === 'copied' || p.status === 'published'
      ).length || 0

      // Determina messaggio
      let result: RottaMessage
      if (publishedCount >= 3) {
        result = {
          title: "Sei in rotta",
          message: "La tua presenza è costante. Continua così.",
          tone: "positive",
          icon: "compass"
        }
      } else if (publishedCount >= 1) {
        result = {
          title: "Stai navigando",
          message: "Hai iniziato bene questa settimana. Un altro contenuto rafforzerebbe la continuità.",
          tone: "neutral",
          icon: "sailboat"
        }
      } else {
        result = {
          title: "Pronto a partire?",
          message: "Questa settimana è ancora tutta da scrivere. Un contenuto al giorno giusto fa la differenza.",
          tone: "invite",
          icon: "sunrise"
        }
      }

      setRotta(result)
      setLoading(false)
    }

    loadRotta()
  }, [router])

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card><p className="text-sm text-gray-700">...</p></Card>
      </main>
    )
  }

  // Stili in base al tone
  const toneStyles = {
    positive: {
      cardBg: 'bg-emerald-50',
      titleColor: 'text-emerald-700'
    },
    neutral: {
      cardBg: 'bg-blue-50',
      titleColor: 'text-[#1a365d]'
    },
    invite: {
      cardBg: 'bg-orange-50',
      titleColor: 'text-orange-700'
    }
  }

  const style = rotta ? toneStyles[rotta.tone] : toneStyles.neutral

  // Icone SVG inline
  const renderIcon = () => {
    if (rotta?.icon === 'compass') {
      return (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-600">
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill="currentColor" opacity="0.3" />
          <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" />
        </svg>
      )
    }
    if (rotta?.icon === 'sailboat') {
      return (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#1a365d]">
          <path d="M2 20h20" />
          <path d="M4 20l2-4h12l2 4" />
          <path d="M12 4v12" />
          <path d="M12 4l6 8H12" fill="currentColor" opacity="0.2" />
          <path d="M12 4l6 8H12" />
        </svg>
      )
    }
    // sunrise
    return (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-orange-600">
        <path d="M12 2v2" />
        <path d="M4.93 4.93l1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="M19.07 4.93l-1.41 1.41" />
        <path d="M17.66 17.66A8 8 0 1 0 6.34 17.66" />
        <path d="M2 20h20" />
      </svg>
    )
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-6 text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wide">La tua rotta</p>
        </div>

        {/* Card principale */}
        <Card className={style.cardBg}>
          <div className="flex flex-col items-center text-center">
            <div className="mb-4">
              {renderIcon()}
            </div>
            <h2 className={`text-xl font-medium ${style.titleColor} mb-3`}>
              {rotta?.title}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {rotta?.message}
            </p>
          </div>
        </Card>

        {/* Azioni */}
        <div className="mt-6 space-y-3">
          <Button
            variant="primary"
            onClick={() => router.push('/checkin')}
            className="w-full"
          >
            Vai al check-in
          </Button>
          <Button
            variant="secondary"
            onClick={() => router.push('/planning')}
            className="w-full"
          >
            Vedi i tuoi contenuti
          </Button>
        </div>

        {/* Footer soft */}
        <p className="text-center text-xs text-gray-400 mt-8">
          La costanza costruisce fiducia.
        </p>
      </div>
    </main>
  )
}
