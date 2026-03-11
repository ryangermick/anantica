import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sawpuczwnpviqderbdfe.supabase.co'
const supabaseKey = 'sb_publishable_r1iKX0BrO2tDxbYPW-VTAQ_JyoCgTTO'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Supabase image transform helper
const STORAGE_BASE = `${supabaseUrl}/storage/v1`

export function getImageUrl(originalUrl, { width, quality } = {}) {
  if (!originalUrl || !originalUrl.includes(supabaseUrl)) return originalUrl
  // Use Supabase render endpoint for transforms
  const path = originalUrl.replace(`${STORAGE_BASE}/object/public/`, '')
  const params = new URLSearchParams()
  if (width) params.set('width', width)
  if (quality) params.set('quality', quality)
  const qs = params.toString()
  return `${STORAGE_BASE}/render/image/public/${path}${qs ? '?' + qs : ''}`
}
