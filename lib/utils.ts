import mongoose from "mongoose";

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const connection: {
  isConnected?: number;
} = {};

// Utility function to measure text width
export const measureTextWidth = (font: string, text: string): number => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  context.font = font;

  const whiteSpace = ' '; // 10.8369140625
  // console.log('whiteSpace width: ', context.measureText(whiteSpace));
  const textTrimEndLength = text.trimEnd().length;
  const textLength = text.length;
  // let whiteSpaceWidthOffset = 0;

  // if(text.trim() === '') {
  //   whiteSpaceWidthOffset = text.length;
  // } else if(textTrimEndLength !== textLength) {
  //   whiteSpaceWidthOffset = textLength - textTrimEndLength;
  // }

  const { actualBoundingBoxLeft, actualBoundingBoxRight } = context.measureText(text);
  return context.measureText(text).width;
  // return Math.ceil(Math.abs(actualBoundingBoxLeft) + Math.abs(actualBoundingBoxRight)) + (whiteSpaceWidthOffset * context.measureText(whiteSpace).width);
};

export const textSplitIntoRow = (value: string[], textareaWidth: number): [number[], string[]] => {
  let lineCountsOfRows: number[] = [];
  let lines: string[] = [];

  const font = `18px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`
  const spaceWidth = measureTextWidth(font, ' ');

  value.map((row: string) => {
    let count = 0;

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
  })

  return [lineCountsOfRows, lines];
}

export const offsetLineNumbers = (lineNumbersArr: (number | string)[], offsetValue: number): (number | string)[] => {
  return lineNumbersArr.map(lineNumber => {
    if(typeof lineNumber === 'number') {
      return lineNumber + offsetValue;
    } else {
      return lineNumber;
    }
  })
}

export const transferLineCountsToLineNumbers = (lineCountsArr: number[], startlineNumber: number): (number | string)[] => {
  const lineNumbersArr = [];
  let lineNumber = startlineNumber;

  while(lineCountsArr.length > 0) {
    const lineCounts = lineCountsArr.shift();
    lineNumbersArr.push(lineNumber);

    if(lineCounts && lineCounts > 1) {
      Array(lineCounts - 1).fill('').forEach((_) => lineNumbersArr.push(''));
    }

    lineNumber++;
  }

  return lineNumbersArr;
}

export const connectToDb = async (): Promise<void> => {
  try {
    if(connection.isConnected) {
      console.log('Using existing connection');

      return;
    }

    const db = await mongoose.connect(process.env.MONGO as string);
    connection.isConnected = db.connections[0].readyState;
  } catch (error) {
    console.log(error);
    throw new Error((error as Error).message);
  }
}
