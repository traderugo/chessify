// app/tournaments/page.js
import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import TournamentListItemCompact from "@/components/tournament/TournamentListItemCompact";
import TournamentTabs from "@/components/tournament/TournamentTabs";
import CreateTournamentButton from "@/components/tournament/CreateTournamentButton";

/* ================= METADATA ================= */

export const metadata = {
  title: "Tournaments",
  description: "Browse tournaments",
};

/* ================= PAGE ================= */

export default async function TournamentsPage({ searchParams }) {
  const params = await searchParams;

  const filter = params?.filter || "all"; // all | created | joined
  const page = parseInt(params?.page || "1", 10);

  const LIMIT = 5;
  const from = (page - 1) * LIMIT;
  const to = from + LIMIT - 1;

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  /* ================= AUTH ================= */

  const {
    data: { user },
  } = await supabase.auth.getUser();

  /* ================= FETCH TOURNAMENTS ================= */

  let tournaments = [];
  let totalCount = 0;

  // ALL TOURNAMENTS (PUBLIC)
  if (!user || filter === "all") {
    const { data, count } = await supabase
      .from("tournaments")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    tournaments = data || [];
    totalCount = count || 0;
  }

  // CREATED BY USER
  if (user && filter === "created") {
    const { data, count } = await supabase
      .from("tournaments")
      .select("*", { count: "exact" })
      .eq("host_id", user.id)
      .order("created_at", { ascending: false })
      .range(from, to);

    tournaments = data || [];
    totalCount = count || 0;
  }

  // JOINED BY USER
if (user && filter === "joined") {
  const { data: participants, count: participantCount } = await supabase
    .from("tournament_participants")
    .select("tournament_id", { count: "exact" })
    .eq("profile_id", user.id);

  const tournamentIds = participants?.map(p => p.tournament_id) || [];

  const { data: tournamentsData, count: tournamentsCount } = await supabase
    .from("tournaments")
    .select("*", { count: "exact" })
    .in("id", tournamentIds)
    .order("created_at", { ascending: false })
    .range(from, to);

  tournaments = tournamentsData || [];
  totalCount = tournamentsCount ?? 0; // ← now correct!
}

  const totalPages = Math.ceil(totalCount / LIMIT);

  /* ================= RENDER ================= */

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pb-12">
      {/* HEADER */}
      <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <h1 className="text-xl font-bold">Tournaments</h1>
        <CreateTournamentButton />
      </div>

{/* BACK TO DASHBOARD */}
<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
  <Link
    href="/dashboard"
    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
               bg-white dark:bg-[#0d1117]
               text-sm font-medium text-gray-700 dark:text-gray-300
               hover:bg-gray-100 dark:hover:bg-[#161b22]
               transition"
  >
    ← Back to Dashboard
  </Link>
</div>

      {/* TABS */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <TournamentTabs active={filter} showUserTabs={!!user} />
      </div>

      {/* LIST */}
      <div className="max-w-4xl mx-auto px-1 sm:px-2 lg:px-4 mt-3">
          <div className="divide-y divide-gray-200 dark:divide-gray-800  overflow-y-auto">
            {tournaments.length === 0 ? (
              <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                No tournaments found
              </div>
            ) : (
              tournaments.map((tournament) => (
                <TournamentListItemCompact
                  key={tournament.id}
                  tournament={tournament}
                />
              ))
            )}
          </div>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          {page > 1 && (
            <Link
              href={`/tournaments?filter=${filter}&page=${page - 1}`}
              className="px-4 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-800 dark:text-blue-300"
            >
              Prev
            </Link>
          )}

          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>

          {page < totalPages && (
            <Link
              href={`/tournaments?filter=${filter}&page=${page + 1}`}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
