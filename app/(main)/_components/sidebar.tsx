import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button";
import { ArrowLeftToLine, ChevronsLeft, FileText, LogOut, MenuIcon, Pencil, Plus, Search, Trash2, Undo2 } from "lucide-react";
import { createNote } from "@/lib/action";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { RootState, AppDispatch } from "@/lib/store"
import { toggleSidebar } from '../../../lib/features/sidebar/sidebarSlice';
import { redirect, usePathname, useRouter } from "next/navigation";

import Notes from "./notes";
import Item from "./item";
import { fetchNotes, toggleIsDeleting } from "@/lib/features/note/noteSlice";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { getUser } from "@/lib/data";
import { ObjectId } from "mongoose";
import { Spinner } from "@/components/spinner";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { NoteDocument } from "@/lib/models";
import { onOpen } from "@/lib/features/search/searchSlice";

interface UserWithId  {
  name?: string | null | undefined;
  email?: string | null | undefined;
  image?: string | null | undefined;
  id: string;
}

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname().split('/');
  const lastSegment = pathname[pathname.length - 1];

  const { data: session, status } = useSession();
  const image = session?.user?.image;
  const userId = (session?.user as UserWithId)?.id;

  const dispatch = useAppDispatch();
  const { sidebarCollapse } = useAppSelector((state: RootState) => state.sidebar);
  const { isDeleting, notes, lastUpdatedNoteId } = useAppSelector((state: RootState) => state.notes);
  const [avatarImg, setAvatarImg] = useState<string>('');
  const [inDashboard, setInDashboard] = useState(lastSegment === 'notes');

  const handleCreate = async () => {
    const promise = createNote(userId);

    toast.promise(promise, {
      loading: 'Creating a new note...',
      success: 'New note created!',
      error: 'Failed to create a new note',
    });

    // Wait for the note creation to complete
    const createdNote = await promise;

    dispatch(fetchNotes(userId));

    router.push(`/notes/${createdNote._id}`);
  }

  const handleDelete = () => {
    dispatch(toggleIsDeleting());
  }

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  }

  const findLatest = () => {
    if(!lastUpdatedNoteId) {
      return '';
    }

    if(lastUpdatedNoteId) {
      return lastUpdatedNoteId;
    }

    if(notes.length === 0) {
      return '';
    }

    const timestampsWithIndices = notes.map((note, index) => ({
      timestamp: note.updatedAt.getTime(),
      index: index
    }));

    const maxTimestampWithIndex = timestampsWithIndices.reduce((max, current) => {
      return current.timestamp > max.timestamp ? current : max;
    }, timestampsWithIndices[0]);

    const latestDate = notes[maxTimestampWithIndex.index];

    return latestDate._id;
  }

  useEffect(() => {
    if(status === 'authenticated' && image) {
      setAvatarImg(image);
    } else if(status === 'authenticated' && !image) {
      const fetchUserImage = async () => {
        const res = await getUser((session?.user as UserWithId)?.id);

        if(!res.img) {
          setAvatarImg("https://cdn-icons-png.flaticon.com/512/1534/1534039.png");
        } else {
          setAvatarImg('data:image/jpeg;base64,' + Buffer.from(res.img.data, 'binary').toString('base64'));
        }
      }

      fetchUserImage();
    }
  }, [image, status, session?.user]);

  useEffect(() => {
    if(userId) {
      dispatch(fetchNotes(userId));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    if(lastSegment === 'notes') {
      setInDashboard(true);
    } else {
      setInDashboard(false);
    }
  }, [lastSegment])

  return (
    <div 
      className={cn(`w-full lg:w-[260px] px-3 py-4 flex transition-transform ease-custom-ease duration-500 z-50`,
        (sidebarCollapse && !inDashboard) ? `-translate-x-full lg:-translate-x-[190px]` : `-translate-x-0 bg-slate-200 z-[99999]`,
        (inDashboard) ? `static lg:fixed h-auto lg:h-full` : `fixed h-full`)}
    >
      <div className={cn(`w-3/4 flex flex-col`, inDashboard && `bg-slate-300 rounded-xl shadow-xl py-4 px-2 w-full flex-col md:flex-row lg:flex-col justify-around lg:justify-start`)}>
        <div className={cn(`mb-2 flex ml-2 items-center`, inDashboard && `flex-row md:flex-col md:justify-center ml-4 md:ml-0`)}>
          {
            inDashboard ?
            <>
              <Avatar className="w-10 md:w-20 lg:w-[120px] h-10 md:h-20 lg:h-[120px] mb-2">
                {
                  status === 'loading' ?
                  <div className="mx-auto my-auto">
                    <Spinner size="icon" />
                  </div> :
                  <AvatarImage sizes="" src={avatarImg} />
                }
              </Avatar>
              <p className="mx-2 text-center text-xl">{session?.user?.name}</p>
            </> :
            <>
              <Avatar>
                {
                  status === 'loading' ?
                  <div>
                    <Spinner size="icon" />
                  </div> :
                  <AvatarImage src={avatarImg} />
                }
              </Avatar>
              <p className="mx-2 text-center text-sm">{session?.user?.name}</p>
            </>
          }
        </div>
        {
          inDashboard ?
          <div className="flex-1 mx-4 lg:mx-0 lg:flex-initial grid grid-cols-2 grid-rows-2 gap-x-4 items-center lg:grid-cols-1 lg:grid-rows-4">
            <div className="h-[72px] bg-slate-400 rounded-lg px-2 py-4 my-2 shadow-lg">
              <div className="flex justify-center items-center h-full">
                <FileText className="mr-2" />
                <span className="text-sm md:text-lg lg:text-sm font-medium text-center">
                  Notes count: {notes.length}
                </span>
              </div>
            </div>
            <div className="h-[72px] bg-slate-400 rounded-lg px-2 py-4 my-2 shadow-lg hover:bg-muted/50 cursor-pointer">
              <div
                onClick={() => {dispatch(onOpen())}}
                className="flex items-center justify-center font-medium cursor-pointer h-full"
              >
                <Search className="mr-2" />
                <span className="text-sm md:text-lg lg:text-sm text-center">Search note</span>
                <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded px-1.5 font-mono text-[15px] text-muted-foreground font-medium opacity-100">
                  <span className="text-xl">⌘</span>k
                </kbd>
              </div>
            </div>
            <div className="h-[72px] bg-slate-400 rounded-lg px-2 py-4 my-2 shadow-lg hover:bg-muted/50 cursor-pointer">
              {
                notes.length === 0 ?
                <div
                  className="text-sm flex justify-center items-center font-medium h-full"
                  onClick={() => {
                    handleCreate();
                    if(window.innerWidth < 1024) {
                      dispatch(toggleSidebar());
                    }
                  }}
                >
                  <Pencil className="mr-2" />
                  <span className="text-center text-sm md:text-lg lg:text-sm">Create new note</span>
                </div> :
                <Link
                  href={`/notes/${findLatest()}`} className="text-sm flex justify-center items-center font-medium h-full"
                  onClick={() => {
                    if(window.innerWidth < 1024) {
                      dispatch(toggleSidebar());
                    }
                  }}
                >
                  <Pencil className="mr-2" />
                  <span className="text-center text-sm md:text-lg lg:text-sm">Go to edit the<br/> last modified note</span>
                </Link>
              }
            </div>
            <div className="h-[72px] bg-slate-400 rounded-lg px-2 py-4 my-2 shadow-lg hover:bg-muted/50 cursor-pointer">
              <div
                onClick={() => handleLogout()}
                className="flex items-center justify-center font-medium cursor-pointer h-full"
              >
                <LogOut className="mr-2" />
                <span className="text-sm md:text-lg lg:text-sm">Log out</span>
              </div>
            </div>
          </div> :
          <>
            <Item
              onClick={() => handleLogout()}
              label="Log out"
              icon={LogOut}
            />
            <Item
              onClick={() => router.push('/notes')}
              label="Dashboard"
              icon={ArrowLeftToLine}
            />
            <Item
              onClick={() => dispatch(onOpen())}
              label="Search note"
              icon={Search}
              isSearch={true}
            />
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
            <div className="mt-2 overflow-scroll">
              <Notes userId={userId} />
            </div>
          </>
        }
      </div>
      {
        !inDashboard &&
        <div className={` absolute z-50 lg:right-4 ${sidebarCollapse ? `left-[calc(100%+12px)] lg:left-auto` : `left-[calc(100%-50px)]`}`} onClick={() => dispatch(toggleSidebar())}>
          <Button variant="ghost" size="icon" className={`hidden lg:block transition-transform duration-700 ${sidebarCollapse && `rotate-180`}`}>
            <div  >
              <ChevronsLeft className="mx-auto" />
            </div>
          </Button>
          <Button variant="secondary" size="icon" className="block lg:hidden">
            <div  >
              <MenuIcon className="mx-auto" />
            </div>
          </Button>
        </div>
      }
    </div>
   );
}
 
export default Sidebar;