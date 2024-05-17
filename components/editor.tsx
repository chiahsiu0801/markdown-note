import { useEffect, useRef, useState, useCallback } from "react"
import { Caret } from 'textarea-caret-ts'
import { cn, measureTextWidth, offsetLineNumbers, transferLineCountsToLineNumbers } from "@/lib/utils"

import EditorLine from "./editorLine"

type EditorProps = {
  input: string;
  setInput: (value: string) => void;
  editorFocus: boolean;
}

const Editor = ({ input, setInput, editorFocus }: EditorProps) => {
  const [lineNumbers, setLineNumbers] = useState<(number | string)[]>([1]);
  const [rows, setRows] = useState<string[]>([]);
  const [textareaWidth, setTextareaWidth] = useState(0);
  const [activeRows, setActiveRows] = useState<number[]>([]);

  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLDivElement>(null);
  const previousInputRef = useRef<string>(input);
  const previousCaretTop = useRef<number>(3);
  const previousCaretPos = useRef<number>(0);
  const previousPressedKey = useRef<string>('');
  const pastedRef = useRef<boolean>(false);

  const textSplitIntoRow = useCallback((value: string[]): [number[], string[]] => {
    let lineCountsOfRows: number[] = [];
    let lines: string[] = [];

    const font = `18px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`
    const spaceWidth = measureTextWidth(font, ' ');

    value.map((row: string) => {
      let count = 0;

      if(textareaRef.current) {
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

        console.log('words before: ', words);

        // Split words that exceed the textarea width
        for(let i = 0; i < words.length; i++) {
          let wordWidth = measureTextWidth(font, words[i]);

          if(words[i][words[i].length - 1] === ' ' && words[i] !== ' ') {
            wordWidth -= spaceWidth;
          }

          if(wordWidth > textareaWidth) {
            let index = 1;

            while(index <= words[i].length && measureTextWidth(font, words[i].substring(0, index)) < textareaWidth) {
              index++;
            }

            const part1 = words[i].substring(0, index - 1);
            const part2 = words[i].substring(index - 1);

            words.splice(i, 1, part1, part2);
          }
        }

        console.log('words after: ', words);

        // If currentLine width plus current word width is over the textarea width, create a new row
        for(let i = 0; i < words.length; i++) {
          if(words[i][0] === '\t') {
            console.log('tab');
            words[i] = '    ' + words[i].slice(1);
          }

          let wordWidth = measureTextWidth(font, words[i]);

          if(words[i][words[i].length - 1] === ' ' && words[i] !== ' ') {
            wordWidth -= spaceWidth;
          }

          const lineWidth = measureTextWidth(font, currentLine);

          console.log('words[i]: ', words[i].split(''));
          console.log('wordWidth: ', wordWidth);
          console.log('lineWidth: ', lineWidth);

          console.log('lineWidth + wordWidth: ', lineWidth + wordWidth);
          console.log('textareaWidth: ', textareaWidth);
          console.log('currentLine: ', currentLine);

          if(lineWidth + wordWidth > textareaWidth) {
            console.log('over');
            lines.push(currentLine);

            count++;
            currentLine = words[i];
          } else {
            console.log('currentLine added');
            currentLine += words[i];
          }
        }

        if((currentLine.trim() !== '' || (currentLine.trim() === '' && currentLine !== ''))) {
          count++;
          lines.push(currentLine);
        }

        lineCountsOfRows.push(count);
      }
    })

    return [lineCountsOfRows, lines];
  }, [textareaWidth]);

  const handleActiveRows = useCallback((target: HTMLTextAreaElement) => {
    // const textUpToCaret = target.value.substring(0, target.selectionStart);
    // const rowNumber = (textUpToCaret.match(/\n/g) || []).length;
    // const nextLineBreak = target.value.indexOf('\n', target.selectionStart);
    // const highlightEnd = target.value.substring(0, nextLineBreak === -1 ? target.value.length : nextLineBreak);
    // const linesPerRow = textSplitIntoRow(highlightEnd.split('\n'))[0];

    // let activeRow = 0;

    // for(let i = 0; i < linesPerRow.length - 1; i++) {
    //   activeRow += Math.max(linesPerRow[i], 1);
    // }

    // const activeRowsArr = Array.from({ length: linesPerRow[rowNumber] || 1 }, (_, i) => activeRow + i);

    // console.log('activeRowsArr: ', activeRowsArr);
    console.log('lineNumbers in handleActiveRows: ', lineNumbers);
    // setActiveRows(activeRowsArr);

    const activeLineNumber = parseInt(target.style.top) / 28;
    console.log('activeLineNumber: ', activeLineNumber);

    let forwardIndex = activeLineNumber;
    let afterwardIndex = activeLineNumber + 1;

    while(typeof lineNumbers[forwardIndex] !== 'number' && forwardIndex >= 0) {
      forwardIndex--;
    }

    while(typeof lineNumbers[afterwardIndex] !== 'number' && afterwardIndex < lineNumbers.length) {
      afterwardIndex++;
    }

    console.log('forwardIndex: ', forwardIndex);
    console.log('afterwardIndex: ', afterwardIndex);;

    setActiveRows(Array.from({ length: (afterwardIndex - forwardIndex) }, (_, i) => i + forwardIndex));
  }, [lineNumbers]);

  const handleCaret = useCallback((target: HTMLTextAreaElement): void => {
    setTimeout(() => {
      const posCorrection = Caret.getRelativePosition(target);


      // If the text is too long and close to right border of textarea,
      // Caret will have some bug in calculation, use the code below to adjust caret position
      if(posCorrection.top === previousCaretTop.current + 28 && previousPressedKey.current !== 'Enter' && previousPressedKey.current !== 'ArrowDown' && previousPressedKey.current !== 'ArrowUp' && previousPressedKey.current !== 'ArrowLeft' && previousPressedKey.current !== 'ArrowRight' && !pastedRef.current) {
        // const activeRow = (previousCaretTop.current - 3) / 28;
        const activeRow = (previousCaretTop.current - 4) / 28;
        const activeSpan = document.getElementById('rowsContainer')?.querySelectorAll('span')[activeRow];

        caretRef.current!.style.left = activeSpan!.getBoundingClientRect().width >= textareaWidth ? activeSpan!.getBoundingClientRect().width - 2 + 'px' : activeSpan!.getBoundingClientRect().width + 'px';
      } else {
        target.style.top = posCorrection.top - 3 + 'px';
        caretRef.current!.style.left = posCorrection.left >= textareaWidth ? posCorrection.left - 2 + 'px' : posCorrection.left + 'px';
        caretRef.current!.style.top = posCorrection.top + 'px';
      }

      handleActiveRows(target);
      previousCaretTop.current = posCorrection.top;
      previousCaretPos.current = target.selectionStart;

      pastedRef.current = false;

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
  }, [handleActiveRows, textareaWidth]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    const target = e.target as HTMLTextAreaElement;

    previousPressedKey.current = e.key;

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
    let inputIndex = 0;

    for(let i = 0; i < selectionArr.length; i++) {
      if(selectionArr[i] === '\n' && input.split('')[inputIndex] !== '\n' && input.split('')[inputIndex] !== ' ') {
        // console.log('input.split()[inputIndex]: ', input.split('')[inputIndex]);

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

  const lineNumbersTransfer = (input: string) => {
    const lineCountsOfRows = textSplitIntoRow(input.split('\n'))[0];
    console.log('lineCountsOfRows: ', lineCountsOfRows);

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

    return lineNumbers;
  }

  // Function to detect changes between the previous and current input
  const findDifference = (oldText: string, newText: string) => {
    let prefixLastNewline = 0;
    let prefixIndex = previousCaretPos.current - 1;


    while(prefixIndex >= 0) {
      if(newText[prefixIndex] === '\n') {
        prefixLastNewline = prefixIndex + 1;

        break;
      }

      prefixIndex--;
    }

    let suffixFirstNewline = newText.length;
    let suffixIndex = textareaRef.current?.selectionStart!;


    while(suffixIndex <= newText.length - 1) {
      if(newText[suffixIndex] === '\n') {
        suffixFirstNewline = suffixIndex;

        break;
      }

      suffixIndex++;
    }

    const prefix = newText.substring(0, prefixLastNewline);
    const changedSection = newText.substring(prefixLastNewline, suffixFirstNewline);
    const suffix = newText.substring(suffixFirstNewline);

    return { prefix, changedSection, suffix };
  };

  const processChanges = useCallback((oldText: string, newText: string) => {
    console.log('called');
    let { prefix, changedSection, suffix } = findDifference(oldText, newText);
    console.log('changedSection: ', changedSection);

    // Add logic here to process only the changed section as needed
    let changedRows;
    let changedRowsCount = [1];

    if(changedSection === '\n') {
      changedRows = [''];
    } else {
      [changedRowsCount, changedRows] = textSplitIntoRow(changedSection.split('\n'));
    }

    console.log('changedRowsCount: ', changedRowsCount);

    const pos = Caret.getRelativePosition(textareaRef.current!);

    // let activeRow = (pos.top - 3) / 28;
    let activeRow = (pos.top - 4) / 28;

    if(activeRow !== activeRows[0]) {
      activeRow = activeRows[0];
    }

    activeRow = Math.max(activeRow, 0);

    // Calculate how many lines the changedSection occupied before change
    let prevPrefixIndex = previousCaretPos.current - 1;
    let prevPrefixLastNewline = 0

    while(prevPrefixIndex >= 0) {
      if(oldText[prevPrefixIndex] === '\n') {
        prevPrefixLastNewline = prevPrefixIndex;

        break;
      }

      prevPrefixIndex--;
    }

    let prevSuffixFirstNewline = oldText.length;
    let prevSuffixIndex = previousCaretPos.current;

    while(prevSuffixIndex <= oldText.length - 1) {
      if(oldText[prevSuffixIndex] === '\n') {
        prevSuffixFirstNewline = prevSuffixIndex;

        break;
      }

      prevSuffixIndex++;
    }

    let rowCountBeforeChange =
      textSplitIntoRow(oldText.substring(prevPrefixLastNewline, prevSuffixFirstNewline).split('\n'))[0].
      reduce((sum, num) => sum + num);

    rowCountBeforeChange = Math.max(rowCountBeforeChange, 1);

    const indexOfNewline = changedSection.indexOf('\n');
    let changedRowsCountBeforeNewline: number[] = [];
    let changedRowsBeforeNewline: string[] = [];
    let changedRowsCountAfterNewline: number[] = [];
    let changedRowsAfterNewline: string[] = [];

    // Avoid call textSplitIntoRow in every condition
    // if(changedSection.includes('\n') && changedSection !== '\n') {
    //   console.log('avoid');
    //   [changedRowsCountBeforeNewline, changedRowsBeforeNewline] = textSplitIntoRow(changedSection.substring(0, indexOfNewline).split('\n'));
    //   [changedRowsCountAfterNewline, changedRowsAfterNewline] = textSplitIntoRow(changedSection.substring(indexOfNewline + 1).split('\n'));
    // }

    setRows((prevRows) => {
      console.log('setRows called');
      console.log(prevRows);

      if(changedSection === '\n') {
        console.log('return 1');
        return [...prevRows.slice(0, activeRow), ...changedRows, ...prevRows.slice(activeRow)];
      }

      // Only white spaces
      if(changedSection.split('').every(char => char === ' ')) {
        console.log('return 2');
        return [...prevRows.slice(0, activeRow), ...changedRows, ...prevRows.slice(activeRow + 1)];
      }

      // With newline
      if(changedSection.includes('\n')) {
        console.log('return 3');
        const changedRowsBeforeNewline = textSplitIntoRow(changedSection.substring(0, indexOfNewline).split('\n'))[1];
        const changedRowsAfterNewline = textSplitIntoRow(changedSection.substring(indexOfNewline + 1).split('\n'))[1];

        console.log('changedRowsBeforeNewline: ', changedRowsBeforeNewline);
        console.log('changedRowsAfterNewline: ', changedRowsAfterNewline);
        return [...prevRows.slice(0, activeRow), ...changedRowsBeforeNewline, ...changedRowsAfterNewline, ...prevRows.slice(activeRow + rowCountBeforeChange)];
      }

      // // newline in the start
      // if(changedSection[0] === '\n') {
      //   console.log('return 2');

      //   return [...prevRows.slice(0, activeRow), ...changedRowsBeforeNewline, ...changedRowsAfterNewline, ...prevRows.slice(activeRow + rowCountBeforeChange)];
      // }

      // // newline in the middle
      // if(changedSection.includes('\n') && changedSection[0] !== '\n' && changedSection[changedSection.length - 1] !== '\n') {
      //   console.log('return 3');

      //   return [...prevRows.slice(0, activeRow), ...changedRowsBeforeNewline, ...changedRowsAfterNewline, ...prevRows.slice(activeRow + rowCountBeforeChange)];
      // }

      // // newline in the end
      // if(changedSection[changedSection.length - 1] === '\n') {
      //   console.log('return 4');

      //   return [...prevRows.slice(0, activeRow), ...changedRowsBeforeNewline, ...changedRowsAfterNewline, ...prevRows.slice(activeRow + rowCountBeforeChange)];
      // }

      // Other situation
      console.log('return 4');
      return [...prevRows.slice(0, activeRow), ...changedRows, ...prevRows.slice(activeRow + rowCountBeforeChange)];
    });

    setLineNumbers((prevLineNumbers) => {
      console.log('setLineNumbers called');
      console.log(prevLineNumbers);
      const suffixPrevLineNumbers = prevLineNumbers.slice(0, activeRow);

      let changedRowsLineNumberStart = 0;
      for(let i = suffixPrevLineNumbers.length - 1; i >= 0; i--) {
        if(suffixPrevLineNumbers[i] !== '') {
          changedRowsLineNumberStart = suffixPrevLineNumbers[i] as number;

          break;
        }
      }

      console.log('changedRowsLineNumberStart: ', changedRowsLineNumberStart);

      let changedRowsLineNumber: (number | string)[] = [changedRowsLineNumberStart! + 1];

      if(changedRowsCount.length === 1) {
        Array(changedRowsCount[0] - 1).fill('').forEach((_) => changedRowsLineNumber.push(''));
      }

      if(changedSection === '\n') {
        console.log('return 1');
        return [...prevLineNumbers.slice(0, activeRow), ...changedRowsLineNumber, ...offsetLineNumbers(prevLineNumbers.slice(activeRow), 1)];
      }

      // Only white spaces
      if(changedSection.split('').every(char => char === ' ')) {
        console.log('return 2');
        return [...prevLineNumbers.slice(0, activeRow), ...changedRowsLineNumber, ...prevLineNumbers.slice(activeRow + 1)];
      }


      // With newline
      if(changedSection.includes('\n')) {
        const changedRowsCountBeforeNewline = textSplitIntoRow(changedSection.substring(0, indexOfNewline).split('\n'))[0];
        const changedRowsCountAfterNewline = textSplitIntoRow(changedSection.substring(indexOfNewline + 1).split('\n'))[0];
        console.log('changedRowsCountBeforeNewline: ', changedRowsCountBeforeNewline);
        console.log('changedRowsCountAfterNewline: ', changedRowsCountAfterNewline);
        // const changedRowsLineNumberBefore: (number | string)[] = [changedRowsLineNumberStart! + 1];
        // Array(changedRowsBeforeNewline.length - 1).fill('').forEach((_) => changedRowsLineNumberBefore.push(''));
        const changedRowsLineNumberBefore: (number | string)[] = transferLineCountsToLineNumbers(changedRowsCountBeforeNewline, changedRowsLineNumberStart + 1);

        // const changedRowsLineNumberAfter: (number | string)[] = [changedRowsLineNumberStart! + 2];
        // Array(changedRowsAfterNewline.length - 1).fill('').forEach((_) => changedRowsLineNumberAfter.push(''));
        const changedRowsLineNumberAfter: (number | string)[] = transferLineCountsToLineNumbers(changedRowsCountAfterNewline, changedRowsLineNumberStart + changedRowsCountBeforeNewline.length + 2);

        console.log('return 3');
        console.log('changedRowsBeforeNewline: ', changedRowsBeforeNewline);
        console.log('changedRowsAfterNewline: ', changedRowsAfterNewline);
        console.log('activeRow: ', activeRow);
        console.log('[...changedRowsLineNumberBefore]: ', [...changedRowsLineNumberBefore]);
        console.log('[...changedRowsLineNumberAfter]: ', [...changedRowsLineNumberAfter]);
        return [...prevLineNumbers.slice(0, activeRow), ...changedRowsLineNumberBefore, ...changedRowsLineNumberAfter, ...offsetLineNumbers(prevLineNumbers.slice(activeRow + rowCountBeforeChange), 1)];
      }

      // Other situation
      console.log('return 4');
      console.log('activeRow: ', activeRow);
      console.log('[...changedRowsLineNumber]: ', [...changedRowsLineNumber]);
      return [...prevLineNumbers.slice(0, activeRow), ...changedRowsLineNumber, ...prevLineNumbers.slice(activeRow + rowCountBeforeChange)];
    });

    // while(lineCountsOfRows.length > 0) {
    //   const numLinesOfSentence = lineCountsOfRows.shift();
    //   lineNumbers.push(i);

    //   if(numLinesOfSentence && numLinesOfSentence > 1) {
    //     Array(numLinesOfSentence - 1).fill('').forEach((_) => lineNumbers.push(''));
    //   }

    //   i++;
    // }

    // setLineNumbers(lineNumbers);
  }, [textSplitIntoRow, activeRows]);

  const handleTextChange = useCallback((inputValue: string) => {
    setInput(inputValue);

    const previousInput = previousInputRef.current;
    processChanges(previousInput, inputValue);
    previousInputRef.current = inputValue; // Update previous input for the next change
  }, [processChanges, setInput]);

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

  // useEffect(() => {
    // let [lineCountsOfRows, lines] = textSplitIntoRow(input.split('\n'));
    // let lines;

    // const pos = Caret.getRelativePosition(textareaRef.current!);
    // console.log('pos: ', pos);

    // if(pos.top === posRef.current) {

    // } else {
    //   posRef.current = pos.top;
    //   lines = textSplitIntoRow(input.split('\n'))[1];
    // }

    // let [_, lines] = textSplitIntoRow(input.split('\n'));

    // console.log('lines: ', lines);

    // let lineNumbers = [];
    // let i = 1;

    // while(lineCountsOfRows.length > 0) {
    //   const numLinesOfSentence = lineCountsOfRows.shift();
    //   lineNumbers.push(i);

    //   if(numLinesOfSentence && numLinesOfSentence > 1) {
    //     Array(numLinesOfSentence - 1).fill('').forEach((_) => lineNumbers.push(''));
    //   }

    //   i++;
    // }

    // setLineNumbers(lineNumbers);
    // setRows(lines);
  // }, [input, textSplitIntoRow]);

  return (
    <>
      <div
        ref={lineNumbersRef}
        className="w-12 pr-3 text-right text-lg font-mono rounded-lg rounded-r-none bg-slate-400 text-gray-600 border-gray-300 overflow-hidden resize-none select-none focus:outline-none leading-6"
        style={{ userSelect: 'none' }}
      >
        {
          lineNumbers.map((lineNumber, index) => {
          // lineNumbersTransfer(input).map((lineNumber, index) => {
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
            // textSplitIntoRow(input.split('\n'))[1].map((row, index) => {
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
            // setInput(e.target.value);
            handleTextChange(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          onPaste={(e) => {
            pastedRef.current = true;
            handleCaret(e.currentTarget)
          }}
          onClick={(e) => {
            console.log('textarea clicked');
            console.log(e.clientX);
            console.log(e.clientY);
          }}
          wrap="on"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck="false"
          className="text-[18px] w-full h-[28px] text-lg text-transparent bg-transparent font-mono resize-none focus:outline-none absolute left-0 top-0 -z-10 overflow-hidden"
          style={{ fontFeatureSettings: `"liga" 0, "calt" 0`, fontVariationSettings: "normal", letterSpacing: "0" }}
        />
      </div>
    </>
  );
}
 
export default Editor;