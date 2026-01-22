import { notFound } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Trophy,
  Calendar,
  Users,
  Wallet,
  ArrowRight,
  ScrollText,
} from 'lucide-react'
import TournamentCountdown from '@/components/tournament/TournamentCountdown'
import TournamentActions from '@/components/tournament/TournamentActions'

function calculateTournamentStatus(tournament) {
  const now = new Date()
  const startDate = new Date(tournament.start_date)
  const endDate = tournament.end_date ? new Date(tournament.end_date) : null

  if (tournament.status === 'completed' || tournament.status === 'cancelled') {
    return tournament.status
  }

  if (endDate && now > endDate) return 'completed'
  if (now >= startDate) return 'live'
  return 'upcoming'
}

async function getTournamentData(id) {
  const supabase = await createSupabaseServer()

  const { data: tournament } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', id)
    .single()

  if (!tournament) return null

  let hostProfile = null
  if (tournament.host_id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, chess_com_username')
      .eq('id', tournament.host_id)
      .single()

    hostProfile = profile
  }

  const prizePool = tournament.prize_pool || 0

  const { count: participants } = await supabase
    .from('tournament_participants')
    .select('*', { count: 'exact', head: true })
    .eq('tournament_id', id)

  const { data: { user } } = await supabase.auth.getUser()

  let isRegistered = false
  if (user) {
    const { data: entry } = await supabase
      .from('tournament_participants')
      .select('id')
      .eq('tournament_id', id)
      .eq('profile_id', user.id)
      .maybeSingle()

    isRegistered = !!entry
  }

  return {
    tournament,
    hostProfile,
    prizePool,
    participants: participants || 0,
    isHost: user?.id === tournament.host_id,
    isRegistered,
    actualStatus: calculateTournamentStatus(tournament),
  }
}

export default async function TournamentDetailsPage({ params }) {
  const { id } = await params
  const data = await getTournamentData(id)

  if (!data) notFound()

  const {
    tournament,
    hostProfile,
    prizePool,
    participants,
    isHost,
    isRegistered,
    actualStatus,
  } = data

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef3fb] to-[#f9fbff] dark:from-black dark:to-[#0b0f1a] pb-8">
           <div className="px-5 pt-2 max-w-6xl mx-auto">
        <div className="rounded-md bg-white/80 dark:bg-[#121826]  shadow-md p-2 space-y-4">
      {/* ANNOUNCEMENT MARQUEE */}
<div className="max-w-6xl mx-auto overflow-hidden">
  <div className={`
    relative border border-gray-500 rounded-lg shadow-md overflow-hidden
    ${actualStatus === 'upcoming' && 'bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-500/20'}
    ${actualStatus === 'live' && 'bg-green-50 border-green-100 dark:bg-green-900/20 dark:border-green-500/20'}
    ${actualStatus === 'completed' && 'bg-gray-100 border-gray-200 dark:bg-white/5 dark:border-white/10'}
  `}>
    <div className="whitespace-nowrap flex items-center animate-marquee px-4 py-2">

      {actualStatus === 'upcoming' && (
        <>
          <MarqueeItem>Upcoming tournament — register before it starts</MarqueeItem>
          <Separator />
          <MarqueeItem>Entry fees are refundable until kickoff</MarqueeItem>
          <Separator />
          <MarqueeItem>Review rules before playing</MarqueeItem>
        </>
      )}

      {actualStatus === 'live' && (
        <>
          <MarqueeItem>Tournament is live — matches in progress</MarqueeItem>
          <Separator />
          <MarqueeItem>Leaderboard updates in real time</MarqueeItem>
          <Separator />
          <MarqueeItem>Fair play rules are strictly enforced</MarqueeItem>
        </>
      )}

      {actualStatus === 'completed' && (
        <>
          <MarqueeItem>Tournament completed</MarqueeItem>
          <Separator />
          <MarqueeItem>Final standings are available</MarqueeItem>
          <Separator />
          <MarqueeItem>Prizes will be distributed shortly</MarqueeItem>
        </>
      )}

    </div>
  </div>
</div>

      {/* HERO CARD */}


          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-3 py-1 rounded-full">
              <Trophy size={14} />
              {tournament.category || 'General Competition'}
            </span>

            <span className="font-bold tracking-wide text-blue-600 dark:text-blue-400">
              {actualStatus.toUpperCase()}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">
            {tournament.title}
          </h1>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            Hosted by <span className="font-semibold">
              {hostProfile?.full_name || 'Unknown Host'}
            </span>
            {hostProfile?.chess_com_username && (
              <span className="block text-xs text-gray-400">
                @{hostProfile.chess_com_username}
              </span>
            )}
          </div>

          <TournamentCountdown startDate={tournament.start_date} />
        </div>
      </div>

    {/* STATS BAR */}
<div className="px-5 mt-3 max-w-6xl mx-auto">
  <div className="flex justify-between items-center bg-white/80 dark:bg-[#121826] backdrop-blur border border-gray-200 dark:border-white/10 rounded-md px-5 py-4 shadow-sm">


    <StatInline
      icon={<Calendar size={16} />}
      label="Entry Fee"
      value={
        tournament.entry_fee === 0
          ? 'Free'
          : `${tournament.currency} ${(tournament.entry_fee / 100).toFixed(2)}`
      }
    />

    <Divider />
    
    <StatInline
      icon={<Wallet size={16} />}
      label="Prize Pool"
      value={`${tournament.currency} ${(prizePool / 100).toFixed(2)}`}
    />

    <Divider />

    <StatInline
      icon={<Users size={16} />}
      label="Players"
      value={participants}
    />



    
  </div>
</div>


{/* LEADERBOARD */}
<div className="px-5 mt-6 max-w-6xl mx-auto">
  <Link href={`/tournaments/${id}/leaderboard`}>
    <div className="group cursor-pointer rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white shadow-md hover:shadow-lg transition">

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 opacity-90" />
          <div>
            <div className="text-base font-bold">Leaderboard</div>
            <p className="text-sm text-white/80">
              {participants} players competing
            </p>
          </div>
        </div>

        {/* LINK AFFORDANCE */}
        <ArrowRight
          className="w-5 h-5 opacity-80 transform transition-transform group-hover:translate-x-1"
        />
      </div>
    </div>
  </Link>
</div>

      {/* DESCRIPTION */}
      <div className="px-5 mt-6 max-w-6xl mx-auto">
        <div className="rounded-md bg-white/80 dark:bg-[#121826] backdrop-blur-xl shadow p-6 space-y-3">
          <div className="flex items-center gap-2 font-bold text-lg">
            <ScrollText />
            Rules & Details
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
            {tournament.description || 'No description provided.'}
          </p>
        </div>
      </div>

      {/* ACTIONS */}
      <TournamentActions
        tournamentId={id}
        isHost={isHost}
        isRegistered={isRegistered}
        tournamentStatus={actualStatus}
      />
    </div>
  )
}

function StatInline({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="text-blue-600 dark:text-blue-400">{icon}</div>
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="font-semibold capitalize">{value}</div>
      </div>
    </div>
  )
}

function Divider() {
  return (
    <div className="h-8 w-px bg-gray-200 dark:bg-white/10" />
  )
}

function MarqueeItem({ children }) {
  return (
    <span className="mx-4 opacity-80">
      {children}
    </span>
  )
}

function Separator() {
  return (
    <span className="opacity-40">•</span>
  )
}

