// Auth utilities if needed
export async function getCurrentUser() {
  const { supabase } = require('./supabase/client');
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}