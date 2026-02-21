/* eslint-disable react/prop-types */
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  Play, Send, ChevronLeft, Bot, User, Terminal,
  Lightbulb, X, ChevronRight, CheckCircle, AlertTriangle, MessageSquare, Maximize2, Minimize2
} from 'lucide-react';
import api from '../../api/axios';
import DOMPurify from 'dompurify';
import MainLayout from '../../components/MainLayout';

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
  const [isFullScreen, setIsFullScreen] = useState(false);

  // AI Chat State
  const [aiMessages, setAiMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m your AI coding assistant. Ask me anything about this problem!' }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Template logic ... (same as before)
  const templates = {
    javascript: `function solution(nums, target) {\n  // Write your solution here\n  \n}\n\n// Test Case\nconsole.log(solution([2, 7, 11, 15], 9));`,
    python: `def solution(nums, target):\n    # Write your solution here\n    pass\n\n# Test Case\nprint(solution([2, 7, 11, 15], 9))`,
    cpp: `vector<int> solution(vector<int>& nums, int target) {\n    // Write your solution here\n    return {};\n}`
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
    // setOutput(prev => prev + '\n▶ Running...\n\n');
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
    } catch (err) {
      setOutput(prev => prev + `Execution Error: ${err.message}\n`);
    } finally {
      setIsRunning(false);
      // Auto-open terminal on run
      if (!isTerminalOpen) setIsTerminalOpen(true);
    }
  };

  const handleAiSend = () => {
    if (!aiInput.trim()) return;
    setAiMessages(prev => [...prev, { role: 'user', content: aiInput }]);
    setAiInput('');
    setIsAiTyping(true);

    setTimeout(() => {
      // Mock AI response for now
      const responses = [
        "Consider checking for edge cases where the input array is empty.",
        "Can you optimize the time complexity to O(n)?",
        "This looks like a dynamic programming problem.",
        "Try using a hash map to store visited elements."
      ];
      const randomResp = responses[Math.floor(Math.random() * responses.length)];
      setAiMessages(prev => [...prev, { role: 'assistant', content: randomResp }]);
      setIsAiTyping(false);
    }, 1200);
  };

  const handleSubmit = async () => {
    if (!code.trim()) return;
    setIsRunning(true);
    setOutput('Submitting...\n');

    try {
      // 1. Run the code first to check for basic errors
      const runResponse = await api.post('/execute/run', { code, language });

      if (runResponse.data.error || runResponse.data.stderr) {
        setOutput(prev => prev + `[Error] Code execution failed. Fix errors before submitting.\n${runResponse.data.stderr || runResponse.data.error}\n`);
        setIsRunning(false);
        if (!isTerminalOpen) setIsTerminalOpen(true);
        return;
      }

      const { stdout } = runResponse.data;
      setOutput(prev => prev + `[Output]\n${stdout}\n\nRunning Submission...\n`);

      // 2. If no errors, proceed to submit (In a real app, this would run against hidden test cases)
      // For now, we assume simple execution success = Pass

      const submitResponse = await api.post('/execute/submit-practice', {
        questionId: question?._id,
        passed: true // Simulating pass
      });

      if (submitResponse.data.points) {
        setOutput(prev => prev + `\n✅ Success! ${submitResponse.data.message}\n` +
          `Points: ${submitResponse.data.points} (+5)\n` +
          `Streak: ${submitResponse.data.streak} 🔥\n`);

        // Could also trigger a confetti effect or modal here
      } else {
        setOutput(prev => prev + `\nReceived: ${submitResponse.data.message}\n`);
      }

    } catch (err) {
      setOutput(prev => prev + `Submission Error: ${err.message}\n`);
    } finally {
      setIsRunning(false);
      if (!isTerminalOpen) setIsTerminalOpen(true);
    }
  };

  if (!question) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-full text-foreground">
          <h2 className="text-xl font-bold mb-4">No question loaded</h2>
          <button onClick={() => navigate('/practice')} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
            Go to Practice
          </button>
        </div>
      </MainLayout>
    );
  }

  // Wrapper for content
  const ContentWrapper = isFullScreen ? 'div' : MainLayout;
  const contentProps = isFullScreen ? { className: 'h-screen bg-background fixed inset-0 z-50 flex flex-col' } : {};

  return (
    <ContentWrapper {...contentProps} navbar={!isFullScreen && undefined}>
      {/* If Not MainLayout, we need to handle full screen structure manually, 
            but if MainLayout is used, it handles the sidebar. 
            If isFullScreen, we render a div that covers everything. */}

      {/* If using MainLayout, children is the content area. */}

      <div className={`flex flex-col h-screen bg-background text-foreground ${isFullScreen ? '' : ''}`}>

        {/* Toolbar */}
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 shrink-0 overflow-x-auto scrollbar-hide gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/practice')} className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${question.difficulty === 'Easy' ? 'bg-green-500' :
                question.difficulty === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></span>
              <h1 className="font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] md:max-w-md">
                {question.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hidden md:block"
              title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>

            <div className="h-6 w-px bg-border mx-1"></div>

            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="bg-secondary border border-border text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
            </select>

            <button
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-sm transition-all shadow-sm active:scale-95"
            >
              {isRunning ? <span className="animate-spin">⚡</span> : <Play size={16} fill="white" />}
              Run
            </button>

            <button
              onClick={handleSubmit}
              disabled={isRunning}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-all shadow-sm flex items-center gap-2"
            >
              <Send size={16} /> Submit
            </button>
          </div>
        </header>

        {/* Workspace */}
        <div className="flex-1 flex overflow-hidden">

          {/* Left Panel: Description */}
          <div className={`${isQuestionOpen ? 'absolute inset-0 z-20 w-full md:relative md:w-1/3 md:min-w-[350px]' : 'w-0'} bg-card border-r border-border flex flex-col transition-all duration-300`}>
            <div className="flex items-center border-b border-border">
              <button
                onClick={() => setActiveTab('description')}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'description' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('hints')}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'hints' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              >
                hints
              </button>
              <button
                onClick={() => setIsQuestionOpen(false)}
                className="p-3 text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {activeTab === 'description' && (
                <div className="prose prose-invert prose-sm max-w-none text-muted-foreground space-y-6">
                  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(question.content || question.description || '<h3>No content</h3>') }} />

                  {/* Constraints Section */}
                  {question.constraints && question.constraints.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-foreground">Constraints</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {question.constraints.map((c, i) => (
                          <li key={i} className="text-xs text-muted-foreground font-mono">{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Examples Section */}
                  {(question.examples_structured || question.examples || question.testCases?.filter(tc => !tc.isHidden).slice(0, 2)) && (
                    <div className="mt-8 space-y-4">
                      <h3 className="text-foreground font-bold">Examples</h3>
                      {Array.isArray(question.examples) || Array.isArray(question.examples_structured) ? (
                        (question.examples_structured || question.examples).map((ex, i) => (
                          <div key={i} className="bg-secondary/30 p-4 rounded-lg border border-border space-y-2">
                            <div className="text-[10px] text-muted-foreground uppercase font-bold">Example {i + 1}</div>
                            <div className="font-mono text-xs">
                              <span className="text-primary">Input: </span> {ex.input}
                            </div>
                            <div className="font-mono text-xs">
                              <span className="text-primary">Output: </span> {ex.output}
                            </div>
                            {ex.explanation && (
                              <div className="text-xs italic text-muted-foreground mt-2 border-l border-primary/20 pl-2">
                                {ex.explanation}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <pre className="bg-secondary/50 p-4 rounded-lg border border-border overflow-x-auto text-xs font-mono">
                          {question.examples}
                        </pre>
                      )}
                    </div>
                  )}

                  <div className="mt-8 flex flex-wrap gap-2">
                    {question.tags?.map(t => (
                      <span key={t} className="px-2 py-1 bg-secondary rounded text-xs text-secondary-foreground font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === 'hints' && (
                <div className="space-y-4">
                  {question.hints?.map((hint, i) => (
                    <div key={i} className="bg-secondary/30 p-4 rounded-lg border border-border">
                      <div className="flex items-center gap-2 text-yellow-500 mb-2 font-bold text-sm">
                        <Lightbulb size={16} /> Hint {i + 1}
                      </div>
                      <p className="text-sm text-muted-foreground">{hint}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Expand Button (Visible when closed) */}
          {!isQuestionOpen && (
            <button
              onClick={() => setIsQuestionOpen(true)}
              className="h-10 w-6 bg-card border-y border-r border-border absolute left-0 top-20 z-10 flex items-center justify-center text-muted-foreground hover:text-primary rounded-r-md shadow-md"
            >
              <ChevronRight size={16} />
            </button>
          )}

          {/* Middle: Editor */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
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
                  padding: { top: 20 },
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>

            {/* Terminal Panel */}
            <div className={`${isTerminalOpen ? 'h-48' : 'h-10'} bg-card border-t border-border flex flex-col transition-all duration-300`}>
              <div className="flex items-center justify-between px-4 h-10 border-b border-border bg-secondary/30 shrink-0">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsTerminalOpen(!isTerminalOpen)}>
                  <Terminal size={14} className="text-muted-foreground" />
                  <span className="text-xs font-bold uppercase text-muted-foreground">Console</span>
                  <span className={`text-[10px] px-1.5 rounded-full ${output.toLowerCase().includes('error') ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'} ${!output && 'hidden'}`}>
                    {output.toLowerCase().includes('error') ? 'Error' : 'Ready'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setOutput('')} className="p-1 hover:bg-secondary rounded text-muted-foreground" title="Clear">
                    <X size={14} />
                  </button>
                  <button onClick={() => setIsTerminalOpen(!isTerminalOpen)} className="p-1 hover:bg-secondary rounded text-muted-foreground">
                    {isTerminalOpen ? <ChevronRight size={14} className="rotate-90" /> : <ChevronRight size={14} className="-rotate-90" />}
                  </button>
                </div>
              </div>
              <div className="flex-1 p-4 font-mono text-sm overflow-y-auto custom-scrollbar bg-[#1e1e1e] text-gray-300">
                <pre className="whitespace-pre-wrap">{output || 'Output area...'}</pre>
              </div>
            </div>
          </div>

          {/* Right Panel: AI Chat (Floating or Fixed?) -> Floating for space */}
          <div className="fixed bottom-6 right-6 z-50">
            {!isAiOpen ? (
              <button
                onClick={() => setIsAiOpen(true)}
                className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 flex items-center justify-center transition-transform hover:scale-105"
              >
                <Bot size={24} />
              </button>
            ) : (
              <div className="w-80 md:w-96 h-[500px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200">
                <div className="p-4 bg-primary text-primary-foreground flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot size={20} />
                    <span className="font-bold">AI Helper</span>
                  </div>
                  <button onClick={() => setIsAiOpen(false)} className="hover:bg-primary-foreground/20 p-1 rounded">
                    <X size={18} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/20">
                  {aiMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-card border border-border rounded-bl-none text-foreground'
                        }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isAiTyping && (
                    <div className="flex items-center gap-1 text-muted-foreground text-xs pl-2">
                      <Bot size={12} /> AI is thinking...
                    </div>
                  )}
                </div>
                <div className="p-3 border-t border-border bg-card">
                  <div className="flex gap-2">
                    <input
                      className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Ask for help..."
                      value={aiInput}
                      onChange={e => setAiInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAiSend()}
                    />
                    <button
                      onClick={handleAiSend}
                      className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </ContentWrapper>
  );
};

export default PracticeArena;
