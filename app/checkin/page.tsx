'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Input from '@/components/Input'
import { supabase } from '@/lib/supabaseClient'
import { getSession } from '@/lib/auth'
import { getAgencyProfile } from '@/lib/agencyProfile'
import { platformIconsExtended } from '@/components/SocialIcons'

const platforms = ['facebook', 'instagram', 'linkedin', 'tiktok', 'x'] as const
const DAYS_SHORT = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']

function getWeekDates() {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))

  const dates: Date[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    dates.push(d)
  }
  return dates
}

function formatDateKey(date: Date) {
  return date.toISOString().split('T')[0]
}

interface WeeklyPost {
  scheduled_date: string | null
  copied_at: string | null
  status: string
}

export default function CheckinPage() {
  const [response, setResponse] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState('facebook')
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [weeklyPosts, setWeeklyPosts] = useState<WeeklyPost[]>([])
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      const session = await getSession()
      if (!session) {
        router.push('/')
        return
      }

      const profile = await getAgencyProfile(session.user.id)
      if (!profile) {
        router.push('/onboarding')
        return
      }

      setUserId(session.user.id)

      // Fetch weekly posts status
      const dates = getWeekDates()
      const weekStart = formatDateKey(dates[0])
      const weekEnd = formatDateKey(dates[6])

      const { data } = await supabase
        .from('posts')
        .select('scheduled_date, copied_at, status')
        .eq('user_id', session.user.id)
        .in('status', ['copied', 'planned'])

      if (data) {
        // Filter posts that fall within this week
        const filtered = data.filter(post => {
          const postDate = post.status === 'planned'
            ? post.scheduled_date?.split('T')[0]
            : post.copied_at?.split('T')[0]
          return postDate && postDate >= weekStart && postDate <= weekEnd
        })
        setWeeklyPosts(filtered)
      }

      setLoading(false)
    }
    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    const hasNews = response.trim().length > 0 &&
                    !response.toLowerCase().match(/^(niente|nulla|no|nothing)\.?$/i)

    const today = new Date()
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay() + 1))

    await supabase.from('checkins').insert({
      user_id: userId,
      week_start: weekStart.toISOString().split('T')[0],
      response: response.trim() || null
    })

    if (hasNews) {
      router.push(`/response?type=novita&text=${encodeURIComponent(response)}&platform=${selectedPlatform}`)
    } else {
      router.push(`/response?type=nessuna&platform=${selectedPlatform}`)
    }
  }

  // Calculate weekly status
  const dates = getWeekDates()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const plannedDays: string[] = []
  const copiedDays: string[] = []
  const emptyDays: string[] = []

  dates.forEach((date, i) => {
    const dateKey = formatDateKey(date)
    const dateObj = new Date(date)
    dateObj.setHours(0, 0, 0, 0)

    // Skip past days
    if (dateObj < today) return

    const hasPlanned = weeklyPosts.some(p =>
      p.status === 'planned' && p.scheduled_date?.split('T')[0] === dateKey
    )
    const hasCopied = weeklyPosts.some(p =>
      (p.status === 'copied' || p.status === 'published') && p.copied_at?.split('T')[0] === dateKey
    )

    if (hasPlanned) {
      plannedDays.push(DAYS_SHORT[i])
    } else if (hasCopied) {
      copiedDays.push(DAYS_SHORT[i])
    } else {
      emptyDays.push(DAYS_SHORT[i])
    }
  })

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-start justify-center p-4 pt-20">
        <Card><p className="text-sm text-gray-700">...</p></Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white flex items-start justify-center p-4 pt-20">
      <div className="w-full max-w-2xl">
        {/* Weekly Status */}
        {(plannedDays.length > 0 || emptyDays.length > 0) && (
          <Card className="mb-4">
            <div className="text-xs space-y-2">
              {copiedDays.length > 0 && (
                <p className="text-green-600">
                  ✓ Post copiati: {copiedDays.join(', ')}
                </p>
              )}
              {plannedDays.length > 0 && (
                <p className="text-amber-600">
                  📅 Programmati: {plannedDays.join(', ')}
                </p>
              )}
              {emptyDays.length > 0 && (
                <p className="text-gray-500">
                  Mancano:{' '}
                  <button
                    onClick={() => router.push('/calendario')}
                    className="text-[#1a365d] hover:underline"
                  >
                    {emptyDays.join(', ')} →
                  </button>
                </p>
              )}
            </div>
          </Card>
        )}

        <Card>
          <form onSubmit={handleSubmit}>
            <p className="text-sm text-gray-700 mb-6">
              {new Date().getDay() === 1 ? 'Buon lunedì. ' : ''}Qualche novità dalla settimana scorsa?
            </p>

            <Input
              value={response}
              onChange={setResponse}
              placeholder="Sara ha chiuso la sua prima vendita..."
              multiline={true}
              className="mb-6"
            />

            <p className="text-xs text-gray-500 mb-3">Pubblica su</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {platforms.map((p) => {
                const IconComponent = platformIconsExtended[p]
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSelectedPlatform(p)}
                    className={`px-3 py-2 rounded-lg border transition-all ${
                      selectedPlatform === p
                        ? 'border-[#1a365d] bg-[#1a365d]/5 text-[#1a365d]'
                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <IconComponent />
                  </button>
                )
              })}
            </div>

            <Button type="submit" variant="primary">
              Avanti
            </Button>
          </form>
        </Card>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => router.push('/profile')}
            className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:border-gray-300 hover:text-gray-700 text-sm transition-all"
          >
            Profilo agenzia
          </button>
        </div>
      </div>
    </main>
  )
}
