import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import OptimizedImage from './OptimizedImage'
import { slugify } from '../lib/data'

export default function Portfolio({ projects, loading, onReady }) {
  const navigate = useNavigate()
  const [loadedCount, setLoadedCount] = useState(0)
  const [ready, setReady] = useState(false)

  const totalImages = projects.length
  const handleImageLoad = useCallback(() => {
    setLoadedCount(c => {
      const next = c + 1
      if (next >= Math.min(totalImages, 4) && !ready) {
        setReady(true)
        onReady?.()
      }
      return next
    })
  }, [totalImages, ready, onReady])

  if (loading) {
    return (
      <div className="fade-in">
        <div className="mb-12">
          <div className="h-16 w-80 bg-gray-100 rounded shimmer mb-4" />
          <div className="h-6 w-64 bg-gray-100 rounded shimmer" />
        </div>
        <div className="masonry">
          {[85, 110, 95, 100, 90, 105].map((h, i) => (
            <div key={i} className="masonry-item rounded-sm overflow-hidden">
              <div className="shimmer" style={{ paddingBottom: `${h}%` }} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="fade-in">
      <div className="mb-12">
        <h1 className="font-brand text-5xl md:text-7xl font-extrabold mb-4 tracking-tighter">
          Selected Works<span className="text-gray-300">.</span>
        </h1>
        <p className="text-gray-500 max-w-xl text-lg leading-relaxed">
          Clay, community, and what comes next.
        </p>
      </div>
      <div className="masonry">
        {projects.map((p, i) => (
          <div
            key={p.id}
            className="masonry-item group relative overflow-hidden rounded-sm cursor-pointer"
            onClick={() => navigate(`/work/${slugify(p.title)}`)}
          >
            <OptimizedImage
              src={p.imageUrl}
              alt={p.title}
              priority={i < 3}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="transition-transform duration-700 group-hover:scale-105"
              onLoad={handleImageLoad}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-500 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100">
              <p className="text-white/60 text-xs uppercase tracking-widest mb-1">{p.category}</p>
              <h3 className="text-white font-brand text-xl font-bold tracking-tight">{p.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
