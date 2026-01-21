// app/api/wallet/banks/route.js
export async function GET() {
  try {
    const response = await fetch('https://api.paystack.co/bank', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!response.ok || !result.status) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Failed to fetch banks'
        }),
        { status: 400 }
      );
    }

    // Filter for Nigerian banks and remove duplicates
    const bankMap = new Map();
    
    result.data
      .filter(bank => bank.country === 'Nigeria')
      .forEach(bank => {
        // Use bank code as key to automatically handle duplicates (keep first occurrence)
        if (!bankMap.has(bank.code)) {
          bankMap.set(bank.code, {
            name: bank.name,
            code: bank.code
          });
        }
      });

    const nigerianBanks = Array.from(bankMap.values())
      .sort((a, b) => a.name.localeCompare(b.name));

    return new Response(
      JSON.stringify({
        success: true,
        banks: nigerianBanks
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch banks error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Server error'
      }),
      { status: 500 }
    );
  }
}