import { textSplitIntoRow } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type EditorMobileProps = {
  input: string;
  setInput: (value: string) => void;
  editorFocus: boolean;
  initialContent?: string;
}

const EditorMobile = ({ input, setInput, editorFocus, initialContent }: EditorMobileProps) => {
  const pathname = usePathname().split('/');
  const noteIdRef = useRef('');
  
  const [lineNumbers, setLineNumbers] = useState<(number | string)[]>([1]);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
 

  useEffect(() => {
    if(editorFocus) {
      textareaRef.current?.focus();
    } else {
      textareaRef.current?.blur();
    }
  }, [editorFocus]);

  // Make lineNumbers is scrolled synchronously with textarea
  useEffect(() => {
    const lineNumbersNode = lineNumbersRef.current;
    const textareaNode = textareaRef.current;

    if(lineNumbersNode) {
      const syncScroll = () => {
          const scrollTop = textareaNode!.scrollTop;

          lineNumbersNode.scrollTop = scrollTop;
      };

      textareaNode!.addEventListener('scroll', syncScroll);

      return () => textareaNode!.removeEventListener('scroll', syncScroll);
    }
  }, []);

  useEffect(() => {
    if(initialContent) {
      calculateLineNumbers(initialContent);
    }
  }, [initialContent]);  

  const calculateLineNumbers = (input: string) => {
    const lines = input.split('\n');
    const textareaWidth = textareaRef.current?.getBoundingClientRect().width;
    const numLines = textSplitIntoRow(lines, textareaWidth!)[0];

    let lineNumbers = [];
    let i = 1;
    while (numLines.length > 0) {
        const numLinesOfSentence = numLines.shift();
        lineNumbers.push(i);
        if (numLinesOfSentence! > 1) {
            Array(numLinesOfSentence! - 1)
                .fill('')
                .forEach((_) => lineNumbers.push(''));
        }
        i++;
    }

    setLineNumbers(lineNumbers);
  };

  return (
    <>
      <div
        ref={lineNumbersRef}
        className="w-12 pr-3 text-right text-lg font-mono rounded-lg rounded-r-none bg-slate-400 text-gray-600 border-gray-300 overflow-hidden resize-none select-none focus:outline-none leading-6"
        style={{ userSelect: 'none' }}
      >
        {
          lineNumbers.map((lineNumber, index) => {
            return lineNumber ?
              <div className="h-[28px] pt-[2px]" key={index}>{lineNumber}</div> :
              <div className="h-[28px] pt-[2px]" key={index}>&nbsp;</div>;
          })
        }
      </div>
      <div
        className="h-full text-lg bg-slate-400 absolute font-mono z-10 overflow-auto cursor-text"
        style={{ width: 'calc(100% - 88px)', height: 'calc(100% - 40px)', left: '68px' }}
      >
        <textarea
          ref={textareaRef}
          value={input}
          autoFocus
          onChange={(e) => {
            setInput(e.target.value);
            calculateLineNumbers(e.target.value);
          }}
          wrap="on"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck="false"
          className="text-[18px] w-full h-full text-lg bg-transparent font-mono resize-none focus:outline-none absolute left-0 top-0 -z-10 overflow-scroll caret-blue-500"
          style={{ fontFeatureSettings: `"liga" 0, "calt" 0`, fontVariationSettings: "normal", letterSpacing: "0" }}
        />
      </div>
    </>
   );
}
 
export default EditorMobile;