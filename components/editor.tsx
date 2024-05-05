import { useEffect, useRef, useState, useCallback } from "react"
import { Caret } from 'textarea-caret-ts'
import { cn } from "@/lib/utils"

import EditorLine from "./editorLine"

type EditorProps = {
  input: string;
  setInput: (value: string) => void;
  editorFocus: boolean;
}

const Editor = ({ input, setInput, editorFocus }: EditorProps) => {
  const [lineNumbers, setLineNumbers] = useState<number[]>([]);
  const [rows, setRows] = useState<string[]>([]);
  const [textareaWidth, setTextareaWidth] = useState(0);
  const [activeRows, setActiveRows] = useState<number[]>([]);

  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLDivElement>(null);

  const textSplitIntoRow = useCallback((value: string[]): [number[], string[]] => {
    let lineCountsOfRows: number[] = [];
    let lines: string[] = [];

    const textareaStyles = window.getComputedStyle(textareaRef.current!);

    const font = `${textareaStyles.fontSize} ${textareaStyles.fontFamily}`;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;

    if(context) {
      context.font = font;
    }

    const spaceWidth = context?.measureText(' ').width;

    value.map((row: string) => {
      let count = 0;

      if(textareaRef.current) {
        // let words = row.split(' ');
        let words = [];
        let word = '';
        const openParentheses = ['(', '[', '{'];
        const closeParentheses = [')', ']', '}'];

        for(let i = 0; i < row.length; i++) {
          word += row[i];

          if(row[i] === ' ' || row[i] === '>' || row[i] === '-' || (closeParentheses.includes(row[i]) && !closeParentheses.includes(row[i + 1])) || (row[i] === '=' && openParentheses.includes(row[i + 1])) || i === row.length - 1) {
            words.push(word);
            word = '';
          }
        }

        let currentLine = '';

        if(row === '') {
          lines.push(currentLine);
        }


        for(let i = 0; i < words.length; i++) {
          if(context.measureText(words[i]).width > textareaWidth) {
            let index = 1;

            while(index <= words[i].length && context.measureText(words[i].substring(0, index)).width < textareaWidth) {
              index++;
            }

            // console.log('words[0]: ', words[i]);
            const part1 = words[i].substring(0, index - 1);
            const part2 = words[i].substring(index - 1);

            words.splice(i, 1, part1, part2);
          }
        }

        for(let i = 0; i < words.length; i++) {
          if(words[i][0] === '\t') {
            console.log('tab');
            words[i] = '    ' + words[i].slice(1);
          }

          let wordWidth = context.measureText(words[i]).width!;

          if(words[i][words[i].length - 1] === ' ') {
            wordWidth -= spaceWidth;
          }

          const lineWidth = context.measureText(currentLine).width!;

          // console.log('words[i]: ', words[i]);
          // console.log('wordWidth: ', wordWidth);
          // console.log('lineWidth: ', lineWidth);

          // console.log('lineWidth + wordWidth: ', lineWidth + wordWidth);
          // console.log('textareaWidth: ', textareaWidth);

          if(lineWidth + wordWidth > textareaWidth) {
            console.log('over');
            lines.push(currentLine);

            count++;
            currentLine = words[i];
          } else {
            currentLine += words[i];
          }
        }

        if(currentLine.trim() !== '') {
          count++;
          lines.push(currentLine);
        }

        lineCountsOfRows.push(count);
      }
    })

    return [lineCountsOfRows, lines];
  }, [textareaWidth]);

  const handleCaret = useCallback((target: HTMLTextAreaElement): void => {
    setTimeout(() => {
      const posCorrection = Caret.getRelativePosition(target);

      console.log('posCorrection: ', posCorrection);

      const textUpToCaret = target.value.substring(0, target.selectionStart);
      const rowNumber = (textUpToCaret.match(/\n/g) || []).length;
      const end = target.value.indexOf('\n', target.selectionStart);
      const highlightEnd = target.value.substring(0, end === -1 ? target.value.length : end);
      const linesPerRow = textSplitIntoRow(highlightEnd.split('\n'))[0];

      let activeRow = 0;

      for(let i = 0; i < linesPerRow.length - 1; i++) {
        const currentLines = linesPerRow[i] === 0 ? 1 : linesPerRow[i];

        activeRow += currentLines;
      }

      const activeRowsArr = [activeRow];

      for(let i = 1; i < linesPerRow[rowNumber]; i++) {
        activeRowsArr.push(activeRow + i);
      }

      console.log('activeRowsArr: ', activeRowsArr);
      setActiveRows(activeRowsArr);

      target.style.top = posCorrection.top - 3 + 'px';
      caretRef.current!.style.left = posCorrection.left + 'px';
      caretRef.current!.style.top = posCorrection.top + 'px';

      console.log('target.style.top: ', target.style.top);
      console.log('caretRef.current!.style.top: ', caretRef.current!.style.top);

      // Scroll editor and line numbers if caret is invisible on the screen
      if(caretRef.current && textRef.current && lineNumbersRef.current) {
        const textRect = textRef.current.getBoundingClientRect();
        const caretRect = caretRef.current.getBoundingClientRect();

        // If caret is four lines below the top of editor, scroll editor and line numbers to make more lines visible
        const caretOutOfTop = caretRect.top - (28 * 4) < textRect.top;
        // const caretOutOfTop = caretRect.top < textRect.top;
        const caretOutOfBottom = caretRect.bottom > textRect.bottom;

        if(caretOutOfTop) {
          textRef.current.scrollTop = posCorrection.top - (28 * 4);
        } else if(caretOutOfBottom) {
          textRef.current.scrollTop = posCorrection.top + 28 - textRect.height;
        }
      }
    }, 0);
  }, [textSplitIntoRow]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
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

          handleCaret(target);
        }, 0);

        break;
      default:
        console.log(e.key);
        handleCaret(target);

        break;
    }
  }, [input, setInput, handleCaret]);

  const handleCaretByClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const scrollOffset = textRef.current?.scrollTop;

    textareaRef.current?.blur();

    const selection = window.getSelection();

    const range = selection?.getRangeAt(0);

    let target = e.target as HTMLElement;

    while (target && target instanceof Element && target.id !== 'rowsContainer') {
      target = target.parentElement!;
      if (!target) return;
    }

    range?.setStart(target, 0);

    const selectionArr = selection!.toString().split('');
    let offset = 0;

    const textareaStyles = window.getComputedStyle(textareaRef.current!);
    const font = `${textareaStyles.fontSize} ${textareaStyles.fontFamily}`;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;

    if(context) {
      context.font = font;
    }

    let inputIndex = 0;

    for(let i = 0; i < selectionArr.length; i++) {
      if(selectionArr[i] === '\n' && input.split('')[inputIndex] !== '\n' && input.split('')[inputIndex] !== ' ') {
        console.log('input.split()[inputIndex]: ', input.split('')[inputIndex]);

        offset++;
        inputIndex--;
      }
      inputIndex++;
    }

    let setPoint = selection?.toString().split('').length;

    selection?.removeAllRanges();

    if(textareaRef.current && setPoint) {
      textareaRef.current.focus();
      textareaRef.current!.setSelectionRange(setPoint - offset, setPoint - offset);

      textRef.current!.scrollTop = scrollOffset!;

      handleCaret(textareaRef.current!);
    }

    return;
  }

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
    // const textareaNode = textareaRef.current;
    const lineNumbersNode = lineNumbersRef.current;
    // const highlightNode = textRef.current;
    const textNode = textRef.current;

    if(lineNumbersNode && textNode) {
      const syncScroll = () => {
          const scrollTop = textNode.scrollTop;

          lineNumbersNode.scrollTop = scrollTop;

          const rect = caretRef.current!.getBoundingClientRect();
          console.log(`Top: ${rect.top}, Bottom: ${rect.bottom}, Height: ${rect.height}`);
      };

      textNode.addEventListener('scroll', syncScroll);

      return () => textNode.removeEventListener('scroll', syncScroll);
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
    let [lineCountsOfRows, lines] = textSplitIntoRow(input.split('\n'));

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
  }, [input, textareaWidth, textSplitIntoRow]);

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
              <div className={cn(`h-[28px] pt-[2px]`, (activeRows.includes(index)) && `text-[#e6edf3]`)} key={index}>{lineNumber}</div> :
              <div className="h-[28px] pt-[2px]" key={index}>&nbsp;</div>;
          })
        }
      </div>
      <div
        className="h-full text-lg bg-slate-400 absolute font-mono z-10 overflow-auto"
        ref={textRef}
        style={{ width: 'calc(100% - 88px)', height: 'calc(100% - 40px)', left: '68px' }}
      >
        <div
          className="h-full"
          id="rowsContainer"
          onClick={(e) => handleCaretByClick(e)}
        >
          {
            rows.map((row, index) => {
              let active = false;

              if(activeRows.includes(index)) {
                active = true;
              }

              return <EditorLine key={index} row={row} width={textareaWidth} active={active} />
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
          }}
          onKeyDown={handleKeyDown}
          onPaste={(e) => {handleCaret(e.currentTarget)}}
          onClick={(e) => {
            console.log('textarea clicked');
            console.log(e.clientX);
            console.log(e.clientY);
          }}
          wrap="on"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck="false"
          className="w-full h-[28px] text-lg text-transparent bg-transparent font-mono resize-none focus:outline-none absolute left-0 top-0 -z-10 overflow-hidden"
        />
      </div>
    </>
  );
}
 
export default Editor;