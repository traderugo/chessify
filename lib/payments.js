const Paystack = require('paystack')(process.env.PAYSTACK_SECRET_KEY);

export async function verifyTransaction(reference) {
  try {
    const transaction = await Paystack.transaction.verify(reference);
    return transaction.data;
  } catch (err) {
    throw err;
  }
}