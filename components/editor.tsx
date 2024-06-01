import { useEffect, useRef, useState, useCallback } from "react"
import { Caret } from 'textarea-caret-ts'
import { cn, textSplitIntoRow, transferLineCountsToLineNumbers } from "@/lib/utils"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { RootState } from "@/lib/store"
import { increase, decrease, reset } from '../lib/features/editor/editorSlice';
import { usePathname } from "next/navigation"

import EditorLine from "./editorLine"
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

type EditorProps = {
  input: string;
  setInput: (value: string) => void;
  editorFocus: boolean;
  initialContent: string | undefined;
  currentNoteId: string;
}

const Editor = ({ input, setInput, editorFocus, initialContent }: EditorProps) => {
  const pathname = usePathname().split('/');
  const noteIdRef = useRef('');

  const dispatch = useAppDispatch();
  const { rows, lineNumbers } = useAppSelector((state: RootState) => state.editor);

  const [textareaWidth, setTextareaWidth] = useState(0);
  const [activeRows, setActiveRows] = useState<number[]>([]);

  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaForDeleteRef = useRef<HTMLTextAreaElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLDivElement>(null);
  const activeRowShadowDeleteRef = useRef<HTMLDivElement>(null);
  const previousInputRef = useRef<string>(input);
  const previousCaretTop = useRef<number>(3);
  const initialCaretTop = useRef<number>(3);
  const previousCaretPos = useRef<number>(0);
  const previousCaretPosForDeleteRef = useRef<number | null>(null);
  const previousPressedKey = useRef<string>('');
  const pastedRef = useRef<boolean>(false);
  const pastedForDeleteRef = useRef<boolean>(false);
  const whiteSpaceCreateNewlineRef = useRef<boolean>(false);

  const handleActiveRows = useCallback((target: HTMLTextAreaElement) => {
    const activeLineNumber = parseInt(target.style.top) / 28;

    let forwardIndex = activeLineNumber;
    let afterwardIndex = activeLineNumber + 1;

    while(typeof lineNumbers[forwardIndex] !== 'number' && forwardIndex >= 0) {
      forwardIndex--;
    }

    while(typeof lineNumbers[afterwardIndex] !== 'number' && afterwardIndex < lineNumbers.length) {
      afterwardIndex++;
    }

    const newActiveRows = Array.from({ length: (afterwardIndex - forwardIndex) }, (_, i) => i + forwardIndex);
    setActiveRows(newActiveRows);
  }, [lineNumbers]);

  const handleCaret = useCallback((target: HTMLTextAreaElement): void => {
    setTimeout(() => {
      const posCorrection = Caret.getRelativePosition(target);
      const textareaWidthCorrection = textareaWidth === 0 ? textareaRef.current!.getBoundingClientRect().width : textareaWidth;

      if(!caretRef.current) {
        return;
      }


      // If the text is too long and close to right border of textarea,
      // Caret will have some bug in calculation, use the code below to adjust caret position
      if(posCorrection.top === previousCaretTop.current + 28 && previousPressedKey.current !== 'Enter' && previousPressedKey.current !== 'ArrowDown' && previousPressedKey.current !== 'ArrowUp' && previousPressedKey.current !== 'ArrowLeft' && previousPressedKey.current !== 'ArrowRight' && !pastedRef.current) {

        const activeRow = (previousCaretTop.current - initialCaretTop.current) / 28;
        const activeSpan = document.getElementById('rowsContainer')?.querySelectorAll('span')[activeRow];

        if(activeSpan!.getBoundingClientRect().width >= textareaWidthCorrection) {
          caretRef.current!.style.left = activeSpan!.getBoundingClientRect().width - 2 + 'px';
        } else {
          target.style.top = posCorrection.top - initialCaretTop.current + 'px';
          caretRef.current!.style.left = posCorrection.left >= textareaWidthCorrection ? posCorrection.left - 2 + 'px' : posCorrection.left + 'px';
          caretRef.current!.style.top = posCorrection.top + 'px';
        }
      } else {
        target.style.top = posCorrection.top - initialCaretTop.current + 'px';
        caretRef.current!.style.left = posCorrection.left >= textareaWidthCorrection ? posCorrection.left - 2 + 'px' : posCorrection.left + 'px';
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

  const handleActiveRowForDelete = (target: HTMLTextAreaElement): void => {
    setTimeout(() => {
      if(pastedForDeleteRef.current === true) {
        textareaForDeleteRef.current!.scrollTop = textRef.current!.scrollTop;
      }

      const pos = Caret.getRelativePosition(target);

      activeRowShadowDeleteRef.current!.style.visibility = 'visible';
      activeRowShadowDeleteRef.current!.style.top = pos.top - textareaForDeleteRef.current!.scrollTop - initialCaretTop.current + 82 + 'px';
    }, 0);
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
        caretRef.current!.style.visibility = 'hidden';
        document.getElementById('rowsContainer')!.style.color = 'transparent';
        document.getElementById('rowsContainer')!.style.visibility = 'hidden';
        textareaForDeleteRef.current!.style.visibility = 'visible';
        textareaForDeleteRef.current!.scrollTop = textRef.current!.scrollTop;

        if(previousCaretPosForDeleteRef.current === null) {
          previousCaretPosForDeleteRef.current = previousCaretPos.current;
          textareaForDeleteRef.current!.focus();
          textareaForDeleteRef.current!.value = input;
          textareaForDeleteRef.current!.setSelectionRange(previousCaretPos.current, previousCaretPos.current);
        }

        break;
      default:
        handleCaret(target);

        break;
    }
  }, [input, setInput, handleCaret]);

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if(e.key === 'Backspace') {
      handleTextChange(textareaForDeleteRef.current!.value);

      previousCaretPos.current = textareaForDeleteRef.current!.selectionStart;

      document.getElementById('rowsContainer')!.style.color = 'black';
      document.getElementById('rowsContainer')!.style.visibility = 'visible';
      textareaForDeleteRef.current!.blur();
      textareaForDeleteRef.current!.style.visibility = 'hidden';
      textareaRef.current!.focus();
      textareaRef.current!.setSelectionRange(previousCaretPos.current, previousCaretPos.current);
      previousCaretPosForDeleteRef.current = null;

      setTimeout(() => {
        activeRowShadowDeleteRef.current!.style.visibility = 'hidden';
      }, 0);
      caretRef.current!.style.visibility = 'visible';

      textRef.current!.scrollTop = textareaForDeleteRef.current!.scrollTop;
      pastedForDeleteRef.current = false;
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

    if(textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current!.setSelectionRange(setPoint! - offset, setPoint! - offset);

      textRef.current!.scrollTop = scrollOffset!;

      handleCaret(textareaRef.current!);
    }

    return;
  }

  // Function to detect changes between the previous and current input
  const findDifference = (oldText: string, newText: string) => {
    let prefixLastNewline = 0;
    let prefixIndex = previousPressedKey.current === 'Backspace' ? textareaForDeleteRef.current!.selectionStart - 1 : previousCaretPos.current - 1;

    while(prefixIndex >= 0) {
      if(newText[prefixIndex] === '\n') {
        prefixLastNewline = prefixIndex + 1;

        break;
      }

      prefixIndex--;
    }

    let suffixFirstNewline = newText.length;
    let suffixIndex = previousPressedKey.current === 'Backspace' ? textareaForDeleteRef.current!.selectionStart : textareaRef.current?.selectionStart!;

    while(suffixIndex <= newText.length - 1) {
      if(newText[suffixIndex] === '\n') {
        suffixFirstNewline = suffixIndex;

        break;
      }

      suffixIndex++;
    }
    const changedSection = newText.substring(prefixLastNewline, suffixFirstNewline);

    return changedSection;
  };

  const processChanges = useCallback((oldText: string, newText: string) => {
    const textareaWidthCorrection = textareaWidth === 0 ? textareaRef.current!.getBoundingClientRect().width : textareaWidth;
    let changedSection = findDifference(oldText, newText);

    // Add logic here to process only the changed section as needed
    let changedRows;
    let changedRowsCount = [1];

    if(changedSection === '\n') {
      changedRows = [''];
    } else {
      [changedRowsCount, changedRows] = textSplitIntoRow(changedSection.split('\n'), textareaWidthCorrection);
    }

    const pos = Caret.getRelativePosition(textareaRef.current!);

    let activeRow = (pos.top - initialCaretTop.current) / 28;

    if(previousPressedKey.current === 'Backspace') {
      activeRow = (Caret.getRelativePosition(textareaForDeleteRef.current!).top - initialCaretTop.current) / 28;

      while(lineNumbers[activeRow] === '') {
        activeRow--;
      }
    }

    if(activeRow !== activeRows[0] && !whiteSpaceCreateNewlineRef.current && previousPressedKey.current !== 'Backspace') {
      activeRow = activeRows[0];
    }

    if(whiteSpaceCreateNewlineRef.current) {
      whiteSpaceCreateNewlineRef.current = false;
    }

    if(previousPressedKey.current === ' ' && newText[previousCaretPos.current] === '\n') {
      whiteSpaceCreateNewlineRef.current = true;
    }

    activeRow = Math.max(activeRow, 0);

    // Calculate how many lines the changedSection occupied before change
    let prefixStartIndex = previousCaretPos.current;
    let suffixStartIndex = previousCaretPos.current;

    if(previousPressedKey.current === 'Backspace') {
      prefixStartIndex = textareaForDeleteRef.current!.selectionStart;
      suffixStartIndex = previousCaretPosForDeleteRef.current! as number;
    }

    let prevPrefixIndex = prefixStartIndex - 1;
    let prevPrefixLastNewline = 0

    while(prevPrefixIndex >= 0) {
      if(oldText[prevPrefixIndex] === '\n') {
        prevPrefixLastNewline = previousPressedKey.current === 'Backspace' ? prevPrefixIndex + 1 : prevPrefixIndex;

        break;
      }

      prevPrefixIndex--;
    }

    let prevSuffixIndex = suffixStartIndex;
    let prevSuffixFirstNewline = oldText.length;

    while(prevSuffixIndex <= oldText.length - 1) {
      if(oldText[prevSuffixIndex] === '\n') {
        prevSuffixFirstNewline = prevSuffixIndex;

        break;
      }

      prevSuffixIndex++;
    }

    const [splitedBeforeChangeLineCounts, splitedBeforeChangeLines] = textSplitIntoRow(oldText.substring(prevPrefixLastNewline, prevSuffixFirstNewline).split('\n'), textareaWidthCorrection);

    let rowCountBeforeChange = splitedBeforeChangeLineCounts.reduce((sum, num) => sum + num);

    rowCountBeforeChange = Math.max(rowCountBeforeChange, 1);

    const indexOfNewline = changedSection.indexOf('\n');

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
        textareaWidth: textareaWidthCorrection,
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

    let newLineNumberCounts;
    let newRows;

    if(textareaWidth === 0) {
      [newLineNumberCounts, newRows] = textSplitIntoRow(text.split('\n'), textareaRef.current!.getBoundingClientRect().width);
    } else {
      [newLineNumberCounts, newRows] = textSplitIntoRow(text.split('\n'), textareaWidth);
    }

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
        activeRowShadowDeleteRef.current!.style.width = textareaRef.current.getBoundingClientRect().width + 'px';
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

  useEffect(() => {
    if(pathname[pathname.length - 1] !== noteIdRef.current && initialContent !== undefined) {
      previousInputRef.current = initialContent || "";
      recalculateRowsAndLineNumbers();

      noteIdRef.current = pathname[pathname.length - 1];
    }
  }, [recalculateRowsAndLineNumbers, initialContent, pathname]);

  useEffect(() => {
    const initialCaretPos = Caret.getRelativePosition(textareaRef.current!);

    if((initialCaretPos.top - 3) % 28 === 0) {
      initialCaretTop.current = 3;
    } else {
      initialCaretTop.current = 4;
    }
  });

  useEffect(() => {
    activeRowShadowDeleteRef.current!.style.width = textareaRef.current!.getBoundingClientRect().width + 'px';
  }, []);

  return (
    <>
      <div
        ref={lineNumbersRef}
        className="w-12 pr-3 text-right text-lg font-mono rounded-lg rounded-r-none bg-slate-400 text-gray-600 border-gray-300 overflow-hidden resize-none select-none focus:outline-none leading-6"
        style={{ userSelect: 'none' }}
      >
        {
          noteIdRef.current &&
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
          handleActiveRowForDelete(e.target);
        }}
        onKeyUp={handleKeyUp}
        style={{ width: 'calc(100% - 88px)', height: 'calc(100% - 40px)', left: '68px' }}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck="false"
        className="text-lg font-mono absolute z-20 invisible resize-none focus:outline-none bg-transparent caret-red-500 overflow-hidden"
      />
      <div
        className="h-full text-lg bg-slate-400 absolute font-mono z-10 overflow-auto cursor-text"
        ref={textRef}
        style={{ width: 'calc(100% - 88px)', height: 'calc(100% - 40px)', left: '68px' }}
      >
        <div
          className="h-full"
          id="rowsContainer"
          onClick={(e) => handleCaretByClick(e)}
        >
          <div
            className={`h-[28px] bg-[#cad0d86f] fixed invisible text-transparent`}
            ref={activeRowShadowDeleteRef}
          >
            delete
          </div>
          {
            noteIdRef.current ?
            rows.map((row, index) => {
              let active = false;

              if(activeRows.includes(index)) {
                active = true;
              }

              return <EditorLine key={index} row={row} width={textareaWidth} active={active} />
            }):
            <Skeleton count={36} />
          }
        </div>
        {
          noteIdRef.current &&
          <div
            className={
              cn(`w-[2px] h-6 bg-blue-500 absolute top-[3px] left-0 animate-blink`,
                !editorFocus && `invisible`
              )
            }
            ref={caretRef}
          />
        }
        <textarea
          ref={textareaRef}
          value={input}
          autoFocus
          onChange={(e) => {
            setInput(e.target.value);

            if(previousPressedKey.current !== 'Backspace') {
              handleTextChange(e.target.value);
            }
            previousCaretPos.current = e.target.selectionStart;
          }}
          onKeyDown={handleKeyDown}
          onPaste={(e) => {
            pastedRef.current = true;
            pastedForDeleteRef.current = true;
            handleCaret(e.currentTarget)
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