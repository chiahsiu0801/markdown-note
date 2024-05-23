import { getNotes } from "@/lib/data";
import { FileText } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { NoteDocument } from "@/lib/models";
import { useRouter } from "next/navigation";

// interface NoteDocument {
//   title: string;
//   content?: string;
//   userId: string;
//   slug: string;
//   createdAt: Date;
//   updatedAt: Date;
//   _id: string; 
// }

type NotesProps = {
  notesUpdated: boolean;
}

const Notes = ({ notesUpdated }: NotesProps) => {
  const router = useRouter();
  
  const [notes, setNotes] = useState<NoteDocument[]>([]);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        console.log('fetchNotes called');
        const notes: NoteDocument[] = await getNotes();

        setNotes(notes);

        const latestNote = notes[notes.length - 1];

        router.push(`/notes/${latestNote._id}`);
        
      } catch (error) {
        
      }
    };

    fetchNotes();
  }, [notesUpdated, router]);

  return (
    <>
      {
        notes.map(note => {
          return (
            <Link 
              key={note._id}
              href={`/notes/${note._id}`}
              style={{ paddingLeft: '16px' }}
              className="group min-h-[27px] text-sm py-1 pr-3 w-full hover:bg-primary/5 flex items-center font-medium"
            >
              <FileText className="shrink-0 h-[18px] mr-2" />
              <span className="truncate">
                {note.title}
              </span>
            </Link>
          )
        })
      }
    </>
  );
}

export default Notes;