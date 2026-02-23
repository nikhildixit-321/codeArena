import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Search, User, Zap, Coins, Flame, Home } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";


export default function HomeNavbar({ showSidebarTrigger = true, onOpenSocial }) {
  const { user } = useAuth();
  const [requestCount, setRequestCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();

      // Smart Navigation
      if (term === 'settings') return navigate('/settings');
      if (term === 'profile') return navigate('/profile');
      if (term === 'leaderboard' || term === 'ranking') return navigate('/leaderboard');
      if (term === 'match' || term === 'battle' || term === 'matchmaking') return navigate('/matchmaking');
      if (term === 'practice' || term === 'arena' || term === 'questions') return navigate('/practice');
      if (term === 'ide' || term === 'code' || term === 'editor') return navigate('/ide');
      if (term === 'home' || term === 'dashboard') return navigate('/dashboard');

      // Question/Problem Search
      if (term.startsWith('q:') || term.startsWith('p:') || term.startsWith('question:')) {
        const query = searchTerm.split(':').slice(1).join(':').trim();
        return navigate('/practice/leetcode', { state: { globalSearchTerm: query } });
      }

      // Default: Smart Search (If query has spaces, assume it's a problem search)
      if (onOpenSocial) {
        if (searchTerm.trim().includes(' ')) {
          navigate('/practice/leetcode', { state: { globalSearchTerm: searchTerm.trim() } });
          setSearchTerm("");
        } else {
          onOpenSocial('search', searchTerm);
          setSearchTerm("");
        }
      }
    }
  };

  useEffect(() => {
    const fetchRequestCount = async () => {
      if (!user) return;
      try {
        const res = await api.get('/users/requests');
        setRequestCount(res.data.length);
      } catch (err) {
        console.error("Error fetching request count:", err);
      }
    };

    fetchRequestCount();
    const interval = setInterval(fetchRequestCount, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, [user]);

  return (
    <div className="w-full h-16 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 md:px-6 z-50">

      {/* Left: Brand or Mobile Trigger */}
      <div className="flex items-center gap-4">
        <div className="md:hidden">
          {showSidebarTrigger ? (
            <SidebarTrigger />
          ) : (
            <Link to="/dashboard" className="p-2 text-muted-foreground hover:text-white transition-colors">
              <Home size={20} />
            </Link>
          )}
        </div>

        {/* Smart Search Bar - Left Corner */}
        <div className="relative hidden md:block w-80 lg:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 group-focus-within:text-sky-500 transition-colors" />
          <input
            type="text"
            placeholder="Search users, problems, or settings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="w-full pl-10 pr-4 py-2 bg-secondary/30 border border-white/5 focus:border-sky-500/50 rounded-xl text-xs outline-none transition-all focus:bg-background focus:ring-4 focus:ring-sky-500/10 placeholder:text-gray-600"
          />
        </div>
      </div>

      {/* Right: User Stats & Actions */}
      <div className="flex items-center gap-6">

        {/* Stats */}
        {/* Stats Capsules */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-linear-to-r from-orange-500/10 to-transparent text-orange-500 rounded-full border border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.05)] hover:border-orange-500/40 transition-all cursor-default group" title="Current Streak">
            <Flame size={14} className="fill-orange-500 animate-pulse group-hover:scale-110 transition-transform" />
            <span className="font-bold tabular-nums text-xs">{user?.streak?.current || 0}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-linear-to-r from-yellow-500/10 to-transparent text-yellow-500 rounded-full border border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.05)] hover:border-yellow-500/40 transition-all cursor-default group" title="Battle Points">
            <Coins size={14} className="fill-yellow-500 group-hover:rotate-12 transition-transform" />
            <span className="font-bold tabular-nums text-xs">{user?.points || 0}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-linear-to-r from-blue-500/10 to-transparent text-blue-500 rounded-full border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.05)] hover:border-blue-500/40 transition-all cursor-default group" title="ELO Rating">
            <Zap size={14} className="fill-blue-500 group-hover:scale-110 transition-transform" />
            <span className="font-bold tabular-nums text-xs">{user?.rating || 600}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-border hidden md:block"></div>

        {/* Notifications */}
        <button
          onClick={() => onOpenSocial ? onOpenSocial('requests') : null}
          className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors"
        >
          <Bell size={20} />
          {requestCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[8px] flex items-center justify-center rounded-full border-2 border-background font-bold">
              {requestCount}
            </span>
          )}
        </button>

        {/* Profile Dropdown Trigger */}
        <Link to="/profile" className="flex items-center gap-3 pl-2 border-l border-border md:border-none">
          <div className="text-right hidden md:block">
            <div className="text-sm font-semibold leading-none">{user?.username || 'User'}</div>
            <div className="text-xs text-muted-foreground mt-1">Level 5 Coder</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-linear-to-tr from-primary to-purple-600 p-[2px]">
            <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={16} className="text-foreground" />
              )}
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
