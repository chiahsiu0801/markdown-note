import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

const DocumentAnimation = ({ animationInput }: { animationInput: string }) => {
  return ( 
    <Markdown 
      className="w-full max-w-none p-5 prose text-sm md:text-base"
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeSanitize]}
      components={{
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || '');

          return !inline && match ? (
            <SyntaxHighlighter style={vscDarkPlus} PreTag="div" language={match[1]} codeTagProps={{className: `language-${match[1]}`, style: { fontSize: '16px' }}} {...props}>
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }}
    >{animationInput}</Markdown>
   );
}
 
export default DocumentAnimation;