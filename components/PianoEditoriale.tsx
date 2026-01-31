'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { platformIcons } from '@/components/SocialIcons'

const DAYS_FULL = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica']
const MONTHS = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']

const PLATFORMS = [
  { id: 'facebook', name: 'Facebook', color: '#1877F2' },
  { id: 'instagram', name: 'Instagram', color: '#E4405F' },
  { id: 'linkedin', name: 'LinkedIn', color: '#0A66C2' },
  { id: 'tiktok', name: 'TikTok', color: '#000000' },
  { id: 'x', name: 'X', color: '#000000' },
]

interface Post {
  id: string
  platform: string
  copy: string
  status: string
  copied_at: string | null
  created_at: string
}

interface PianoEditorialeProps {
  posts: Post[]
}

function getWeekDates(weekOffset = 0) {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + weekOffset * 7)

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

function formatWeekRange(dates: Date[]) {
  const first = dates[0]
  const last = dates[6]
  if (first.getMonth() === last.getMonth()) {
    return `${first.getDate()}–${last.getDate()} ${MONTHS[first.getMonth()]}`
  }
  return `${first.getDate()} ${MONTHS[first.getMonth()].slice(0, 3)} – ${last.getDate()} ${MONTHS[last.getMonth()].slice(0, 3)}`
}

function PlatformIcon({ platformId }: { platformId: string }) {
  const platform = PLATFORMS.find(p => p.id === platformId)
  const IconComponent = platformIcons[platformId as keyof typeof platformIcons]

  if (!IconComponent || !platform) return null

  return (
    <span
      className="inline-flex items-center justify-center rounded w-5 h-5"
      style={{ backgroundColor: platform.color }}
    >
      <IconComponent className="text-white w-3 h-3" />
    </span>
  )
}

function PostCell({ post, onClick }: { post: Post; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors bg-gray-50 hover:bg-gray-100"
    >
      <PlatformIcon platformId={post.platform} />
      <p className="flex-1 text-sm text-gray-700 line-clamp-2">
        {post.copy}
      </p>
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Copiato
      </span>
    </div>
  )
}

function DayCard({
  date,
  dayIndex,
  dayPosts,
  isToday,
  onPostClick
}: {
  date: Date
  dayIndex: number
  dayPosts: Post[]
  isToday: boolean
  onPostClick: (postId: string) => void
}) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border p-4 ${isToday ? 'border-[#ed8936] border-2' : 'border-gray-300'}`}>
      {/* Header giorno */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${isToday ? 'text-[#ed8936]' : 'text-[#1a365d]'}`}>
            {DAYS_FULL[dayIndex]}
          </span>
          <span className="text-xs text-gray-500">{date.getDate()}</span>
        </div>
        {isToday && (
          <span className="text-[10px] font-semibold text-[#ed8936] bg-orange-100 px-2 py-0.5 rounded-full">
            OGGI
          </span>
        )}
      </div>

      {/* Post */}
      <div className="space-y-2">
        {dayPosts.map((post) => (
          <PostCell
            key={post.id}
            post={post}
            onClick={() => onPostClick(post.id)}
          />
        ))}

        {dayPosts.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-2">Nessun post</p>
        )}
      </div>
    </div>
  )
}

export default function PianoEditoriale({ posts }: PianoEditorialeProps) {
  const router = useRouter()
  const [weekOffset, setWeekOffset] = useState(0)

  const dates = getWeekDates(weekOffset)
  const todayKey = formatDateKey(new Date())

  // Organizza i post per data (usa copied_at)
  const postsByDate = posts.reduce((acc, post) => {
    const dateKey = post.copied_at?.split('T')[0]
    if (!dateKey) return acc
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(post)
    return acc
  }, {} as Record<string, Post[]>)

  const handlePostClick = (postId: string) => {
    router.push(`/planning?highlight=${postId}`)
  }

  return (
    <div>
      {/* Navigazione settimana - stile minimal */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setWeekOffset(w => w - 1)}
          className="text-xs text-gray-500 hover:text-[#1a365d] hover:underline transition-colors"
        >
          ← Precedente
        </button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">{formatWeekRange(dates)}</span>
          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="text-xs text-[#1a365d] hover:underline"
            >
              Torna a oggi
            </button>
          )}
        </div>
        <button
          onClick={() => setWeekOffset(w => w + 1)}
          className="text-xs text-gray-500 hover:text-[#1a365d] hover:underline transition-colors"
        >
          Successiva →
        </button>
      </div>

      {/* Giorni della settimana */}
      <div className="space-y-3">
        {dates.map((date, i) => {
          const dateKey = formatDateKey(date)
          const dayPosts = postsByDate[dateKey] || []
          return (
            <DayCard
              key={i}
              date={date}
              dayIndex={i}
              dayPosts={dayPosts}
              isToday={dateKey === todayKey}
              onPostClick={handlePostClick}
            />
          )
        })}
      </div>
    </div>
  )
}
