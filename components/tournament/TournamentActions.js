'use client'

import { Edit, Trash2, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export default function TournamentActions({ tournamentId, isHost, isRegistered, tournamentStatus }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [leaving, setLeaving] = useState(false)

  const handleDelete = async () => {
    if (!window.confirm('Delete this tournament permanently? This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', tournamentId)

      if (error) throw error

      router.push('/tournaments')
      router.refresh()
    } catch (error) {
      console.error('Delete failed:', error)
      alert('Failed to delete tournament')
      setDeleting(false)
    }
  }

  const handleLeave = async () => {
    if (!window.confirm('Leave this tournament? Your entry fee will be refunded.')) {
      return
    }

    setLeaving(true)
    try {
      const supabase = createClient()
      
      // Call your leave tournament API
      const response = await fetch(`/api/tournaments/${tournamentId}/leave`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to leave tournament')
      }

      alert('Successfully left tournament. Your entry fee has been refunded.')
      router.refresh()
    } catch (error) {
      console.error('Leave failed:', error)
      alert(error.message || 'Failed to leave tournament')
    } finally {
      setLeaving(false)
    }
  }

  const canLeave = isRegistered && tournamentStatus === 'upcoming'

  return (
    <div className="px-6 mt-8 max-w-6xl mx-auto space-y-4">
      {!isRegistered ? (
        
         <a href={`/tournaments/${tournamentId}/join`}
          className="block w-full bg-gray-600 text-white dark:bg-gray-800 py-4 rounded-2xl text-center font-semibold hover:bg-gray-700 transition-colors"
        >
          Join Tournament
        </a>
      ) : (
        <div className="block w-full bg-green-600 text-white py-4 rounded-xl text-center font-semibold">
          ✓ Registered
        </div>
      )}

      {canLeave && (
        <button
          onClick={handleLeave}
          disabled={leaving}
          className="block w-full bg-yellow-600 hover:bg-yellow-700 text-white py-4 rounded-2xl text-center font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <LogOut size={20} />
          {leaving ? 'Leaving...' : 'Leave Tournament'}
        </button>
      )}

      
        <a href={`/tournaments/${tournamentId}/results`}
        className="block w-full bg-gray-200 dark:bg-gray-800 py-4 rounded-2xl text-center font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
      >
        View Results
      </a>

      {isHost && (
        <div className="mt-6">
          <div className="font-bold text-gray-500 mb-3">Host Controls</div>
          <div className="grid grid-cols-2 gap-4">
            
              <a href={`/tournaments/${tournamentId}/edit`}
              className="flex justify-center items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white py-4 rounded-2xl font-semibold transition-colors"
            >
              <Edit size={20} />
              Edit
            </a>

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex justify-center items-center gap-2 bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={20} />
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}