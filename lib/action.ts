"use server";

import { revalidatePath } from "next/cache";
import { Note } from "./models";
import { connectToDb } from "./utilsDb";

export const createNote = async () => {
  try {
    connectToDb();
    const newNote = new Note({
      title: 'Untitled',
      content: '',
      userId: 'Guest',
      slug: 'newnote',
    });

    await newNote.save();
    console.log("saved to db");
    revalidatePath("/notes");
  } catch (err) {
    console.log(err);
    return { error: "Something went wrong!" };
  }
};

export const saveNote = async (_id: string, updateData: { content: string } ) => {
  try {
    connectToDb();

    const updatedNote = await Note.findByIdAndUpdate(_id, updateData, { new: true });

    if (!updatedNote) {
      return { error: "Note not found!" };
    }

    console.log("Note updated:", updatedNote);

    return updatedNote;
  } catch (err) {
    console.log(err);
    return { error: "Something went wrong!" };
  }
};
