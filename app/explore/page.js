// app/explore/page.js
import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { Trophy, Search, Sparkles, Flame, Star, Plus } from "lucide-react";

import TournamentListItemCompact from "@/components/tournament/TournamentListItemCompact";
import CreateTournamentButton from "@/components/tournament/CreateTournamentButton";
import TournamentCardSkeleton from "@/components/tournament/TournamentCardSkeleton";

export const metadata = {
  title: "Explore Tournaments • Chess Arena",
  description: "Discover the hottest, newest and most prestigious chess tournaments",
};

export default async function ExplorePage({ searchParams }) {
  const params = await searchParams;
  const tab = params?.tab || "new";
  const search = params?.search || "";
  const page = parseInt(params?.page || "1", 10);

  const LIMIT = 9;
  const from = (page - 1) * LIMIT;
  const to = from + LIMIT - 1;

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // ── Query ───────────────────────────────────────────────────────
  let query = supabase.from("tournaments").select("*", { count: "exact" });
  
  if (search.trim()) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }
  
  if (tab === "new")      query = query.order("created_at", { ascending: false });
  else if (tab === "top") query = query.order("participant_count", { ascending: false, nullsLast: true });
  else if (tab === "sponsored") {
    query = query
    .eq("is_sponsored", true)
    .order("sponsored_until", { ascending: false, nullsLast: true });
  }
  
  const { data: tournaments, count: totalCount } = await query.range(from, to);
  const isLoading = !tournaments;

  const totalPages = Math.ceil((totalCount || 0) / LIMIT);


  // ── Strategic presentation ──────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100">

      {/* Hero / Filter Bar */}
{/* HERO / FILTER BAR */}
<div className="relative bg-gradient-to-br from-blue-800 to-blue-800 text-white">
  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.15),transparent_60%)]" />
  
  <div className="relative max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-6">

<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 mb-2">
  <Sparkles size={14} />
  Discover your next battle
</div>

<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
  Explore Tournaments
</h1>

          {/* Search + Tabs */}
          <div className="mt-3 flex flex-col sm:flex-row gap-4 sm:items-center">
            <div className="relative border bg-white border-blue rounded-xl flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 " size={18} />
              <form action="/explore" method="get">
<input
  name="search"
  defaultValue={search}
  placeholder="Search tournaments..."
  className="
    w-full pl-11 pr-4 py-3.5
    bg-white/10 border border-blue/10
    rounded-xl
     placeholder-gray-400
    focus:outline-none focus:border-white/30
    transition
  "
/>

                <input type="hidden" name="tab" value={tab} />
              </form>
            </div>

            <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
              {[
                { id: "new", label: "Newest", icon: Sparkles },
                { id: "top", label: "Trending", icon: Flame },
                /*{ id: "sponsored", label: "Featured", icon: Star },*/
              ].map(({ id, label, icon: Icon }) => (
                <Link
                  key={id}
                  href={`/explore?tab=${id}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
className={`
  flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all
  ${tab === id
    ? "bg-white text-gray-900 shadow-md"
    : "bg-white/10 hover:bg-white/20 text-white"
  }
`}

                >
                  <Icon size={16} />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-6xl mx-auto mt-3  sm:px-6 lg:px-8 pb-20">
        {tournaments?.length === 0 ? (
          <div className="py-32 text-center">
            <p className="text-xl text-gray-500 dark:text-gray-400">
              No tournaments found matching your search.
            </p>
          </div>
        ) : (
<div className="grid sm:grid-cols-2 lg:grid-cols-3">
  {isLoading
    ? Array.from({ length: 6 }).map((_, i) => (
        <TournamentCardSkeleton key={i} />
      ))
    : tournaments.map((tournament) => (
        <TournamentListItemCompact
          key={tournament.id}
          tournament={tournament}
          variant="card"
        />
      ))}
</div>

        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-6 mt-5">
            {page > 1 && (
              <Link
                href={`/explore?tab=${tab}${search ? `&search=${encodeURIComponent(search)}` : ""}&page=${page - 1}`}
className="px-5 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                ← Prev
              </Link>
            )}

            <span className="px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">
              Page {page} of {totalPages}
            </span>

            {page < totalPages && (
              <Link
                href={`/explore?tab=${tab}${search ? `&search=${encodeURIComponent(search)}` : ""}&page=${page + 1}`}
className="px-5 py-2 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition"
              >
                Next →
              </Link>
            )}
          </div>
        )}
        {/* ================= CTA SECTION ================= */}
{/* CTA */}
<section className="relative mt-16 rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-xl overflow-hidden">
  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.2),transparent_60%)]" />

  <div className="relative px-6 py-8 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-6">
    <div>
      <h2 className="text-2xl sm:text-3xl font-extrabold">
        Ready to Host Your Tournament?
      </h2>
      <p className="mt-1 text-sm text-gray-300 max-w-md">
        Create, manage, and attract players in minutes. The board is waiting.
      </p>
    </div>

    <CreateTournamentButton
      className="
        px-8 py-4 rounded-full
        bg-white text-gray-900 font-bold
        shadow-lg
        hover:scale-105 active:scale-95
        transition
      "
    >
      <Plus className="mr-2" size={18} />
      Create Tournament
    </CreateTournamentButton>
  </div>
</section>


      </div>

    </div>
  );
}