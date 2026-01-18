'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Input from '@/components/Input'
import { signIn, signUp, getSession, getOrCreateUserAgency } from '@/lib/auth'

export default function HomePage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      const session = await getSession()
      if (session) {
        await getOrCreateUserAgency()
        router.push('/checkin')
      } else {
        setLoading(false)
      }
    }
    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (mode === 'login') {
        await signIn(email, password)
      } else {
        await signUp(email, password)
      }
      await getOrCreateUserAgency()
      router.push('/checkin')
    } catch (error) {
      console.error('Auth error:', error)
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
              className="mb-6"
            />
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
