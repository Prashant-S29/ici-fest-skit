"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { TimePickerInput } from "./timepickerinput";
import { TimePeriodSelect } from "./periodselect";
import { type Period } from "./timepickerutils";

interface TimePickerDemoProps {
  date: Date;
  setDate: (date: Date) => void;
  showSeconds?: boolean;
}

// Helper function to determine period from date
const getPeriodFromDate = (date: Date): Period => {
  const hours = date.getHours();
  return hours >= 12 ? "PM" : "AM";
};

export function TimePicker({
  date,
  setDate,
  showSeconds,
}: TimePickerDemoProps) {
  // Initialize period based on the date prop instead of hardcoding "PM"
  const [period, setPeriod] = React.useState<Period>(() =>
    getPeriodFromDate(date),
  );

  const minuteRef = React.useRef<HTMLInputElement>(null);
  const hourRef = React.useRef<HTMLInputElement>(null);
  const secondRef = React.useRef<HTMLInputElement>(null);
  const periodRef = React.useRef<HTMLButtonElement>(null);

  // Update period when date changes externally
  React.useEffect(() => {
    const newPeriod = getPeriodFromDate(date);
    if (newPeriod !== period) {
      setPeriod(newPeriod);
    }
  }, [date, period]);

  return (
    <div className="flex items-center gap-2">
      <div className="grid gap-1 text-center">
        {/* <Label htmlFor="hours" className="text-xs">
          Hours
        </Label> */}
        <TimePickerInput
          picker="12hours"
          period={period}
          date={date}
          setDate={setDate}
          ref={hourRef}
          onRightFocus={() => minuteRef.current?.focus()}
        />
      </div>
      <span>:</span>
      <div className="grid gap-1 text-center">
        {/* <Label htmlFor="minutes" className="text-xs">
          Minutes
        </Label> */}
        <TimePickerInput
          picker="minutes"
          id="minutes12"
          date={date}
          setDate={setDate}
          ref={minuteRef}
          onLeftFocus={() => hourRef.current?.focus()}
          onRightFocus={() => secondRef.current?.focus()}
        />
      </div>
      {showSeconds && (
        <div className="grid gap-1 text-center">
          <Label htmlFor="seconds" className="text-xs">
            Seconds
          </Label>
          <TimePickerInput
            picker="seconds"
            id="seconds12"
            date={date}
            setDate={setDate}
            ref={secondRef}
            onLeftFocus={() => minuteRef.current?.focus()}
            onRightFocus={() => periodRef.current?.focus()}
          />
        </div>
      )}
      <div className="grid gap-1 text-center">
        {/* <Label htmlFor="period" className="text-xs">
          Period
        </Label> */}
        <TimePeriodSelect
          period={period}
          setPeriod={setPeriod}
          date={date}
          setDate={setDate}
          ref={periodRef}
          onLeftFocus={() => secondRef.current?.focus()}
        />
      </div>
    </div>
  );
}
