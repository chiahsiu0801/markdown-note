import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { offsetLineNumbers, textSplitIntoRow, transferLineCountsToLineNumbers } from '@/lib/utils';

interface EditorState {
  // input: string;
  lineNumbers: (number | string)[];
  rows: string[];
  // textareaWidth: number;
  // activeRows: number[];
}

interface IncreasePayload {
  changedSection: string;
  changedRows: string[];
  activeRow: number;
  indexOfNewline: number;
  rowCountBeforeChange: number;
  textareaWidth: number;
  changedRowsCount: number[];
}

interface DecreasePayload {
  changedRows: string[];
  activeRow: number;
  lineNumbersOffset: number;
  rowCountBeforeChange: number;
  changedRowsCount: number[];
  deletedIsNewline: boolean;
}

interface ResetPayload {
  newLineNumbers: (number | string)[];
  newRows: string[];
}

const initialState: EditorState = {
  // input: '',
  lineNumbers: [1],
  rows: [],
  // textareaWidth: 0,
  // activeRows: []
};

const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    increase: (state, action: PayloadAction<IncreasePayload>) => {
      const { 
        changedSection,
        changedRows,
        activeRow,
        indexOfNewline,
        rowCountBeforeChange,
        textareaWidth,
        changedRowsCount,
      } = action.payload;

      const suffixPrevLineNumbers = state.lineNumbers.slice(0, activeRow);

      let changedRowsLineNumberStart = 0;
      for(let i = suffixPrevLineNumbers.length - 1; i >= 0; i--) {
        if(suffixPrevLineNumbers[i] !== '') {
          changedRowsLineNumberStart = suffixPrevLineNumbers[i] as number;

          break;
        }
      }
      let changedRowsLineNumber: (number | string)[] = [changedRowsLineNumberStart! + 1];

      if(changedRowsCount.length === 1) {
        Array(changedRowsCount[0] - 1).fill('').forEach((_) => changedRowsLineNumber.push(''));
      }

      if(changedSection === '\n') {
        state.rows = [...state.rows.slice(0, activeRow), ...changedRows, ...state.rows.slice(activeRow)];
        state.lineNumbers = [...state.lineNumbers.slice(0, activeRow), ...changedRowsLineNumber, ...offsetLineNumbers(state.lineNumbers.slice(activeRow), 1)];
        
        return;
      }

      // Only white spaces
      if(changedSection.split('').every(char => char === ' ')) {
        state.rows = [...state.rows.slice(0, activeRow), ...changedRows, ...state.rows.slice(activeRow + 1)];
        state.lineNumbers = [...state.lineNumbers.slice(0, activeRow), ...changedRowsLineNumber, ...state.lineNumbers.slice(activeRow + 1)];
        
        return;
      }

      // With newline
      if(changedSection.includes('\n')) {
        const [changedRowsCountBeforeNewline, changedRowsBeforeNewline] = textSplitIntoRow(changedSection.substring(0, indexOfNewline).split('\n'), textareaWidth);
        const [changedRowsCountAfterNewline, changedRowsAfterNewline] = textSplitIntoRow(changedSection.substring(indexOfNewline + 1).split('\n'), textareaWidth);
        const changedRowsLineNumberBefore: (number | string)[] = transferLineCountsToLineNumbers(changedRowsCountBeforeNewline, changedRowsLineNumberStart + 1);
        const changedRowsLineNumberAfter: (number | string)[] = transferLineCountsToLineNumbers(changedRowsCountAfterNewline, changedRowsLineNumberStart + changedRowsCountBeforeNewline.length + 2);

        state.rows = [...state.rows.slice(0, activeRow), ...changedRowsBeforeNewline, ...changedRowsAfterNewline, ...state.rows.slice(activeRow + rowCountBeforeChange)];
        state.lineNumbers = [...state.lineNumbers.slice(0, activeRow), ...changedRowsLineNumberBefore, ...changedRowsLineNumberAfter, ...offsetLineNumbers(state.lineNumbers.slice(activeRow + rowCountBeforeChange), 1)];
        
        return;
      }

      // Other situation
      state.rows = [...state.rows.slice(0, activeRow), ...changedRows, ...state.rows.slice(activeRow + rowCountBeforeChange)];
      state.lineNumbers = [...state.lineNumbers.slice(0, activeRow), ...changedRowsLineNumber, ...state.lineNumbers.slice(activeRow + rowCountBeforeChange)];

      return;
    },
    decrease: (state, action: PayloadAction<DecreasePayload>) => {
      const {
        changedRows,
        activeRow,
        lineNumbersOffset,
        rowCountBeforeChange,
        changedRowsCount,
        deletedIsNewline,
      } = action.payload;

      const suffixPrevLineNumbers = state.lineNumbers.slice(0, activeRow);

      let changedRowsLineNumberStart = 0;
      let previousRowCount = 0;

      for(let i = suffixPrevLineNumbers.length - 1; i >= 0; i--) {
        previousRowCount++;

        if(suffixPrevLineNumbers[i] !== '') {
          changedRowsLineNumberStart = suffixPrevLineNumbers[i] as number;

          break;
        }
      }

      let changedRowsLineNumber: (number | string)[] = [changedRowsLineNumberStart! + 1];

      if(changedRowsCount.length === 1 && changedRowsCount[0] !== 0) {
        Array(changedRowsCount[0] - 1).fill('').forEach((_) => changedRowsLineNumber.push(''));
      }

      if(deletedIsNewline) {
        state.rows = [...state.rows.slice(0, activeRow), ...changedRows, ...state.rows.slice(activeRow + rowCountBeforeChange)];
        state.lineNumbers = [...state.lineNumbers.slice(0, activeRow), ...changedRowsLineNumber, ...offsetLineNumbers(state.lineNumbers.slice(activeRow + rowCountBeforeChange), -(lineNumbersOffset - 1))];
        return;
      }

      state.rows = [...state.rows.slice(0, activeRow), ...changedRows, ...state.rows.slice(activeRow + rowCountBeforeChange)];
      state.lineNumbers = [...state.lineNumbers.slice(0, activeRow), ...changedRowsLineNumber, ...offsetLineNumbers(state.lineNumbers.slice(activeRow + rowCountBeforeChange), -(lineNumbersOffset - 1))];
      return;
    },
    reset: (state, action: PayloadAction<ResetPayload>) => {
      const { newLineNumbers, newRows } = action.payload;

      state.lineNumbers = newLineNumbers;
      state.rows = newRows;
    }
  }
});

export const { increase, decrease, reset } = editorSlice.actions;
export default editorSlice.reducer;
