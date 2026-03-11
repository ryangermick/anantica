import { useState, useRef, useEffect } from 'react'
import { getImageUrl } from '../lib/supabase'

/**
 * Optimized image with:
 * - Supabase image transforms (resize on CDN)
 * - Native lazy loading
 * - CSS shimmer skeleton placeholder
 * - Smooth fade-in on load
 * - Dominant color placeholder via tiny thumbnail
 */
export default function OptimizedImage({ src, alt, className = '', sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw', onClick, priority = false }) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const imgRef = useRef(null)

  // Generate responsive URLs using Supabase transforms
  const smallUrl = getImageUrl(src, { width: 400, quality: 70 })
  const mediumUrl = getImageUrl(src, { width: 800, quality: 75 })
  const largeUrl = getImageUrl(src, { width: 1200, quality: 80 })
  // Tiny placeholder for blur-up (20px wide, heavily compressed)
  const placeholderUrl = getImageUrl(src, { width: 20, quality: 20 })

  useEffect(() => {
    // If already cached, mark loaded
    if (imgRef.current?.complete && imgRef.current?.naturalWidth > 0) {
      setLoaded(true)
    }
  }, [])

  return (
    <div className={`relative overflow-hidden bg-gray-100 ${className}`} onClick={onClick}>
      {/* Shimmer skeleton */}
      {!loaded && !error && (
        <div className="absolute inset-0 shimmer" />
      )}

      {/* Blur-up placeholder */}
      {!loaded && !error && (
        <img
          src={placeholderUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl"
          style={{ filter: 'blur(20px)', transform: 'scale(1.1)' }}
        />
      )}

      {/* Main image */}
      <img
        ref={imgRef}
        src={mediumUrl}
        srcSet={`${smallUrl} 400w, ${mediumUrl} 800w, ${largeUrl} 1200w`}
        sizes={sizes}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : undefined}
        onLoad={() => setLoaded(true)}
        onError={() => { setError(true); setLoaded(true) }}
        className={`w-full h-auto object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  )
}
