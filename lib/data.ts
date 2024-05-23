"use server";

import { Types } from "mongoose";
import { Note, User } from "./models";
import { connectToDb } from "./utilsDb"
import { revalidatePath } from "next/cache";
import { NoteDocument } from "./models";

export const getNotes = async () => {
  try {
    connectToDb();
    const notes: NoteDocument[] = await Note.find().lean();

    return notes.map(note => ({
      ...note,
      _id: note._id.toString(),
    }));

  } catch (error) {
    console.log(error);
    throw new Error('Failed to fetch notes!');
  }
};

export const getNote = async (id: string) => {
  try {
    connectToDb();
    const note = await Note.findById(id);

    return JSON.parse(JSON.stringify(note));
  } catch (error) {
    console.log(error);
    throw new Error('Failed to fetch note!');
  }
};

export const getUser = async (id: Types.ObjectId) => {
  try {
    connectToDb();
    const user = await User.findById(id);

    return user;
  } catch (error) {
    console.log(error);
    throw new Error('Failed to fetch user!');
  }
}
