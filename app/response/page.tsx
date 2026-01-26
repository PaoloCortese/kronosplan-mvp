'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import Card from '@/components/Card'
import Button from '@/components/Button'
import { supabase } from '@/lib/supabaseClient'
import { getSession } from '@/lib/auth'
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

    const { data: newPost, error: insertError } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
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
