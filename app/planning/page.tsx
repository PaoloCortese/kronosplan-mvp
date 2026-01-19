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
  createdAt: string
  status: PostStatus
  copy: string
}

const allPlatforms = ['facebook', 'instagram', 'linkedin', 'tiktok', 'x']

const platformLabels: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  tiktok: 'TikTok',
  x: 'X'
}

// Icona doppia spunta stile WhatsApp
function CheckIcon({ copied }: { copied: boolean }) {
  return (
    <svg
      width="20"
      height="14"
      viewBox="0 0 20 14"
      fill="none"
      className={copied ? 'text-blue-500' : 'text-gray-300'}
    >
      <path
        d="M1 7L5 11L13 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 7L11 11L19 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function PlanningPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [replicatingId, setReplicatingId] = useState<string | null>(null)
  const [agencyId, setAgencyId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchPosts() {
      const session = await getSession()
      if (!session) {
        router.push('/')
        return
      }

      const aid = await getOrCreateUserAgency()
      if (!aid) return
      setAgencyId(aid)

      const { data } = await supabase
        .from('posts')
        .select('id, pillar, platform, scheduled_date, created_at, status, copy')
        .eq('agency_id', aid)
        .order('created_at', { ascending: false })

      if (data) {
        const formattedPosts: Post[] = data
          .filter(post => post.copy)
          .map((post) => ({
            id: post.id,
            pillar: post.pillar || '',
            platform: post.platform || 'facebook',
            scheduledDate: post.scheduled_date,
            createdAt: post.created_at,
            status: (post.status as PostStatus) || 'ready',
            copy: post.copy || ''
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

  const handleReplicate = async (post: Post, targetPlatform: string) => {
    if (!agencyId) return
    setReplicatingId(post.id)

    const { data: agency } = await supabase
      .from('agencies')
      .select('name, city')
      .eq('id', agencyId)
      .single()

    if (!agency) {
      setReplicatingId(null)
      return
    }

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        checkinResponse: post.copy,
        agencyName: agency.name,
        agencyCity: agency.city,
        pillar: post.pillar,
        platform: targetPlatform
      })
    })

    if (!response.ok) {
      setReplicatingId(null)
      return
    }

    const { copy } = await response.json()

    const { data: newPost } = await supabase
      .from('posts')
      .insert({
        agency_id: agencyId,
        pillar: post.pillar,
        platform: targetPlatform,
        scheduled_date: post.scheduledDate,
        status: 'ready',
        copy: copy
      })
      .select()
      .single()

    if (newPost) {
      setPosts(prev => [{
        id: newPost.id,
        pillar: newPost.pillar,
        platform: newPost.platform,
        scheduledDate: newPost.scheduled_date,
        createdAt: newPost.created_at,
        status: newPost.status as PostStatus,
        copy: newPost.copy
      }, ...prev])
    }

    setReplicatingId(null)
  }

  const getAvailablePlatforms = (post: Post) => {
    const usedPlatforms = posts
      .filter(p => p.scheduledDate === post.scheduledDate)
      .map(p => p.platform)
    return allPlatforms.filter(p => !usedPlatforms.includes(p))
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short'
    })
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto py-8">
          <h1 className="text-2xl font-semibold text-[#1a365d] mb-8">Planning</h1>
          <p className="text-sm text-gray-700">...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-2xl font-semibold text-[#1a365d] mb-8">Planning</h1>

        <div className="space-y-3">
          {posts.map((post) => {
            const availablePlatforms = getAvailablePlatforms(post)
            const isReplicating = replicatingId === post.id
            const isCopied = post.status === 'copied' || post.status === 'published'

            return (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  {/* Data */}
                  <div className="w-16 text-center flex-shrink-0">
                    <span className="text-xs text-gray-500">
                      {formatDate(post.createdAt)}
                    </span>
                  </div>

                  {/* Piattaforma */}
                  <div className="w-20 flex-shrink-0">
                    <span className="text-xs text-gray-400 capitalize">
                      {platformLabels[post.platform] || post.platform}
                    </span>
                  </div>

                  {/* Post preview */}
                  <div
                    onClick={() => handlePostClick(post.id)}
                    className="flex-1 cursor-pointer"
                  >
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {post.copy}
                    </p>
                  </div>

                  {/* Stato copia - doppia spunta */}
                  <div className="flex-shrink-0 ml-2">
                    <CheckIcon copied={isCopied} />
                  </div>
                </div>

                {/* Replica su altre piattaforme */}
                {availablePlatforms.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Replica su</span>
                      {isReplicating ? (
                        <span className="text-xs text-gray-500">...</span>
                      ) : (
                        availablePlatforms.map(p => (
                          <button
                            key={p}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleReplicate(post, p)
                            }}
                            className="px-2 py-0.5 text-xs text-gray-400 hover:text-[#1a365d] hover:bg-gray-50 rounded transition-colors"
                          >
                            {platformLabels[p]}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </Card>
            )
          })}

          {posts.length === 0 && (
            <Card>
              <p className="text-sm text-gray-500 text-center py-4">
                Nessun post generato. Inizia dal check-in.
              </p>
            </Card>
          )}
        </div>
      </div>
    </main>
  )
}
