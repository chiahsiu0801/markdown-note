import { cn } from "@/lib/utils";

const PaginationItem = ({ pageNumber, current, onClick }: { pageNumber: number, current?: boolean, onClick?: () => void }) => {
  return ( 
    <div className={cn(`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10`,
      current && `border border-input`
    )}
      onClick={onClick}
    >
      {pageNumber}
    </div> 
  );
}
 
export default PaginationItem;