'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Input from '@/components/Input'
import { supabase } from '@/lib/supabaseClient'
import { getSession, getOrCreateUserAgency } from '@/lib/auth'

export default function CheckinPage() {
  const [response, setResponse] = useState('')
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
      router.push(`/response?type=novita&text=${encodeURIComponent(response)}`)
    } else {
      router.push('/response?type=nessuna')
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
              placeholder=""
              multiline={true}
              className="mb-6"
            />

            <Button type="submit" variant="primary">
              Avanti
            </Button>
          </form>
        </Card>
      </div>
    </main>
  )
}
