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
        bg-white dark:bg-[#0d1117]
        hover:bg-gray-50 dark:hover:bg-[#161b22]
        transition-colors
      "
    >
      <div className="flex items-start gap-4 px-5 py-4">

        {/* LEFT ACCENT */}
        <div className="w-1 self-stretch rounded-full bg-blue-500/70" />

       

        {/* CONTENT */}
        <div className="flex-1 min-w-0">

          {/* CATEGORY */}
          <div className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
            <Trophy size={14} />
            <span className="truncate">{tournament.category}</span>
          </div>

          {/* TITLE */}
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
            {tournament.title}
          </h3>

          {/* META */}
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400">

            <span className="flex items-center gap-1.5">
              <Wallet size={14} />
              ₦{Number(tournament.prize_pool || 0).toLocaleString()}
            </span>

            {!compact && (
              <span className="flex items-center gap-1.5">
                <Users size={14} />
                {tournament.max_participants || "∞"} players
              </span>
            )}

            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              Starts {startDate}
            </span>

            <span className="truncate">
              Hosted by{" "}
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {tournament.host_name}
              </span>
            </span>

            <span>Created {createdAt}</span>
          </div>
        </div>

        {/* CHEVRON */}
        <ChevronRight
          size={18}
          className="mt-2 text-gray-500 group-hover:text-blue-800 transition-colors"
        />
      </div>
    </Link>
  );
}
