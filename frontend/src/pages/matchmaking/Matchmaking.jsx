import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import socket from '../../api/socket';
import { Loader2, X, Shield, Swords, Clock, Users, Zap, Globe } from 'lucide-react';
import MainLayout from '../../components/MainLayout';

const MatchmakingContent = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState('Initializing connection...');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [estimatedTime] = useState(15);
  const [playerCount, setPlayerCount] = useState(1243);
  const navigate = useNavigate();

  useEffect(() => {
    socket.connect();

    // Simulate finding animation delays
    const statusSteps = [
      { t: 0, msg: 'Connecting to Region: Asia-East...' },
      { t: 800, msg: 'Verifying Skill Rating...' },
      { t: 1500, msg: 'Searching for opponents...' },
    ];

    statusSteps.forEach(step => {
      setTimeout(() => setStatus(step.msg), step.t);
    });

    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
      // Mock player count fluctuation
      setPlayerCount(prev => prev + (Math.random() > 0.5 ? Math.floor(Math.random() * 5) : -Math.floor(Math.random() * 3)));
    }, 1000);

    setTimeout(() => {
      socket.emit('joinQueue', { userId: user._id });
    }, 2000);

    socket.on('waiting', (data) => {
      setStatus(data.message || 'Scanning for opponents...');
    });

    socket.on('matchFound', (data) => {
      setStatus('OPPONENT FOUND! ENTERING ARENA...');
      clearInterval(timer);
      setTimeout(() => {
        navigate(`/arena/${data.matchId}`, { state: { matchData: data } });
      }, 1500);
    });

    return () => {
      socket.emit('leaveQueue'); // Clean up from queue
      socket.off('waiting');
      socket.off('matchFound');
      clearInterval(timer);
    };
  }, [user, navigate]);

  const handleCancelSearch = () => {
    socket.emit('leaveQueue');
    navigate('/dashboard');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 overflow-hidden bg-[#050505] text-white">

      {/* Background Animated Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sky-500/5 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-sky-500/10 rounded-full animate-[spin_20s_linear_infinite]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] border border-violet-500/20 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
        <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-sky-500/20 to-transparent"></div>
        <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg">

        {/* Connection Status Badge */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 rounded-full bg-[#0a0a0f] border border-white/10 text-xs font-mono text-emerald-400 shadow-lg">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
          CONNECTED: {playerCount} ONLINE
        </div>

        <div className="bg-[#0a0a0f]/80 backdrop-blur-2xl border border-white/10 p-8 md:p-12 rounded-3xl flex flex-col items-center text-center shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">

          {/* Scanning Line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent animate-[scan_2s_ease-in-out_infinite] opacity-50"></div>

          {/* Radar Animation */}
          <div className="relative mb-12 w-40 h-40 flex items-center justify-center">
            {/* Ripples */}
            <div className="absolute inset-0 bg-sky-500/20 rounded-full animate-ping"></div>
            <div className="absolute inset-0 bg-violet-500/10 rounded-full animate-pulse delay-75"></div>

            {/* Center Icon */}
            <div className="relative z-10 bg-[#050505] rounded-full p-8 border-4 border-[#1a1a20] shadow-[0_0_30px_rgba(14,165,233,0.3)]">
              <Swords size={48} className="text-sky-400 animate-[pulse_2s_infinite]" strokeWidth={1.5} />
            </div>

            {/* Rotating Rings */}
            <div className="absolute inset-[-10px] rounded-full border border-sky-500/30 border-t-sky-400 animate-spin"></div>
            <div className="absolute inset-[-20px] rounded-full border border-violet-500/20 border-b-violet-400 animate-[spin_3s_linear_infinite_reverse]"></div>
          </div>

          <h2 className="text-4xl font-black text-white mb-2 tracking-tight">
            FINDING MATCH
          </h2>

          <p className="text-gray-400 mb-10 font-mono text-sm h-6 flex items-center justify-center gap-2">
            <Loader2 size={14} className="animate-spin text-sky-400" />
            {status}
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 w-full mb-10">
            <div className="bg-[#121218] p-5 rounded-2xl border border-white/5 relative group">
              <div className="absolute inset-0 bg-gradient-to-b from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
              <div className="flex items-center justify-center gap-2 text-gray-500 text-[10px] uppercase tracking-widest mb-1 font-bold">
                <Clock size={12} /> Time Elapsed
              </div>
              <div className="text-2xl font-mono font-bold text-white relative z-10">
                {formatTime(elapsedTime)}
              </div>
            </div>

            <div className="bg-[#121218] p-5 rounded-2xl border border-white/5 relative group">
              <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
              <div className="flex items-center justify-center gap-2 text-gray-500 text-[10px] uppercase tracking-widest mb-1 font-bold">
                <Zap size={12} /> Estimated
              </div>
              <div className="text-2xl font-mono font-bold text-white relative z-10">
                {formatTime(estimatedTime)}
              </div>
            </div>
          </div>

          <button
            onClick={handleCancelSearch}
            className="group flex items-center gap-2 px-8 py-4 bg-[#1a1a20] hover:bg-red-500/10 hover:border-red-500/30 border border-white/5 rounded-2xl transition-all font-bold text-gray-400 hover:text-red-400 w-full justify-center"
          >
            <X size={20} />
            <span>CANCEL SEARCH</span>
          </button>
        </div>

        {/* Footer Hint */}
        <p className="text-center text-xs text-gray-600 mt-6 max-w-sm mx-auto">
          Reviewing your recent performance to find a balanced opponent.
        </p>
      </div>
    </div>
  );
};

const Matchmaking = () => {
  return (
    <MainLayout>
      <MatchmakingContent />
    </MainLayout>
  )
}

export default Matchmaking;
