import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import HomeNavbar from '../../components/Navbar';
import { Loader2, Code2, Trophy, Brain, Zap, Target, Menu, X, ChevronRight, Search, Filter } from 'lucide-react';

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
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (platform === 'leetcode' && selectedTopic) {
        fetchQuestionsByTopic(page);
      } else {
        fetchQuestions(page, ratingRange.min, ratingRange.max);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-gray-300 font-sans selection:bg-sky-500/30">

      {/* Split Screen Layout */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">

        {/* LEFT SIDEBAR FILTERS (Fixed on Desktop) */}
        <div className={`
                    w-full lg:w-80 bg-[#0a0a0f] border-r border-white/5 flex flex-col
                    ${showMobileFilters ? 'fixed inset-0 z-50 overflow-y-auto' : 'hidden lg:flex'}
                `}>
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#0a0a0f] z-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-500">
                <Filter size={18} />
              </div>
              <h2 className="font-bold text-white tracking-wide">Filters</h2>
            </div>
            <button onClick={() => setShowMobileFilters(false)} className="lg:hidden p-2 hover:bg-white/10 rounded-lg">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar flex-1">

            {/* Platform Selector */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Platform</h3>
              <div className="space-y-2">
                <PlatformButton
                  active={platform === 'leetcode'}
                  onClick={() => setPlatform('leetcode')}
                  icon={Code2}
                  label="LeetCode"
                  color="text-orange-400"
                  activeBg="bg-orange-500/10"
                  activeBorder="border-orange-500/50"
                />
                <PlatformButton
                  active={platform === 'codeforces'}
                  onClick={() => setPlatform('codeforces')}
                  icon={Trophy}
                  label="Codeforces"
                  color="text-blue-400"
                  activeBg="bg-blue-500/10"
                  activeBorder="border-blue-500/50"
                />
              </div>
            </div>

            {/* Dynamic Filters based on Platform */}
            {platform === 'leetcode' ? (
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex justify-between">
                  Topics
                  {selectedTopic && <span onClick={() => setSelectedTopic(null)} className="text-[10px] text-red-400 cursor-pointer hover:underline">Clear</span>}
                </h3>
                <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {topics.map(topic => (
                    <button
                      key={topic}
                      onClick={() => setSelectedTopic(topic)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all truncate flex justify-between group ${selectedTopic === topic ? 'bg-white/10 text-white font-bold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                      {topic}
                      {selectedTopic === topic && <ChevronRight size={14} className="text-sky-400" />}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Difficulty Rating</h3>
                <div className="space-y-1">
                  {[
                    { min: 0, max: 5000, label: 'All Ratings' },
                    { min: 800, max: 1000, label: '800-1000 (Newbie)' },
                    { min: 1100, max: 1300, label: '1100-1300 (Pupil)' },
                    { min: 1400, max: 1500, label: '1400-1500 (Specialist)' },
                    { min: 1600, max: 1800, label: '1600-1800 (Expert)' },
                    { min: 1900, max: 2300, label: '1900+ (Master)' },
                  ].map(range => (
                    <button
                      key={range.label}
                      onClick={() => handleRatingFilter(range.min, range.max)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${ratingRange.min === range.min && ratingRange.max === range.max ? 'bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
          {/* Background Art */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-500/5 blur-[100px] rounded-full pointer-events-none"></div>

          {/* Top Bar */}
          <div className="shrink-0 h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#050505]/80 backdrop-blur-md z-20">
            <div className="flex items-center gap-4 lg:hidden">
              <button onClick={() => setShowMobileFilters(true)} className="p-2 -ml-2 hover:bg-white/5 rounded-lg text-gray-400">
                <Menu size={20} />
              </button>
              <span className="font-bold text-white">Problems</span>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-auto flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  type="text"
                  placeholder="Search specific problem..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#121218] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-sky-500/50 focus:bg-[#15151a] transition-all"
                />
              </div>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="bg-[#121218] border border-white/10 rounded-xl px-4 py-2 text-sm text-gray-300 focus:outline-none focus:border-sky-500/50"
              >
                <option value="all">Any Difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar scroll-smooth">
            <div className="max-w-5xl mx-auto pb-20">

              {/* Header Stats */}
              <div className="flex items-end justify-between mb-8 pb-4 border-b border-white/5">
                <div>
                  <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                    {platform === 'leetcode' ? <span className="text-orange-500">LeetCode</span> : <span className="text-blue-500">Codeforces</span>}
                    Library
                  </h1>
                  <p className="text-gray-500 text-sm">
                    {totalQuestions > 0 ? `${totalQuestions} problems loaded from server.` : 'Connecting to database...'}
                  </p>
                </div>
                <div className="hidden md:block text-right">
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Current Page</p>
                  <p className="text-2xl font-mono font-bold text-white">{currentPage} <span className="text-gray-600 text-lg">/ {totalPages}</span></p>
                </div>
              </div>

              {/* Daily Card */}
              {dailyChallenge && (
                <div className="mb-10 bg-gradient-to-r from-[#0a0a0f] to-[#121218] border border-white/10 rounded-2xl p-6 md:p-8 flex items-center justify-between group hover:border-sky-500/30 transition-all shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 blur-[50px] rounded-full"></div>
                  <div className="relative z-10 flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 text-[10px] uppercase font-bold tracking-widest border border-sky-500/20">Featured</span>
                      <span className="text-xs text-gray-500 font-mono">{dailyChallenge.date}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{platform === 'leetcode' ? dailyChallenge.question?.title : dailyChallenge.question?.title}</h3>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold ${dailyChallenge.question?.difficulty === 'Hard' ? 'text-red-400' : 'text-emerald-400'}`}>{dailyChallenge.question?.difficulty}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                      <span className="text-xs text-gray-400">Recommended for you</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/practice/arena`, { state: { question: dailyChallenge.question } })}
                    className="relative z-10 px-6 py-3 bg-white text-black font-bold rounded-xl hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center gap-2"
                  >
                    Solve Now <ChevronRight size={16} />
                  </button>
                </div>
              )}

              {/* Problem List */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                  <Loader2 size={32} className="animate-spin mb-4 text-sky-500" />
                  <p className="font-mono text-sm">Fetching problems...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {questions
                    .filter(q => q.title?.toLowerCase().includes(searchTerm.toLowerCase()) && (difficultyFilter === 'all' || q.difficulty === difficultyFilter))
                    .map((q, i) => (
                      <div key={q.id || i} className="group bg-[#0e0e12] border border-white/5 hover:border-sky-500/30 p-5 rounded-xl flex items-center justify-between transition-all hover:bg-[#121218]">
                        <div className="flex items-center gap-5">
                          <span className="font-mono text-sm text-gray-600 group-hover:text-sky-500 transition-colors w-8">
                            {(currentPage - 1) * itemsPerPage + i + 1}
                          </span>
                          <div>
                            <h4 className="font-bold text-gray-200 group-hover:text-white text-lg mb-1">{q.title}</h4>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${q.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                  q.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                    'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                }`}>
                                {q.difficulty}
                              </span>
                              {q.tags?.slice(0, 3).map(tag => (
                                <span key={tag} className="text-[10px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">{tag}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => navigate(`/practice/arena`, { state: { question: q } })}
                          className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-white/10 hover:bg-white text-white hover:text-black rounded-lg text-sm font-bold transition-all translate-x-2 group-hover:translate-x-0"
                        >
                          Code
                        </button>
                      </div>
                    ))}
                </div>
              )}

              {/* Simple Pagination */}
              {!loading && (
                <div className="flex justify-center gap-2 mt-12 mb-8">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => goToPage(currentPage - 1)}
                    className="px-4 py-2 rounded-lg bg-[#121218] border border-white/5 text-gray-400 hover:text-white disabled:opacity-50 text-sm font-bold"
                  >
                    Prev
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => goToPage(currentPage + 1)}
                    className="px-4 py-2 rounded-lg bg-[#121218] border border-white/5 text-gray-400 hover:text-white disabled:opacity-50 text-sm font-bold"
                  >
                    Next
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PlatformButton = ({ active, onClick, icon: Icon, label, color, activeBg, activeBorder }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all border ${active ? `${activeBg} ${activeBorder} ${color}` : 'bg-transparent border-transparent text-gray-500 hover:bg-white/5 hover:text-white'}`}
  >
    <Icon size={18} />
    <span className="font-bold text-sm">{label}</span>
  </button>
);

export default PracticeHome;
