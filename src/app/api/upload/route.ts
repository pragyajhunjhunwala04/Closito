import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File
  const itemId = formData.get('itemId') as string
  const userId = formData.get('userId') as string

  if (!file || !itemId || !userId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()
  const path = `${userId}/${itemId}.${ext}`

  const { error } = await supabase.storage
    .from('item-photos')
    .upload(path, file, { upsert: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: { publicUrl } } = supabase.storage
    .from('item-photos')
    .getPublicUrl(path)

  return NextResponse.json({ publicUrl })
}