// lib/tournament-utils.js
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function getTournamentPrizePool(tournamentId) {
  const { data, error } = await supabaseAdmin
    .from('transactions')
    .select('amount')
    .eq('tournament_id', tournamentId)
    .eq('status', 'success')
    .eq('type', 'entry_fee');

  if (error) {
    console.error('Prize pool calc failed:', error);
    return JSON.stringify(error);
  }

  const total = data.reduce((sum, tx) => sum + Number(tx.amount), 0);
  return total;
}

export async function getParticipantCount(tournamentId) {
  const { count, error } = await supabaseAdmin
    .from('tournament_participants')
    .select('*', { count: 'exact', head: true })
    .eq('tournament_id', tournamentId)
    .in('payment_status', ['paid', 'confirmed']);

  if (error) {
    console.error('Participant count failed:', error);
    return 0;
  }

  return count || 0;
}