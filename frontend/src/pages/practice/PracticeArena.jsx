import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import HomeNavbar from '../../components/Navbar';
import { Play, Send, ChevronLeft, Settings, Cpu, FilePlus, X, FileCode } from 'lucide-react';
import api from '../../api/axios';

const PracticeArena = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const question = location.state?.question;

  const [files, setFiles] = useState([
    { name: 'main.js', language: 'javascript', content: '// Write your solution here\nfunction solution(input) {\n  \n}' }
  ]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [newFileName, setNewFileFileName] = useState('');

  const activeFile = files[activeFileIndex];

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('Executing code from ' + activeFile.name + '...');
    
    try {
      if (activeFile.language === 'javascript') {
        setTimeout(() => {
          setOutput('Output: (Mock)\nCode from ' + activeFile.name + ' executed successfully.');
          setIsRunning(false);
        }, 1000);
      } else {
        setTimeout(() => {
          setOutput(`Output: (Mock)\n${activeFile.language.toUpperCase()} execution coming soon!`);
          setIsRunning(false);
        }, 1000);
      }
    } catch (err) {
      setOutput('Error: ' + err.message);
      setIsRunning(false);
    }
  };

  const addFile = () => {
    if (!newFileName) return;
    const ext = newFileName.split('.').pop();
    let lang = 'javascript';
    if (ext === 'py') lang = 'python';
    if (ext === 'cpp') lang = 'cpp';

    const newFile = {
      name: newFileName,
      language: lang,
      content: templates[lang] || ''
    };

    setFiles([...files, newFile]);
    setActiveFileIndex(files.length);
    setNewFileFileName('');
    setShowFileModal(false);
  };

  const deleteFile = (index, e) => {
    e.stopPropagation();
    if (files.length === 1) return;
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    if (activeFileIndex >= index) {
      setActiveFileIndex(Math.max(0, activeFileIndex - 1));
    }
  };

  const updateActiveFileContent = (newContent) => {
    const newFiles = [...files];
    newFiles[activeFileIndex].content = newContent;
    setFiles(newFiles);
  };

  // Default templates for languages
  const templates = {
    javascript: '// Write your solution here\nfunction solution(input) {\n  console.log(input);\n}',
    python: '# Write your solution here\ndef solution(input):\n    print(input)',
    cpp: '// Write your solution here\n#include <iostream>\nusing namespace std;\nint main() {\n    return 0;\n}'
  };

  if (!question) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">No question selected.</div>;
  }

  return (
    <div className="h-screen bg-[#0d1117] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-[#30363d] bg-[#161b22] px-4 flex justify-between items-center text-white shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors">
            <ChevronLeft size={20} />
          </button>
          <Link to="/dashboard" className="flex flex-col hover:opacity-80 transition-opacity">
            <span className="text-xs font-bold text-purple-500 uppercase tracking-tighter leading-none">Practice Arena</span>
            <span className="text-sm font-bold truncate max-w-[200px]">{question.title}</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFileModal(true)}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
          >
            <FilePlus size={14} /> New File
          </button>
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-2 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
          >
            {isRunning ? <Cpu size={14} className="animate-spin" /> : <Play size={14} />} Run
          </button>
        </div>
      </header>

      {/* File Creation Modal */}
      {showFileModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-xl w-80 shadow-2xl">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <FilePlus size={18} className="text-purple-500" /> Create New File
            </h3>
            <input
              autoFocus
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileFileName(e.target.value)}
              placeholder="filename.js, .py, .cpp"
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-purple-500 mb-4"
              onKeyDown={(e) => e.key === 'Enter' && addFile()}
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowFileModal(false)} className="text-gray-500 hover:text-white text-xs font-bold">Cancel</button>
              <button onClick={addFile} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-xs font-bold">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Question View & File Explorer */}
        <div className="w-1/3 border-r border-[#30363d] flex flex-col bg-[#0d1117]">
          {/* Tabs for Files */}
          <div className="flex bg-[#161b22] border-b border-[#30363d] overflow-x-auto no-scrollbar">
            {files.map((file, idx) => (
              <div 
                key={idx}
                onClick={() => setActiveFileIndex(idx)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-r border-[#30363d] cursor-pointer transition-all shrink-0 ${activeFileIndex === idx ? 'bg-[#0d1117] text-purple-500 border-t-2 border-t-purple-500' : 'text-gray-500 hover:bg-[#0d1117]'}`}
              >
                <FileCode size={14} className={file.language === 'javascript' ? 'text-yellow-500' : file.language === 'python' ? 'text-blue-400' : 'text-orange-400'} />
                {file.name}
                {files.length > 1 && (
                  <X 
                    size={12} 
                    className="ml-2 hover:text-red-500 transition-colors" 
                    onClick={(e) => deleteFile(idx, e)}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="p-6 overflow-y-auto flex-1">
            <div className="flex items-center gap-3 mb-4">
               <span className="text-[10px] font-black uppercase bg-purple-500/20 text-purple-500 px-2 py-1 rounded border border-purple-500/20">
                 {question.source}
               </span>
               <span className="text-[10px] font-black uppercase bg-gray-800 text-gray-400 px-2 py-1 rounded border border-gray-700">
                 {question.difficulty}
               </span>
            </div>
            <h1 className="text-2xl font-black text-white mb-4">{question.title}</h1>
            <div className="prose prose-invert prose-sm">
               <p className="text-gray-400 leading-relaxed mb-6">
                 This is a {question.source} question. You can solve it here or visit the original platform for official submission.
               </p>
               {question.tags && (
                 <div className="flex flex-wrap gap-2 mb-6">
                   {question.tags.map(t => (
                     <span key={t} className="text-[10px] font-mono text-gray-500 bg-gray-900 px-2 py-1 rounded">#{t}</span>
                   ))}
                 </div>
               )}
               <a 
                 href={question.link} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="inline-flex items-center gap-2 text-xs font-bold text-purple-500 hover:text-purple-400 transition-colors"
               >
                 View full description on {question.source} <Settings size={12} />
               </a>
            </div>
          </div>
        </div>

        {/* Right: Editor & Console */}
        <div className="flex-1 flex flex-col bg-[#161b22]">
          <div className="flex-1">
            <Editor
              height="100%"
              language={activeFile.language}
              theme="vs-dark"
              value={activeFile.content}
              onChange={updateActiveFileContent}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                padding: { top: 20 },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                fontFamily: 'JetBrains Mono, monospace'
              }}
            />
          </div>

          {/* Console / Output */}
          <div className="h-48 border-t border-[#30363d] bg-[#0d1117] p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3 shrink-0">
               <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Console Output</h3>
               <button onClick={() => setOutput('')} className="text-[10px] text-gray-600 hover:text-gray-400 uppercase font-bold">Clear</button>
            </div>
            <div className="flex-1 overflow-y-auto font-mono text-xs text-gray-400 whitespace-pre-wrap">
              {output || 'Output will appear here after execution...'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeArena;
