import { Types } from "mongoose";
import { Document, User } from "./models";
import { connectToDb } from "./utils"

export const getDocuments = async () => {
  try {
    connectToDb();
    const documents = await Document.find();

    return documents;
  } catch (error) {
    console.log(error);
    throw new Error('Failed to fetch documents!');
  }
};

export const getDocument = async (slug: string) => {
  try {
    connectToDb();
    const document = await Document.find({slug});

    return document;
  } catch (error) {
    console.log(error);
    throw new Error('Failed to fetch document!');
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
