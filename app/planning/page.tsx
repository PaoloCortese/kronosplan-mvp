'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/Card'
import { supabase } from '@/lib/supabaseClient'
import { getSession, getOrCreateUserAgency } from '@/lib/auth'
import { platformIcons } from '@/components/SocialIcons'

type PostStatus = 'ready' | 'copied' | 'published'

interface Post {
  id: string
  pillar: string
  platform: string
  scheduledDate: string
  createdAt: string
  status: PostStatus
  copy: string
  copiedAt: string | null
}

const allPlatforms = ['facebook', 'instagram', 'linkedin', 'tiktok', 'x'] as const

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
        .select('id, pillar, platform, scheduled_date, created_at, status, copy, copied_at')
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
            copy: post.copy || '',
            copiedAt: post.copied_at || null
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
        copy: newPost.copy,
        copiedAt: newPost.copied_at || null
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

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString('it-IT', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleCopy = async (post: Post) => {
    try {
      await navigator.clipboard.writeText(post.copy)
      const now = new Date().toISOString()

      await supabase
        .from('posts')
        .update({ status: 'copied', copied_at: now })
        .eq('id', post.id)

      setPosts(prev => prev.map(p =>
        p.id === post.id
          ? { ...p, status: 'copied' as PostStatus, copiedAt: now }
          : p
      ))
    } catch (error) {
      console.error('Copy failed:', error)
    }
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

                  {/* Piattaforma - icona simbolo */}
                  <div className="w-8 flex-shrink-0">
                    {(() => {
                      const IconComponent = platformIcons[post.platform as keyof typeof platformIcons]
                      return IconComponent ? (
                        <IconComponent className="w-4 h-4 text-gray-400" />
                      ) : (
                        <span className="text-xs text-gray-400">{post.platform}</span>
                      )
                    })()}
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

                  {/* Stato copia - doppia spunta + data/ora */}
                  <div className="flex-shrink-0 ml-2 flex flex-col items-center">
                    <CheckIcon copied={isCopied} />
                    {isCopied && post.copiedAt && (
                      <span className="text-[10px] text-gray-400 mt-0.5">
                        {formatDateTime(post.copiedAt)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Replica su altre piattaforme + Copia */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {availablePlatforms.length > 0 && (
                        <>
                          <span className="text-xs text-gray-400">Replica su</span>
                          {isReplicating ? (
                            <span className="text-xs text-gray-500">...</span>
                          ) : (
                            availablePlatforms.map(p => {
                              const IconComponent = platformIcons[p as keyof typeof platformIcons]
                              return (
                                <button
                                  key={p}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleReplicate(post, p)
                                  }}
                                  className="p-1.5 text-gray-400 hover:text-[#1a365d] hover:bg-gray-50 rounded transition-colors"
                                  title={p.charAt(0).toUpperCase() + p.slice(1)}
                                >
                                  <IconComponent className="w-4 h-4" />
                                </button>
                              )
                            })
                          )}
                        </>
                      )}
                    </div>
                    {!isCopied && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCopy(post)
                        }}
                        className="px-3 py-1 text-xs text-[#1a365d] border border-[#1a365d] rounded hover:bg-[#1a365d]/5 transition-colors"
                      >
                        Copia
                      </button>
                    )}
                  </div>
                </div>
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
