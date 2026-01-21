import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  const { email, password } = await request.json();
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json(data);
}