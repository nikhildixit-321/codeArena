import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import socket from '../../api/socket';
import api from '../../api/axios';
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

  const languages = [
    { id: 'javascript', name: 'JavaScript' },
    { id: 'python', name: 'Python' },
    { id: 'cpp', name: 'C++' },
    { id: 'java', name: 'Java' }
  ];

  const STARTER_CODE = {
    javascript: `// Write your solution here
function solution(nums, target) {
  
}`,
    python: `# Write your solution here
def solution(nums, target):
    pass`,
    cpp: `// Write your solution here
#include <vector>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        
    }
};`,
    java: `// Write your solution here
class Solution {
    public int[] twoSum(int[] nums, int target) {
        
    }
}`
  };

  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(STARTER_CODE['javascript']);

  // State
  const [result, setResult] = useState(null);
  const [opponentSubmitted, setOpponentSubmitted] = useState(false);
  const [matchEnded, setMatchEnded] = useState(null);
  const [timeLeft, setTimeLeft] = useState(matchData.duration || 600); // Default to match duration or 10 min
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    setCode(STARTER_CODE[language] || '// Write code here');
  }, [language]);

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
      setSubmissions(prev => [data.judgment, ...prev]); // Add to history
      setActiveTab('submissions'); // Switch to tab as requested
    });

    socket.on('matchEnded', (data) => {
      setMatchEnded(data);
    });

    socket.on('matchAborted', (data) => {
      setMatchEnded({ ...data, aborted: true, winner: data.abortedBy === user._id ? null : user._id });
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
  }, [matchId, user]); // Added deps

  const handleAbort = async () => {
    if (!matchEnded) {
      const confirm = window.confirm("Are you sure you want to exit? This will count as a DEFEAT and you will lose rating points.");
      if (!confirm) return;
      socket.emit('abortMatch', { matchId, userId: user._id });
    }
    navigate('/dashboard');
  };

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
    socket.emit('submitCode', { matchId, userId: user._id, code, language });
  };

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // --- MATCH ENDED SCREEN ---
  if (matchEnded) {
    const isWinner = matchEnded.winner === (user?._id || 'me');
    const isAborted = matchEnded.aborted;

    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 overflow-hidden relative">
        {/* Victory/Defeat Backgrounds */}
        <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] ${isWinner ? 'from-green-900/40 via-[#050505] to-[#050505]' : 'from-red-900/40 via-[#050505] to-[#050505]'}`}></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

        <div className="relative z-10 bg-[#0a0a0f] border border-white/10 p-12 rounded-3xl flex flex-col items-center max-w-lg w-full text-center shadow-2xl animate-in zoom-in-95 duration-500">
          <div className={`mb-8 p-8 rounded-full ${isWinner ? 'bg-green-500/10 text-green-500 shadow-[0_0_50px_rgba(34,197,94,0.3)]' : 'bg-red-500/10 text-red-500 shadow-[0_0_50px_rgba(239,68,68,0.3)]'} ring-1 ring-white/10`}>
            {isWinner ? <Trophy size={80} className="animate-bounce" /> : <AlertCircle size={80} className="opacity-70" />}
          </div>

          <h2 className={`text-6xl font-black mb-2 bg-clip-text text-transparent ${isWinner ? 'bg-linear-to-b from-white to-green-400' : 'bg-linear-to-b from-white to-red-400'} uppercase tracking-tighter`}>
            {isWinner ? 'Victory' : 'Defeat'}
          </h2>
          {isAborted && (
            <p className="text-orange-500 text-xs font-black uppercase tracking-widest mb-4">
              {matchEnded.abortedBy === user._id ? 'You abandoned the battle' : 'Opponent fled the arena'}
            </p>
          )}

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
          <button
            onClick={handleAbort}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="font-bold text-sm">Exit Arena</span>
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
          <div className={`px-4 py-1.5 rounded-full border flex items-center gap-2 font-mono font-bold text-lg shadow-[0_0_20px_rgba(0,0,0,0.5)] ${timeLeft < 60 ? 'bg-red-500/10 border-red-500/50 text-red-500 animate-pulse' : 'bg-[#121218] border-white/10 text-gray-200'}`}>
            <Timer size={16} />
            {formatTime(timeLeft)}
          </div>

          {/* Player 2 (Opponent) */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-linear-to-tr from-red-500 to-orange-600 p-[2px] relative">
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

        {/* Center Panel: Editor */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#050505] relative">
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

            {/* Quick Run FAB */}
            <button
              onClick={handleSubmit}
              className="absolute bottom-6 right-8 w-14 h-14 bg-sky-500 hover:bg-sky-400 rounded-full shadow-[0_0_30px_rgba(14,165,233,0.4)] flex items-center justify-center transition-all hover:scale-110 z-10 group"
            >
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
