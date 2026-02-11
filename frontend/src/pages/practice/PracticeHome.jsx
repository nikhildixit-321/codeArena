import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import HomeNavbar from '../../components/Navbar';
import { Loader2, ExternalLink, Code2, Trophy, Brain } from 'lucide-react';

const PracticeHome = () => {
  const [questions, setQuestions] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [platform, setPlatform] = useState('leetcode');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  
  // LeetCode Topics
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showTopics, setShowTopics] = useState(true);
  
  // Codeforces Ratings
  const [ratingRange, setRatingRange] = useState({ min: 0, max: 5000 });
  const [showRatingFilter, setShowRatingFilter] = useState(false);
  
  const itemsPerPage = 50;
  const navigate = useNavigate();

  useEffect(() => {
    if (platform === 'leetcode') {
      fetchTopics();
      setShowTopics(true);
      setSelectedTopic(null);
    } else {
      setShowTopics(false);
      fetchQuestions(1);
    }
    
    if (platform === 'leetcode') fetchDailyChallenge();
    if (platform === 'codeforces') fetchCodeforcesFeatured();
  }, [platform]);

  useEffect(() => {
    if (platform === 'leetcode' && selectedTopic) {
      fetchQuestionsByTopic(1);
    }
  }, [selectedTopic]);

  const fetchTopics = async () => {
    try {
      const res = await api.get('/questions/leetcode/topics');
      setTopics(res.data);
    } catch (err) {
      console.error('Topics fetch error:', err);
    }
  };

  const fetchQuestionsByTopic = async (page = 1) => {
    if (!selectedTopic) return;
    setLoading(true);
    setCurrentPage(page);
    try {
      const res = await api.get(`/questions/leetcode/topic/${selectedTopic}?page=${page}&limit=${itemsPerPage}`);
      setQuestions(res.data.questions || []);
      setTotalQuestions(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyChallenge = async () => {
    try {
      const res = await api.get('/questions/leetcode/daily');
      setDailyChallenge(res.data);
    } catch (err) {
      console.error('Daily challenge fetch error:', err);
    }
  };

  const fetchCodeforcesFeatured = async () => {
    try {
      const res = await api.get('/questions/codeforces/featured');
      setDailyChallenge(res.data);
    } catch (err) {
      console.error('Codeforces featured fetch error:', err);
    }
  };

  const fetchQuestions = async (page = 1, minRating = 0, maxRating = 5000) => {
    setLoading(true);
    setCurrentPage(page);
    try {
      let url = `/questions/${platform}?page=${page}&limit=${itemsPerPage}`;
      if (platform === 'codeforces') {
        url += `&minRating=${minRating}&maxRating=${maxRating}`;
      }
      const res = await api.get(url);
      setQuestions(res.data.questions || res.data);
      setTotalQuestions(res.data.total || res.data.length);
      setTotalPages(res.data.totalPages || Math.ceil((res.data.total || res.data.length) / itemsPerPage));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingFilter = (min, max) => {
    setRatingRange({ min, max });
    fetchQuestions(1, min, max);
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      if (platform === 'leetcode' && selectedTopic) {
        fetchQuestionsByTopic(page);
      } else {
        fetchQuestions(page, ratingRange.min, ratingRange.max);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
          </div>

          {/* LeetCode Topics */}
          {platform === 'leetcode' && showTopics && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-orange-500 font-bold text-xs uppercase tracking-widest">Topics</h3>
                {selectedTopic && (
                  <button 
                    onClick={() => { setSelectedTopic(null); setShowTopics(true); }}
                    className="text-xs text-gray-500 hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>
              
              {!selectedTopic ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {topics.map((topic) => (
                    <button
                      key={topic}
                      onClick={() => setSelectedTopic(topic)}
                      className="w-full text-left px-3 py-2 bg-gray-900 hover:bg-orange-500/20 border border-gray-800 hover:border-orange-500/50 rounded-lg text-sm text-gray-400 hover:text-orange-400 transition-all"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                  <span className="text-orange-400 text-sm font-bold">{selectedTopic}</span>
                  <p className="text-gray-500 text-xs mt-1">{totalQuestions} questions</p>
                </div>
              )}
            </div>
          )}

          {/* Codeforces Rating Filter */}
          {platform === 'codeforces' && (
            <div className="mt-8">
              <h3 className="text-blue-500 font-bold text-xs uppercase tracking-widest mb-4">Rating Range</h3>
              <div className="space-y-2">
                {[
                  { min: 0, max: 5000, label: 'All Ratings' },
                  { min: 800, max: 1000, label: '800-1000 (Beginner)' },
                  { min: 1100, max: 1300, label: '1100-1300 (Novice)' },
                  { min: 1400, max: 1600, label: '1400-1600 (Intermediate)' },
                  { min: 1700, max: 1900, label: '1700-1900 (Advanced)' },
                  { min: 2000, max: 2400, label: '2000-2400 (Expert)' },
                  { min: 2500, max: 3500, label: '2500+ (Master)' },
                ].map((range) => (
                  <button
                    key={range.label}
                    onClick={() => handleRatingFilter(range.min, range.max)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      ratingRange.min === range.min && ratingRange.max === range.max
                        ? 'bg-blue-500/20 border border-blue-500 text-blue-400'
                        : 'bg-gray-900 border border-gray-800 text-gray-400 hover:bg-gray-800'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          )}

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

          {/* Daily Challenge / Featured Card */}
          {dailyChallenge && (
            <div className={`mb-8 p-6 rounded-2xl border ${
              platform === 'leetcode' 
                ? 'bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border-orange-500/30'
                : 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`font-bold text-sm ${
                  platform === 'leetcode' ? 'text-orange-500' : 'text-blue-500'
                }`}>
                  {platform === 'leetcode' ? '🔥 Daily Challenge' : '🎯 Featured Contest'}
                </span>
                {platform === 'leetcode' ? (
                  <span className="text-gray-500 text-xs">{dailyChallenge.date}</span>
                ) : (
                  <span className="text-gray-500 text-xs">{dailyChallenge.contest?.name}</span>
                )}
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                {platform === 'leetcode' ? dailyChallenge.question?.title : dailyChallenge.question?.title}
              </h2>
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  (platform === 'leetcode' ? dailyChallenge.question?.difficulty : dailyChallenge.question?.difficulty) === 'Easy' || (dailyChallenge.question?.difficulty || 0) < 1200 ? 'bg-green-500/20 text-green-500' :
                  (platform === 'leetcode' ? dailyChallenge.question?.difficulty : dailyChallenge.question?.difficulty) === 'Medium' || (dailyChallenge.question?.difficulty || 0) < 1900 ? 'bg-yellow-500/20 text-yellow-500' :
                  'bg-red-500/20 text-red-500'
                }`}>
                  {dailyChallenge.question?.difficulty}
                </span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => navigate(`/practice/arena`, { state: { question: dailyChallenge.question } })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    platform === 'leetcode'
                      ? 'bg-orange-600 hover:bg-orange-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <Code2 size={14} /> {platform === 'leetcode' ? 'Solve Daily' : 'Solve Featured'}
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 px-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-black capitalize">{platform} Problems</h1>
                <p className="text-gray-500 text-sm mt-1">{totalQuestions} questions available</p>
              </div>
              <button 
                onClick={fetchQuestions}
                className="p-2 bg-gray-900 rounded-lg hover:bg-gray-800 border border-gray-800 transition-all"
              >
                Refresh
              </button>
            </div>

            {/* Search and Filter Bar */}
            <div className="mb-6 flex gap-4">
              <input
                type="text"
                placeholder="Search by title or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-purple-500"
              />
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-purple-500"
              >
                <option value="all">All Difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {loading ? (
              <div className="h-96 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-purple-500 mb-4" size={48} />
                <p className="text-gray-500 animate-pulse">Loading questions...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-3">
                  {questions
                    .filter(q => {
                      const matchesSearch = q.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                          q.id?.toString().includes(searchTerm);
                      const matchesDifficulty = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
                      return matchesSearch && matchesDifficulty;
                    })
                    .map((q, idx) => (
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

              {/* Pagination */}
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm font-bold text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                          currentPage === pageNum
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm font-bold text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
              
              <p className="text-center text-gray-600 text-sm mt-4">
                Page {currentPage} of {totalPages} • {totalQuestions} total questions
              </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeHome;
