'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Input from '@/components/Input'
import { getSession } from '@/lib/auth'
import { getAgencyProfile, upsertAgencyProfile } from '@/lib/agencyProfile'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [agencyName, setAgencyName] = useState('')
  const [cityArea, setCityArea] = useState('')
  const [factualDescription, setFactualDescription] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      const session = await getSession()
      if (!session) {
        router.push('/')
        return
      }

      setUserId(session.user.id)

      const profile = await getAgencyProfile(session.user.id)

      // Se arrivo da /checkin (link "Profilo agenzia"), permetto modifica
      const urlParams = new URLSearchParams(window.location.search)
      const isEditMode = urlParams.get('edit') === 'true'

      if (profile && !isEditMode) {
        router.push('/checkin')
        return
      }

      if (profile) {
        setAgencyName(profile.agency_name || '')
        setCityArea(profile.city_area || '')
        setFactualDescription(profile.factual_description || '')
      }

      setLoading(false)
    }
    checkAuth()
  }, [router])

  const validateStep = (): boolean => {
    setError('')

    if (step === 1) {
      if (!agencyName.trim()) {
        setError('Campo obbligatorio.')
        return false
      }
    }

    if (step === 2) {
      if (!cityArea.trim()) {
        setError('Campo obbligatorio.')
        return false
      }
    }

    if (step === 3) {
      if (!factualDescription.trim()) {
        setError('Campo obbligatorio.')
        return false
      }
      if (factualDescription.length > 280) {
        setError('Massimo 280 caratteri.')
        return false
      }
    }

    return true
  }

  const handleNext = () => {
    if (!validateStep()) return
    setStep(step + 1)
  }

  const handleBack = () => {
    setError('')
    setStep(step - 1)
  }

  const handleSave = async () => {
    if (!validateStep()) return
    if (!userId) return

    setSaving(true)
    setError('')

    const result = await upsertAgencyProfile(userId, {
      agency_name: agencyName.trim(),
      city_area: cityArea.trim(),
      factual_description: factualDescription.trim()
    })

    if (!result.success) {
      console.error('Errore salvataggio:', result.error)
      setError(result.error || 'Qualcosa non ha funzionato. Riprova.')
      setSaving(false)
      return
    }

    router.push('/checkin')
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
          <p className="text-xs text-gray-500 mb-4">Passo {step} di 3</p>

          {step === 1 && (
            <>
              <p className="text-sm text-gray-700 mb-4">Nome agenzia</p>
              <Input
                value={agencyName}
                onChange={setAgencyName}
                placeholder="Es. Immobiliare Rossi"
                className="mb-4"
              />
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-sm text-gray-700 mb-4">Città / zona</p>
              <Input
                value={cityArea}
                onChange={setCityArea}
                placeholder="Es. Milano Centro"
                className="mb-4"
              />
            </>
          )}

          {step === 3 && (
            <>
              <p className="text-sm text-gray-700 mb-4">Descrivi il lavoro quotidiano della tua agenzia.</p>
              <Input
                value={factualDescription}
                onChange={setFactualDescription}
                placeholder="Es. Gestiamo compravendite residenziali e affitti brevi."
                multiline={true}
                className="mb-2"
              />
              <p className="text-xs text-gray-400 mb-4">{factualDescription.length}/280</p>
            </>
          )}

          {error && (
            <p className="text-sm text-red-600 mb-4">{error}</p>
          )}

          <div className="flex gap-3">
            {step > 1 && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleBack}
                disabled={saving}
              >
                Indietro
              </Button>
            )}

            {step < 3 && (
              <Button
                type="button"
                variant="primary"
                onClick={handleNext}
                className="flex-1"
              >
                Avanti
              </Button>
            )}

            {step === 3 && (
              <Button
                type="button"
                variant="primary"
                onClick={handleSave}
                disabled={saving}
                className="flex-1"
              >
                {saving ? 'Salvataggio...' : 'Salva'}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </main>
  )
}
