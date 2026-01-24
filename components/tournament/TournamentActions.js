'use client'

import { Edit, Trash2, LogOut, CheckCircle, Trophy, UserPlus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export default function TournamentActions({
  tournamentId,
  isHost,
  isRegistered,
  tournamentStatus,
}) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [leaving, setLeaving] = useState(false)

  const handleDelete = async () => {
    if (!window.confirm('Delete this tournament permanently? This action cannot be undone.')) return

    setDeleting(true)
    try {
      const supabase = createClient()
      await supabase.from('tournaments').delete().eq('id', tournamentId)
      router.push('/tournaments')
      router.refresh()
    } catch {
      alert('Failed to delete tournament')
      setDeleting(false)
    }
  }

  const handleLeave = async () => {
    if (!window.confirm('Leave this tournament? Your entry fee will be refunded.')) return

    setLeaving(true)
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/leave`, { method: 'POST' })
      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
      alert('Failed to leave tournament')
    } finally {
      setLeaving(false)
    }
  }

  const canLeave = isRegistered && tournamentStatus === 'upcoming'

  const actionBase = `
    flex flex-col items-center
    gap-2
    text-sm font-semibold
    text-gray-700
    transition
  `

  const circleBase = `
    w-16 h-16
    rounded-full
    flex items-center justify-center
    shadow-md
    transition
    hover:scale-105
  `

  return (
    <div className="px-5 mt-3 max-w-6xl mx-auto space-y-10">

      {/* PRIMARY ACTIONS */}
      <div className="grid grid-cols-3 gap-6 justify-items-center">

        {/* JOIN / REGISTERED */}
        {!isRegistered ? (
          <a
            href={`/tournaments/${tournamentId}/join`}
            className={actionBase}
          >
            <div className={`${circleBase} bg-blue-100`}>
              <UserPlus size={30} className="text-blue-600" />
            </div>
            <span>Join</span>
          </a>
        ) : (
          <div className={actionBase}>
            <div className={`${circleBase} bg-green-100`}>
              <CheckCircle size={30} className="text-green-600" />
            </div>
            <span>Registered</span>
          </div>
        )}

        {/* RESULTS */}
        <a
          href={`/tournaments/${tournamentId}/results`}
          className={actionBase}
        >
          <div className={`${circleBase} bg-gray-100`}>
            <Trophy size={30} className="text-gray-700" />
          </div>
          <span>Results</span>
        </a>

        {/* LEAVE */}
        {canLeave && (
          <button
            onClick={handleLeave}
            disabled={leaving}
            className={`${actionBase} disabled:opacity-50`}
          >
            <div className={`${circleBase} bg-yellow-100`}>
              <LogOut size={30} className="text-yellow-600" />
            </div>
            <span>{leaving ? 'Leaving…' : 'Leave'}</span>
          </button>
        )}
      </div>

      {/* HOST CONTROLS */}
      {isHost && (
        <div className="space-y-4">
          <div className="uppercase tracking-wide text-gray-400 font-bold text-center">
            Host Controls
          </div>

          <div className="grid grid-cols-3 gap-6 justify-items-center">

            <a
              href={`/tournaments/${tournamentId}/edit`}
              className={actionBase}
            >
              <div className={`${circleBase} bg-blue-100`}>
                <Edit size={30} className="text-blue-600" />
              </div>
              <span>Edit</span>
            </a>

            <button
              onClick={handleDelete}
              disabled={deleting}
              className={`${actionBase} disabled:opacity-50`}
            >
              <div className={`${circleBase} bg-red-100`}>
                <Trash2 size={30} className="text-red-600" />
              </div>
              <span>{deleting ? 'Deleting…' : 'Delete'}</span>
            </button>

          </div>
        </div>
      )}
    </div>
  )
}
