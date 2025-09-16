"use client";

import type { ColumnDef } from "@tanstack/react-table";

import type { z } from "zod";
import type { EventScheduleSchema } from "@/schema/event.schema";
import { Button } from "@/components/ui";
import { DeleteIcon, MoreIconDots } from "@/icons";
import { convertMinsToTimeString, formatDate } from "@/utils/timeHandler";
import { NewScheduleDialog } from "@/components/admin/forms/Schedule";

export type tableConfigDataType = z.infer<typeof EventScheduleSchema>;

export const tableConfig: ColumnDef<tableConfigDataType>[] = [
  // {
  //   accessorKey: "id",
  //   header: "id",
  //   cell: ({ row }) => {
  //     const { id } = row.original;
  //     return <p className="line-clamp-1 pr-[30px] font-medium">{id}</p>;
  //   },
  // },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      const { title } = row.original;
      return <p className="line-clamp-1 pr-[30px] font-medium">{title}</p>;
    },
  },

  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const { date } = row.original;
      return <p>{formatDate(date)}</p>;
    },
  },
  {
    accessorKey: "startTime",
    header: "Start Time",
    cell: ({ row }) => {
      const { startTime } = row.original;
      return <p>{convertMinsToTimeString(startTime)}</p>;
    },
  },
  {
    accessorKey: "endTime",
    header: "End Time",
    cell: ({ row }) => {
      const { endTime } = row.original;
      return <p>{convertMinsToTimeString(endTime)}</p>;
    },
  },

  {
    accessorKey: "venue",
    header: "Venue",
    cell: ({ row }) => {
      const { venue } = row.original;
      return <p>{venue}</p>;
    },
  },

  {
    id: "actions",

    cell: ({ row }) => (
      <div className="relative flex items-center gap-2">
        <NewScheduleDialog
          state="DELETE"
          data={row.original}
          trigger={
            <Button size="icon" variant="outline" className="h-8 shadow-none">
              <DeleteIcon className="max-w-[16px] text-destructive" />
            </Button>
          }
        />

        <NewScheduleDialog
          state="UPDATE"
          data={row.original}
          trigger={
            <Button size="icon" variant="outline" className="h-8 shadow-none">
              <MoreIconDots className="max-w-[16px] text-black" />
            </Button>
          }
        />
      </div>
    ),
    enableSorting: true,
    enableHiding: false,
  },
];
