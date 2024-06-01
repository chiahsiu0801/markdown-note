"use client";

import Sidebar from "./_components/sidebar";
import StoreProvider from "../StoreProvider";
import { SkeletonTheme } from 'react-loading-skeleton';
import SearchCommand from "@/components/searchCommand";

const MainLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {

  return (
    <SkeletonTheme baseColor="#cad0d86f" highlightColor="#8c929a63" height={22}>
      <StoreProvider>
        <div className="w-full h-screen max-h-screen relative">
            <Sidebar />
            {children}
        </div>
        <SearchCommand />
      </StoreProvider>
    </SkeletonTheme>
   );
}
 
export default MainLayout;