import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://sawpuczwnpviqderbdfe.supabase.co',
  'sb_publishable_r1iKX0BrO2tDxbYPW-VTAQ_JyoCgTTO'
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { name, email, message } = req.body
  if (!name || !email || !message) return res.status(400).json({ error: 'Missing fields' })

  const { error } = await supabase.from('contacts').insert({ name, email, message })
  if (error) return res.status(500).json({ error: error.message })

  return res.status(200).json({ success: true })
}
