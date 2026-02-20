import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../api/socket';
import { useAuth } from '../context/AuthContext';
import { Swords, X, Check, Zap } from 'lucide-react';

const ChallengeNotification = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [challenger, setChallenger] = useState(null);

    useEffect(() => {
        if (!user) return;

        // Debugging logs
        console.log('Initializing Socket Connection...');
        if (!socket.connected) {
            console.log('Socket not connected, attempting to connect...');
            socket.connect();
        }

        const onConnect = () => {
            console.log('Socket Connected Successfully:', socket.id);
        };

        const onConnectError = (err) => {
            console.error('Socket Connection Error:', err);
        };

        const onDisconnect = (reason) => {
            console.warn('Socket Disconnected:', reason);
        };

        socket.on('connect', onConnect);
        socket.on('connect_error', onConnectError);
        socket.on('disconnect', onDisconnect);

        const handleNewChallenger = (data) => {
            // Don't notify if I am the challenger (shouldn't happen with broadcast, but safety check)
            if (data.challengerId === user._id) return;

            // Filter by rating: user must be within 150 points of challenger
            const userRating = user.rating !== undefined ? user.rating : 600;
            const challengerRating = data.rating !== undefined ? data.rating : 600;

            console.log(`Challenge Received: User Rating ${userRating}, Challenger Rating ${challengerRating}`);

            const ratingDiff = Math.abs(userRating - challengerRating);
            if (ratingDiff > 150) {
                console.log("Ignored challenge due to rating difference:", ratingDiff);
                return;
            }

            console.log('New Challenger Accepted for Display:', data);
            setChallenger(data);

            // Auto-dismiss after 15 seconds
            const timer = setTimeout(() => {
                setChallenger(null);
            }, 15000);

            return () => clearTimeout(timer);
        };

        socket.on('newChallenger', handleNewChallenger);

        return () => {
            socket.off('connect', onConnect);
            socket.off('connect_error', onConnectError);
            socket.off('disconnect', onDisconnect);
            socket.off('newChallenger', handleNewChallenger);
        };
    }, [user]);

    const handleAccept = () => {
        if (!challenger) return;

        // Emit acceptance
        socket.emit('acceptChallenge', {
            challengerId: challenger.challengerId,
            acceptorId: user._id
        });

        // We don't navigate yet, we wait for 'matchFound' event which is already handled in Matchmaking or global listener?
        // Actually, 'matchFound' is usually handled in the Matchmaking component which calls navigate.
        // Since we are accepting from anywhere, we need a global listener for 'matchFound' as well OR handle it here.

        // Set a flag or loading state?
        setChallenger(null); // Clear notification
    };

    const handleDecline = () => {
        setChallenger(null);
    };

    // Global matchFound listener in case we accept from dashboard
    useEffect(() => {
        const handleMatchFound = (data) => {
            // If we just accepted a challenge, we should be redirected
            // Check if I am one of the players (always true if I receive this event)
            // Verify if we are NOT already in the arena (simple check)
            if (!window.location.pathname.includes('/arena/')) {
                navigate(`/arena/${data.matchId}`, { state: { matchData: data } });
            }
        };

        socket.on('matchFound', handleMatchFound);
        return () => socket.off('matchFound', handleMatchFound);
    }, [navigate]);


    if (!challenger) return null;

    return (
        <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-right-full fade-in duration-500">
            <div className="bg-[#0a0a0f] border border-sky-500/20 shadow-[0_0_30px_rgba(14,165,233,0.2)] rounded-2xl p-4 w-80 relative overflow-hidden backdrop-blur-xl">
                {/* Animated Background Pulse */}
                <div className="absolute inset-0 bg-sky-500/5 animate-pulse"></div>
                <div className="absolute top-0 left-0 w-1 h-full bg-linear-to-b from-sky-400 to-violet-500"></div>

                <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 text-sky-400 font-bold uppercase text-xs tracking-wider">
                            <Swords size={14} className="animate-pulse" />
                            <span>Challenger Approaching!</span>
                        </div>
                        <button
                            onClick={handleDecline}
                            className="text-gray-500 hover:text-white transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-linear-to-br from-sky-500 to-violet-600 p-[2px]">
                            <div className="w-full h-full rounded-full bg-[#121218] flex items-center justify-center">
                                {challenger.avatar ? (
                                    <img src={challenger.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <span className="text-white font-bold text-lg">{challenger.username?.charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-lg leading-tight">{challenger.username}</h4>
                            <div className="flex items-center gap-1 text-xs text-yellow-500 font-mono">
                                <Zap size={10} fill="currentColor" />
                                {challenger.rating || 1200} ELO
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleDecline}
                            className="flex-1 py-2 rounded-lg bg-[#121218] hover:bg-[#1a1a20] text-gray-400 text-xs font-bold border border-white/5 transition-colors"
                        >
                            DECLINE
                        </button>
                        <button
                            onClick={handleAccept}
                            className="flex-1 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-1"
                        >
                            <Check size={14} /> ACCEPT
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChallengeNotification;
