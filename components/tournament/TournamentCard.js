export default function TournamentCard({ tournament }) {
  return (
    <div className="border p-4 mb-4">
      <h2>{tournament.name}</h2>
      <p>{tournament.description}</p>
      <p>Start Date: {tournament.start_date}</p>
    </div>
  );
}