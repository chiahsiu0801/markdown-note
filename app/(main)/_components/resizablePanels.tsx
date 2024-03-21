"use client";

import { useState } from "react";

const ResizablePanels = () => {
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
    <div className="flex h-screen p-2">
      <div className="h-full overflow-auto bg-slate-400" style={{ width: `${leftWidth}%` }}>Left panel</div>
      <div className="cursor-ew-resize bg-black w-[5px] h-full" onMouseDown={startResizing}></div>
      <div className="h-full overflow-auto bg-slate-600" style={{ width: `${100 - leftWidth}%` }}>Right panel</div>
    </div>
   );
}
 
export default ResizablePanels;