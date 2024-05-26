"use client";

import { useState } from "react";
import Sidebar from "./_components/sidebar";
import StoreProvider from "../StoreProvider";

const MainLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  // const [sidebarCollapse, setSidebarCollapse] = useState(false);

  return (
    <div className="w-full h-screen relative">
      <StoreProvider>
        {/* <Sidebar sidebarCollapse={sidebarCollapse} setSidebarCollapse={setSidebarCollapse} /> */}
        <Sidebar />
        {/* <div className="pt-10"> */}
          {/* <div className={`absolute left-0 w-full lg:w-[calc(100%-260px)] h-[calc(100%-72px)] flex flex-col md:flex-row items-center px-3 gap-2 transition-all duration-200 will-change-transform ${sidebarCollapse ? `lg:left-[130px]` : `lg:left-[260px]`}`}> */}
          {/* <div 
            className={`absolute left-0 w-full lg:w-[calc(100%-260px)] h-[calc(100%-72px)] flex flex-col md:flex-row items-center px-3 gap-2 transition-all duration-200 will-change-transform`}
            style={{
              transform: sidebarCollapse ? 'translateX(130px)' : 'translateX(260px)',
            }}
          > */}
            {children}
          {/* </div>
        </div> */}
      </StoreProvider>
    </div>
   );
}
 
export default MainLayout;