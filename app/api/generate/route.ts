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
  } catch {
    return NextResponse.json(
      { error: 'Generation failed' },
      { status: 500 }
    )
  }
}
