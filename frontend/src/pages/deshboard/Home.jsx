import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import HomeNavbar from "../../components/Navbar";
import MainLayout from '../../components/MainLayout';
import {
  Swords, Code2, Zap, Trophy, Activity, Target, Flame,
  TrendingUp, Monitor, Globe, ChevronRight, Star, Clock,
  Users, PlayCircle
} from 'lucide-react';
import SocialModal from '../../components/SocialModal';
import { formatAvatarUrl, getRank } from '../../utils/formatters';

const StatsCard = ({ label, value, icon: Icon, color, bg, trend, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-[#0e0e12] border border-white/5 p-5 rounded-2xl flex items-center justify-between hover:border-white/10 transition-colors group ${onClick ? 'cursor-pointer active:scale-95' : ''}`}
  >
    <div>
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-black text-white group-hover:scale-105 transition-transform origin-left">{value}</p>
      <p className="text-[10px] text-gray-500 mt-1">{trend}</p>
    </div>
    <div className={`p-3 rounded-xl ${bg} ${color}`}>
      <Icon size={20} />
    </div>
  </div>
);

const ActionCard = ({ title, desc, icon: Icon, color, onClick }) => (
  <button
    onClick={onClick}
    className="text-left bg-[#0e0e12] border border-white/5 p-5 rounded-2xl hover:bg-white/2 hover:border-sky-500/30 transition-all group relative overflow-hidden"
  >
    <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-4 text-white shadow-lg`}>
      <Icon size={20} />
    </div>
    <h4 className="font-bold text-white mb-1 group-hover:text-sky-400 transition-colors">{title}</h4>
    <p className="text-xs text-gray-500">{desc}</p>
    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
      <ChevronRight size={16} className="text-gray-400" />
    </div>
  </button>
);

const DashboardContent = ({ isSocialOpen, setIsSocialOpen, onOpenSocial }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    rating: 0,
    matchesPlayed: 0,
    matchesWon: 0,
    streak: 0,
    points: 0
  });
  const [liveMatches, setLiveMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    if (user) {
      setStats({
        rating: user.rating || 600,
        matchesPlayed: user.matchesPlayed || 0,
        matchesWon: user.matchesWon || 0,
        streak: user.stats?.currentWinStreak || 0,
        points: user.points || 0
      });
    }

    const fetchData = async () => {
      if (!user) return;
      try {
        const liveRes = await api.get('/match/active');
        setLiveMatches(liveRes.data.map(match => ({
          ...match,
          players: match.players.map(p => ({
            ...p,
            user: { ...p.user, avatar: formatAvatarUrl(p.user?.avatar) }
          }))
        })));
        const dailyRes = await api.get('/match/daily');
        setDailyChallenge(dailyRes.data);
        const lbRes = await api.get('/match/leaderboard');
        setLeaderboard(lbRes.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoadingMatches(false);
      }
    };

    if (user) {
      fetchData();
    } else {
      setLoadingMatches(false);
    }
  }, [user]);

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-white selection:bg-sky-500/30">
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-sky-500/10 blur-[130px] rounded-full opacity-60"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full opacity-50"></div>
      </div>

      <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar relative z-10">
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">Dashboard</p>
              <h1 className="text-3xl md:text-4xl font-black text-white">
                Good Evening, <span className="text-transparent bg-clip-text bg-linear-to-r from-sky-400 to-indigo-500">{user?.username || 'Coder'}</span>
              </h1>
              <p className="text-gray-500 mt-2 text-sm max-w-md">
                Your current rank is <span className="text-white font-bold">{getRank(stats.rating)}</span>. Keep pushing to reach the top.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={onOpenSocial} className="px-5 py-2.5 bg-[#1a1a20] border border-white/10 hover:border-sky-500/30 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2">
                <Users size={16} className="text-sky-400" /> Friends
              </button>
              <button onClick={() => navigate('/matchmaking')} className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-black rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(14,165,233,0.3)] transition-all flex items-center gap-2">
                <Zap size={16} fill="black" /> Quick Start
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard label="Current Rating" value={stats.rating} icon={Zap} color="text-amber-400" bg="bg-amber-400/10" trend="Global Rank" onClick={() => navigate('/leaderboard')} />
            <StatsCard label="Matches Won" value={stats.matchesWon} icon={Trophy} color="text-sky-400" bg="bg-sky-400/10" trend="Total Wins" onClick={() => navigate('/profile')} />
            <StatsCard label="Win Rate" value={`${stats.matchesPlayed > 0 ? Math.round((stats.matchesWon / stats.matchesPlayed) * 100) : 0}%`} icon={TrendingUp} color="text-green-400" bg="bg-green-400/10" trend="Win/Loss Ratio" onClick={() => navigate('/profile')} />
            <StatsCard label="Daily Streak" value={`${stats.streak} 🔥`} icon={Flame} color="text-rose-500" bg="bg-rose-500/10" trend="Current Streak" onClick={() => navigate('/profile')} />
          </div>

          <div className="relative rounded-3xl overflow-hidden min-h-[300px] flex items-center group border border-white/5 bg-[#0a0a0f]">
            <div className="absolute inset-0 bg-linear-to-r from-indigo-900/40 via-[#0a0a0f] to-[#0a0a0f] z-0"></div>
            <div className="absolute right-0 top-0 h-full w-1/2 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay mask-image-gradient"></div>
            <div className="relative z-10 p-8 md:p-12 max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
                <Globe size={12} /> Seasonal Event
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">RANKED <br /><span className="text-transparent bg-clip-text bg-linear-to-r from-sky-400 to-indigo-400">MATCHMAKING</span></h2>
              <p className="text-gray-400 text-lg mb-8 max-w-lg">Compete against developers worldwide in real-time 1v1 battles. Climb the leaderboard and earn exclusive badges.</p>
              <div className="flex gap-4">
                <button onClick={() => navigate('/matchmaking')} className="px-8 py-4 bg-white text-black font-black text-lg rounded-xl hover:scale-105 transition-transform flex items-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.2)]"><Swords size={20} strokeWidth={3} /> FIND MATCH</button>
                <button onClick={() => navigate('/leaderboard')} className="px-8 py-4 bg-white/5 text-white font-bold text-lg rounded-xl border border-white/10 hover:bg-white/10 transition-colors">LEADERBOARD</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ActionCard title="Practice Arena" desc="Sharpen your skills with 500+ problems." icon={Target} color="bg-emerald-500" onClick={() => navigate('/practice/leetcode')} />
                <ActionCard title="Play with Friend" desc="Invite a friend to a coding battle." icon={Users} color="bg-purple-500" onClick={() => onOpenSocial('friends')} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2"><Activity size={18} className="text-sky-400" /> Live Battles</h3>
                  <span className="text-xs font-mono text-gray-500">Updating live...</span>
                </div>
                <div className="bg-[#0e0e12] border border-white/5 rounded-2xl overflow-hidden min-h-[100px]">
                  {loadingMatches ? <div className="p-4 text-center text-gray-500 text-sm">Loading battles...</div> : liveMatches.length === 0 ? <div className="p-8 text-center text-gray-500 text-sm">No active battles right now. Be the first!</div> : liveMatches.map((match, i) => (
                    <div key={match._id || i} onClick={() => navigate('/matchmaking')} className="p-4 border-b border-white/5 last:border-0 hover:bg-white/2 cursor-pointer flex items-center justify-between group transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="flex -space-x-2">{match.players?.slice(0, 2).map((p, idx) => (<div key={idx} className="w-8 h-8 rounded-full bg-gray-800 border-2 border-[#0e0e12] overflow-hidden flex items-center justify-center text-[10px] font-bold" title={p.user?.username}>{p.user?.avatar ? <img src={p.user.avatar} alt="u" className="w-full h-full object-cover" /> : (p.user?.username?.[0]?.toUpperCase() || 'U')}</div>))}</div>
                        <div className="flex flex-col"><span className="text-sm font-bold text-gray-200 group-hover:text-sky-400 transition-colors truncate max-w-[120px]">{match.question?.title || 'Unknown Problem'}</span><span className="text-[10px] text-gray-500 uppercase tracking-wide">{match.question?.difficulty || 'Medium'} • {match.status}</span></div>
                      </div>
                      <div className="flex items-center gap-3"><span className="px-2 py-1 bg-red-500/10 text-red-500 text-[10px] font-bold uppercase rounded flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> Live</span></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-linear-to-br from-[#1a1a20] to-[#0e0e12] border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Target size={80} /></div>
                <h3 className="text-lg font-bold text-white mb-2 relative z-10">Daily Challenge</h3>
                {dailyChallenge ? (<><div className="flex items-center gap-2 mb-4 relative z-10"><span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${dailyChallenge.question?.difficulty === 'Hard' ? 'bg-red-500/10 text-red-500 border-red-500/20' : dailyChallenge.question?.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>{dailyChallenge.question?.difficulty || 'Medium'}</span><span className="text-xs text-gray-400 truncate max-w-[150px]">{dailyChallenge.question?.title}</span></div><p className="text-sm text-gray-400 mb-6 relative z-10">Solve today's problem to increase streak.</p><button onClick={() => navigate('/practice/leetcode')} className="w-full py-3 bg-white text-black font-bold text-sm rounded-xl hover:bg-gray-200 transition-colors relative z-10">Start Challenge</button></>) : <div className="text-gray-500 text-sm">Loading challenge...</div>}
              </div>
              <div className="bg-[#0e0e12] border border-white/5 rounded-2xl p-6">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Trophy size={16} className="text-yellow-500" /> Leaderboard</h3>
                <div className="space-y-4">
                  {leaderboard.length > 0 ? leaderboard.slice(0, 5).map((player, index) => (<div key={player._id || index} className="flex items-center justify-between"><div className="flex items-center gap-3"><span className={`w-5 h-5 flex items-center justify-center text-xs font-bold rounded ${index === 0 ? 'bg-yellow-500/20 text-yellow-500' : 'text-gray-500 bg-white/5'}`}>{index + 1}</span><span className="text-sm font-medium text-gray-300">{player.username}</span></div><span className="text-xs font-mono text-gray-500">{player.rating}</span></div>)) : <div className="text-gray-500 text-xs">No ranking data yet.</div>}
                </div>
                <button onClick={() => navigate('/leaderboard')} className="w-full mt-4 py-2 text-xs font-bold text-gray-500 hover:text-white transition-colors border-t border-white/5 pt-4">View Full Rankings</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const [isSocialOpen, setIsSocialOpen] = useState(false);
  const [initialSocialTab, setInitialSocialTab] = useState('friends');
  const [initialSearchTerm, setInitialSearchTerm] = useState('');

  const openSocial = (tab = 'friends', term = '') => {
    setInitialSocialTab(tab);
    setInitialSearchTerm(term);
    setIsSocialOpen(true);
  };

  return (
    <MainLayout navbar={<HomeNavbar onOpenSocial={openSocial} />}>
      <DashboardContent isSocialOpen={isSocialOpen} setIsSocialOpen={setIsSocialOpen} onOpenSocial={openSocial} />
      <SocialModal
        isOpen={isSocialOpen}
        onClose={() => setIsSocialOpen(false)}
        initialTab={initialSocialTab}
        initialSearchTerm={initialSearchTerm}
      />
    </MainLayout>
  );
};

export default Home;