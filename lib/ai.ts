import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const platformInstructions: Record<string, string> = {
  linkedin: `Scrivi un post LinkedIn di 2-3 frasi.
Tono professionale e autorevole.
Non usare emoji.
Non usare hashtag.
Concentrati sul valore per il cliente e sulla competenza dell'agenzia.`,

  facebook: `Scrivi un post Facebook di 2-3 frasi.
Tono caldo e accessibile, come parlare a un vicino.
Non usare emoji.
Non usare hashtag.
Concentrati sulla relazione e la fiducia.`,

  instagram: `Scrivi una caption Instagram di 2-3 frasi.
Tono diretto e visivo, come descrivere un'immagine.
Non usare emoji.
Non usare hashtag.
Concentrati sull'emozione e l'esperienza.`,

  tiktok: `Scrivi un testo per TikTok di 1-2 frasi.
Tono giovane, diretto, conversazionale.
Non usare emoji.
Non usare hashtag.
Vai dritto al punto, cattura l'attenzione subito.`,

  x: `Scrivi un tweet di massimo 280 caratteri.
Tono sintetico e incisivo.
Non usare emoji.
Non usare hashtag.
Una frase sola, chiara e memorabile.`
}

export async function generatePostCopy(
  checkinResponse: string | null,
  agencyName: string,
  agencyCity: string,
  pillar: string,
  platform: string = 'facebook'
): Promise<string> {
  const instructions = platformInstructions[platform] || platformInstructions.facebook

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 500,
    temperature: 0.3,
    messages: [
      {
        role: 'user',
        content: `Sei un copywriter per agenzie immobiliari.

Agenzia: ${agencyName}, ${agencyCity}
Pillar: ${pillar}
Novità settimana: ${checkinResponse || 'nessuna'}

${instructions}`
      }
    ]
  })

  const textContent = message.content.find((block) => block.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in AI response')
  }

  return textContent.text.trim()
}
