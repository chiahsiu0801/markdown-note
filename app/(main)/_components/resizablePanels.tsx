import { useState, useRef, useEffect } from "react";
import { cn, detectDevice } from "@/lib/utils";
import { usePathname, useRouter } from 'next/navigation'
import { NoteDocument } from "@/lib/models";

import Editor from "@/components/editor";
import Document from "@/components/document";

import { Button } from "@/components/ui/button";
import { ArrowBigLeftDash, PencilLine, Save } from "lucide-react";
import { saveNote } from "@/lib/action";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { renameNotes, updateNote } from '../../../lib/features/note/noteSlice';
import EditorMobile from "../../../components/editorMobile";

const ResizablePanels = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { sidebarCollapse } = useAppSelector((state: RootState) => state.sidebar);
  const { notes, newName } = useAppSelector((state: RootState) => state.notes);
  const pathname = usePathname().split('/');
  const noteId = pathname[pathname.length - 1];

  const [input, setInput] = useState('');
  const [leftWidth, setLeftWidth] = useState(50);
  const [editorFocus, setEditorFocus] = useState(true);
  const [isLargeScreen, setIsLargeScreen] = useState<boolean | null>(null);
  const [noteData, setNoteData] = useState<NoteDocument | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);

  const editorContainerRef = useRef<HTMLDivElement>(null);
  const newNoteNameInputRef = useRef<HTMLInputElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);

  const startResizing = (mouseDownEvent: React.MouseEvent<HTMLDivElement>) => {
    const startX = mouseDownEvent.clientX;
    const startWidth = leftWidth;
    const parentNode = (mouseDownEvent.target as HTMLElement).parentNode;
    const totalWidth = parentNode instanceof Element ? parentNode.getBoundingClientRect().width : 0;

    const doDrag = (mouseMoveEvent: MouseEvent) => {
      const newWidth = ((mouseMoveEvent.clientX - startX) / totalWidth) * 100 + startWidth;

      if(newWidth >= 35 && newWidth <= 65) {
        setLeftWidth(newWidth);
      }
    }

    const stopDrag = () => {
      document.documentElement.removeEventListener('mousemove', doDrag, false);
      document.documentElement.removeEventListener('mouseup', stopDrag, false);
    }

    document.documentElement.addEventListener('mousemove', doDrag, false);
    document.documentElement.addEventListener('mouseup', stopDrag, false);
    
    mouseDownEvent.preventDefault();
  }

  const handleSave = async () => {
    const promise = saveNote(noteId, { content: input });

    toast.promise(promise, {
      loading: `Saving ${noteData?.title}...`,
      success: `${noteData?.title} saved!`,
      error: 'Failed to save note',
    });

    // Wait for the note creation to complete
    await promise;
    // Toggle the state to trigger a re-render of Notes
    dispatch(updateNote({
      updatingNoteId: noteId,
      newContent: input,
    }))
  }

  const handleIsRenaming = async () => {
    if(isRenaming) {
      const promise = saveNote(noteId, { title: newName });

      const updatedNewNote = await promise;

      setNoteData(updatedNewNote);

      dispatch(renameNotes({
        renamingFinish: true,
        renamingNoteId: noteData!._id,
        newName: newName,
      }));
    } else {
      dispatch(renameNotes({
        renamingFinish: true,
        renamingNoteId: noteData!._id,
        newName: noteData!.title,
      }));
    }

    setIsRenaming((prevState => !prevState));
  }

  const handleRename = (target: HTMLInputElement) => {
    dispatch(renameNotes({
      renamingFinish: false,
      renamingNoteId: noteData!._id,
      newName: target.value,
    }));
  }

  useEffect(() => {
    if (spanRef.current && newNoteNameInputRef.current && isRenaming) {
      // Set the initial width of the input based on the span width
      newNoteNameInputRef.current.style.width = `${spanRef.current.offsetWidth}px`;
    }
  }, [isRenaming]); // Empty dependency array to run only once after initial render

  useEffect(() => {
    if (spanRef.current && newNoteNameInputRef.current) {
      // Update the input width based on the span width
      newNoteNameInputRef.current.style.width = `${spanRef.current.offsetWidth}px`;
    }
  }, [newName]);

  useEffect(() => {
    if (notes.length > 0) {
      const foundNote = notes.find(note => note._id === noteId) || null;

      if (noteData?._id !== foundNote?._id) {
        setNoteData(foundNote);
        setInput(foundNote?.content || '');
      }
    }
  }, [notes, noteId, noteData?._id, dispatch, router]);

  useEffect(() => {
    window.addEventListener('click', (e) => {
      setEditorFocus(false);
    });

    return () => window.removeEventListener('click', (e) => {
      setEditorFocus(false);
    });
  }, [])

  useEffect(() => {
    // Set initial state based on the client's window size
    setIsLargeScreen(window.innerWidth > 768);

    const handleResize = () => {
      setIsLargeScreen(window.innerWidth > 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Optionally render nothing or a placeholder until we know the client width
  if (isLargeScreen === null) return null; // or a loading spinner, etc.

  return (
    <main
      className={cn(`h-full py-4 flex flex-grow transition-all ease-custom-ease duration-300 relative z-40`,
        sidebarCollapse ? `lg:pl-[130px]` : `lg:pl-[260px]`
      )}
    >
      <div className="pt-10">
        <div
          className={`absolute w-full lg:w-[calc(100%-260px)] h-[calc(100%-70px)] flex flex-col md:flex-row items-center px-3 gap-2`}
        >
          <div className="absolute w-[calc(100%-68px)] lg:w-[calc(100%-24px)] h-[38px] -top-[40px] left-14 lg:left-3 flex justify-between xl:justify-start items-center">
            {
              isRenaming ?
              <div className="inline-block">
                <Input ref={newNoteNameInputRef} spellCheck="false" name="noteName" autoFocus onChange={(e) => handleRename(e.target)} value={newName} className="box-content max-h-[38px] py-0 text-base xl:text-xl bg-slate-300 border-blue-400 caret-blue-500 transition-transform duration-500 focus-visible:ring-0 focus:shadow-lg focus:scale-105"
                />
                <span
                  ref={spanRef}
                  className="absolute max-w-14 sm:max-w-[310px] md:max-w-[390px] lg:max-w-[420px] xl:max-w-[162px] -left-[9999px] invisible whitespace-pre text-base xl:text-xl"
                >
                  {newName}
                </span>
              </div>:
              <div className="truncate max-w-32 sm:max-w-[360px] md:max-w-[440px] lg:max-w-[470px] xl:max-w-[210px] text-base xl:text-xl px-[13px]">{noteData ? noteData.title : 'Loading...'}</div>
            }
            <div className="flex">
              <div
                className="ml-1 lg:ml-2"
                onClick={() => handleIsRenaming()}
              >
                <Button variant="editnote" size="sm">
                  {
                    isRenaming ?
                    <>
                      <ArrowBigLeftDash size={18} />
                      <p className="ml-1 text-sm xl:text-base">Save new name</p>
                    </>:
                    <>
                      <PencilLine size={18} />
                      <p className="ml-1 text-sm xl:text-base">{isLargeScreen ? `Rename note` : `Rename`}</p>
                    </>
                  }
                </Button>
              </div>
              <div
                className="ml-1 lg:ml-2"
                onClick={() => handleSave()}
              >
                <Button variant="editnote" size="sm">
                  <Save size={18} />
                  <p className="ml-1 text-sm xl:text-base">{isLargeScreen ? `Save note` : `Save`}</p>
                </Button>
              </div>
            </div>
          </div>
          <div
            suppressHydrationWarning
            className={cn(`flex flex-1 md:flex-initial overflow-y-auto h-full rounded-lg bg-slate-400 border-2 border-slate-400 mt-2 p-5 relative cursor-pointer`,editorFocus && `border-blue-400 shadow-lg shadow-black/60`)}
            style={{ width: isLargeScreen ? `calc(${leftWidth}% - 10.5px)` : `100%` }}
            ref={editorContainerRef}
            onClick={e => {
              e.stopPropagation();
              setEditorFocus(true);
            }}
          >
            {
              detectDevice() === "Desktop" ?
              <Editor input={input} setInput={setInput} editorFocus={editorFocus} initialContent={noteData?.content} /> :
              <EditorMobile input={input} setInput={setInput} editorFocus={editorFocus} initialContent={noteData?.content} />
            }
          </div>
          <div className="md:cursor-ew-resize bg-black w-1/6 md:w-[5px] h-[5px] md:h-1/6 mt-1 md:mt-0 rounded-xl" onMouseDown={startResizing}></div>
          <div
            suppressHydrationWarning
            className="h-full mt-2 overflow-auto bg-slate-400 rounded-lg flex flex-1 md:flex-initial flex-col"
            style={{ width: isLargeScreen ? `calc(${100 - leftWidth}% - 10.5px)` : `100%` }}
          >
            <Document input={input} width={isLargeScreen ? 100 - leftWidth : 100} />
          </div>
        </div>
      </div>
    </main>
   );
}
 
export default ResizablePanels;