import React from "react";

// Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateEventForm } from "../../forms";
// import { Button } from "@/components/ui";

export const NewEventDialog: React.FC = () => {
  return (
    <Dialog>
      <DialogTrigger className="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0">
        {/* <Button className="font-medium"></Button> */}
        Add New Event
      </DialogTrigger>
      <DialogContent className="max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
          <DialogDescription>
            Please fill in the following information to add a new event.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[500px] overflow-y-scroll ">
          <CreateEventForm />
        </div>
      </DialogContent>
    </Dialog>
  );
};
