import mongoose from "mongoose";

const connection: {
  isConnected?: number;
} = {};

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