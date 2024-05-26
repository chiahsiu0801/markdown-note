"use server";

import { revalidatePath } from "next/cache";
import { Note } from "./models";
import { connectToDb } from "./utilsDb";

export const createNote = async () => {
  try {
    connectToDb();
    const initialNote = new Note({
      title: 'Untitled',
      content: '',
      userId: 'Guest',
      slug: 'newnote',
    });

    const newNote = await initialNote.save();
    console.log("saved to db");

    return JSON.parse(JSON.stringify(newNote));
    // revalidatePath("/notes");
  } catch (err) {
    console.log(err);
    return { error: "Something went wrong!" };
  }
};

export const saveNote = async (_id: string, updateData: { content?: string, title?: string } ) => {
  try {
    connectToDb();

    const updatedNote = await Note.findByIdAndUpdate(_id, updateData, { new: true });

    if (!updatedNote) {
      return { error: "Note not found!" };
    }

    console.log("Note updated:", updatedNote);

    return JSON.parse(JSON.stringify(updatedNote));
  } catch (err) {
    console.log(err);
    return { error: "Something went wrong!" };
  }
};

export const getNote = async (id: string) => {
  try {
    await connectToDb();
    const note = await Note.findById(id);

    console.log('note in getNote: ', note);

    return note.content;
  } catch (error) {
    console.log(error);
    throw new Error('Failed to fetch note!');
  }
};

export const deleteNotes = async (ids: string[]) => {
  try {
    // Ensure the database connection is established
    await connectToDb();

    // Delete multiple notes by their IDs
    const result = await Note.deleteMany({ _id: { $in: ids } });

    // Check if any notes were deleted
    if (result.deletedCount === 0) {
      return { error: "No notes found to delete!" };
    }

    console.log("Notes deleted:", result);

    return { message: "Notes deleted successfully!", result };
  } catch (err) {
    // Log and return the error message
    console.log(err);
    return { error: "Something went wrong!" };
  }
};
