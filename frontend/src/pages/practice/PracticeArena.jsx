/* eslint-disable react/prop-types */
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  Play, Send, ChevronLeft, Bot, Terminal,
  Lightbulb, X, ChevronRight, Maximize2, Minimize2,
  Search, Filter, Code2, Trophy, Loader2, Target,
  Flame, Zap, BookOpen, Layers, Globe
} from 'lucide-react';
import api from '../../api/axios';
import DOMPurify from 'dompurify';
import MainLayout from '../../components/MainLayout';

const SkeletonRow = () => (
  <tr className="border-b border-white/2 animate-pulse">
    <td className="px-4 py-4"><div className="w-4 h-4 bg-white/5 rounded"></div></td>
    <td className="px-2 py-4">
      <div className="w-3/4 h-3 bg-white/10 rounded mb-2"></div>
      <div className="flex gap-1">
        <div className="w-12 h-3 bg-white/5 rounded"></div>
        <div className="w-12 h-3 bg-white/5 rounded"></div>
      </div>
    </td>
    <td className="px-2 py-4 text-center items-center flex justify-center">
      <div className="w-14 h-4 bg-white/10 rounded-full mt-2"></div>
    </td>
    <td className="px-4 py-4 text-right">
      <div className="w-10 h-3 bg-white/5 rounded ml-auto"></div>
    </td>
  </tr>
);

const ExplorerPane = ({
  platform, searchTerm, setSearchTerm, difficultyFilter, setDifficultyFilter,
  selectedTopic, setSelectedTopic, topics, totalQuestions, dailyChallenge,
  handleSelectQuestion, questions, loading, currentPage, lastQuestionRef,
  isExplorerOpen, setIsExplorerOpen, selectedQuestion, setIsDescriptionOpen
}) => (
  <>
    {/* Header */}
    <div className="p-5 border-b border-white/5 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border transition-all ${platform === 'leetcode'
          ? 'bg-orange-500/10 text-orange-500 border-orange-500/20 shadow-orange-500/5'
          : 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-blue-500/5'
          }`}>
          {platform === 'leetcode' ? <Code2 size={22} /> : <Globe size={22} />}
        </div>
        <div>
          <h2 className="font-bold text-white text-lg leading-tight uppercase tracking-tight">
            {platform === 'leetcode' ? 'LeetCode' : 'Codeforces'}
          </h2>
          <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">
            {platform === 'leetcode' ? 'Interview Prep' : 'Competitive Pro'}
          </p>
        </div>
      </div>
      <button onClick={() => {
        setIsExplorerOpen(false);
        if (selectedQuestion) setIsDescriptionOpen(true);
      }} className="p-2 hover:bg-white/5 rounded-lg text-gray-500">
        <ChevronLeft size={20} />
      </button>
    </div>

    {/* Filters */}
    <div className="p-4 space-y-4 border-b border-white/5 bg-[#0d0d12] shrink-0">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
        <input
          type="text"
          placeholder={`Search ${platform === 'leetcode' ? 'LeetCode' : 'Codeforces'} problems...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#050505] border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-orange-500/50 transition-all font-medium"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-[11px] text-gray-400 outline-none focus:border-orange-500/50"
        >
          <option value="all">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
        <select
          value={selectedTopic || 'all'}
          onChange={(e) => setSelectedTopic(e.target.value === 'all' ? null : e.target.value)}
          className="bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-[11px] text-gray-400 outline-none focus:border-orange-500/50"
        >
          <option value="all">All Topics</option>
          {topics.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-bold text-orange-500/80 bg-orange-500/5 px-2 py-0.5 rounded-full border border-orange-500/10">
          {totalQuestions.toLocaleString()} / 3,846 problems
        </span>
      </div>
    </div>

    {/* Daily Challenge Card */}
    {dailyChallenge && (
      <div className="p-4 border-b border-white/5 shrink-0">
        <div className="bg-[#121218] border border-white/10 rounded-xl p-4 relative overflow-hidden group hover:border-orange-500/30 transition-all cursor-pointer shadow-xl"
          onClick={() => handleSelectQuestion(dailyChallenge.question)}>
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:rotate-12 transition-transform">
            <Zap size={40} className="text-orange-500" />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1 rounded bg-orange-500/10 text-orange-400">
              <Flame size={12} fill="currentColor" />
            </span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Daily Challenge</span>
            <span className="text-[10px] text-gray-600 ml-auto font-mono">{dailyChallenge.date}</span>
          </div>
          <h3 className="text-sm font-bold text-white mb-3 line-clamp-1">{dailyChallenge.question?.title}</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${dailyChallenge.question?.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                {dailyChallenge.question?.difficulty}
              </span>
              <span className="text-[10px] text-gray-500">75.8%</span>
            </div>
            <button className="bg-orange-500 hover:bg-orange-600 text-black font-black text-[10px] uppercase px-3 py-1.5 rounded-lg transition-transform active:scale-95 shadow-lg shadow-orange-500/20">
              Solve
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Problem List Table */}
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <table className="w-full text-left border-collapse">
        <thead className="sticky top-0 bg-[#0a0a0f] z-10">
          <tr className="border-b border-white/5">
            <th className="px-4 py-3 text-[10px] font-bold text-gray-600 uppercase tracking-widest">#</th>
            <th className="px-2 py-3 text-[10px] font-bold text-gray-600 uppercase tracking-widest">Title</th>
            <th className="px-2 py-3 text-[10px] font-bold text-gray-600 uppercase tracking-widest text-center">Level</th>
            <th className="px-4 py-3 text-[10px] font-bold text-gray-600 uppercase tracking-widest text-right">Rate</th>
          </tr>
        </thead>
        <tbody>
          {questions.length === 0 && loading && (
            [...Array(10)].map((_, i) => <SkeletonRow key={i} />)
          )}
          {questions.map((q, i) => {
            const isLast = questions.length === i + 1;
            return (
              <tr
                key={q.id || i}
                ref={isLast ? lastQuestionRef : null}
                onClick={() => handleSelectQuestion(q)}
                className={`border-b border-white/2 hover:bg-white/3 cursor-pointer group transition-colors ${selectedQuestion?.id === q.id ? 'bg-orange-500/5' : ''}`}
              >
                <td className="px-4 py-4 text-xs text-gray-600 font-mono">{i + 1}</td>
                <td className="px-2 py-4">
                  <div className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors mb-1">{q.title}</div>
                  <div className="flex gap-1">
                    {q.tags?.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[9px] text-gray-600 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">{tag}</span>
                    ))}
                  </div>
                </td>
                <td className="px-2 py-4 text-center">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${q.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
                    q.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-rose-500/10 text-rose-400'
                    }`}>
                    {q.difficulty}
                  </span>
                </td>
                <td className="px-4 py-4 text-right text-[10px] text-gray-600 font-mono">
                  {q.stats?.acRate || '45.9%'}
                </td>
              </tr>
            );
          })}
          {loading && questions.length > 0 && (
            [...Array(5)].map((_, i) => <SkeletonRow key={`more-${i}`} />)
          )}
          {!loading && questions.length === 0 && (
            <tr>
              <td colSpan="4" className="py-20 text-center">
                <div className="flex flex-col items-center gap-3 opacity-20">
                  <Search size={40} />
                  <p className="text-sm font-bold uppercase tracking-widest">No questions found</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </>
);

const PracticeArena = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { platform: urlPlatform } = useParams();
  const initialQuestion = location.state?.question;

  // Question / Explorer State
  const [selectedQuestion, setSelectedQuestion] = useState(initialQuestion);
  const [questions, setQuestions] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [platform, setPlatform] = useState(urlPlatform || 'leetcode');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isExplorerOpen, setIsExplorerOpen] = useState(true);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);

  // Check for global search term from Navbar
  useEffect(() => {
    if (location.state?.globalSearchTerm) {
      setSearchTerm(location.state.globalSearchTerm);
    }
  }, [location.state]);

  // Sync platform with URL
  useEffect(() => {
    const targetPlatform = urlPlatform || 'leetcode';
    if (targetPlatform !== platform) {
      setPlatform(targetPlatform);
      setSelectedQuestion(null);
      setSelectedTopic(null);
      setSearchTerm('');
      setIsExplorerOpen(true);
      setIsDescriptionOpen(false);
    }
  }, [urlPlatform]);

  // Editor / Arena State
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Template logic
  const templates = {
    javascript: `function solution(nums, target) {\n  // Write your solution here\n  \n}\n\n// Test Case\nconsole.log(solution([2, 7, 11, 15], 9));`,
    python: `def solution(nums, target):\n    # Write your solution here\n    pass\n\n# Test Case\nprint(solution([2, 7, 11, 15], 9))`,
    cpp: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nvoid solve() {\n    // Write your solution here\n    cout << "Hello World";\n}\n\nint main() {\n    solve();\n    return 0;\n}`
  };

  // --- Explorer Logic ---
  useEffect(() => {
    if (platform === 'leetcode') fetchTopics();
    fetchQuestions(1);
    fetchDailyChallenge();
  }, [platform]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchQuestions(1);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [selectedTopic, searchTerm, difficultyFilter]);

  const fetchTopics = async () => {
    try {
      const res = await api.get('/questions/leetcode/topics');
      setTopics(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchDailyChallenge = async () => {
    try {
      const res = await api.get(platform === 'leetcode' ? '/questions/leetcode/daily' : '/questions/codeforces/featured');
      setDailyChallenge(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchQuestions = async (page = 1, append = false) => {
    if (loading) return;
    setLoading(true);
    setCurrentPage(page);
    try {
      let url = `/questions/${platform}?page=${page}&limit=50&search=${encodeURIComponent(searchTerm)}&difficulty=${difficultyFilter}`;
      if (selectedTopic && platform === 'leetcode') url = `/questions/leetcode/topic/${selectedTopic}?page=${page}&limit=50&search=${encodeURIComponent(searchTerm)}&difficulty=${difficultyFilter}`;

      const res = await api.get(url);
      const data = res.data;
      const newQuestions = data.questions || data;

      if (append) {
        setQuestions(prev => [...prev, ...newQuestions]);
      } else {
        setQuestions(newQuestions);
      }

      setTotalQuestions(data.total || (append ? questions.length + newQuestions.length : newQuestions.length));
      setTotalPages(data.totalPages || 1);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const observer = useRef();
  const lastQuestionRef = (node) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && currentPage < totalPages) {
        fetchQuestions(currentPage + 1, true);
      }
    });
    if (node) observer.current.observe(node);
  };

  // --- Editor Logic ---
  useEffect(() => {
    if (selectedQuestion?.codeSnippets) {
      const snippet = selectedQuestion.codeSnippets.find(s => s.langSlug === language) ||
        selectedQuestion.codeSnippets.find(s => s.langSlug === 'javascript');
      setCode(snippet?.code || templates[language]);
    } else {
      setCode(templates[language]);
    }
  }, [selectedQuestion, language]);

  const handleRun = async () => {
    if (!code.trim()) return;
    setIsRunning(true);
    setOutput('Running...\n');
    try {
      const response = await api.post('/execute/run', { code, language });
      if (response.data.error) {
        setOutput(prev => prev + `Error: ${response.data.error}\n`);
      } else {
        const { stdout, stderr, compile_output } = response.data;
        let result = '';
        if (compile_output) result += `[Compile]\n${compile_output}\n`;
        if (stdout) result += `[Output]\n${stdout}\n`;
        if (stderr) result += `[Error]\n${stderr}\n`;
        setOutput(result || 'No output.');
      }
    } catch (err) { setOutput(prev => prev + `Execution Error: ${err.message}\n`); }
    finally {
      setIsRunning(false);
      if (!isTerminalOpen) setIsTerminalOpen(true);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) return;
    setIsRunning(true);
    setOutput('Submitting...\n');
    try {
      const runResponse = await api.post('/execute/run', { code, language });
      if (runResponse.data.error || runResponse.data.stderr) {
        setOutput(prev => prev + `[Error] Code execution failed.\n${runResponse.data.stderr || runResponse.data.error}\n`);
        setIsRunning(false);
        if (!isTerminalOpen) setIsTerminalOpen(true);
        return;
      }
      const submitResponse = await api.post('/execute/submit-practice', {
        questionId: selectedQuestion?._id,
        passed: true
      });
      setOutput(prev => prev + `\n✅ Success! ${submitResponse.data.message}\nPoints: ${submitResponse.data.points} (+5)\n`);
    } catch (err) { setOutput(prev => prev + `Submission Error: ${err.message}\n`); }
    finally {
      setIsRunning(false);
      if (!isTerminalOpen) setIsTerminalOpen(true);
    }
  };

  const handleSelectQuestion = async (q) => {
    if (platform === 'leetcode' && q.titleSlug) {
      setLoading(true);
      try {
        const res = await api.get(`/questions/leetcode/details/${q.titleSlug}`);
        setSelectedQuestion(res.data);
      } catch (err) {
        console.error("Error fetching question details:", err);
        setSelectedQuestion(q); // Fallback to list data if details fail
      } finally {
        setLoading(false);
      }
    } else {
      setSelectedQuestion(q);
    }
    setIsExplorerOpen(false);
    setIsDescriptionOpen(true);
  };

  useEffect(() => {
    if (selectedQuestion) {
      setIsDescriptionOpen(true);
    }
  }, [selectedQuestion]);

  if (!selectedQuestion && !loading && questions.length > 0) {
    setSelectedQuestion(questions[0]);
  }

  const ContentWrapper = isFullScreen ? 'div' : MainLayout;
  const contentProps = isFullScreen ? { className: 'h-screen bg-[#050505] fixed inset-0 z-50 flex flex-col' } : {};

  return (
    <ContentWrapper {...contentProps} {...(!isFullScreen ? { navbar: true } : {})}>
      <div className="flex h-screen bg-[#050505] text-gray-300 relative overflow-hidden">

        {/* Pane 1: Global Sidebar is inside MainLayout */}

        {/* Pane 3: Main IDE Content */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Editor Header / Toolbar */}
          <header className="h-14 border-b border-white/5 bg-[#050505] flex items-center justify-between px-4 shrink-0 z-10">
            <div className="flex items-center gap-4">
              {!isExplorerOpen && !isFullScreen && (
                <button
                  onClick={() => {
                    setIsExplorerOpen(true);
                    setIsDescriptionOpen(false);
                  }}
                  className="p-2 hover:bg-white/5 rounded-lg text-orange-500 transition-colors"
                  title="Open Problem List"
                >
                  <BookOpen size={20} />
                </button>
              )}
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${platform === 'leetcode'
                  ? 'bg-orange-500/10 border-orange-500/20 text-orange-500'
                  : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                  }`}>
                  {platform === 'leetcode' ? <Code2 size={16} /> : <Globe size={16} />}
                </div>
                <div>
                  <h1 className="font-bold text-sm text-white flex items-center gap-2">
                    {selectedQuestion?.title || 'Select a Problem'}
                    {selectedQuestion?.difficulty && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${selectedQuestion.difficulty === 'Easy' ? 'border-emerald-500/30 text-emerald-400' :
                        selectedQuestion.difficulty === 'Medium' ? 'border-amber-500/30 text-amber-400' :
                          'border-rose-500/30 text-rose-400'
                        }`}>
                        {selectedQuestion.difficulty}
                      </span>
                    )}
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="bg-[#0f0f12] border border-white/10 text-xs rounded-lg px-3 py-1.5 outline-none focus:border-orange-500/50 text-gray-300 font-bold"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
              </select>

              <div className="h-4 w-px bg-white/10 mx-1"></div>

              <button
                onClick={handleRun}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold text-xs transition-all active:scale-95 disabled:opacity-50"
              >
                {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="white" />}
                Run
              </button>

              <button
                onClick={handleSubmit}
                disabled={isRunning}
                className="flex items-center gap-2 px-6 py-1.5 bg-orange-500 hover:bg-orange-600 text-black rounded-lg font-black text-xs transition-all active:scale-95 shadow-lg shadow-orange-500/20 disabled:opacity-50"
              >
                <Send size={14} /> Submit
              </button>

              <button onClick={() => setIsFullScreen(!isFullScreen)} className="p-2 hover:bg-white/5 rounded-lg text-gray-500 ml-2">
                {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
            </div>
          </header>

          {/* Editor Workspace */}
          <div className="flex-1 flex overflow-hidden">
            {/* Split View: Column 2 (Explorer or Description) & Editor */}
            <div className="flex-1 flex overflow-hidden relative">

              {/* LeetCode/Codeforces Explorer Pane (List) */}
              <div className={`h-full bg-[#0a0a0f] border-r border-white/5 flex flex-col transition-all duration-300 z-10 shrink-0 ${isExplorerOpen ? 'w-[490px]' : 'w-0'}`}>
                <div className={`${isExplorerOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 h-full overflow-hidden flex flex-col`}>
                  <ExplorerPane
                    platform={platform}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    difficultyFilter={difficultyFilter}
                    setDifficultyFilter={setDifficultyFilter}
                    selectedTopic={selectedTopic}
                    setSelectedTopic={setSelectedTopic}
                    topics={topics}
                    totalQuestions={totalQuestions}
                    dailyChallenge={dailyChallenge}
                    handleSelectQuestion={handleSelectQuestion}
                    questions={questions}
                    loading={loading}
                    currentPage={currentPage}
                    lastQuestionRef={lastQuestionRef}
                    isExplorerOpen={isExplorerOpen}
                    setIsExplorerOpen={setIsExplorerOpen}
                    selectedQuestion={selectedQuestion}
                    setIsDescriptionOpen={setIsDescriptionOpen}
                  />
                </div>
              </div>

              {/* Description Panel (Detail) */}
              <div className={`h-full border-r border-white/5 flex flex-col bg-[#050505] transition-all duration-300 shrink-0 ${!isExplorerOpen && selectedQuestion ? 'w-[550px]' : 'w-0 overflow-hidden'}`}>
                <div className="flex border-b border-white/5 shrink-0">
                  <button onClick={() => setActiveTab('description')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'description' ? 'border-orange-500 text-orange-500 bg-orange-500/5' : 'border-transparent text-gray-500'}`}>Description</button>
                  <button onClick={() => setActiveTab('hints')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'hints' ? 'border-orange-500 text-orange-500 bg-orange-500/5' : 'border-transparent text-gray-500'}`}>Hints</button>
                  <button onClick={() => setIsExplorerOpen(true)} className="px-3 text-gray-600 hover:text-white transition-colors">
                    <X size={16} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
                  {selectedQuestion ? (
                    <>
                      {/* Description Content */}
                      {(selectedQuestion.content || selectedQuestion.description || selectedQuestion.problemStatement) ? (
                        <div className="prose prose-invert prose-sm max-w-none text-gray-400"
                          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedQuestion.content || selectedQuestion.description || selectedQuestion.problemStatement) }} />
                      ) : (
                        <div className="space-y-6">
                          <div className="p-6 rounded-2xl bg-white/2 border border-white/5 space-y-4">
                            <div className="flex items-center gap-3 text-blue-400">
                              <Globe size={24} />
                              <h3 className="font-bold text-lg">External Challenge</h3>
                            </div>
                            <p className="text-sm text-gray-400 leading-relaxed">
                              This challenge is hosted on <strong>{platform === 'leetcode' ? 'LeetCode' : 'Codeforces'}</strong>.
                              While we provide the IDE and environment, you can view the full problem statement and official constraints on the source platform.
                            </p>
                            <a
                              href={selectedQuestion.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-xs font-bold transition-all border border-blue-500/20"
                            >
                              View Official Problem <ChevronRight size={14} />
                            </a>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-white/1 border border-white/5">
                              <span className="text-[10px] text-gray-500 uppercase font-black block mb-1">Rating</span>
                              <span className="text-sm font-bold text-white font-mono">{selectedQuestion.difficulty}</span>
                            </div>
                            <div className="p-4 rounded-xl bg-white/1 border border-white/5">
                              <span className="text-[10px] text-gray-500 uppercase font-black block mb-1">Source</span>
                              <span className="text-sm font-bold text-white">{selectedQuestion.source}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedQuestion.constraints && selectedQuestion.constraints.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="text-xs font-black text-white uppercase tracking-wider">Constraints</h3>
                          <ul className="space-y-1.5">
                            {selectedQuestion.constraints.map((c, i) => (
                              <li key={i} className="text-[11px] text-gray-500 font-mono bg-white/2 p-2 rounded border border-white/5">{c}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 mt-auto pt-6 border-t border-white/5">
                        {selectedQuestion.tags?.map(t => (
                          <span key={t} className="px-2 py-1 bg-white/5 rounded text-[10px] text-gray-500 font-bold border border-white/5 uppercase tracking-tighter">#{t}</span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-600 font-mono italic text-sm">Select a question to view details</div>
                  )}
                </div>
              </div>

              {/* Code Editor */}
              <div className="flex-1 flex flex-col bg-[#050505]">
                <div className="flex-1 relative">
                  <Editor
                    height="100%"
                    language={language}
                    theme="vs-dark"
                    value={code}
                    onChange={setCode}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                      padding: { top: 20, left: 20 },
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      backgroundColor: '#050505'
                    }}
                  />
                </div>

                {/* Terminal Panel */}
                <div className={`transition-all duration-300 ${isTerminalOpen ? 'h-[250px]' : 'h-10'} border-t border-white/5 bg-[#0a0a0f] flex flex-col`}>
                  <div className="h-10 border-b border-white/5 flex items-center justify-between px-4 shrink-0 cursor-pointer hover:bg-white/2" onClick={() => setIsTerminalOpen(!isTerminalOpen)}>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
                      <Terminal size={14} />
                      Terminal
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={(e) => { e.stopPropagation(); setOutput(''); }} className="p-1.5 hover:bg-white/10 rounded transition-colors text-gray-600"><X size={14} /></button>
                      <button className="p-1.5 hover:bg-white/10 rounded transition-colors text-gray-600">
                        {isTerminalOpen ? <ChevronRight size={14} className="rotate-90" /> : <ChevronRight size={14} className="-rotate-90" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 p-5 font-mono text-[13px] overflow-y-auto custom-scrollbar text-gray-400 bg-[#050505]">
                    <pre className="whitespace-pre-wrap">{output || 'Execution results will appear here...'}</pre>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Assistant Toggle */}
            <div className="fixed bottom-6 right-6 z-50">
              <button onClick={() => setIsAiOpen(!isAiOpen)} className="w-14 h-14 rounded-2xl bg-orange-500 text-black shadow-2xl shadow-orange-500/20 flex items-center justify-center transition-transform hover:scale-110 active:scale-95">
                <Bot size={24} />
              </button>
            </div>

          </div>
        </div>
      </div>
    </ContentWrapper>
  );
};

export default PracticeArena;
