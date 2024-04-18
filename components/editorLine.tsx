import { cn } from "@/lib/utils";

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
      <span>
        <span className="text-lg">{row}</span>
      </span>
    </div>
  );
}
 
export default EditorLine;