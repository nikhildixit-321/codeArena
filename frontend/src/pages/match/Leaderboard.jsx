import React, { useState, useEffect } from 'react';
import { Trophy, User, Activity, Search } from 'lucide-react';
import api from '../../api/axios';
import MainLayout from '../../components/MainLayout';
import HomeNavbar from '../../components/Navbar';

const Leaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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

    return (
        <MainLayout navbar={<HomeNavbar />}>
            <div className="min-h-screen bg-[#0a0a0c] text-white p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                    {/* Simple Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-3">
                                <Trophy className="text-yellow-500" size={28} />
                                Leaderboard
                            </h1>
                            <p className="text-gray-400 text-sm mt-1">Global player rankings by ELO</p>
                        </div>

                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <input
                                type="text"
                                placeholder="Search username..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-sky-500/50"
                            />
                        </div>
                    </div>

                    {/* Simple Table */}
                    <div className="bg-[#111114] border border-white/10 rounded-xl overflow-hidden shadow-lg">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 border-b border-white/10">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Rank</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">User</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 text-center">Rating</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 text-center">Wins</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan="4" className="px-6 py-6 h-16"></td>
                                        </tr>
                                    ))
                                ) : filteredPlayers.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-10 text-center text-gray-500 italic">No players found.</td>
                                    </tr>
                                ) : (
                                    filteredPlayers.map((player, index) => (
                                        <tr key={player._id} className="hover:bg-white/2 transition-colors">
                                            <td className="px-6 py-4 font-mono font-bold text-gray-400">
                                                #{index + 1}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center overflow-hidden">
                                                        {player.avatar ? (
                                                            <img src={player.avatar} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User size={14} className="text-sky-400" />
                                                        )}
                                                    </div>
                                                    <span className="font-bold text-sm tracking-wide">{player.username}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="inline-flex items-center gap-1 text-sky-400 font-bold text-sm">
                                                    <Activity size={12} />
                                                    {player.rating}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm font-medium text-gray-400">
                                                {player.matchesWon || 0}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Leaderboard;
