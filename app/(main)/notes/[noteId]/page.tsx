"use client";

import Sidebar from '../../_components/sidebar';
import ResizablePanels from "../../_components/resizablePanels";
import StoreProvider from '@/app/StoreProvider';

import { useState } from 'react';
import { useParams } from 'next/navigation';

// type SingleNotePageProps = {
//   params: { noteId: string };
// }

const SingleNotePage = () => {
  // const noteId = useParams<{ tag: string }>()

  // const [sidebarCollapse, setSidebarCollapse] = useState(false);

  return (
    // <div className="w-full h-screen py-4 relative">
    //   <div>
    //     <Sidebar sidebarCollapse={sidebarCollapse} setSidebarCollapse={setSidebarCollapse} />
    //     <StoreProvider>
    <ResizablePanels />
    //     </StoreProvider>
    //   </div>
    // </div>
   );
}

export default SingleNotePage;