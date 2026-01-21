'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function updateTournament(tournamentId, formData) {
  if (!tournamentId) {
    return { error: 'Tournament ID is required' }
  }

  const title = formData.get('title')?.toString().trim()
  if (!title) return { error: 'Title is required' }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => 
            cookieStore.set(name, value, options)
          )
        }
      }
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to update a tournament' }
  }

  // Optional: Check if user is the host of this tournament
  const { data: tournament, error: fetchError } = await supabase
    .from('tournaments')
    .select('host_id')
    .eq('id', tournamentId)
    .single()

  if (fetchError || !tournament) {
    return { error: 'Tournament not found' }
  }

  if (tournament.host_id !== user.id) {
    return { error: 'Only the host can update this tournament' }
  }

  // Prepare data to update (only fields that were provided)
  const updateData = {
    title,
    updated_at: new Date().toISOString(),
  }

  // Only add fields if they exist in formData (prevents overwriting with null unintentionally)
  if (formData.has('description')) {
    updateData.description = formData.get('description')?.toString().trim() || null
  }

  if (formData.has('entry_fee')) {
    updateData.entry_fee = Number(formData.get('entry_fee') || 0)
  }

  if (formData.has('currency')) {
    updateData.currency = formData.get('currency') || 'NGN'
  }

  if (formData.has('max_participants')) {
    updateData.max_participants = formData.get('max_participants') 
      ? Number(formData.get('max_participants')) 
      : null
  }

  if (formData.has('start_date')) {
    updateData.start_date = formData.get('start_date') 
      ? new Date(formData.get('start_date')).toISOString() 
      : null
  }
  if (formData.has('end_date')) {
    updateData.end_date = formData.get('end_date') 
      ? new Date(formData.get('end_date')).toISOString() 
      : null
  }

  if (formData.has('platform')) {
    updateData.platform = formData.get('platform') || null
  }

  if (formData.has('external_link')) {
    updateData.external_link = formData.get('external_link')?.toString().trim() || null
  }

  // You might want to prevent status/prize_pool changes here depending on your logic
  // updateData.status = 'draft'     ← usually not allowed to change via edit
  // updateData.prize_pool = 0       ← usually calculated automatically

  const { error } = await supabase
    .from('tournaments')
    .update(updateData)
    .eq('id', tournamentId)

  if (error) {
    return { 
      error: `Failed to update tournament. ${error.message}`,
      details: error 
    }
  }

  // Redirect to tournament page after successful update
  redirect(`/tournaments/${tournamentId}`)
}