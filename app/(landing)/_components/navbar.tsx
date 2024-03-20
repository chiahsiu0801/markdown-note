"use client";

import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button"
import { useScrollTop } from "@/hooks/useScrollTop";

const font = Poppins({
  subsets: ["latin"],
  weight: ["400", "600"]
});

const Navbar = () => {
  const scrolled = useScrollTop();

  return ( 
    <div className={cn(
      "w-full h-16 p-4 flex justify-between items-center fixed z-50 bg-slate-200",
      scrolled && "border-b shadow-sm")}>
      <h1 className={cn("font-semibold text-xl", font.className)}>MARKDOWN NOTE</h1>
      <div className="flex gap-4">
        <Button variant="default">Sign up</Button>
        <Button variant="outline">Login</Button>
      </div>
    </div>
   );
}
 
export default Navbar;