import React, { useState, useRef, useEffect } from 'react';
import { 
  FileDown, 
  FileImage, 
  FileCode, 
  FileType, 
  Split, 
  Eye, 
  Edit3, 
  Sparkles, 
  Check, 
  Loader2,
  Menu,
  X,
  Mic
} from 'lucide-react';
import Editor from './components/Editor';
import Preview from './components/Preview';
import { ViewMode, ExportFormat, AiActionType } from './types';
import { downloadHtml, downloadImage, downloadPdf } from './utils/exportHelper';
import { generateAiContent } from './services/geminiService';

const DEFAULT_MARKDOWN = `# Welcome to Gemini Studio

This is a **smart** Markdown editor powered by Google Gemini.

## Features
- 📝 **Live Preview**: See changes instantly
- 🎨 **Syntax Highlighting**: For your code blocks
- 🤖 **AI Assistant**: Fix grammar, summarize, or expand text
- 📤 **Export**: Save as HTML, PNG, or PDF

## Code Example
\`\`\`javascript
console.log("Hello, World!");
const ai = "Gemini";
\`\`\`

## Tables
| Feature | Status |
| :--- | :--- |
| Editing | ✅ Ready |
| Export | ✅ Ready |
| AI | ✅ Ready |

> Start typing on the left to begin!
`;

const App: React.FC = () => {
  const [markdown, setMarkdown] = useState<string>(DEFAULT_MARKDOWN);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.SPLIT);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isAiMenuOpen, setIsAiMenuOpen] = useState(false);
  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
      if (aiRef.current && !aiRef.current.contains(event.target as Node)) {
        setIsAiMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Responsive check
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && viewMode === ViewMode.SPLIT) {
        setViewMode(ViewMode.EDITOR);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleExport = async (format: ExportFormat) => {
    setIsExportMenuOpen(false);
    const filename = "document";
    
    if (format === ExportFormat.HTML) {
      downloadHtml(markdown, filename);
    } else if (format === ExportFormat.IMAGE && previewRef.current) {
      await downloadImage(previewRef.current, filename);
    } else if (format === ExportFormat.PDF && previewRef.current) {
      await downloadPdf(previewRef.current, filename);
    }
  };

  const handleAiAction = async (action: AiActionType) => {
    setIsAiMenuOpen(false);
    setIsProcessingAi(true);
    try {
      const result = await generateAiContent(markdown, action);
      if (result) {
        if (action === AiActionType.EXPAND) {
             setMarkdown(prev => prev + "\n\n" + result);
        } else {
             setMarkdown(result);
        }
      }
    } catch (error) {
      alert("AI Processing Failed. Please ensure you have a valid API Key.");
    } finally {
      setIsProcessingAi(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="h-16 border-b border-gray-800 bg-gray-950 flex items-center justify-between px-4 lg:px-6 z-20 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Edit3 className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-lg tracking-tight hidden sm:block">Gemini <span className="text-gray-400 font-normal">Markdown Studio</span></h1>
        </div>

        {/* Desktop Toolbar */}
        <div className="hidden md:flex items-center gap-2">
           {/* View Modes */}
          <div className="bg-gray-800 p-1 rounded-lg flex gap-1 mr-4">
            <button 
              onClick={() => setViewMode(ViewMode.EDITOR)}
              className={`p-2 rounded-md transition-all ${viewMode === ViewMode.EDITOR ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
              title="Editor Only"
            >
              <FileCode size={18} />
            </button>
            <button 
              onClick={() => setViewMode(ViewMode.SPLIT)}
              className={`p-2 rounded-md transition-all ${viewMode === ViewMode.SPLIT ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
              title="Split View"
            >
              <Split size={18} />
            </button>
            <button 
              onClick={() => setViewMode(ViewMode.PREVIEW)}
              className={`p-2 rounded-md transition-all ${viewMode === ViewMode.PREVIEW ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
              title="Preview Only"
            >
              <Eye size={18} />
            </button>
          </div>

          {/* AI Tools */}
          <div className="relative mr-2" ref={aiRef}>
            <button 
              onClick={() => setIsAiMenuOpen(!isAiMenuOpen)}
              disabled={isProcessingAi}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              AI Assist
            </button>
            
            {isAiMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50">
                <div className="p-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Quick Actions</div>
                {Object.values(AiActionType).map((action) => (
                  <button
                    key={action}
                    onClick={() => handleAiAction(action)}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-700 text-sm flex items-center gap-2 text-gray-200"
                  >
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    {action}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export */}
          <div className="relative" ref={exportRef}>
            <button 
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <FileDown className="w-4 h-4" />
              Export
            </button>
             {isExportMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50">
                <button onClick={() => handleExport(ExportFormat.HTML)} className="w-full text-left px-4 py-2.5 hover:bg-gray-700 text-sm flex items-center gap-3 text-gray-200">
                  <FileType className="w-4 h-4 text-orange-400" /> HTML
                </button>
                <button onClick={() => handleExport(ExportFormat.PDF)} className="w-full text-left px-4 py-2.5 hover:bg-gray-700 text-sm flex items-center gap-3 text-gray-200">
                  <FileDown className="w-4 h-4 text-red-400" /> PDF
                </button>
                <button onClick={() => handleExport(ExportFormat.IMAGE)} className="w-full text-left px-4 py-2.5 hover:bg-gray-700 text-sm flex items-center gap-3 text-gray-200">
                  <FileImage className="w-4 h-4 text-green-400" /> Image (PNG)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2 text-gray-400" onClick={() => setShowMobileMenu(!showMobileMenu)}>
          {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-gray-900 border-b border-gray-800 z-30 p-4 shadow-xl flex flex-col gap-4">
          <div className="flex gap-2 justify-center bg-gray-800 p-2 rounded-lg">
             <button onClick={() => { setViewMode(ViewMode.EDITOR); setShowMobileMenu(false); }} className={`flex-1 p-2 rounded text-center text-sm ${viewMode === ViewMode.EDITOR ? 'bg-gray-700 text-white' : 'text-gray-400'}`}>Editor</button>
             <button onClick={() => { setViewMode(ViewMode.PREVIEW); setShowMobileMenu(false); }} className={`flex-1 p-2 rounded text-center text-sm ${viewMode === ViewMode.PREVIEW ? 'bg-gray-700 text-white' : 'text-gray-400'}`}>Preview</button>
          </div>
          <div className="grid grid-cols-2 gap-2">
             <button onClick={() => { handleAiAction(AiActionType.FIX_GRAMMAR); setShowMobileMenu(false); }} className="p-3 bg-purple-900/50 rounded-lg text-sm text-purple-200 flex items-center justify-center gap-2"><Sparkles size={14} /> Fix Grammar</button>
             <button onClick={() => { handleAiAction(AiActionType.EXPAND); setShowMobileMenu(false); }} className="p-3 bg-purple-900/50 rounded-lg text-sm text-purple-200 flex items-center justify-center gap-2"><Sparkles size={14} /> Expand</button>
          </div>
           <div className="flex flex-col gap-2 mt-2 border-t border-gray-800 pt-4">
              <span className="text-xs text-gray-500 font-semibold uppercase">Export As</span>
              <button onClick={() => { handleExport(ExportFormat.PDF); setShowMobileMenu(false); }} className="w-full p-2 text-left text-gray-300 hover:bg-gray-800 rounded">PDF</button>
              <button onClick={() => { handleExport(ExportFormat.HTML); setShowMobileMenu(false); }} className="w-full p-2 text-left text-gray-300 hover:bg-gray-800 rounded">HTML</button>
           </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Editor Pane */}
        <div className={`
          flex-1 h-full bg-gray-950 transition-all duration-300
          ${viewMode === ViewMode.PREVIEW ? 'hidden' : 'block'}
          ${viewMode === ViewMode.SPLIT ? 'w-1/2 border-r border-gray-800' : 'w-full'}
        `}>
          <Editor value={markdown} onChange={setMarkdown} disabled={isProcessingAi} />
        </div>

        {/* Preview Pane */}
        <div className={`
          flex-1 h-full bg-white transition-all duration-300
          ${viewMode === ViewMode.EDITOR ? 'hidden' : 'block'}
          ${viewMode === ViewMode.SPLIT ? 'w-1/2' : 'w-full'}
        `}>
          <Preview content={markdown} ref={previewRef} />
        </div>
      </main>

      {/* Loading Overlay */}
      {isProcessingAi && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-gray-800 p-6 rounded-xl shadow-2xl flex flex-col items-center gap-4 border border-gray-700">
            <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
            <p className="text-gray-200 font-medium animate-pulse">Gemini is rewriting your text...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;