"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { columns } from "../_components/columns";
import { DataTable } from "../_components/dataTable";
import { useEffect, useState } from "react";


const NotePage = () => {
  const { sidebarCollapse } = useAppSelector((state: RootState) => state.sidebar);
  const { notes } = useAppSelector((state: RootState) => state.notes);

  const [pageSize, setPageSize] = useState(10);

  const router = useRouter();

  return (
    <main
      className="h-[calc(100%-310px)] md:h-[calc(100%-250px)] lg:h-full py-0 lg:py-4 flex flex-grow transition-all ease-custom-ease duration-300 relative z-40 mt-0 pl-0 lg:pl-[260px]"
    >
      <div className="w-full py-4 px-6 mx-4 bg-slate-300 rounded-xl shadow-xl">
        <h1 className="text-2xl font-medium mb-2">Note dashboard</h1>
        {/* <Table>
          <TableCaption>List of your notes.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Created at</TableHead>
              <TableHead>Last modified at</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {
              notes.map(note => (
                <TableRow key={note._id} onClick={() => {
                  router.push(`/notes/${note._id}`)
                }} className="cursor-pointer">
                  <TableCell className="font-medium truncate">{note.title}</TableCell>
                  <TableCell>{note.createdAt.toLocaleString()}</TableCell>
                  <TableCell>{note.updatedAt.toLocaleString()}</TableCell>
                </TableRow>
              ))
            }
          </TableBody>
        </Table> */}
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