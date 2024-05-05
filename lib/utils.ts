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
  return context.measureText(text).width;
};

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
