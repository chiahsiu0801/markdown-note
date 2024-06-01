import mongoose from "mongoose";

export type NoteDocument = {
  title: string;
  content: string;
  userId: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  _id: string;
}

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      min: 2,
      max: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      max: 50,
    },
    password: {
      type: String,
      required: true,
      min: 6,
    },
    img: {
      type: Buffer,
    }
  },
  { timestamps: true }
);

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
    },
    userId: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const User = mongoose.models?.User || mongoose.model('User', userSchema);
export const Note = mongoose.models?.Note || mongoose.model('Note', noteSchema);
