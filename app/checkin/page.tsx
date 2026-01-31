'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Input from '@/components/Input'
import { supabase } from '@/lib/supabaseClient'
import { getSession } from '@/lib/auth'
import { getAgencyProfile } from '@/lib/agencyProfile'
import { platformIconsExtended } from '@/components/SocialIcons'
import { createThumbnail, savePendingThumb, clearPendingThumb } from '@/lib/imageUtils'

const platforms = ['facebook', 'instagram', 'linkedin', 'tiktok', 'x'] as const

export default function CheckinPage() {
  const [response, setResponse] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState('facebook')
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoProcessing, setPhotoProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      const session = await getSession()
      if (!session) {
        router.push('/')
        return
      }

      const profile = await getAgencyProfile(session.user.id)
      if (!profile) {
        router.push('/onboarding')
        return
      }

      setUserId(session.user.id)
      setLoading(false)

      // Clear any pending thumb from previous session
      clearPendingThumb().catch(() => {})
    }
    checkAuth()
  }, [router])

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPhotoProcessing(true)
    try {
      // Create thumbnail (512px max, <200KB)
      const thumbBlob = await createThumbnail(file)

      // Save to IndexedDB
      await savePendingThumb(thumbBlob)

      // Create preview URL
      const previewUrl = URL.createObjectURL(thumbBlob)
      setPhotoPreview(previewUrl)
    } catch (error) {
      console.error('Error processing photo:', error)
    } finally {
      setPhotoProcessing(false)
    }
  }

  const handleRemovePhoto = async () => {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview)
    }
    setPhotoPreview(null)
    await clearPendingThumb()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    const hasNews = response.trim().length > 0 &&
                    !response.toLowerCase().match(/^(niente|nulla|no|nothing)\.?$/i)

    const today = new Date()
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay() + 1))

    await supabase.from('checkins').insert({
      user_id: userId,
      week_start: weekStart.toISOString().split('T')[0],
      response: response.trim() || null
    })

    // Pass hasPhoto flag via URL param
    const hasPhoto = photoPreview !== null
    if (hasNews) {
      router.push(`/response?type=novita&text=${encodeURIComponent(response)}&platform=${selectedPlatform}${hasPhoto ? '&photo=1' : ''}`)
    } else {
      router.push(`/response?type=nessuna&platform=${selectedPlatform}`)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-start justify-center p-4 pt-20">
        <Card><p className="text-sm text-gray-700">...</p></Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white flex items-start justify-center p-4 pt-20">
      <div className="w-full max-w-2xl">
        <Card>
          <form onSubmit={handleSubmit}>
            <p className="text-sm text-gray-700 mb-6">
              {new Date().getDay() === 1 ? 'Buon lunedì. ' : ''}Qualche novità dalla settimana scorsa?
            </p>

            <Input
              value={response}
              onChange={setResponse}
              placeholder="Sara ha chiuso la sua prima vendita..."
              multiline={true}
              className="mb-4"
            />

            {/* Photo picker */}
            <div className="mb-6">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
                id="photo-input"
              />

              {!photoPreview ? (
                <label
                  htmlFor="photo-input"
                  className="inline-flex items-center gap-2 px-3 py-2 text-xs text-gray-600 border border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 hover:text-gray-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                  </svg>
                  {photoProcessing ? 'Elaborazione...' : 'Aggiungi foto'}
                </label>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    Rimuovi
                  </button>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-500 mb-3">Pubblica su</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {platforms.map((p) => {
                const IconComponent = platformIconsExtended[p]
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSelectedPlatform(p)}
                    className={`px-3 py-2 rounded-lg border transition-all ${
                      selectedPlatform === p
                        ? 'border-[#1a365d] bg-[#1a365d]/5 text-[#1a365d]'
                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <IconComponent />
                  </button>
                )
              })}
            </div>

            <Button type="submit" variant="primary">
              Avanti
            </Button>
          </form>
        </Card>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => router.push('/profile')}
            className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:border-gray-300 hover:text-gray-700 text-sm transition-all"
          >
            Profilo agenzia
          </button>
        </div>
      </div>
    </main>
  )
}
