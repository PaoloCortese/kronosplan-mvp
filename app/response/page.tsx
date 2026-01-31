'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import Card from '@/components/Card'
import Button from '@/components/Button'
import { supabase } from '@/lib/supabaseClient'
import { getSession } from '@/lib/auth'
import { getPendingThumb, clearPendingThumb, generateUUID } from '@/lib/imageUtils'

function ResponseContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const type = searchParams.get('type')
  const text = searchParams.get('text')
  const platform = searchParams.get('platform') || 'facebook'
  const hasPhoto = searchParams.get('photo') === '1'
  const [generating, setGenerating] = useState(false)
  const [postId, setPostId] = useState<string | null>(null)
  const [postCopy, setPostCopy] = useState<string | null>(null)
  const [generationError, setGenerationError] = useState(false)

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

    const userId = session.user.id

    // Get agency details from agency_profiles
    const { data: profile } = await supabase
      .from('agency_profiles')
      .select('agency_name, city_area')
      .eq('user_id', userId)
      .single()

    if (!profile) {
      router.push('/onboarding')
      return
    }

    const agency = {
      name: profile.agency_name,
      city: profile.city_area
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

    // Calcola visible_until (created_at + 60 giorni)
    const visibleUntil = new Date()
    visibleUntil.setDate(visibleUntil.getDate() + 60)

    // Generate UUID for post_id (needed before upload)
    const newPostId = generateUUID()

    // Handle photo upload if present
    let imageThumbPath: string | null = null
    if (hasPhoto) {
      try {
        const thumbBlob = await getPendingThumb()
        if (thumbBlob) {
          // Upload to storage: post_thumbs/{user_id}/{post_id}.webp
          const storagePath = `post_thumbs/${userId}/${newPostId}.webp`

          const { error: uploadError } = await supabase.storage
            .from('post-images')
            .upload(storagePath, thumbBlob, {
              contentType: 'image/webp',
              upsert: false
            })

          if (!uploadError) {
            imageThumbPath = storagePath
          } else {
            console.error('Upload error:', uploadError)
          }

          // Clear pending thumb regardless of success
          await clearPendingThumb()
        }
      } catch (error) {
        console.error('Error handling photo:', error)
        await clearPendingThumb()
      }
    }

    // Insert post with pre-generated UUID
    const insertData: Record<string, unknown> = {
      id: newPostId,
      user_id: userId,
      pillar: 'chi_siamo',
      platform: platform,
      scheduled_date: weekStartStr,
      status: 'ready',
      copy: copy,
      visible_until: visibleUntil.toISOString()
    }

    // Add image fields only if we have a thumbnail
    if (imageThumbPath) {
      insertData.image_thumb_path = imageThumbPath
      insertData.image_expires_at = visibleUntil.toISOString()
    }

    const { data: newPost, error: insertError } = await supabase
      .from('posts')
      .insert(insertData)
      .select('id, copy')
      .single()

    if (insertError || !newPost) {
      console.error('Insert error:', insertError)
      setGenerationError(true)
      setGenerating(false)
      return
    }

    setPostId(newPost.id)
    setPostCopy(newPost.copy)
    setGenerating(false)
  }

  if (type === 'novita') {
    if (generationError) {
      return (
        <Card>
          <p className="text-sm text-gray-700 mb-6">
            Si è verificato un errore nella generazione del post. Controlla la console per i dettagli.
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

          <div className="flex justify-end">
            <button
              onClick={() => window.location.href = '/planning'}
              className="text-xs text-[#1a365d] hover:underline"
            >
              Vai al planning →
            </button>
          </div>
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
