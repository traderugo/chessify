import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request, context) {
  // 1. Await the params (very important in App Router dynamic routes)
  const { id } = await context.params

  // 2. Await cookies()
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
        // remove is optional — Supabase can work without it
      }
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', id)           // ← now using the awaited id
    .eq('host_id', user.id)
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: 'Tournament not found or you are not authorized' },
      { status: 404 }
    )
  }

  return NextResponse.json(data)
}