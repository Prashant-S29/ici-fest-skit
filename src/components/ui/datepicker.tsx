"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Props {
  value?: Date;
  onChange?: (date: Date) => void;
}

export const DatePicker: React.FC<Props> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    console.log("Date selected:", selectedDate); // Debug log

    if (!selectedDate || !onChange) {
      console.log("No date or no onChange function"); // Debug log
      return;
    }

    // Create a new date at local midnight to avoid timezone issues
    const localDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      0,
      0,
      0,
      0,
    );

    console.log("Calling onChange with:", localDate); // Debug log
    onChange(localDate);
    setIsOpen(false); // Close the popover after selection
  };

  // Handle button click to prevent event bubbling
  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button
          type="button" // Prevent form submission
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left text-sm font-normal",
            !value && "text-muted-foreground",
          )}
          onClick={handleButtonClick}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="z-[9999] w-auto p-0"
        align="start"
        side="bottom"
        sideOffset={4}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleDateSelect}
          initialFocus
          disabled={false}
        />
      </PopoverContent>
    </Popover>
  );
};
