// app/api/wallet/verify-account/route.js
export async function POST(request) {
  try {
    const { accountNumber, bankCode } = await request.json();

    if (!accountNumber || !bankCode) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Account number and bank code required'
        }),
        { status: 400 }
      );
    }

    // Verify account with Paystack
    const response = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const result = await response.json();

    if (!response.ok || !result.status) {
      return new Response(
        JSON.stringify({
          success: false,
          message: result.message || 'Account verification failed'
        }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        accountName: result.data.account_name,
        accountNumber: result.data.account_number
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify account error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Server error'
      }),
      { status: 500 }
    );
  }
}