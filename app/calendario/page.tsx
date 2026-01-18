'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/Card'
import { supabase } from '@/lib/supabaseClient'
import { getSession, getOrCreateUserAgency } from '@/lib/auth'

type PostStatus = 'ready' | 'copied' | 'published'

interface Post {
  id: string
  pillar: string
  platform: string
  scheduledDate: string
  status: PostStatus
  preview: string
}

const statusLabels: Record<PostStatus, string> = {
  ready: 'Pronto',
  copied: 'Copiato',
  published: 'Pubblicato'
}

const statusColors: Record<PostStatus, string> = {
  ready: 'bg-gray-100 text-gray-700',
  copied: 'bg-blue-50 text-blue-700',
  published: 'bg-green-50 text-green-700'
}

const pillarLabels: Record<string, string> = {
  chi_siamo: 'Chi siamo',
  cosa_facciamo: 'Cosa facciamo',
  dove_lo_facciamo: 'Dove lo facciamo'
}

export default function CalendarioPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchPosts() {
      const session = await getSession()
      if (!session) {
        router.push('/')
        return
      }

      const agencyId = await getOrCreateUserAgency()
      if (!agencyId) return

      const { data } = await supabase
        .from('posts')
        .select('id, pillar, platform, scheduled_date, status, copy')
        .eq('agency_id', agencyId)
        .order('scheduled_date', { ascending: true })

      if (data) {
        const formattedPosts: Post[] = data.map((post) => ({
          id: post.id,
          pillar: post.pillar || '',
          platform: post.platform || '',
          scheduledDate: post.scheduled_date,
          status: (post.status as PostStatus) || 'ready',
          preview: post.copy.split('\n')[0].substring(0, 50) + '...'
        }))
        setPosts(formattedPosts)
      }
      setLoading(false)
    }

    fetchPosts()
  }, [router])

  const handlePostClick = (postId: string) => {
    window.location.href = `/post/${postId}`
  }

  // Raggruppa per data
  const postsByDate = posts.reduce((acc, post) => {
    if (!acc[post.scheduledDate]) {
      acc[post.scheduledDate] = []
    }
    acc[post.scheduledDate].push(post)
    return acc
  }, {} as Record<string, Post[]>)

  if (loading) {
    return (
      <main className="min-h-screen bg-white p-4">
        <div className="max-w-4xl mx-auto py-8">
          <h1 className="text-2xl font-semibold text-[#1a365d] mb-8">Calendario</h1>
          <p className="text-sm text-gray-700">...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white p-4">
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-2xl font-semibold text-[#1a365d] mb-8">Calendario</h1>

        <div className="space-y-6">
          {Object.entries(postsByDate).map(([date, posts]) => (
            <div key={date}>
              <h2 className="text-sm font-medium text-gray-500 mb-3">
                {new Date(date + 'T00:00:00').toLocaleDateString('it-IT', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </h2>

              <div className="space-y-3">
                {posts.map((post) => (
                  <Card key={post.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <div
                      onClick={() => handlePostClick(post.id)}
                      className="flex items-start justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-[#1a365d]">
                            {pillarLabels[post.pillar]}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500 capitalize">
                            {post.platform}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{post.preview}</p>
                      </div>

                      <span className={`ml-4 px-2 py-1 rounded text-xs font-medium ${statusColors[post.status]}`}>
                        {statusLabels[post.status]}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
