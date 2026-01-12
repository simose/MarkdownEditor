import React, { useState, useRef, useEffect } from 'react';
import { 
  FileDown, FileImage, FileType, Split, Eye, 
  FileCode, Menu, X, LayoutTemplate, Maximize2, Minimize2,
  List, Palette, Moon, Sun, Sparkles
} from 'lucide-react';
import Editor from './components/Editor';
import Preview from './components/Preview';
import { ViewMode, ExportFormat, Theme } from './types';
import { downloadHtml, downloadImage, downloadPdf } from './utils/exportHelper';

const DEFAULT_MARKDOWN = `# Welcome to Gemini Markdown Studio

This is a **feature-rich** editor supporting multiple themes.

## Themes Available
- ☀️ **Light**: Clean and professional
- 🌙 **Dark**: Easy on the eyes
- ✨ **Glass**: Modern aesthetic

## Styling Examples

| Element | Style |
| :--- | :--- |
| **Bold** | Strong emphasis |
| *Italic* | Subtle emphasis |
| \`Code\` | Inline code |

### Code Block
\`\`\`javascript
function hello() {
  console.log("Hello World");
}
\`\`\`
`;

const App: React.FC = () => {
  const [markdown, setMarkdown] = useState<string>(DEFAULT_MARKDOWN);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.SPLIT);
  const [theme, setTheme] = useState<Theme>(Theme.GLASS);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showToc, setShowToc] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [headers, setHeaders] = useState<{ id: string, text: string, level: number }[]>([]);

  // Refs for sync scrolling
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef<'editor' | 'preview' | null>(null);

  const exportRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

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

  // Handle click outside for menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Requirement 1: Sync Scroll Logic
  const handleScroll = (source: 'editor' | 'preview') => {
    const editor = editorRef.current;
    const preview = previewRef.current;

    if (!editor || !preview) return;

    // Prevent loop: if we are scrolling triggered by the other pane, don't trigger back
    if (isScrollingRef.current && isScrollingRef.current !== source) return;

    isScrollingRef.current = source;
    
    // Clear lock after a small timeout
    // Using a timeout is necessary because scroll events fire rapidly
    if ((window as any).scrollTimeout) clearTimeout((window as any).scrollTimeout);
    (window as any).scrollTimeout = setTimeout(() => {
      isScrollingRef.current = null;
    }, 100);

    if (source === 'editor') {
      const percentage = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
      const targetScrollTop = percentage * (preview.scrollHeight - preview.clientHeight);
      preview.scrollTop = targetScrollTop;
    } else {
      const percentage = preview.scrollTop / (preview.scrollHeight - preview.clientHeight);
      const targetScrollTop = percentage * (editor.scrollHeight - editor.clientHeight);
      editor.scrollTop = targetScrollTop;
    }
  };

  const handleExport = async (format: ExportFormat) => {
    setIsExportMenuOpen(false);
    const filename = "document";
    try {
      if (format === ExportFormat.HTML) await downloadHtml(markdown, filename);
      else if (format === ExportFormat.IMAGE && previewRef.current) await downloadImage(previewRef.current, filename);
      else if (format === ExportFormat.PDF && previewRef.current) await downloadPdf(previewRef.current, filename);
    } catch (e: any) {
      alert(`Export failed: ${e.message}`);
    }
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

  // --- Theme Styles Configuration ---
  const getThemeStyles = () => {
    switch (theme) {
      case Theme.LIGHT:
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-900',
          border: 'border-gray-200',
          headerBg: 'bg-white border-b border-gray-200',
          toolbarBg: 'bg-white border-b border-gray-200',
          sidebarBg: 'bg-white border-r border-gray-200 shadow-[4px_0_24px_rgba(0,0,0,0.02)]', 
          editorBg: 'bg-white',
          previewBg: 'bg-white',
          itemHover: 'hover:bg-gray-100',
          iconColor: 'text-gray-600',
          activeItem: 'bg-gray-200 text-gray-900',
          buttonPrimary: 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700',
          dropdownBg: 'bg-white border border-gray-200 shadow-xl',
          tocText: 'text-gray-600 hover:text-gray-900',
          tocHover: 'hover:border-blue-500/50',
          titleGradient: 'text-gray-800'
        };
      case Theme.DARK:
        return {
          bg: 'bg-gray-950',
          text: 'text-gray-100',
          border: 'border-gray-800',
          headerBg: 'bg-gray-900 border-b border-gray-800',
          toolbarBg: 'bg-gray-900 border-b border-gray-800',
          sidebarBg: 'bg-gray-900 border-r border-gray-800', 
          editorBg: 'bg-gray-950',
          previewBg: 'bg-gray-900',
          itemHover: 'hover:bg-gray-800',
          iconColor: 'text-gray-400',
          activeItem: 'bg-gray-800 text-white',
          buttonPrimary: 'bg-gray-800 border border-gray-700 hover:bg-gray-700 text-gray-200',
          dropdownBg: 'bg-gray-900 border border-gray-700 shadow-xl',
          tocText: 'text-gray-400 hover:text-white',
          tocHover: 'hover:border-blue-500/50',
          titleGradient: 'text-white'
        };
      case Theme.GLASS:
      default:
        return {
          bg: 'bg-transparent', // Uses background image
          text: 'text-white',
          border: 'border-white/10',
          headerBg: 'bg-black/10 backdrop-blur-xl border-b border-white/10',
          toolbarBg: 'bg-black/20 backdrop-blur-xl border-b border-white/10',
          sidebarBg: 'bg-black/20 backdrop-blur-md border-r border-white/10',
          editorBg: 'bg-black/10 backdrop-blur-[2px]',
          previewBg: 'bg-white/80 backdrop-blur-xl',
          itemHover: 'hover:bg-white/10',
          iconColor: 'text-white/70',
          activeItem: 'bg-white/20 text-white shadow-sm ring-1 ring-white/10',
          buttonPrimary: 'bg-white/10 border border-white/20 hover:bg-white/20 text-white backdrop-blur-md',
          dropdownBg: 'bg-gray-900/80 backdrop-blur-2xl border border-white/10 shadow-2xl',
          tocText: 'text-white/70 hover:text-white',
          tocHover: 'hover:border-pink-500/70',
          titleGradient: 'text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80'
        };
    }
  };

  const s = getThemeStyles();

  return (
    <div className={`flex flex-col h-screen overflow-hidden relative selection:bg-blue-500/30 selection:text-current ${s.bg} ${s.text}`}>
      
      {/* Background for Glass Theme */}
      {theme === Theme.GLASS && (
        <>
          <div 
            className="fixed inset-0 -z-20 bg-cover bg-center transition-all duration-700"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')` }}
          />
          <div className="fixed inset-0 bg-black/40 -z-10 backdrop-blur-[1px]"></div>
        </>
      )}

      {/* Header */}
      <header className={`h-16 flex items-center justify-between px-4 lg:px-6 z-20 shadow-sm transition-colors duration-300 ${s.headerBg}`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${theme === Theme.LIGHT ? 'bg-blue-600 text-white' : 'bg-white/10 border border-white/20 text-white'}`}>
            <LayoutTemplate className="w-5 h-5" />
          </div>
          <h1 className={`font-bold text-lg tracking-tight hidden sm:block ${s.titleGradient}`}>
            Free Markdown <span className="font-light opacity-80">Editor</span>
          </h1>
        </div>

        {/* Toolbar */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Switcher */}
          <div className="relative" ref={themeRef}>
            <button 
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              className={`p-2 rounded-lg transition-all ${s.itemHover} ${s.iconColor}`}
              title="Change Theme"
            >
              <Palette size={18} />
            </button>
            {isThemeMenuOpen && (
              <div className={`absolute top-full right-0 mt-2 w-36 rounded-xl overflow-hidden z-50 py-1 ${s.dropdownBg}`}>
                <button onClick={() => { setTheme(Theme.LIGHT); setIsThemeMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${s.itemHover} ${theme === Theme.LIGHT ? 'text-blue-500 font-bold' : s.text}`}>
                  <Sun size={14} /> Light
                </button>
                <button onClick={() => { setTheme(Theme.DARK); setIsThemeMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${s.itemHover} ${theme === Theme.DARK ? 'text-blue-500 font-bold' : s.text}`}>
                  <Moon size={14} /> Dark
                </button>
                <button onClick={() => { setTheme(Theme.GLASS); setIsThemeMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${s.itemHover} ${theme === Theme.GLASS ? 'text-blue-500 font-bold' : s.text}`}>
                  <Sparkles size={14} /> Glass
                </button>
              </div>
            )}
          </div>

          <div className={`w-px h-6 opacity-20 ${theme === Theme.LIGHT ? 'bg-gray-900' : 'bg-white'}`}></div>

          {/* TOC Toggle */}
          <button 
            onClick={() => setShowToc(!showToc)}
            className={`p-2 rounded-lg transition-all ${showToc ? s.activeItem : `${s.iconColor} ${s.itemHover}`}`}
            title="Toggle Table of Contents"
          >
            <List size={18} />
          </button>

          {/* View Modes */}
          <div className={`p-1 rounded-lg flex gap-1 ${theme === Theme.GLASS ? 'bg-black/20 border border-white/10' : 'bg-gray-200/50 border border-transparent dark:bg-gray-800'}`}>
            {[
              { mode: ViewMode.EDITOR, icon: FileCode, title: "Editor" },
              { mode: ViewMode.SPLIT, icon: Split, title: "Split" },
              { mode: ViewMode.PREVIEW, icon: Eye, title: "Preview" }
            ].map((item) => (
              <button 
                key={item.mode}
                onClick={() => setViewMode(item.mode)}
                className={`p-1.5 rounded-md transition-all ${viewMode === item.mode ? s.activeItem : `${s.iconColor} ${s.itemHover}`}`}
                title={item.title}
              >
                <item.icon size={16} />
              </button>
            ))}
          </div>

          <div className={`w-px h-6 opacity-20 ${theme === Theme.LIGHT ? 'bg-gray-900' : 'bg-white'}`}></div>

          {/* Fullscreen */}
          <button 
            onClick={toggleFullScreen}
            className={`p-2 rounded-lg transition-all ${s.iconColor} ${s.itemHover}`}
            title="Toggle Fullscreen"
          >
            {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>

          {/* Export */}
          <div className="relative" ref={exportRef}>
            <button 
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm font-medium shadow-sm ${s.buttonPrimary}`}
            >
              <FileDown className="w-4 h-4" />
              <span>Export</span>
            </button>
             {isExportMenuOpen && (
              <div className={`absolute top-full right-0 mt-2 w-48 rounded-xl overflow-hidden z-50 py-1 ${s.dropdownBg}`}>
                <button onClick={() => handleExport(ExportFormat.HTML)} className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 border-b ${s.border} ${s.itemHover} ${s.text}`}>
                  <FileType className="w-4 h-4 text-orange-400" /> HTML
                </button>
                <button onClick={() => handleExport(ExportFormat.PDF)} className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 border-b ${s.border} ${s.itemHover} ${s.text}`}>
                  <FileDown className="w-4 h-4 text-red-400" /> PDF
                </button>
                <button onClick={() => handleExport(ExportFormat.IMAGE)} className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 ${s.itemHover} ${s.text}`}>
                  <FileImage className="w-4 h-4 text-green-400" /> Image (PNG)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button className={`md:hidden p-2 ${s.iconColor}`} onClick={() => setShowMobileMenu(!showMobileMenu)}>
          {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className={`md:hidden absolute top-16 left-0 w-full z-30 p-4 shadow-xl flex flex-col gap-4 ${s.headerBg}`}>
          <div className="flex gap-2 justify-center p-1 rounded-lg bg-black/5 dark:bg-white/5">
             {[ViewMode.EDITOR, ViewMode.PREVIEW].map(m => (
               <button key={m} onClick={() => { setViewMode(m); setShowMobileMenu(false); }} className={`flex-1 p-2 rounded text-center text-sm ${viewMode === m ? 'bg-blue-500 text-white' : s.text}`}>{m}</button>
             ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {/* Table of Contents Sidebar */}
        {showToc && (
          <aside className={`w-64 hidden md:flex flex-col transition-all duration-300 ${s.sidebarBg}`}>
            <div className={`p-4 border-b ${s.border}`}>
              <h2 className={`text-sm font-semibold uppercase tracking-wider flex items-center gap-2 ${s.iconColor}`}>
                <List size={14} />
                Table of Contents
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {headers.length === 0 ? (
                <p className={`text-sm italic opacity-50 ${s.text}`}>Add headings (#) to see them here.</p>
              ) : (
                <ul className="space-y-2">
                  {headers.map((header, index) => (
                    <li key={index} style={{ paddingLeft: `${(header.level - 1) * 12}px` }}>
                      <button 
                        onClick={() => scrollToHeader(header.id)}
                        className={`text-left text-sm transition-colors truncate w-full py-1 block border-l-2 border-transparent pl-2 ${s.tocText} ${s.tocHover}`}
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
          flex-1 h-full transition-all duration-300 flex flex-col
          ${viewMode === ViewMode.PREVIEW ? 'hidden' : 'block'}
          ${viewMode === ViewMode.SPLIT ? `w-1/2 border-r ${s.border}` : 'w-full'}
          ${s.editorBg}
        `}>
          <Editor 
            ref={editorRef} 
            value={markdown} 
            onChange={setMarkdown} 
            theme={theme} 
            onScroll={() => handleScroll('editor')}
          />
        </div>

        {/* Preview Pane */}
        <div className={`
          flex-1 h-full transition-all duration-300 relative
          ${viewMode === ViewMode.EDITOR ? 'hidden' : 'block'}
          ${viewMode === ViewMode.SPLIT ? 'w-1/2' : 'w-full'}
          ${s.previewBg}
        `}>
          <Preview 
            ref={previewRef} 
            content={markdown} 
            theme={theme} 
            onScroll={() => handleScroll('preview')}
          />
        </div>
      </main>
    </div>
  );
};

export default App;