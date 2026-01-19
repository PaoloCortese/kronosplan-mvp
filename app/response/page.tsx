'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import Card from '@/components/Card'
import Button from '@/components/Button'
import { supabase } from '@/lib/supabaseClient'
import { getSession, getOrCreateUserAgency } from '@/lib/auth'
import { platformIcons } from '@/components/SocialIcons'

const allPlatforms = ['facebook', 'instagram', 'linkedin', 'tiktok', 'x'] as const

function ResponseContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const type = searchParams.get('type')
  const text = searchParams.get('text')
  const platform = searchParams.get('platform') || 'facebook'
  const [generating, setGenerating] = useState(false)
  const [postId, setPostId] = useState<string | null>(null)
  const [postCopy, setPostCopy] = useState<string | null>(null)
  const [generationError, setGenerationError] = useState(false)
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null)
  const [copyError, setCopyError] = useState(false)

  useEffect(() => {
    if (type === 'novita' && text && !postId && !generating) {
      generatePost()
    }
  }, [type, text, postId, generating])

  async function generatePost() {
    setGenerating(true)

    const session = await getSession()
    if (!session) {
      router.push('/')
      return
    }

    const agencyId = await getOrCreateUserAgency()
    if (!agencyId) {
      setGenerationError(true)
      return
    }

    // Get agency details
    const { data: agency } = await supabase
      .from('agencies')
      .select('name, city')
      .eq('id', agencyId)
      .single()

    if (!agency) {
      setGenerationError(true)
      return
    }

    // Get current week start
    const today = new Date()
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay() + 1))
    const weekStartStr = weekStart.toISOString().split('T')[0]

    // Generate copy via API route
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        checkinResponse: text,
        agencyName: agency.name,
        agencyCity: agency.city,
        pillar: 'chi_siamo',
        platform: platform
      })
    })

    if (!response.ok) {
      setGenerationError(true)
      setGenerating(false)
      return
    }

    const { copy } = await response.json()

    // Create new post with generated copy
    const { data: newPost, error: insertError } = await supabase
      .from('posts')
      .insert({
        agency_id: agencyId,
        pillar: 'chi_siamo',
        platform: platform,
        scheduled_date: weekStartStr,
        status: 'ready',
        copy: copy
      })
      .select('id, copy')
      .single()

    if (insertError || !newPost) {
      setGenerationError(true)
      setGenerating(false)
      return
    }

    setPostId(newPost.id)
    setPostCopy(newPost.copy)
    setGenerating(false)
  }

  const handleCopy = async (targetPlatform: string) => {
    if (!postCopy || !postId) return
    setCopyError(false)
    try {
      await navigator.clipboard.writeText(postCopy)

      // Aggiorna stato post a 'copied' con timestamp
      await supabase
        .from('posts')
        .update({ status: 'copied', copied_at: new Date().toISOString() })
        .eq('id', postId)

      setCopiedPlatform(targetPlatform)
    } catch {
      setCopyError(true)
    }
  }

  if (type === 'novita') {
    if (generationError) {
      return (
        <Card>
          <p className="text-sm text-gray-700 mb-6">
            Ok. I post di questa settimana sono nel calendario.
          </p>
          <Button
            variant="primary"
            onClick={() => window.location.href = '/planning'}
          >
            Vai al planning
          </Button>
        </Card>
      )
    }

    if (postId && postCopy) {
      return (
        <Card>
          <div className="mb-6">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
{postCopy}
            </pre>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">Copia su</span>
              {allPlatforms.map(p => {
                const IconComponent = platformIcons[p]
                return (
                  <button
                    key={p}
                    onClick={() => handleCopy(p)}
                    className={`p-1.5 rounded transition-colors ${
                      copiedPlatform === p
                        ? 'text-blue-500 bg-blue-50'
                        : 'text-gray-400 hover:text-[#1a365d] hover:bg-gray-50'
                    }`}
                    title={p.charAt(0).toUpperCase() + p.slice(1)}
                  >
                    <IconComponent className="w-4 h-4" />
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => window.location.href = '/planning'}
              className="text-xs text-[#1a365d] hover:underline"
            >
              Vai al planning →
            </button>
          </div>
          {copyError && (
            <p className="text-sm text-red-600 mt-4">Non è stato possibile copiare. Riprova.</p>
          )}
        </Card>
      )
    }

    return (
      <Card>
        <p className="text-sm text-gray-700 mb-4">Sto preparando il post...</p>
        <div className="flex items-center justify-center py-4">
          <div className="w-6 h-6 border-2 border-[#1a365d] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Card>
    )
  }

  if (type === 'nessuna') {
    // S2b: Nessuna novità
    return (
      <Card>
        <p className="text-sm text-gray-700 mb-6">
          Ok. I post di questa settimana sono nel calendario.
        </p>

        <Button
          variant="primary"
          onClick={() => window.location.href = '/planning'}
        >
          Vai al planning
        </Button>
      </Card>
    )
  }

  return null
}

export default function ResponsePage() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Suspense fallback={<Card><p className="text-sm text-gray-700">...</p></Card>}>
          <ResponseContent />
        </Suspense>
      </div>
    </main>
  )
}
