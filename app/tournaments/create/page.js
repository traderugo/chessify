import TournamentForm from '@/components/tournament/CreateTournamentForm'
import { createTournament } from '@/app/actions/create-tournament'

export default function CreateTournamentPage() {
  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Create New Tournament</h1>
      <TournamentForm action={createTournament} />
    </div>
  )
}