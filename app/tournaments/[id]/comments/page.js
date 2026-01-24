'use client'

import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Trophy, MessageCircle, Calendar, Users } from 'lucide-react'
import TournamentComments from '@/components/tournament/TournamentComments'

export default function TournamentCommentsPage({ params }) {
  const [id, setId] = useState(null)
  const [tournament, setTournament] = useState(null)
  const [hostProfile, setHostProfile] = useState(null)
  const [participants, setParticipants] = useState(0)
  const [isHost, setIsHost] = useState(false)
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

      // Fetch host profile
      if (tournament.host_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, chess_com_username')
          .eq('id', tournament.host_id)
          .single()

        setHostProfile(profile)
      }

      // Get participant count
      const { count: participantCount } = await supabase
        .from('tournament_participants')
        .select('*', { count: 'exact', head: true })
        .eq('tournament_id', id)

      setParticipants(participantCount || 0)

      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setIsHost(user?.id === tournament.host_id)
      }

      setLoading(false)
    }

    fetchTournamentData()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#eef3fb] to-[#f9fbff] dark:from-black dark:to-[#0b0f1a] flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!tournament) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef3fb] to-[#f9fbff] dark:from-black dark:to-[#0b0f1a] pb-4">
      <div className="px-5 pt-4 max-w-6xl mx-auto">

        {/* Tournament Header Card */}
        <div className="rounded-md bg-white/80 dark:bg-[#121826] shadow-sm p-6 mb-2 border border-gray-200 dark:border-white/10">
          <div className="flex items-start gap-4">


            
            <div className="flex-1 min-w-0">
              {/* Category Badge */}
              <div className="mb-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-3 py-1 rounded-full">
                  {tournament.category || 'General Competition'}
                </span>
              </div>

              {/* Tournament Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight mb-2">
                {tournament.title}
              </h1>

              {/* Host Info */}
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Hosted by{' '}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {hostProfile?.full_name || 'Unknown Host'}
                </span>
                {hostProfile?.chess_com_username && (
                  <span className="text-gray-500 dark:text-gray-500 ml-1">
                    @{hostProfile.chess_com_username}
                  </span>
                )}
              </div>
                 {/* Back Button */}
        <Link href={`/tournaments/${id}`}>
          <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition mb-6 group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Tournament</span>
          </button>
        </Link>
              {/* Quick Stats */}
              <div className="flex flex-wrap items-center gap-4 text-sm">

                <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />

                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <MessageCircle className="w-4 h-4" />
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    Discussion
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Discussion Banner */}
          <div className=" pt-4 border-t border-gray-200 dark:border-white/10">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <MessageCircle className="w-4 h-4" />
              <span>
                Share strategies, ask questions, and connect with other players
              </span>
            </div>
          </div>
        </div>

      </div>
        {/* Comments Section */}
        <TournamentComments tournamentId={id} isHost={isHost} previewMode={false} />
    </div>
  )
}