"use client";

import { useRouter } from "next/navigation";
import {
  Trophy,
  Users,
  Calendar,
  Target,
  Sparkles,
  ShieldCheck,
  Clock,
  Star,
  Wallet,
  Globe,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100">
      {/* ================= HERO ================= */}
      <div className="relative px-4 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-transparent to-green-400/10 dark:from-blue-600/10 dark:to-green-500/10" />

        <div className="relative max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Text */}
            <div className="max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-gray-500 dark:bg-blue-900/30 text-white dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Tournament infrastructure with real payouts
              </div>

              <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
                Run Competitive <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-gray-500">
                  Tournaments. Get Paid on Time
                </span>
              </h1>

              <p className="mt-6 text-xl text-gray-700 dark:text-gray-300">
                Create, manage, and pay out tournaments for any game or sport.
                Support NGN entry fees, secure prize pools, and verified payouts —
                all in one platform.
              </p>

              <div className="mt-12 flex gap-4 flex-col sm:flex-row justify-center lg:justify-start">
                <button
                  onClick={() => router.push("/tournaments/create")}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-semibold shadow-lg hover:from-blue-600 hover:to-blue-700 transition flex items-center justify-center gap-3"
                >
                  Create a Tournament
                  <Target className="w-5 h-5" />
                </button>

                <button
                  onClick={() => router.push("/explore")}
                  className="px-8 py-4 border-2 border-gray-300 dark:border-gray-700 rounded-full font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  Explore Active Events
                </button>
              </div>
            </div>

            {/* Visual */}
            <div className="relative w-80 h-80 md:w-96 md:h-96 flex items-center justify-center">
              <div className="absolute inset-0 bg-green-300/20 rounded-full blur-3xl" />
              <div className="relative w-full h-full rounded-full bg-gradient-to-br from-green-200/20 to-transparent flex items-center justify-center">
                <div className="relative w-56 h-56">
  <div className="absolute inset-0 bg-green-400/20 rounded-full blur-3xl animate-pulse-slow" />
  <Trophy className="w-56 h-56 text-green-600 dark:text-green-400 drop-shadow-2xl animate-trophy relative" />
</div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= STATS ================= */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            ["1,200+", "Tournaments Created"],
            ["₦750M+", "Prizes Paid Out"],
            ["35+", "Tournament Formats"],
            ["250k", "Participants"],
          ].map(([num, label]) => (
            <div key={label}>
              <p className="text-4xl font-extrabold text-blue-600">{num}</p>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="bg-white dark:bg-[#0d1117] py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                icon: Calendar,
                title: "Create",
                desc: "Choose a format, set rules, entry fees (NGN or foreign), and lock the prize pool.",
              },
              {
                icon: Users,
                title: "Compete",
                desc: "Participants join, matches are auto-generated, and results are tracked.",
              },
              {
                icon: Wallet,
                title: "Payout",
                desc: "Winners are verified and paid directly to their wallets or bank accounts.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="text-center p-8 rounded-2xl bg-gray-50 dark:bg-[#161b22]"
              >
                <Icon className="w-10 h-10 mx-auto text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PAYMENTS & TRUST ================= */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              icon: ShieldCheck,
              title: "Secure Prize Pools",
              desc: "Entry fees are held safely and only released after verified results.",
            },
            {
              icon: Globe,
              title: "Local & Global Payments",
              desc: "Support NGN, cards, transfers, and international participants.",
            },
            {
              icon: Clock,
              title: "Fast & Transparent Payouts",
              desc: "No excuses. No delays. Winners get paid on schedule.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4">
              <Icon className="w-8 h-8 text-green-500" />
              <div>
                <p className="font-semibold">{title}</p>
                <p className="text-gray-600 dark:text-gray-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="p-3 bg-gradient-to-r from-blue-600 to-gray-500 py-20 text-center text-white">
        <h2 className="text-4xl font-extrabold">
          Build Tournaments People Trust
        </h2>
        <p className="mt-4 text-lg opacity-90">
          Run competitions. Handle money properly. Grow your community.
        </p>

        <button
          onClick={() => router.push("/auth/register")}
          className="mt-8 px-10 py-4 bg-white text-gray-900 font-bold rounded-full hover:scale-105 transition"
        >
          Get Started
        </button>
      </section>
    </div>
  );
}
