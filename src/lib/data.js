import { supabase } from './supabase'

export const ADMIN_EMAILS = ['rgermick@gmail.com', 'anantica.hari.singh@gmail.com']

export const defaultAbout = {
  profileImageUrl: '/anantica.jpg',
  name: 'Anantica Singh',
  tagline: 'Taking a break from tech · Oakland, CA.',
  location: 'Oakland, CA',
  bioHeadline: "After 18 years building products at Google, I'm taking time away from tech. Right now I'm making ceramics, sitting on boards, and figuring out what comes next.",
  bioParagraphs: [
    "At Google, I co-founded the food ordering marketplace across Search, Maps, and Assistant, led AI product strategy, and shipped experiences that touched billions of users. I started my career as a photojournalist at The Times of India — visual storytelling has always been part of who I am.",
    "These days I'm spending time at the wheel, exploring clay as a medium for creativity and calm. It turns out the discipline of shipping products and the patience of working with clay have more in common than you'd think.",
    "In 2026, I joined the Board of Directors of the Scratch Foundation, supporting the next generation of creative thinkers through technology and education.",
    "Outside the studio, I'm a triathlete and a community organizer for Spiral Gardens, a neighborhood farm and gathering space in Berkeley."
  ],
  workHistory: [
    { company: 'Scratch Foundation', role: 'Board of Directors', years: '2026 – Present' },
    { company: 'Studio Practice', role: 'Ceramicist', years: '2025 – Present' },
    { company: 'Google', role: 'GPM, AI Product Velocity, Search', years: '2024 – 2025' },
    { company: 'Google', role: 'Product Lead, Integrity Identity & Applied AI', years: '2023 – 2024' },
    { company: 'Google', role: 'Co-Founder & GPM, Food Ordering', years: '2016 – 2023' },
    { company: 'Google', role: 'PM/Lead: Growth, Core UX & Strategic Features', years: '2011 – 2016' },
    { company: 'Google', role: 'Growth Marketing Lead', years: '2007 – 2011' },
    { company: 'The Times of India', role: 'Photojournalist', years: '2002 – 2005' },
  ],
  education: [
    { school: 'Stanford University Graduate School of Business', degree: 'LEAD — Class of 2025, Strategy & Business Education' },
    { school: 'The Wharton School', degree: 'Strategy & Marketing Exec Program' },
    { school: 'The London School of Economics and Political Science (LSE)', degree: 'MSc. International Political Economy' },
    { school: "St. Xavier's College", degree: 'BA, Triple Honors in Economics, Political Science and Sociology' },
  ],
  skills: ['Product Strategy', 'Design Thinking', 'Business Development', 'Lifelong Learner'],
  philosophy: 'Finding beauty in the handmade. After years of building at scale, I\'m learning to slow down and let the material lead.',
  linkedinUrl: 'https://www.linkedin.com/in/anantica',
  linkedinHandle: '/anantica',
  websiteUrl: '',
  websiteDisplay: '',
  behanceUrl: '',
  contactEmail: 'hello@anantica.com',
  contactHeadline: "Let's connect.",
  contactDescription: "Interested in ceramics, collaborations, or just want to say hello? I'd love to hear from you.",
}

export const fallbackProjects = [
  { id: '1', title: 'Wheel-Thrown Vessels', category: 'Ceramics', imageUrl: 'https://picsum.photos/seed/wheel-thrown/800/1000', description: 'Exploring form and balance on the potter\'s wheel.', sortOrder: 0 },
  { id: '2', title: 'Glaze Experiments', category: 'Ceramics', imageUrl: 'https://picsum.photos/seed/glaze-work/800/600', description: 'Developing original glazes through experimentation.', sortOrder: 1 },
  { id: '3', title: 'Hand-Built Sculpture', category: 'Ceramics', imageUrl: 'https://picsum.photos/seed/hand-built/800/1200', description: 'Sculptural pieces built by hand.', sortOrder: 2 },
]

export async function fetchProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error || !data || data.length === 0) return fallbackProjects

  return data.map(r => ({
    id: r.id,
    title: r.title,
    category: r.category,
    imageUrl: r.image_url,
    description: r.description,
    artistStatement: r.artist_statement,
    year: r.year,
    medium: r.medium,
    dimensions: r.dimensions,
    sortOrder: r.sort_order,
  }))
}

export async function upsertProject(p) {
  const { error } = await supabase.from('projects').upsert({
    id: p.id, title: p.title, category: p.category,
    image_url: p.imageUrl, description: p.description,
    artist_statement: p.artistStatement, year: p.year,
    medium: p.medium, dimensions: p.dimensions, sort_order: p.sortOrder,
  })
  if (error) throw error
}

export async function deleteProject(id) {
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw error
}

export async function updateSortOrders(orders) {
  for (const o of orders) {
    await supabase.from('projects').update({ sort_order: o.sortOrder }).eq('id', o.id)
  }
}

export async function uploadImage(file) {
  const ext = file.name.split('.').pop()
  const name = `portfolio/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('images').upload(name, file)
  if (error) throw error
  const { data } = supabase.storage.from('images').getPublicUrl(name)
  return data.publicUrl
}

export async function fetchAbout() {
  return defaultAbout
}

export async function saveAbout(about) {
  const merged = { ...defaultAbout, ...about }
  const { error } = await supabase.from('site_config').upsert({ key: 'about', content: merged })
  if (error) throw error
}

export async function fetchContacts() {
  const { data } = await supabase.from('contacts').select('*').order('created_at', { ascending: false })
  return data || []
}

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin }
  })
  if (error) throw error
}

export async function signOut() {
  await supabase.auth.signOut()
}

export function isAdmin(email) {
  return email ? ADMIN_EMAILS.includes(email) : false
}

export function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}
