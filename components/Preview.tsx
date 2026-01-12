import React, { forwardRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Theme } from '../types';

interface PreviewProps {
  content: string;
  theme: Theme;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

// Helper to generate IDs from text (Unicode friendly)
const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-'); // Simple slugify to preserve unicode/chinese characters
};

const Preview = forwardRef<HTMLDivElement, PreviewProps>(({ content, theme, onScroll }, ref) => {
  // Since we force Theme.LIGHT in App.tsx for Preview, isDark will always be false unless we change App.tsx
  // But keeping logic generic is fine.
  const isDark = theme === Theme.DARK;

  return (
    <div 
      ref={ref} 
      onScroll={onScroll}
      id="markdown-preview"
      className={`h-full w-full p-8 overflow-y-auto prose max-w-none shadow-inner transition-colors duration-300 ${isDark ? 'prose-invert' : 'prose-slate'} ${theme === Theme.GLASS ? 'bg-white/70 backdrop-blur-md' : 'bg-transparent'}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Header renderers with explicit styling for visual hierarchy
          h1: ({children}) => <h1 id={slugify(String(children))} className="scroll-mt-20 text-4xl font-bold mb-6 pb-2 border-b border-gray-200">{children}</h1>,
          h2: ({children}) => <h2 id={slugify(String(children))} className="scroll-mt-20 text-3xl font-bold mb-5 pb-1 border-b border-gray-100">{children}</h2>,
          h3: ({children}) => <h3 id={slugify(String(children))} className="scroll-mt-20 text-2xl font-bold mb-4">{children}</h3>,
          h4: ({children}) => <h4 id={slugify(String(children))} className="scroll-mt-20 text-xl font-bold mb-3">{children}</h4>,
          h5: ({children}) => <h5 id={slugify(String(children))} className="scroll-mt-20 text-lg font-bold mb-2">{children}</h5>,
          h6: ({children}) => <h6 id={slugify(String(children))} className="scroll-mt-20 text-base font-bold mb-2 uppercase text-gray-500 tracking-wide">{children}</h6>,
          
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                {...props}
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                customStyle={{ margin: '1em 0', borderRadius: '0.5rem' }}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code {...props} className={`${className} ${isDark ? 'bg-gray-800 text-pink-400' : 'bg-gray-100 text-pink-600'} rounded px-1.5 py-0.5 font-mono text-sm border border-gray-200`}>
                {children}
              </code>
            );
          },
          table: ({ children }) => <div className={`overflow-x-auto my-6 rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-300'}`}><table className={`min-w-full divide-y ${isDark ? 'divide-gray-700 text-gray-200' : 'divide-gray-300 text-gray-900'}`}>{children}</table></div>,
          thead: ({ children }) => <thead className={isDark ? 'bg-gray-800' : 'bg-gray-100'}>{children}</thead>,
          th: ({ children }) => <th className={`p-3 font-semibold text-left text-sm uppercase tracking-wider ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{children}</th>,
          td: ({ children }) => <td className={`p-3 text-left border-t ${isDark ? 'text-gray-300 border-gray-700' : 'text-gray-700 border-gray-200'}`}>{children}</td>,
          blockquote: ({ children }) => <blockquote className={`border-l-4 border-blue-500 pl-4 py-1 italic my-4 rounded-r ${isDark ? 'text-gray-400 bg-blue-900/20' : 'text-gray-600 bg-blue-50'}`}>{children}</blockquote>,
          a: ({ href, children }) => <a href={href} className="text-blue-600 hover:text-blue-800 underline decoration-blue-300 decoration-2 underline-offset-2 transition-colors" target="_blank" rel="noopener noreferrer">{children}</a>
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

Preview.displayName = 'Preview';
export default Preview;