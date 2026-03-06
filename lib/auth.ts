import { supabase } from './supabase'

export const ADMIN_EMAILS = ['rgermick@gmail.com', 'anantica.hari.singh@gmail.com']

export const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin }
  })
  if (error) throw error
}

export const signOut = async () => {
  await supabase.auth.signOut()
}

export const isAdmin = (email: string | undefined): boolean => {
  if (!email) return false
  return ADMIN_EMAILS.includes(email)
}
