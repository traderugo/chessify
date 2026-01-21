'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'
import { Loader2, AlertCircle, CheckCircle2, Trophy, Wallet, Clock, Users, Award, User, CreditCard } from 'lucide-react'

export default function JoinTournamentPage() {
  const { id } = useParams()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const supabase = createClient()

  const [tournament, setTournament] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [joining, setJoining] = useState(false)
  const [success, setSuccess] = useState(false)
  const [walletBalanceInKobo, setWalletBalanceInKobo] = useState(0)

  useEffect(() => {
    if (window.PaystackPop) return;

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => console.log('Paystack script loaded ✓');
    script.onerror = () => console.error('Failed to load Paystack script');

    document.body.appendChild(script);

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!id || !user || authLoading) return;

    const loadTournament = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from('tournaments')
          .select('*, host:host_id(full_name)')
          .eq('id', id)
          .single()

        if (error) throw error
        if (!data) throw new Error('Tournament not found or you do not have permission to view it')

        const { data: participant } = await supabase
          .from('tournament_participants')
          .select('id, payment_status')
          .eq('tournament_id', id)
          .eq('profile_id', user.id)
          .maybeSingle()

        // Fetch wallet balance (returns KOBO)
        const { data: balanceData } = await supabase
          .from('user_wallet_balance')
          .select('current_balance')
          .eq('profile_id', user.id)
          .maybeSingle()

        const balanceInKobo = balanceData?.current_balance || 0
        setWalletBalanceInKobo(balanceInKobo)

        // Decision table logic
        const now = new Date();
        const startDate = new Date(data.start_date);
        const endDate = new Date(data.end_date);
        const hasStarted = now >= startDate;
        const hoursBeforeStart = 24;
        const lockTime = new Date(startDate);
        lockTime.setHours(lockTime.getHours() - hoursBeforeStart);
        const isCloseToStart = now >= lockTime && !hasStarted;

        // Count current participants
        const { count: participantCount } = await supabase
          .from('tournament_participants')
          .select('id', { count: 'exact' })
          .eq('tournament_id', id)

        setTournament({
          ...data,
          alreadyJoined: !!participant,
          participant,
          hasStarted,
          isCloseToStart,
          isJoinable: !participant && !hasStarted,
          participantCount: participantCount || 0
        })
      } catch (err) {
        console.error('Failed to load tournament:', err)
        setError(err.message || 'Failed to load tournament details')
      } finally {
        setLoading(false)
      }
    }

    loadTournament()
  }, [id, user, authLoading, supabase])

  const handleJoinFree = async () => {
    if (!user || !tournament || !tournament.isJoinable || joining) return

    setJoining(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('tournament_participants')
        .insert({
          tournament_id: id,
          profile_id: user.id,
          payment_status: 'paid'
        })

      if (error) throw error

      setSuccess(true)
      setTimeout(() => router.push(`/tournaments/${id}`), 1800)
    } catch (err) {
      setError(err.message || 'Failed to join tournament')
      // Reload page on error to reset state
      setTimeout(() => window.location.reload(), 2000)
    } finally {
      setJoining(false)
    }
  }

  const handleJoinPaid = async () => {
    if (!user || !tournament || !tournament.isJoinable || tournament.entry_fee <= 0 || joining) return

    setJoining(true)
    setError(null)

    const entryFeeInKobo = tournament.entry_fee

    try {
      // Check if wallet has enough balance (both in kobo)
      if (walletBalanceInKobo >= entryFeeInKobo) {
        // Use wallet payment - call backend directly (no participant creation here)
        await processWalletPayment()
      } else {
        // Use Paystack - process through Paystack first
        await processPaystackPayment(entryFeeInKobo)
      }
    } catch (err) {
      console.error('Payment error:', err)
      setError(err.message || 'Failed to process payment')
      // Reload page on error to reset state
      setTimeout(() => window.location.reload(), 2000)
      setJoining(false)
    }
  }

  const processWalletPayment = async () => {
    try {
      // Call backend to create participant AND process wallet payment atomically
      const res = await fetch('/api/verify-paystack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tournamentId: id,
          profileId: user.id,
          paymentMethod: 'wallet'
        })
      })

      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Wallet payment failed')
      }

      setSuccess(true)
      setTimeout(() => router.push(`/tournaments/${id}`), 2200)
    } catch (err) {
      throw err
    }
  }

  const processPaystackPayment = async (entryFeeInKobo) => {
    if (!window.PaystackPop) {
      throw new Error('Paystack is not loaded. Please refresh the page.')
    }

    return new Promise((resolve, reject) => {
      const paystackHandler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: user.email,
        amount: entryFeeInKobo,
        currency: tournament.currency || 'NGN',
        ref: `${user.id}-${id}-${Date.now()}`,
        metadata: {
          tournament_id: id,
          profile_id: user.id,
          custom_fields: [
            { display_name: 'Tournament', variable_name: 'tournament', value: tournament.title }
          ]
        },
        callback: function(response) {
          // Call async function inside regular function
          verifyPaystackPayment(response.reference)
            .then(() => resolve())
            .catch((err) => reject(err))
        },
        onClose: () => {
          // User closed the popup without paying
          setJoining(false)
          reject(new Error('Payment cancelled'))
        }
      })

      paystackHandler.openIframe()
    })
  }

  const verifyPaystackPayment = async (reference) => {
    try {
      const res = await fetch('/api/verify-paystack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tournamentId: id,
          profileId: user.id,
          paymentMethod: 'paystack',
          paystackReference: reference
        })
      })

      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Payment verification failed')
      }

      setSuccess(true)
      setTimeout(() => router.push(`/tournaments/${id}`), 2200)
    } catch (err) {
      console.error('Verification failed:', err)
      throw new Error(err.message || 'Payment verification failed')
    } finally {
      setJoining(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4" size={40} />
          <p>Checking your login status...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <AlertCircle className="mx-auto text-yellow-500 mb-4" size={64} />
          <h2 className="text-2xl font-bold mb-3">Please Sign In</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You need to be logged in to join this tournament
          </p>
          <button
            onClick={() => router.push('/auth/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-medium"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4" size={40} />
          <p>Loading tournament details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center text-red-500 max-w-md">
          <AlertCircle className="mx-auto mb-4" size={64} />
          <h2 className="text-2xl font-bold mb-3">Error</h2>
          <p className="mb-4">{error}</p>
          <p className="text-sm text-gray-500">Page will reload automatically...</p>
        </div>
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="mx-auto text-yellow-500 mb-4" size={64} />
          <h2 className="text-2xl font-bold">Tournament Not Found</h2>
        </div>
      </div>
    )
  }

  const isFree = tournament.entry_fee === 0 || tournament.entry_fee === null
  const entryFeeInKobo = tournament.entry_fee || 0
  const entryFeeInNaira = entryFeeInKobo / 100
  const walletBalanceInNaira = walletBalanceInKobo / 100
  const hasEnoughInWallet = !isFree && walletBalanceInKobo >= entryFeeInKobo

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-5 sm:p-8">
      <div className="max-w-2xl mx-auto">
        {success ? (
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-2xl p-8 text-center">
            <CheckCircle2 className="mx-auto text-green-600 dark:text-green-400" size={64} />
            <h2 className="text-2xl font-bold mt-4">You're In!</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Successfully joined <strong>{tournament.title}</strong>
            </p>
            <button
              onClick={() => router.push(`/tournaments/${id}`)}
              className="mt-8 bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-xl font-medium"
            >
              Go to Tournament Page
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Join Tournament</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">{tournament.title}</p>

            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-8 shadow-sm">
              <div className="flex justify-between items-center py-3 border-b">
                <span className="flex items-center gap-2"><Clock size={16} /> Start Date</span>
                <span className="font-bold">{new Date(tournament.start_date).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b">
                <span className="flex items-center gap-2"><Clock size={16} /> End Date</span>
                <span className="font-bold">{new Date(tournament.end_date).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b">
                <span className="flex items-center gap-2"><User size={16} /> Host</span>
                <span className="font-bold">{tournament.host?.full_name || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b">
                <span className="flex items-center gap-2"><Award size={16} /> Prize Pool</span>
                <span className="font-bold">
                  {tournament.prize_pool ? `${tournament.currency} ${(tournament.prize_pool / 100).toFixed(2)}` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b">
                <span className="flex items-center gap-2"><Users size={16} /> Participants</span>
                <span className="font-bold">
                  {tournament.participantCount} / {tournament.max_participants || 'Unlimited'}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b">
                <span>Entry Fee</span>
                <span className="font-bold">
                  {isFree ? 'FREE' : `${tournament.currency} ${entryFeeInNaira.toFixed(2)}`}
                </span>
              </div>
              {!isFree && (
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="flex items-center gap-2"><Wallet size={16} /> Your Wallet Balance</span>
                  <span className="font-bold">{tournament.currency} {walletBalanceInNaira.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-3">
                <span>Status</span>
                <span className="font-medium capitalize">{tournament.status}</span>
              </div>
            </div>

            {tournament.alreadyJoined ? (
              <div className="bg-yellow-50 dark:bg-yellow-950 p-6 rounded-2xl text-center">
                <AlertCircle className="mx-auto mb-3" size={40} />
                <p className="font-medium">
                  You already joined this tournament
                  {tournament.participant?.payment_status === 'pending' && ' (payment pending)'}
                </p>
              </div>
            ) : tournament.hasStarted ? (
              <div className="bg-red-50 dark:bg-red-950/40 p-8 rounded-2xl text-center border border-red-200 dark:border-red-800">
                <AlertCircle className="mx-auto mb-4 text-red-600" size={48} />
                <h3 className="text-xl font-bold mb-2">Tournament Already Started</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Registration is closed.
                </p>
              </div>
            ) : (
              <>
                {tournament.isCloseToStart && (
                  <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-2xl mb-4 text-center border border-yellow-200 dark:border-yellow-800">
                    <AlertCircle className="mx-auto mb-2 text-yellow-600" size={32} />
                    <p className="font-medium">Less than 24 hours to start—join now before it's too late!</p>
                  </div>
                )}

                {!isFree && hasEnoughInWallet && (
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-2xl mb-4 text-center border border-blue-200 dark:border-blue-800">
                    <Wallet className="mx-auto mb-2 text-blue-600" size={32} />
                    <p className="font-medium">You have enough in your wallet! Payment will be deducted automatically.</p>
                  </div>
                )}

                {!isFree && !hasEnoughInWallet && (
                  <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-2xl mb-4 text-center border border-orange-200 dark:border-orange-800">
                    <CreditCard className="mx-auto mb-2 text-orange-600" size={32} />
                    <p className="font-medium">Insufficient wallet balance. You'll be redirected to Paystack to complete payment.</p>
                  </div>
                )}

                <div className="grid gap-4">
                  {isFree ? (
                    <button
                      onClick={handleJoinFree}
                      disabled={joining}
                      className="bg-green-600 hover:bg-green-700 text-white py-5 rounded-2xl font-semibold text-lg disabled:opacity-60 transition-colors flex items-center justify-center gap-3"
                    >
                      {joining ? <Loader2 className="animate-spin" /> : <Trophy />}
                      {joining ? 'Joining...' : 'Join for Free'}
                    </button>
                  ) : (
                    <button
                      onClick={handleJoinPaid}
                      disabled={joining}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-semibold text-lg disabled:opacity-60 transition-colors flex items-center justify-center gap-3"
                    >
                      {joining ? <Loader2 className="animate-spin" /> : hasEnoughInWallet ? <Wallet /> : <CreditCard />}
                      {joining ? 'Processing...' : hasEnoughInWallet ? 'Pay with Wallet' : 'Pay with Paystack'}
                    </button>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}