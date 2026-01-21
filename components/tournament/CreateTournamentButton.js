"use client";

import { useRouter } from "next/navigation";

export default function CreateTournamentButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/tournaments/create")}
      className="
        bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600
        text-white font-semibold
        py-2 px-4 rounded-full
        transition-colors duration-200
      "
    >
      Create
    </button>
  );
}
