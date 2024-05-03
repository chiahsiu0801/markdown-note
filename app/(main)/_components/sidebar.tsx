import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button";
import { ChevronsLeft, MenuIcon } from "lucide-react";

type SidebarProps = {
  sidebarCollapse: boolean;
  setSidebarCollapse: (value: boolean | ((prevState: boolean) => boolean)) => void;
};

const Sidebar = ({ sidebarCollapse, setSidebarCollapse }: SidebarProps) => {
  return (
    <div 
      className={`w-full lg:w-[260px] h-full px-3 fixed flex transition-all duration-300 ${sidebarCollapse ? `-translate-x-3/4 lg:-translate-x-[177px] bg-transparent` : `-translate-x-0 bg-slate-200 z-[99999]`}`}
      // style={{
      //   transform: sidebarCollapse ? 'translate(calc(-177px), 0)' : 'translate(0, 0)',
      // }}
    >
      <div className="w-3/4 flex flex-col ">
        <div className="flex items-center">
          <Avatar>
            <AvatarImage src="https://cdn-icons-png.flaticon.com/512/1534/1534039.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <p className="mx-2 text-center text-sm">ChisHsiu Chang</p>
        </div>
        Sidebar
      </div>
      <div className={`w-1/4 absolute -top-1 lg:right-1 ${sidebarCollapse ? `-right-3` : `left-[calc(100%-50px)]`}`} onClick={() => setSidebarCollapse((prevState) => !prevState)}>
        <Button variant="ghost" size="icon">
          <div className={`hidden lg:block transition-transform duration-700 ${sidebarCollapse && `rotate-180`}`}>
            <ChevronsLeft />
          </div>
          <div className="block lg:hidden">
            <MenuIcon />
          </div>
        </Button>
      </div>
    </div>
   );
}
 
export default Sidebar;