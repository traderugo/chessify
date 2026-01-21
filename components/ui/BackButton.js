"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      aria-label="Go back"
    >
      <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
    </button>
  );
}