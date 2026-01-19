'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/Card'
import Button from '@/components/Button'
import { supabase } from '@/lib/supabaseClient'
import { getSession, getOrCreateUserAgency } from '@/lib/auth'

export default function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params)
  const [copied, setCopied] = useState(false)
  const [postCopy, setPostCopy] = useState('')
  const [loading, setLoading] = useState(true)
  const [agencyId, setAgencyId] = useState<string | null>(null)
  const [copyError, setCopyError] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function fetchPost() {
      const session = await getSession()
      if (!session) {
        router.push('/')
        return
      }

      const aid = await getOrCreateUserAgency()
      setAgencyId(aid)

      const { data } = await supabase
        .from('posts')
        .select('copy')
        .eq('id', unwrappedParams.id)
        .eq('agency_id', aid)
        .single()

      if (data && data.copy) {
        setPostCopy(data.copy)
        setLoading(false)
      } else {
        setNotFound(true)
        setLoading(false)
      }
    }

    fetchPost()
  }, [unwrappedParams.id, router])

  // Redirect di sicurezza se post non trovato
  useEffect(() => {
    if (notFound) {
      const timeout = setTimeout(() => {
        router.push('/planning')
      }, 2000)
      return () => clearTimeout(timeout)
    }
  }, [notFound, router])

  const handleCopy = async () => {
    setCopyError(false)
    try {
      await navigator.clipboard.writeText(postCopy)

      // Aggiorna stato post a 'copied'
      await supabase
        .from('posts')
        .update({ status: 'copied' })
        .eq('id', unwrappedParams.id)
        .eq('agency_id', agencyId)

      setCopied(true)

      // Reset dopo 2 secondi
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch {
      setCopyError(true)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Card>
            <p className="text-sm text-gray-700">Sto aprendo il post...</p>
          </Card>
        </div>
      </main>
    )
  }

  if (notFound) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Card>
            <p className="text-sm text-gray-700 mb-6">
              Il post non è disponibile. Torna al calendario.
            </p>
            <Button
              variant="primary"
              onClick={() => router.push('/planning')}
            >
              Torna al calendario
            </Button>
          </Card>
        </div>
      </main>
    )
  }

  if (copied) {
    // S4: Post copiato
    return (
      <main className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Card>
            <p className="text-sm text-gray-700 mb-4">Copiato.</p>
            <p className="text-sm text-gray-700">Fatto.</p>
          </Card>
        </div>
      </main>
    )
  }

  // S3: Visualizzazione post
  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card>
          <p className="text-sm text-gray-500 mb-4">Copia e pubblica.</p>
          <div className="mb-6">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
{postCopy}
            </pre>
          </div>

          <Button variant="primary" onClick={handleCopy}>
            Copia
          </Button>
          {copyError && (
            <p className="text-sm text-red-600 mt-4">Non è stato possibile copiare. Riprova.</p>
          )}
        </Card>
      </div>
    </main>
  )
}
