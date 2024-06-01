"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Button } from "@/components/ui/button"

import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Ellipsis } from "lucide-react"
import PaginationItem from "./paginationItem"
import { useAppDispatch } from "@/lib/hooks"
import { toggleSidebar } from "@/lib/features/sidebar/sidebarSlice"

// Base type that includes _id property
interface HasId {
  _id: string;
}

interface DataTableProps<TData extends HasId, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData extends HasId, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const dispatch = useAppDispatch();

  const router = useRouter();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 15, // Set the initial page size here
      },
    },
  })

  return (
    <div className="h-[calc(100%-90px)] lg:h-[calc(100%-80px)] overflow-scroll">
      {/* <div className="rounded-md border"> */}
        <Table>
          <TableHeader className="sticky -top-[2px] m-0 bg-slate-300">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => {
                    if(window.innerWidth < 1024) {
                      dispatch(toggleSidebar());
                    }

                    const noteId = row.original._id;
                    router.push(`/notes/${noteId}`)
                  }}
                  className="cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-end space-x-2 py-4 absolute bottom-1 lg:bottom-4 left-1/2 -translate-x-1/2 lg:-translate-x-0">
          <Button
            variant="outline"
            // size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()} 
          >
            <ChevronLeft size="20" />
            <span className="md:mr-2 hidden md:block">Previous</span>
          </Button>
          {
            table.getCanPreviousPage() && <PaginationItem pageNumber={table.getState().pagination.pageIndex} onClick={() => table.previousPage()} />
          }
          <PaginationItem pageNumber={table.getState().pagination.pageIndex + 1} current={true} />
          {
            table.getCanNextPage() && <PaginationItem pageNumber={table.getState().pagination.pageIndex + 2} onClick={() => table.nextPage()} />
          }
          <Ellipsis />
          <Button
            variant="outline"
            // size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="md:ml-2 hidden md:block">Next</span>
            <ChevronRight size="20" />
          </Button>
        </div>
      {/* </div> */}
    </div>
  )
}
