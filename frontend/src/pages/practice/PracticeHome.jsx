import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import HomeNavbar from '../../components/Navbar';
import { Loader2, ExternalLink, Code2, Trophy, Brain, Zap, Target, Menu, X } from 'lucide-react';

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
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // LeetCode Topics
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showTopics, setShowTopics] = useState(true);

  // Codeforces Ratings
  const [ratingRange, setRatingRange] = useState({ min: 0, max: 5000 });

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
    <div className="min-h-screen bg-[#09090b] text-gray-300 font-sans">
      <div className="flex flex-col lg:flex-row min-h-screen">

        {/* MOBILE FILTER TRIGGER */}
        <div className="lg:hidden p-4 border-b border-white/5 bg-[#0c0c0e] sticky top-0 z-30 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <Target className="text-emerald-500" size={20} />
            <h2 className="font-bold text-lg tracking-tight text-white">Practice Arena</h2>
          </div>
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className={`px-4 py-2 border rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${showMobileFilters ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-white/5 border-white/10 text-gray-300'}`}
          >
            {showMobileFilters ? <X size={16} /> : <Menu size={16} />}
            {showMobileFilters ? 'Close' : 'Filters'}
          </button>
        </div>

        {/* PLATFORMS SIDEBAR */}
        <div className={`
            w-full lg:w-72 bg-[#09090b] border-b lg:border-b-0 lg:border-r border-white/5 p-6 shrink-0 
            ${showMobileFilters ? 'block fixed inset-0 z-40 overflow-y-auto pb-20' : 'hidden lg:block lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto'}
            custom-scrollbar transition-all bg-[#09090b] shadow-2xl lg:shadow-none
        `}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 text-white">
              <Target className="text-emerald-500" size={20} />
              <h2 className="font-bold text-lg tracking-tight">Practice Arena</h2>
            </div>
            {/* Mobile Close Button inside sidebar */}
            <button onClick={() => setShowMobileFilters(false)} className="lg:hidden p-2 bg-white/5 rounded-full text-gray-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">Select Platform</h3>
              <div className="space-y-2">
                <button
                  onClick={() => { setPlatform('leetcode'); setShowMobileFilters(false); }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all border ${platform === 'leetcode' ? 'bg-orange-500/10 border-orange-500/50 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.1)]' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10 hover:text-gray-200'}`}
                >
                  <span className="font-bold flex items-center gap-3"><Code2 size={18} /> LeetCode</span>
                  {platform === 'leetcode' && <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_currentColor]" />}
                </button>
                <button
                  onClick={() => { setPlatform('codeforces'); setShowMobileFilters(false); }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all border ${platform === 'codeforces' ? 'bg-blue-500/10 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10 hover:text-gray-200'}`}
                >
                  <span className="font-bold flex items-center gap-3"><Trophy size={18} /> Codeforces</span>
                  {platform === 'codeforces' && <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_currentColor]" />}
                </button>
              </div>
            </div>

            {/* LeetCode Topics */}
            {platform === 'leetcode' && showTopics && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Topics</h3>
                  {selectedTopic && (
                    <button
                      onClick={() => { setSelectedTopic(null); setShowTopics(true); }}
                      className="text-[10px] font-bold text-gray-500 hover:text-white bg-white/5 px-2 py-1 rounded transition-colors"
                    >
                      CLEAR
                    </button>
                  )}
                </div>

                {!selectedTopic ? (
                  <div className="space-y-1 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                    {topics.map((topic) => (
                      <button
                        key={topic}
                        onClick={() => { setSelectedTopic(topic); setShowMobileFilters(false); }}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-orange-300 hover:bg-orange-500/10 transition-all border border-transparent hover:border-orange-500/20 truncate"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 blur-[40px] rounded-full group-hover:bg-orange-500/20 transition-all"></div>
                    <h4 className="font-bold text-orange-400 mb-1 relative z-10">{selectedTopic}</h4>
                    <p className="text-xs text-orange-300/60 font-mono relative z-10">{totalQuestions} Challenges</p>
                  </div>
                )}
              </div>
            )}

            {/* Codeforces Rating Filter */}
            {platform === 'codeforces' && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">Rating Range</h3>
                <div className="space-y-1">
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
                      onClick={() => { handleRatingFilter(range.min, range.max); setShowMobileFilters(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all border ${ratingRange.min === range.min && ratingRange.max === range.max
                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 font-bold'
                        : 'bg-transparent border-transparent text-gray-400 hover:bg-blue-500/5 hover:text-blue-300'
                        }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 p-4 bg-gradient-to-br from-violet-500/10 to-purple-500/5 border border-purple-500/20 rounded-xl relative overflow-hidden hidden lg:block">
              <div className="flex items-start gap-3 relative z-10">
                <Brain className="text-purple-400 shrink-0" size={18} />
                <div>
                  <h4 className="font-bold text-purple-300 text-sm mb-1">Pro Tip</h4>
                  <p className="text-xs text-purple-200/60 leading-relaxed">Solving random problems improves adaptability in real contests.</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* MAIN CONTENT Area */}
        <div className="flex-1 p-4 md:p-10 overflow-y-auto w-full">
          <HomeNavbar showSidebarTrigger={false} />

          <div className="max-w-6xl mx-auto mt-6">

            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight mb-2 capitalize flex items-center gap-3">
                  {platform} <span className="text-gray-600">/</span> Problems
                </h1>
                <p className="text-gray-500 flex items-center gap-2 text-sm md:text-base">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {totalQuestions > 0 ? `${totalQuestions} available` : 'Loading repository...'}
                </p>
              </div>

              <div className="flex items-center gap-3 bg-[#0c0c0e] p-1.5 rounded-xl border border-white/5 self-start md:self-auto">
                <button onClick={fetchQuestions} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors" title="Refresh">
                  <Loader2 size={18} className={loading ? "animate-spin" : ""} />
                </button>
              </div>
            </div>

            {/* Daily Challenge Card */}
            {dailyChallenge && (
              <div className="mb-8 relative group overflow-hidden rounded-3xl border border-white/10">
                <div className={`absolute inset-0 bg-gradient-to-r ${platform === 'leetcode' ? 'from-orange-600/20 via-orange-900/10' : 'from-blue-600/20 via-blue-900/10'} to-[#09090b] z-0`}></div>
                <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border ${platform === 'leetcode' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'}`}>
                      <Zap size={14} className="fill-current" />
                      {platform === 'leetcode' ? 'Daily Challenge' : 'Featured Problem'}
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-2 line-clamp-2">
                      {platform === 'leetcode' ? dailyChallenge.question?.title : dailyChallenge.question?.title}
                    </h2>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2.5 py-1 rounded bg-[#09090b] border border-white/10 font-mono ${(platform === 'leetcode' ? dailyChallenge.question?.difficulty : dailyChallenge.question?.difficulty) === 'Easy' ? 'text-emerald-400' :
                        (platform === 'leetcode' ? dailyChallenge.question?.difficulty : dailyChallenge.question?.difficulty) === 'Medium' ? 'text-amber-400' :
                          'text-rose-400'
                        }`}>
                        {dailyChallenge.question?.difficulty}
                      </span>
                      <span className="text-gray-500 text-xs">{dailyChallenge.date}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/practice/arena`, { state: { question: dailyChallenge.question } })}
                    className={`w-full md:w-auto justify-center group-hover:scale-105 transition-transform px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg ${platform === 'leetcode'
                      ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20'
                      : 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/20'
                      }`}
                  >
                    <Code2 size={18} /> Solve Now
                  </button>
                </div>
              </div>
            )}

            {/* Filter Bar */}
            <div className="sticky top-16 lg:top-4 z-20 bg-[#09090b]/95 backdrop-blur-md p-2 -mx-2 mb-6 rounded-2xl border border-white/5 flex flex-col md:flex-row gap-3 shadow-xl">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search problems..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#121214] border border-white/5 rounded-xl px-10 py-3 text-sm text-gray-200 focus:outline-none focus:border-white/10 focus:bg-[#161618] transition-all placeholder:text-gray-600"
                />
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                </div>
              </div>
              <div className="relative w-full md:w-48">
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="w-full h-full appearance-none bg-[#121214] border border-white/5 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-white/10 cursor-pointer"
                >
                  <option value="all">Any Difficulty</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <div className="relative w-16 h-16 mb-6">
                  <div className="absolute inset-0 border-4 border-white/5 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin"></div>
                </div>
                <p className="text-gray-500 font-mono text-sm animate-pulse">Syncing with {platform}...</p>
              </div>
            ) : (
              <div className="space-y-3 pb-20">
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
                      className="group bg-[#0c0c0e] hover:bg-[#121214] border border-white/5 hover:border-white/10 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-200"
                    >
                      <div className="flex items-center gap-4 overflow-hidden">
                        <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 bg-[#09090b] rounded-lg flex items-center justify-center text-xs font-mono text-gray-600 border border-white/5 group-hover:border-purple-500/20 group-hover:text-purple-500/50 transition-colors">
                          {q.id || idx + 1}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-gray-200 text-base md:text-lg group-hover:text-purple-400 transition-colors truncate pr-4">{q.title}</h4>
                          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            <span className={`text-[10px] px-2 py-0.5 rounded border font-mono font-bold ${q.difficulty === 'Easy' || q.difficulty < 1200 ? 'bg-emerald-950/30 border-emerald-500/20 text-emerald-400' :
                              q.difficulty === 'Medium' || q.difficulty < 1900 ? 'bg-amber-950/30 border-amber-500/20 text-amber-400' : 'bg-rose-950/30 border-rose-500/20 text-rose-400'
                              }`}>
                              {q.difficulty}
                            </span>
                            {q.tags && q.tags.slice(0, 3).map(t => (
                              <span key={t} className="text-[10px] text-gray-500 group-hover:text-gray-400 transition-colors">#{t}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 md:pl-4 md:border-l border-white/5 md:ml-4 self-end md:self-auto w-full md:w-auto">
                        <button
                          onClick={() => navigate(`/practice/arena`, { state: { question: q } })}
                          className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-bold transition-all border border-transparent hover:border-white/10"
                        >
                          Solve
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {!loading && (
              /* Pagination */
              <div className="mt-8 flex items-center justify-center gap-2 pb-24">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-white disabled:opacity-30 transition-colors"
                >
                  PREV
                </button>

                <div className="flex items-center gap-1 bg-[#0c0c0e] p-1 rounded-lg border border-white/5 overflow-x-auto max-w-[200px] md:max-w-none no-scrollbar">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`w-9 h-9 rounded-md text-sm font-bold transition-all shrink-0 ${currentPage === pageNum
                          ? 'bg-white text-black shadow-lg'
                          : 'text-gray-500 hover:text-white hover:bg-white/5'
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
                  className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-white disabled:opacity-30 transition-colors"
                >
                  NEXT
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeHome;
