'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Input from '@/components/Input'
import { supabase } from '@/lib/supabaseClient'
import { getSession, getOrCreateUserAgency } from '@/lib/auth'

const platforms = [
  { id: 'facebook', label: 'Facebook' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'x', label: 'X' },
]

export default function CheckinPage() {
  const [response, setResponse] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState('facebook')
  const [agencyId, setAgencyId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      const session = await getSession()
      if (!session) {
        router.push('/')
        return
      }
      const aid = await getOrCreateUserAgency()
      setAgencyId(aid)
      setLoading(false)
    }
    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agencyId) return

    const hasNews = response.trim().length > 0 &&
                    !response.toLowerCase().match(/^(niente|nulla|no|nothing)\.?$/i)

    const today = new Date()
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay() + 1))

    await supabase.from('checkins').insert({
      agency_id: agencyId,
      week_start: weekStart.toISOString().split('T')[0],
      response: response.trim() || null
    })

    if (hasNews) {
      router.push(`/response?type=novita&text=${encodeURIComponent(response)}&platform=${selectedPlatform}`)
    } else {
      router.push(`/response?type=nessuna&platform=${selectedPlatform}`)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card><p className="text-sm text-gray-700">...</p></Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card>
          <form onSubmit={handleSubmit}>
            <p className="text-sm text-gray-700 mb-6">
              Buon lunedì. Qualche novità dalla settimana scorsa?
            </p>

            <Input
              value={response}
              onChange={setResponse}
              placeholder="Sara ha chiuso la sua prima vendita..."
              multiline={true}
              className="mb-6"
            />

            <p className="text-xs text-gray-500 mb-3">Pubblica su</p>
            <div className="flex gap-2 mb-6">
              {platforms.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPlatform(p.id)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                    selectedPlatform === p.id
                      ? 'border-[#1a365d] bg-[#1a365d]/5 text-[#1a365d]'
                      : 'border-gray-200 text-gray-400 hover:border-gray-300'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <Button type="submit" variant="primary">
              Avanti
            </Button>
          </form>
        </Card>
      </div>
    </main>
  )
}
