"use server";

import { Types } from "mongoose";
import { Note, User } from "./models";
import { connectToDb } from "./utilsDb"
import { revalidatePath } from "next/cache";
import { NoteDocument } from "./models";

export const getNotes = async (userId: string) => {
  try {
    connectToDb();
    const notes: NoteDocument[] = await Note.find({ userId }).lean();

    return notes.map(note => ({
      ...note,
      _id: note._id.toString(),
    }));

  } catch (error) {
    throw new Error('Failed to fetch notes!');
  }
};

export const getUser = async (id: string) => {
  try {
    connectToDb();
    const user = await User.findById(id);

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    throw new Error('Failed to fetch user!');
  }
}
