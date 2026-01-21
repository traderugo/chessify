import { createSupabaseServer } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request, { params }) {
  const { id } = await params
  
  try {
    const supabase = await createSupabaseServer()
    
    // Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('[LEAVE] Auth attempt - user ID:', user?.id);
    
    if (authError || !user) {
      console.error('[LEAVE] Auth failed:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Tournament fetch
    console.log('[LEAVE] Fetching tournament ID:', id);
    const { data: tournament, error: tourneyError } = await supabase
      .from('tournaments')
      .select('status, start_date, entry_fee')
      .eq('id', id)
      .single()

    if (tourneyError || !tournament) {
      console.error('[LEAVE] Tournament not found:', tourneyError);
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    const now = new Date();
    const startDate = new Date(tournament.start_date);

    if (now >= startDate) {
      console.log('[LEAVE] Tournament already started');
      return NextResponse.json(
        { error: "Cannot leave a tournament that has already started" },
        { status: 400 }
      );
    }

    // Entry check
    console.log('[LEAVE] Checking participant for user:', user.id);
    const { data: entry, error: entryError } = await supabase
      .from('tournament_participants')
      .select('id')
      .eq('tournament_id', id)
      .eq('profile_id', user.id)
      .single()

    if (entryError || !entry) {
      console.log('[LEAVE] No entry found for user');
      return NextResponse.json(
        { error: 'You are not registered for this tournament' },
        { status: 400 }
      )
    }

    // Delete
    console.log('[LEAVE] Deleting participant ID:', entry.id);
    const { error: deleteError } = await supabase
      .from('tournament_participants')
      .delete()
      .eq('id', entry.id)

    if (deleteError) {
      console.error('[LEAVE] Delete failed:', deleteError);
      throw deleteError
    }

    console.log('[LEAVE] Participant deleted successfully');

    // Refund logic
    let refundedAmount = 0;

    if (tournament.entry_fee > 0) {
      refundedAmount = tournament.entry_fee;
      console.log('[LEAVE] Processing refund of:', refundedAmount);

      // RPC call
      console.log('[LEAVE] Calling add_to_wallet RPC...');
      const { error: rpcError } = await supabase.rpc('add_to_wallet', {
        p_profile_id: user.id,
        p_amount: refundedAmount,
        p_description: 'Refund for leaving the tournament',
        p_tournament_id: id
      })

      if (rpcError) {
        console.error('[LEAVE] RPC failed:', rpcError);
      } else {
        console.log('[LEAVE] RPC succeeded — refund should be in transactions');
      }

    }

    console.log('[LEAVE] Success - refunded:', refundedAmount);

    return NextResponse.json({ 
      success: true,
      refunded: refundedAmount / 100
    })

  } catch (error) {
    console.error('[LEAVE] Fatal error:', error)
    return NextResponse.json(
      { error: 'Failed to leave tournament' },
      { status: 500 }
    )
  }
}