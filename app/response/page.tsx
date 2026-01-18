'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Card from '@/components/Card'
import Button from '@/components/Button'

function ResponseContent() {
  const searchParams = useSearchParams()
  const type = searchParams.get('type')
  const text = searchParams.get('text')

  if (type === 'novita') {
    // S2a: Novità rilevata
    // Estrae il fatto principale dal testo (simulato per MVP)
    const extractedFact = text?.split('.')[0] || 'Novità ricevuta'

    return (
      <Card>
        <p className="text-sm text-gray-700 mb-6">
          {extractedFact}. Ho preparato un post. Lo trovi qui.
        </p>

        <Button
          variant="primary"
          onClick={() => window.location.href = '/post/1'}
        >
          Vedi post
        </Button>
      </Card>
    )
  }

  if (type === 'nessuna') {
    // S2b: Nessuna novità
    return (
      <Card>
        <p className="text-sm text-gray-700 mb-6">
          Ok. I post di questa settimana sono nel calendario.
        </p>

        <Button
          variant="primary"
          onClick={() => window.location.href = '/calendario'}
        >
          Vai al calendario
        </Button>
      </Card>
    )
  }

  return null
}

export default function ResponsePage() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Suspense fallback={<Card><p className="text-sm text-gray-700">...</p></Card>}>
          <ResponseContent />
        </Suspense>
      </div>
    </main>
  )
}
