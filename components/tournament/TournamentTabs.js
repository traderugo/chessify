"use client";

import { useRouter } from "next/navigation";

export default function TournamentTabs({ active, showUserTabs }) {
  const router = useRouter();

  return (
    <div className="flex gap-3">
      <TabButton
        active={active === "all"}
        onClick={() => router.push("/tournaments")}
      >
        All
      </TabButton>

      {showUserTabs && (
        <>
          <TabButton
            active={active === "created"}
            onClick={() => router.push("/tournaments?filter=created")}
          >
            Created by me
          </TabButton>

          <TabButton
            active={active === "joined"}
            onClick={() => router.push("/tournaments?filter=joined")}
          >
            Joined
          </TabButton>
        </>
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-200
        ${
          active
            ? "bg-blue-600 text-white dark:bg-blue-500 dark:text-white"
            : "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-700"
        }
      `}
    >
      {children}
    </button>
  );
}
