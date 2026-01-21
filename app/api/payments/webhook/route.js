const Paystack = require('paystack')(process.env.PAYSTACK_SECRET_KEY);

export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get('x-paystack-signature');
  if (!Paystack.verifyWebhook(body, signature)) return Response.json({ error: 'Invalid signature' }, { status: 400 });
  const event = JSON.parse(body);
  // Handle event (e.g., update prize pool on 'charge.success')
  console.log(event);
  return Response.json({ received: true });
}