import mongoose from "mongoose";

const connection: {
  isConnected?: number;
} = {};

export const connectToDb = async (): Promise<void> => {
  try {
    if(connection.isConnected) {
      return;
    }

    const db = await mongoose.connect(process.env.MONGO as string);
    connection.isConnected = db.connections[0].readyState;
  } catch (error) {
    throw new Error((error as Error).message);
  }
}