'use client'

import { platformIcons } from '@/components/SocialIcons'

// Colori brand per piattaforma
const platformColors: Record<string, string> = {
  facebook: '#1877F2',
  instagram: '#E4405F',
  linkedin: '#0A66C2',
  tiktok: '#000000',
  x: '#000000',
  google: '#4285F4'
}

interface Post {
  id: string
  platform: string
  scheduled_date: string
}

interface CalendarDayProps {
  day: number | null
  isCurrentMonth: boolean
  isToday: boolean
  posts: Post[]
  onPostClick: (postId: string) => void
}

export default function CalendarDay({
  day,
  isCurrentMonth,
  isToday,
  posts,
  onPostClick
}: CalendarDayProps) {
  const maxVisible = 3
  const visiblePosts = posts.slice(0, maxVisible)
  const remaining = posts.length - maxVisible

  return (
    <div
      className={`min-h-[80px] sm:min-h-[100px] p-1 sm:p-2 border-b border-r border-gray-100 ${
        !isCurrentMonth ? 'bg-gray-50/50' : ''
      }`}
    >
      {day && (
        <>
          <div
            className={`text-sm mb-1 ${
              isToday
                ? 'w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full ring-2 ring-[#ed8936] text-[#ed8936] font-semibold'
                : isCurrentMonth
                ? 'text-gray-700'
                : 'text-gray-300'
            }`}
          >
            {day}
          </div>
          <div className="flex flex-wrap gap-1">
            {visiblePosts.map((post) => {
              const IconComponent = platformIcons[post.platform as keyof typeof platformIcons]
              const color = platformColors[post.platform] || '#6B7280'

              return (
                <button
                  key={post.id}
                  onClick={() => onPostClick(post.id)}
                  className="p-1 rounded hover:bg-gray-100 transition-colors"
                  style={{ color }}
                  title={post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}
                >
                  {IconComponent && (
                    <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              )
            })}
            {remaining > 0 && (
              <span className="text-xs text-gray-500 self-center">
                +{remaining}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  )
}
