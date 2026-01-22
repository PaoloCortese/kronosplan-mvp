'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Input from '@/components/Input'
import { getSession } from '@/lib/auth'
import { getAgencyProfile, upsertAgencyPillars } from '@/lib/agencyProfile'

export default function PillarsPage() {
  const [step, setStep] = useState(1)
  const [pillarChi, setPillarChi] = useState('')
  const [pillarCosa, setPillarCosa] = useState('')
  const [pillarDove, setPillarDove] = useState('')
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
      if (!profile) {
        router.push('/onboarding')
        return
      }

      if (profile.pillar_chi) setPillarChi(profile.pillar_chi)
      if (profile.pillar_cosa) setPillarCosa(profile.pillar_cosa)
      if (profile.pillar_dove) setPillarDove(profile.pillar_dove)

      setLoading(false)
    }
    checkAuth()
  }, [router])

  const validateStep = (): boolean => {
    setError('')

    if (step === 1) {
      if (!pillarChi.trim()) {
        setError('Campo obbligatorio.')
        return false
      }
      if (pillarChi.length > 280) {
        setError('Massimo 280 caratteri.')
        return false
      }
    }

    if (step === 2) {
      if (!pillarCosa.trim()) {
        setError('Campo obbligatorio.')
        return false
      }
      if (pillarCosa.length > 280) {
        setError('Massimo 280 caratteri.')
        return false
      }
    }

    if (step === 3) {
      if (!pillarDove.trim()) {
        setError('Campo obbligatorio.')
        return false
      }
      if (pillarDove.length > 280) {
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

    const result = await upsertAgencyPillars(userId, {
      pillar_chi: pillarChi.trim(),
      pillar_cosa: pillarCosa.trim(),
      pillar_dove: pillarDove.trim()
    })

    if (!result.success) {
      setError('Qualcosa non ha funzionato. Riprova.')
      setSaving(false)
      return
    }

    router.push('/planning')
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
              <p className="text-sm text-gray-700 mb-4">CHI SIAMO</p>
              <p className="text-xs text-gray-500 mb-4">Descrivi le persone, i valori o l'atmosfera dell'agenzia.</p>
              <Input
                value={pillarChi}
                onChange={setPillarChi}
                placeholder="Es. Un team di 5 agenti con esperienza decennale nel mercato residenziale."
                multiline={true}
                className="mb-2"
              />
              <p className="text-xs text-gray-400 mb-4">{pillarChi.length}/280</p>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-sm text-gray-700 mb-4">COSA FACCIAMO</p>
              <p className="text-xs text-gray-500 mb-4">Descrivi le attività e le competenze principali.</p>
              <Input
                value={pillarCosa}
                onChange={setPillarCosa}
                placeholder="Es. Compravendite residenziali, valutazioni immobiliari, consulenza mutui."
                multiline={true}
                className="mb-2"
              />
              <p className="text-xs text-gray-400 mb-4">{pillarCosa.length}/280</p>
            </>
          )}

          {step === 3 && (
            <>
              <p className="text-sm text-gray-700 mb-4">DOVE LO FACCIAMO</p>
              <p className="text-xs text-gray-500 mb-4">Descrivi il territorio, la zona o la sede dell'agenzia.</p>
              <Input
                value={pillarDove}
                onChange={setPillarDove}
                placeholder="Es. Operiamo a Milano, zona Navigli e Porta Romana, con ufficio in Via Tortona."
                multiline={true}
                className="mb-2"
              />
              <p className="text-xs text-gray-400 mb-4">{pillarDove.length}/280</p>
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
