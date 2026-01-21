// app/api/tournament-participants/[id]/route.js
import { getParticipantCount } from "@/lib/tournament-utils";

export async function GET(request, { params }) {
  const { id } = await params;
  if (!id) return Response.json({ error: 'No ID' }, { status: 400 });

  const count = await getParticipantCount(id);
  return Response.json({ count });
}