import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

type DocumentProps = {
  input: string;
  width: number;
}

const Document = ({ input }: DocumentProps) => {
  return (
    <Markdown 
      className="w-full max-w-none p-5 prose text-sm md:text-base"
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeSanitize]}
      components={{
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || '');

          return !inline && match ? (
            <SyntaxHighlighter style={vscDarkPlus} PreTag="div" language={match[1]} showLineNumbers lineNumberStyle={{ minWidth: '3.25em' }} codeTagProps={{className: `language-${match[1]}`, style: { fontSize: '16px' }}} {...props}>
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }}
    >{input}</Markdown>
   );
}
 
export default Document;
