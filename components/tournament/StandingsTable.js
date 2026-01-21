export default function StandingsTable({ standings }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Player</th>
          <th>Points</th>
        </tr>
      </thead>
      <tbody>
        {standings.map((s, i) => (
          <tr key={i}>
            <td>{s.player}</td>
            <td>{s.points}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}