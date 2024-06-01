"use server";

import { revalidatePath } from "next/cache";
import { Note, User } from "./models";
import { connectToDb } from "./utilsDb";
import { writeFile } from "fs/promises";
import path from "path";
import bcrypt from "bcryptjs";

export const createNote = async (userId: string) => {
  try {
    connectToDb();
    const initialNote = new Note({
      title: 'Untitled',
      content: '',
      userId: userId,
      slug: 'newnote',
    });

    const newNote = await initialNote.save();

    return JSON.parse(JSON.stringify(newNote));
  } catch (err) {
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

    return JSON.parse(JSON.stringify(updatedNote));
  } catch (err) {
    return { error: "Something went wrong!" };
  }
};

export const getNote = async (id: string) => {
  try {
    await connectToDb();
    const note = await Note.findById(id);

    return note;
  } catch (error) {
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

    return { message: "Notes deleted successfully!", result };
  } catch (err) {
    return { error: "Something went wrong!" };
  }
};

export const register = async(formData: FormData) => {
  try {
    const { username, email, password } =
    Object.fromEntries(formData);

    const avatarImgData = formData.get('avatarImg') as File;

    let buffer = null;

    if (formData.get('avatarImg') !== '') {
      buffer = Buffer.from(await avatarImgData.arrayBuffer());
    }

    connectToDb();

    const user = await User.findOne({ email });

    if (user) {
      throw new Error('Email has been used!');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password as string, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      img: buffer,
    });

    await newUser.save();

    return { message: "Account created!" };
  } catch (error: any) {
    return { error: error.message };
  }
}
