import { useEffect, useRef, useState } from "react";
import { position } from 'caret-pos';
import { cn } from "@/lib/utils";

import EditorLine from "./editorLine";

type EditorProps = {
  input: string;
  setInput: (value: string) => void;
  editorFocus: boolean;
}

const Editor = ({ input, setInput, editorFocus }: EditorProps) => {
  const [lineNumbers, setLineNumbers] = useState('');
  const [highlightedInput, setHighlightedInput] = useState('<div class="w-full h-6 bg-white/10 text-transparent">' + input + '</div>');

  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLDivElement>(null);

  const handleHighlight = (target: HTMLTextAreaElement): void => {
    const caretIndex = target.selectionStart ?? 0;

    const start = target.value.lastIndexOf('\n', caretIndex - 1);
    const end = target.value.indexOf('\n', caretIndex);

    const highlightStart = start === -1 ? 0 : start + 1;
    const highlightEnd = end === -1 ? target.value.length : end;

    const highlightedLine = '<div class="w-full h-6 bg-white/10 text-transparent">' + target.value.substring(highlightStart, highlightEnd) + '</div>';
    setHighlightedInput(target.value.substring(0, highlightStart) + highlightedLine + target.value.substring(highlightEnd));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    const target = e.target as HTMLTextAreaElement;


    switch (e.key) {
      case 'Tab':
        e.preventDefault();

        const start = target.selectionStart ?? 0;
        const end = target.selectionEnd ?? 0;

        console.log(start, end);

        const inputWithTab = input.substring(0, start) + '\t' + input.substring(end);
        setInput(inputWithTab);

        // Use setTimeout to ensure the cursor position is updated after textarea updates
        setTimeout(() => {
          target.selectionStart = target.selectionEnd = start + 1;

          handleCaret(e);
        }, 0);

        break;
      default:
        handleCaret(e);

        break;
    }
  }

  const handleCaret = (e: React.KeyboardEvent<HTMLTextAreaElement> | React.ClipboardEvent<HTMLTextAreaElement>): void => {
    const target = e.target as HTMLTextAreaElement;

    setTimeout(() => {
      const pos = position(target);
      console.log(pos);
      target.style.left = pos.left + 'px';
      target.style.top = pos.top - 3 + 'px';
      caretRef.current!.style.left = pos.left + 'px';
      caretRef.current!.style.top = pos.top + 'px';
    }, 0);
  }

  useEffect(() => {
    const lineCount = input.split('\n').length;
    // Generate number 1 to number lineCount string used in line number textarea
    const lineNumbers = Array.from({ length: lineCount }, (_, i) => `<div class="h-[28px] pt-[2px]">${i + 1}</div>`).join('\n');

    setLineNumbers(lineNumbers);
  }, [input]);

  // Make lineNumbers is scrolled synchronously with textarea
  useEffect(() => {
    const textareaNode = textareaRef.current;
    const lineNumbersNode = lineNumbersRef.current;
    const highlightNode = highlightRef.current;

    if(lineNumbersNode && textareaNode && highlightNode) {
      const syncScroll = () => {
          const scrollTop = textareaNode.scrollTop;

          lineNumbersNode.scrollTop = scrollTop;
          highlightNode.scrollTop = scrollTop;
      };

      textareaNode.addEventListener('scroll', syncScroll);

      return () => textareaNode.removeEventListener('scroll', syncScroll);
    }
  }, []);

  useEffect(() => {
    if(editorFocus) {
      textareaRef.current?.focus();
    } else {
      textareaRef.current?.blur();
    }
  }, [editorFocus]);

  return (
    <>
      <div
        ref={lineNumbersRef}
        className="w-12 pr-3 text-right text-lg font-mono rounded-lg rounded-r-none bg-slate-400 text-gray-600 border-gray-300 overflow-hidden resize-none select-none focus:outline-none cursor-default leading-6"
        dangerouslySetInnerHTML={{ __html: lineNumbers }}
        style={{ userSelect: 'none' }}
      />
      <div className="h-full text-lg bg-slate-400 absolute font-mono z-10" ref={highlightRef} style={{ width: 'calc(100% - 88px)', height: 'calc(100% - 40px)', left: '68px' }}>
        {
          input.split('\n').map((row, index) => {
            return <EditorLine key={index} row={row} />
          })
        }
        <div
          className={
            cn(`w-[2px] h-6 bg-blue-500 absolute top-[3px] left-0 animate-blink`,
              !editorFocus && `invisible`
            )
          }
          ref={caretRef} />
        <textarea
          ref={textareaRef}
          value={input}
          autoFocus
          onChange={(e) => {
            setInput(e.target.value);
            handleHighlight(e.target);
          }}
          onKeyDown={handleKeyDown}
          onPaste={handleCaret}
          onBlur={(e) => {
            if(editorFocus) {
              e.currentTarget.focus();
            }
          }}
          wrap="off"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck="false"
          className="w-[1px] h-[28px] text-lg text-transparent bg-transparent font-mono resize-none focus:outline-none absolute left-0 top-0 z-20 overflow-hidden"
        />
      </div>
    </>
  );
}
 
export default Editor;