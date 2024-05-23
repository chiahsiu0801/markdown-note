import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button";
import { ChevronsLeft, MenuIcon, Plus } from "lucide-react";
import { createNote } from "@/lib/action";
import { toast } from "sonner";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { RootState, AppDispatch } from "@/lib/store"
import { toggleSidebar } from '../../../lib/features/sidebar/sidebarSlice';

import Notes from "./notes";
import Item from "./item";

type SidebarProps = {
  sidebarCollapse: boolean;
  setSidebarCollapse: (value: boolean | ((prevState: boolean) => boolean)) => void;
};

const Sidebar = () => {
  const dispatch = useAppDispatch();
  const { sidebarCollapse } = useAppSelector((state: RootState) => state.sidebar);
  const [notesUpdated, setNotesUpdated] = useState(false);

  const handleCreate = async () => {
    const promise = createNote();

    toast.promise(promise, {
      loading: 'Creating a new note...',
      success: 'New note created!',
      error: 'Failed to create a new note',
    });

    // Wait for the note creation to complete
    await promise;
    // Toggle the state to trigger a re-render of Notes
    setNotesUpdated(prevState => !prevState);
  }

  return (
    <div 
      className={`w-full lg:w-[260px] h-full px-3 fixed flex transition-all duration-300 ${sidebarCollapse ? `-translate-x-3/4 lg:-translate-x-[177px] bg-transparent` : `-translate-x-0 bg-slate-200 z-[99999]`}`}
      // style={{
      //   transform: sidebarCollapse ? 'translate(calc(-177px), 0)' : 'translate(0, 0)',
      // }}
    >
      <div className="w-3/4 flex flex-col">
        <div className="mb-2 flex justify-center items-center">
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
        <div className="mt-2">
          <Notes notesUpdated={notesUpdated} />
        </div>
      </div>
      <div className={`w-1/4 absolute -top-1 lg:right-1 ${sidebarCollapse ? `-right-3` : `left-[calc(100%-50px)]`}`} onClick={() => dispatch(toggleSidebar())}>
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