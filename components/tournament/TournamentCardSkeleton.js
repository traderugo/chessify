export default function TournamentCardSkeleton() {
  return (
    <div className="
      animate-pulse
      bg-white dark:bg-[#0d1117]
      border border-gray-200 dark:border-gray-800
      rounded-2xl
      p-4
      space-y-3
    ">
      {/* Banner */}
      <div className="h-32 rounded-xl bg-gray-200 dark:bg-gray-800" />

      {/* Title */}
      <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />

      {/* Meta */}
      <div className="flex gap-3">
        <div className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-800" />
      </div>

      {/* Footer */}
      <div className="h-9 rounded-xl bg-gray-200 dark:bg-gray-800" />
    </div>
  );
}
