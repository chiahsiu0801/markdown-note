"use client";

import { useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import { columns } from "../_components/columns";
import { DataTable } from "../_components/dataTable";

const NotePage = () => {
  const { notes } = useAppSelector((state: RootState) => state.notes);

  return (
    <main
      className="h-[calc(100%-310px)] md:h-[calc(100%-250px)] lg:h-full py-0 lg:py-4 flex flex-grow transition-all ease-custom-ease duration-300 relative z-40 mt-0 pl-0 lg:pl-[260px]"
    >
      <div className="w-full py-4 px-6 mx-4 bg-slate-300 rounded-xl shadow-xl">
        <h1 className="text-2xl font-medium mb-2">Note dashboard</h1>
        <DataTable columns={columns} data={notes.map(note => {
          return {
            _id: note._id,
            title: note.title,
            created: note.createdAt.toLocaleString(),
            lastModified: note.updatedAt.toLocaleString(),
          };
        })} />
      </div>
    </main>
   );
}
 
export default NotePage;