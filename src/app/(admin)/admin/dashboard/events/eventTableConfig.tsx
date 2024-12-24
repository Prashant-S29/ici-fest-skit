"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { z } from "zod";
import { RegistrationStatusSchema } from "@/schema/event.schema";
import { useState } from "react";
import { Button } from "@/components/ui";
import { CopyIcon, DeleteIcon, EditIcon, MoreIconDots } from "@/icons";
import { useCopyToClipboard } from "@/hooks";
import { toast } from "sonner";
import Link from "next/link";

export interface tableConfigDataType {
  id: string;
  title: string;
  eventId: string;
  eventDbPassword: string;
  eventDbURL: string;
  isHidden: boolean;
  registrationStatus: z.infer<typeof RegistrationStatusSchema>;
  schedule: {
    title: string;
    date: string;
  }[];
  // actions
}

export const tableConfig: ColumnDef<tableConfigDataType>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      const { title } = row.original;
      return <p className="line-clamp-1 pr-[30px] font-medium">{title}</p>;
    },
  },

  {
    accessorKey: "eventId",
    header: "Event ID",
    cell: ({ row }) => {
      const { eventId } = row.original;
      return <TextWithCopyIcon text={eventId} />;
    },
  },
  {
    accessorKey: "eventDbPassword",
    header: "Dashboard Password",
    cell: ({ row }) => {
      const { eventDbPassword } = row.original;
      return <TextWithCopyIcon text={eventDbPassword} hideText />;
    },
  },

  {
    accessorKey: "eventDbURL",
    header: "Dashboard URL",
    cell: ({ row }) => {
      const { eventDbURL } = row.original;
      return (
        <Link
          href={eventDbURL}
          className="font-medium text-blue-700 underline underline-offset-1"
          target="_blank"
        >
          URL
        </Link>
      );
    },
  },

  {
    accessorKey: "registrationStatus",
    header: "Registration Status",
    cell: ({ row }) => {
      const { registrationStatus } = row.original;
      return (
        <EventRegistrationStatusPill registrationStatus={registrationStatus} />
      );
    },
  },

  {
    accessorKey: "isHidden",
    header: "Event Hidden Status",
    cell: ({ row }) => {
      const { isHidden } = row.original;
      return <EventHiddenStatusPill isHidden={isHidden} />;
    },
  },

  {
    id: "actions",

    cell: ({ row }) => (
      <Button size="icon" asChild variant="outline" className="h-8 shadow-none">
        <Link href={`/admin/dashboard/events/${row.original.eventId}`}>
          <MoreIconDots className="max-w-[16px] text-black" />
        </Link>
      </Button>
    ),
    enableSorting: true,
    enableHiding: false,
  },
];

const EventRegistrationStatusPill = ({
  registrationStatus,
}: {
  registrationStatus: z.infer<typeof RegistrationStatusSchema>;
}) => {
  return (
    <div className="flex">
      {registrationStatus === "UPCOMING" ? (
        <p className="flex items-center gap-1 rounded-full bg-gray-200 px-3 py-[6px] text-[10px] font-semibold leading-none text-black/70">
          <span className="aspect-square h-[5px] min-w-[5px] rounded-full bg-black/70" />
          Upcoming
        </p>
      ) : registrationStatus === "CLOSED" ? (
        <p className="flex items-center gap-1 rounded-full bg-red-600/10 px-3 py-[6px] text-[10px] font-semibold leading-none text-red-600">
          <span className="aspect-square h-[5px] min-w-[5px] rounded-full bg-red-600" />
          Closed
        </p>
      ) : (
        <p className="flex items-center gap-1 rounded-full bg-green-600/10 px-3 py-[6px] text-[10px] font-semibold leading-none text-green-600">
          <span className="aspect-square h-[5px] min-w-[5px] rounded-full bg-green-600" />
          Open
        </p>
      )}
    </div>
  );
};

const EventHiddenStatusPill = ({ isHidden }: { isHidden: boolean }) => {
  return (
    <div className="flex">
      {isHidden ? (
        <p className="flex items-center gap-1 rounded-full bg-red-600/10 px-3 py-[6px] text-[10px] font-medium leading-none text-red-600">
          <span className="aspect-square h-[5px] min-w-[5px] rounded-full bg-red-600" />
          Hidden
        </p>
      ) : (
        <p className="flex items-center gap-1 rounded-full bg-gray-200 px-3 py-[6px] text-[10px] font-semibold leading-none text-black/70">
          <span className="aspect-square h-[5px] min-w-[5px] rounded-full bg-black/70" />
          Not Hidden
        </p>
      )}
    </div>
  );
};

const TextWithCopyIcon = ({
  text,
  hideText,
}: {
  text: string;
  hideText?: boolean;
}) => {
  const [showCopyIcon, setShowCopyIcon] = useState(false);
  const { copyToClipboard } = useCopyToClipboard();

  return (
    <div
      className="flex items-center gap-2 leading-none"
      onMouseEnter={() => setShowCopyIcon(true)}
      onMouseLeave={() => setShowCopyIcon(false)}
    >
      <p className="line-clamp-1 py-1 max-w-[200px] font-medium">
        {hideText ? convertPasswordToDots(text) : text}
      </p>
      <div className="w-[10px]">
        {showCopyIcon && (
          <Button
            className="h-auto bg-transparent p-0 shadow-none hover:bg-transparent focus:outline-none"
            onClick={() => {
              copyToClipboard(text);
              toast.info("Copied to clipboard");
            }}
          >
            <CopyIcon className="max-w-[12px] text-black" />
          </Button>
        )}
      </div>
    </div>
  );
};
const convertPasswordToDots = (password: string): string => {
  return "*".repeat(password.length);
};
