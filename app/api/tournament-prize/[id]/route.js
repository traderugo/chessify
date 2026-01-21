// app/api/tournament-prize/[id]/route.js

import { getTournamentPrizePool } from "@/lib/tournament-utils";

export async function GET(request, { params }) {
  const { id } = await params;   // ← await it, like a true grandmaster

  if (!id) return Response.json({ error: 'No ID' }, { status: 400 });

  const pool = await getTournamentPrizePool(id);
  return Response.json({ pool });
}