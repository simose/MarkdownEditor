import React, { useState, useRef, useEffect } from 'react';
import { 
  FileDown, FileImage, FileType, Split, Eye, 
  FileCode, Menu, X, LayoutTemplate, Maximize2, Minimize2,
  List
} from 'lucide-react';
import Editor from './components/Editor';
import Preview from './components/Preview';
import { ViewMode, ExportFormat } from './types';
import { downloadHtml, downloadImage, downloadPdf } from './utils/exportHelper';

const DEFAULT_MARKDOWN = `# Glassmorphism Editor

Welcome to your new **distraction-free** writing environment.

## Features
- ✨ **Glass UI**: Modern aesthetic
- 🛠️ **Rich Toolbar**: Format with ease
- 📑 **Auto TOC**: Navigate long documents
- 🔭 **Full Screen**: Focus on writing

## Styling Examples
> "Design is intelligence made visible."

| Element | Style |
| :--- | :--- |
| **Bold** | Strong emphasis |
| *Italic* | Subtle emphasis |
| \`Code\` | Inline code |

### Code Block
\`\`\`javascript
function zenMode() {
  return "Peace of mind";
}
\`\`\`
`;

const App: React.FC = () => {
  const [markdown, setMarkdown] = useState<string>(DEFAULT_MARKDOWN);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.SPLIT);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showToc, setShowToc] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [headers, setHeaders] = useState<{ id: string, text: string, level: number }[]>([]);

  const previewRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  // Parse headers for TOC
  useEffect(() => {
    const lines = markdown.split('\n');
    const extractedHeaders = lines
      .filter(line => line.startsWith('#'))
      .map(line => {
        const match = line.match(/^(#{1,6})\s+(.+)$/);
        if (match) {
          const level = match[1].length;
          const text = match[2];
          const id = text.toLowerCase().replace(/[^\w]+/g, '-');
          return { id, text, level };
        }
        return null;
      })
      .filter((h): h is { id: string, text: string, level: number } => h !== null);
    
    setHeaders(extractedHeaders);
  }, [markdown]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async (format: ExportFormat) => {
    setIsExportMenuOpen(false);
    const filename = "glass-document";
    if (format === ExportFormat.HTML) await downloadHtml(markdown, filename);
    else if (format === ExportFormat.IMAGE && previewRef.current) await downloadImage(previewRef.current, filename);
    else if (format === ExportFormat.PDF && previewRef.current) await downloadPdf(previewRef.current, filename);
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };

  const scrollToHeader = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col h-screen text-white overflow-hidden relative selection:bg-pink-500 selection:text-white">
      {/* Background Elements - Stronger Gradient for visible Glass Effect */}
      <div 
        className="fixed inset-0 -z-20 bg-cover bg-center"
        style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')`,
        }}
      />
      <div className="fixed inset-0 bg-black/40 -z-10 backdrop-blur-[1px]"></div>

      {/* Header */}
      <header className="h-16 border-b border-white/10 bg-black/10 backdrop-blur-xl flex items-center justify-between px-4 lg:px-6 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <LayoutTemplate className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-lg tracking-tight hidden sm:block text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80 shadow-black drop-shadow-sm">
            Free Markdown <span className="font-light">Editor</span>
          </h1>
        </div>

        {/* Toolbar */}
        <div className="hidden md:flex items-center gap-3">
          {/* TOC Toggle */}
          <button 
            onClick={() => setShowToc(!showToc)}
            className={`p-2 rounded-lg transition-all ${showToc ? 'bg-white/20 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)]' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
            title="Toggle Table of Contents"
          >
            <List size={18} />
          </button>

          <div className="w-px h-6 bg-white/20"></div>

          {/* View Modes */}
          <div className="bg-black/20 backdrop-blur-md p-1 rounded-lg flex gap-1 border border-white/10 shadow-inner">
            {[
              { mode: ViewMode.EDITOR, icon: FileCode, title: "Editor" },
              { mode: ViewMode.SPLIT, icon: Split, title: "Split" },
              { mode: ViewMode.PREVIEW, icon: Eye, title: "Preview" }
            ].map((item) => (
              <button 
                key={item.mode}
                onClick={() => setViewMode(item.mode)}
                className={`p-1.5 rounded-md transition-all ${viewMode === item.mode ? 'bg-white/20 text-white shadow-sm ring-1 ring-white/10' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                title={item.title}
              >
                <item.icon size={16} />
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-white/20"></div>

          {/* Fullscreen */}
          <button 
            onClick={toggleFullScreen}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            title="Toggle Fullscreen"
          >
            {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>

          {/* Export */}
          <div className="relative" ref={exportRef}>
            <button 
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg transition-all text-sm font-medium backdrop-blur-md shadow-sm"
            >
              <FileDown className="w-4 h-4" />
              <span>Export</span>
            </button>
             {isExportMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-gray-900/80 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 backdrop-blur-2xl ring-1 ring-white/10">
                <button onClick={() => handleExport(ExportFormat.HTML)} className="w-full text-left px-4 py-2.5 hover:bg-white/10 text-sm flex items-center gap-3 text-gray-200 border-b border-white/5">
                  <FileType className="w-4 h-4 text-orange-400" /> HTML
                </button>
                <button onClick={() => handleExport(ExportFormat.PDF)} className="w-full text-left px-4 py-2.5 hover:bg-white/10 text-sm flex items-center gap-3 text-gray-200 border-b border-white/5">
                  <FileDown className="w-4 h-4 text-red-400" /> PDF
                </button>
                <button onClick={() => handleExport(ExportFormat.IMAGE)} className="w-full text-left px-4 py-2.5 hover:bg-white/10 text-sm flex items-center gap-3 text-gray-200">
                  <FileImage className="w-4 h-4 text-green-400" /> Image (PNG)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2 text-white/70" onClick={() => setShowMobileMenu(!showMobileMenu)}>
          {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-gray-900/95 backdrop-blur-xl border-b border-white/10 z-30 p-4 shadow-xl flex flex-col gap-4">
          <div className="flex gap-2 justify-center bg-white/5 p-1 rounded-lg">
             {[ViewMode.EDITOR, ViewMode.PREVIEW].map(m => (
               <button key={m} onClick={() => { setViewMode(m); setShowMobileMenu(false); }} className={`flex-1 p-2 rounded text-center text-sm ${viewMode === m ? 'bg-white/20 text-white' : 'text-gray-400'}`}>{m}</button>
             ))}
          </div>
           <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
              <span className="text-xs text-gray-500 font-semibold uppercase">Export As</span>
              <button onClick={() => handleExport(ExportFormat.PDF)} className="w-full p-3 text-left bg-white/5 rounded-lg text-sm">Download PDF</button>
           </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {/* Table of Contents Sidebar */}
        {showToc && (
          <aside className="w-64 hidden md:flex flex-col border-r border-white/10 bg-black/20 backdrop-blur-md transition-all duration-300">
            <div className="p-4 border-b border-white/5">
              <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider flex items-center gap-2">
                <List size={14} />
                Table of Contents
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {headers.length === 0 ? (
                <p className="text-white/40 text-sm italic">Add headings (#) to see them here.</p>
              ) : (
                <ul className="space-y-2">
                  {headers.map((header, index) => (
                    <li key={index} style={{ paddingLeft: `${(header.level - 1) * 12}px` }}>
                      <button 
                        onClick={() => scrollToHeader(header.id)}
                        className="text-left text-sm text-white/70 hover:text-white transition-colors truncate w-full py-1 block border-l-2 border-transparent hover:border-pink-500/70 pl-2"
                      >
                        {header.text}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        )}

        {/* Editor Pane */}
        <div className={`
          flex-1 h-full bg-black/10 transition-all duration-300 flex flex-col backdrop-blur-[2px]
          ${viewMode === ViewMode.PREVIEW ? 'hidden' : 'block'}
          ${viewMode === ViewMode.SPLIT ? 'w-1/2 border-r border-white/10' : 'w-full'}
        `}>
          <Editor value={markdown} onChange={setMarkdown} />
        </div>

        {/* Preview Pane */}
        <div className={`
          flex-1 h-full bg-white/80 transition-all duration-300 relative backdrop-blur-xl
          ${viewMode === ViewMode.EDITOR ? 'hidden' : 'block'}
          ${viewMode === ViewMode.SPLIT ? 'w-1/2' : 'w-full'}
        `}>
          <Preview content={markdown} ref={previewRef} />
        </div>
      </main>
    </div>
  );
};

export default App;