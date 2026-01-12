import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { 
  Bold, Italic, Heading, Underline, Strikethrough, 
  Quote, List, ListOrdered, Link, Image as ImageIcon, Code, 
  Table, RotateCcw, Trash2, Smile, Upload, X, ChevronDown
} from 'lucide-react';
import { Theme } from '../types';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  theme: Theme;
  onScroll?: (e: React.UIEvent<HTMLTextAreaElement>) => void;
}

const COMMON_EMOJIS = [
  '✨', '🛠️', '💡', '🚀', '📝', '🐛', '📦', '🎉', 
  '🎨', '⚡', '🔥', '✅', '❌', '⚠️', 'ℹ️', '🛑',
  '📅', '📊', '🔒', '🔔'
];

const LANGUAGES = [
  { name: 'JavaScript', val: 'javascript' },
  { name: 'TypeScript', val: 'typescript' },
  { name: 'HTML', val: 'html' },
  { name: 'CSS', val: 'css' },
  { name: 'Python', val: 'python' },
  { name: 'Java', val: 'java' },
  { name: 'C++', val: 'cpp' },
  { name: 'SQL', val: 'sql' },
  { name: 'JSON', val: 'json' },
  { name: 'Bash', val: 'bash' },
  { name: 'Text', val: 'text' }
];

const Editor = forwardRef<HTMLTextAreaElement, EditorProps>(({ value, onChange, theme, onScroll }, ref) => {
  // Internal ref to manipulate the textarea
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Expose the internal ref to the parent via the forwarded ref
  useImperativeHandle(ref, () => internalRef.current as HTMLTextAreaElement);
  
  // UI States
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showHeadingDropdown, setShowHeadingDropdown] = useState(false);
  const [showCodeDropdown, setShowCodeDropdown] = useState(false);
  
  // Modal States
  const [activeModal, setActiveModal] = useState<'image' | 'link' | null>(null);
  const [modalData, setModalData] = useState({ url: '', text: '', link: '' });

  const emojiBtnRef = useRef<HTMLDivElement>(null);
  const headingBtnRef = useRef<HTMLDivElement>(null);
  const codeBtnRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiBtnRef.current && !emojiBtnRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
      if (headingBtnRef.current && !headingBtnRef.current.contains(event.target as Node)) {
        setShowHeadingDropdown(false);
      }
      if (codeBtnRef.current && !codeBtnRef.current.contains(event.target as Node)) {
        setShowCodeDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const insertText = (before: string, after: string = '') => {
    const textarea = internalRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    // Reset modal states
    setActiveModal(null);
    setModalData({ url: '', text: '', link: '' });
    setShowEmojiPicker(false);
    setShowHeadingDropdown(false);
    setShowCodeDropdown(false);

    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length + after.length;
      if (start === end) {
         const middlePos = start + before.length;
         textarea.setSelectionRange(middlePos, middlePos);
      } else {
         textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // Requirement 4: Fixed List Functionality for multiple lines
  const insertList = (prefix: string, isOrdered: boolean) => {
    const textarea = internalRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    // Find the start and end of the lines containing the selection
    const textBefore = value.substring(0, start);
    const textAfter = value.substring(end);
    
    const lineStart = textBefore.lastIndexOf('\n') + 1;
    const lineEnd = textAfter.indexOf('\n') === -1 ? value.length : end + textAfter.indexOf('\n');
    
    const selectedBlock = value.substring(lineStart, lineEnd);
    const lines = selectedBlock.split('\n');
    
    const newLines = lines.map((line, index) => {
      // Remove existing list markers if present to avoid double bulleting
      const cleanLine = line.replace(/^(\d+\.|-|\*)\s+/, '');
      const currentPrefix = isOrdered ? `${index + 1}. ` : prefix;
      return `${currentPrefix}${cleanLine}`;
    });
    
    const newBlock = newLines.join('\n');
    const newValue = value.substring(0, lineStart) + newBlock + value.substring(lineEnd);
    
    onChange(newValue);
    setTimeout(() => {
      textarea.focus();
      // Set cursor to end of modified block
      textarea.setSelectionRange(lineStart + newBlock.length, lineStart + newBlock.length);
    }, 0);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Error: Please select a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const base64 = event.target.result as string;
        // Auto-fill the URL field in the modal
        setModalData(prev => ({ ...prev, url: base64, text: file.name }));
      }
    };
    reader.onerror = () => alert("Failed to read file.");
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset
  };

  const confirmModal = () => {
    if (activeModal === 'image') {
      // Logic for Image: ![Alt](Url) or [![Alt](Url)](Link)
      const alt = modalData.text;
      const url = modalData.url;
      const link = modalData.link;
      
      if (!url) {
        alert("Please enter an image URL.");
        return;
      }

      const imgTag = `![${alt}](${url})`;
      if (link) {
        insertText(`[${imgTag}](${link})`);
      } else {
        insertText(imgTag);
      }
    } else if (activeModal === 'link') {
      // Requirement 6: Link Modal Logic
      const url = modalData.url; // Reusing url field for link address
      const text = modalData.text; // Reusing text field for link text
      
      if (!url) {
        alert("Please enter a link URL.");
        return;
      }
      insertText(`[${text || 'Link'}](${url})`);
    }
    setActiveModal(null);
  };

  // Helper styles based on theme
  const getStyles = () => {
    switch(theme) {
      case Theme.LIGHT:
        return {
          toolbarBg: 'bg-white border-b border-gray-200',
          icon: 'text-gray-500 hover:text-gray-900 hover:bg-gray-100',
          text: 'text-gray-900 placeholder-gray-400',
          pickerBg: 'bg-white border-gray-200 shadow-xl',
          modalBg: 'bg-white text-gray-800 border-gray-200',
          inputBg: 'bg-white border-gray-300 focus:border-blue-500 text-gray-800',
          dropdownItem: 'hover:bg-gray-100 text-gray-700'
        };
      case Theme.DARK:
        return {
          toolbarBg: 'bg-gray-900 border-b border-gray-800',
          icon: 'text-gray-400 hover:text-white hover:bg-gray-800',
          text: 'text-gray-100 placeholder-gray-600',
          pickerBg: 'bg-gray-800 border-gray-700 shadow-xl',
          modalBg: 'bg-gray-800 text-gray-100 border-gray-700',
          inputBg: 'bg-gray-900 border-gray-600 focus:border-blue-500 text-gray-100',
          dropdownItem: 'hover:bg-gray-700 text-gray-200'
        };
      case Theme.GLASS:
      default:
        return {
          toolbarBg: 'bg-black/20 border-b border-white/10 backdrop-blur-xl',
          icon: 'text-gray-300 hover:text-white hover:bg-white/10',
          text: 'text-gray-100 placeholder-white/30',
          pickerBg: 'bg-gray-900/90 border-white/20 backdrop-blur-2xl',
          modalBg: 'bg-gray-900/95 backdrop-blur-xl text-white border-white/10',
          inputBg: 'bg-black/30 border-white/20 focus:border-white/50 text-white',
          dropdownItem: 'hover:bg-white/10 text-white'
        };
    }
  };
  
  const s = getStyles();

  const handleToolbarClick = (action: string) => {
    switch (action) {
      case 'bold': insertText('**', '**'); break;
      case 'italic': insertText('*', '*'); break;
      case 'underline': insertText('<u>', '</u>'); break;
      case 'strikethrough': insertText('~~', '~~'); break;
      case 'quote': insertText('> '); break;
      case 'ul': insertList('- ', false); break;
      case 'ol': insertList('1. ', true); break;
      case 'link': 
        // Pre-fill if text selected
        const start = internalRef.current?.selectionStart || 0;
        const end = internalRef.current?.selectionEnd || 0;
        const selected = value.substring(start, end);
        setModalData({ url: '', text: selected, link: '' });
        setActiveModal('link'); 
        break;
      case 'image': 
        setActiveModal('image'); 
        break;
      case 'table': 
        insertText(
          '| Header 1 | Header 2 |\n| :--- | :--- |\n| Cell 1 | Cell 2 |\n'
        ); 
        break;
      case 'clear': onChange(''); break;
      case 'reset': onChange(value); break;
    }
  };

  const ToolbarBtn = ({ icon: Icon, action, title, onClick }: { icon: any, action?: string, title: string, onClick?: () => void }) => (
    <button
      onClick={onClick || (() => action && handleToolbarClick(action))}
      className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${s.icon}`}
      title={title}
      type="button"
    >
      <Icon size={16} />
    </button>
  );

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Hidden File Input for Modal */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        style={{display: 'none'}}
        accept="image/*"
        onChange={handleFileUpload} 
      />

      {/* Toolbar */}
      <div className={`flex items-center gap-1 p-2 overflow-visible flex-wrap z-10 transition-colors duration-300 ${s.toolbarBg}`}>
        <ToolbarBtn icon={Bold} action="bold" title="Bold" />
        <ToolbarBtn icon={Italic} action="italic" title="Italic" />
        
        {/* Heading Dropdown */}
        <div className="relative" ref={headingBtnRef}>
            <button 
                onClick={() => setShowHeadingDropdown(!showHeadingDropdown)}
                className={`p-1.5 rounded-lg transition-colors flex items-center gap-0.5 ${s.icon} ${showHeadingDropdown ? 'bg-white/10 text-blue-400' : ''}`}
                title="Headings"
            >
                <Heading size={16} />
                <ChevronDown size={10} />
            </button>
            {showHeadingDropdown && (
                <div className={`absolute top-full left-0 mt-2 w-32 rounded-xl py-1 z-50 shadow-xl border ${theme === Theme.LIGHT ? 'border-gray-200' : 'border-white/10'} ${s.pickerBg}`}>
                    {[1, 2, 3, 4, 5, 6].map(level => (
                        <button
                            key={level}
                            onClick={() => insertText('#'.repeat(level) + ' ')}
                            className={`w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 ${s.dropdownItem}`}
                        >
                            <span className="font-bold opacity-50">H{level}</span> Heading {level}
                        </button>
                    ))}
                </div>
            )}
        </div>

        <div className="w-px h-4 bg-gray-500/20 mx-1" />
        <ToolbarBtn icon={Underline} action="underline" title="Underline" />
        <ToolbarBtn icon={Strikethrough} action="strikethrough" title="Strikethrough" />
        <div className="w-px h-4 bg-gray-500/20 mx-1" />
        <ToolbarBtn icon={Quote} action="quote" title="Quote" />
        <ToolbarBtn icon={ListOrdered} action="ol" title="Ordered List" />
        <ToolbarBtn icon={List} action="ul" title="Unordered List" />
        <div className="w-px h-4 bg-gray-500/20 mx-1" />
        <ToolbarBtn icon={Link} action="link" title="Insert Link" />
        <ToolbarBtn icon={ImageIcon} action="image" title="Insert Image" />

        {/* Code Dropdown (Requirement 2) */}
        <div className="relative" ref={codeBtnRef}>
            <button 
                onClick={() => setShowCodeDropdown(!showCodeDropdown)}
                className={`p-1.5 rounded-lg transition-colors flex items-center gap-0.5 ${s.icon} ${showCodeDropdown ? 'bg-white/10 text-blue-400' : ''}`}
                title="Insert Code Block"
            >
                <Code size={16} />
                <ChevronDown size={10} />
            </button>
            {showCodeDropdown && (
                <div className={`absolute top-full left-0 mt-2 w-36 rounded-xl py-1 z-50 shadow-xl border max-h-60 overflow-y-auto custom-scrollbar ${theme === Theme.LIGHT ? 'border-gray-200' : 'border-white/10'} ${s.pickerBg}`}>
                    {LANGUAGES.map(lang => (
                        <button
                            key={lang.val}
                            onClick={() => insertText(`\`\`\`${lang.val}\n`, '\n\`\`\`')}
                            className={`w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 ${s.dropdownItem}`}
                        >
                            {lang.name}
                        </button>
                    ))}
                </div>
            )}
        </div>

        <ToolbarBtn icon={Table} action="table" title="Table" />
        
        {/* Emoji Picker */}
        <div className="relative ml-1" ref={emojiBtnRef}>
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-1.5 rounded-lg transition-colors ${showEmojiPicker ? 'text-blue-500' : s.icon}`}
            title="Insert Icon/Emoji"
          >
            <Smile size={16} />
          </button>
          
          {showEmojiPicker && (
            <div className={`absolute top-full left-0 mt-2 w-64 border rounded-xl p-2 grid grid-cols-5 gap-1 animate-in fade-in zoom-in-95 duration-100 z-50 ${s.pickerBg}`}>
              {COMMON_EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => insertText(emoji)}
                  className="p-2 hover:bg-white/10 rounded text-lg flex items-center justify-center transition-colors hover:scale-110"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1" />
        <ToolbarBtn icon={RotateCcw} action="reset" title="Undo (Soft)" />
        <ToolbarBtn icon={Trash2} action="clear" title="Clear All" />
      </div>

      {/* Modal for Image/Link */}
      {activeModal && (
        <div className="absolute inset-0 z-50 flex items-start justify-center pt-20 bg-black/50 backdrop-blur-sm">
            <div className={`w-96 p-6 rounded-lg shadow-2xl border flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 ${s.modalBg}`}>
                <div className="flex justify-between items-center border-b border-gray-500/20 pb-2">
                    <h3 className="font-semibold text-lg">
                        {activeModal === 'image' ? 'Add Image' : 'Add Link'}
                    </h3>
                    <button onClick={() => setActiveModal(null)} className="opacity-60 hover:opacity-100"><X size={18} /></button>
                </div>
                
                {/* Inputs */}
                <div className="flex flex-col gap-3">
                    {/* URL Input */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs opacity-70 uppercase font-semibold">
                            {activeModal === 'image' ? 'Image Address' : 'Link Address'}
                        </label>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                className={`flex-1 p-2 rounded text-sm outline-none border transition-colors ${s.inputBg}`}
                                placeholder={activeModal === 'image' ? "https://..." : "https://..."}
                                value={modalData.url}
                                onChange={(e) => setModalData({...modalData, url: e.target.value})}
                            />
                            {/* Upload Button for Images */}
                            {activeModal === 'image' && (
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`p-2 rounded border border-gray-500/30 hover:bg-gray-500/10 transition-colors`}
                                    title="Upload Local Image"
                                >
                                    <Upload size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Text/Alt Input */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs opacity-70 uppercase font-semibold">
                            {activeModal === 'image' ? 'Image Description (Alt)' : 'Link Text'}
                        </label>
                        <input 
                            type="text" 
                            className={`w-full p-2 rounded text-sm outline-none border transition-colors ${s.inputBg}`}
                            placeholder="Description..."
                            value={modalData.text}
                            onChange={(e) => setModalData({...modalData, text: e.target.value})}
                        />
                    </div>

                    {/* Link Wrapper (Only for Images) */}
                    {activeModal === 'image' && (
                        <div className="flex flex-col gap-1">
                            <label className="text-xs opacity-70 uppercase font-semibold">Image Link (Optional)</label>
                            <input 
                                type="text" 
                                className={`w-full p-2 rounded text-sm outline-none border transition-colors ${s.inputBg}`}
                                placeholder="http://..."
                                value={modalData.link}
                                onChange={(e) => setModalData({...modalData, link: e.target.value})}
                            />
                        </div>
                    )}
                </div>

                <div className="flex gap-2 justify-end pt-2">
                    <button 
                        onClick={() => setActiveModal(null)}
                        className={`px-4 py-1.5 rounded text-sm hover:bg-gray-500/10 transition-colors border border-gray-500/20`}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={confirmModal}
                        className={`px-4 py-1.5 rounded text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-colors font-medium`}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Editor Area */}
      <div className="flex-1 relative group">
        <textarea
          ref={internalRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={onScroll}
          className={`w-full h-full p-6 bg-transparent resize-none focus:outline-none leading-relaxed font-mono text-sm custom-scrollbar z-0 transition-colors duration-300 ${s.text}`}
          placeholder="# Start typing your masterpiece..."
          spellCheck={false}
        />
      </div>
    </div>
  );
});

Editor.displayName = 'Editor';
export default Editor;