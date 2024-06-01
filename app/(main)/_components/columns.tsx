"use client"

import { ColumnDef } from "@tanstack/react-table"

export type NoteInTable = {
  _id: string;
  title: string;
  created: string;
  lastModified: string;
}

export const columns: ColumnDef<NoteInTable>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "created",
    header: "Created at",
  },
  {
    accessorKey: "lastModified",
    header: "Last modified at",
  },
]
