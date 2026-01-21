// app/tournaments/[id]/leaderboard/page.jsx
import { notFound } from 'next/navigation';
import { createSupabaseServer } from '@/lib/supabase/server';
import { ArrowLeft, Trophy, Medal, Award, Users, Crown, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

async function getLeaderboardData(tournamentId) {
  const supabase = await createSupabaseServer();

  // Fetch tournament details
  const { data: tournament, error: tournamentError } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', tournamentId)
    .single();

  if (tournamentError || !tournament) {
    return null;
  }

  // Fetch participants with their profile information
  const { data: participants, error: participantsError } = await supabase
    .from('tournament_participants')
    .select(`
      id,
      profile_id,
      payment_status,
      payment_reference,
      joined_at,
      rank,
      score,
      prize_amount,
      profiles (
        full_name,
        chess_com_username
      )
    `)
    .eq('tournament_id', tournamentId)
    .order('rank', { ascending: true, nullsFirst: false })
    .order('score', { ascending: false, nullsFirst: false })
    .order('joined_at', { ascending: true });

  if (participantsError) {
    console.error('Error fetching participants:', participantsError);
    return { tournament, participants: [] };
  }

  return {
    tournament,
    participants: participants || []
  };
}

export default async function LeaderboardPage({ params }) {
  const { id } = await params;
  const data = await getLeaderboardData(id);

  if (!data) {
    notFound();
  }

  const { tournament, participants } = data;

  // Calculate stats
  const totalParticipants = participants.length;
  const paidParticipants = participants.filter(p => p.payment_status === 'paid').length;
  const rankedParticipants = participants.filter(p => p.rank).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white px-6 py-8 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <Link 
            href={`/tournaments/${id}`}
            className="inline-flex items-center text-white/90 hover:text-white mb-4 text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tournament
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Leaderboard</h1>
          </div>
          
          <p className="text-white/80 text-lg mb-4">{tournament.title}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard 
              icon={<Users className="w-5 h-5" />}
              label="Total"
              value={totalParticipants}
            />
            <StatCard 
              icon={<CheckCircle className="w-5 h-5" />}
              label="Paid"
              value={paidParticipants}
            />
            <StatCard 
              icon={<Trophy className="w-5 h-5" />}
              label="Ranked"
              value={rankedParticipants}
            />
          </div>
        </div>
      </div>

      {/* Leaderboard Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {participants.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Top 3 Podium */}
            {rankedParticipants > 0 && <TopThreePodium participants={participants} tournament={tournament} />}

            {/* All Participants List */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-6 h-6" />
                All Participants
              </h2>
              
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Rank
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Player
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Score
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Prize
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {participants.map((participant, index) => (
                        <ParticipantRow 
                          key={participant.id}
                          participant={participant}
                          index={index}
                          tournament={tournament}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
      <div className="flex items-center gap-2 text-white/80 mb-1">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function TopThreePodium({ participants, tournament }) {
  const topThree = participants.filter(p => p.rank && p.rank <= 3).slice(0, 3);
  
  if (topThree.length === 0) return null;

  // Sort for podium display (2nd, 1st, 3rd)
  const podiumOrder = [
    topThree.find(p => p.rank === 2),
    topThree.find(p => p.rank === 1),
    topThree.find(p => p.rank === 3)
  ].filter(Boolean);

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Crown className="w-6 h-6 text-yellow-500" />
        Top Performers
      </h2>
      
      <div className="flex items-end justify-center gap-6 mb-8">
        {podiumOrder.map((participant, displayIndex) => {
          const actualRank = participant.rank;
          const heights = { 1: 'h-48', 2: 'h-40', 3: 'h-32' };
          const colors = { 
            1: 'from-yellow-400 to-yellow-600', 
            2: 'from-gray-300 to-gray-500', 
            3: 'from-orange-400 to-orange-600' 
          };
          const icons = {
            1: <Crown className="w-8 h-8 text-white" />,
            2: <Medal className="w-7 h-7 text-white" />,
            3: <Award className="w-6 h-6 text-white" />
          };

          return (
            <div key={participant.id} className="flex flex-col items-center">
              {/* Avatar */}
              <div className="mb-3 relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg">
                  {participant.profiles?.avatar_url ? (
                    <img 
                      src={participant.profiles.avatar_url} 
                      alt={participant.profiles.full_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    participant.profiles?.full_name?.[0]?.toUpperCase() || '?'
                  )}
                </div>
                
                {/* Rank Badge */}
                <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br ${colors[actualRank]} flex items-center justify-center shadow-lg`}>
                  <span className="text-white font-bold text-sm">{actualRank}</span>
                </div>
              </div>

              {/* Name */}
              <p className="font-bold text-gray-900 mb-1 text-center">
                {participant.profiles?.full_name || 'Unknown Player'}
              </p>
              {participant.profiles?.chess_com_username && (
                <p className="text-xs text-gray-500 mb-2">
                  @{participant.profiles.chess_com_username}
                </p>
              )}

              {/* Score */}
              <div className="bg-white rounded-lg px-3 py-1 shadow mb-3">
                <p className="text-sm font-semibold text-gray-700">
                  {participant.score || 0} pts
                </p>
              </div>

              {/* Podium */}
              <div className={`w-32 ${heights[actualRank]} bg-gradient-to-br ${colors[actualRank]} rounded-t-2xl shadow-xl flex flex-col items-center justify-center`}>
                {icons[actualRank]}
                {participant.prize_amount > 0 && (
                  <p className="text-white font-bold mt-2 text-sm">
                    {tournament.currency} {(participant.prize_amount / 100).toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ParticipantRow({ participant, index, tournament }) {
  const rank = participant.rank || '-';
  const score = participant.score || 0;
  const isPaid = participant.payment_status === 'paid';
  const prizeAmount = participant.prize_amount || 0;

  // Rank styling
  let rankDisplay = rank;
  let rankColor = 'text-gray-700';
  let rankBg = 'bg-gray-100';
  
  if (rank === 1) {
    rankDisplay = <Crown className="w-5 h-5 text-yellow-500" />;
    rankColor = 'text-yellow-600';
    rankBg = 'bg-yellow-50';
  } else if (rank === 2) {
    rankDisplay = <Medal className="w-5 h-5 text-gray-500" />;
    rankColor = 'text-gray-600';
    rankBg = 'bg-gray-50';
  } else if (rank === 3) {
    rankDisplay = <Award className="w-5 h-5 text-orange-500" />;
    rankColor = 'text-orange-600';
    rankBg = 'bg-orange-50';
  }

  return (
    <tr className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
      {/* Rank */}
      <td className="px-6 py-4">
        <div className={`w-10 h-10 rounded-full ${rankBg} flex items-center justify-center font-bold ${rankColor}`}>
          {typeof rankDisplay === 'number' ? rankDisplay : rankDisplay}
        </div>
      </td>

      {/* Player */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-semibold">
            {participant.profiles?.avatar_url ? (
              <img 
                src={participant.profiles.avatar_url} 
                alt={participant.profiles.full_name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              participant.profiles?.full_name?.[0]?.toUpperCase() || '?'
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {participant.profiles?.full_name || 'Unknown Player'}
            </p>
            {participant.profiles?.chess_com_username && (
              <p className="text-xs text-gray-500">
                @{participant.profiles.chess_com_username}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Score */}
      <td className="px-6 py-4 text-center">
        <span className="inline-flex items-center justify-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm">
          {score}
        </span>
      </td>

      {/* Payment Status */}
      <td className="px-6 py-4 text-center">
        {isPaid ? (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
            <CheckCircle className="w-3 h-3" />
            Paid
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
            <XCircle className="w-3 h-3" />
            Pending
          </span>
        )}
      </td>

      {/* Prize */}
      <td className="px-6 py-4 text-right">
        {prizeAmount > 0 ? (
          <span className="inline-flex items-center gap-1 text-green-600 font-bold">
            <DollarSign className="w-4 h-4" />
            {tournament.currency} {(prizeAmount / 100).toFixed(2)}
          </span>
        ) : (
          <span className="text-gray-400 text-sm">-</span>
        )}
      </td>
    </tr>
  );
}

function EmptyState() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-gray-900 mb-2">No Participants Yet</h3>
      <p className="text-gray-600">
        Be the first to join this tournament!
      </p>
    </div>
  );
}