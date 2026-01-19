import { NextResponse } from 'next/server'
import { generatePostCopy } from '@/lib/ai'

export async function POST(request: Request) {
  try {
    const { checkinResponse, agencyName, agencyCity, pillar, platform } = await request.json()

    const copy = await generatePostCopy(
      checkinResponse,
      agencyName,
      agencyCity,
      pillar,
      platform
    )

    return NextResponse.json({ copy })
  } catch (error) {
    console.error('Generate API error:', error)
    return NextResponse.json(
      { error: 'Generation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
