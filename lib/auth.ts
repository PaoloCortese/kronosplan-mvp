import { supabase } from './supabaseClient'

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getOrCreateUserAgency() {
  const session = await getSession()
  if (!session) return null

  const userId = session.user.id

  // Verifica se esiste record users
  const { data: existingUser } = await supabase
    .from('users')
    .select('agency_id')
    .eq('id', userId)
    .single()

  if (existingUser) {
    return existingUser.agency_id
  }

  // Non esiste: crea agency di default e record users
  const { data: newAgency } = await supabase
    .from('agencies')
    .insert({ name: 'Agenzia', city: 'Milano' })
    .select()
    .single()

  if (!newAgency) return null

  await supabase.from('users').insert({
    id: userId,
    agency_id: newAgency.id,
    email: session.user.email
  })

  return newAgency.id
}
