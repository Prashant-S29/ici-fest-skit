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
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal text-sm",
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
          onSelect={(date) => onChange?.(date ? date : new Date())}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};
