// app/actions/auth.js
'use server'

import { redirect } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabase/server'

export async function loginAction(formData) {
  const email = formData.get('email')
  const password = formData.get('password')

  const supabase = await createSupabaseServer()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/dashboard')  // or wherever
}