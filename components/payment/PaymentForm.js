import { usePaystackPayment } from 'react-paystack'; // Assume installed react-paystack

export default function PaymentForm({ amount, email, onSuccess }) {
  const config = {
    reference: (new Date()).getTime().toString(),
    email,
    amount: amount * 100,
    publicKey: process.env.PAYSTACK_PUBLIC_KEY,
  };

  const initializePayment = usePaystackPayment(config);

  const handleClick = () => {
    initializePayment(onSuccess);
  };

  return <button onClick={handleClick}>Pay Now</button>;
}