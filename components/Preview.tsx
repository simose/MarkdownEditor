import React, { forwardRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface PreviewProps {
  content: string;
}

const Preview = forwardRef<HTMLDivElement, PreviewProps>(({ content }, ref) => {
  return (
    <div 
      ref={ref} 
      id="markdown-preview"
      className="h-full w-full bg-white text-gray-900 p-8 overflow-y-auto prose prose-slate max-w-none prose-pre:bg-gray-800 prose-pre:p-0"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                {...props}
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code {...props} className={`${className} bg-gray-200 text-red-500 rounded px-1 py-0.5`}>
                {children}
              </code>
            );
          },
          // Custom styles for specific elements to look better in export
          table: ({ children }) => <div className="overflow-x-auto my-4"><table className="min-w-full border-collapse border border-gray-300 text-gray-900">{children}</table></div>,
          th: ({ children }) => <th className="border border-gray-300 bg-gray-100 p-2 font-semibold text-left text-gray-900">{children}</th>,
          td: ({ children }) => <td className="border border-gray-300 p-2 text-left text-gray-900">{children}</td>,
          blockquote: ({ children }) => <blockquote className="border-l-4 border-blue-500 pl-4 italic my-4 text-gray-600">{children}</blockquote>,
          a: ({ href, children }) => <a href={href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

Preview.displayName = 'Preview';
export default Preview;