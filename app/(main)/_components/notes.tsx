import { FileText } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckboxReactHookFormMultiple } from "./CheckboxReactHookFormMultiple";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import { fetchNotes, toggleIsDeleting } from "@/lib/features/note/noteSlice";

const Notes = () => {
  const dispatch = useAppDispatch();
  const { notes, isDeleting, renamingNoteId, newName } = useAppSelector((state: RootState) => state.notes);
  
  // const [notes, setNotes] = useState<NoteDocument[]>([]);
  const [transitioning, setTransitioning] = useState(false);

  // Function to toggle transitioning state for smooth transitions
  const toggleTransition = () => {
    setTransitioning(true);
    setTimeout(() => {
      setTransitioning(false);
    }, 100); // Match this duration with your CSS transition duration
  };

  useEffect(() => {
    dispatch(fetchNotes());
  }, [dispatch]);

  useEffect(() => {
    toggleTransition();
  }, [isDeleting]);

  return (
    <>
      {
        isDeleting ?
            <CheckboxReactHookFormMultiple items={notes} transitioning={transitioning} />
        :
        notes.map(note => {
          return (
            <Link 
              key={note._id}
              href={`/notes/${note._id}`}
              style={{ paddingLeft: '16px' }}
              className="group min-h-[27px] text-sm py-1 pr-3 w-full hover:bg-primary/5 flex items-center font-medium"
            >
              <FileText className={`shrink-0 h-[18px] mr-2`} />
              {
                note._id === renamingNoteId ?
                <span className="truncate">
                  {newName}
                </span>:
                <span className="truncate">
                  {note.title}
                </span>
              }
            </Link>
          )
        })
      }
    </>
  );
}

export default Notes;