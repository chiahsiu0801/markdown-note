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
