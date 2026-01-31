'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { platformIcons } from '@/components/SocialIcons'
import { supabase } from '@/lib/supabaseClient'

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
  copy: string | null
  status: string
  scheduled_date: string | null
  copied_at: string | null
  created_at: string
}

interface PianoEditorialeProps {
  posts: Post[]
  userId: string | null
  onPostsChange?: () => void
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

function isPastDate(date: Date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const compareDate = new Date(date)
  compareDate.setHours(0, 0, 0, 0)
  return compareDate < today
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

function PostCell({ post, onClick, onDelete }: { post: Post; onClick: () => void; onDelete?: () => void }) {
  const isPlanned = post.status === 'planned'
  const isCopied = post.status === 'copied' || post.status === 'published'

  if (isPlanned) {
    return (
      <div className="flex items-center gap-3 p-3 bg-amber-50 border border-dashed border-amber-300 rounded-lg">
        <span className="text-amber-600 text-xs">📅</span>
        <p className="flex-1 text-xs text-amber-700">Post programmato</p>
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="text-amber-500 hover:text-red-500 transition-colors"
            title="Rimuovi"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
    >
      <PlatformIcon platformId={post.platform} />
      <p className="flex-1 text-sm text-gray-700 line-clamp-2">
        {post.copy}
      </p>
      {isCopied && (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Copiato
        </span>
      )}
    </div>
  )
}

function DayCard({
  date,
  dayIndex,
  dayPosts,
  plannedPosts,
  isToday,
  isPast,
  onPostClick,
  onGenera,
  onReplica,
  onProgramma,
  onDeletePlanned
}: {
  date: Date
  dayIndex: number
  dayPosts: Post[]
  plannedPosts: Post[]
  isToday: boolean
  isPast: boolean
  onPostClick: (postId: string) => void
  onGenera: () => void
  onReplica: () => void
  onProgramma: () => void
  onDeletePlanned: (postId: string) => void
}) {
  const hasPlanned = plannedPosts.length > 0

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
        {/* Post copiati */}
        {dayPosts.map((post) => (
          <PostCell key={post.id} post={post} onClick={() => onPostClick(post.id)} />
        ))}

        {/* Post programmati */}
        {plannedPosts.map((post) => (
          <PostCell
            key={post.id}
            post={post}
            onClick={() => {}}
            onDelete={() => onDeletePlanned(post.id)}
          />
        ))}

        {/* Azioni - solo per giorni non passati */}
        {!isPast && (
          <div className="flex gap-2 pt-2">
            <button
              onClick={onGenera}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-[#1a365d] text-white hover:bg-[#2c5282] transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Genera
            </button>
            {!hasPlanned && (
              <button
                onClick={onProgramma}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-amber-400 text-amber-600 hover:bg-amber-50 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Programma
              </button>
            )}
            <button
              onClick={onReplica}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Replica
            </button>
          </div>
        )}

        {/* Giorno passato senza post */}
        {isPast && dayPosts.length === 0 && plannedPosts.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-2">Nessun post</p>
        )}
      </div>
    </div>
  )
}

export default function PianoEditoriale({ posts, userId, onPostsChange }: PianoEditorialeProps) {
  const router = useRouter()
  const [weekOffset, setWeekOffset] = useState(0)
  const [localPosts, setLocalPosts] = useState(posts)

  const dates = getWeekDates(weekOffset)
  const todayKey = formatDateKey(new Date())

  // Organizza i post copiati per data (usa copied_at)
  const copiedPostsByDate = localPosts
    .filter(p => p.status === 'copied' || p.status === 'published')
    .reduce((acc, post) => {
      const dateKey = post.copied_at?.split('T')[0]
      if (!dateKey) return acc
      if (!acc[dateKey]) acc[dateKey] = []
      acc[dateKey].push(post)
      return acc
    }, {} as Record<string, Post[]>)

  // Organizza i post programmati per data (usa scheduled_date)
  const plannedPostsByDate = localPosts
    .filter(p => p.status === 'planned')
    .reduce((acc, post) => {
      const dateKey = post.scheduled_date?.split('T')[0]
      if (!dateKey) return acc
      if (!acc[dateKey]) acc[dateKey] = []
      acc[dateKey].push(post)
      return acc
    }, {} as Record<string, Post[]>)

  const handlePostClick = (postId: string) => {
    router.push(`/planning?highlight=${postId}`)
  }

  const handleGenera = () => {
    router.push('/checkin')
  }

  const handleReplica = () => {
    router.push('/planning')
  }

  const handleProgramma = async (dateKey: string) => {
    if (!userId) return

    const { data: newPost, error } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        scheduled_date: dateKey,
        status: 'planned',
        platform: 'facebook',
        copy: null
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating planned post:', error)
      return
    }

    if (newPost) {
      setLocalPosts(prev => [...prev, newPost as Post])
      onPostsChange?.()
    }
  }

  const handleDeletePlanned = async (postId: string) => {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)

    if (error) {
      console.error('Error deleting planned post:', error)
      return
    }

    setLocalPosts(prev => prev.filter(p => p.id !== postId))
    onPostsChange?.()
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
          const dayPosts = copiedPostsByDate[dateKey] || []
          const plannedPosts = plannedPostsByDate[dateKey] || []
          const past = isPastDate(date)
          return (
            <DayCard
              key={i}
              date={date}
              dayIndex={i}
              dayPosts={dayPosts}
              plannedPosts={plannedPosts}
              isToday={dateKey === todayKey}
              isPast={past}
              onPostClick={handlePostClick}
              onGenera={handleGenera}
              onReplica={handleReplica}
              onProgramma={() => handleProgramma(dateKey)}
              onDeletePlanned={handleDeletePlanned}
            />
          )
        })}
      </div>
    </div>
  )
}
