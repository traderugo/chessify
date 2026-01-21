// app/api/tournaments/create/route.js
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name, options) {
          cookieStore.delete({ name, ...options })
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json(
      { error: 'You must be logged in' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()

    const tournamentData = {
      title: body.title?.trim(),
      description: body.description?.trim() || null,
      host_id: user.id,
      entry_fee: Number(body.entry_fee) || 0,
      currency: body.currency || 'NGN',
      max_participants: body.max_participants ? Number(body.max_participants) : null,
      start_date: body.start_date ? new Date(body.start_date).toISOString() : null,
      platform: body.platform || null,
      external_link: body.external_link?.trim() || null,
      status: 'draft',
      prize_pool: 0,
    }

    if (!tournamentData.title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const { data, error: insertError } = await supabase
      .from('tournaments')
      .insert([tournamentData])
      .select()
      .single()

    if (insertError) throw insertError

    return NextResponse.json({ success: true, id: data.id }, { status: 201 })
  } catch (err) {
    console.error('Tournament creation error:', err)
    return NextResponse.json({ error: 'Failed to create tournament' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Tournaments create API is running' })
}