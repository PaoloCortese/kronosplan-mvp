'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/Card'
import { supabase } from '@/lib/supabaseClient'
import { getSession } from '@/lib/auth'
import { getAgencyProfile, hasPillars, AgencyProfile } from '@/lib/agencyProfile'
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
  waSharedAt: string | null
}

const allPlatforms = ['facebook', 'instagram', 'linkedin', 'tiktok', 'x'] as const

// Colori brand per piattaforma (sfondo soft)
const platformColors: Record<string, string> = {
  facebook: 'bg-[#1877F2]/5',
  instagram: 'bg-[#E4405F]/5',
  linkedin: 'bg-[#0A66C2]/5',
  tiktok: 'bg-[#000000]/5',
  x: 'bg-[#000000]/5'
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
  const [userId, setUserId] = useState<string | null>(null)
  const [profile, setProfile] = useState<AgencyProfile | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchPosts() {
      const session = await getSession()
      if (!session) {
        router.push('/')
        return
      }

      const userProfile = await getAgencyProfile(session.user.id)
      if (!userProfile) {
        router.push('/onboarding')
        return
      }
      setProfile(userProfile)
      setUserId(session.user.id)

      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching posts:', error)
      }

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
            copiedAt: post.copied_at || null,
            waSharedAt: post.wa_shared_at || null
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
    if (!userId || !profile) return
    setReplicatingId(post.id)

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        checkinResponse: post.copy,
        agencyName: profile.agency_name,
        agencyCity: profile.city_area,
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
        user_id: userId,
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
        copiedAt: newPost.copied_at || null,
        waSharedAt: newPost.wa_shared_at || null
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

  const handleWhatsApp = async (post: Post) => {
    const text = encodeURIComponent(post.copy)
    window.open(`https://wa.me/?text=${text}`, '_blank')

    const now = new Date().toISOString()
    try {
      await supabase
        .from('posts')
        .update({ wa_shared_at: now })
        .eq('id', post.id)
    } catch (e) {
      console.log('wa_shared_at column may not exist yet')
    }

    setPosts(prev => prev.map(p =>
      p.id === post.id ? { ...p, waSharedAt: now } : p
    ))
  }

  const handleDelete = async (post: Post) => {
    if (!userId) return
    if (!confirm('Sei sicuro di voler eliminare questo post?')) return

    await supabase
      .from('posts')
      .delete()
      .eq('id', post.id)
      .eq('user_id', userId)

    setPosts(prev => prev.filter(p => p.id !== post.id))
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-[#1a365d]">Planning</h1>
          <button
            onClick={() => router.push('/rotta')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-gray-400 border border-gray-200 rounded hover:border-[#1a365d] hover:text-[#1a365d] transition-colors"
            title="Bussola"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill="currentColor" opacity="0.3" />
              <path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36z" />
            </svg>
            <span className="text-xs">Bussola social</span>
          </button>
        </div>

        {!hasPillars(profile) && (
          <Card className="mb-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Pillar non impostati. Impostali per personalizzare meglio i contenuti.
              </p>
              <button
                onClick={() => router.push('/pillars')}
                className="px-3 py-1 text-xs text-[#1a365d] border border-[#1a365d] rounded hover:bg-[#1a365d]/5 transition-colors"
              >
                Imposta pillar
              </button>
            </div>
          </Card>
        )}

        <div className="space-y-3">
          {posts.map((post) => {
            const availablePlatforms = getAvailablePlatforms(post)
            const isReplicating = replicatingId === post.id
            const isCopied = post.status === 'copied' || post.status === 'published'

            const cardBg = platformColors[post.platform] || ''

            return (
              <Card key={post.id} className={`hover:shadow-md transition-shadow ${cardBg}`}>
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

                  {/* Stato copia - doppia spunta + data/ora (solo se copiato) */}
                  {isCopied && (
                    <div className="flex-shrink-0 ml-2 flex flex-col items-center">
                      <CheckIcon copied={true} />
                      {post.copiedAt && (
                        <span className="text-[10px] text-gray-400 mt-0.5">
                          {formatDateTime(post.copiedAt)}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Azioni: Replica + Copia + WhatsApp + Cestino */}
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
                    <div className="flex items-center gap-2">
                      {/* Copia - pulsante con testo */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCopy(post)
                        }}
                        className={`px-3 py-1 text-xs rounded transition-colors ${
                          isCopied
                            ? 'text-blue-500 border-2 border-blue-500 bg-blue-50'
                            : 'text-[#1a365d] border border-[#1a365d] hover:bg-[#1a365d]/5'
                        }`}
                      >
                        Copia
                      </button>
                      {/* WhatsApp con spunte sovrapposte */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleWhatsApp(post)
                        }}
                        className={`p-1.5 rounded transition-colors relative ${
                          post.waSharedAt
                            ? 'text-[#25D366] bg-green-50'
                            : 'text-gray-400 hover:text-[#25D366] hover:bg-green-50'
                        }`}
                        title="Condividi su WhatsApp"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        {post.waSharedAt && (
                          <svg
                            width="14"
                            height="10"
                            viewBox="0 0 20 14"
                            fill="none"
                            className="text-[#25D366] absolute -bottom-0.5 -right-1"
                          >
                            <path d="M1 7L5 11L13 3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M7 7L11 11L19 3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                    </div>
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
