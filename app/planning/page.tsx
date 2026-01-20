'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/Card'
import { supabase } from '@/lib/supabaseClient'
import { getSession, getOrCreateUserAgency } from '@/lib/auth'
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
}

interface ActionsDone {
  copied: boolean
  social: boolean
  whatsapp: boolean
  lastActionAt: string | null
}

// Icona doppia spunta stile WhatsApp
function CheckIcon() {
  return (
    <svg
      width="20"
      height="14"
      viewBox="0 0 20 14"
      fill="none"
      className="text-blue-500"
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

const allPlatforms = ['facebook', 'instagram', 'linkedin', 'tiktok', 'x'] as const

// Colori brand leggerissimi per sfondo card
const platformBgColors: Record<string, string> = {
  facebook: 'bg-[#1877F2]/5',
  instagram: 'bg-[#E4405F]/5',
  linkedin: 'bg-[#0A66C2]/5',
  tiktok: 'bg-[#000000]/5',
  x: 'bg-[#000000]/5'
}


export default function PlanningPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [replicatingId, setReplicatingId] = useState<string | null>(null)
  const [agencyId, setAgencyId] = useState<string | null>(null)
  const [profile, setProfile] = useState<AgencyProfile | null>(null)
  const [actionsDone, setActionsDone] = useState<Record<string, ActionsDone>>({})
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

  const markAction = (postId: string, action: 'copied' | 'social' | 'whatsapp') => {
    const now = new Date().toISOString()
    setActionsDone(prev => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        [action]: true,
        lastActionAt: now
      }
    }))
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

  const handleDelete = async (postId: string) => {
    await supabase
      .from('posts')
      .delete()
      .eq('id', postId)

    setPosts(prev => prev.filter(p => p.id !== postId))
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
            className="text-sm text-gray-400 hover:text-[#1a365d] transition-colors"
          >
            La tua rotta
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
            const bgColor = platformBgColors[post.platform] || ''

            return (
              <Card key={post.id} className={`hover:shadow-md transition-shadow ${bgColor}`}>
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

                  {/* Spunta con data ultima azione */}
                  {actionsDone[post.id]?.lastActionAt && (
                    <div className="flex-shrink-0 ml-2 flex flex-col items-center">
                      <CheckIcon />
                      <span className="text-[10px] text-gray-400 mt-0.5">
                        {formatDateTime(actionsDone[post.id].lastActionAt!)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Replica su altre piattaforme (solo se non copiato) + Azioni */}
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
                      {/* Copia */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCopy(post)
                          markAction(post.id, 'copied')
                        }}
                        className={`p-1.5 border rounded transition-colors ${
                          actionsDone[post.id]?.copied
                            ? 'text-blue-500 border-blue-500 bg-blue-50'
                            : 'text-gray-400 border-gray-200 hover:border-[#1a365d] hover:text-[#1a365d]'
                        }`}
                        title="Copia"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      {/* Social del post attuale */}
                      {post.platform === 'facebook' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            const text = encodeURIComponent(post.copy)
                            window.open(`https://www.facebook.com/sharer/sharer.php?quote=${text}`, '_blank')
                            markAction(post.id, 'social')
                          }}
                          className={`p-1.5 border rounded transition-colors ${
                            actionsDone[post.id]?.social
                              ? 'text-[#1877F2] border-[#1877F2] bg-[#1877F2]/10'
                              : 'text-gray-400 border-gray-200 hover:border-[#1877F2] hover:text-[#1877F2]'
                          }`}
                          title="Condividi su Facebook"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        </button>
                      )}
                      {post.platform === 'x' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            const text = encodeURIComponent(post.copy)
                            window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
                            markAction(post.id, 'social')
                          }}
                          className={`p-1.5 border rounded transition-colors ${
                            actionsDone[post.id]?.social
                              ? 'text-black border-black bg-gray-100'
                              : 'text-gray-400 border-gray-200 hover:border-black hover:text-black'
                          }`}
                          title="Condividi su X"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                        </button>
                      )}
                      {post.platform === 'linkedin' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            const text = encodeURIComponent(post.copy)
                            window.open(`https://www.linkedin.com/sharing/share-offsite/?url=&summary=${text}`, '_blank')
                            markAction(post.id, 'social')
                          }}
                          className={`p-1.5 border rounded transition-colors ${
                            actionsDone[post.id]?.social
                              ? 'text-[#0A66C2] border-[#0A66C2] bg-[#0A66C2]/10'
                              : 'text-gray-400 border-gray-200 hover:border-[#0A66C2] hover:text-[#0A66C2]'
                          }`}
                          title="Condividi su LinkedIn"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </button>
                      )}
                      {/* WhatsApp */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          const text = encodeURIComponent(post.copy)
                          window.open(`https://wa.me/?text=${text}`, '_blank')
                          markAction(post.id, 'whatsapp')
                        }}
                        className={`p-1.5 border rounded transition-colors ${
                          actionsDone[post.id]?.whatsapp
                            ? 'text-[#25D366] border-[#25D366] bg-[#25D366]/10'
                            : 'text-gray-400 border-gray-200 hover:border-[#25D366] hover:text-[#25D366]'
                        }`}
                        title="Condividi su WhatsApp"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      </button>
                      {/* Cestino */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(post.id)
                        }}
                        className="p-1.5 text-gray-400 border border-gray-200 rounded hover:border-red-500 hover:text-red-500 transition-colors"
                        title="Elimina"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
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
