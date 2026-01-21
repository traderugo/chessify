// app/api/join-tournament/route.js
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request) {
  try {
    const { tournamentId, profileId, paymentMethod, paystackReference } = await request.json();

    if (!tournamentId || !profileId || !paymentMethod) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required fields' }),
        { status: 400 }
      );
    }

    // ----------------------------------
    // Check if already joined
    // ----------------------------------
    const { data: existingParticipant } = await supabaseAdmin
      .from('tournament_participants')
      .select('id, payment_status')
      .eq('tournament_id', tournamentId)
      .eq('profile_id', profileId)
      .maybeSingle();

    if (existingParticipant) {
      return new Response(
        JSON.stringify({ 
          success: existingParticipant.payment_status === 'paid', 
          message: existingParticipant.payment_status === 'paid' 
            ? 'Already joined this tournament' 
            : 'Registration pending - payment required' 
        }),
        { status: existingParticipant.payment_status === 'paid' ? 200 : 400 }
      );
    }

    // ----------------------------------
    // Fetch tournament
    // ----------------------------------
    const { data: tournament, error: tournamentError } = await supabaseAdmin
      .from('tournaments')
      .select('entry_fee, currency, status')
      .eq('id', tournamentId)
      .single();

    if (tournamentError || !tournament) {
      return new Response(
        JSON.stringify({ success: false, message: 'Tournament not found' }),
        { status: 404 }
      );
    }

    const entryFeeInKobo = tournament.entry_fee || 0;
    const currency = tournament.currency || 'NGN';

    // ----------------------------------
    // Process based on payment method
    // ----------------------------------
    if (paymentMethod === 'wallet') {
      // WALLET PAYMENT
      const { data: balanceData } = await supabaseAdmin
        .from('user_wallet_balance')
        .select('current_balance')
        .eq('profile_id', profileId)
        .single();

      const walletBalanceInKobo = balanceData?.current_balance || 0;

      if (walletBalanceInKobo < entryFeeInKobo) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: `Insufficient wallet balance. You have ${(walletBalanceInKobo / 100).toFixed(2)} ${currency}, need ${(entryFeeInKobo / 100).toFixed(2)} ${currency}` 
          }),
          { status: 400 }
        );
      }

      // Withdraw from wallet (this creates the transaction record)
      const { error: withdrawError } = await supabaseAdmin.rpc('withdraw_from_wallet', {
        p_profile_id: profileId,
        p_amount: entryFeeInKobo , // Convert to naira for RPC
        p_description: 'Tournament entry fee',
        p_tournament_id: tournamentId
      });

      if (withdrawError) {
        console.error('Wallet withdrawal failed:', withdrawError);
        return new Response(
          JSON.stringify({ success: false, message: 'Wallet payment failed: ' + withdrawError.message }),
          { status: 400 }
        );
      }

      // Create participant record (payment successful)
      const { error: insertError } = await supabaseAdmin
        .from('tournament_participants')
        .insert({
          tournament_id: tournamentId,
          profile_id: profileId,
          payment_status: 'paid',
          payment_reference: null, // Wallet payment - no external reference
          joined_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Failed to create participant:', insertError);
        // TODO: Ideally, refund the wallet here if participant creation fails
        return new Response(
          JSON.stringify({ success: false, message: 'Failed to complete registration' }),
          { status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ success: true, paymentMethod: 'wallet' }),
        { status: 200 }
      );

    } else if (paymentMethod === 'paystack') {
      // PAYSTACK PAYMENT
      if (!paystackReference) {
        return new Response(
          JSON.stringify({ success: false, message: 'Paystack reference required' }),
          { status: 400 }
        );
      }

      // Verify with Paystack
      const paystackResponse = await fetch(
        `https://api.paystack.co/transaction/verify/${paystackReference}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const paystackResult = await paystackResponse.json();

      if (
        !paystackResponse.ok ||
        paystackResult.status !== true ||
        paystackResult.data?.status !== 'success'
      ) {
        return new Response(
          JSON.stringify({ success: false, message: 'Paystack payment verification failed' }),
          { status: 400 }
        );
      }

      // Validate amount
      if (paystackResult.data.amount !== entryFeeInKobo) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: `Payment amount mismatch. Expected ${entryFeeInKobo}, got ${paystackResult.data.amount}` 
          }),
          { status: 400 }
        );
      }

      // Create participant record (payment verified)
      const { error: insertError } = await supabaseAdmin
        .from('tournament_participants')
        .insert({
          tournament_id: tournamentId,
          profile_id: profileId,
          payment_status: 'paid',
          payment_reference: paystackReference,
          joined_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Failed to create participant:', insertError);
        return new Response(
          JSON.stringify({ success: false, message: 'Failed to complete registration' }),
          { status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ success: true, paymentMethod: 'paystack' }),
        { status: 200 }
      );

    } else {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid payment method' }),
        { status: 400 }
      );
    }

  } catch (err) {
    console.error('Join tournament error:', err);
    return new Response(
      JSON.stringify({ success: false, message: 'Server error: ' + err.message }),
      { status: 500 }
    );
  }
}