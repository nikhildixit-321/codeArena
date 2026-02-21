import React, { useState, useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import { Bell, Search, User, Zap, Coins, Flame, Home } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function HomeNavbar({ showSidebarTrigger = true, onOpenSocial }) {
  const { user } = useAuth();
  const [requestCount, setRequestCount] = useState(0);

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

        {/* Search Bar - Desktop */}
        <div className="relative hidden md:block w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search problems, users, or matches..."
            className="w-full pl-10 pr-4 py-2 bg-secondary/50 border border-transparent focus:border-primary/50 rounded-lg text-sm outline-none transition-all focus:bg-background focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Right: User Stats & Actions */}
      <div className="flex items-center gap-6">

        {/* Stats */}
        <div className="hidden md:flex items-center gap-4 text-sm font-medium">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 text-orange-500 rounded-full border border-orange-500/20" title="Streak">
            <Flame size={14} className="fill-orange-500" />
            <span>{user?.streak?.current || 0}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 text-yellow-500 rounded-full border border-yellow-500/20" title="Points">
            <Coins size={14} className="fill-yellow-500" />
            <span>{user?.points || 0}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-500 rounded-full border border-blue-500/20" title="Rating">
            <Zap size={14} className="fill-blue-500" />
            <span>{user?.rating || 600}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-border hidden md:block"></div>

        {/* Notifications */}
        <button
          onClick={onOpenSocial}
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
