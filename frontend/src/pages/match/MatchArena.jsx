import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import socket from '../../api/socket';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
  Play, Send, Trophy, Timer, Zap, Shield, Swords,
  CheckCircle, XCircle, Terminal, Cpu, Code2,
  Minimize2, Maximize2, AlertCircle, ChevronLeft,
  Layout, Settings, ArrowRight, Minus, Lightbulb, Loader2,
  MessageSquare, Smile
} from 'lucide-react';

const MatchArena = () => {
  const { matchId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, checkUser } = useAuth();

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

  const languages = [
    { id: 'javascript', name: 'JavaScript' },
    { id: 'python', name: 'Python' },
    { id: 'cpp', name: 'C++' },
    { id: 'java', name: 'Java' }
  ];

  const STARTER_CODE = {
    javascript: `// Write your solution here\nfunction solution() {\n  \n}`,
    python: `# Write your solution here\ndef solution():\n    pass`,
    cpp: `// Write your solution here\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    void solution() {\n        \n    }\n};`,
    java: `// Write your solution here\nclass Solution {\n    public void solution() {\n        \n    }\n}`
  };

  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(STARTER_CODE['javascript']);

  // ── ALL STATE FIRST (before any useEffect that references them) ─────────
  const [result, setResult] = useState(null);
  const [opponentSubmitted, setOpponentSubmitted] = useState(false);
  const [matchEnded, setMatchEnded] = useState(null);
  const [autoNavigate, setAutoNavigate] = useState(null);

  // Timer: duration from backend, fallback by difficulty
  const getInitialTime = () => {
    if (matchData.duration && matchData.duration >= 60) return matchData.duration;
    const diff = matchData.question?.difficulty;
    if (diff === 'Hard') return 45 * 60;
    if (diff === 'Medium') return 25 * 60;
    return 15 * 60;
  };
  const [timeLeft, setTimeLeft] = useState(getInitialTime);
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  const [submissions, setSubmissions] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [customInput, setCustomInput] = useState('');
  const [consoleTab, setConsoleTab] = useState('results');
  const [runResult, setRunResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const [selectedCase, setSelectedCase] = useState(0);
  const inputRef = useRef(null);

  // 💬 CHAT STATE
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatEndRef = useRef(null);

  // ── Auto-navigate 5s after match ends (AFTER matchEnded is declared) ────
  useEffect(() => {
    if (!matchEnded) return;
    if (checkUser) checkUser();
    let count = 5;
    setAutoNavigate(count);
    const interval = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        clearInterval(interval);
        navigate('/dashboard');
      } else {
        setAutoNavigate(count);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [matchEnded]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (matchData.question?.starterCode?.[language]) {
      setCode(matchData.question.starterCode[language]);
    } else if (matchData.question?.functionName) {
      const name = matchData.question.functionName;
      if (language === 'javascript') {
        setCode(`function ${name}() {\n  \n}`);
      } else if (language === 'python') {
        setCode(`def ${name}():\n    pass`);
      } else {
        setCode(STARTER_CODE[language] || '// Write code here');
      }
    } else {
      setCode(STARTER_CODE[language] || '// Write code here');
    }
  }, [language, matchData.question]);

  useEffect(() => {
    // 1. Fetch match details if incomplete or mock
    const fetchMatchDetails = async () => {
      try {
        const res = await api.get(`/match/${matchId}`);
        const match = res.data;

        // Format match data for internal state
        // Identify opponent
        const opponentPlayer = match.players.find(p => p.user._id !== user._id);
        const myPlayer = match.players.find(p => p.user._id === user._id);

        setMatchData({
          _id: match._id, // Add match ID to state if needed
          opponent: opponentPlayer ? {
            username: opponentPlayer.user.username,
            rating: opponentPlayer.user.rating
          } : { username: 'Unknown', rating: 0 },
          question: match.question,
          duration: match.question.timeLimit || 600 // or calculate remaining
        });

        // Adjust timer?
        // Ideally calculate remaining time based on startTime
        if (match.startTime) {
          const elapsed = Math.floor((new Date() - new Date(match.startTime)) / 1000);
          const limit = match.question.timeLimit || (match.question.difficulty === 'Hard' ? 45 * 60 : match.question.difficulty === 'Medium' ? 25 * 60 : 15 * 60);
          const remaining = Math.max(0, limit - elapsed);
          setTimeLeft(remaining);
        }

      } catch (err) {
        console.error("Failed to fetch match details:", err);
      }
    };

    if (matchId && (!location.state?.matchData || matchData.question.title === "Median of Two Sorted Arrays")) {
      fetchMatchDetails();
    }

    if (!socket.connected) socket.connect();

    // Re-sync duration if it came late or from socket update
    if (matchData.duration && timeLeft === 600) {
      setTimeLeft(matchData.duration);
    }

    // Join room just in case
    // But socket.emit('joinQueue') is not right. We need 'rejoin'? 
    // Usually 'acceptChallenge' joins the room. 
    // If we refresh, we lose socket room membership!
    // We strictly need a "rejoinMatch" socket event, but for now let's hope frontend state is enough or backend pushes events to user ID room.
    // Actually, backend emits to `socket.id` or `matchRoom`.
    // If socket reconnects, it has NEW ID and is NOT in room.
    // We need to re-emit join.
    // IMPROVEMENT: emit 'joinMatchRoom'
    socket.emit('joinMatchRoom', { matchId });

    socket.on('opponentSubmitted', () => {
      setOpponentSubmitted(true);
    });

    socket.on('submissionResult', (data) => {
      setResult(data.judgment);
      setIsTerminalOpen(true);
      setConsoleTab('results');
      setSelectedCase(0);
      setSubmissions(prev => [data.judgment, ...prev]); // Add to history
      setActiveTab('submissions'); // Switch to tab as requested
    });

    socket.on('runResult', (data) => {
      setResult(data.judgment);
      setIsTerminalOpen(true);
      setConsoleTab('results');
      setSelectedCase(0);
      setIsRunning(false);
    });

    socket.on('matchEnded', (data) => {
      setMatchEnded(data);
      if (data.judgment) setResult(data.judgment);
      // checkUser & auto-navigate handled by the matchEnded useEffect above
    });

    socket.on('matchMessage', (data) => {
      setChatMessages(prev => [...prev, data]);
      if (!isChatOpen) {
        // Optional: show a notification dot or toast
      }
    });

    socket.on('matchAborted', (data) => {
      // Unified into matchEnded now — fallback for old events
      setMatchEnded({ ...data, reason: 'ABORT' });
    });

    // Timer — counts down and fires timeoutMatch at 0
    // Guard: only if initial time is valid (>=60s) — prevents mock data instant-timeout
    const initialTime = getInitialTime();
    if (initialTime < 60) {
      console.warn('[Timer] Invalid duration, not starting timer:', initialTime);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer);
          if (socket.connected && matchId && user?._id) {
            socket.emit('timeoutMatch', { matchId, userId: user._id });
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      socket.off('opponentSubmitted');
      socket.off('submissionResult');
      socket.off('matchEnded');
      socket.off('runResult');
      socket.off('matchMessage');
      clearInterval(timer);
    };
  }, [matchId, user]);

  const handleSendMessage = (e, type = 'text', msg = null) => {
    if (e) e.preventDefault();
    const finalMsg = msg || chatInput;
    if (!finalMsg.trim()) return;

    socket.emit('matchChat', {
      matchId,
      userId: user._id,
      username: user.username,
      message: finalMsg,
      type
    });
    if (type === 'text') setChatInput('');
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleAbort = () => {
    if (matchEnded) { navigate('/dashboard'); return; }
    const confirm = window.confirm("Are you sure you want to EXIT?\n\n• If NO code was submitted: Match ABORTS (no rating change)\n• If code was submitted: Counts as RESIGN (-15 rating)");
    if (!confirm) return;
    socket.emit('abortMatch', { matchId, userId: user._id });
    navigate('/dashboard');
  };

  const handleResign = () => {
    if (matchEnded) return;
    const confirm = window.confirm("Are you sure you want to RESIGN?\n\nThis counts as a loss and you will lose 15 rating points.");
    if (!confirm) return;
    socket.emit('resignMatch', { matchId, userId: user._id });
  };

  const handleSampleRun = () => {
    if (!code.trim() || isRunning) return;
    setIsRunning(true);
    setConsoleTab('results');
    setIsTerminalOpen(true);
    socket.emit('runCode', { matchId, userId: user._id, code, language });
  };

  const handleCustomRun = () => {
    if (!code.trim()) return;
    setIsTerminalOpen(true);
    setConsoleTab('output');
    setIsWaitingForInput(true);
    setRunResult(`// Match Program Initialized.\n// Waiting for input data...\n// Enter input in the left panel and click 'Execute'.\n`);
    // Focus input area
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const executeWithInput = async () => {
    if (!code.trim() || isRunning) return;

    setIsRunning(true);
    setIsWaitingForInput(false);
    setRunResult(prev => prev + `\n===== RUNNING =====\n`);

    try {
      const response = await api.post('/execute/run', {
        code,
        language,
        stdin: customInput
      });

      if (response.data.error) {
        setRunResult(prev => prev + `\n[Error]: ${response.data.error}`);
      } else {
        const { stdout, stderr, compile_output } = response.data;
        let finalOutput = '';
        if (compile_output) finalOutput += `\n[Compiler]:\n${compile_output}\n`;
        if (stdout) finalOutput += stdout;
        if (stderr) finalOutput += `\n[Runtime Error]:\n${stderr}`;
        setRunResult(prev => prev + (finalOutput || '\n(No output returned)'));
      }
    } catch (err) {
      setRunResult(prev => prev + `\n[Execution Error]: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && isWaitingForInput) {
      e.preventDefault();
      executeWithInput();
    }
  };

  const handleSubmit = () => {
    setConsoleTab('results');
    setIsTerminalOpen(true);
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
    socket.emit('submitCode', { matchId, userId: user._id, code, language });
  };

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // --- MATCH ENDED SCREEN ---
  // ─── MATCH ENDED SCREEN ────────────────────────────────────────────────
  if (matchEnded) {
    const myId = user?._id?.toString();
    const winnerId = matchEnded.winner?.toString();
    const reason = matchEnded.reason || 'UNKNOWN';
    const isAbort = reason === 'ABORT';
    const isWinner = !isAbort && winnerId && winnerId === myId;
    const isDraw = !isAbort && !winnerId;

    const reasonConfig = {
      SOLVED: { label: 'Checkmate', sub: 'All test cases passed', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
      TIMEOUT: { label: 'Timeout', sub: 'Time ran out', color: 'text-orange-400', bg: 'bg-orange-500/10' },
      RESIGN: { label: 'Resignation', sub: isWinner ? 'Opponent resigned' : 'You resigned', color: isWinner ? 'text-emerald-400' : 'text-red-400', bg: isWinner ? 'bg-emerald-500/10' : 'bg-red-500/10' },
      DISCONNECT: { label: 'Disconnect', sub: isWinner ? 'Opponent disconnected' : 'You disconnected', color: isWinner ? 'text-sky-400' : 'text-red-400', bg: isWinner ? 'bg-sky-500/10' : 'bg-red-500/10' },
      ABORT: { label: 'Aborted', sub: 'Match ended before it started', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
      UNKNOWN: { label: 'Match Over', sub: '', color: 'text-gray-400', bg: 'bg-white/5' },
    };

    const cfg = reasonConfig[reason] || reasonConfig.UNKNOWN;
    const ratingChange = matchEnded.ratingChanges?.find(r => r.userId?.toString() === myId)?.change;

    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 overflow-hidden relative">
        {/* Background glow */}
        <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] ${isAbort ? 'from-yellow-900/30 via-[#050505] to-[#050505]' :
          isWinner ? 'from-emerald-900/40 via-[#050505] to-[#050505]' :
            isDraw ? 'from-blue-900/30 via-[#050505] to-[#050505]' :
              'from-red-900/40 via-[#050505] to-[#050505]'
          }`} />

        <div className="relative z-10 max-w-md w-full">
          {/* Main card */}
          <div className="bg-[#0a0a0f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">

            {/* Top color bar */}
            <div className={`h-1.5 w-full ${isAbort ? 'bg-yellow-500' : isWinner ? 'bg-emerald-500' : isDraw ? 'bg-blue-500' : 'bg-red-500'
              }`} />

            <div className="p-8 flex flex-col items-center text-center">
              {/* Trophy / Icon */}
              <div className={`mb-6 w-24 h-24 rounded-full flex items-center justify-center ${isAbort ? 'bg-yellow-500/10' : isWinner ? 'bg-emerald-500/10' : isDraw ? 'bg-blue-500/10' : 'bg-red-500/10'
                } ring-1 ring-white/10`}>
                {isAbort ? <AlertCircle size={50} className="text-yellow-400" /> :
                  isWinner ? <Trophy size={50} className="text-emerald-400 animate-bounce" /> :
                    isDraw ? <Minus size={50} className="text-blue-400" /> :
                      <XCircle size={50} className="text-red-400" />}
              </div>

              {/* Result text */}
              <h2 className={`text-5xl font-black uppercase tracking-tighter mb-1 ${isAbort ? 'text-yellow-400' : isWinner ? 'text-emerald-400' : isDraw ? 'text-blue-400' : 'text-red-400'
                }`}>
                {isAbort ? 'Aborted' : isWinner ? 'Victory!' : isDraw ? 'Draw' : 'Defeat'}
              </h2>
              <p className="text-gray-500 text-sm mb-6">vs {matchData.opponent?.username || 'Opponent'}</p>

              {/* Reason badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 ${cfg.bg} mb-6`}>
                <span className={`text-xs font-black uppercase tracking-widest ${cfg.color}`}>{cfg.label}</span>
                <span className="text-gray-600">·</span>
                <span className="text-xs text-gray-500">{cfg.sub}</span>
              </div>

              {/* Stats row */}
              <div className="flex items-stretch gap-px w-full bg-white/5 rounded-2xl overflow-hidden border border-white/5 mb-8">
                <div className="flex-1 flex flex-col items-center p-4">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-bold">Result</p>
                  <p className={`font-black text-xl ${isAbort ? 'text-yellow-400' : isWinner ? 'text-emerald-400' : isDraw ? 'text-blue-400' : 'text-red-400'
                    }`}>
                    {isAbort ? 'Abort' : isWinner ? 'Win' : isDraw ? 'Draw' : 'Loss'}
                  </p>
                </div>
                <div className="w-px bg-white/5" />
                <div className="flex-1 flex flex-col items-center p-4">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-bold">Rating</p>
                  <p className={`font-black text-xl flex items-center gap-1 ${ratingChange > 0 ? 'text-emerald-400' : ratingChange < 0 ? 'text-red-400' : 'text-gray-400'
                    }`}>
                    {ratingChange !== undefined
                      ? (ratingChange > 0 ? '+' : '') + ratingChange
                      : isAbort ? '±0' : isWinner ? '+20' : isDraw ? '±0' : '-15'}
                    <Zap size={14} className={ratingChange > 0 ? 'text-yellow-400 fill-yellow-400' : 'opacity-30'} />
                  </p>
                </div>
                <div className="w-px bg-white/5" />
                <div className="flex-1 flex flex-col items-center p-4">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-bold">Question</p>
                  <p className="font-bold text-xs text-gray-300 text-center leading-tight truncate max-w-full px-1">
                    {matchData.question?.difficulty || 'Easy'}
                  </p>
                </div>
              </div>

              {/* Auto-navigate countdown */}
              {autoNavigate !== null && (
                <div className="w-full mb-3">
                  <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1.5">
                    <span>Redirecting to dashboard...</span>
                    <span className="font-bold text-gray-400">{autoNavigate}s</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${isWinner ? 'bg-emerald-500' : isAbort ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${(autoNavigate / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 py-3.5 rounded-xl font-bold transition-all border border-white/5 hover:border-white/20 text-sm"
                >
                  Home
                </button>
                <button
                  onClick={() => navigate('/matchmaking')}
                  className={`flex-1 py-3.5 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 text-sm ${isWinner
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-black shadow-emerald-500/20'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                    }`}
                >
                  Play Again <ArrowRight size={16} />
                </button>
              </div>

            </div>
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
          <button
            onClick={handleAbort}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={isMobile ? 18 : 20} />
            <span className="font-bold text-xs md:text-sm">{isMobile ? '' : 'Exit Arena'}</span>
          </button>
          <div className="h-6 w-px bg-white/10"></div>
          <div className="flex items-center gap-2">
            <div className="bg-linear-to-br from-red-500 to-orange-600 w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
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
              <div className="text-[10px] text-sky-400 font-bold">{user?.rating || 600} ELO</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-linear-to-tr from-sky-500 to-blue-600 p-[2px]">
              <div className="w-full h-full rounded-full bg-[#0a0a0f] flex items-center justify-center border border-white/10">
                <span className="text-sky-400 font-bold text-xs">ME</span>
              </div>
            </div>
          </div>

          {/* Timer */}
          {(() => {
            const totalTime = matchData.duration || getInitialTime();
            const pctLeft = timeLeft / totalTime;
            const urgency = timeLeft < 60 ? 'red' : pctLeft < 0.25 ? 'orange' : 'normal';
            return (
              <div className="flex flex-col items-center gap-0.5">
                <div className={`
                  px-3 py-1 md:px-4 md:py-1.5 rounded-full border flex items-center gap-2 font-mono font-bold text-sm md:text-lg shadow-lg transition-all
                  ${urgency === 'red' ? 'bg-red-500/10 border-red-500/60 text-red-400 animate-pulse' :
                    urgency === 'orange' ? 'bg-orange-500/10 border-orange-500/50 text-orange-400' :
                      'bg-[#121218] border-white/10 text-gray-200'
                  }
                `}>
                  <Timer size={isMobile ? 14 : 16} />
                  {formatTime(timeLeft)}
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
                  {matchData.question?.difficulty === 'Hard' ? '45 MIN' : matchData.question?.difficulty === 'Medium' ? '25 MIN' : '15 MIN'}
                </span>
              </div>
            );
          })()}

          {/* Player 2 (Opponent) */}
          <div className="flex items-center gap-2 md:gap-4">
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full bg-linear-to-tr from-red-500 to-orange-600 p-[2px] relative`}>
              <div className="w-full h-full rounded-full bg-[#0a0a0f] flex items-center justify-center">
                <span className="text-red-400 font-bold text-[10px] md:text-xs">OP</span>
              </div>
              {opponentSubmitted && (
                <div className="absolute -top-1 -right-1 bg-[#0a0a0f] rounded-full p-0.5">
                  <CheckCircle size={16} className="text-green-500 fill-green-500/20" />
                </div>
              )}
            </div>
            <div className="text-left hidden md:block">
              <div className="font-bold text-sm text-white">{matchData.opponent?.username || 'Rival'}</div>
              <div className="text-[10px] text-red-500 font-bold">{matchData.opponent?.rating || 600} ELO</div>
            </div>
          </div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <div className={`text-[10px] font-black tracking-widest px-2 py-0.5 rounded ${opponentSubmitted ? 'bg-green-500 text-black animate-pulse' : 'bg-white/5 text-gray-500'}`}>
              {opponentSubmitted ? 'OPPONENT FINISHED' : 'DUEL IN PROGRESS'}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Chat Toggle */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`p-2 rounded-xl border transition-all relative ${isChatOpen ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}`}
          >
            <MessageSquare size={isMobile ? 18 : 20} />
            {chatMessages.length > 0 && !isChatOpen && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#0a0a0f]" />
            )}
          </button>

          {/* Resign Button — chess style */}
          <button
            onClick={handleResign}
            title="Resign (lose the match)"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-500/30 bg-red-500/5 text-red-400 hover:bg-red-500/15 hover:border-red-500/50 transition-all text-xs font-bold uppercase tracking-widest group"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="group-hover:scale-110 transition-transform">
              <path d="M4 3h16v10H4V3zm2 2v6h12V5H6zm-2 9h2v8H4v-8zm14 0h2v8h-2v-8z" />
            </svg>
            {!isMobile && <span>Resign</span>}
          </button>

          <button
            onClick={handleSubmit}
            className="group flex items-center gap-2 bg-white text-black hover:bg-gray-200 px-4 py-2 md:px-6 md:py-2.5 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 ml-1 md:ml-2 text-xs md:text-sm"
          >
            <Send size={14} className="group-hover:translate-x-0.5 transition-transform" />
            <span>SUBMIT</span>
          </button>
        </div>

      </header>

      {/* Mobile Tab Switcher */}
      {isMobile && (
        <div className="flex bg-[#0a0a0f] border-b border-white/5 relative z-20">
          <button onClick={() => setActiveTab('description')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest ${activeTab === 'description' ? 'text-sky-400 border-b-2 border-sky-500 bg-sky-500/5' : 'text-gray-500'}`}>Problem</button>
          <button onClick={() => setActiveTab('editor')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest ${activeTab === 'editor' ? 'text-sky-400 border-b-2 border-sky-500 bg-sky-500/5' : 'text-gray-500'}`}>Solve</button>
          <button onClick={() => setActiveTab('submissions')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest ${activeTab === 'submissions' ? 'text-sky-400 border-b-2 border-sky-500 bg-sky-500/5' : 'text-gray-500'}`}>Rival</button>
        </div>
      )}

      {/* 2. Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* Left Panel: Problem Description - Hidden on mobile if not in Description tab */}
        <div className={`
          ${isMobile && activeTab !== 'description' && activeTab !== 'submissions' ? 'hidden' : 'flex'}
          ${isMobile ? 'w-full fixed inset-0 z-10 pt-28 bg-[#0a0a0f]' : 'w-[400px] lg:w-[450px] border-r border-white/5'}
          flex flex-col bg-[#0a0a0f]
        `}>
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

                <div className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: matchData.question?.description || matchData.question?.content || 'No description available.' }}
                >
                </div>

                {/* Constraints Section */}
                {matchData.question?.constraints && matchData.question.constraints.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Constraints</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {matchData.question.constraints.map((c, i) => (
                        <li key={i} className="text-xs text-gray-400 font-mono">{c}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Examples Section */}
                {(matchData.question?.examples || matchData.question?.testCases?.filter(tc => !tc.isHidden).slice(0, 2)) && (
                  <div className="mt-8 space-y-4">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Examples</h3>
                    {Array.isArray(matchData.question?.examples) ? (
                      matchData.question.examples.map((ex, i) => (
                        <div key={i} className="bg-[#121218] rounded-xl p-4 border border-white/5 space-y-2">
                          <h4 className="text-[10px] font-bold text-sky-500 uppercase">Example {i + 1}</h4>
                          <div className="space-y-2">
                            <div>
                              <span className="text-xs text-gray-500">Input:</span>
                              <code className="block mt-1 bg-black p-2 rounded text-xs font-mono text-gray-300">{ex.input}</code>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">Output:</span>
                              <code className="block mt-1 bg-black p-2 rounded text-xs font-mono text-gray-300">{ex.output}</code>
                            </div>
                            {ex.explanation && (
                              <div>
                                <span className="text-xs text-gray-500 italic">Explanation:</span>
                                <p className="mt-1 text-xs text-gray-400 leading-relaxed italic border-l-2 border-sky-500/20 pl-3">{ex.explanation}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-[#121218] rounded-xl p-4 border border-white/5">
                        <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap">{matchData.question?.examples}</pre>
                      </div>
                    )}
                  </div>
                )}

                {/* Hints Section */}
                {matchData.question?.hints && matchData.question.hints.length > 0 && (
                  <div className="bg-yellow-500/5 border border-yellow-500/20 p-4 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-yellow-500">
                      <Lightbulb size={16} />
                      <span className="text-xs font-bold uppercase tracking-wider">Hints</span>
                    </div>
                    <div className="space-y-2">
                      {matchData.question.hints.map((hint, i) => (
                        <div key={i} className="flex gap-2">
                          <span className="text-[10px] text-yellow-500 font-bold">{i + 1}.</span>
                          <p className="text-xs text-yellow-400/80">{hint}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Legacy Alert/Caution */}
                <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl flex items-start gap-3">
                  <AlertCircle size={18} className="text-blue-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-300">
                    <p className="font-bold mb-1">Combat Tip</p>
                    <p className="opacity-80">Speed counts! Submit early to gain more points in case of a tie.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.length === 0 ? (
                  <div className="text-center py-20 text-gray-500">
                    <p>No previous submissions in this match.</p>
                  </div>
                ) : (
                  submissions.map((sub, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border ${sub.allPassed ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-bold text-sm ${sub.allPassed ? 'text-green-400' : 'text-red-400'}`}>
                          {sub.allPassed ? 'Accepted' : 'Wrong Answer'}
                        </span>
                        <span className="text-xs text-gray-500">{new Date().toLocaleTimeString()}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>Time: {sub.avgTime || sub.totalTime}</span>
                        <span>{sub.results.filter(r => r.passed).length}/{sub.results.length} Test Cases</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Center Panel: Editor - Hidden on mobile if not in Editor tab */}
        <div className={`
          flex-1 flex flex-col min-w-0 bg-[#050505] relative
          ${isMobile && activeTab !== 'editor' ? 'hidden' : 'flex'}
        `}>
          {/* Editor Toolbar */}
          <div className="h-10 border-b border-white/5 flex items-center justify-between px-4 bg-[#0a0a0f]">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-1 bg-[#15151a] hover:bg-[#1a1a20] rounded text-xs text-gray-300 border border-white/5 transition-colors">
                  <Code2 size={12} className="text-sky-400" />
                  <span className="capitalize">{languages.find(l => l.id === language)?.name}</span>
                </button>
                {/* Simple Dropdown */}
                <div className="absolute top-full left-0 mt-1 w-32 bg-[#15151a] border border-white/10 rounded-lg shadow-xl overflow-hidden hidden group-hover:block z-50">
                  {languages.map(lang => (
                    <button
                      key={lang.id}
                      onClick={() => setLanguage(lang.id)}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-white/5 transition-colors ${language === lang.id ? 'text-sky-400 font-bold' : 'text-gray-400'}`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
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
              language={language}
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

            {/* Run Button */}
            <button
              onClick={handleSampleRun}
              disabled={isRunning}
              className="absolute bottom-6 right-24 w-14 h-14 bg-white/5 hover:bg-white/10 text-white rounded-full border border-white/10 shadow-xl flex items-center justify-center transition-all hover:scale-110 z-10 group disabled:opacity-50"
              title="Run Code (Sample Cases)"
            >
              {isRunning ? <Loader2 size={24} className="animate-spin text-sky-400" /> : <Play size={24} className="ml-1 text-white" />}
            </button>

            {/* Quick Submit FAB */}
            <button
              onClick={handleSubmit}
              disabled={isRunning}
              className="absolute bottom-6 right-8 w-14 h-14 bg-sky-500 hover:bg-sky-400 rounded-full shadow-[0_0_30px_rgba(14,165,233,0.4)] flex items-center justify-center transition-all hover:scale-110 z-10 group disabled:opacity-50"
              title="Submit Solution"
            >
              <Send size={24} fill="black" className="ml-0.5 text-black" />
            </button>
          </div>

          {/* Console Panel (Collapsible) */}
          <div
            className={`border-t border-white/5 bg-[#0a0a0f] flex flex-col transition-all duration-300 ease-in-out ${isTerminalOpen ? 'h-72' : 'h-10'}`}
          >
            <div className="h-10 flex items-center justify-between px-4 border-b border-white/5 bg-[#0a0a0f]">
              <div className="flex items-center h-full">
                <button
                  onClick={() => { setConsoleTab('results'); setIsTerminalOpen(true); }}
                  className={`h-full px-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${consoleTab === 'results' ? 'border-sky-500 text-sky-500 bg-sky-500/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                >
                  Results
                </button>
                <button
                  onClick={() => { setConsoleTab('output'); setIsTerminalOpen(true); }}
                  className={`h-full px-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${consoleTab === 'output' ? 'border-rose-500 text-rose-500 bg-rose-500/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                >
                  Console
                </button>
              </div>
              <div className="flex items-center gap-3">
                {result && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${result.allPassed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {result.allPassed ? 'PASSED' : 'FAILED'}
                  </span>
                )}
                <button onClick={() => setIsTerminalOpen(!isTerminalOpen)} className="p-1.5 hover:bg-white/10 rounded transition-colors text-gray-500">
                  {isTerminalOpen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>
              </div>
            </div>

            {/* Console Content */}
            <div className="flex-1 overflow-hidden bg-[#050505]">
              {consoleTab === 'results' ? (
                <div className="h-full overflow-y-auto p-4 custom-scrollbar">
                  {result ? (
                    <div className="space-y-4 animate-in slide-in-from-bottom-2 fade-in">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${result.allPassed ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-400'}`}>
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

                      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {result.results.map((r, i) => (
                          <button
                            key={i}
                            onClick={() => setSelectedCase(i)}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${selectedCase === i
                              ? (r.passed ? 'bg-green-500/10 border-green-500/40 text-green-400' : 'bg-red-500/10 border-red-500/40 text-red-400')
                              : 'bg-white/5 border-white/5 text-gray-500 hover:text-gray-300'
                              }`}
                          >
                            Case {i + 1}
                          </button>
                        ))}
                      </div>

                      {/* Case Details */}
                      <div className="bg-[#121218] border border-white/5 rounded-2xl p-5 space-y-4 animate-in fade-in duration-300">
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-2">Input</p>
                            <div className="bg-black/40 rounded-xl p-3 font-mono text-xs text-blue-300 border border-white/5">
                              {result.results[selectedCase]?.input || 'N/A'}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-2">Expected</p>
                              <div className="bg-black/40 rounded-xl p-3 font-mono text-xs text-green-400 border border-white/5">
                                {result.results[selectedCase]?.expected}
                              </div>
                            </div>
                            <div>
                              <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-2">Outcome</p>
                              <div className={`bg-black/40 rounded-xl p-3 font-mono text-xs border border-white/5 ${result.results[selectedCase]?.passed ? 'text-green-400' : 'text-red-400'}`}>
                                {result.results[selectedCase]?.actual || 'No output'}
                              </div>
                            </div>
                          </div>
                          {result.results[selectedCase]?.executionTime !== undefined && (
                            <div className="flex items-center gap-2">
                              <Timer size={12} className="text-gray-600" />
                              <span className="text-[10px] font-bold text-gray-600 font-mono">
                                Execution Time: {result.results[selectedCase].executionTime}ms
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-3 opacity-60">
                      <Cpu size={32} />
                      <p className="text-sm font-mono tracking-tight uppercase">Submit your code to see competition results</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex overflow-hidden">
                  {/* Input Side */}
                  <div className="w-1/3 border-r border-white/5 flex flex-col bg-white/1">
                    <div className="px-3 py-1 bg-white/2 border-b border-white/5 flex items-center justify-between">
                      <span className={`text-[9px] font-black uppercase tracking-tighter ${isWaitingForInput ? 'text-rose-500 animate-pulse' : 'text-gray-500'}`}>
                        {isWaitingForInput ? 'Enter Stdin...' : 'Input'}
                      </span>
                      <button
                        onClick={executeWithInput}
                        disabled={isRunning}
                        className={`text-[9px] font-black px-2 py-0.5 rounded transition-all uppercase ${isWaitingForInput ? 'bg-rose-500 text-black shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'text-rose-500 hover:text-rose-400'}`}
                      >
                        {isRunning ? '...' : (isWaitingForInput ? 'Enter' : 'Execute')}
                      </button>
                    </div>
                    <textarea
                      ref={inputRef}
                      value={customInput}
                      onKeyDown={handleKeyDown}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="Type stdin..."
                      className={`flex-1 p-4 bg-transparent border-none outline-none text-gray-300 font-mono text-[11px] resize-none placeholder:text-gray-800 transition-all ${isWaitingForInput ? 'bg-rose-500/5' : ''}`}
                    />
                  </div>
                  {/* Output Side */}
                  <div className="flex-1 flex flex-col">
                    <div className="px-3 py-1 bg-white/2 border-b border-white/5">
                      <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">Output</span>
                    </div>
                    <div className="flex-1 p-5 font-mono text-[13px] overflow-y-auto custom-scrollbar text-gray-400">
                      <pre className="whitespace-pre-wrap">{runResult || 'Execution results will appear here...'}</pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* 4. CHAT SIDEBAR / DRAWER */}
      {isChatOpen && (
        <div className={`fixed inset-y-0 right-0 w-80 bg-[#0a0a0f] border-l border-white/10 z-100 flex flex-col shadow-2xl transition-transform duration-300 transform translate-x-0`}>
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <MessageSquare size={16} className="text-blue-500" />
              Match Chat
            </h3>
            <button onClick={() => setIsChatOpen(false)} className="text-gray-500 hover:text-white p-1">
              <ChevronLeft size={20} className="rotate-180" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {chatMessages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-gray-600 italic text-sm">
                <Smile size={32} className="mb-2 opacity-20" />
                No messages yet. Say hi!
              </div>
            )}
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.userId === user._id ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${msg.userId === user._id ? 'text-blue-400' : 'text-red-400'}`}>
                    {msg.userId === user._id ? 'You' : msg.username}
                  </span>
                </div>
                {msg.type === 'emote' ? (
                  <div className="text-4xl animate-bounce duration-1000">
                    {msg.message}
                  </div>
                ) : (
                  <div className={`px-3 py-2 rounded-2xl text-sm max-w-[90%] wrap-break-word ${msg.userId === user._id ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white/5 text-gray-200 rounded-tl-none'}`}>
                    {msg.message}
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Emote Shortcuts */}
          <div className="flex justify-around p-2 border-t border-white/5 bg-white/5">
            {['👋', 'GG', '💡', '😮', '💀'].map(emoji => (
              <button
                key={emoji}
                onClick={() => handleSendMessage(null, 'emote', emoji)}
                className="hover:scale-125 transition-transform p-2 text-xl"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-[#0a0a0a]">
            <div className="relative">
              <input
                type="text"
                placeholder="Send a message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-3 pr-10 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 p-1">
                <Send size={14} />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MatchArena;
