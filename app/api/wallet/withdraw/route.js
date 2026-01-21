// app/api/wallet/withdraw/route.js
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request) {
  try {
    const { profileId, amount, bankCode, accountNumber, accountName } = await request.json();

    // Validation
    if (!profileId || !amount || !bankCode || !accountNumber || !accountName) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Missing required fields'
        }),
        { status: 400 }
      );
    }

    if (amount < 10000) { // ₦100 minimum
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Minimum withdrawal amount is ₦100'
        }),
        { status: 400 }
      );
    }

    // Check wallet balance
    const { data: balanceData } = await supabaseAdmin
      .from('user_wallet_balance')
      .select('current_balance')
      .eq('profile_id', profileId)
      .single();

    const currentBalance = balanceData?.current_balance || 0;

    if (currentBalance < amount) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Insufficient balance'
        }),
        { status: 400 }
      );
    }

    // Create transfer recipient on Paystack
    const recipientResponse = await fetch('https://api.paystack.co/transferrecipient', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'nuban',
        name: accountName,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: 'NGN'
      })
    });

    const recipientResult = await recipientResponse.json();

    if (!recipientResponse.ok || !recipientResult.status) {
      return new Response(
        JSON.stringify({
          success: false,
          message: recipientResult.message || 'Failed to create recipient'
        }),
        { status: 400 }
      );
    }

    const recipientCode = recipientResult.data.recipient_code;

    // Initiate transfer
    const transferResponse = await fetch('https://api.paystack.co/transfer', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: 'balance',
        amount: amount,
        recipient: recipientCode,
        reason: 'Wallet withdrawal'
      })
    });

    const transferResult = await transferResponse.json();

    if (!transferResponse.ok || !transferResult.status) {
      return new Response(
        JSON.stringify({
          success: false,
          message: transferResult.message || 'Transfer failed'
        }),
        { status: 400 }
      );
    }

    // Withdraw from wallet using RPC
    const { error: withdrawError } = await supabaseAdmin.rpc('withdraw_from_wallet', {
      p_profile_id: profileId,
      p_amount: amount,
      p_description: `Withdrawal to ${accountName} (${accountNumber})`,
      p_tournament_id: null
    });

    if (withdrawError) {
      console.error('Wallet withdrawal failed:', withdrawError);
      // Note: Transfer already initiated - would need to handle refund
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Failed to update wallet balance'
        }),
        { status: 500 }
      );
    }

    // Log withdrawal transaction
    await supabaseAdmin
      .from('withdrawal_transactions')
      .insert({
        profile_id: profileId,
        amount: amount,
        bank_code: bankCode,
        account_number: accountNumber,
        account_name: accountName,
        transfer_code: transferResult.data.transfer_code,
        status: 'pending',
        created_at: new Date().toISOString()
      });

    return new Response(
      JSON.stringify({
        success: true,
        transferCode: transferResult.data.transfer_code,
        message: 'Withdrawal initiated successfully'
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Withdrawal error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Server error: ' + error.message
      }),
      { status: 500 }
    );
  }
}