/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import socket from '../../api/socket';
import { useAuth } from '../../context/AuthContext';
import {
  Play, Send, Trophy, Timer, Zap, Shield, Swords,
  CheckCircle, XCircle, AlertTriangle, Terminal,
  Cpu, Code2, Minimize2, Maximize2
} from 'lucide-react';

const MatchArena = () => {
  const { matchId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [matchData, setMatchData] = useState(location.state?.matchData);
  const [code, setCode] = useState('// Write your solution here\nfunction solution(input) {\n  \n}');
  const [result, setResult] = useState(null);
  const [opponentSubmitted, setOpponentSubmitted] = useState(false);
  const [matchEnded, setMatchEnded] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);

  useEffect(() => {
    if (!socket.connected) socket.connect();

    socket.on('opponentSubmitted', () => {
      setOpponentSubmitted(true);
    });

    socket.on('submissionResult', (data) => {
      setResult(data.judgment);
    });

    socket.on('matchEnded', (data) => {
      setMatchEnded(data);
    });

    const timer = setInterval(() => {
      setTimeLeft(t => (t > 0 ? t - 1 : 0));
    }, 1000);

    return () => {
      socket.off('opponentSubmitted');
      socket.off('submissionResult');
      socket.off('matchEnded');
      clearInterval(timer);
    };
  }, []);

  const handleSubmit = () => {
    socket.emit('submitCode', { matchId, userId: user._id, code });
  };

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (matchEnded) {
    const isWinner = matchEnded.winner === user._id;
    return (
      <div className="min-h-screen bg-black/90 flex flex-col items-center justify-center p-4 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/50 via-black to-black"></div>

        <div className="relative z-10 bg-card border border-border p-12 rounded-3xl flex flex-col items-center max-w-lg w-full text-center shadow-2xl animate-in zoom-in-95 duration-500">
          <div className={`mb-6 p-6 rounded-full ${isWinner ? 'bg-yellow-500/20 text-yellow-500' : 'bg-red-500/20 text-red-500'} ring-4 ring-offset-4 ring-offset-black ring-current`}>
            <Trophy size={64} className={isWinner ? 'animate-bounce' : 'opacity-50'} />
          </div>

          <h2 className="text-5xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500 uppercase tracking-tighter">
            {isWinner ? 'Victory' : 'Defeat'}
          </h2>

          <div className="flex items-center gap-4 my-8 w-full justify-center">
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Status</p>
              <p className={`font-bold text-lg ${isWinner ? 'text-green-500' : 'text-red-500'}`}>
                {isWinner ? 'Winner' : 'Eliminated'}
              </p>
            </div>
            <div className="h-8 w-px bg-border"></div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Rating</p>
              <p className="font-bold text-lg text-white">
                {isWinner ? '+25' : '-18'}
              </p>
            </div>
          </div>

          <p className="text-muted-foreground mb-8 text-sm max-w-xs mx-auto leading-relaxed">
            {isWinner
              ? 'Incredible performance! You solved the problem faster than your opponent.'
              : 'Your opponent was faster this time. Review the solution and try again.'}
          </p>

          <div className="flex gap-4 w-full">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground py-3 rounded-xl font-bold transition-all border border-border"
            >
              Home
            </button>
            <button
              onClick={() => navigate('/match/queue')}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
            >
              Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black flex flex-col text-white font-sans overflow-hidden">

      {/* Match Header */}
      <header className="h-16 bg-[#111] border-b border-[#333] flex items-center justify-between px-6 shrink-0 relative z-20">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="bg-red-600/20 p-2 rounded-lg group-hover:bg-red-600/30 transition-colors">
              <Swords size={20} className="text-red-500" />
            </div>
            <span className="font-bold tracking-tight text-lg">BATTLE<span className="text-red-500">ARENA</span></span>
          </Link>

          <div className="h-8 w-px bg-[#333]"></div>

          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${timeLeft < 60 ? 'bg-red-500/10 border-red-500/50 text-red-500 animate-pulse' : 'bg-[#222] border-[#333] text-gray-400'}`}>
              <Timer size={16} />
              <span className="font-mono text-lg font-bold">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>

        {/* Players Display */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="font-bold text-sm text-green-400">{user?.username || 'You'}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">Coding...</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center relative">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full absolute bottom-0 right-0 border-2 border-black"></span>
              <Zap size={18} className="text-green-500" />
            </div>
          </div>

          <div className="text-gray-600 font-bold text-xl italic">VS</div>

          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center relative transition-all duration-500 ${opponentSubmitted ? 'bg-green-500/20 border-green-500' : 'bg-red-500/20 border-red-500'}`}>
              {opponentSubmitted && <CheckCircle size={18} className="text-green-500 absolute -top-1 -right-1 bg-black rounded-full" />}
              <Shield size={18} className={opponentSubmitted ? 'text-green-500' : 'text-red-500'} />
            </div>
            <div className="text-left">
              <div className="font-bold text-sm text-gray-300">{matchData?.opponent?.username || 'Opponent'}</div>
              <div className={`text-[10px] uppercase tracking-wider ${opponentSubmitted ? 'text-green-500 font-bold' : 'text-gray-500'}`}>
                {opponentSubmitted ? 'Submitted!' : 'Coding...'}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSubmit}
            className="group flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-green-900/20 transition-all hover:scale-105 active:scale-95"
          >
            <Send size={16} className="group-hover:translate-x-1 transition-transform" />
            SUBMIT SOLUTION
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">

        {/* Question Panel */}
        <div className="w-[400px] bg-[#0d0d0d] border-r border-[#333] flex flex-col">
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${matchData?.question?.difficulty === 'Easy' ? 'bg-green-500/20 text-green-500' :
                  matchData?.question?.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-red-500/20 text-red-500'
                }`}>
                {matchData?.question?.difficulty || 'Medium'}
              </span>
              <span className="text-xs text-gray-500">100 Points</span>
            </div>

            <h1 className="text-2xl font-bold mb-6 leading-tight">
              {matchData?.question?.title || 'Loading Question...'}
            </h1>

            <div className="prose prose-invert prose-sm max-w-none text-gray-400">
              <p>{matchData?.question?.description || 'Waiting for match data...'}</p>
            </div>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e] relative">
          <div className="flex-1 relative">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              theme="vs-dark"
              value={code}
              onChange={setCode}
              options={{
                minimap: { enabled: false },
                fontSize: 16,
                fontFamily: "'JetBrains Mono', monospace",
                padding: { top: 24, bottom: 24 },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
              }}
            />

            {/* Floating Run Button */}
            <button className="absolute top-4 right-6 p-3 bg-blue-600 hover:bg-blue-500 rounded-full shadow-lg hover:scale-110 transition-all group z-10" title="Test Run">
              <Play size={20} fill="white" className="ml-1" />
            </button>
          </div>

          {/* Terminal / Results Panel */}
          <div className={`${isTerminalOpen ? 'h-64' : 'h-10'} bg-[#111] border-t border-[#333] transition-all duration-300 flex flex-col`}>
            <div
              className="h-10 border-b border-[#333] flex items-center justify-between px-4 cursor-pointer hover:bg-[#1a1a1a]"
              onClick={() => setIsTerminalOpen(!isTerminalOpen)}
            >
              <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider">
                <Terminal size={14} /> Execution Console
              </div>
              <div className="flex items-center gap-2">
                {result && (
                  <span className={`text-xs px-2 py-0.5 rounded ${result.allPassed ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                    {result.allPassed ? 'Passed' : 'Failed'}
                  </span>
                )}
                {isTerminalOpen ? <Minimize2 size={14} className="text-gray-500" /> : <Maximize2 size={14} className="text-gray-500" />}
              </div>
            </div>

            <div className="flex-1 p-4 font-mono text-sm overflow-y-auto text-gray-300">
              {result ? (
                <div className="space-y-3 animate-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${result.allPassed ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {result.allPassed ? <CheckCircle size={24} /> : <XCircle size={24} />}
                    </div>
                    <div>
                      <div className="font-bold text-lg">{result.allPassed ? 'All Tests Passed' : 'Tests Failed'}</div>
                      <div className="text-xs text-gray-500">Execution Time: {result.totalTime || '45ms'}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {result.results.map((r, i) => (
                      <div key={i} className="bg-[#1a1a1a] p-3 rounded border border-[#333] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 bg-[#222] px-1.5 rounded">TC #{i + 1}</span>
                          <span className={r.passed ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>
                            {r.passed ? 'PASS' : 'FAIL'}
                          </span>
                        </div>
                        <span className="text-gray-600 text-xs">{r.executionTime || 0}ms</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-2 opacity-50">
                  <Cpu size={32} />
                  <p>Ready to compile...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchArena;
