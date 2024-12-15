/* eslint-disable @typescript-eslint/no-explicit-any */
"use state";

import React from "react";

// component
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui";
import Link from "next/link";
import { useCopyToClipboard } from "@/hooks";
import { useRouter } from "next/navigation";

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  eventId: string;
  eventName: string;
  eventDbPassword: string;
  eventDbURL: string;
}

export const EventWindow: React.FC<Props> = ({
  open,
  setOpen,
  eventId,
  eventName,
  eventDbPassword,
  eventDbURL,
}) => {
  const { copyToClipboard } = useCopyToClipboard();

  const stringToCopy = `
        ${eventName} Info and Dashboard Configuration

Event Id: ${eventId}
Event Dashboard Password: ${eventDbPassword}
Event Dashboard URL: ${eventDbURL}`;

  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={setOpen} modal>
      <DialogTrigger asChild>
        <div></div>
      </DialogTrigger>
      <DialogContent className={`max-w-[700px]`}>
        <DialogHeader>
          <DialogTitle>{eventName} Dashboard Configuration</DialogTitle>
          <DialogDescription>
            Copy the below information and share with the event coordinator.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-2">
          <section>
            <p className="text-xs text-black/70">Event Id</p>
            <p className="text-sm font-medium">{eventId}</p>
          </section>

          <section>
            <p className="text-xs text-black/70">Event Dashboard Password</p>
            <p className="text-sm font-medium">{eventDbPassword}</p>
          </section>

          <section>
            <p className="text-xs text-black/70">Event Dashboard URL</p>
            <Link
              href={eventDbPassword}
              className="text-sm font-medium text-blue-600 underline underline-offset-2"
            >
              {eventDbURL}
            </Link>
          </section>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              variant="default"
              size={"sm"}
              onClick={() => {
                copyToClipboard(stringToCopy);
                router.push("/admin/dashboard");
              }}
            >
              Copy
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
