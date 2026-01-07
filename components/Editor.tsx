import React, { useRef, useState, useEffect } from 'react';
import { 
  Bold, Italic, Heading, Underline, Strikethrough, 
  Quote, List, ListOrdered, Link, Image, Code, 
  Table, RotateCcw, Trash2, Smile
} from 'lucide-react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

const COMMON_EMOJIS = [
  '✨', '🛠️', '💡', '🚀', '📝', '🐛', '📦', '🎉', 
  '🎨', '⚡', '🔥', '✅', '❌', '⚠️', 'ℹ️', '🛑',
  '📅', '📊', '🔒', '🔔'
];

const Editor: React.FC<EditorProps> = ({ value, onChange }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiBtnRef = useRef<HTMLDivElement>(null);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiBtnRef.current && !emojiBtnRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    setShowEmojiPicker(false);

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

  const handleToolbarClick = (action: string) => {
    switch (action) {
      case 'bold': insertText('**', '**'); break;
      case 'italic': insertText('*', '*'); break;
      case 'heading': insertText('### '); break;
      case 'underline': insertText('<u>', '</u>'); break;
      case 'strikethrough': insertText('~~', '~~'); break;
      case 'quote': insertText('> '); break;
      case 'ul': insertText('- '); break;
      case 'ol': insertText('1. '); break;
      case 'link': insertText('[', '](url)'); break;
      case 'image': insertText('![alt text](', ')'); break;
      case 'code': insertText('```\n', '\n```'); break;
      case 'table': 
        insertText(
          '| Header 1 | Header 2 |\n| :--- | :--- |\n| Cell 1 | Cell 2 |\n'
        ); 
        break;
      case 'clear': onChange(''); break;
      case 'reset': onChange(value); break;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newValue = value.substring(0, start) + "  " + value.substring(end);
      onChange(newValue);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const ToolbarBtn = ({ icon: Icon, action, title }: { icon: any, action: string, title: string }) => (
    <button
      onClick={() => handleToolbarClick(action)}
      className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
      title={title}
    >
      <Icon size={16} />
    </button>
  );

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-white/10 bg-black/20 overflow-visible flex-wrap backdrop-blur-xl z-10">
        <ToolbarBtn icon={Bold} action="bold" title="Bold" />
        <ToolbarBtn icon={Italic} action="italic" title="Italic" />
        <ToolbarBtn icon={Heading} action="heading" title="Heading" />
        <div className="w-px h-4 bg-white/20 mx-1" />
        <ToolbarBtn icon={Underline} action="underline" title="Underline" />
        <ToolbarBtn icon={Strikethrough} action="strikethrough" title="Strikethrough" />
        <div className="w-px h-4 bg-white/20 mx-1" />
        <ToolbarBtn icon={Quote} action="quote" title="Quote" />
        <ToolbarBtn icon={ListOrdered} action="ol" title="Ordered List" />
        <ToolbarBtn icon={List} action="ul" title="Unordered List" />
        <div className="w-px h-4 bg-white/20 mx-1" />
        <ToolbarBtn icon={Link} action="link" title="Link" />
        <ToolbarBtn icon={Image} action="image" title="Image" />
        <ToolbarBtn icon={Code} action="code" title="Code Block" />
        <ToolbarBtn icon={Table} action="table" title="Table" />
        
        {/* Emoji Picker */}
        <div className="relative ml-1" ref={emojiBtnRef}>
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-1.5 rounded-lg transition-colors ${showEmojiPicker ? 'bg-white/20 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
            title="Insert Icon/Emoji"
          >
            <Smile size={16} />
          </button>
          
          {showEmojiPicker && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-gray-900/90 border border-white/20 rounded-xl p-2 grid grid-cols-5 gap-1 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-100 z-50">
              {COMMON_EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => insertText(emoji)}
                  className="p-2 hover:bg-white/10 rounded text-lg flex items-center justify-center transition-colors"
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

      {/* Editor Area */}
      <div className="flex-1 relative group">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full h-full p-6 bg-transparent text-gray-100 resize-none focus:outline-none leading-relaxed placeholder-white/30 font-mono text-sm custom-scrollbar z-0"
          placeholder="# Start typing your masterpiece..."
          spellCheck={false}
        />
      </div>
    </div>
  );
};

export default Editor;