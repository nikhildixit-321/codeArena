import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import HomeNavbar from '../../components/Navbar';
import { Loader2, ExternalLink, Code2, Trophy, Brain } from 'lucide-react';

const PracticeHome = () => {
  const [questions, setQuestions] = useState([]);
  const [platform, setPlatform] = useState('leetcode');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuestions();
  }, [platform]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/questions/${platform}`);
      setQuestions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex min-h-screen">
        
        {/* SIDEBAR FOR PLATFORMS */}
        <div className="w-64 bg-gray-950 border-r border-gray-800 p-6 shrink-0">
          <h2 className="text-purple-500 font-bold mb-8 uppercase tracking-widest text-xs">Platforms</h2>
          <div className="space-y-4">
            <button
              onClick={() => setPlatform('leetcode')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${platform === 'leetcode' ? 'bg-orange-500/20 border border-orange-500 text-orange-500' : 'bg-gray-900 border border-transparent text-gray-400 hover:bg-gray-800'}`}
            >
              <span className="font-bold">LeetCode</span>
            </button>
            <button
              onClick={() => setPlatform('codeforces')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${platform === 'codeforces' ? 'bg-blue-500/20 border border-blue-500 text-blue-500' : 'bg-gray-900 border border-transparent text-gray-400 hover:bg-gray-800'}`}
            >
              <span className="font-bold">Codeforces</span>
            </button>
            <button
              onClick={() => setPlatform('codechef')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${platform === 'codechef' ? 'bg-yellow-500/20 border border-yellow-500 text-yellow-500' : 'bg-gray-900 border border-transparent text-gray-400 hover:bg-gray-800'}`}
            >
              <span className="font-bold">CodeChef</span>
            </button>
          </div>

          <div className="mt-12 p-4 bg-purple-900/10 border border-purple-500/20 rounded-2xl">
            <h3 className="text-sm font-bold text-purple-400 mb-2 flex items-center gap-2">
              <Brain size={16} /> Tip
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Practice problems from these platforms to improve your rating in the Arena!
            </p>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 p-6 overflow-y-auto">
          <HomeNavbar />

          <div className="mt-8 px-2">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-black capitalize">{platform} Problems</h1>
                <p className="text-gray-500 text-sm mt-1">Showing the latest 50 challenges.</p>
              </div>
              <button 
                onClick={fetchQuestions}
                className="p-2 bg-gray-900 rounded-lg hover:bg-gray-800 border border-gray-800 transition-all"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="h-96 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-purple-500 mb-4" size={48} />
                <p className="text-gray-500 animate-pulse">Fetching problems...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {questions.map((q, idx) => (
                  <div 
                    key={q.id || idx} 
                    className="group bg-gray-950 border border-gray-800 p-4 rounded-xl flex items-center justify-between hover:border-purple-500/40 hover:bg-gray-900/30 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center text-xs font-mono text-gray-500 border border-gray-800 group-hover:border-purple-500/20">
                        {q.id || idx + 1}
                      </div>
                      <div>
                        <h4 className="font-bold group-hover:text-purple-400 transition-colors">{q.title}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${
                            q.difficulty === 'Easy' || q.difficulty < 1200 ? 'bg-green-500/10 text-green-500' : 
                            q.difficulty === 'Medium' || q.difficulty < 1900 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'
                          }`}>
                            {q.difficulty}
                          </span>
                          {q.tags && q.tags.slice(0, 2).map(t => (
                            <span key={t} className="text-[10px] text-gray-600 font-mono">#{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => navigate(`/practice/arena`, { state: { question: q } })}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600/10 hover:bg-purple-600 border border-purple-500/20 hover:border-purple-500 text-purple-500 hover:text-white rounded-lg text-xs font-bold transition-all"
                      >
                        <Code2 size={14} /> Solve
                      </button>
                      <a 
                        href={q.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-gray-900 rounded-lg border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeHome;
