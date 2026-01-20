'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/Card'
import Button from '@/components/Button'
import { supabase } from '@/lib/supabaseClient'
import { getSession, getOrCreateUserAgency } from '@/lib/auth'

export default function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params)
  const [postCopy, setPostCopy] = useState('')
  const [originalCopy, setOriginalCopy] = useState('')
  const [loading, setLoading] = useState(true)
  const [agencyId, setAgencyId] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
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
        setOriginalCopy(data.copy)
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

  const handleSave = async () => {
    if (!agencyId) return
    setSaving(true)

    await supabase
      .from('posts')
      .update({ copy: postCopy })
      .eq('id', unwrappedParams.id)
      .eq('agency_id', agencyId)

    setOriginalCopy(postCopy)
    setSaving(false)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setPostCopy(originalCopy)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (!agencyId) return
    if (!confirm('Sei sicuro di voler eliminare questo post?')) return

    setDeleting(true)

    await supabase
      .from('posts')
      .delete()
      .eq('id', unwrappedParams.id)
      .eq('agency_id', agencyId)

    router.push('/planning')
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
              Il post non è disponibile. Torna al planning.
            </p>
            <Button
              variant="primary"
              onClick={() => router.push('/planning')}
            >
              Torna al planning
            </Button>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card>
          <div className="mb-6">
            {isEditing ? (
              <textarea
                value={postCopy}
                onChange={(e) => setPostCopy(e.target.value)}
                className="w-full h-48 p-3 text-sm text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d]/20 focus:border-[#1a365d] resize-none"
              />
            ) : (
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
{postCopy}
              </pre>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {isEditing ? (
              <>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Salvataggio...' : 'Salva'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Annulla
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="primary"
                  onClick={() => setIsEditing(true)}
                >
                  Modifica
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Eliminazione...' : 'Elimina'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => router.push('/planning')}
                >
                  Torna al planning
                </Button>
              </>
            )}
          </div>
        </Card>
      </div>
    </main>
  )
}
