import { useState, useRef, useEffect } from 'react'
import { getImageUrl } from '../lib/supabase'

/**
 * Optimized image with:
 * - Supabase image transforms (resize on CDN)
 * - Native lazy loading
 * - CSS shimmer skeleton placeholder
 * - Blur-up placeholder (tiny image → full resolution)
 * - Graceful fade-in with no flicker
 */
export default function OptimizedImage({ src, alt, className = '', sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw', onClick, priority = false, onLoad: onLoadProp }) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [placeholderFaded, setPlaceholderFaded] = useState(false)
  const imgRef = useRef(null)

  // Generate responsive URLs using Supabase transforms
  const smallUrl = getImageUrl(src, { width: 400, quality: 70 })
  const mediumUrl = getImageUrl(src, { width: 800, quality: 75 })
  const largeUrl = getImageUrl(src, { width: 1200, quality: 80 })
  // Tiny placeholder for blur-up (20px wide, heavily compressed)
  const placeholderUrl = getImageUrl(src, { width: 20, quality: 20 })

  useEffect(() => {
    // If already cached, mark loaded immediately
    if (imgRef.current?.complete && imgRef.current?.naturalWidth > 0) {
      setLoaded(true)
      setPlaceholderFaded(true)
    }
  }, [])

  const handleLoad = () => {
    setLoaded(true)
    onLoadProp?.()
    // Delay removing placeholder so the crossfade is smooth
    setTimeout(() => setPlaceholderFaded(true), 600)
  }

  return (
    <div className={`relative overflow-hidden bg-gray-100 ${className}`} onClick={onClick}>
      {/* Shimmer skeleton — visible until placeholder fades */}
      {!placeholderFaded && (
        <div className="absolute inset-0 shimmer" />
      )}

      {/* Blur-up placeholder — fades out after main image loads */}
      {!placeholderFaded && (
        <img
          src={placeholderUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
          style={{ filter: 'blur(20px)', transform: 'scale(1.1)', opacity: loaded ? 0 : 1 }}
        />
      )}

      {/* Main image — fades in gracefully */}
      <img
        ref={imgRef}
        src={mediumUrl}
        srcSet={`${smallUrl} 400w, ${mediumUrl} 800w, ${largeUrl} 1200w`}
        sizes={sizes}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : undefined}
        onLoad={handleLoad}
        onError={() => { setError(true); setLoaded(true); setPlaceholderFaded(true); onLoadProp?.() }}
        className="w-full h-full object-cover transition-opacity duration-700 ease-out"
        style={{ opacity: loaded ? 1 : 0 }}
      />
    </div>
  )
}
