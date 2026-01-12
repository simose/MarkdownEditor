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

// Helper to generate IDs from text
const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

const Preview = forwardRef<HTMLDivElement, PreviewProps>(({ content, theme, onScroll }, ref) => {
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
          // Header renderers to add IDs for TOC
          h1: ({children}) => <h1 id={slugify(String(children))} className="scroll-mt-20">{children}</h1>,
          h2: ({children}) => <h2 id={slugify(String(children))} className={`scroll-mt-20 border-b pb-2 ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>{children}</h2>,
          h3: ({children}) => <h3 id={slugify(String(children))} className="scroll-mt-20">{children}</h3>,
          
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
              <code {...props} className={`${className} ${isDark ? 'bg-gray-800 text-pink-400' : 'bg-gray-200 text-pink-600'} rounded px-1.5 py-0.5 font-mono text-sm`}>
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