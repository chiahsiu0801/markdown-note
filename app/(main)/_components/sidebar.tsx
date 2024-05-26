import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button";
import { ChevronsLeft, MenuIcon, Plus, Trash2, Undo2 } from "lucide-react";
import { createNote } from "@/lib/action";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { RootState, AppDispatch } from "@/lib/store"
import { toggleSidebar } from '../../../lib/features/sidebar/sidebarSlice';
import { useRouter } from "next/navigation";

import Notes from "./notes";
import Item from "./item";
import { fetchNotes, toggleIsDeleting } from "@/lib/features/note/noteSlice";

const Sidebar = () => {
  const router = useRouter();

  const dispatch = useAppDispatch();
  const { sidebarCollapse } = useAppSelector((state: RootState) => state.sidebar);
  const { isDeleting } = useAppSelector((state: RootState) => state.notes);
  // const [notesUpdated, setNotesUpdated] = useState(false);
  // const [isDeleting, setIsDeleting] = useState(false);

  const handleCreate = async () => {
    const promise = createNote();

    toast.promise(promise, {
      loading: 'Creating a new note...',
      success: 'New note created!',
      error: 'Failed to create a new note',
    });

    // Wait for the note creation to complete
    const createdNote = await promise;

    console.log('createdNote', createdNote);

    dispatch(fetchNotes());

    router.push(`/notes/${createdNote._id}`);
  }

  const handleDelete = () => {
    // setIsDeleting(prevState => !prevState);
    dispatch(toggleIsDeleting());
  }

  return (
    <div 
      className={`w-full lg:w-[260px] h-full px-3 py-4 fixed flex transition-transform ease-custom-ease duration-500 z-50 ${sidebarCollapse ? `-translate-x-full lg:-translate-x-[177px]` : `-translate-x-0 bg-slate-200 z-[99999]`}`}
    >
      <div className="w-3/4 flex flex-col">
        <div className="mb-2 flex ml-2 items-center">
          <Avatar>
            <AvatarImage src="https://cdn-icons-png.flaticon.com/512/1534/1534039.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <p className="mx-2 text-center text-sm">ChisHsiu Chang</p>
        </div>
        <Item
          onClick={() => handleCreate()}
          label="New note"
          icon={Plus}
        />
        {
          isDeleting ?
          <Item
            onClick={() => handleDelete()}
            label="Cancel delete"
            icon={Undo2}
          />:
          <Item
            onClick={() => handleDelete()}
            label="Delete note"
            icon={Trash2}
          />
        }
        <div className="mt-2">
          <Notes />
        </div>
      </div>
      <div className={` absolute z-50 lg:right-4 ${sidebarCollapse ? `left-[calc(100%+12px)] lg:left-auto` : `left-[calc(100%-50px)]`}`} onClick={() => dispatch(toggleSidebar())}>
        <Button variant="ghost" size="icon">
          <div className={`hidden lg:block transition-transform duration-700 ${sidebarCollapse && `rotate-180`}`}>
            <ChevronsLeft />
          </div>
          <div className="block lg:hidden">
            <MenuIcon />
          </div>
        </Button>
      </div>
    </div>
   );
}
 
export default Sidebar;