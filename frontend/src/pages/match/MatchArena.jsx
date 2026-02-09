import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import socket from '../../api/socket';
import { useAuth } from '../../context/AuthContext';
import { Play, Send, Trophy, AlertCircle, Timer } from 'lucide-react';

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
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
        <div className="bg-[#161b22] border border-[#30363d] p-12 rounded-2xl text-center max-w-lg w-full shadow-2xl">
          <Trophy size={80} className={`mx-auto mb-6 ${matchEnded.winner === user._id ? 'text-yellow-500' : 'text-[#8b949e]'}`} />
          <h2 className="text-4xl font-bold mb-2">
            {matchEnded.winner === user._id ? 'VICTORY!' : 'DEFEAT'}
          </h2>
          <p className="text-[#8b949e] mb-8">
            {matchEnded.winner === user._id ? 'You were faster and more accurate.' : 'Better luck next time, coder.'}
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-[#238636] hover:bg-[#2ea043] text-white font-bold py-3 px-8 rounded-lg transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0d1117] flex flex-col">
      {/* Header */}
      <header className="h-14 border-b border-[#30363d] bg-[#161b22] px-6 flex justify-between items-center text-white">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="font-bold text-[#58a6ff] hover:opacity-80 transition-opacity">BATTLE ARENA</Link>
          <div className="h-4 w-px bg-[#30363d]"></div>
          <div className="flex items-center gap-2 text-sm text-[#8b949e]">
            <Timer size={14} />
            <span className="font-mono">{formatTime(timeLeft)}</span>
          </div>
        </div>
        <div className="flex items-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>{user?.username}</span>
          </div>
          <span className="text-[#8b949e]">VS</span>
          <div className="flex items-center gap-2">
            <span>{matchData?.opponent?.username}</span>
            <div className={`w-2 h-2 rounded-full ${opponentSubmitted ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Question Description */}
        <div className="w-1/3 border-r border-[#30363d] p-6 overflow-y-auto text-white bg-[#0d1117]">
          <div className="mb-6">
             <span className="text-xs font-bold uppercase tracking-wider text-[#58a6ff] bg-[#58a6ff]/10 px-2 py-1 rounded">
               {matchData?.question?.difficulty}
             </span>
             <h1 className="text-2xl font-bold mt-3 mb-2">{matchData?.question?.title}</h1>
             <p className="text-[#8b949e] text-sm italic">Source: {matchData?.question?.source}</p>
          </div>
          <div className="prose prose-invert max-w-none text-[#c9d1d9]">
            <p className="mb-4">{matchData?.question?.description}</p>
          </div>
        </div>

        {/* Right: Editor & Results */}
        <div className="flex-1 flex flex-col bg-[#161b22]">
          <div className="flex-1">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              theme="vs-dark"
              value={code}
              onChange={setCode}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                padding: { top: 20 },
                scrollBeyondLastLine: false,
                automaticLayout: true
              }}
            />
          </div>

          {/* Bottom Bar */}
          <div className="h-48 border-t border-[#30363d] bg-[#0d1117] flex flex-col p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-[#8b949e] uppercase tracking-widest">Judgment Results</h3>
              <div className="flex gap-3">
                <button
                   onClick={handleSubmit}
                   className="flex items-center gap-2 bg-[#238636] hover:bg-[#2ea043] text-white px-6 py-2 rounded font-bold transition-all"
                >
                  <Send size={16} /> Submit
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto font-mono text-sm">
              {result ? (
                <div className="space-y-2">
                  <div className={`p-2 rounded ${result.allPassed ? 'bg-green-900/20 border border-green-900 text-green-500' : 'bg-red-900/20 border border-red-900 text-red-500'}`}>
                    {result.allPassed ? '✓ All test cases passed!' : '✗ Some test cases failed.'}
                  </div>
                  {result.results.map((r, i) => (
                    <div key={i} className="text-[#8b949e] flex gap-4">
                      <span>TC #{i+1}: {r.passed ? 'PASS' : 'FAIL'}</span>
                      {r.executionTime > 0 && <span>Time: {r.executionTime}ms</span>}
                      {r.error && <span className="text-red-400">{r.error}</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[#30363d] italic">Waiting for submission...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchArena;
