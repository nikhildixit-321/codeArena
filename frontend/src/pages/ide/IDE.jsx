import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import api from '../../api/axios';
import MainLayout from '../../components/MainLayout';
import {
  Folder, File, Play, Save, Plus, Trash2,
  ChevronRight, ChevronDown, Settings, Terminal,
  FolderPlus, FilePlus, X, Home, Code2, Cpu, Loader2,
  Minimize2, Maximize2, MoreHorizontal, Download, Share2
} from 'lucide-react';

const IDE = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState(() => {
    const saved = localStorage.getItem('ide-projects');
    return saved ? JSON.parse(saved) : [
      {
        id: 'root',
        name: 'Project',
        type: 'folder',
        isOpen: true,
        children: [
          { id: '1', name: 'main.js', type: 'file', language: 'javascript', content: '// Welcome to CodeArena IDE\nconsole.log("Hello World!");' },
          { id: '2', name: 'styles.css', type: 'file', language: 'css', content: 'body {\n  background: #000;\n  color: #fff;\n}' }
        ]
      }
    ];
  });

  const [activeFileId, setActiveFileId] = useState('1');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState('root');
  const [contextMenu, setContextMenu] = useState(null);
  const [terminalHeight, setTerminalHeight] = useState(240);
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [activeTab, setActiveTab] = useState('editor'); // 'explorer', 'editor', 'terminal' (Mobile only)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [customInput, setCustomInput] = useState('');
  const [consoleTab, setConsoleTab] = useState('output');
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Theme Colors (Sky Blue / Neon Vibe)
  const activeFile = findFileById(files, activeFileId);
  const openFiles = getAllFiles(files).filter(f => f.type === 'file');

  useEffect(() => {
    localStorage.setItem('ide-projects', JSON.stringify(files));
  }, [files]);

  function findFileById(items, id) {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findFileById(item.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  function getAllFiles(items) {
    let result = [];
    for (const item of items) {
      result.push(item);
      if (item.children) {
        result = result.concat(getAllFiles(item.children));
      }
    }
    return result;
  }

  function updateFileContent(items, id, newContent) {
    return items.map(item => {
      if (item.id === id) {
        return { ...item, content: newContent };
      }
      if (item.children) {
        return { ...item, children: updateFileContent(item.children, id, newContent) };
      }
      return item;
    });
  }

  function toggleFolder(items, id) {
    return items.map(item => {
      if (item.id === id) {
        return { ...item, isOpen: !item.isOpen };
      }
      if (item.children) {
        return { ...item, children: toggleFolder(item.children, id) };
      }
      return item;
    });
  }

  function addItem(items, parentId, newItem) {
    return items.map(item => {
      if (item.id === parentId) {
        return { ...item, children: [...(item.children || []), newItem], isOpen: true };
      }
      if (item.children) {
        return { ...item, children: addItem(item.children, parentId, newItem) };
      }
      return item;
    });
  }

  function deleteItem(items, id) {
    return items.filter(item => item.id !== id).map(item => {
      if (item.children) {
        return { ...item, children: deleteItem(item.children, id) };
      }
      return item;
    });
  }

  function getLanguageFromExt(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const map = {
      js: 'javascript', py: 'python', cpp: 'cpp', c: 'c',
      java: 'java', html: 'html', css: 'css', json: 'json',
      ts: 'typescript', jsx: 'javascript', tsx: 'typescript',
      go: 'go', rs: 'rust', rb: 'ruby', php: 'php'
    };
    return map[ext] || 'plaintext';
  }

  function handleCreateFile() {
    if (!newItemName) return;
    const newFile = {
      id: Date.now().toString(),
      name: newItemName,
      type: 'file',
      language: getLanguageFromExt(newItemName),
      content: ''
    };
    setFiles(addItem(files, selectedFolderId, newFile));
    setActiveFileId(newFile.id);
    setNewItemName('');
    setShowNewFileModal(false);
  }

  function handleCreateFolder() {
    if (!newItemName) return;
    const newFolder = {
      id: Date.now().toString(),
      name: newItemName,
      type: 'folder',
      isOpen: false,
      children: []
    };
    setFiles(addItem(files, selectedFolderId, newFolder));
    setNewItemName('');
    setShowNewFolderModal(false);
  }

  function handleDelete(id) {
    setFiles(deleteItem(files, id));
    if (activeFileId === id && openFiles.length > 1) {
      setActiveFileId(openFiles.find(f => f.id !== id)?.id || '');
    }
    setContextMenu(null);
  }

  const handleRun = () => {
    if (!activeFile) return;
    setTerminalHeight(260);
    setIsWaitingForInput(true);
    setOutput(`// ${activeFile.name} initialized.\n// Program is waiting for input...\n// Enter input in the left panel and click 'Execute'.\n`);
    // Focus the input ref after a small delay
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && isWaitingForInput) {
      e.preventDefault();
      executeWithInput();
    }
  };

  const executeWithInput = async () => {
    if (!activeFile || isRunning) return;

    setIsRunning(true);
    setIsWaitingForInput(false);
    setOutput(prev => prev + `\n===== RUNNING =====\n`);

    try {
      const response = await api.post('/execute/run', {
        code: activeFile.content,
        language: activeFile.language,
        stdin: customInput
      });

      if (response.data.error) {
        setOutput(prev => prev + `\n[Error]: ${response.data.error}`);
      } else {
        const { stdout, stderr, compile_output } = response.data;
        let finalOutput = '';
        if (compile_output) finalOutput += `\n[Compiler Message]:\n${compile_output}\n`;
        if (stdout) finalOutput += stdout;
        if (stderr) finalOutput += `\n[Runtime Error]:\n${stderr}`;
        setOutput(prev => prev + (finalOutput || '\n(Program finished with no output)'));
      }
    } catch (err) {
      setOutput(prev => prev + `\n[Execution Error]: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  function renderFileTree(items, depth = 0) {
    return items.map(item => (
      <div key={item.id}>
        <div
          className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer transition-all border-l-2 ${activeFileId === item.id
            ? 'bg-sky-500/10 border-sky-500 text-sky-400 font-medium'
            : 'border-transparent text-gray-400 hover:bg-[#1f1f28] hover:text-gray-200'
            }`}
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
          onClick={() => {
            if (item.type === 'folder') {
              setFiles(toggleFolder(files, item.id));
            } else {
              setActiveFileId(item.id);
            }
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            setContextMenu({ x: e.clientX, y: e.clientY, itemId: item.id, itemType: item.type });
          }}
        >
          {item.type === 'folder' ? (
            <>
              {item.isOpen ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />}
              <Folder size={16} className={item.isOpen ? 'text-blue-400' : 'text-gray-500'} />
            </>
          ) : (
            item.name.endsWith('.js') ? <File size={16} className="text-yellow-400" /> :
              item.name.endsWith('.css') ? <File size={16} className="text-blue-400" /> :
                item.name.endsWith('.html') ? <File size={16} className="text-orange-400" /> :
                  item.name.endsWith('.py') ? <File size={16} className="text-green-400" /> :
                    <File size={16} className="text-gray-400" />
          )}
          <span className="text-sm truncate select-none">{item.name}</span>
        </div>
        {item.type === 'folder' && item.isOpen && item.children && (
          <div>{renderFileTree(item.children, depth + 1)}</div>
        )}
      </div>
    ));
  }

  return (
    <MainLayout navbar={
      <div className="h-14 bg-[#0a0a0f] border-b border-white/5 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sky-400 font-black tracking-tight text-lg">
            <Code2 size={22} strokeWidth={2.5} /> IDE <span className="text-gray-600 font-thin">/</span> <span className="text-white text-sm font-medium">Project_Alpha</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
            <Share2 size={16} />
          </button>
          <button className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
            <Download size={16} />
          </button>
          <div className="h-6 w-px bg-white/10 mx-1"></div>
          <button
            onClick={handleRun}
            disabled={isRunning || !activeFile}
            className="flex items-center gap-2 px-5 py-2 bg-linear-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-lg text-xs font-bold shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:shadow-[0_0_25px_rgba(14,165,233,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} className="fill-current" />}
            {isRunning ? 'Compiling...' : 'Run Code'}
          </button>
        </div>
      </div>
    }>
      <div className="flex h-[calc(100vh-3.5rem)] bg-[#050505] overflow-hidden">

        {/* 1. SIDEBAR (File Explorer) - Hidden on mobile if not active */}
        <div
          className={`
            ${isMobile && activeTab === 'explorer' ? 'flex fixed inset-0 z-40 bg-[#0a0a0f]' : (isMobile ? 'hidden' : 'flex')}
            flex-col border-r border-white/5 bg-[#0a0a0f]
          `}
          style={{ width: isMobile ? '100%' : sidebarWidth }}
        >
          {isMobile && (
            <div className="p-4 flex items-center justify-between border-b border-white/5">
              <span className="font-black text-sky-400">EXPLORER</span>
              <button onClick={() => setActiveTab('editor')} className="p-2 bg-white/5 rounded-lg text-gray-400"><X size={18} /></button>
            </div>
          )}
          <div className="p-3 flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-white/5">
            <span className="flex items-center gap-2"><Folder size={14} /> Explorer</span>
            <div className="flex gap-1">
              <button onClick={() => { setSelectedFolderId('root'); setShowNewFileModal(true); }} className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"><FilePlus size={14} /></button>
              <button onClick={() => { setSelectedFolderId('root'); setShowNewFolderModal(true); }} className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"><FolderPlus size={14} /></button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
            {renderFileTree(files)}
          </div>
        </div>

        {/* 2. MAIN EDITOR AREA - Visible if active or on desktop */}
        <div className={`
          flex-1 flex flex-col min-w-0 bg-[#050505] relative
          ${isMobile && activeTab !== 'editor' ? 'hidden' : 'flex'}
        `}>

          {/* Tabs Bar */}
          <div className="flex bg-[#0a0a0f] border-b border-white/5 overflow-x-auto no-scrollbar">
            {openFiles.map(file => (
              <div
                key={file.id}
                onClick={() => setActiveFileId(file.id)}
                className={`
                                    group flex items-center gap-2 px-4 py-2.5 text-xs font-medium cursor-pointer border-r border-white/5 min-w-[120px] max-w-[200px] transition-colors
                                    ${activeFileId === file.id ? 'bg-[#050505] text-sky-400 border-t-2 border-t-sky-500' : 'text-gray-500 hover:text-gray-300 hover:bg-[#121218]'}
                                `}
              >
                <span className={activeFileId === file.id ? 'opacity-100' : 'opacity-50'}>
                  {file.name.endsWith('.js') ? <Code2 size={14} /> : <File size={14} />}
                </span>
                <span className="truncate flex-1">{file.name}</span>
                <X
                  size={12}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity"
                  onClick={(e) => { e.stopPropagation(); handleDelete(file.id); }}
                />
              </div>
            ))}
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 relative">
            {activeFile ? (
              <Editor
                height="100%"
                language={activeFile.language}
                theme="vs-dark"
                value={activeFile.content}
                onChange={(value) => setFiles(updateFileContent(files, activeFileId, value))}
                options={{
                  minimap: { enabled: false }, // Cleaner look
                  fontSize: 15,
                  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                  fontLigatures: true,
                  padding: { top: 20 },
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  cursorBlinking: "smooth",
                  cursorSmoothCaretAnimation: "on",
                  renderLineHighlight: "all",
                }}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                <Code2 size={64} className="mb-4 text-gray-700" />
                <p className="text-sm">Select a file from the explorer to start coding.</p>
                <p className="text-xs mt-2 text-gray-600">Use Ctrl+S to save changes</p>
              </div>
            )}
          </div>

          {/* 3. TERMINAL PANEL (Bottom) - Toggleable on mobile/desktop */}
          <div
            className={`
              bg-[#0a0a0f] border-t border-white/5 flex flex-col transition-all duration-300 ease-in-out
              ${isMobile && activeTab === 'terminal' ? 'fixed inset-0 z-40 h-full!' : (isMobile ? 'hidden' : '')}
            `}
            style={{ height: isMobile && activeTab === 'terminal' ? '100%' : terminalHeight }}
          >
            {isMobile && activeTab === 'terminal' && (
              <div className="p-4 flex items-center justify-between border-b border-white/5 bg-[#0e0e12]">
                <span className="font-black text-sky-400">TERMINAL</span>
                <button onClick={() => setActiveTab('editor')} className="p-2 bg-white/5 rounded-lg text-gray-400"><X size={18} /></button>
              </div>
            )}
            {/* Terminal Header & Resizer */}
            <div
              className="h-9 flex items-center justify-between border-b border-white/5 bg-[#0e0e12] select-none cursor-row-resize"
              onMouseDown={(e) => {
                const startY = e.clientY;
                const startHeight = terminalHeight;
                const handleMouseMove = (ev) => {
                  setTerminalHeight(startHeight - (ev.clientY - startY));
                };
                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            >
              <div className="flex items-center h-full px-4 text-[10px] font-black tracking-widest text-sky-400 gap-2 uppercase">
                <Terminal size={14} /> Console
              </div>
              <div className="flex items-center gap-3 px-4">
                <span className="text-[10px] uppercase font-black tracking-widest text-gray-600 hover:text-white cursor-pointer transition-colors" onClick={() => setOutput('')}>Clear Output</span>
                <div className="h-4 w-px bg-white/5"></div>
                <Maximize2 size={12} className="text-gray-600 hover:text-white cursor-pointer" onClick={() => setTerminalHeight(terminalHeight > 300 ? 100 : 400)} />
                <X size={14} className="text-gray-600 hover:text-white cursor-pointer" onClick={() => setTerminalHeight(40)} />
              </div>
            </div>

            {/* Terminal Content - Split Layout */}
            <div className="flex-1 bg-[#050505] flex overflow-hidden">
              {/* Left Column: Input */}
              <div className="w-1/3 border-r border-white/5 flex flex-col bg-[#0a0a0f]/50">
                <div className="px-3 py-1 bg-white/2 border-b border-white/5 flex items-center justify-between">
                  <span className={`text-[9px] font-black uppercase tracking-tighter ${isWaitingForInput ? 'text-sky-400 animate-pulse' : 'text-gray-500'}`}>
                    {isWaitingForInput ? 'Waiting for Stdin...' : 'Program Input'}
                  </span>
                  <button
                    onClick={executeWithInput}
                    disabled={isRunning}
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition-all text-[9px] font-black uppercase ${isWaitingForInput ? 'bg-sky-500 text-black shadow-[0_0_10px_rgba(14,165,233,0.5)]' : 'bg-sky-500/10 text-sky-400 hover:bg-sky-500/20'}`}
                  >
                    {isRunning ? '...' : (isWaitingForInput ? 'Enter' : 'Execute')} <ChevronRight size={10} />
                  </button>
                </div>
                <textarea
                  ref={inputRef}
                  value={customInput}
                  onKeyDown={handleKeyDown}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Paste or type stdin here..."
                  className={`flex-1 p-4 bg-transparent border-none outline-none text-gray-300 font-mono text-sm resize-none placeholder:text-gray-800 transition-all ${isWaitingForInput ? 'bg-sky-500/5' : ''}`}
                />
              </div>

              {/* Right Column: Output */}
              <div className="flex-1 flex flex-col">
                <div className="px-3 py-1 bg-white/2 border-b border-white/5">
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">System Output</span>
                </div>
                <div className="flex-1 p-4 font-mono text-sm overflow-y-auto custom-scrollbar">
                  {output ? (
                    <pre className="whitespace-pre-wrap text-gray-300 leading-relaxed font-[Consolas]">
                      {output}
                    </pre>
                  ) : (
                    <div className="text-gray-700 text-xs italic mt-2 ml-2">
                        // Results will be displayed here after execution.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 4. MOBILE BOTTOM NAVIGATION */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-[#0a0a0f] border-t border-white/10 flex items-center justify-around px-4 z-99">
          <button
            onClick={() => setActiveTab('explorer')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'explorer' ? 'text-sky-400' : 'text-gray-500'}`}
          >
            <Folder size={20} />
            <span className="text-[10px] font-bold uppercase">Files</span>
          </button>
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'editor' ? 'text-sky-400' : 'text-gray-500'}`}
          >
            <div className="p-2 bg-sky-500/20 rounded-full -mt-6 border-2 border-[#0a0a0f] text-sky-400 shadow-lg">
              <Code2 size={24} />
            </div>
            <span className="text-[10px] font-bold uppercase mt-1">Editor</span>
          </button>
          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'terminal' ? 'text-sky-400' : 'text-gray-500'}`}
          >
            <Terminal size={20} />
            <span className="text-[10px] font-bold uppercase">Terminal</span>
          </button>
        </div>
      )}

      {/* Modals & Context Menu reused logic */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-[#161b22] border border-white/10 rounded-xl py-1 shadow-2xl w-48 backdrop-blur-md"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button onClick={() => handleDelete(contextMenu.itemId)} className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-white/5 flex items-center gap-2 transition-colors">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}

      {contextMenu && <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)} />}

      {/* Simple Modals for File/Folder creation (keeping functional logic same) */}
      {showNewFileModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#161b22] border border-white/10 p-6 rounded-2xl w-96 shadow-2xl">
            <h3 className="text-white font-bold mb-4 text-lg">New File</h3>
            <input autoFocus type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="e.g., script.js" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm mb-6 outline-none focus:border-sky-500/50 transition-colors" onKeyDown={(e) => e.key === 'Enter' && handleCreateFile()} />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowNewFileModal(false)} className="px-4 py-2 text-gray-400 hover:text-white text-sm font-bold">Cancel</button>
              <button onClick={handleCreateFile} className="px-6 py-2 bg-sky-500 hover:bg-sky-400 text-black rounded-xl text-sm font-bold">Create</button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default IDE;
