import { NextResponse } from 'next/server'
import { generatePostCopy } from '@/lib/ai'

export async function POST(request: Request) {
  try {
    const { checkinResponse, agencyName, agencyCity, pillar, platform } = await request.json()
    console.log('[API /generate] Request:', { checkinResponse, agencyName, agencyCity, pillar, platform })

    const copy = await generatePostCopy(
      checkinResponse,
      agencyName,
      agencyCity,
      pillar,
      platform
    )

    console.log('[API /generate] Generated copy:', copy?.substring(0, 50) + '...')
    return NextResponse.json({ copy })
  } catch (error) {
    console.error('[API /generate] ERROR:', error)
    return NextResponse.json(
      { error: 'Generation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
