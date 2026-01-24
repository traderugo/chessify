"use client";

import Link from 'next/link';
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Trophy,
  Calendar,
  Wallet,
  Users,
  Target,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  User,
  ChevronRight,
  Loader2
} from "lucide-react";
import WelcomeCarousel from "@/components/ui/WelcomeCarousel";
import TournamentListItem from "@/components/tournament/TournamentListItem";
import { createClient } from "@/lib/supabase/client";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [greeting, setGreeting] = useState("");
  const [tournaments, setTournaments] = useState([]);
  const [loadingTournaments, setLoadingTournaments] = useState(true);
  const [balance, setBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [user, loading, router]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  // Load hosted tournaments
  useEffect(() => {
    if (!user) return;

    const fetchTournaments = async () => {
      setLoadingTournaments(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .eq("host_id", user.id)
        .order("created_at", { ascending: false });

      if (!error) setTournaments(data || []);
      setLoadingTournaments(false);
    };

    fetchTournaments();
  }, [user]);

  // Load real wallet balance
  useEffect(() => {
    if (!user) return;

    const fetchBalance = async () => {
      setLoadingBalance(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from('user_wallet_balance')
        .select('current_balance')
        .eq('profile_id', user.id)
        .single();

      if (!error && data) {
        setBalance(data.current_balance || 0);
      } else {
        console.log("Balance fetch error:", error);
      }
      setLoadingBalance(false);
    };

    fetchBalance();
  }, [user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (!user) return null;

  const username = user.email.split("@")[0];
  const formattedBalance = balance !== null ? `₦${(balance / 100).toFixed(2)}` : '₦0.00';

 return (
  <div className="min-h-screen bg-[#eef2f7] dark:bg-black pb-24">
    <WelcomeCarousel username={username} greeting={greeting} />

    <div className="max-w-6xl mx-auto px-5 sm:px-6 mt-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">

          {/* WALLET CARD */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 via-blue-600 to-blue-600 text-white shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 font-medium">
                <Wallet className="w-5 h-5" />
                Wallet Balance
              </div>
              <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
                NGN
              </span>
            </div>

            {loadingBalance ? (
              <div className="flex py-6">
                <Loader2 className="w-10 h-10 animate-spin" />
              </div>
            ) : (
              <div className="text-4xl font-extrabold tracking-tight mb-6">
                {formattedBalance}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Link href="/dashboard/history">
                <button className="w-full py-3 rounded-xl bg-white/20 hover:bg-white/30 transition flex items-center justify-center gap-2 font-medium">
                  <ArrowUpRight size={16} />
                  History
                </button>
              </Link>

              <Link href="/dashboard/wallet">
                <button className="w-full py-3 rounded-xl bg-white/20 hover:bg-white/30 transition flex items-center justify-center gap-2 font-medium">
                  <ArrowDownLeft size={16} />
                  Withdraw
                </button>
              </Link>
            </div>
          </div>

{/* STATS */}
<div className="bg-white dark:bg-[#161b22] rounded-md border border-gray-200 dark:border-gray-800 shadow-sm">
  <div className="flex divide-x divide-gray-200 dark:divide-gray-800">
    <InlineStat icon={<Wallet size={18} />} value="₦0" label="Paid Out" />
    <InlineStat icon={<Users size={18} />} value="3" label="Players" />
    <InlineStat icon={<Calendar size={18} />} value="5" label="Upcoming" />
    <InlineStat icon={<Trophy size={18} />} value="12" label="Hosted" />
  </div>
</div>

{/* QUICK ACTIONS */}
<div className="bg-white dark:bg-[#161b22] rounded-md border border-gray-200 dark:border-gray-800 shadow-sm p-5">
  <h2 className="text-lg font-bold mb-4">
    Quick Actions
  </h2>

  <div className="grid grid-cols-3 gap-4">
    <QuickActionCard
      href="/tournaments"
      icon={<Calendar size={26} />}
      title="Browse"
    />
    <QuickActionCard
      href="/tournaments/create"
      icon={<Target size={26} />}
      title="Create"
    />
    <QuickActionCard
      href="#"
      icon={<Sparkles size={26} />}
      title="Join"
    />
  </div>
</div>

        </div>

       <div className="bg-white dark:bg-[#161b22] rounded-md border border-gray-200 dark:border-gray-800 shadow-sm p-5 space-y-4">

  <div className="flex items-center justify-between">
    <h3 className="font-bold text-lg">My Tournaments</h3>
    <Link
      href="/tournaments"
      className="text-sm text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1"
    >
      View all
      <ChevronRight size={16} />
    </Link>
  </div>

  {loadingTournaments ? (
    <div className="py-10 text-center text-gray-500">
      <Loader2 className="w-8 h-8 animate-spin mx-auto" />
    </div>
  ) : tournaments.length === 0 ? (
    <div className="py-12 text-center">
      <div className="w-14 h-14 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
        <Trophy className="text-gray-400" />
      </div>
      <p className="text-sm text-gray-500">
        No tournaments yet
      </p>
      <Link
        href="/tournaments/create"
        className="inline-block mt-3 text-sm text-blue-600 hover:underline"
      >
        Create one →
      </Link>
    </div>
  ) : (
    <div className="divide-y divide-gray-200 dark:divide-gray-800 max-h-[320px] overflow-y-auto -mx-5">
      {tournaments.map((tournament) => (
        <TournamentListItem
          key={tournament.id}
          tournament={tournament}
          compact
        />
      ))}
    </div>
  )}
</div>

      </div>
    </div>
  </div>
);
}

function InlineStat({ icon, value, label }) {
  return (
    <div className="flex-1 py-4 flex flex-col items-center justify-center">
      <div className="text-blue-500 mb-1">{icon}</div>
      <p className="text-lg font-bold leading-tight">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function QuickActionCard({ href, icon, title }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-2">
      <div
        className="
          w-16 h-16
          rounded-full
          bg-blue-100
          flex items-center justify-center
          shadow-md
          transition
          hover:scale-105
        "
      >
        <div className="text-blue-600 text-[28px]">
          {icon}
        </div>
      </div>

      <span className="text-sm font-semibold text-gray-700 text-center">
        {title}
      </span>
    </Link>
  )
}
