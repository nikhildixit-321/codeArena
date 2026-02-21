import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, TrendingUp, Activity, User, ChevronRight, Search, Filter } from 'lucide-react';
import api from '../../api/axios';
import MainLayout from '../../components/MainLayout';
import HomeNavbar from '../../components/Navbar';

const Leaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('Global'); // Global, Weekly, Monthly

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const res = await api.get('/match/leaderboard');
            setLeaderboard(res.data);
        } catch (err) {
            console.error("Error fetching leaderboard:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredPlayers = leaderboard.filter(player =>
        player.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const topThree = filteredPlayers.slice(0, 3);
    const others = filteredPlayers.slice(3);

    return (
        <MainLayout navbar={<HomeNavbar />}>
            <div className="min-h-screen bg-[#050505] text-white p-6 md:p-10 relative overflow-hidden">
                {/* Background Glows */}
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full opacity-50 pointer-events-none"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-sky-500/10 blur-[130px] rounded-full opacity-40 pointer-events-none"></div>

                <div className="max-w-6xl mx-auto relative z-10">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                                    <Trophy size={20} />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest text-amber-500/80">Hall of Fame</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                                GLOBAL <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-yellow-600">RANKINGS</span>
                            </h1>
                            <p className="text-gray-500 mt-2 text-sm font-medium">
                                The best of the best. Top {leaderboard.length} developers in the CodeArena.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search player..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-amber-500/50 transition-all"
                                />
                            </div>
                            <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-colors">
                                <Filter size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Top 3 Spotlight */}
                    {!loading && topThree.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 items-end">
                            {/* Rank 2 */}
                            {topThree[1] && (
                                <div className="order-2 md:order-1 animate-in slide-in-from-bottom-8 duration-700 delay-100">
                                    <SpotlightCard
                                        player={topThree[1]}
                                        rank={2}
                                        color="text-slate-300"
                                        bg="bg-slate-300/10"
                                        border="border-slate-300/20"
                                        glow="shadow-slate-300/10"
                                        icon={Medal}
                                    />
                                </div>
                            )}

                            {/* Rank 1 */}
                            {topThree[0] && (
                                <div className="order-1 md:order-2 animate-in slide-in-from-bottom-12 duration-1000">
                                    <SpotlightCard
                                        player={topThree[0]}
                                        rank={1}
                                        color="text-amber-400"
                                        bg="bg-amber-400/10"
                                        border="border-amber-400/30"
                                        glow="shadow-amber-400/20"
                                        icon={Crown}
                                        featured
                                    />
                                </div>
                            )}

                            {/* Rank 3 */}
                            {topThree[2] && (
                                <div className="order-3 animate-in slide-in-from-bottom-8 duration-700 delay-200">
                                    <SpotlightCard
                                        player={topThree[2]}
                                        rank={3}
                                        color="text-orange-500"
                                        bg="bg-orange-500/10"
                                        border="border-orange-500/20"
                                        glow="shadow-orange-500/10"
                                        icon={Medal}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Leaderboard Table */}
                    <div className="bg-[#0e0e12] border border-white/5 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-1000">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/2 border-b border-white/5">
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Rank</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Coder</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-center">Rating</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-center">Matches</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-center">Win Rate</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        [...Array(5)].map((_, i) => (
                                            <tr key={i} className="animate-pulse border-b border-white/5">
                                                <td colSpan="6" className="px-8 py-10 bg-white/1"></td>
                                            </tr>
                                        ))
                                    ) : others.length === 0 && topThree.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-8 py-20 text-center text-gray-500 italic">No rankings available yet.</td>
                                        </tr>
                                    ) : (
                                        others.map((player, index) => (
                                            <tr key={player._id} className="group hover:bg-white/3 border-b border-white/5 transition-colors">
                                                <td className="px-8 py-6">
                                                    <span className="text-sm font-mono font-bold text-gray-500 group-hover:text-white transition-colors">
                                                        #{index + 4}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-sky-500/50 transition-colors">
                                                            {player.avatar ? (
                                                                <img src={player.avatar} alt={player.username} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <User size={18} className="text-gray-500" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors">{player.username}</p>
                                                            <p className="text-[10px] font-bold text-gray-600 uppercase">Pro Developer</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-500/10 text-sky-400 rounded-full border border-sky-500/20 text-xs font-bold">
                                                        <Activity size={12} />
                                                        {player.rating}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <span className="text-sm font-bold text-gray-400">{player.matchesPlayed || 0}</span>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <span className="text-sm font-bold text-gray-400">
                                                        {player.matchesPlayed ? Math.round((player.matchesWon / player.matchesPlayed) * 100) : 0}%
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <button className="p-2 text-gray-600 hover:text-white transition-colors">
                                                        <ChevronRight size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination or Footer info */}
                        <div className="p-6 bg-white/1 flex justify-between items-center border-t border-white/5">
                            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest leading-none">
                                Season 24 • Last Updated 2m ago
                            </p>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 bg-white/5 text-xs font-bold rounded-lg opacity-50 cursor-not-allowed">Previous</button>
                                <button className="px-4 py-2 bg-white/5 text-xs font-bold rounded-lg hover:bg-white/10 transition-colors">Next</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

const SpotlightCard = ({ player, rank, color, bg, border, glow, icon: Icon, featured = false }) => (
    <div className={`relative flex flex-col items-center ${featured ? 'mb-4 scale-110 md:scale-125 z-20' : 'z-10'} group`}>
        {/* Rank Badge */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full ${bg} ${border} ${color} flex items-center justify-center shadow-lg backdrop-blur-md z-30`}>
            <Icon size={20} />
        </div>

        {/* Avatar Area */}
        <div className={`relative w-24 h-24 md:w-32 md:h-32 mb-4 rounded-3xl p-[3px] bg-linear-to-tr from-transparent via-white/10 to-transparent ${border} shadow-2xl ${glow} transition-transform duration-500 group-hover:scale-105`}>
            {featured && (
                <div className="absolute inset-x-0 -top-8 text-center animate-bounce">
                    <span className="bg-amber-500 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg shadow-amber-500/50">Leader</span>
                </div>
            )}
            <div className="w-full h-full rounded-[21px] bg-[#0a0a0f] overflow-hidden flex items-center justify-center relative">
                {player.avatar ? (
                    <img src={player.avatar} alt={player.username} className="w-full h-full object-cover" />
                ) : (
                    <User size={32} className="text-gray-700" />
                )}
                {/* Visual Rank Indicator */}
                <div className={`absolute bottom-2 right-2 w-8 h-8 rounded-lg ${bg} ${color} flex items-center justify-center text-lg font-black italic border ${border}`}>
                    {rank}
                </div>
            </div>
        </div>

        {/* Player Info */}
        <div className="text-center">
            <h3 className="text-lg md:text-xl font-black text-white group-hover:text-amber-400 transition-colors mb-1">{player.username}</h3>
            <div className={`inline-flex items-center gap-1 text-sm font-bold ${color}`}>
                <Activity size={14} />
                {player.rating} ELO
            </div>
            {featured && (
                <div className="mt-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    {player.matchesWon} Victories
                </div>
            )}
        </div>
    </div>
);

export default Leaderboard;
