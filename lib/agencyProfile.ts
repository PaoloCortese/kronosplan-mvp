import { supabase } from './supabaseClient'

export interface AgencyProfile {
  user_id: string
  agency_name: string
  city_area: string
  factual_description: string
  pillar_chi?: string | null
  pillar_cosa?: string | null
  pillar_dove?: string | null
  created_at?: string
  updated_at?: string
}

export async function getAgencyProfile(userId: string): Promise<AgencyProfile | null> {
  const { data, error } = await supabase
    .from('agency_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return null
  }

  return data as AgencyProfile
}

export async function upsertAgencyProfile(
  userId: string,
  data: {
    agency_name: string
    city_area: string
    factual_description: string
  }
): Promise<{ success: boolean; error?: string }> {
  const existing = await getAgencyProfile(userId)

  if (existing) {
    const { error } = await supabase
      .from('agency_profiles')
      .update({
        agency_name: data.agency_name,
        city_area: data.city_area,
        factual_description: data.factual_description,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    if (error) {
      return { success: false, error: error.message }
    }
  } else {
    const { error } = await supabase
      .from('agency_profiles')
      .insert({
        user_id: userId,
        agency_name: data.agency_name,
        city_area: data.city_area,
        factual_description: data.factual_description
      })

    if (error) {
      return { success: false, error: error.message }
    }
  }

  return { success: true }
}

export async function upsertAgencyPillars(
  userId: string,
  data: {
    pillar_chi: string
    pillar_cosa: string
    pillar_dove: string
  }
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('agency_profiles')
    .update({
      pillar_chi: data.pillar_chi,
      pillar_cosa: data.pillar_cosa,
      pillar_dove: data.pillar_dove,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export function hasPillars(profile: AgencyProfile | null): boolean {
  if (!profile) return false
  return !!(
    profile.pillar_chi &&
    profile.pillar_chi.trim() &&
    profile.pillar_cosa &&
    profile.pillar_cosa.trim() &&
    profile.pillar_dove &&
    profile.pillar_dove.trim()
  )
}
