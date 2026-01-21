import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  const { username } = await request.json();
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const { data: { user } } = await supabase.auth.getUser(request.headers.get('Authorization').split(' ')[1]);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { error } = await supabase.from('users').update({ chess_com_username: username }).eq('id', user.id);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ success: true });
}