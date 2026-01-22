'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Input from '@/components/Input'
import { signIn, signUp, getSession } from '@/lib/auth'
import { getAgencyProfile } from '@/lib/agencyProfile'

export default function HomePage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      const session = await getSession()
      if (session) {
        const profile = await getAgencyProfile(session.user.id)
        if (profile) {
          router.push('/checkin')
        } else {
          router.push('/onboarding')
        }
      } else {
        setLoading(false)
      }
    }
    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('La password deve avere almeno 6 caratteri.')
      return
    }

    try {
      if (mode === 'login') {
        await signIn(email, password)
        const session = await getSession()
        if (session) {
          const profile = await getAgencyProfile(session.user.id)
          if (profile) {
            router.push('/checkin')
          } else {
            router.push('/onboarding')
          }
        }
      } else {
        const result = await signUp(email, password)
        if (result.user) {
          router.push('/onboarding')
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : ''
      if (message.includes('Invalid login credentials')) {
        setError('Email o password non corretti.')
      } else if (message.includes('Email not confirmed')) {
        setError('Conferma la tua email prima di accedere.')
      } else if (message.includes('User already registered')) {
        setError('Email già registrata. Prova ad accedere.')
      } else {
        setError(message || 'Qualcosa non ha funzionato. Riprova.')
      }
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
      <div className="w-full max-w-md">
        <Card>
          <form onSubmit={handleSubmit}>
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <Input
              value={email}
              onChange={setEmail}
              type="email"
              placeholder="nome@agenzia.it"
              className="mb-4"
            />
            <Input
              value={password}
              onChange={setPassword}
              type="password"
              placeholder="Password (minimo 6 caratteri)"
              className="mb-4"
            />
            {error && (
              <p className="text-sm text-red-600 mb-4">{error}</p>
            )}
            <Button
              type="submit"
              variant="primary"
              className="w-full mb-4"
              disabled={mode === 'register' && (!email.includes('@') || password.length < 6)}
            >
              {mode === 'login' ? 'Accedi' : 'Registrati'}
            </Button>
            <p className="text-xs text-gray-500 mb-2">
              {mode === 'login' ? 'Non hai un account?' : 'Hai già un account?'}
            </p>
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              {mode === 'login' ? 'Registrati' : 'Accedi'}
            </button>
          </form>
        </Card>
      </div>
    </main>
  )
}
