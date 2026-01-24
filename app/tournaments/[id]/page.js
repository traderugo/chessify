'use client'

import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
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
import TournamentComments from '@/components/tournament/TournamentComments'



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

export default function TournamentDetailsPage({ params }) {
  const [id, setId] = useState(null)
  const [tournament, setTournament] = useState(null)
  const [hostProfile, setHostProfile] = useState(null)
  const [prizePool, setPrizePool] = useState(0)
  const [participants, setParticipants] = useState(0)
  const [isHost, setIsHost] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [actualStatus, setActualStatus] = useState('upcoming')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    params.then(p => setId(p.id))
  }, [params])

  useEffect(() => {
    if (!id) return

    const fetchTournamentData = async () => {
      const supabase = createClient()

      const { data: tournament } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', id)
        .single()

      if (!tournament) {
        notFound()
        return
      }

      setTournament(tournament)

      let hostProfile = null
      if (tournament.host_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, chess_com_username')
          .eq('id', tournament.host_id)
          .single()

        hostProfile = profile
        setHostProfile(profile)
      }

      const prizePool = tournament.prize_pool || 0
      setPrizePool(prizePool)

      const { count: participantCount } = await supabase
        .from('tournament_participants')
        .select('*', { count: 'exact', head: true })
        .eq('tournament_id', id)

      setParticipants(participantCount || 0)

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
        setIsRegistered(isRegistered)
        setIsHost(user?.id === tournament.host_id)
      }

      setActualStatus(calculateTournamentStatus(tournament))
      setLoading(false)
    }

    fetchTournamentData()
  }, [id])

  useEffect(() => {
    if (!tournament) return

    // Update status every second to check for transitions
    const statusInterval = setInterval(() => {
      const newStatus = calculateTournamentStatus(tournament)
      if (newStatus !== actualStatus) {
        setActualStatus(newStatus)
      }
    }, 1000)

    return () => clearInterval(statusInterval)
  }, [tournament, actualStatus])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#eef3fb] to-[#f9fbff] dark:from-black dark:to-[#0b0f1a] flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!tournament) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef3fb] to-[#f9fbff] dark:from-black dark:to-[#0b0f1a] pb-8">
      <div className="px-5 pt-2 max-w-6xl mx-auto">
        <div className="rounded-md bg-white/80 dark:bg-[#121826] shadow-md p-4 space-y-4">
          {/* ANNOUNCEMENT MARQUEE */}
          <div className="max-w-6xl mx-auto overflow-hidden">
            <div className={`
              relative border border-gray-500 shadow-md overflow-hidden
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
              <span className="block text-gray-400">
                @{hostProfile.chess_com_username}
              </span>
            )}
          </div>
          {/* Quick Stats */}
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(tournament.start_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          
                          <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
                          
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Users className="w-4 h-4" />
                            <span>{participants} participant{participants !== 1 ? 's' : ''}</span>
                          </div>
          
                          <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
                        </div>

          {/* Show countdown or completed message based on status */}
          {actualStatus === 'completed' ? (
            <CompletedMessage endDate={tournament.end_date} />
          ) : (
            <TournamentCountdown startDate={tournament.start_date} endDate={tournament.end_date} />
          )}
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

 {/* DESCRIPTION */}
      <div className="px-5 mt-3 max-w-6xl mx-auto">
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
            <div className="px-5 mt-3 max-w-6xl mx-auto">
        <div className="rounded-md bg-white/80 dark:bg-[#121826] backdrop-blur-xl shadow p-3 space-y-3">

      {/* ACTIONS */}
      <TournamentActions
        tournamentId={id}
        isHost={isHost}
        isRegistered={isRegistered}
        tournamentStatus={actualStatus}
      />

      </div>
      </div>
      {/* COMMENTS PREVIEW - Shows last 2 comments */}
      <TournamentComments tournamentId={id} isHost={isHost} previewMode={true} />
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

function CompletedMessage({ endDate }) {
  const [timeAgo, setTimeAgo] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!endDate || !mounted) return

    const calculateTimeAgo = () => {
      const now = Date.now()
      const end = new Date(endDate).getTime()
      const diff = now - end

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((diff / (1000 * 60)) % 60)

      let message = ''
      
      if (days > 0) {
        message += `${days} day${days === 1 ? '' : 's'} ago`
      } else if (hours > 0) {
        message += `${hours} hour${hours === 1 ? '' : 's'} ago`
      } else if (minutes > 0) {
        message += `${minutes} minute${minutes === 1 ? '' : 's'} ago`
      } else {
        message += 'just now'
      }

      setTimeAgo(message)
    }

    calculateTimeAgo()
    const interval = setInterval(calculateTimeAgo, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [endDate, mounted])

  if (!mounted) {
    return (
      <div className="bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-gray-100 p-4 sm:p-6 rounded-lg">
        <p className="text-sm mb-3 font-medium uppercase tracking-wide opacity-70">Check leaderboard for winners</p>
        <div className="bg-black text-white p-4 sm:p-6 rounded-lg">
          <div className="text-center">
            <p className="text-3xl sm:text-4xl md:text-5xl font-bold">COMPLETED</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-gray-100 p-4 sm:p-6 rounded-lg">
      <p className="text-sm mb-3 font-medium uppercase tracking-wide opacity-70">Ended</p>
      <div className="bg-black text-white p-4 sm:p-6 rounded-lg">
        <div className="text-center">
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">COMPLETED</p>
          <p className="text-sm sm:text-base opacity-70">{timeAgo}</p>
        </div>
      </div>
    </div>
  )
}

