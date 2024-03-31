import { useEffect, useRef, useState } from "react";

type EditorProps = {
  input: string;
  setInput: (value: string) => void;
  setEditorBorder: (value: boolean) => void;
}

const Editor = ({ input, setInput, setEditorBorder }: EditorProps) => {
  const [lineNumbers, setLineNumbers] = useState('');

  const lineNumbersRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const lineCount = input.split('\n').length;
    // Generate number 1 to number lineCount string used in line number textarea
    const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1).join('\n');

    setLineNumbers(lineNumbers);
  }, [input]);

  // Make lineNumbers is scrolled synchronously with textarea
  useEffect(() => {
    if(lineNumbersRef.current && textareaRef.current) {
      const syncScroll = () => {
        if(lineNumbersRef.current && textareaRef.current) {
          lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
        }
      };

      const textareaNode = textareaRef.current;

      textareaNode.addEventListener('scroll', syncScroll);

      return () => textareaNode.removeEventListener('scroll', syncScroll);
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if(e.key === 'Tab') {
      e.preventDefault();

      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart ?? 0;
      const end = target.selectionEnd ?? 0;

      const inputWithTab = input.substring(0, start) + '\t' + input.substring(end);
      setInput(inputWithTab);

      // Use setTimeout to ensure the cursor position is updated after textarea updates
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 1;
      }, 0)
    }
  }

  return (
    <>
      <textarea
        ref={lineNumbersRef}
        className="w-12 text-right font-mono rounded-lg rounded-r-none bg-slate-400 text-gray-600 pt-5 pb-5 pl-3 border-gray-300 overflow-hidden resize-none select-none focus:outline-none cursor-default"
        readOnly
        value={lineNumbers}
        style={{ lineHeight: '1.5', userSelect: 'none' }}
      />
      <textarea
        ref={textareaRef}
        autoFocus
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setEditorBorder(true)}
        onBlur={() => setEditorBorder(false)}
        className="w-full h-full rounded-lg rounded-l-none bg-slate-400 font-mono resize-none p-5 pl-3 focus:outline-none"
      />
    </>
  );
}
 
export default Editor;