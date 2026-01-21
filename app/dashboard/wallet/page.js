// app/wallet/withdraw/page.js
"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, AlertCircle, CheckCircle2, Loader2, DollarSign } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function WithdrawPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [balance, setBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [amount, setAmount] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [banks, setBanks] = useState([]);
  const [verifyingAccount, setVerifyingAccount] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [user, loading, router]);

  // Fetch wallet balance
  useEffect(() => {
    if (!user) return;
    
    const fetchBalance = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('user_wallet_balance')
        .select('current_balance')
        .eq('profile_id', user.id)
        .single();

      if (!error && data) {
        setBalance(data.current_balance || 0);
      }
      setLoadingBalance(false);
    };

    fetchBalance();
  }, [user]);

  // Fetch Nigerian banks
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await fetch('/api/wallet/banks');
        const result = await response.json();
        
        if (result.success) {
          setBanks(result.banks);
        }
      } catch (err) {
        console.error('Failed to fetch banks:', err);
      }
    };

    fetchBanks();
  }, []);

  // Verify account number
  useEffect(() => {
    if (accountNumber.length === 10 && bankCode) {
      verifyAccount();
    } else {
      setAccountName("");
    }
  }, [accountNumber, bankCode]);

  const verifyAccount = async () => {
    setVerifyingAccount(true);
    setAccountName("");
    setError("");

    try {
      const response = await fetch('/api/wallet/verify-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountNumber, bankCode })
      });

      const result = await response.json();

      if (result.success) {
        setAccountName(result.accountName);
      } else {
        setError(result.message || 'Failed to verify account');
      }
    } catch (err) {
      setError('Failed to verify account');
    } finally {
      setVerifyingAccount(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validation
    const amountInKobo = Math.round(parseFloat(amount) * 100);
    
    if (!amount || amountInKobo <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (amountInKobo < 10000) { // ₦100 minimum
      setError("Minimum withdrawal amount is ₦100");
      return;
    }

    if (amountInKobo > balance) {
      setError("Insufficient balance");
      return;
    }

    if (!bankCode || !accountNumber || !accountName) {
      setError("Please provide valid bank details");
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: user.id,
          amount: amountInKobo,
          bankCode,
          accountNumber,
          accountName
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setAmount("");
        setAccountNumber("");
        setAccountName("");
        setBankCode("");
        
        // Refresh balance
        const supabase = createClient();
        const { data } = await supabase
          .from('user_wallet_balance')
          .select('current_balance')
          .eq('profile_id', user.id)
          .single();
        
        if (data) setBalance(data.current_balance || 0);

        // Redirect after 3 seconds
        setTimeout(() => router.push('/dashboard'), 3000);
      } else {
        setError(result.message || 'Withdrawal failed');
      }
    } catch (err) {
      setError('Failed to process withdrawal');
    } finally {
      setProcessing(false);
    }
  };

  if (loading || loadingBalance) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!user) return null;

  const formattedBalance = `₦${(balance / 100).toFixed(2)}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/dashboard"
            className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900">Withdraw Funds</h1>
          <p className="text-gray-600 mt-2">Transfer money from your wallet to your bank account</p>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-6 mb-6 text-white">
          <p className="text-purple-100 text-sm mb-2">Available Balance</p>
          <p className="text-4xl font-bold">{formattedBalance}</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start">
            <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-green-900">Withdrawal Successful!</h3>
              <p className="text-green-700 text-sm mt-1">
                Your funds will be credited to your account within 24 hours. Redirecting...
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Withdrawal Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <form onSubmit={handleWithdraw} className="space-y-6">
            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Amount (NGN)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={processing || success}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimum withdrawal: ₦100</p>
            </div>

            {/* Bank Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Bank
              </label>
              <select
                value={bankCode}
                onChange={(e) => setBankCode(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={processing || success}
              >
                <option value="">Choose your bank</option>
                {banks.map((bank) => (
                  <option key={bank.code} value={bank.code}>
                    {bank.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Account Number
              </label>
              <input
                type="text"
                maxLength="10"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="0123456789"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={processing || success}
              />
            </div>

            {/* Account Name (auto-verified) */}
            {verifyingAccount && (
              <div className="flex items-center text-purple-600">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span className="text-sm">Verifying account...</span>
              </div>
            )}

            {accountName && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-700 font-medium">Account Name</p>
                <p className="text-green-900 font-semibold">{accountName}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={processing || success || !accountName || !amount}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                'Withdraw Funds'
              )}
            </button>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Important Information</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Withdrawals are processed within 24 hours</li>
            <li>• Minimum withdrawal amount is ₦100</li>
            <li>• Ensure your account details are correct</li>
            <li>• A small transaction fee may apply</li>
          </ul>
        </div>
      </div>
    </div>
  );
}