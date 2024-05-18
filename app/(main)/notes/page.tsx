"use client";

import Sidebar from '../_components/sidebar';
import ResizablePanels from "../_components/resizablePanels";
import StoreProvider from '@/app/StoreProvider';

import { useState } from 'react';

const NotePage = () => {
  const [sidebarCollapse, setSidebarCollapse] = useState(false);

  return (
    <div className="w-full h-screen py-4 relative">
      <Sidebar sidebarCollapse={sidebarCollapse} setSidebarCollapse={setSidebarCollapse} />
      <StoreProvider>
        <ResizablePanels sidebarCollapse={sidebarCollapse} />
      </StoreProvider>
    </div>
   );
}
 
export default NotePage;