import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { imageUrl } = await req.json()

  if (!imageUrl) {
    return NextResponse.json({ error: 'Missing imageUrl' }, { status: 400 })
  }

  // Explicitly pass the key so we can debug if it's missing
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not set' }, { status: 500 })
  }

  const client = new Anthropic({ apiKey })

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'url', url: imageUrl },
          },
          {
            type: 'text',
            text: `Analyze this clothing item and return ONLY a JSON object with these fields:
{
  "category": one of [Tops, Bottoms, Dresses, Shoes, Accessories, Outerwear, Bags],
  "color": primary color name as a simple word e.g. "black", "rust", "navy",
  "color_hex": best matching hex code e.g. "#2C1008",
  "season": one of [Spring, Summer, Fall, Winter, All Season],
  "occasion": one of [Casual, Work, Going Out, Travel, Formal, Sport],
  "name": a short descriptive name for the item e.g. "White linen shirt"
}
Return only the JSON, no explanation.`,
          },
        ],
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  try {
    const tags = JSON.parse(text)
    return NextResponse.json(tags)
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response', raw: text }, { status: 500 })
  }
}