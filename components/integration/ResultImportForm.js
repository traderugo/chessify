import { useState } from 'react';

export default function ResultImportForm({ onSubmit }) {
  const [gameId, setGameId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(gameId);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={gameId} onChange={(e) => setGameId(e.target.value)} placeholder="Game ID" required />
      <button type="submit">Import Results</button>
    </form>
  );
}