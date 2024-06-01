"use client";

import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button"
import { useScrollTop } from "@/hooks/useScrollTop";
import { AuthModal } from "./authModal";
import { SessionProvider } from "next-auth/react";
import Image from "next/image";

const font = Poppins({
  subsets: ["latin"],
  weight: ["400", "600"]
});

const Navbar = () => {
  const scrolled = useScrollTop();

  return (
    <SessionProvider>
      <div className={cn(
        "w-full h-16 p-4 flex justify-between items-center fixed z-50 bg-slate-200",
        scrolled && "border-b shadow-sm")}>
        <h1 className={cn("hidden md:block font-semibold text-xl", font.className)}>MARKDOWN NOTE</h1>
        <Image className="md:hidden" src="/markdown-logo.png" alt="logo" width={50} height={50} />
        <div className="flex gap-4">
          {/* <Button variant="default">Sign up</Button>
          <Button variant="outline">Login</Button> */}
          <AuthModal buttonText="Sign up" />
          <AuthModal buttonText="Log in" />
        </div>
      </div>
    </SessionProvider>
   );
}
 
export default Navbar;