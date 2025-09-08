"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";

// zod
import type { z } from "zod";

// Schema
import type {
  RegistrationStatusSchema,
  ReviewRequestStatusSchema,
} from "@/schema/event.schema";

// Icons
import { CopyIcon, MoreIconDots } from "@/icons";

// Hooks
import { useCopyToClipboard } from "@/hooks";

// Components
import { Button } from "@/components/ui";
import { toast } from "sonner";

export interface tableConfigDataType {
  id: string;
  title: string;
  eventId: string;
  eventDbPassword: string;
  coordinatorEmail: string;
  eventDbURL: string;
  isHidden: boolean;
  registrationStatus: z.infer<typeof RegistrationStatusSchema>;
  reviewRequestStatus: z.infer<typeof ReviewRequestStatusSchema>;
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
    accessorKey: "coordinatorEmail",
    header: "Coordinator Email",
    cell: ({ row }) => {
      const { coordinatorEmail } = row.original;
      return <TextWithCopyIcon text={coordinatorEmail} hideText isEmail />;
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
    accessorKey: "reviewRequestStatus",
    header: "Review Update Status",
    cell: ({ row }) => {
      const { reviewRequestStatus } = row.original;
      return <ReviewUpdateStatusPill status={reviewRequestStatus} />;
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
export const ReviewUpdateStatusPill = ({
  status,
}: {
  status: z.infer<typeof ReviewRequestStatusSchema>;
}) => {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "PENDING":
        return {
          container: "bg-yellow-600/10 text-yellow-600",
          dot: "bg-yellow-600",
          text: "Pending",
        };
      case "APPROVED":
        return {
          container: "bg-green-600/10 text-green-600",
          dot: "bg-green-600",
          text: "Approved",
        };
      case "REJECTED":
        return {
          container: "bg-red-600/10 text-red-600",
          dot: "bg-red-600",
          text: "Rejected",
        };
      case "NONE":
      default:
        return {
          container: "bg-gray-200 text-black/70",
          dot: "bg-black/70",
          text: "None",
        };
    }
  };

  const { container, dot, text } = getStatusStyles(status);

  return (
    <div className="flex">
      <p
        className={`flex items-center gap-1 rounded-full ${container} px-3 py-[6px] text-[10px] font-semibold leading-none`}
      >
        <span
          className={`aspect-square h-[5px] min-w-[5px] rounded-full ${dot}`}
        />
        {text}
      </p>
    </div>
  );
};

const maskEmail = (email: string): string => {
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) return email;

  const visiblePart = localPart.slice(-4); // last 4 chars
  const hiddenPart = "*".repeat(Math.max(localPart.length - 4, 0));

  return `${hiddenPart}${visiblePart}@${domain}`;
};

type Props = {
  text: string;
  hideText?: boolean;
  isEmail?: boolean;
};

const TextWithCopyIcon = ({ text, hideText, isEmail }: Props) => {
  const [showCopyIcon, setShowCopyIcon] = useState(false);
  const { copyToClipboard } = useCopyToClipboard();

  const displayText = hideText
    ? isEmail
      ? maskEmail(text)
      : convertPasswordToDots(text)
    : text;

  return (
    <div
      className="flex items-center gap-2 leading-none"
      onMouseEnter={() => setShowCopyIcon(true)}
      onMouseLeave={() => setShowCopyIcon(false)}
    >
      <p className="line-clamp-1 max-w-[200px] py-1 font-medium">
        {displayText}
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
