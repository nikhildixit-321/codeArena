import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { 
  Play, Send, ChevronLeft, Bot, User, Terminal, 
  Lightbulb, X, ChevronRight, MessageCircle
} from 'lucide-react';
import api from '../../api/axios';
import DOMPurify from 'dompurify';

const PracticeArena = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const question = location.state?.question;
  const terminalRef = useRef(null);

  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isQuestionOpen, setIsQuestionOpen] = useState(true);
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  // AI Chat State
  const [aiMessages, setAiMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m your AI coding assistant. Ask me anything about this problem!' }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);

  const templates = {
    javascript: `function solution(nums, target) {\n  // Write your solution here\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}\n\n// Test\nconsole.log(solution([2, 7, 11, 15], 9));`,
    python: `def solution(nums, target):\n    # Write your solution here\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []\n\n# Test\nprint(solution([2, 7, 11, 15], 9))`,
    cpp: `vector<int> solution(vector<int>& nums, int target) {\n    // Write your solution here\n    unordered_map<int, int> map;\n    for (int i = 0; i < nums.size(); i++) {\n        int complement = target - nums[i];\n        if (map.find(complement) != map.end()) {\n            return {map[complement], i};\n        }\n        map[nums[i]] = i;\n    }\n    return {};\n}`
  };

  useEffect(() => {
    if (question?.codeSnippets) {
      const snippet = question.codeSnippets.find(s => s.langSlug === language) || 
                     question.codeSnippets.find(s => s.langSlug === 'javascript');
      setCode(snippet?.code || templates[language]);
    } else {
      setCode(templates[language]);
    }
  }, [question, language]);

  const handleRun = async () => {
    if (!code.trim()) return;
    setIsRunning(true);
    setOutput(prev => prev + '\n▶ Running...\n\n');
    
    try {
      const response = await api.post('/execute/run', { code, language });

      if (response.data.error) {
        setOutput(prev => prev + `❌ Error: ${response.data.error}\n`);
      } else {
        const { stdout, stderr, compile_output } = response.data;
        let result = '';
        if (compile_output) result += `📦 Compile:\n${compile_output}\n`;
        if (stdout) result += `✅ Output:\n${stdout}\n`;
        if (stderr) result += `⚠️ Stderr:\n${stderr}\n`;
        setOutput(prev => prev + result);
      }
    } catch (err) {
      setOutput(prev => prev + `❌ ${err.message}\n`);
    } finally {
      setIsRunning(false);
      terminalRef.current?.scrollTo(0, terminalRef.current.scrollHeight);
    }
  };

  const handleAiSend = () => {
    if (!aiInput.trim()) return;
    setAiMessages(prev => [...prev, { role: 'user', content: aiInput }]);
    setAiInput('');
    setIsAiTyping(true);

    setTimeout(() => {
      const responses = [
        "Try using a hash map for O(1) lookups!",
        "Consider edge cases like empty arrays.",
        "Your approach looks good. Can you optimize space?",
        "Think about the two-pointer technique!"
      ];
      setAiMessages(prev => [...prev, { 
        role: 'assistant', 
        content: responses[Math.floor(Math.random() * responses.length)] 
      }]);
      setIsAiTyping(false);
    }, 1000);
  };

  if (!question) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-slate-400 mb-4">No question selected.</p>
          <button onClick={() => navigate('/practice')} className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700">
            Back to Practice
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-950 flex flex-col overflow-hidden text-slate-200">
      {/* Top Navigation */}
      <nav className="h-12 bg-slate-900 border-b border-slate-800 flex items-center px-4 justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-slate-800 rounded">
            <ChevronLeft size={18} />
          </button>
          <Link to="/dashboard" className="font-bold text-blue-400 hover:text-blue-300">
            CodeArena
          </Link>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded px-3 py-1 text-sm"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
          </select>
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-1.5 rounded text-sm font-medium"
          >
            {isRunning ? <span className="animate-spin">⚡</span> : <Play size={14} />} 
            Run
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Collapsible Question Panel */}
        <div className={`${isQuestionOpen ? 'w-[500px]' : 'w-0'} transition-all duration-300 bg-slate-900 border-r border-slate-800 flex flex-col overflow-hidden`}>
          {/* Question Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-white">{question.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                  question.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                  question.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {question.difficulty}
                </span>
                <span className="text-xs text-slate-500">{question.source}</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-800">
            {['description', 'hints'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 text-sm font-medium capitalize ${
                  activeTab === tab 
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-800/50' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {activeTab === 'description' && (
              <div className="space-y-4">
                <div 
                  className="prose prose-invert prose-sm max-w-none text-slate-300"
                  dangerouslySetInnerHTML={{ 
                    __html: DOMPurify.sanitize(question.content || 'No description available.') 
                  }}
                />

                {question.examples && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-slate-400 mb-2">Example:</h3>
                    <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm border border-slate-800">
                      <pre className="text-slate-300">{question.examples}</pre>
                    </div>
                  </div>
                )}

                {question.tags && (
                  <div className="flex flex-wrap gap-2 pt-4">
                    {question.tags.map(tag => (
                      <span key={tag} className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'hints' && (
              <div className="space-y-3">
                {question.hints?.length > 0 ? (
                  question.hints.map((hint, i) => (
                    <div key={i} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                      <div className="flex items-center gap-2 text-yellow-500 mb-2">
                        <Lightbulb size={14} />
                        <span className="text-sm font-medium">Hint {i + 1}</span>
                      </div>
                      <p className="text-sm text-slate-300">{hint}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-center py-8">No hints available.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Toggle Question Button */}
        <button
          onClick={() => setIsQuestionOpen(!isQuestionOpen)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-6 h-20 bg-slate-800 border-y border-r border-slate-700 rounded-r-lg flex items-center justify-center hover:bg-slate-700"
          style={{ marginLeft: isQuestionOpen ? '500px' : '0' }}
        >
          <ChevronRight size={16} className={`transition-transform ${isQuestionOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Center - Code Editor */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={setCode}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: 'JetBrains Mono, monospace',
                automaticLayout: true,
                scrollBeyondLastLine: false,
                padding: { top: 16 },
                lineNumbers: 'on',
                roundedSelection: false,
                scrollbar: { useShadows: false }
              }}
            />
          </div>

          {/* Terminal */}
          {isTerminalOpen && (
            <div className="h-48 bg-slate-950 border-t border-slate-800 flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
                <span className="text-xs font-medium text-slate-400 flex items-center gap-2">
                  <Terminal size={12} /> Console
                </span>
                <div className="flex gap-2">
                  <button onClick={() => setOutput('')} className="text-xs text-slate-500 hover:text-slate-300">
                    Clear
                  </button>
                  <button onClick={() => setIsTerminalOpen(false)} className="text-slate-500 hover:text-slate-300">
                    <X size={14} />
                  </button>
                </div>
              </div>
              <div 
                ref={terminalRef}
                className="flex-1 p-4 font-mono text-sm overflow-y-auto"
              >
                {output ? (
                  <pre className="text-slate-300 whitespace-pre-wrap">{output}</pre>
                ) : (
                  <span className="text-slate-600 italic">Click Run to see output...</span>
                )}
              </div>
            </div>
          )}
          
          {!isTerminalOpen && (
            <button 
              onClick={() => setIsTerminalOpen(true)}
              className="h-8 bg-slate-900 border-t border-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-300 gap-2"
            >
              <Terminal size={14} /> Show Console
            </button>
          )}
        </div>

        {/* Floating AI Button */}
        {!isAiOpen && (
          <button 
            onClick={() => setIsAiOpen(true)}
            className="fixed right-6 bottom-6 w-14 h-14 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center shadow-lg shadow-purple-600/30 transition-all hover:scale-110 z-50"
          >
            <Bot size={24} />
          </button>
        )}

        {/* AI Chat Card */}
        {isAiOpen && (
          <div className="fixed right-6 bottom-6 w-96 h-[500px] bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 flex flex-col z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <Bot size={18} />
                </div>
                <div>
                  <span className="font-medium text-sm text-white">AI Assistant</span>
                  <p className="text-xs text-slate-400">Always here to help</p>
                </div>
              </div>
              <button onClick={() => setIsAiOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X size={18} />
              </button>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {aiMessages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === 'user' ? 'bg-blue-600' : 'bg-purple-600'
                  }`}>
                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-md' 
                      : 'bg-slate-800 text-slate-200 rounded-bl-md border border-slate-700'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isAiTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                    <Bot size={14} />
                  </div>
                  <div className="bg-slate-800 p-3 rounded-2xl rounded-bl-md border border-slate-700">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                      <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-700 bg-slate-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAiSend()}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500 text-white placeholder-slate-500"
                />
                <button
                  onClick={handleAiSend}
                  disabled={!aiInput.trim() || isAiTyping}
                  className="p-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-xl transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticeArena;
