import React, { useState, useEffect } from 'react';
import { X, Search, UserPlus, Check, UserMinus, Loader2, Users, Send } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const SocialModal = ({ isOpen, onClose, initialTab = 'friends' }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState(initialTab); // 'friends', 'search', 'requests'
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null); // track which user action is loading

    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
            fetchFriends();
            fetchRequests();
        }
    }, [isOpen, initialTab]);

    const fetchFriends = async () => {
        try {
            const res = await api.get('/users/friends');
            setFriends(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchRequests = async () => {
        try {
            const res = await api.get('/users/requests');
            setRequests(res.data);
        } catch (err) { console.error(err); }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) return;
        setLoading(true);
        try {
            const res = await api.get(`/users/search?query=${searchTerm}`);
            setSearchResults(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const sendRequest = async (userId) => {
        setActionLoading(userId);
        try {
            await api.post(`/users/send-request/${userId}`);
            // Update local state to show requested status
            setSearchResults(prev => prev.map(u => u._id === userId ? { ...u, requested: true } : u));
        } catch (err) { alert(err.response?.data?.message || 'Error sending request'); }
        finally { setActionLoading(null); }
    };

    const acceptRequest = async (userId) => {
        setActionLoading(userId);
        try {
            await api.post(`/users/accept-request/${userId}`);
            setRequests(prev => prev.filter(r => r._id !== userId));
            fetchFriends();
        } catch (err) { console.error(err); }
        finally { setActionLoading(null); }
    };

    const rejectRequest = async (userId) => {
        setActionLoading(userId);
        try {
            await api.post(`/users/reject-request/${userId}`);
            setRequests(prev => prev.filter(r => r._id !== userId));
        } catch (err) { console.error(err); }
        finally { setActionLoading(null); }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-6">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>

            <div className="relative w-full max-w-2xl bg-[#0a0a0f] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden h-[600px] animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-sky-500/10 rounded-xl text-sky-400">
                            <Users size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">Social Portal</h2>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none">Connect with Coders</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex px-6 border-b border-white/5 bg-[#050505]/50">
                    {[
                        { id: 'friends', label: 'Friends', count: friends.length },
                        { id: 'requests', label: 'Requests', count: requests.length },
                        { id: 'search', label: 'Search Users', count: 0 }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-4 px-6 text-xs font-bold uppercase tracking-widest border-b-2 transition-all relative ${activeTab === tab.id ? 'border-sky-500 text-sky-400 bg-sky-500/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                        >
                            {tab.label}
                            {tab.count > 0 && (
                                <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[8px] flex items-center justify-center rounded-full animate-pulse">
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">

                    {/* SEARCH TAB */}
                    {activeTab === 'search' && (
                        <div className="space-y-6">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search by username..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="w-full bg-[#050505] border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-sky-500/50 transition-all"
                                    />
                                </div>
                                <button
                                    onClick={handleSearch}
                                    disabled={loading}
                                    className="bg-sky-500 hover:bg-sky-400 text-black px-6 rounded-2xl font-bold text-sm transition-all flex items-center gap-2"
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                                    <span>Search</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {searchResults.map(u => (
                                    <div key={u._id} className="p-4 bg-white/2 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-white/10 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-linear-to-tr from-sky-500 to-indigo-600 p-[2px]">
                                                <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                                                    {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : <span className="text-sky-400 font-black">{u.username[0].toUpperCase()}</span>}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-sm">{u.username}</div>
                                                <div className="text-[10px] text-gray-500 uppercase font-black">{u.rating} ELO</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => sendRequest(u._id)}
                                            disabled={actionLoading === u._id || u.requested || u.isFriend}
                                            className={`p-2 rounded-xl transition-all ${u.requested ? 'bg-green-500/20 text-green-400' : u.isFriend ? 'bg-sky-500/20 text-sky-400' : 'bg-white/5 hover:bg-sky-500 hover:text-black text-gray-400'}`}
                                        >
                                            {actionLoading === u._id ? <Loader2 size={18} className="animate-spin" /> :
                                                u.requested ? <Check size={18} /> :
                                                    u.isFriend ? <Users size={18} /> : <UserPlus size={18} />}
                                        </button>
                                    </div>
                                ))}
                                {searchResults.length === 0 && !loading && searchTerm && <p className="col-span-full text-center py-10 text-gray-500 text-sm">No users found with that name.</p>}
                            </div>
                        </div>
                    )}

                    {/* REQUESTS TAB */}
                    {activeTab === 'requests' && (
                        <div className="space-y-4">
                            {requests.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-gray-600 opacity-50">
                                    <Send size={48} className="mb-4" />
                                    <p className="text-sm font-bold uppercase tracking-widest">No pending requests</p>
                                </div>
                            ) : (
                                requests.map(r => (
                                    <div key={r._id} className="p-4 bg-white/2 border border-white/5 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-2">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-[#1a1a20] flex items-center justify-center">
                                                <span className="text-sky-400 font-bold">{r.username[0].toUpperCase()}</span>
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-sm">{r.username}</div>
                                                <div className="text-[10px] text-gray-500 font-black uppercase">{r.rating} ELO wants to join</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => acceptRequest(r._id)}
                                                disabled={actionLoading === r._id}
                                                className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-black rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2"
                                            >
                                                {actionLoading === r._id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => rejectRequest(r._id)}
                                                disabled={actionLoading === r._id}
                                                className="px-4 py-2 bg-white/5 hover:bg-red-500/10 text-red-500 border border-white/5 rounded-xl text-[10px] font-black uppercase transition-all"
                                            >
                                                Decline
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* FRIENDS TAB */}
                    {activeTab === 'friends' && (
                        <div className="space-y-4">
                            {friends.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-gray-600 opacity-50">
                                    <Users size={48} className="mb-4" />
                                    <p className="text-sm font-bold uppercase tracking-widest">Your circle is empty</p>
                                    <button onClick={() => setActiveTab('search')} className="mt-4 text-sky-500 text-xs font-black uppercase hover:underline">Find Coders</button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-3">
                                    {friends.map(f => (
                                        <div key={f._id} className="p-4 bg-white/2 border border-white/5 rounded-2xl flex items-center justify-between hover:bg-white/5 transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-linear-to-br from-sky-400 to-blue-600 flex items-center justify-center p-[2px]">
                                                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                                                        <span className="text-sky-400 font-bold">{f.username[0].toUpperCase()}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white text-sm flex items-center gap-2">
                                                        {f.username}
                                                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 font-black uppercase">
                                                        {f.rating} ELO • {f.matchesPlayed} Matches
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button className="p-2 bg-white/5 hover:bg-sky-500/20 text-sky-400 rounded-lg transition-all" title="Profile">
                                                    <Users size={16} />
                                                </button>
                                                <button className="p-2 bg-white/5 hover:bg-red-500/20 text-red-500 rounded-lg transition-all opacity-0 group-hover:opacity-100" title="Remove Friend">
                                                    <UserMinus size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/5 bg-black/40 text-center">
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                        CodeGame Social • {friends.length} Network Connections
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SocialModal;
