import Link from "next/link";
import {
  Trophy,
  Users,
  Wallet,
  Calendar,
  ChevronRight,
} from "lucide-react";

export default function TournamentListItem({ tournament, compact = false }) {
  const startDate = tournament.start_date
    ? new Date(tournament.start_date)
        .toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
        .replace(/,([^,]*)$/, "$1")
    : "TBD";

  return (
    <Link
      href={`/tournaments/${tournament.id}`}
      className="
        group block
        bg-white dark:bg-[#161b22]
        border border-gray-200 dark:border-gray-800
        rounded-lg
        shadow-sm hover:shadow-xl
        transition-all mt-3
        overflow-hidden
      "
    >
      <div className="flex items-stretch">

        {/* LEFT ACCENT STRIP */}
        <div className="w-1 bg-gradient-to-b from-blue-500 to-gray-500" />

        {/* CONTENT */}
        <div className="flex-1 px-5 py-4 flex items-start justify-between gap-5">

          {/* TEXT CONTENT */}
          <div className="min-w-0 space-y-3">

            {/* CATEGORY */}
            <div className="flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400">
              <Trophy size={16} className="stroke-2" />
              <span className="truncate">{tournament.category}</span>
            </div>

            {/* TITLE */}
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
              {tournament.title}
            </h3>

            {/* META */}
            <div className="flex flex-wrap items-center gap-2 text-sm">

              {/* PRIZE */}
              <span className="
                inline-flex items-center gap-2
                px-3 py-1.5
                rounded-full
                bg-blue-50 text-blue-800
                dark:bg-blue-900/30 dark:text-blue-300
              ">
                <Wallet size={14} className="stroke-2" />
                ₦{Number(tournament.prize_pool || 0).toLocaleString()}
              </span>

              {/* PARTICIPANTS */}
              {!compact && (
                <span className="
                  inline-flex items-center gap-2
                  px-3 py-1.5
                  rounded-full
                  bg-purple-50 text-purple-800
                  dark:bg-purple-900/30 dark:text-purple-300
                ">
                  <Users size={14} className="stroke-2" />
                  {tournament.max_participants || "∞"} players
                </span>
              )}

              {/* DATE */}
              <span className="
                inline-flex items-center gap-2
                px-3 py-1.5
                rounded-full
                bg-gray-100 text-gray-700
                dark:bg-gray-800 dark:text-gray-300
              ">
                <Calendar size={14} className="stroke-2" />
                {startDate}
              </span>
            </div>
          </div>

          {/* CHEVRON */}
          <ChevronRight
            size={20}
            className="mt-1 text-gray-400 group-hover:text-blue-500 transition-colors"
          />
        </div>
      </div>
    </Link>
  );
}
