import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import socket from '../../api/socket';
import { Loader2, X, Shield, Swords, Clock, Users } from 'lucide-react';
import MainLayout from '../../components/MainLayout';

const MatchmakingContent = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState('Initializing connection...');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [estimatedTime] = useState(15); // mock estimated time
  const [playerCount, setPlayerCount] = useState(128); // mock online count
  const navigate = useNavigate();

  useEffect(() => {
    socket.connect();

    // Simulate finding animation delays
    const statusSteps = [
      { t: 0, msg: 'Connecting to Competitive Server...' },
      { t: 800, msg: 'Authenticating User...' },
      { t: 1500, msg: 'Searching for opponents...' },
    ];

    statusSteps.forEach(step => {
      setTimeout(() => setStatus(step.msg), step.t);
    });

    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
      // Mock player count fluctuation
      setPlayerCount(prev => prev + (Math.random() > 0.5 ? 1 : -1));
    }, 1000);

    setTimeout(() => {
      socket.emit('joinQueue', { userId: user._id });
    }, 2000);

    socket.on('waiting', (data) => {
      setStatus(data.message || 'Searching for opponents...');
    });

    socket.on('matchFound', (data) => {
      setStatus('Match Found! Entering Arena...');
      clearInterval(timer);
      setTimeout(() => {
        navigate(`/arena/${data.matchId}`, { state: { matchData: data } });
      }, 1500);
    });

    return () => {
      socket.off('waiting');
      socket.off('matchFound');
      socket.disconnect();
      clearInterval(timer);
    };
  }, [user, navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 overflow-hidden">

      {/* Background Animated Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-purple-500/10 rounded-full animate-[spin_10s_linear_infinite]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-purple-500/20 rounded-full animate-[spin_7s_linear_infinite_reverse]"></div>
      </div>

      <div className="relative z-10 bg-card/80 backdrop-blur-xl border border-border p-6 md:p-12 rounded-3xl flex flex-col items-center max-w-lg w-full text-center shadow-2xl">

        {/* Radar Animation */}
        <div className="relative mb-10 w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 bg-purple-500/20 rounded-full animate-ping"></div>
          <div className="absolute inset-0 bg-purple-500/10 rounded-full animate-pulse delay-75"></div>
          <div className="relative z-10 bg-background rounded-full p-6 border-4 border-purple-500/30">
            <Swords size={40} className="text-purple-500 animate-[pulse_2s_infinite]" />
          </div>
          {/* Spinning Radar Scanner */}
          <div className="absolute inset-0 rounded-full border border-purple-500/30 border-t-purple-500 animate-spin"></div>
        </div>

        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-400 mb-2">
          Searching for Match
        </h2>

        <p className="text-muted-foreground mb-8 font-mono h-6">
          {status}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 w-full mb-8">
          <div className="bg-secondary/50 p-4 rounded-xl border border-border/50">
            <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-1">
              <Clock size={12} /> Elapsed
            </div>
            <div className="text-xl font-mono font-bold text-foreground">
              {formatTime(elapsedTime)}
            </div>
          </div>
          <div className="bg-secondary/50 p-4 rounded-xl border border-border/50">
            <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-1">
              <Clock size={12} /> Estimated
            </div>
            <div className="text-xl font-mono font-bold text-foreground">
              {formatTime(estimatedTime)}
            </div>
          </div>
        </div>

        {/* Online Count */}
        <div className="flex items-center gap-2 text-sm text-green-500 bg-green-500/10 px-4 py-2 rounded-full mb-8 border border-green-500/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="font-semibold">{playerCount} Players Online</span>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="group flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-destructive/10 hover:text-destructive border border-transparent hover:border-destructive/20 rounded-xl transition-all font-medium text-muted-foreground"
        >
          <X size={18} />
          <span>Cancel</span>
        </button>
      </div>
    </div>
  );
};

const Matchmaking = () => {
  // Minimal layout for full immersion, or standard layout
  return (
    <MainLayout>
      <MatchmakingContent />
    </MainLayout>
  )
}

export default Matchmaking;
