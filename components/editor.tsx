import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { position } from 'caret-pos';
import { cn } from "@/lib/utils";

import EditorLine from "./editorLine";

type EditorProps = {
  input: string;
  setInput: (value: string) => void;
  editorFocus: boolean;
}

const Editor = ({ input, setInput, editorFocus }: EditorProps) => {
  const [lineNumbers, setLineNumbers] = useState<number[]>([]);
  const [rows, setRows] = useState<string[]>([]);
  const [textareaWidth, setTextareaWidth] = useState(0);
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

  const handleCaret = useCallback((target: HTMLTextAreaElement): void => {
    setTimeout(() => {
      const pos = position(target);

      target.style.top = pos.top - 3 + 'px';
      caretRef.current!.style.left = pos.left + 'px';
      caretRef.current!.style.top = pos.top + 'px';
    }, 0);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
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

          handleCaret(target);
        }, 0);

        break;
      default:
        console.log(e.key);
        handleCaret(target);

        break;
    }
  }, [input, setInput, handleCaret]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if(textareaRef.current) {
        handleCaret(textareaRef.current);
        setTextareaWidth(textareaRef.current.getBoundingClientRect().width);
      }
    });

    resizeObserver.observe(textareaRef.current as HTMLTextAreaElement);

    return () => resizeObserver.disconnect();
  }, [handleCaret]);

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

  useEffect(() => {
    let lineCountsOfRows: number[] = [];
    let lines: string[] = [];

    input.split('\n').map((row) => {
      let count = 0;

      if(textareaRef.current) {
        const textareaStyles = window.getComputedStyle(textareaRef.current);

        const font = `${textareaStyles.fontSize} ${textareaStyles.fontFamily}`;
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if(context) {
          context.font = font;
        }

        const words = row.split(' ');
        let currentLine = '';

        if(row === '') {
          lines.push(currentLine);
        }

        for(let i = 0; i < words.length; i++) {
          if(words[i][0] === '\t') {
            console.log('tab');
            words[i] = '    ' + words[i].slice(1);
          }

          const wordWidth = context?.measureText(words[i] + ' ').width;
          const lineWidth = context?.measureText(currentLine).width;


          if(lineWidth && wordWidth && lineWidth + wordWidth - context?.measureText(' ').width > textareaWidth) {
            console.log('lineWidth + wordWidth: ', lineWidth + wordWidth);
            lines.push(currentLine);

            count++;
            currentLine = words[i] + ' ';
          } else {
            currentLine += words[i] + ' ';
          }
        }

        if(currentLine.trim() !== '') {
          count++;
          lines.push(currentLine);
        }

        lineCountsOfRows.push(count);
      }
    })

    let lineNumbers = [];
    let i = 1;

    while(lineCountsOfRows.length > 0) {
      const numLinesOfSentence = lineCountsOfRows.shift();
      lineNumbers.push(i);

      if(numLinesOfSentence && numLinesOfSentence > 1) {
        Array(numLinesOfSentence - 1).fill('').forEach((_) => lineNumbers.push(''));
      }

      i++;
    }

    setLineNumbers(lineNumbers);
    setRows(lines);
  }, [input, textareaWidth]);

  return (
    <>
      <div
        ref={lineNumbersRef}
        className="w-12 pr-3 text-right text-lg font-mono rounded-lg rounded-r-none bg-slate-400 text-gray-600 border-gray-300 overflow-hidden resize-none select-none focus:outline-none cursor-default leading-6"
        style={{ userSelect: 'none' }}
      >
        {
          lineNumbers.map((lineNumber, index) => {
            return lineNumber ? <div className="h-[28px] pt-[2px]" key={index}>{lineNumber}</div> : <div className="h-[28px] pt-[2px]" key={index}>&nbsp;</div>;
          })
        }
      </div>
      <div className="h-full text-lg bg-slate-400 absolute font-mono z-10" ref={highlightRef} style={{ width: 'calc(100% - 88px)', height: 'calc(100% - 40px)', left: '68px' }}>
        <div>
          {
            rows.map((row, index) => {
              return <EditorLine key={index} row={row} width={textareaWidth} />
            })
          }
        </div>
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
          onPaste={(e) => {handleCaret(e.currentTarget)}}
          onBlur={(e) => {
            if(editorFocus) {
              e.currentTarget.focus();
            }
          }}
          wrap="on"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck="false"
          className="w-full h-[28px] text-lg text-transparent bg-transparent font-mono resize-none focus:outline-none absolute left-0 top-0 z-20 overflow-hidden"
        />
      </div>
    </>
  );
}
 
export default Editor;