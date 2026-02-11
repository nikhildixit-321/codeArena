import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import api from '../../api/axios';
import { 
  Folder, File, Play, Save, Plus, Trash2, 
  ChevronRight, ChevronDown, Settings, Terminal,
  FolderPlus, FilePlus, X, Home, Code2, Cpu, Loader2
} from 'lucide-react';

const IDE = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState(() => {
    const saved = localStorage.getItem('ide-projects');
    return saved ? JSON.parse(saved) : [
      {
        id: 'root',
        name: 'My Project',
        type: 'folder',
        isOpen: true,
        children: [
          { id: '1', name: 'main.js', type: 'file', language: 'javascript', content: '// Welcome to CodeArena IDE\nconsole.log("Hello World!");' },
          { id: '2', name: 'utils.py', type: 'file', language: 'python', content: '# Python utilities\ndef greet(name):\n    return f"Hello, {name}!"' }
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
  const [terminalHeight, setTerminalHeight] = useState(200);
  const [isResizing, setIsResizing] = useState(false);

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

  const handleRun = async () => {
    if (!activeFile) return;
    setIsRunning(true);
    setOutput(`Running ${activeFile.name}...\n`);
    
    try {
      const response = await api.post('/execute/run', {
        code: activeFile.content,
        language: activeFile.language
      });

      if (response.data.error) {
        setOutput(prev => prev + `Error: ${response.data.error}\n`);
      } else {
        const { status, stdout, stderr, compile_output, time, memory } = response.data;
        let outputText = `[${status}]\n`;
        if (compile_output) outputText += `=== Compilation Output ===\n${compile_output}\n`;
        if (stdout) outputText += `=== Output ===\n${stdout}\n`;
        if (stderr) outputText += `=== Errors ===\n${stderr}\n`;
        if (time) outputText += `\nTime: ${time}s | Memory: ${memory}KB`;
        setOutput(prev => prev + outputText);
      }
    } catch (err) {
      setOutput(prev => prev + `Error: ${err.response?.data?.message || err.message}\nMake sure to set up Judge0 API key in backend .env file.`);
    } finally {
      setIsRunning(false);
    }
  };

  function renderFileTree(items, depth = 0) {
    return items.map(item => (
      <div key={item.id}>
        <div
          className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-gray-800 transition-colors ${
            activeFileId === item.id ? 'bg-purple-600/20 text-purple-400' : 'text-gray-400'
          }`}
          style={{ paddingLeft: `${depth * 12 + 12}px` }}
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
              {item.isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <Folder size={16} className={item.isOpen ? 'text-yellow-500' : 'text-gray-500'} />
            </>
          ) : (
            <>
              <span className="w-3.5"></span>
              <File size={16} className="text-blue-400" />
            </>
          )}
          <span className="text-sm truncate">{item.name}</span>
        </div>
        {item.type === 'folder' && item.isOpen && item.children && (
          <div>{renderFileTree(item.children, depth + 1)}</div>
        )}
      </div>
    ));
  }

  return (
    <div className="h-screen bg-[#0d1117] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-12 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between px-4 text-white">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-purple-500 font-bold hover:opacity-80">
            <Code2 size={20} /> CodeArena IDE
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowNewFileModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-xs font-bold"
          >
            <FilePlus size={14} /> New File
          </button>
          <button 
            onClick={() => setShowNewFolderModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-xs font-bold"
          >
            <FolderPlus size={14} /> New Folder
          </button>
          <button 
            onClick={handleRun}
            disabled={isRunning || !activeFile}
            className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded text-xs font-bold"
          >
            {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />} 
            {isRunning ? 'Running...' : 'Run'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - File Explorer */}
        <div className="w-64 bg-[#0d1117] border-r border-[#30363d] flex flex-col">
          <div className="p-3 border-b border-[#30363d] flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Explorer</span>
            <div className="flex gap-1">
              <button 
                onClick={() => { setSelectedFolderId('root'); setShowNewFileModal(true); }}
                className="p-1 hover:bg-gray-800 rounded"
              >
                <FilePlus size={14} className="text-gray-400" />
              </button>
              <button 
                onClick={() => { setSelectedFolderId('root'); setShowNewFolderModal(true); }}
                className="p-1 hover:bg-gray-800 rounded"
              >
                <FolderPlus size={14} className="text-gray-400" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {renderFileTree(files)}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tabs */}
          <div className="flex bg-[#161b22] border-b border-[#30363d] overflow-x-auto">
            {openFiles.map(file => (
              <div
                key={file.id}
                onClick={() => setActiveFileId(file.id)}
                className={`flex items-center gap-2 px-4 py-2 text-xs cursor-pointer border-r border-[#30363d] min-w-fit ${
                  activeFileId === file.id 
                    ? 'bg-[#0d1117] text-white border-t-2 border-t-purple-500' 
                    : 'text-gray-500 hover:bg-[#0d1117]'
                }`}
              >
                <File size={12} />
                {file.name}
                <X 
                  size={12} 
                  className="ml-2 hover:text-red-400"
                  onClick={(e) => { e.stopPropagation(); handleDelete(file.id); }}
                />
              </div>
            ))}
          </div>

          {/* Editor */}
          <div className="flex-1 relative">
            {activeFile ? (
              <Editor
                height="100%"
                language={activeFile.language}
                theme="vs-dark"
                value={activeFile.content}
                onChange={(value) => setFiles(updateFileContent(files, activeFileId, value))}
                options={{
                  minimap: { enabled: true },
                  fontSize: 14,
                  fontFamily: 'JetBrains Mono, monospace',
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  padding: { top: 16 }
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-600">
                <div className="text-center">
                  <Code2 size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Select a file to start coding</p>
                </div>
              </div>
            )}
          </div>

          {/* Terminal */}
          <div 
            className="bg-[#0d1117] border-t border-[#30363d] flex flex-col"
            style={{ height: terminalHeight }}
          >
            <div 
              className="h-1 bg-[#30363d] cursor-row-resize hover:bg-purple-500 transition-colors"
              onMouseDown={() => setIsResizing(true)}
            />
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#30363d]">
              <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                <Terminal size={12} /> Terminal
              </span>
              <button onClick={() => setOutput('')} className="text-xs text-gray-600 hover:text-gray-400">Clear</button>
            </div>
            <div className="flex-1 p-4 font-mono text-xs text-gray-400 overflow-y-auto whitespace-pre-wrap">
              {output || 'Ready to execute code...'}
            </div>
          </div>
        </div>
      </div>

      {/* New File Modal */}
      {showNewFileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-xl w-80">
            <h3 className="text-white font-bold mb-4">Create New File</h3>
            <input
              autoFocus
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="filename.js, .py, .cpp..."
              className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-white text-sm mb-4 outline-none focus:border-purple-500"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFile()}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowNewFileModal(false)} className="px-3 py-1.5 text-gray-400 hover:text-white text-sm">Cancel</button>
              <button onClick={handleCreateFile} className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-bold">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-xl w-80">
            <h3 className="text-white font-bold mb-4">Create New Folder</h3>
            <input
              autoFocus
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="folder name"
              className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-white text-sm mb-4 outline-none focus:border-purple-500"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowNewFolderModal(false)} className="px-3 py-1.5 text-gray-400 hover:text-white text-sm">Cancel</button>
              <button onClick={handleCreateFolder} className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-bold">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div 
          className="fixed z-50 bg-[#161b22] border border-[#30363d] rounded-lg py-1 shadow-xl"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={() => setContextMenu(null)}
        >
          {contextMenu.itemType === 'folder' && (
            <>
              <button 
                onClick={() => { setSelectedFolderId(contextMenu.itemId); setShowNewFileModal(true); }}
                className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2"
              >
                <FilePlus size={14} /> New File
              </button>
              <button 
                onClick={() => { setSelectedFolderId(contextMenu.itemId); setShowNewFolderModal(true); }}
                className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2"
              >
                <FolderPlus size={14} /> New Folder
              </button>
            </>
          )}
          <button 
            onClick={() => handleDelete(contextMenu.itemId)}
            className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-800 flex items-center gap-2"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}

      {/* Click outside to close context menu */}
      {contextMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)} />
      )}
    </div>
  );
};

export default IDE;
