import { useState } from 'react';

export default function ChessComLinkButton({ onLink }) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLink(username);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Chess.com Username" required />
      <button type="submit">Link</button>
    </form>
  );
}