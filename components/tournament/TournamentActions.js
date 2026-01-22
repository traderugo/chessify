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

  return (
    <div className="px-5 mt-10 max-w-6xl mx-auto space-y-4">

      {/* PRIMARY */}
      {!isRegistered ? (
        <a
          href={`/tournaments/${tournamentId}/join`}
          className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-center transition"
        >
          Join Tournament
        </a>
      ) : (
        <div className="w-full bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold">
          <CheckCircle size={18} />
          Registered
        </div>
      )}

      {/* LEAVE */}
      {canLeave && (
        <button
          onClick={handleLeave}
          disabled={leaving}
          className="w-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-700 dark:text-yellow-400 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-yellow-500/20 transition disabled:opacity-50"
        >
          <LogOut size={16} />
          {leaving ? 'Leaving…' : 'Leave Tournament'}
        </button>
      )}

      {/* RESULTS */}
      <a
        href={`/tournaments/${tournamentId}/results`}
        className="block w-full bg-white/80 dark:bg-[#121826] border border-gray-200 dark:border-white/10 py-3 rounded-xl text-center font-semibold hover:bg-white transition"
      >
        View Results
      </a>

      {/* HOST */}
      {isHost && (
        <div className="pt-5 space-y-3">
          <div className="text-xs uppercase tracking-wide text-gray-400 font-bold">
            Host Controls
          </div>

          <div className="grid grid-cols-2 gap-3">
            <a
              href={`/tournaments/${tournamentId}/edit`}
              className="bg-white/80 dark:bg-[#121826] border border-gray-200 dark:border-white/10 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold hover:bg-white transition"
            >
              <Edit size={16} />
              Edit
            </a>

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold hover:bg-red-500/20 transition disabled:opacity-50"
            >
              <Trash2 size={16} />
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
