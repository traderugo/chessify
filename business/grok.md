I WANT TO CREATE THE JOIN LOGIC AND PAGE FOR MY TOURNAMENT APP. THESE ARE SOME FILES TO ASSIST. 

TOURNAMENT PAGE:

'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  Trophy,
  Calendar,
  Users,
  Wallet,
  ScrollText,
  PlayCircle,
  Edit,
  Trash2,
  User,
} from 'lucide-react'
import { supabaseClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'

export default function TournamentDetailsPage() {
  const { id } = useParams()
  const { user, loading: authLoading } = useAuth()

  const [tournament, setTournament] = useState(null)
  const [hostProfile, setHostProfile] = useState(null)
  const [error, setError] = useState(null)
  const [countdown, setCountdown] = useState('Please wait...')

  // Fetch tournament + host profile
  useEffect(() => {
    if (!id) return

    const fetchData = async () => {
      try {
        // 1. Get tournament
        const { data: tourney, error: tourneyErr } = await supabaseClient
          .from('tournaments')
          .select('*')
          .eq('id', id)
          .single()

        if (tourneyErr) throw tourneyErr
        setTournament(tourney)

        // 2. Get host profile if tournament exists
        if (tourney?.host_id) {
          const { data: profile, error: profileErr } = await supabaseClient
            .from('profiles')           // ← change table name if different!
            .select('full_name, chess_com_username')
            .eq('id', tourney.host_id)
            .single()

          if (profileErr && profileErr.code !== 'PGRST116') { // ignore "not found"
            console.warn('Could not load host profile:', profileErr)
          } else {
            setHostProfile(profile)
          }
        }
      } catch (err) {
        setError(err.message)
      }
    }

    fetchData()
  }, [id])

  // Countdown logic
  useEffect(() => {
    if (!tournament?.start_date) return

    const interval = setInterval(() => {
      const now = Date.now()
      const start = new Date(tournament.start_date).getTime()
      const diff = start - now

      if (diff <= 0) {
        setCountdown('Live now')
        clearInterval(interval)
        return
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24))
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const m = Math.floor((diff / (1000 * 60)) % 60)
      const s = Math.floor((diff / 1000) % 60)

      setCountdown(`${d}d ${h}h ${m}m ${s}s`)
    }, 1000)

    return () => clearInterval(interval)
  }, [tournament])

  if (authLoading) return <p className="p-6">Loading…</p>
  if (error) return <p className="p-6 text-red-500">Error: {error}</p>
  if (!tournament) return <p className="p-6">Loading tournament…</p>

  const isHost = Boolean(user && user.id === tournament.host_id)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pb-20">
      {/* HERO */}
      <div className="relative bg-gradient-to-br from-indigo-500 via-blue-500 to-sky-500 text-white px-5 sm:px-8 pt-6 pb-8 rounded-b-2xl shadow-sm">
        <div className="max-w-6xl mx-auto relative">
        

          <span className="inline-flex items-center gap-2 text-xs bg-white/20 px-3 py-0.5 rounded-full mb-2">
            <Trophy size={14} />
            {tournament.category || 'General Competition'}
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold mb-1">
            {tournament.title}
          </h1>

          {/* === HOST INFO - right under the title === */}
          <div className="flex items-center gap-3 mb-4">
            
            <div>
              <p className="text-sm font-medium">
                Hosted by{' '}
                <span className="font-bold">
                  {hostProfile?.full_name || hostProfile?.username || 'Unknown Host'}
                </span>
              </p>
              {hostProfile?.username && (
                <p className="text-xs text-white/70">@{hostProfile.username}</p>
              )}
            </div>
          </div>

          <p className="text-sm text-white/80 mb-3">
            Compete. Win. Get paid.
          </p>

          <div>
            <p className="text-xs text-white/70 mb-1">Starts in</p>
            <p className="text-3xl sm:text-4xl font-extrabold">{countdown}</p>
          </div>
        </div>
      </div>

      {/* INFO GRID */}
      <div className="px-6 mt-4 grid grid-cols-2 gap-4 max-w-6xl mx-auto">
        <InfoCard icon={<Wallet size={20} />} label="Prize Pool" value={`${tournament.currency} ${tournament.prize_pool}`} />
        <InfoCard icon={<PlayCircle size={20} />} label="Entry Fee" value={tournament.entry_fee === 0 ? 'Free' : `${tournament.currency} ${tournament.entry_fee}`} />
        <InfoCard icon={<Users size={20} />} label="Participants" value={tournament.max_participants || 'Unlimited'} />
        <InfoCard icon={<Calendar size={20} />} label="Status" value={tournament.status} />
      </div>

      {/* DESCRIPTION */}
      <div className="px-3 mt-4 max-w-6xl mx-auto">
        <div className="bg-white dark:bg-[#161b22] rounded-2xl p-5 shadow space-y-3">
          <div className="flex items-center gap-2 text-lg font-bold">
            <ScrollText />
           Description & Rules 
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
            {tournament.description || 'Details will be provided by the host.'}
          </p>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="px-6 mt-8 max-w-6xl mx-auto space-y-4">
        <a
          href={`/tournaments/${id}/join`}
          className="block w-full bg-blue-600 text-white dark:bg-gray-800 py-4 rounded-2xl text-center font-semibold"
        >
          Join Tournament
        </a>
        <a
          href={`/tournaments/${id}/results`}
          className="block w-full bg-gray-200 dark:bg-gray-800 py-4 rounded-2xl text-center font-semibold"
        >
          View Results
        </a>

        {isHost && (
          <div className="mt-6">
            <div className="font-bold text-blue-500 mb-3">Host Actions:</div>
            <div className="grid grid-cols-2 gap-4">
              <a
                href={`/tournaments/${id}/edit`}
                className="flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-semibold transition-colors"
              >
                <Edit size={20} />
                Edit 
              </a>

              <button
                onClick={() => {
                  if (window.confirm('Delete this tournament permanently? This cannot be undone.')) {
                    console.log('Would delete tournament:', id)
                    // TODO: Implement real delete logic
                  }
                }}
                className="flex justify-center items-center gap-2 bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-semibold transition-colors"
              >
                <Trash2 size={20} />
                Delete 
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="bg-white dark:bg-[#161b22] rounded-xl p-3 shadow flex items-center gap-3 text-sm">
      <div className="text-blue-600 dark:text-blue-400">{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  )
}

THE TABLES I CREATED, RLS POLICIES I USED AND TRIGGERS I RAN: 

-- 2. Tournaments / Events
CREATE TABLE tournaments (
    id                  uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
    title               text          NOT NULL,
    description         text,
    host_id             uuid          REFERENCES profiles(id) ON DELETE SET NULL,
    entry_fee           bigint        DEFAULT 0,           -- in smallest unit (kobo/cents)
    currency            text          DEFAULT 'NGN',
    max_participants    integer       CHECK (max_participants > 0),
    start_date          timestamptz,
    status              text          DEFAULT 'draft'
        CHECK (status IN ('draft', 'published', 'ongoing', 'completed', 'cancelled')),
    prize_pool          bigint        DEFAULT 0,
    external_link       text,                              -- lichess arena, discord, etc
    created_at          timestamptz   DEFAULT now(),
    updated_at          timestamptz   DEFAULT now()
);

-- 3. Participants / Registrations
CREATE TABLE tournament_participants (
    id                  uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id       uuid          REFERENCES tournaments(id) ON DELETE CASCADE,
    profile_id          uuid          REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at           timestamptz   DEFAULT now(),
    payment_status      text          DEFAULT 'pending'
        CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_reference   text,                              -- Paystack/Flutterwave ref
    UNIQUE(tournament_id, profile_id)
);

-- 4. Very basic transaction log (mostly for entry fees)
CREATE TABLE transactions (
    id                  uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id          uuid          REFERENCES profiles(id),
    tournament_id       uuid          REFERENCES tournaments(id),
    amount              bigint        NOT NULL,
    currency            text          NOT NULL DEFAULT 'NGN',
    type                text          NOT NULL
        CHECK (type IN ('entry_fee', 'sponsorship', 'prize_payout', 'platform_fee')),
    status              text          DEFAULT 'pending'
        CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
    reference           text,                              -- payment gateway reference
    created_at          timestamptz   DEFAULT now()
);

-- Enable Row Level Security on all important tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 1. Profiles - users can see others' basic info, but only edit own
CREATE POLICY "Profiles are public readable"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- 2. Tournaments
-- Everyone can see published/ongoing/completed tournaments
CREATE POLICY "Public can see active tournaments"
    ON tournaments FOR SELECT
    USING (status IN ('published', 'ongoing', 'completed'));

-- Only host can see draft tournaments + manage their own
CREATE POLICY "Host can manage own tournaments"
    ON tournaments FOR ALL
    USING (host_id = auth.uid())
    WITH CHECK (host_id = auth.uid());

-- 3. Tournament participants
-- Participants can see who joined their own tournaments (both as host or participant)
CREATE POLICY "Participants visible to host and joined users"
    ON tournament_participants FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM tournaments t
            WHERE t.id = tournament_id
            AND (t.host_id = auth.uid() OR EXISTS (
                SELECT 1 FROM tournament_participants tp
                WHERE tp.tournament_id = t.id
                AND tp.profile_id = auth.uid()
            ))
        )
    );

-- Only authenticated users can join (insert)
CREATE POLICY "Authenticated users can join tournaments"
    ON tournament_participants FOR INSERT
    WITH CHECK (auth.uid() = profile_id);

-- Users can see/update their own participation
CREATE POLICY "Users manage own participation"
    ON tournament_participants FOR UPDATE
    USING (profile_id = auth.uid());

-- 4. Transactions - very restrictive (mostly for internal use / host verification)
CREATE POLICY "Users see own transactions"
    ON transactions FOR SELECT
    USING (profile_id = auth.uid());

CREATE POLICY "Only system can insert transactions"  -- you should use service_role key for inserts
    ON transactions FOR INSERT
    WITH CHECK (false);  -- normal users cannot insert - only backend/service role

-- Simple function + trigger to update prize_pool when participant pays
CREATE OR REPLACE FUNCTION update_tournament_prize_pool()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.payment_status = 'paid' AND OLD.payment_status != 'paid' THEN
        UPDATE tournaments
        SET prize_pool = prize_pool + NEW.amount
        WHERE id = NEW.tournament_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_prize_after_payment
    AFTER UPDATE OF payment_status
    ON tournament_participants
    FOR EACH ROW
    WHEN (NEW.payment_status = 'paid' AND OLD.payment_status != 'paid')
    EXECUTE FUNCTION update_tournament_prize_pool();
