// app/actions/create-tournament.js
'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function createTournament(formData) {
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
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        }
      }
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: `You must be logged in to create a tournament...${user}`}
  }

  const tournamentData = {
    title,
    description: formData.get('description')?.toString().trim() || null,
    host_id: user.id,
    entry_fee: Number(formData.get('entry_fee') || 0),
    currency: formData.get('currency') || 'NGN',
    max_participants: formData.get('max_participants') ? Number(formData.get('max_participants')) : null,
    start_date: formData.get('start_date') ? new Date(formData.get('start_date')).toISOString() : null,
    end_date: formData.get('end_date') ? new Date(formData.get('end_date')).toISOString() : null,
    platform: formData.get('platform') || null,
    external_link: formData.get('external_link')?.toString().trim() || null,
    prize_pool: 0
  }

  const { data, error } = await supabase
    .from('tournaments')
    .insert(tournamentData)
    .select('id')
    .single()

  if (error) return { error: `Failed to create tournament. ${JSON.stringify(error, null, 2)}` }

  redirect(`/tournaments/${data.id}`)
}