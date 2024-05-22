import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { Caret } from 'textarea-caret-ts'
import { cn, textSplitIntoRow, transferLineCountsToLineNumbers } from "@/lib/utils"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { RootState, AppDispatch } from "@/lib/store"
import { increase, decrease, reset } from '../lib/features/editor/editorSlice';

import EditorLine from "./editorLine"

type EditorProps = {
  input: string;
  setInput: (value: string) => void;
  editorFocus: boolean;
}

const Editor = ({ input, setInput, editorFocus }: EditorProps) => {
  const dispatch = useAppDispatch();
  const { rows, lineNumbers } = useAppSelector((state: RootState) => state.editor);

  const [textareaWidth, setTextareaWidth] = useState(0);
  const [activeRows, setActiveRows] = useState<number[]>([]);

  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaForDeleteRef = useRef<HTMLTextAreaElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLDivElement>(null);
  const caretForDeleteRef = useRef<HTMLDivElement>(null);
  const previousInputRef = useRef<string>(input);
  const previousCaretTop = useRef<number>(3);
  const previousCaretPos = useRef<number>(0);
  const previousCaretPosForDeleteRef = useRef<number | null>(null);
  const previousPressedKey = useRef<string>('');
  const pastedRef = useRef<boolean>(false);
  const whiteSpaceCreateNewlineRef = useRef<boolean>(false);

  const handleActiveRows = useCallback((target: HTMLTextAreaElement) => {
    console.log('lineNumbers: ', lineNumbers);
    const activeLineNumber = parseInt(target.style.top) / 28;
    // const activeLineNumber = (parseInt(target.style.top) - 1) / 28;
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
    console.log('afterwardIndex: ', afterwardIndex);

    const newActiveRows = Array.from({ length: (afterwardIndex - forwardIndex) }, (_, i) => i + forwardIndex);
    // setActiveRows(Array.from({ length: (afterwardIndex - forwardIndex) }, (_, i) => i + forwardIndex));
    setActiveRows(newActiveRows);
  }, [lineNumbers]);

  const handleCaret = useCallback((target: HTMLTextAreaElement): void => {
    setTimeout(() => {
      const posCorrection = Caret.getRelativePosition(target);


      // If the text is too long and close to right border of textarea,
      // Caret will have some bug in calculation, use the code below to adjust caret position
      if(posCorrection.top === previousCaretTop.current + 28 && previousPressedKey.current !== 'Enter' && previousPressedKey.current !== 'ArrowDown' && previousPressedKey.current !== 'ArrowUp' && previousPressedKey.current !== 'ArrowLeft' && previousPressedKey.current !== 'ArrowRight' && !pastedRef.current) {
        const activeRow = (previousCaretTop.current - 3) / 28;
        // const activeRow = (previousCaretTop.current - 4) / 28;
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

  const handleCaretForDelete = (target: HTMLTextAreaElement): void => {
    setTimeout(() => {
      const pos = Caret.getRelativePosition(target);
      console.log('pos: ', pos);
      console.log('textareaForDeleteRef.current!.scrollTop: ', textareaForDeleteRef.current!.scrollTop);
      // console.log('caretRef.current!.style.top: ', caretRef.current!.style.top);

      textareaForDeleteRef.current!.scrollTop = textRef.current!.scrollTop;

      caretForDeleteRef.current!.style.top = pos.top + 20 - textareaForDeleteRef.current!.scrollTop + 'px';
      caretForDeleteRef.current!.style.left = pos.left + 68 + 'px';
    }, 0);
    // const textRect = textRef.current!.getBoundingClientRect();
    // const caretRect = caretRef.current!.getBoundingClientRect();

    // // If caret is four lines below the top of editor, scroll editor and line numbers to make more lines visible
    // const caretOutOfTop = caretRect.top - (28 * 4) < textRect.top;
    // // const caretOutOfTop = caretRect.top < textRect.top;
    // const caretOutOfBottom = caretRect.bottom > textRect.bottom;

    // if(caretOutOfTop) {
    //   textRef.current!.scrollTop = pos.top - (28 * 4);
    // } else if(caretOutOfBottom) {
    //   textRef.current!.scrollTop = pos.top + 28 - textRect.height;
    // }
  }

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
      case 'Backspace':
        document.getElementById('rowsContainer')!.style.color = 'transparent';
        document.getElementById('rowsContainer')!.style.visibility = 'hidden';
        textareaForDeleteRef.current!.style.visibility = 'visible';
        textareaForDeleteRef.current!.scrollTop = textRef.current!.scrollTop;
        console.log('textRef.current!.scrollTop: ', textRef.current!.scrollTop);
        caretRef.current!.style.visibility = 'hidden';
        caretForDeleteRef.current!.style.visibility = 'visible';

        if(previousCaretPosForDeleteRef.current === null) {
          previousCaretPosForDeleteRef.current = previousCaretPos.current;
          textareaForDeleteRef.current!.focus();
          textareaForDeleteRef.current!.value = input;
          console.log('previousCaretPos.current: ', previousCaretPos.current);
          textareaForDeleteRef.current!.setSelectionRange(previousCaretPos.current, previousCaretPos.current);
        }

        break;
      default:
        console.log(e.key);
        handleCaret(target);

        break;
    }
  }, [input, setInput, handleCaret]);

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if(e.key === 'Backspace') {
      console.log('input: ', input);
      console.log('oldText: ', previousInputRef.current);

      handleTextChange(textareaForDeleteRef.current!.value);

      previousCaretPos.current = textareaForDeleteRef.current!.selectionStart;
      console.log('previousCaretPos.current in handleKeyUp: ', previousCaretPos.current);
      console.log('textareaForDeleteRef.current!.value[previousCaretPos.current - 1]', textareaForDeleteRef.current!.value[previousCaretPos.current - 1]);
      // handleCaret(textareaForDeleteRef.current!);
      // handleActiveRows(textareaForDeleteRef.current!);

      document.getElementById('rowsContainer')!.style.color = 'black';
      document.getElementById('rowsContainer')!.style.visibility = 'visible';
      textareaForDeleteRef.current!.blur();
      textareaForDeleteRef.current!.style.visibility = 'hidden';
      textareaRef.current!.focus();
      textareaRef.current!.setSelectionRange(previousCaretPos.current, previousCaretPos.current);
      previousCaretPosForDeleteRef.current = null;
      caretForDeleteRef.current!.style.visibility = 'hidden';
      caretRef.current!.style.visibility = 'visible';
    }
  }

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

  // Function to detect changes between the previous and current input
  const findDifference = (oldText: string, newText: string) => {
    let prefixLastNewline = 0;
    // let prefixIndex = previousPressedKey.current === 'Backspace' ? previousCaretPos.current - 2 : previousCaretPos.current - 1;
    let prefixIndex = previousPressedKey.current === 'Backspace' ? textareaForDeleteRef.current!.selectionStart - 1 : previousCaretPos.current - 1;

    console.log('prefixIndex: ', prefixIndex);

    while(prefixIndex >= 0) {
      if(newText[prefixIndex] === '\n') {
        prefixLastNewline = prefixIndex + 1;

        break;
      }

      prefixIndex--;
    }

    let suffixFirstNewline = newText.length;
    // let suffixIndex = textareaRef.current?.selectionStart!;
    let suffixIndex = previousPressedKey.current === 'Backspace' ? textareaForDeleteRef.current!.selectionStart : textareaRef.current?.selectionStart!;
    console.log('suffixIndex: ', suffixIndex);

    while(suffixIndex <= newText.length - 1) {
      if(newText[suffixIndex] === '\n') {
        suffixFirstNewline = suffixIndex;

        break;
      }

      suffixIndex++;
    }

    console.log('prefixLastNewline: ', prefixLastNewline);
    console.log('suffixFirstNewline: ', suffixFirstNewline);

    // const prefix = newText.substring(0, prefixLastNewline);
    const changedSection = newText.substring(prefixLastNewline, suffixFirstNewline);
    // const suffix = newText.substring(suffixFirstNewline);

    return changedSection;
  };

  const processChanges = useCallback((oldText: string, newText: string) => {
    let changedSection = findDifference(oldText, newText);

    // Add logic here to process only the changed section as needed
    let changedRows;
    let changedRowsCount = [1];

    if(changedSection === '\n') {
      changedRows = [''];
    } else {
      [changedRowsCount, changedRows] = textSplitIntoRow(changedSection.split('\n'), textareaWidth);
    }

    const pos = Caret.getRelativePosition(textareaRef.current!);

    let activeRow = (pos.top - 3) / 28;
    // let activeRow = (pos.top - 4) / 28;

    if(previousPressedKey.current === 'Backspace') {
      console.log('Caret.getRelativePosition(textareaForDeleteRef.current!).top: ', Caret.getRelativePosition(textareaForDeleteRef.current!).top);
      activeRow = (Caret.getRelativePosition(textareaForDeleteRef.current!).top - 3) / 28;
      // activeRow = (Caret.getRelativePosition(textareaForDeleteRef.current!).top - 4) / 28;

      while(lineNumbers[activeRow] === '') {
        activeRow--;
      }
    }

    // console.log('lineNumbers in processChanges: ', lineNumbers);
    // console.log('activeRows in processChanges: ', activeRows);
    // let activeRowTest = activeRow;

    // console.log('activeRow after offset in processChanges before: ', activeRowTest);

    // console.log('previousCaretTop.current in processChanges: ', previousCaretTop.current);
    // console.log('caretRef.current!.style.top in processChanges: ', caretRef.current!.style.top);

    // console.log('activeRow after offset in processChanges after: ', activeRowTest);
    // console.log('activeRow original in processChanges before: ', activeRow);

    // console.log('activeRows[0] in processChanges: ', activeRows[0]);
    // console.log('previousActiveRowsHeadRef.current in processChanges', previousActiveRowsHeadRef.current);

    if(activeRow !== activeRows[0] && !whiteSpaceCreateNewlineRef.current && previousPressedKey.current !== 'Backspace') {
      activeRow = activeRows[0];
    }

    console.log('activeRow original in processChanges after: ', activeRow);

    if(whiteSpaceCreateNewlineRef.current) {
      console.log('reset whitespace');
      whiteSpaceCreateNewlineRef.current = false;
    }

    if(previousPressedKey.current === ' ' && newText[previousCaretPos.current] === '\n') {
      console.log('white space create newline');
      whiteSpaceCreateNewlineRef.current = true;
    }

    activeRow = Math.max(activeRow, 0);

    // Calculate how many lines the changedSection occupied before change
    let prefixStartIndex = previousCaretPos.current;
    let suffixStartIndex = previousCaretPos.current;

    if(previousPressedKey.current === 'Backspace') {
      console.log('textareaForDeleteRef.current!.selectionStart', textareaForDeleteRef.current!.selectionStart);
      console.log('prefixStartIndex: ', prefixStartIndex);
      prefixStartIndex = textareaForDeleteRef.current!.selectionStart;
      suffixStartIndex = previousCaretPosForDeleteRef.current! as number;
    }

    // let prevPrefixIndex = previousCaretPos.current - 1;
    let prevPrefixIndex = prefixStartIndex - 1;
    let prevPrefixLastNewline = 0

    while(prevPrefixIndex >= 0) {
      if(oldText[prevPrefixIndex] === '\n') {
        prevPrefixLastNewline = previousPressedKey.current === 'Backspace' ? prevPrefixIndex + 1 : prevPrefixIndex;

        break;
      }

      prevPrefixIndex--;
    }

    // let prevSuffixIndex = previousCaretPos.current;
    let prevSuffixIndex = suffixStartIndex;
    let prevSuffixFirstNewline = oldText.length;

    while(prevSuffixIndex <= oldText.length - 1) {
      if(oldText[prevSuffixIndex] === '\n') {
        prevSuffixFirstNewline = prevSuffixIndex;

        break;
      }

      prevSuffixIndex++;
    }

    // if(previousPressedKey.current === 'Backspace') {
    //   if(prevPrefixLastNewline !== 0) {
    //     prevPrefixLastNewline++;
    //   }
    // }

    console.log('previousCaretPos.current: ', previousCaretPos.current);
    console.log('previousCaretPosForDeleteRef.current: ', previousCaretPosForDeleteRef.current);
    console.log('prevPrefixLastNewline: ', prevPrefixLastNewline);
    console.log('prevSuffixFirstNewline: ', prevSuffixFirstNewline);

    console.log(`textSplitIntoRow(oldText.substring(prevPrefixLastNewline, prevSuffixFirstNewline).split('\n'), textareaWidth)[0]: `, textSplitIntoRow(oldText.substring(prevPrefixLastNewline, prevSuffixFirstNewline).split('\n'), textareaWidth)[0]);
    console.log(`textSplitIntoRow(oldText.substring(prevPrefixLastNewline, prevSuffixFirstNewline).split('\n'), textareaWidth)[1]: `, textSplitIntoRow(oldText.substring(prevPrefixLastNewline, prevSuffixFirstNewline).split('\n'), textareaWidth)[1]);

    const [splitedBeforeChangeLineCounts, splitedBeforeChangeLines] = textSplitIntoRow(oldText.substring(prevPrefixLastNewline, prevSuffixFirstNewline).split('\n'), textareaWidth);

    // let rowCountBeforeChange =
    //   textSplitIntoRow(oldText.substring(prevPrefixLastNewline, prevSuffixFirstNewline).split('\n'), textareaWidth)[0].
    //   reduce((sum, num) => sum + num);

    let rowCountBeforeChange = splitedBeforeChangeLineCounts.reduce((sum, num) => sum + num);

    rowCountBeforeChange = Math.max(rowCountBeforeChange, 1);

    const indexOfNewline = changedSection.indexOf('\n');

    console.log('oldText: ', oldText);
    console.log('newText: ', newText);
    console.log('changedSection: ', changedSection.split(''));
    console.log('activeRow: ', activeRow);
    console.log('rowCountBeforeChange: ', splitedBeforeChangeLines.length);
    console.log('isNewline: ', oldText[previousCaretPosForDeleteRef.current! - 1] === '\n');

    if(previousPressedKey.current === 'Backspace') {
      dispatch(decrease({
        changedRows,
        activeRow,
        lineNumbersOffset: splitedBeforeChangeLineCounts.length,
        rowCountBeforeChange: splitedBeforeChangeLines.length,
        changedRowsCount,
        deletedIsNewline: oldText[previousCaretPosForDeleteRef.current! - 1] === '\n',
      }));
    } else {
      dispatch(increase({
        changedSection,
        changedRows,
        activeRow,
        indexOfNewline,
        rowCountBeforeChange,
        textareaWidth,
        changedRowsCount,
      }));
    }
  }, [dispatch, lineNumbers, textareaWidth, activeRows]);

  const handleTextChange = useCallback((inputValue: string) => {
    const previousInput = previousInputRef.current;
    processChanges(previousInput, inputValue);
    previousInputRef.current = inputValue; // Update previous input for the next change
  }, [processChanges]);

  const recalculateRowsAndLineNumbers = useCallback(() => {
    const text = previousInputRef.current;
    let [newLineNumberCounts, newRows] = textSplitIntoRow(text.split('\n'), textareaWidth);

    console.log('newLineNumberCounts: ', newLineNumberCounts);
    console.log('newRows: ', newRows);

    if(newLineNumberCounts.length === 1 && newLineNumberCounts[0] === 0) {
      newLineNumberCounts = [1];
    }

    dispatch(reset({
      newLineNumbers: transferLineCountsToLineNumbers(newLineNumberCounts, 1),
      newRows,
    }));
  }, [textareaWidth, dispatch]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if(textareaRef.current) {
        handleCaret(textareaRef.current);
        setTextareaWidth(textareaRef.current.getBoundingClientRect().width);
        // if(previousInputRef.current) {
        //   handleTextChange(previousInputRef.current);
        // }
      }
    });

    resizeObserver.observe(textareaRef.current as HTMLTextAreaElement);

    return () => resizeObserver.disconnect();
  }, [handleCaret]);

  useEffect(() => {
      recalculateRowsAndLineNumbers();
  }, [textareaWidth, recalculateRowsAndLineNumbers]);

  // Make lineNumbers is scrolled synchronously with textarea
  useEffect(() => {
    const lineNumbersNode = lineNumbersRef.current;
    const textNode = textRef.current;

    if(lineNumbersNode && textNode) {
      const syncScroll = () => {
          const scrollTop = textNode.scrollTop;

          lineNumbersNode.scrollTop = scrollTop;
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

  return (
    <>
      <div
        className="w-[2px] h-6 bg-blue-500 absolute top-[23px] left-[68px] animate-blink z-50 invisible"
        ref={caretForDeleteRef}
      />
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
      <textarea
        ref={textareaForDeleteRef}
        onChange={(e) => {
          setInput(e.target.value);
          handleCaretForDelete(e.target);
        }}
        onKeyUp={handleKeyUp}
        style={{ width: 'calc(100% - 88px)', height: 'calc(100% - 40px)', left: '68px' }}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck="false"
        className="text-lg font-mono absolute z-20 invisible resize-none focus:outline-none bg-transparent caret-transparent overflow-hidden"
      />
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
            console.log('onChanged called');
            setInput(e.target.value);

            if(previousPressedKey.current !== 'Backspace') {
              handleTextChange(e.target.value);
            }
            previousCaretPos.current = e.target.selectionStart;
          }}
          onKeyDown={handleKeyDown}
          // onKeyUp={handleKeyUp}
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