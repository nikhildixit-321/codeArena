import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { 
  Play, Send, ChevronLeft, Settings, Cpu, FilePlus, X, FileCode,
  MessageSquare, Bot, User, Terminal, BookOpen, Lightbulb, Clock
} from 'lucide-react';
import api from '../../api/axios';
import DOMPurify from 'dompurify';

const PracticeArena = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const question = location.state?.question;
  const terminalRef = useRef(null);

  // Code Editor State
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  // AI Chat State
  const [aiMessages, setAiMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m your AI coding assistant. Ask me anything about this problem!' }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Default code templates
  const templates = {
    javascript: `// Write your solution here\nfunction solution(input) {\n  // Your code here\n  return result;\n}\n\n// Test with example\nconsole.log(solution([1, 2, 3]));`,
    python: `# Write your solution here\ndef solution(input):\n    # Your code here\n    return result\n\n# Test with example\nprint(solution([1, 2, 3]))`,
    cpp: `// Write your solution here\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint solution(vector<int>& input) {\n    // Your code here\n    return result;\n}\n\nint main() {\n    vector<int> test = {1, 2, 3};\n    cout << solution(test) << endl;\n    return 0;\n}`
  };

  useEffect(() => {
    if (question?.codeSnippets) {
      const jsSnippet = question.codeSnippets.find(s => s.langSlug === 'javascript');
      if (jsSnippet) {
        setCode(jsSnippet.code);
      } else {
        setCode(templates.javascript);
      }
    } else {
      setCode(templates.javascript);
    }
  }, [question]);

  const handleRun = async () => {
    if (!code.trim()) return;
    setIsRunning(true);
    setOutput(prev => prev + '\n> Running code...\n');
    
    try {
      const response = await api.post('/execute/run', {
        code,
        language
      });

      if (response.data.error) {
        setOutput(prev => prev + `Error: ${response.data.error}\n`);
      } else {
        const { status, stdout, stderr, compile_output, time, memory } = response.data;
        let outputText = `[${status}]\n`;
        if (compile_output) outputText += `=== Compilation ===\n${compile_output}\n`;
        if (stdout) outputText += `=== Output ===\n${stdout}\n`;
        if (stderr) outputText += `=== Errors ===\n${stderr}\n`;
        if (time) outputText += `\n⏱ ${time}s | 📝 ${memory}KB`;
        setOutput(prev => prev + outputText);
      }
    } catch (err) {
      setOutput(prev => prev + `Error: ${err.response?.data?.message || err.message}\n`);
    } finally {
      setIsRunning(false);
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }
    }
  };

  const handleAiSend = async () => {
    if (!aiInput.trim()) return;
    
    const userMessage = { role: 'user', content: aiInput };
    setAiMessages(prev => [...prev, userMessage]);
    setAiInput('');
    setIsAiTyping(true);

    // Mock AI response - replace with actual API call
    setTimeout(() => {
      const responses = [
        "That's a great approach! Consider using a hash map for O(1) lookups.",
        "Have you tried the two-pointer technique for this problem?",
        "Your logic looks good! Just be careful with edge cases.",
        "Try optimizing the space complexity - can you do it in O(1) extra space?",
        "Consider using dynamic programming for this problem."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setAiMessages(prev => [...prev, { role: 'assistant', content: randomResponse }]);
      setIsAiTyping(false);
    }, 1500);
  };

  const getLanguageFromExt = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    const map = { js: 'javascript', py: 'python', cpp: 'cpp', c: 'c', java: 'java' };
    return map[ext] || 'javascript';
  };

  if (!question) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-gray-400 mb-4">No question selected.</p>
          <button 
            onClick={() => navigate('/practice')}
            className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700"
          >
            Back to Practice
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0d1117] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-14 bg-[#161b22] border-b border-[#30363d] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-800 rounded-lg">
            <ChevronLeft size={20} className="text-gray-400" />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-80">
            <span className="text-purple-500 font-bold">⚔️ CodeArena</span>
          </Link>
          <span className="text-gray-600">|</span>
          <span className="text-white font-medium truncate max-w-md">{question.title}</span>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              setCode(templates[e.target.value] || '');
            }}
            className="bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-sm text-gray-300"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
          </select>
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-1.5 rounded text-sm font-bold"
          >
            {isRunning ? <Cpu size={14} className="animate-spin" /> : <Play size={14} />} 
            Run
          </button>
        </div>
      </header>

      {/* Main 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT: Question Details */}
        <div className="w-1/4 min-w-[300px] bg-[#0d1117] border-r border-[#30363d] flex flex-col">
          <div className="p-4 border-b border-[#30363d]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-purple-500 uppercase">{question.source}</span>
              <span className={`text-xs px-2 py-0.5 rounded ${
                question.difficulty === 'Easy' ? 'bg-green-500/20 text-green-500' :
                question.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-500' :
                'bg-red-500/20 text-red-500'
              }`}>
                {question.difficulty}
              </span>
            </div>
            <h1 className="text-lg font-bold text-white">{question.title}</h1>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-sm font-bold text-gray-400 mb-2 flex items-center gap-2">
                <BookOpen size={14} /> Description
              </h3>
              <div 
                className="text-sm text-gray-300 leading-relaxed prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: DOMPurify.sanitize(question.content || 'No description available.') 
                }}
              />
            </div>

            {/* Examples */}
            {question.examples && (
              <div>
                <h3 className="text-sm font-bold text-gray-400 mb-2">Examples</h3>
                <pre className="bg-[#161b22] p-3 rounded text-sm text-gray-300 overflow-x-auto">
                  {question.examples}
                </pre>
              </div>
            )}

            {/* Hints */}
            {question.hints && question.hints.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-400 mb-2 flex items-center gap-2">
                  <Lightbulb size={14} /> Hints
                </h3>
                <ul className="space-y-2">
                  {question.hints.map((hint, idx) => (
                    <li key={idx} className="text-sm text-gray-400 bg-[#161b22] p-2 rounded">
                      {hint}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tags */}
            {question.tags && (
              <div>
                <h3 className="text-sm font-bold text-gray-400 mb-2">Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {question.tags.map(tag => (
                    <span key={tag} className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MIDDLE: Code Editor + Terminal */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Editor */}
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
                padding: { top: 16 }
              }}
            />
          </div>

          {/* Terminal */}
          <div className="h-48 bg-[#0d1117] border-t border-[#30363d] flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#30363d] bg-[#161b22]">
              <span className="text-xs font-bold text-gray-500 flex items-center gap-2">
                <Terminal size={12} /> Console
              </span>
              <button onClick={() => setOutput('')} className="text-xs text-gray-600 hover:text-gray-400">
                Clear
              </button>
            </div>
            <div 
              ref={terminalRef}
              className="flex-1 p-4 font-mono text-sm text-gray-300 overflow-y-auto whitespace-pre-wrap"
            >
              {output || 'Ready to execute code...'}
            </div>
          </div>
        </div>

        {/* RIGHT: AI Assistant */}
        <div className="w-80 bg-[#161b22] border-l border-[#30363d] flex flex-col">
          <div className="p-4 border-b border-[#30363d]">
            <h3 className="text-sm font-bold text-purple-400 flex items-center gap-2">
              <Bot size={16} /> AI Assistant
            </h3>
          </div>
          
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {aiMessages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-purple-600' : 'bg-green-600'
                }`}>
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                  msg.role === 'user' 
                    ? 'bg-purple-600/20 text-purple-200' 
                    : 'bg-gray-800 text-gray-300'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isAiTyping && (
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                  <Bot size={14} />
                </div>
                <div className="bg-gray-800 p-3 rounded-lg">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-[#30363d]">
            <div className="flex gap-2">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiSend()}
                placeholder="Ask for help..."
                className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
              />
              <button
                onClick={handleAiSend}
                disabled={!aiInput.trim() || isAiTyping}
                className="p-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeArena;
