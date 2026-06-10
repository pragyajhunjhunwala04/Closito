'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Item = {
  id: string
  name: string
  category: string
  color: string
  color_hex: string
  season: string
  occasion: string
  photo_url: string
}

export default function ClosetPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')

  const categories = ['All', 'Tops', 'Bottoms', 'Dresses', 'Shoes', 'Accessories', 'Outerwear', 'Bags']

  useEffect(() => {
    async function loadItems() {
      const res = await fetch('/api/items')
      const data = await res.json()
      setItems(data)
      setLoading(false)
    }
    loadItems()
  }, [])

  const filtered = filter === 'All' ? items : items.filter(i => i.category === filter)

  return (
    <main className="min-h-screen bg-[#FDFAF8]">
      {/* Header */}
      <div className="px-6 pt-8 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2C1008]" style={{ fontFamily: 'Georgia, serif' }}>
            Closi<span className="text-[#E84F3A]">to</span>
          </h1>
          <p className="text-sm text-[#B5406A] tracking-widest uppercase mt-0.5">What to wear.</p>
        </div>
        <Link
          href="/closet/add"
          className="bg-[#E84F3A] text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold shadow"
        >
          +
        </Link>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 px-6 overflow-x-auto pb-3 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
              filter === cat
                ? 'bg-[#E84F3A] text-white'
                : 'bg-[#F9E8EE] text-[#B5406A]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64 text-[#B5406A]">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center px-6">
          <p className="text-4xl mb-3">👗</p>
          <p className="text-[#2C1008] font-medium">Nothing here yet</p>
          <p className="text-[#B5406A] text-sm mt-1">Add your first item to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-6 pb-24 sm:grid-cols-3 md:grid-cols-4">
          {filtered.map(item => (
            <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="aspect-square bg-[#F9E8EE]">
                {item.photo_url && (
                  <img
                    src={item.photo_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="p-2.5">
                <p className="text-[#2C1008] font-medium text-sm truncate">{item.name}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  {item.color_hex && (
                    <div
                      className="w-3 h-3 rounded-full border border-gray-200 flex-shrink-0"
                      style={{ backgroundColor: item.color_hex }}
                    />
                  )}
                  <p className="text-[#B5406A] text-xs truncate">{item.category}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}