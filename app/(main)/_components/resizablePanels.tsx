import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

import Editor from "@/components/editor";
import Document from "@/components/document";

type ResizablePanelsProps = {
  sidebarCollapse: boolean;
}

const ResizablePanels = ({ sidebarCollapse }: ResizablePanelsProps) => {
  const [input, setInput] = useState('');
  const [leftWidth, setLeftWidth] = useState(50);
  const [editorFocus, setEditorFocus] = useState(true);
  const [isLargeScreen, setIsLargeScreen] = useState<boolean | null>(null);

  const editorContainerRef = useRef<HTMLDivElement>(null);

  const startResizing = (mouseDownEvent: React.MouseEvent<HTMLDivElement>) => {
    const startX = mouseDownEvent.clientX;
    const startWidth = leftWidth;
    const parentNode = (mouseDownEvent.target as HTMLElement).parentNode;
    const totalWidth = parentNode instanceof Element ? parentNode.getBoundingClientRect().width : 0;

    const doDrag = (mouseMoveEvent: MouseEvent) => {
      const newWidth = ((mouseMoveEvent.clientX - startX) / totalWidth) * 100 + startWidth;
      console.log(mouseMoveEvent.clientX);
      console.log(startX);
      setLeftWidth(newWidth);
    }

    const stopDrag = () => {
      document.documentElement.removeEventListener('mousemove', doDrag, false);
      document.documentElement.removeEventListener('mouseup', stopDrag, false);
    }

    document.documentElement.addEventListener('mousemove', doDrag, false);
    document.documentElement.addEventListener('mouseup', stopDrag, false);
    
    mouseDownEvent.preventDefault();
  }

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
    <div className="pt-10">
      <div
        className={`absolute left-0 w-full lg:w-[calc(100%-260px)] h-[calc(100%-72px)] flex flex-col md:flex-row items-center px-3 gap-2 transition-all duration-300 ${sidebarCollapse ? `lg:left-[130px]` : `lg:left-[260px]`}`}
      >
        <div className="absolute -top-[38px] left-16 lg:left-3 z-50">
          <p className="text-xl">directory</p>
        </div>
        <div
          suppressHydrationWarning
          className={cn(`flex flex-1 md:flex-initial overflow-y-auto h-full rounded-lg bg-slate-400 border-2 border-slate-400 mt-2 p-5 relative cursor-pointer`,editorFocus && `border-blue-400 shadow-lg shadow-black/60`)}
          style={{ width: isLargeScreen ? `calc(${leftWidth}% - 10.5px)` : `100%` }}
          ref={editorContainerRef}
          onClick={e => {
            console.log(e.target);
            e.stopPropagation();
            setEditorFocus(true);
          }}
        >
          <Editor input={input} setInput={setInput} editorFocus={editorFocus} />
        </div>
        <div className="md:cursor-ew-resize bg-black w-1/6 md:w-[5px] h-[5px] md:h-1/6 mt-2 rounded-xl" onMouseDown={startResizing}></div>
        <div
          suppressHydrationWarning
          className="h-full mt-2 overflow-auto bg-slate-400 rounded-lg flex flex-1 md:flex-initial flex-col"
          style={{ width: isLargeScreen ? `calc(${100 - leftWidth}% - 10.5px)` : `100%` }}
        >
          <Document input={input} width={isLargeScreen ? 100 - leftWidth : 100} />
        </div>
      </div>
    </div>
   );
}
 
export default ResizablePanels;