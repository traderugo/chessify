'use client'

import { Edit, Trash2, LogOut, CheckCircle } from 'lucide-react'
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

  const cardBase = `
    rounded-xl
    border border-white/10
    backdrop-blur
    p-4
    flex flex-col items-center justify-center
    text-sm font-semibold
    transition
    hover:scale-[1.03]
    text-white
  `

  return (
    <div className="px-5 mt-10 max-w-6xl mx-auto space-y-6">

      {/* PRIMARY ACTIONS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

        {/* JOIN / REGISTERED */}
        {!isRegistered ? (
          <a
            href={`/tournaments/${tournamentId}/join`}
            className={`${cardBase} bg-gradient-to-br from-blue-600 to-blue-700`}
          >
            Join
          </a>
        ) : (
          <div
            className={`${cardBase} bg-gradient-to-br from-green-500 to-green-600 text-green-600 cursor-default`}
          >
            <CheckCircle size={18} className="mb-1" />
            Registered
          </div>
        )}

        {/* RESULTS */}
        <a
          href={`/tournaments/${tournamentId}/results`}
          className={`${cardBase} bg-gradient-to-br from-gray-700 to-gray-800`}
        >
          View Results
        </a>

        {/* LEAVE */}
        {canLeave && (
          <button
            onClick={handleLeave}
            disabled={leaving}
            className={`${cardBase} bg-gradient-to-br from-yellow-500 to-yellow-600 text-gray-600 disabled:opacity-50`}
          >
            <LogOut size={16} className="mb-1" />
            {leaving ? 'Leaving…' : 'Leave'}
          </button>
        )}
      </div>

      {/* HOST CONTROLS */}
      {isHost && (
        <div className="space-y-3">
          <div className="uppercase tracking-wide text-gray-400 font-bold">
            Host Controls
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

            <a
              href={`/tournaments/${tournamentId}/edit`}
              className={`${cardBase} bg-gradient-to-br text-white from-blue-500 to-blue-600`}
            >
              <Edit size={16} className="mb-1" />
              Edit
            </a>

            <button
              onClick={handleDelete}
              disabled={deleting}
              className={`${cardBase} bg-gradient-to-br from-red-500 to-red-600 text-white disabled:opacity-50`}
            >
              <Trash2 size={16} className="mb-1" />
              {deleting ? 'Deleting…' : 'Delete'}
            </button>

          </div>
        </div>
      )}
    </div>
  )
}
