import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import HomeNavbar from "../../components/Navbar";
import MainLayout from '../../components/MainLayout';
import {
  Swords, Code2, Zap, Trophy, Activity, Target, Flame,
  TrendingUp, Monitor, Globe, ChevronRight, Star, Clock
} from 'lucide-react';

const DashboardContent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    rating: 1200,
    matchesPlayed: 0,
    matchesWon: 0
  });

  useEffect(() => {
    // Simulate fetching user stats
    if (user) {
      setStats({
        rating: user.rating || 1200,
        matchesPlayed: user.matchesPlayed || 0,
        matchesWon: user.matchesWon || 0
      })
    }
  }, [user]);

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-white selection:bg-cyan-500/30">

      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-violet-600/10 blur-[150px] rounded-full"></div>
      </div>

      <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar relative z-10">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* HERO SECTION - Vibrant & Glassmorphism */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl group">
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-[#0a0a0f]/80 to-black/90 z-0"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0"></div>

            <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="space-y-6 max-w-2xl text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-md">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                  <span className="text-xs font-bold text-cyan-400 tracking-wide uppercase">Live Season 4</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none text-white">
                  CODE <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500 filter drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                    ARENA
                  </span>
                </h1>

                <p className="text-gray-400 text-lg leading-relaxed max-w-lg mx-auto md:mx-0">
                  Welcome back, <span className="text-white font-bold">{user?.username || 'Player'}</span>.
                  The battlefield is open. prove your algorithms.
                </p>

                <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-4">
                  <button
                    onClick={() => navigate('/matchmaking')}
                    className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-lg rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:-translate-y-1 transition-all flex items-center gap-3"
                  >
                    <Swords size={24} strokeWidth={2.5} />
                    BATTLE NOW
                  </button>
                  <button
                    onClick={() => navigate('/practice')}
                    className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-lg rounded-2xl backdrop-blur-sm transition-all flex items-center gap-3"
                  >
                    <Target size={24} />
                    PRACTICE
                  </button>
                </div>
              </div>

              {/* Dynamic Feature Visual */}
              <div className="hidden md:block relative group-hover:scale-105 transition-transform duration-500">
                <div className="w-80 p-6 bg-[#13131a]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl relative">
                  {/* Floating Badge */}
                  <div className="absolute -top-4 -right-4 bg-violet-600 text-white p-2 rounded-lg shadow-lg rotate-12">
                    <Trophy size={20} fill="white" />
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 p-[2px]">
                      <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                        <span className="font-bold text-xl text-white">
                          {user?.username?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wider font-bold">Current Status</p>
                      <p className="text-xl font-bold text-white">Grandmaster</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-mono text-gray-400">
                      <span>Rating</span>
                      <span className="text-cyan-400">{stats.rating}</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full w-[70%] bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-2">
                      <div className="flex items-center gap-1 text-emerald-400">
                        <TrendingUp size={12} />
                        <span>Top 5%</span>
                      </div>
                      <span className="text-gray-500">Global Rank</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STATS GRID - Sky Blue & Neon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="TOTAL RATING"
              value={stats.rating}
              icon={Zap}
              color="text-yellow-400"
              bg="bg-yellow-400/10"
              border="border-yellow-400/20"
              glow="group-hover:shadow-[0_0_20px_rgba(250,204,21,0.2)]"
            />
            <MetricCard
              label="BATTLES WON"
              value={stats.matchesWon}
              icon={Trophy}
              color="text-cyan-400"
              bg="bg-cyan-400/10"
              border="border-cyan-400/20"
              glow="group-hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]"
            />
            <MetricCard
              label="WIN RATE"
              value={`${stats.matchesPlayed > 0 ? Math.round((stats.matchesWon / stats.matchesPlayed) * 100) : 0}%`}
              icon={Activity}
              color="text-emerald-400"
              bg="bg-emerald-400/10"
              border="border-emerald-400/20"
              glow="group-hover:shadow-[0_0_20px_rgba(52,211,153,0.2)]"
            />
            <MetricCard
              label="STREAK"
              value="4 Days"
              icon={Flame}
              color="text-rose-500"
              bg="bg-rose-500/10"
              border="border-rose-500/20"
              glow="group-hover:shadow-[0_0_20px_rgba(244,63,94,0.2)]"
            />
          </div>

          {/* CONTENT GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Column: Live Battles Feed (New Feature) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Globe size={20} className="text-violet-500" />
                  Live Arena Feed
                </h2>
                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 text-xs font-mono text-gray-400">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  1,240 Online
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Live Match Cards */}
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="bg-[#0e0e12] border border-white/5 hover:border-cyan-500/30 p-4 rounded-2xl flex flex-col gap-4 group transition-all hover:-translate-y-1">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gray-800 border-2 border-[#0e0e12] flex items-center justify-center text-xs font-bold">P1</div>
                          <div className="w-10 h-10 rounded-full bg-gray-700 border-2 border-[#0e0e12] flex items-center justify-center text-xs font-bold">P2</div>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-200">Binary Search</span>
                          <span className="text-xs text-gray-500">Hard • C++ vs Py</span>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded bg-rose-500/10 text-rose-500 text-[10px] font-bold uppercase tracking-wider">
                        Live
                      </span>
                    </div>
                    <div className="h-1 bg-gray-800 rounded-full overflow-hidden flex">
                      <div className="h-full bg-cyan-500 w-[40%]"></div>
                      <div className="h-full bg-violet-600 w-[30%]"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Leaderboard & Challenge */}
            <div className="space-y-6">
              <div className="bg-[#0e0e12] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[50px] rounded-full group-hover:bg-cyan-500/20 transition-all"></div>

                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <Clock size={20} className="text-cyan-400" />
                  <h3 className="font-bold text-lg text-white">Daily Challenge</h3>
                </div>

                <p className="text-gray-400 text-sm mb-6 relative z-10">
                  Solve today's <span className="text-white font-bold">Dynamic Programming</span> problem to keep your streak alive.
                </p>

                <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2 group/btn z-10 relative">
                  Start Coding <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="bg-[#0e0e12] border border-white/5 rounded-2xl p-6">
                <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
                  <Star size={18} className="text-yellow-400" fill="currentColor" />
                  Top Players
                </h3>
                <div className="space-y-4">
                  {[1, 2, 3].map((rank) => (
                    <div key={rank} className="flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 flex items-center justify-center rounded bg-white/5 text-xs font-bold ${rank === 1 ? 'text-yellow-400' : 'text-gray-400'}`}>
                          {rank}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-gray-300 group-hover:text-cyan-400 transition-colors">Neo_Anders</p>
                          <p className="text-[10px] text-gray-500">2,450 Rating</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-gray-600 group-hover:text-white transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Footer Removed as requested */}

    </div>
  );
};

// Reusable Metric Component
const MetricCard = ({ label, value, icon: Icon, color, bg, border, glow }) => (
  <div className={`bg-[#0e0e12] border ${border} p-6 rounded-2xl flex items-center justify-between group transition-all hover:scale-[1.02] ${glow} relative overflow-hidden`}>
    <div className="relative z-10">
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">{label}</p>
      <p className="text-3xl font-black text-white">{value}</p>
    </div>
    <div className={`w-12 h-12 rounded-xl ${bg} ${color} flex items-center justify-center relative z-10`}>
      <Icon size={24} strokeWidth={2.5} />
    </div>
    {/* Hover Gradient */}
    <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${bg} blur-[40px] rounded-full opacity-0 group-hover:opacity-50 transition-opacity`}></div>
  </div>
);

const Home = () => {
  return (
    <MainLayout navbar={<HomeNavbar />}>
      <DashboardContent />
    </MainLayout>
  );
};

export default Home;