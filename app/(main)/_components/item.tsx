import { LucideIcon } from "lucide-react";

type ItemProps = {
  label: string;
  onClick: () => void;
  icon: LucideIcon;
  isSearch?: boolean;
}

const Item = ({
  label,
  onClick,
  icon: Icon,
  isSearch,
}: ItemProps) => {
  return ( 
    <div
      onClick={onClick}
      role="button"
      style={{ paddingLeft: '16px' }}
      className="group min-h-[27px] text-sm py-1 pr-3 w-full hover:bg-primary/5 flex items-center text-muted-foreground font-medium"
    >
      <Icon className="shrink-0 h-[18px] mr-2 text-muted-foreground" />
      <span className="truncate">
        {label}
      </span>
      {
        isSearch && (
          <kbd className="ml-2 lg:ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>k
          </kbd>
        )
      }
    </div>
   );
}
 
export default Item;