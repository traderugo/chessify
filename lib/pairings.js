// lib/pairings.js

export function generatePairings(players) {
  if (!Array.isArray(players)) {
    throw new Error("Players must be an array");
  }

  const sorted = [...players].sort((a, b) => b.score - a.score);

  const pairings = [];
  const used = new Set();

  for (let i = 0; i < sorted.length; i++) {
    const playerA = sorted[i];
    if (used.has(playerA.id)) continue;

    let opponentIndex = -1;

    for (let j = i + 1; j < sorted.length; j++) {
      const playerB = sorted[j];
      if (used.has(playerB.id)) continue;

      const alreadyPlayed =
        playerA.previousOpponents?.includes(playerB.id) ||
        playerB.previousOpponents?.includes(playerA.id);

      if (!alreadyPlayed) {
        opponentIndex = j;
        break;
      }
    }

    if (opponentIndex === -1) {
      for (let j = i + 1; j < sorted.length; j++) {
        if (!used.has(sorted[j].id)) {
          opponentIndex = j;
          break;
        }
      }
    }

    if (opponentIndex === -1) {
      pairings.push({ player1: playerA, player2: null, result: "bye" });
      used.add(playerA.id);
      continue;
    }

    const playerB = sorted[opponentIndex];

    pairings.push({ player1: playerA, player2: playerB });
    used.add(playerA.id);
    used.add(playerB.id);
  }

  return pairings;
}
