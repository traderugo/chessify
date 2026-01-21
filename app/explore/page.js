// app/explore/page.js
import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { Trophy, Search, Sparkles, Flame, Star, Plus } from "lucide-react";

import TournamentListItem from "@/components/tournament/TournamentListItem";
import CreateTournamentButton from "@/components/tournament/CreateTournamentButton";

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

  const totalPages = Math.ceil((totalCount || 0) / LIMIT);

  // ── Strategic presentation ──────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100">

      {/* Hero / Filter Bar */}
      <div className="relative pt-4 pb-3 md:pt-5 md:pb-5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-600/5 via-transparent to-purple-600/5 dark:from-gray-900/10 dark:to-purple-900/10 pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
            {/* Text */}
              <div className="inline-flex items-center gap-2 px-3 py-1 text-white bg-gradient-to-r from-gray-500 to-gray-500 rounded-full text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                <Sparkles size={14} />
                Discover your next battle
              </div>

              <h5 className="text-xl sm:text-xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
                Explore Tournaments
              </h5>
          {/* Search + Tabs */}
          <div className="mt-3 flex flex-col sm:flex-row gap-4 sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <form action="/explore" method="get">
                <input
                  name="search"
                  defaultValue={search}
                  placeholder="Search tournaments..."
                  className="w-full pl-11 pr-4 py-3.5 bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-gray-500/50 transition text-gray-900 dark:text-white placeholder-gray-500"
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
                      ? "bg-gradient-to-r from-gray-600 to-gray-500 text-white shadow-sm shadow-gray-500/20"
                      : "bg-gray-100/80 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/70"
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
      <div className="relative max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 pb-20">
        {tournaments?.length === 0 ? (
          <div className="py-32 text-center">
            <p className="text-xl text-gray-500 dark:text-gray-400">
              No tournaments found matching your search.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tournaments.map((tournament) => (
              <TournamentListItem
                key={tournament.id}
                tournament={tournament}
                variant="card"
                className="group bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:border-gray-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-gray-500/5"
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
                className="px-6 py-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
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
                className="px-6 py-3 rounded-full bg-gradient-to-r from-gray-600 to-gray-500 text-white font-medium hover:from-gray-700 hover:to-gray-600 transition shadow-md"
              >
                Next →
              </Link>
            )}
          </div>
        )}
        {/* ================= CTA SECTION ================= */}
<section className="relative bg-gradient-to-r from-gray-100 to-gray-100 text-gray rounded-xl shadow-md md:mx-16 px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 md:gap-8 mt-12">
  
  {/* Text */}
  <div className="text-center sm:text-left">
    <h2 className="text-2xl md:text-3xl font-extrabold">
      Ready to Host Your Tournament?
    </h2>
    <p className="mt-1 text-sm md:text-base text-gray">
      Create, manage, and attract players with just a click. Your next champion awaits!
    </p>
  </div>

  {/* Button */}
  <CreateTournamentButton
    className="flex items-center justify-center px-6 py-3 md:px-8 md:py-4 bg-white text-gray-600 font-bold rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 ease-out"
  >
    Create Tournament
  </CreateTournamentButton>
</section>

      </div>

    </div>
  );
}