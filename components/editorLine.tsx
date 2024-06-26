import React from "react";

import { cn } from "@/lib/utils"

type EditorLineProps = {
  row: string,
  width: number,
  active: boolean,
};

const EditorLine = ({ row, width, active }: EditorLineProps) => {
  return (
    <div className={cn(`w-[${width}px] h-[28px] whitespace-pre-wrap break-words leading-6`,
      active && `bg-[#cad0d86f]`
    )}>
      <span className="text-lg">{row ? row : '\n'}</span>
    </div>
  );
}
 
export default React.memo(EditorLine);
