"use client";

import { useState } from "react";

import Editor from "@/components/editor";
import Document from "@/components/document";

const ResizablePanels = () => {
  const [input, setInput] = useState('');
  const [leftWidth, setLeftWidth] = useState(50);

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

  return ( 
    <div className="flex items-center h-screen p-4 gap-2">
      <div className="h-full rounded-lg" style={{ width: `calc(${leftWidth}% - 10.5px)` }}>
        <Editor input={input} setInput={setInput} />
      </div>
      <div className="cursor-ew-resize bg-black w-[5px] h-1/6 rounded-xl" onMouseDown={startResizing}></div>
      <div className="h-full overflow-auto bg-slate-400 rounded-lg flex flex-col" style={{ width: `calc(${100 - leftWidth}% - 10.5px)` }}>
        <Document input={input} width={100 - leftWidth} />
      </div>
    </div>
   );
}
 
export default ResizablePanels;