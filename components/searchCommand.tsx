"use client";

import { useEffect, useState } from "react";
import { File } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import { onClose, toggle } from "@/lib/features/search/searchSlice";
import { useSession } from "next-auth/react";

const SearchCommand = () => {
  const router = useRouter();

  const { data: session } = useSession();

  const dispatch = useAppDispatch();
  const { isOpen } = useAppSelector((state: RootState) => state.search);
  const { notes } = useAppSelector((state: RootState) => state.notes);
  const [isMounted, setIsMounted] = useState(false);

  const onSelect = (id: string) => {
    router.push(`/notes/${id}`);
    dispatch(onClose());
  }

  useEffect(() => {
    setIsMounted(true);
  }, [])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if(e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        dispatch(toggle());
      }
    }

    document.addEventListener('keydown', down);

    return () => document.removeEventListener('keydown', down);
  }, [dispatch])

  if(!isMounted) {
    return null;
  }

  return ( 
    <CommandDialog open={isOpen} onOpenChange={() => {dispatch(onClose())}}>
      <CommandInput placeholder={`Search ${session?.user?.name}'s notes...`} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Notes">
          {
            notes.map(note => (
              <CommandItem
                key={note._id}
                value={`${note._id}-${note.title}`}
                title={note.title}
                onSelect={() => {onSelect(note._id)}}
              >
                <File className="mr-2 h-4 w-4" />
                <span>{note.title}</span>
              </CommandItem>
            ))
          }
        </CommandGroup>
      </CommandList>
    </CommandDialog>
   );
}
 
export default SearchCommand;