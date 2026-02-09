import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import socket from '../../api/socket';
import { Loader2, X } from 'lucide-react';

const Matchmaking = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState('Initializing...');
  const navigate = useNavigate();

  useEffect(() => {
    socket.connect();
    
    socket.emit('joinQueue', { userId: user._id });

    socket.on('waiting', (data) => {
      setStatus(data.message);
    });

    socket.on('matchFound', (data) => {
      setStatus('Match Found! Preparing Arena...');
      setTimeout(() => {
        navigate(`/arena/${data.matchId}`, { state: { matchData: data } });
      }, 1500);
    });

    return () => {
      socket.off('waiting');
      socket.off('matchFound');
      socket.disconnect();
    };
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center p-4">
      <div className="bg-[#161b22] border border-[#30363d] p-12 rounded-2xl flex flex-col items-center max-w-md w-full text-center">
        <div className="relative mb-8">
           <Loader2 size={80} className="text-[#58a6ff] animate-spin" />
           <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-12 h-12 bg-[#0d1117] rounded-full"></div>
           </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Finding Opponent</h2>
        <p className="text-[#8b949e] mb-8 font-mono">{status}</p>
        
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-[#8b949e] hover:text-white transition-colors"
        >
          <X size={20} /> Cancel Search
        </button>
      </div>
    </div>
  );
};

export default Matchmaking;
