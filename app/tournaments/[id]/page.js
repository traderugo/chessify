// app/tournaments/[id]/page.jsx - COMPLETE FILE
import { notFound } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Trophy,
  Calendar,
  Users,
  Wallet,
  ScrollText,
  PlayCircle,
} from 'lucide-react'
import TournamentCountdown from '@/components/tournament/TournamentCountdown'
import TournamentActions from '@/components/tournament/TournamentActions'

// Auto-calculate tournament status based on time
function calculateTournamentStatus(tournament) {
  const now = new Date()
  const startDate = new Date(tournament.start_date)
  const endDate = tournament.end_date ? new Date(tournament.end_date) : null

  // Respect manual overrides
  if (tournament.status === 'completed' || tournament.status === 'cancelled') {
    return tournament.status
  }

  if (endDate && now > endDate) {
    return 'completed'
  }

  if (now >= startDate) {
    return 'live'
  }

  return 'upcoming'
}

async function getTournamentData(id) {
  const supabase = await createSupabaseServer()

  // Fetch tournament
  const { data: tournament, error: tourneyErr } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', id)
    .single()

  if (tourneyErr || !tournament) {
    return null
  }

  // Fetch host profile
  let hostProfile = null
  if (tournament.host_id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, chess_com_username')
      .eq('id', tournament.host_id)
      .single()

    hostProfile = profile
  }

  // Prize pool (direct)
  const prizePool = tournament.prize_pool || 0

  // Participant count
  const { count: participants } = await supabase
    .from('tournament_participants')
    .select('*', { count: 'exact', head: true })
    .eq('tournament_id', id)

  // Current user
  const { data: { user } } = await supabase.auth.getUser()

  // Registration check
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

  if (!data) {
    notFound()
  }

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
    <div className="min-h-screen bg-gray-50 dark:bg-black pb-20">
      {/* HERO */}
      <div className="relative bg-gradient-to-br from-blue-800/10 via-transparent to-blue-800/10 border text-blue px-5 sm:px-8 pt-6 pb-8 rounded-b-2xl shadow-sm">
        <div className="max-w-6xl mx-auto relative">
          <span className="inline-flex items-center gap-2 text-white text-xs bg-blue-500 px-3 py-1 rounded-full mb-2">
            <Trophy size={14} />
            {tournament.category || 'General Competition'}
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold mb-1">
            {tournament.title}
          </h1>

          <div className="flex items-center gap-3 mb-4">
            <div>
              <p className="text-sm font-medium">
                Hosted by{' '}
                <span className="font-bold">
                  {hostProfile?.full_name || 'Unknown Host'}
                </span>
              </p>
              {hostProfile?.chess_com_username && (
                <p className="text-xs text-white/70">
                  @{hostProfile.chess_com_username}
                </p>
              )}
            </div>
          </div>

          <p className="text-sm mb-3">Compete. Win. Get paid.</p>

          <TournamentCountdown startDate={tournament.start_date} />
        </div>
      </div>

      {/* INFO GRID */}
      <div className="px-6 mt-4 grid grid-cols-2 gap-4 max-w-6xl mx-auto">
        <InfoCard
          icon={<Wallet size={20} />}
          label="Prize Pool"
          value={`${tournament.currency} ${(prizePool / 100).toFixed(2)}`}
        />
        <InfoCard
          icon={<PlayCircle size={20} />}
          label="Entry Fee"
          value={
            tournament.entry_fee === 0
              ? 'Free'
              : `${tournament.currency} ${(tournament.entry_fee / 100).toFixed(2)}`
          }
        />
        <InfoCard
          icon={<Users size={20} />}
          label="Participants"
          value={participants.toString()}
        />
        <InfoCard
          icon={<Calendar size={20} />}
          label="Status"
          value={actualStatus.toUpperCase()}
        />
      </div>

      {/* LEADERBOARD LINK */}
      <div className="px-6 mt-4 max-w-6xl mx-auto">
        <Link href={`/tournaments/${id}/leaderboard`}>
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8" />
                <div>
                  <h3 className="text-lg font-bold">View Leaderboard</h3>
                  <p className="text-sm text-white/80">
                    See rankings and participants ({participants} joined)
                  </p>
                </div>
              </div>
              <div className="bg-white/20 rounded-full p-2 group-hover:bg-white/30 transition-colors">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* DESCRIPTION */}
      <div className="px-6 mt-4 max-w-6xl mx-auto">
        <div className="bg-white dark:bg-[#161b22] rounded-2xl p-5 shadow space-y-3">
          <div className="flex items-center gap-2 text-lg font-bold">
            <ScrollText />
            Description & Rules
          </div>
          <p className="text-sm text-gray-600 dark:text-blue-400 whitespace-pre-line">
            {tournament.description || 'No description provided by the host.'}
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

function InfoCard({ icon, label, value }) {
  return (
    <div className="bg-white dark:bg-[#161b22] rounded-xl p-3 shadow flex items-center gap-3 text-sm">
      <div className="text-blue-600 dark:text-blue-400">{icon}</div>
      <div>
        <p className="text-xs text-blue-500 dark:text-blue-400">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  )
}