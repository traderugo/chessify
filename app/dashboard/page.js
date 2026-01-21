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
    <div className="min-h-screen bg-[#f6f8fb] dark:bg-black pb-20">
      <WelcomeCarousel username={username} greeting={greeting} />

      <div className="max-w-6xl mx-auto px-5 sm:px-6">
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-8">

{/* Dynamic Wallet */}
<div className="bg-gradient-to-br from-gray-800 to-gray-800 rounded-2xl p-6 text-white shadow-xl">
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <Wallet className="w-5 h-5" />
      <span className="font-medium">Wallet Balance</span>
    </div>
    <span className="text-sm bg-white/20 px-3 py-1 rounded-full">NGN</span>
  </div>
  
  {loadingBalance ? (
    <div className="flex  py-2">
      <Loader2 className="w-12 h-12 animate-spin" />
    </div>
  ) : (
    <div className="text-4xl font-bold mb-6">{formattedBalance}</div>
  )}
  
  <div className="flex gap-3">
    <Link href="/dashboard/history" className="flex-1">
      <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/25 text-white hover:bg-gray-50 rounded-lg transition-colors font-medium">
        <ArrowUpRight className="w-4 h-4" />
        History
      </button>
    </Link>
    
    <Link href="/dashboard/wallet" className="flex-1">
      <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/25 text-white hover:bg-gray-50 rounded-lg transition-colors font-medium">
        <ArrowDownLeft className="w-4 h-4" />
        Withdraw
      </button>
    </Link>
  </div>
</div>

            {/* Stats - update later with real data if needed */}
            <div className="bg-white dark:bg-[#161b22] rounded-xl border shadow-sm">
              <div className="flex divide-x">
                <StatItem icon={<Wallet size={18} />} value="₦0" label="Paid Out" />
                <StatItem icon={<Users size={18} />} value="3" label="Players" />
                <StatItem icon={<Calendar size={18} />} value="5" label="Upcoming" />
                <StatItem icon={<Trophy size={18} />} value="12" label="Hosted" />
              </div>
            </div>

            {/* Quick Actions */}
            <section>
              <h2 className="font-bold text-xl mb-4">Quick Actions</h2>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                <QuickActionCard href="/tournaments" icon={<Calendar size={28} />} title="Browse" />
                <QuickActionCard href="/tournaments/create" icon={<Target size={28} />} title="Create" />
                <QuickActionCard href="#" icon={<Sparkles size={28} />} title="Join" />
              </div>
            </section>
          </div>

          {/* RIGHT SIDEBAR - My Tournaments */}
          <div className="space-y-8">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg">My Tournaments</h3>
              <Link 
                href="/tournaments" 
                className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 transition-colors"
              >
                View All
                <ChevronRight size={16} />
              </Link>
            </div>

            {loadingTournaments ? (
              <div className="py-10 text-center text-gray-500 dark:text-gray-400">
                <div className="animate-pulse flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                  <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            ) : tournaments.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <Trophy size={28} className="text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  You haven't created any tournaments yet
                </p>
                <Link 
                  href="/tournaments/create"
                  className="mt-4 inline-block text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Create your first tournament →
                </Link>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 -mr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                  {tournaments.map((tournament) => (
                    <TournamentListItem
                      key={tournament.id}
                      tournament={tournament}
                      compact
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({ href, icon, title }) {
  return (
    <a
      href={href}
      className="bg-gray-700 text-white rounded-2xl flex flex-col items-center justify-center py-4 hover:scale-105 transition"
    >
      <div className="mb-2">{icon}</div>
      <span className="text-sm font-semibold">{title}</span>
    </a>
  );
}

function StatItem({ icon, value, label }) {
  return (
    <div className="flex-1 py-4 flex flex-col items-center">
      {icon}
      <p className="font-extrabold mt-1">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}