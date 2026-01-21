'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import TournamentForm from '@/components/tournament/CreateTournamentForm'
import { updateTournament } from '@/app/actions/update-tournament'


export default function EditTournamentPage() {
  const { user, loading: authLoading } = useAuth()
  const params = useParams()
  const id = params.id
  const router = useRouter()

  const [tournament, setTournament] = useState(null)
  const [error, setError] = useState(null)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (authLoading || !user || !id) return

    async function loadTournament() {
      setFetching(true)
      setError(null)

      try {
        const res = await fetch(`/api/tournaments/${id}`, {
          credentials: 'include',           // ← very important for cookies/auth
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (!res.ok) {
          let errorMessage = `Error ${res.status}`
          try {
            const errData = await res.json()
            errorMessage = errData.error || errorMessage
          } catch {}
          throw new Error(errorMessage)
        }

        const data = await res.json()
        setTournament(data)
      } catch (err) {
        console.error('Failed to load tournament:', err)
        setError(err.message || 'Could not load tournament. Please try again.')
      } finally {
        setFetching(false)
      }
    }

    loadTournament()
  }, [user, authLoading, id])

  // Loading state
  if (authLoading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600 animate-pulse">Loading tournament...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-xl text-red-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // No tournament found
  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-700">Tournament not found</p>
      </div>
    )
  }

  // Success → show the form
  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Edit Tournament</h1>
      
      <TournamentForm
        initialData={tournament}
        action={async (formData) => {
          const result = await updateTournament(id, formData)
          if (!result?.error) {
            router.push(`/tournaments/${id}`)
          }
          return result
        }}
      />
    </div>
  )
}