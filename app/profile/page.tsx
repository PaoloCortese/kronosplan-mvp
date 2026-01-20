'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Input from '@/components/Input'
import { getSession } from '@/lib/auth'
import { getAgencyProfile, upsertAgencyProfile, upsertAgencyPillars } from '@/lib/agencyProfile'

export default function ProfilePage() {
  const [agencyName, setAgencyName] = useState('')
  const [cityArea, setCityArea] = useState('')
  const [pillarChi, setPillarChi] = useState('')
  const [pillarCosa, setPillarCosa] = useState('')
  const [pillarDove, setPillarDove] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function loadProfile() {
      const session = await getSession()
      if (!session) {
        router.push('/')
        return
      }

      setUserId(session.user.id)

      const profile = await getAgencyProfile(session.user.id)
      if (!profile) {
        router.push('/onboarding')
        return
      }

      setAgencyName(profile.agency_name || '')
      setCityArea(profile.city_area || '')
      setPillarChi(profile.pillar_chi || '')
      setPillarCosa(profile.pillar_cosa || '')
      setPillarDove(profile.pillar_dove || '')

      setLoading(false)
    }
    loadProfile()
  }, [router])

  const handleSave = async () => {
    if (!userId) return

    setError('')
    setSuccess('')

    if (!agencyName.trim()) {
      setError('Il nome agenzia è obbligatorio.')
      return
    }
    if (!cityArea.trim()) {
      setError('La città è obbligatoria.')
      return
    }

    setSaving(true)

    // Salva dati agenzia
    const profileResult = await upsertAgencyProfile(userId, {
      agency_name: agencyName.trim(),
      city_area: cityArea.trim(),
      factual_description: ''
    })

    if (!profileResult.success) {
      setError('Errore nel salvataggio. Riprova.')
      setSaving(false)
      return
    }

    // Salva pillar (se compilati)
    if (pillarChi.trim() || pillarCosa.trim() || pillarDove.trim()) {
      const pillarsResult = await upsertAgencyPillars(userId, {
        pillar_chi: pillarChi.trim(),
        pillar_cosa: pillarCosa.trim(),
        pillar_dove: pillarDove.trim()
      })

      if (!pillarsResult.success) {
        setError('Errore nel salvataggio dei pillar. Riprova.')
        setSaving(false)
        return
      }
    }

    setSaving(false)
    setSuccess('Salvato.')
    setTimeout(() => setSuccess(''), 2000)
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
      <div className="w-full max-w-md">
        <Card>
          <p className="text-sm font-medium text-gray-800 mb-6">Profilo agenzia</p>

          {/* Dati base */}
          <div className="mb-6">
            <p className="text-xs text-gray-500 mb-2">Nome agenzia</p>
            <Input
              value={agencyName}
              onChange={setAgencyName}
              placeholder="Es. Immobiliare Rossi"
              className="mb-4"
            />

            <p className="text-xs text-gray-500 mb-2">Città / Zona</p>
            <Input
              value={cityArea}
              onChange={setCityArea}
              placeholder="Es. Milano, zona Navigli"
            />
          </div>

          {/* Separatore */}
          <div className="border-t border-gray-100 my-6" />

          {/* Pillar */}
          <p className="text-xs text-gray-400 mb-4">PILLAR (opzionali, migliorano i contenuti)</p>

          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Chi siamo</p>
            <Input
              value={pillarChi}
              onChange={setPillarChi}
              placeholder="Descrivi le persone, i valori o l'atmosfera..."
              multiline={true}
              className="mb-1"
            />
            <p className="text-xs text-gray-400">{pillarChi.length}/280</p>
          </div>

          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Cosa facciamo</p>
            <Input
              value={pillarCosa}
              onChange={setPillarCosa}
              placeholder="Descrivi le attività e competenze..."
              multiline={true}
              className="mb-1"
            />
            <p className="text-xs text-gray-400">{pillarCosa.length}/280</p>
          </div>

          <div className="mb-6">
            <p className="text-xs text-gray-500 mb-2">Dove operiamo</p>
            <Input
              value={pillarDove}
              onChange={setPillarDove}
              placeholder="Descrivi il territorio o la zona..."
              multiline={true}
              className="mb-1"
            />
            <p className="text-xs text-gray-400">{pillarDove.length}/280</p>
          </div>

          {error && (
            <p className="text-sm text-red-600 mb-4">{error}</p>
          )}

          {success && (
            <p className="text-sm text-green-600 mb-4">{success}</p>
          )}

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => router.back()}
              disabled={saving}
            >
              Indietro
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving}
              className="flex-1"
            >
              {saving ? 'Salvataggio...' : 'Salva'}
            </Button>
          </div>
        </Card>
      </div>
    </main>
  )
}
