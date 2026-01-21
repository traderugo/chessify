// proxy.js
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function proxy(request) {
  let response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        }
      }
    }
  )

  // Force refresh the session (this updates cookies if needed)
  const { data: { session } } = await supabase.auth.getSession()
  await supabase.auth.refreshSession() // Ensure latest token

  // If session exists, make sure it's synced
  if (session) {
    console.log('Proxy - Session user ID:', session.user.id)
  } else {
    console.log('Proxy - No session found')
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api|_next).*)']
}