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
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate || !onChange) return;

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

    onChange(localDate);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left text-sm font-normal",
            !value && "text-muted-foreground",
          )}
        >
          <CalendarIcon />
          <p className="text-sm">
            {value ? format(value, "PPP") : <span>Pick a date</span>}
          </p>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleDateSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};
