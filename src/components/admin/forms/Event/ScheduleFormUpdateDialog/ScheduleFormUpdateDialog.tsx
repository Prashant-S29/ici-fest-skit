/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

import React from "react";

// Schema
import type {
  CreateEventScheduleSchema,
  CreateEventSchema,
} from "@/schema/event.schema";

// Zod and RHF
import type { z } from "zod";
import type { UseFieldArrayRemove, UseFieldArrayUpdate } from "react-hook-form";

// Icons
import { DeleteIcon, EditIcon } from "@/icons";

// Components
import { ScheduleFormDialog } from "../ScheduleFormDialog";
import { Button } from "@/components/ui";
import { convertMinsToTimeString, formatDate } from "@/utils/timeHandler";

interface Props {
  updateIndex: number;
  data: z.infer<typeof CreateEventScheduleSchema>;
  update: UseFieldArrayUpdate<z.infer<typeof CreateEventSchema>, "schedule">;
  remove: UseFieldArrayRemove;
  removeIndex: number;
  isFormSubmitting: boolean;
}

export const ScheduleFormUpdateDialog: React.FC<Props> = ({
  data,
  updateIndex,
  update,
  remove,
  removeIndex,
  isFormSubmitting,
}) => {
  if (!data) return null;

  return (
    <div className="flex w-full justify-between rounded-lg border px-3 py-2">
      <section className="w-full text-left">
        <p className="text-xs text-black/70">Schedule {updateIndex + 1}</p>
        <div className="flex w-full justify-between gap-9">
          <p className="mt-1 line-clamp-1 text-sm font-medium leading-tight">
            {data.title}
          </p>
          <section className="flex items-center gap-2 leading-none">
            <section className="flex gap-1">
              <ScheduleFormDialog
                data={data}
                state="DELETE"
                remove={remove}
                removeIndex={removeIndex}
                isFormSubmitting={isFormSubmitting}
                trigger={
                  <Button
                    size="sm"
                    className="h-auto bg-white p-0 shadow-none hover:bg-white"
                    disabled={isFormSubmitting}
                  >
                    <DeleteIcon className="text-red-600" />
                  </Button>
                }
              />
              <ScheduleFormDialog
                data={data}
                updateIndex={updateIndex}
                state="UPDATE"
                update={update}
                isFormSubmitting={isFormSubmitting}
                trigger={
                  <Button
                    size="sm"
                    className="h-auto bg-white p-0 shadow-none hover:bg-white"
                    disabled={isFormSubmitting}
                  >
                    <EditIcon className="text-black" />
                  </Button>
                }
              />
            </section>
          </section>
        </div>
        <section className="mt-1">
          <p className="text-xs text-black/70">
            {formatDate(data.date)} &#x2022;{" "}
            {convertMinsToTimeString(data.startTime)} -{" "}
            {convertMinsToTimeString(data.endTime)}
          </p>
          <p className="text-xs text-black/70">{data.venue}</p>
        </section>
      </section>
    </div>
  );
};
