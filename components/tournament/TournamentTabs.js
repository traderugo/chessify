import Link from "next/link";

export default function TournamentTabs({ active, showUserTabs }) {
  const tabs = [
    { key: "all", label: "All" },
    ...(showUserTabs
      ? [
          { key: "created", label: "Created" },
          { key: "joined", label: "Joined" },
        ]
      : []),
  ];

  return (
    <div className="flex bg-gray-100 dark:bg-[#0d1117] p-1 rounded-xl mx-3 my-3">
      {tabs.map((tab) => {
        const isActive = active === tab.key;

        return (
          <Link
            key={tab.key}
            href={`/tournaments?filter=${tab.key}`}
            className={`
              flex-1 text-center py-2 text-sm font-semibold rounded-lg transition
              ${
                isActive
                  ? "bg-white dark:bg-[#161b22] shadow text-blue-600"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
              }
            `}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
