export default function PairingCard({ pairing }) {
  return (
    <div className="border p-4 mb-4">
      <p>{pairing.player1} vs {pairing.player2}</p>
      <p>Instructions: Challenge on chess.com</p>
    </div>
  );
}