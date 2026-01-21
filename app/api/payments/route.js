const Paystack = require('paystack')(process.env.PAYSTACK_SECRET_KEY);

export async function POST(request) {
  const { email, amount } = await request.json();
  const params = {
    email,
    amount: amount * 100, // in kobo
  };
  try {
    const transaction = await Paystack.transaction.initialize(params);
    return Response.json(transaction.data);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }
}