"use client";

import Sidebar from '../_components/sidebar';
import ResizablePanels from "../_components/resizablePanels";

import { useState } from 'react';

const NotePage = () => {
  const [sidebarCollapse, setSidebarCollapse] = useState(false);

  return (
    <div className="w-full h-screen py-4 relative">
      <Sidebar sidebarCollapse={sidebarCollapse} setSidebarCollapse={setSidebarCollapse} />
      <ResizablePanels sidebarCollapse={sidebarCollapse} />
    </div>
   );
}
 
export default NotePage;