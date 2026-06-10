'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AddItemPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (!selected) return
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
  }

  async function handleSubmit() {
  if (!file) return
  setLoading(true)

  try {
    const userId = '75044bcc-502c-4555-839f-1d87054a37ba'

    // 1. Create placeholder item via API
    setStatus('Creating item...')
    const itemRes = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, name: 'Untitled' }),
    })
    const item = await itemRes.json()
    if (item.error) throw new Error(item.error)

    // 2. Upload photo
    setStatus('Uploading photo...')
    const form = new FormData()
    form.append('file', file)
    form.append('itemId', item.id)
    form.append('userId', userId)

    const uploadRes = await fetch('/api/upload', { method: 'POST', body: form })
    const { publicUrl, error: uploadError } = await uploadRes.json()
    if (uploadError) throw new Error(uploadError)

    // 3. Auto-tag with Claude Vision
    setStatus('AI tagging...')
    const tagRes = await fetch('/api/autotag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl: publicUrl }),
    })
    const tagData = await tagRes.json()
    if (tagData.error) throw new Error(JSON.stringify(tagData))

    // 4. Update item with photo + tags
    setStatus('Saving...')
    const updateRes = await fetch('/api/items', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: item.id,
        name: tagData.name || 'Untitled',
        category: tagData.category,
        color: tagData.color,
        color_hex: tagData.color_hex,
        season: tagData.season,
        occasion: tagData.occasion,
        photo_url: publicUrl,
      }),
    })
    const updateData = await updateRes.json()
    if (updateData.error) throw new Error(updateData.error)

    setStatus('Done!')
    router.push('/closet')

  } catch (err: any) {
    setStatus(`Error: ${err.message}`)
  } finally {
    setLoading(false)
  }
}

  return (
    <main className="min-h-screen bg-[#FDFAF8] p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-[#2C1008] mb-6">
        Add to Closet
      </h1>

      {/* Photo picker */}
      <div
        className="border-2 border-dashed border-[#B5406A] rounded-2xl p-8 text-center cursor-pointer mb-6"
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        {preview ? (
          <img src={preview} alt="Preview" className="w-full rounded-xl object-cover max-h-80" />
        ) : (
          <div className="text-[#B5406A]">
            <p className="text-4xl mb-2">📷</p>
            <p className="font-medium">Tap to add photo</p>
            <p className="text-sm opacity-60 mt-1">JPG, PNG, HEIC</p>
          </div>
        )}
      </div>

      <input
        id="fileInput"
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!file || loading}
        className="w-full bg-[#E84F3A] text-white font-semibold py-4 rounded-2xl disabled:opacity-40 transition"
      >
        {loading ? status : 'Add to Closet'}
      </button>

      {status && !loading && (
        <p className="text-center mt-4 text-sm text-[#B5406A]">{status}</p>
      )}
    </main>
  )
}