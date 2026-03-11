import { supabase } from './supabase'
import { DesignProject, AboutContent } from '../types'
import { INITIAL_PROJECTS, DEFAULT_ABOUT_CONTENT } from '../constants'

// ---- Projects ----

export const getProjects = async (): Promise<DesignProject[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error || !data || data.length === 0) return INITIAL_PROJECTS
  return data.map(row => ({
    id: row.id,
    title: row.title,
    category: row.category,
    imageUrl: row.image_url,
    description: row.description,
    artistStatement: row.artist_statement,
    year: row.year,
    medium: row.medium,
    dimensions: row.dimensions,
    sortOrder: row.sort_order,
  }))
}

export const upsertProject = async (project: DesignProject) => {
  const { error } = await supabase.from('projects').upsert({
    id: project.id,
    title: project.title,
    category: project.category,
    image_url: project.imageUrl,
    description: project.description,
    artist_statement: project.artistStatement,
    year: project.year,
    medium: project.medium,
    dimensions: project.dimensions,
    sort_order: project.sortOrder,
  })
  if (error) throw error
}

export const deleteProject = async (id: string) => {
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw error
}

export const updateProjectsOrder = async (projects: { id: string; sortOrder: number }[]) => {
  for (const p of projects) {
    await supabase.from('projects').update({ sort_order: p.sortOrder }).eq('id', p.id)
  }
}

// ---- About Content ----

export const getAboutContent = async (): Promise<AboutContent> => {
  // constants.ts is the source of truth.
  // DB overrides only exist for fields explicitly edited via CMS.
  // This prevents stale DB snapshots from overwriting code changes.
  return DEFAULT_ABOUT_CONTENT
}

export const updateAboutContent = async (content: Partial<AboutContent>) => {
  const current = await getAboutContent()
  const merged = { ...current, ...content }
  const { error } = await supabase.from('site_config').upsert({
    key: 'about',
    content: merged,
  })
  if (error) throw error
}

// ---- Contact Submissions ----

export const submitContact = async (data: { name: string; email: string; message: string }) => {
  // Save to DB
  await supabase.from('contacts').insert(data)
  // Send email notification
  try {
    await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  } catch {
    // Email is best-effort; don't fail the form
  }
}

export const getContacts = async () => {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return []
  return data || []
}

// ---- Image Upload ----

export const uploadImage = async (file: File): Promise<string> => {
  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const path = `projects/${timestamp}_${safeName}`
  const { error } = await supabase.storage.from('images').upload(path, file)
  if (error) throw error
  const { data } = supabase.storage.from('images').getPublicUrl(path)
  return data.publicUrl
}
