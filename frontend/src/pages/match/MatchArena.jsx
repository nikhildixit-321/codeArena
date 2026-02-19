import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import socket from '../../api/socket';
import { useAuth } from '../../context/AuthContext';
import {
  Play, Send, Trophy, Timer, Zap, Shield, Swords,
  CheckCircle, XCircle, Terminal, Cpu, Code2,
  Minimize2, Maximize2, AlertCircle, ChevronLeft,
  Layout, Settings, ArrowRight
} from 'lucide-react';

const MatchArena = () => {
  const { matchId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Mock data fallback if direct navigation
  const [matchData, setMatchData] = useState(location.state?.matchData || {
    opponent: { username: 'NeonRival_99', rating: 1450 },
    question: {
      title: "Median of Two Sorted Arrays",
      difficulty: "Hard",
      description: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).",
      examples: [
        { input: "nums1 = [1,3], nums2 = [2]", output: "2.00000" },
        { input: "nums1 = [1,2], nums2 = [3,4]", output: "2.50000" }
      ]
    }
  });

  const [code, setCode] = useState('// Write your solution here\nfunction solution(input) {\n  \n}');
  const [result, setResult] = useState(null);
  const [opponentSubmitted, setOpponentSubmitted] = useState(false);
  const [matchEnded, setMatchEnded] = useState(null);
  const [timeLeft, setTimeLeft] = useState(matchData.duration || 600); // Default to match duration or 10 min
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    if (!socket.connected) socket.connect();

    // Re-sync duration if it came late or from socket update (optional, but good practice)
    if (matchData.duration && timeLeft === 600) {
      setTimeLeft(matchData.duration);
    }

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
    // Simulate submission for UI demo if no backend connection
    if (!socket.connected) {
      setResult({
        allPassed: true,
        totalTime: '42ms',
        results: [
          { passed: true, executionTime: 12 },
          { passed: true, executionTime: 15 },
          { passed: true, executionTime: 8 }
        ]
      });
      setTimeout(() => setMatchEnded({ winner: user?._id || 'me' }), 2000);
      return;
    }
    socket.emit('submitCode', { matchId, userId: user._id, code });
  };

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // --- MATCH ENDED SCREEN ---
  if (matchEnded) {
    const isWinner = matchEnded.winner === (user?._id || 'me');
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 overflow-hidden relative">
        {/* Victory/Defeat Backgrounds */}
        <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] ${isWinner ? 'from-green-900/40 via-[#050505] to-[#050505]' : 'from-red-900/40 via-[#050505] to-[#050505]'}`}></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

        <div className="relative z-10 bg-[#0a0a0f] border border-white/10 p-12 rounded-3xl flex flex-col items-center max-w-lg w-full text-center shadow-2xl animate-in zoom-in-95 duration-500">
          <div className={`mb-8 p-8 rounded-full ${isWinner ? 'bg-green-500/10 text-green-500 shadow-[0_0_50px_rgba(34,197,94,0.3)]' : 'bg-red-500/10 text-red-500 shadow-[0_0_50px_rgba(239,68,68,0.3)]'} ring-1 ring-white/10`}>
            <Trophy size={80} className={isWinner ? 'animate-bounce' : 'opacity-70'} />
          </div>

          <h2 className={`text-6xl font-black mb-4 bg-clip-text text-transparent ${isWinner ? 'bg-gradient-to-b from-white to-green-400' : 'bg-gradient-to-b from-white to-red-400'} uppercase tracking-tighter`}>
            {isWinner ? 'Victory' : 'Defeat'}
          </h2>

          <div className="flex items-center gap-8 my-8 w-full justify-center bg-white/5 p-6 rounded-2xl border border-white/5">
            <div className="text-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-bold">Status</p>
              <p className={`font-black text-2xl ${isWinner ? 'text-green-400' : 'text-red-400'}`}>
                {isWinner ? 'Winner' : 'Eliminated'}
              </p>
            </div>
            <div className="h-10 w-px bg-white/10"></div>
            <div className="text-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-bold">Rating</p>
              <p className="font-black text-2xl text-white flex items-center gap-1">
                {isWinner ? '+' : ''}{isWinner ? '25' : '-18'}
                <Zap size={16} className={isWinner ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
              </p>
            </div>
          </div>

          <div className="flex gap-4 w-full">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 py-4 rounded-xl font-bold transition-all border border-white/5 hover:border-white/20"
            >
              Back Home
            </button>
            <button
              onClick={() => navigate('/matchmaking')}
              className={`flex-1 py-4 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${isWinner ? 'bg-green-600 hover:bg-green-500 text-black shadow-green-500/20' : 'bg-red-600 hover:bg-red-500 text-white shadow-red-500/20'}`}
            >
              Play Again <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN ARENA UI ---
  return (
    <div className="h-screen bg-[#050505] flex flex-col text-white font-sans overflow-hidden selection:bg-sky-500/30">

      {/* 1. Header Bar */}
      <header className="h-16 bg-[#0a0a0f] border-b border-white/5 flex items-center justify-between px-6 shrink-0 relative z-20">

        {/* Left: Brand & Exit */}
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ChevronLeft size={20} />
            <span className="font-bold text-sm">Exit Arena</span>
          </Link>
          <div className="h-6 w-px bg-white/10"></div>
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-red-500 to-orange-600 w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Swords size={16} className="text-white" />
            </div>
            <div>
              <h1 className="font-black text-sm tracking-wide text-white">RATED <span className="text-red-500">MATCH</span></h1>
              <p className="text-[10px] text-gray-500 font-mono">ID: {matchId || 'X92-A1'}</p>
            </div>
          </div>
        </div>

        {/* Center: Timer & Players */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-12">
          {/* Player 1 (You) */}
          <div className="flex items-center gap-4 opacity-100 transition-opacity">
            <div className="text-right hidden md:block">
              <div className="font-bold text-sm text-white">{user?.username || 'Hero_01'}</div>
              <div className="text-[10px] text-sky-400 font-bold">1240 ELO</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 p-[2px]">
              <div className="w-full h-full rounded-full bg-[#0a0a0f] flex items-center justify-center">
                <span className="text-sky-400 font-bold text-xs">ME</span>
              </div>
            </div>
          </div>

          {/* Timer */}
          <div className={`px-4 py-1.5 rounded-full border flex items-center gap-2 font-mono font-bold text-lg shadow-[0_0_20px_rgba(0,0,0,0.5)] ${timeLeft < 60 ? 'bg-red-500/10 border-red-500/50 text-red-500 animate-pulse' : 'bg-[#121218] border-white/10 text-gray-200'}`}>
            <Timer size={16} />
            {formatTime(timeLeft)}
          </div>

          {/* Player 2 (Opponent) */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-500 to-orange-600 p-[2px] relative">
              <div className="w-full h-full rounded-full bg-[#0a0a0f] flex items-center justify-center">
                <span className="text-red-400 font-bold text-xs">OP</span>
              </div>
              {opponentSubmitted && (
                <div className="absolute -top-1 -right-1 bg-[#0a0a0f] rounded-full p-0.5">
                  <CheckCircle size={16} className="text-green-500 fill-green-500/20" />
                </div>
              )}
            </div>
            <div className="text-left hidden md:block">
              <div className="font-bold text-sm text-white">{matchData.opponent?.username || 'Rival'}</div>
              <div className={`text-[10px] font-bold ${opponentSubmitted ? 'text-green-500' : 'text-gray-500'}`}>
                {opponentSubmitted ? 'SUBMITTED' : 'CODING...'}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <Settings size={20} />
          </button>
          <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <Layout size={20} />
          </button>
          <button
            onClick={handleSubmit}
            className="group flex items-center gap-2 bg-white text-black hover:bg-gray-200 px-6 py-2.5 rounded-xl font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all hover:scale-105 active:scale-95 ml-2"
          >
            <Send size={16} className="group-hover:translate-x-0.5 transition-transform" />
            <span>SUBMIT</span>
          </button>
        </div>
      </header>

      {/* 2. Main Workspace */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left Panel: Problem Description */}
        <div className="w-[400px] lg:w-[450px] bg-[#0a0a0f] border-r border-white/5 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-white/5">
            <button
              onClick={() => setActiveTab('description')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'description' ? 'border-sky-500 text-sky-400 bg-sky-500/5' : 'border-transparent text-gray-500 hover:text-white'}`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'submissions' ? 'border-sky-500 text-sky-400 bg-sky-500/5' : 'border-transparent text-gray-500 hover:text-white'}`}
            >
              Submissions
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            {activeTab === 'description' ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-white">{matchData.question?.title}</h2>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${matchData.question?.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    matchData.question?.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                      'bg-green-500/10 text-green-400 border-green-500/20'
                    }`}>
                    {matchData.question?.difficulty}
                  </span>
                </div>

                <div className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed">
                  <p>{matchData.question?.description}</p>
                </div>

                {matchData.question?.examples?.map((ex, i) => (
                  <div key={i} className="bg-[#121218] rounded-xl p-4 border border-white/5">
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Example {i + 1}</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs text-gray-500">Input:</span>
                        <code className="block mt-1 bg-black p-2 rounded text-xs font-mono text-gray-300">{ex.input}</code>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Output:</span>
                        <code className="block mt-1 bg-black p-2 rounded text-xs font-mono text-gray-300">{ex.output}</code>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl flex items-start gap-3">
                  <AlertCircle size={18} className="text-blue-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-300">
                    <p className="font-bold mb-1">Constraint Warning</p>
                    <p className="opacity-80">Ensure your solution runs within <span className="text-white font-mono">O(log(m + n))</span> time complexity.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-gray-500">
                <p>No previous submissions in this match.</p>
              </div>
            )}
          </div>
        </div>

        {/* Center Panel: Editor */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#050505] relative">
          {/* Editor Toolbar */}
          <div className="h-10 border-b border-white/5 flex items-center justify-between px-4 bg-[#0a0a0f]">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-[#15151a] rounded text-xs text-gray-300 border border-white/5">
                <Code2 size={12} className="text-sky-400" />
                <span>JavaScript</span>
              </div>
              <span className="text-xs text-gray-600">Auto-saved</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-1.5 hover:bg-white/5 rounded text-gray-400 hover:text-white transition-colors">
                <Minimize2 size={14} />
              </button>
            </div>
          </div>

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
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                padding: { top: 24, bottom: 24 },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                renderLineHighlight: 'all',
              }}
            />

            {/* Quick Run FAB */}
            <button className="absolute bottom-6 right-8 w-14 h-14 bg-sky-500 hover:bg-sky-400 rounded-full shadow-[0_0_30px_rgba(14,165,233,0.4)] flex items-center justify-center transition-all hover:scale-110 z-10 group">
              <Play size={24} fill="black" className="ml-1 text-black" />
            </button>
          </div>

          {/* Console Panel (Collapsible) */}
          <div
            className={`border-t border-white/5 bg-[#0a0a0f] flex flex-col transition-all duration-300 ease-in-out ${isTerminalOpen ? 'h-64' : 'h-10'}`}
          >
            <div
              className="h-10 flex items-center justify-between px-4 cursor-pointer hover:bg-white/5 border-b border-white/5"
              onClick={() => setIsTerminalOpen(!isTerminalOpen)}
            >
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                <Terminal size={14} className="text-sky-400" /> Execution Console
              </div>
              <div className="flex items-center gap-3">
                {result && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${result.allPassed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {result.allPassed ? 'PASSED' : 'FAILED'}
                  </span>
                )}
                {isTerminalOpen ? <Minimize2 size={14} className="text-gray-500" /> : <Maximize2 size={14} className="text-gray-500" />}
              </div>
            </div>

            {/* Console Content */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#050505]/50">
              {result ? (
                <div className="space-y-4 animate-in slide-in-from-bottom-2 fade-in">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${result.allPassed ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                      {result.allPassed ? <CheckCircle size={24} /> : <XCircle size={24} />}
                    </div>
                    <div>
                      <h3 className={`font-bold text-lg ${result.allPassed ? 'text-green-400' : 'text-red-400'}`}>
                        {result.allPassed ? 'All Test Cases Passed' : 'Solution Failed'}
                      </h3>
                      <p className="text-xs text-gray-500 font-mono mt-1">
                        Total Execution Time: <span className="text-white">{result.totalTime}</span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {result.results.map((r, i) => (
                      <div key={i} className="bg-[#121218] border border-white/5 p-3 rounded-lg flex items-center justify-between group hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${r.passed ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-xs font-mono text-gray-400">Test Case #{i + 1}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-mono text-gray-500">{r.executionTime}ms</span>
                          <span className={`text-xs font-bold ${r.passed ? 'text-green-500' : 'text-red-500'}`}>
                            {r.passed ? 'PASS' : 'FAIL'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-3 opacity-60">
                  <Cpu size={32} />
                  <p className="text-sm font-mono">Ready to compile...</p>
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
