'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { platformIcons } from '@/components/SocialIcons'

const DAYS = ['LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB', 'DOM']
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
    return `${first.getDate()}–${last.getDate()} ${MONTHS[first.getMonth()]} ${first.getFullYear()}`
  }
  return `${first.getDate()} ${MONTHS[first.getMonth()].slice(0, 3)} – ${last.getDate()} ${MONTHS[last.getMonth()].slice(0, 3)} ${last.getFullYear()}`
}

function isPastDate(date: Date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const compareDate = new Date(date)
  compareDate.setHours(0, 0, 0, 0)
  return compareDate < today
}

function PlatformIcon({ platformId, size = 20 }: { platformId: string; size?: number }) {
  const platform = PLATFORMS.find(p => p.id === platformId)
  const IconComponent = platformIcons[platformId as keyof typeof platformIcons]

  if (!IconComponent || !platform) return null

  const iconSize = size < 22 ? 'w-3 h-3' : 'w-3.5 h-3.5'

  return (
    <span
      className="inline-flex items-center justify-center rounded"
      style={{
        width: size,
        height: size,
        backgroundColor: platform.color,
        padding: size * 0.15,
      }}
    >
      <IconComponent className={`text-white ${iconSize}`} />
    </span>
  )
}

function PostCell({ post, onClick }: { post: Post; onClick: () => void }) {
  const isCopied = post.status === 'copied' || post.status === 'published'

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl p-3 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-gray-300 shadow-sm flex items-start gap-3"
    >
      <PlatformIcon platformId={post.platform} size={24} />
      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-gray-700 leading-snug line-clamp-2">
          {post.copy}
        </p>
      </div>
      {isCopied && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700 flex-shrink-0">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Copiato
        </span>
      )}
    </div>
  )
}

function EmptyCell({ onGenera, onReplica }: { onGenera: () => void; onReplica: () => void }) {
  return (
    <div className="border-2 border-dashed border-gray-200 rounded-xl py-4 flex items-center justify-center hover:border-gray-300 hover:bg-gray-50 transition-all">
      <div className="flex gap-2">
        <button
          onClick={onGenera}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-[12px] font-semibold rounded-lg bg-[#1a365d] text-white hover:bg-[#2c5282] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Genera
        </button>
        <button
          onClick={onReplica}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-[12px] font-semibold rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Replica
        </button>
      </div>
    </div>
  )
}

function ViewToggle({ view, setView }: { view: 'week' | 'month'; setView: (v: 'week' | 'month') => void }) {
  return (
    <div className="inline-flex bg-gray-100 rounded-lg p-0.5">
      {[
        { id: 'week' as const, label: 'Settimana' },
        { id: 'month' as const, label: 'Mese' },
      ].map((v) => (
        <button
          key={v.id}
          onClick={() => setView(v.id)}
          className={`px-4 py-1.5 text-[13px] font-medium rounded-md transition-all ${
            view === v.id
              ? 'bg-white text-[#1a365d] shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {v.label}
        </button>
      ))}
    </div>
  )
}

function WeekBadge({ count }: { count: number }) {
  const isGood = count >= 3
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
        isGood ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isGood ? 'bg-green-500' : 'bg-amber-500'}`} />
      {count} post
    </span>
  )
}

function MobileDayCard({
  date,
  dayIndex,
  dayPosts,
  isToday,
  isPast,
  onPostClick,
  onGenera,
  onReplica
}: {
  date: Date
  dayIndex: number
  dayPosts: Post[]
  isToday: boolean
  isPast: boolean
  onPostClick: (postId: string) => void
  onGenera: () => void
  onReplica: () => void
}) {
  return (
    <div className={`bg-white rounded-2xl border overflow-hidden ${isToday ? 'border-2 border-[#ed8936]' : 'border-gray-200'}`}>
      <div className={`px-4 py-2.5 border-b border-gray-200 flex items-center justify-between ${isToday ? 'bg-orange-50' : 'bg-gray-50'}`}>
        <div className="flex items-center gap-2">
          <span className={`text-[13px] font-semibold ${isToday ? 'text-[#ed8936]' : 'text-[#1a365d]'}`}>
            {DAYS_FULL[dayIndex]}
          </span>
          <span className="text-xs text-gray-500">{date.getDate()}</span>
        </div>
        {isToday && (
          <span className="text-[10px] font-semibold text-[#ed8936] bg-amber-100 px-2 py-0.5 rounded-full">
            OGGI
          </span>
        )}
      </div>
      <div className="p-3 space-y-2">
        {/* Post esistenti */}
        {dayPosts.map((post) => (
          <PostCell key={post.id} post={post} onClick={() => onPostClick(post.id)} />
        ))}

        {/* Box Genera/Replica - solo se non è un giorno passato */}
        {!isPast && (
          <EmptyCell onGenera={onGenera} onReplica={onReplica} />
        )}

        {/* Se giorno passato e nessun post */}
        {isPast && dayPosts.length === 0 && (
          <div className="py-4 text-center text-xs text-gray-400">
            Nessun post
          </div>
        )}
      </div>
    </div>
  )
}

export default function PianoEditoriale({ posts }: PianoEditorialeProps) {
  const router = useRouter()
  const [weekOffset, setWeekOffset] = useState(0)
  const [view, setView] = useState<'week' | 'month'>('week')
  const [isMobile, setIsMobile] = useState(false)

  const dates = getWeekDates(weekOffset)
  const todayKey = formatDateKey(new Date())

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Organizza i post per data
  const postsByDate = posts.reduce((acc, post) => {
    const dateKey = post.copied_at?.split('T')[0] || post.created_at?.split('T')[0]
    if (!dateKey) return acc
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(post)
    return acc
  }, {} as Record<string, Post[]>)

  // Conta post della settimana corrente
  const weekPostCount = dates.reduce((count, date) => {
    const dateKey = formatDateKey(date)
    const dayPosts = postsByDate[dateKey] || []
    return count + dayPosts.length
  }, 0)

  const handlePostClick = (postId: string) => {
    router.push(`/planning?highlight=${postId}`)
  }

  const handleGenera = () => {
    router.push('/checkin')
  }

  const handleReplica = () => {
    router.push('/planning')
  }

  return (
    <div className="font-sans">
      {/* Controls */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-wrap gap-3 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setWeekOffset(w => w - 1)}
            className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="text-center min-w-[180px]">
            <span className="text-[15px] font-semibold text-[#1a365d]">{formatWeekRange(dates)}</span>
          </div>
          <button
            onClick={() => setWeekOffset(w => w + 1)}
            className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round">
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </button>
          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="px-3 py-1 text-xs font-medium rounded-md border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Oggi
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <WeekBadge count={weekPostCount} />
          <ViewToggle view={view} setView={setView} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 bg-gray-50 rounded-b-2xl">
        {view === 'week' ? (
          isMobile ? (
            // Mobile: card verticali per giorno
            <div className="space-y-3">
              {dates.map((date, i) => {
                const dateKey = formatDateKey(date)
                const dayPosts = postsByDate[dateKey] || []
                const past = isPastDate(date)
                return (
                  <MobileDayCard
                    key={i}
                    date={date}
                    dayIndex={i}
                    dayPosts={dayPosts}
                    isToday={dateKey === todayKey}
                    isPast={past}
                    onPostClick={handlePostClick}
                    onGenera={handleGenera}
                    onReplica={handleReplica}
                  />
                )
              })}
            </div>
          ) : (
            // Desktop: griglia con colonne piattaforme
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              {/* Header piattaforme */}
              <div className="grid border-b border-gray-200 bg-gray-50" style={{ gridTemplateColumns: '100px repeat(5, 1fr)' }}>
                <div className="px-4 py-3 border-r border-gray-200">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Giorno</span>
                </div>
                {PLATFORMS.map((p) => (
                  <div key={p.id} className="px-3 py-2.5 border-r border-gray-200 last:border-r-0 flex items-center gap-2">
                    <PlatformIcon platformId={p.id} size={18} />
                    <span className="text-[12px] font-semibold text-gray-700">{p.name}</span>
                  </div>
                ))}
              </div>

              {/* Righe giorni */}
              {dates.map((date, dayIndex) => {
                const dateKey = formatDateKey(date)
                const dayPosts = postsByDate[dateKey] || []
                const isToday = dateKey === todayKey
                const isWeekend = dayIndex >= 5
                const past = isPastDate(date)

                // Raggruppa post per piattaforma
                const postsByPlatform = dayPosts.reduce((acc, post) => {
                  acc[post.platform] = post
                  return acc
                }, {} as Record<string, Post>)

                return (
                  <div
                    key={dayIndex}
                    className={`grid border-b border-gray-200 last:border-b-0 ${
                      isToday ? 'bg-orange-50/50' : isWeekend ? 'bg-gray-50/50' : 'bg-white'
                    }`}
                    style={{ gridTemplateColumns: '100px repeat(5, 1fr)' }}
                  >
                    <div className="px-4 py-3 border-r border-gray-200 flex flex-col justify-center">
                      <span className={`text-[11px] font-semibold uppercase tracking-wide ${isToday ? 'text-[#ed8936]' : 'text-gray-500'}`}>
                        {DAYS[dayIndex]}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xl font-semibold ${isToday ? 'text-[#ed8936]' : 'text-[#1a365d]'}`}>
                          {date.getDate()}
                        </span>
                        {isToday && <span className="w-1.5 h-1.5 rounded-full bg-[#ed8936]" />}
                      </div>
                    </div>
                    {PLATFORMS.map((platform) => {
                      const post = postsByPlatform[platform.id]
                      return (
                        <div key={platform.id} className="p-2 border-r border-gray-200 last:border-r-0 min-h-[80px] flex items-center">
                          {post ? (
                            <div
                              onClick={() => handlePostClick(post.id)}
                              className="w-full bg-white border border-gray-200 rounded-lg p-2 cursor-pointer hover:shadow-md hover:border-gray-300 transition-all"
                            >
                              <p className="text-[10px] text-gray-600 line-clamp-2 mb-1">{post.copy}</p>
                              {(post.status === 'copied' || post.status === 'published') && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-green-600">
                                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                  Copiato
                                </span>
                              )}
                            </div>
                          ) : !past ? (
                            <div className="w-full border border-dashed border-gray-200 rounded-lg p-2 flex items-center justify-center min-h-[60px] hover:border-gray-300 hover:bg-gray-50 transition-all">
                              <div className="flex gap-1">
                                <button
                                  onClick={handleGenera}
                                  className="px-2 py-1 text-[9px] font-semibold rounded bg-[#1a365d] text-white hover:bg-[#2c5282]"
                                >
                                  + Genera
                                </button>
                                <button
                                  onClick={handleReplica}
                                  className="px-2 py-1 text-[9px] font-semibold rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
                                >
                                  Replica
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full text-center text-[10px] text-gray-300">—</div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )
        ) : (
          // Vista mensile placeholder
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-500">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" className="mx-auto mb-4">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <p className="text-sm font-medium">Vista mensile in arrivo</p>
          </div>
        )}
      </div>
    </div>
  )
}
