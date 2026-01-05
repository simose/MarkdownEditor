import React, { useRef } from 'react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const Editor: React.FC<EditorProps> = ({ value, onChange, disabled }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      
      const newValue = value.substring(0, start) + "  " + value.substring(end);
      onChange(newValue);
      
      // Need to defer setting selection range to after render
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  return (
    <div className="h-full w-full bg-gray-950 font-mono text-sm relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="w-full h-full p-4 bg-transparent text-gray-200 resize-none focus:outline-none leading-relaxed placeholder-gray-700"
        placeholder="# Start typing your masterpiece..."
        spellCheck={false}
      />
    </div>
  );
};

export default Editor;