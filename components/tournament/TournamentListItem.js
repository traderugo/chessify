import Link from "next/link";
import {
  Trophy,
  Users,
  Wallet,
  Calendar,
  ChevronRight,
} from "lucide-react";

export default function TournamentListItemCompact({
  tournament,
  compact = false,
}) {
  const startDate = tournament.start_date
    ? new Date(tournament.start_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "TBD";

  const createdAt = tournament.created_at
    ? new Date(tournament.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  return (
    <Link
      href={`/tournaments/${tournament.id}`}
      className="
        group block
        bg-white dark:bg-[#161b22]
        border border-gray-200 dark:border-gray-800
        transition-all
        hover:bg-gray-50 dark:hover:bg-gray-900/40
      "
    >
      <div className="flex items-center px-4 py-3 gap-3">

        {/* LEFT INDICATOR */}
        <div className="w-1 self-stretch rounded-full bg-blue-500/70" />

        {/* CONTENT */}
        <div className="flex-1 min-w-0">

          {/* TOP ROW */}
          <div className="flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400 mb-0.5">
            <Trophy size={12} />
            <span className="truncate">{tournament.category}</span>
          </div>

          {/* TITLE */}
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            {tournament.title}
          </h3>

          {/* META */}
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-gray-500 dark:text-gray-400">

            <span className="flex items-center gap-1">
              <Wallet size={11} />
              ₦{Number(tournament.prize_pool || 0).toLocaleString()}
            </span>

            {!compact && (
              <span className="flex items-center gap-1">
                <Users size={11} />
                {tournament.max_participants || "∞"} players
              </span>
            )}

            <span className="flex items-center gap-1">
              <Calendar size={11} />
              Starts {startDate}
            </span>

            <span className="truncate">
              Hosted on <span className="font-medium">{tournament.platform? tournament.platform : "N/A"}</span>
            </span>

            <span>
              Created {createdAt}
            </span>
          </div>
        </div>

        {/* CHEVRON */}
        <ChevronRight
          size={16}
          className="text-gray-500 group-hover:text-blue-800 transition-colors"
        />
      </div>
    </Link>
  );
}
