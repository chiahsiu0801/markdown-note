import React, { useMemo } from "react";

import { cn } from "@/lib/utils"

type EditorLineProps = {
  row: string,
  width: number,
  active: boolean,
};

const EditorLine = ({ row, width, active }: EditorLineProps) => {
  console.log('render');

  // const rowWithNbsp = useMemo(() => {
  //   return row[row.length - 1] === ' ' ? row.substring(0, row.length - 1) : row
  // }, [row]);
  console.log(row.split(''));

  return (
    <div className={cn(`w-[${width}px] h-[28px] whitespace-pre-wrap break-words leading-6`,
      active && `bg-[#cad0d86f]`
    )}>
      {/* <span className="text-lg">{rowWithNbsp ? rowWithNbsp : '\n'}</span> */}
      <span className="text-lg">{row ? row : '\n'}</span>
    </div>
  );
}
 
export default React.memo(EditorLine);

// Loremipsumdolor,sitametconsecteturadipisicingelit.Harumseddolorumquaseumitaquecupiditatevoluptatumperferendisquodaccusantium,placeataperiamratione.Undeillumidrovidentevenietquasmagniautem.
// testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest