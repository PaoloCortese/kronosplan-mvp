'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Input from '@/components/Input'
import { signIn, signUp, getSession, getOrCreateUserAgency } from '@/lib/auth'
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
        await getOrCreateUserAgency()
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
          await getOrCreateUserAgency()
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
          await getOrCreateUserAgency()
          router.push('/onboarding')
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : ''
      if (message.includes('Invalid login credentials')) {
        setError('Email o password non corretti.')
      } else if (message.includes('Email not confirmed')) {
        setError('Conferma la tua email prima di accedere.')
      } else {
        setError('Qualcosa non ha funzionato. Riprova.')
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
            <Input
              value={email}
              onChange={setEmail}
              type="email"
              placeholder="Email"
              className="mb-4"
            />
            <Input
              value={password}
              onChange={setPassword}
              type="password"
              placeholder="Password"
              className="mb-2"
            />
            {mode === 'register' && (
              <p className="text-xs text-gray-400 mb-4">Minimo 6 caratteri</p>
            )}
            {mode === 'login' && <div className="mb-4" />}
            {error && (
              <p className="text-sm text-red-600 mb-4">{error}</p>
            )}
            <Button type="submit" variant="primary" className="w-full mb-4">
              {mode === 'login' ? 'Accedi' : 'Registrati'}
            </Button>
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
