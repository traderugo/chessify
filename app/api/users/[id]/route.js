import { createClient } from '@supabase/supabase-js';

export async function GET(request, { params }) {
  const { id } = params;
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json(data);
}