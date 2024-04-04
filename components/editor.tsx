import { useCallback, useEffect, useRef, useState } from "react";

type EditorProps = {
  input: string;
  setInput: (value: string) => void;
  setEditorBorder: (value: boolean) => void;
}

const Editor = ({ input, setInput, setEditorBorder }: EditorProps) => {
  const [lineNumbers, setLineNumbers] = useState('');
  const [highlightedInput, setHighlightedInput] = useState('<div class="w-full h-6 bg-white/70 text-transparent">' + input + '</div>');

  const lineNumbersRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  const handleHighlight = (target: HTMLTextAreaElement): void => {
    // console.log('input:', input);
    // console.log('target.value', target.value);
    // console.log('offset: ', caretOffset);
    const caretIndex = target.selectionStart ?? 0;
    // console.log('caretIndex:', caretIndex);

    const start = target.value.lastIndexOf('\n', caretIndex - 1);
    const end = target.value.indexOf('\n', caretIndex);

    const highlightStart = start === -1 ? 0 : start + 1;
    const highlightEnd = end === -1 ? target.value.length : end;

    // console.log(highlightStart, highlightEnd);

    const highlightedLine = '<div class="w-full h-6 bg-white/70 text-transparent">' + target.value.substring(highlightStart, highlightEnd) + '</div>';
    setHighlightedInput(target.value.substring(0, highlightStart) + highlightedLine + target.value.substring(highlightEnd));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    const target = e.target as HTMLTextAreaElement;

    switch (e.key) {
      case 'Tab':
        e.preventDefault();

        const start = target.selectionStart ?? 0;
        const end = target.selectionEnd ?? 0;

        const inputWithTab = input.substring(0, start) + '\t' + input.substring(end);
        setInput(inputWithTab);

        // Use setTimeout to ensure the cursor position is updated after textarea updates
        setTimeout(() => {
          target.selectionStart = target.selectionEnd = start + 1;
        }, 0);

        break;
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'Enter':
      case 'Backspace':
      case 'Delete':
      case 'Tab':
        // Use setTimeout to process the keydown event asynchronously
        setTimeout(() => handleHighlight(target), 0);

        break;
      default:
        break;
    }
  }

  useEffect(() => {
    const lineCount = input.split('\n').length;
    // Generate number 1 to number lineCount string used in line number textarea
    const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1).join('\n');

    setLineNumbers(lineNumbers);
  }, [input]);

  // Make lineNumbers is scrolled synchronously with textarea
  useEffect(() => {
    const textareaNode = textareaRef.current;
    const lineNumbersNode = lineNumbersRef.current;
    const highlightNode = highlightRef.current;

    if(lineNumbersNode && textareaNode && highlightNode) {
      const syncScroll = () => {
        if(textareaNode && lineNumbersNode && highlightNode) {
            const scrollTop = textareaNode.scrollTop;
          // setTimeout(() => {
            lineNumbersNode.scrollTop = scrollTop;
            highlightNode.scrollTop = scrollTop;
          // }, 0);
          // console.log('lineNumbers:', lineNumbersNode.scrollTop);
          // console.log('highlight: ', highlightNode.scrollTop);
          // console.log('textarea:', textareaNode.scrollTop);
        }
      };

      textareaNode.addEventListener('scroll', syncScroll);

      return () => textareaNode.removeEventListener('scroll', syncScroll);
    }
  }, []);

  // useEffect(() => {
  //   if(textareaRef.current) {
  //     handleHighlight(textareaRef.current);
  //   }
  // }, [handleHighlight]);

  return (
    <>
      <textarea
        ref={lineNumbersRef}
        className="w-12 text-right font-mono rounded-lg rounded-r-none bg-slate-400 text-gray-600 pt-5 pb-5 pl-3 border-gray-300 overflow-hidden resize-none select-none focus:outline-none cursor-default"
        readOnly
        value={lineNumbers}
        style={{ lineHeight: '1.5', userSelect: 'none' }}
        />
      <div className="w-full relative z-30">
        <div className="w-full h-full bg-slate-400 absolute font-mono overflow-auto z-10" ref={highlightRef}>
          <div className="text-transparent w-full p-5 pl-3 whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{ __html:  highlightedInput }}></div>
        </div>
        <textarea
          ref={textareaRef}
          autoFocus
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            handleHighlight(e.target);
          }}
          onKeyDown={handleKeyDown}
          // onClick={}
          // onInput={}
          onFocus={() => setEditorBorder(true)}
          onBlur={() => setEditorBorder(false)}
          className="w-full h-full p-5 pl-3 rounded-lg rounded-l-none bg-transparent font-mono resize-none focus:outline-none absolute z-20"
        />
      </div>
    </>
  );
}
 
export default Editor;