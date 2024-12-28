/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

import React from "react";
import Link from "next/link";

// Schema
import type {
  CreateEventRegistrationFormSchema,
  CreateEventSchema,
} from "@/schema/event.schema";

// Zod and RHF
import type { z } from "zod";
import type { UseFieldArrayRemove, UseFieldArrayUpdate } from "react-hook-form";

// Icons
import { DeleteIcon, EditIcon } from "@/icons";

// Components
import { RegistrationFormDialog } from "../RegistrationFormDialog";
import { Button } from "@/components/ui";

interface Props {
  updateIndex: number;
  data: z.infer<typeof CreateEventRegistrationFormSchema>;
  update: UseFieldArrayUpdate<
    z.infer<typeof CreateEventSchema>,
    "registrationForm"
  >;
  remove: UseFieldArrayRemove;
  removeIndex: number;
  isFormSubmitting: boolean;
}

export const RegistrationFormUpdateDialog: React.FC<Props> = ({
  data,
  updateIndex,
  update,
  remove,
  removeIndex,
  isFormSubmitting,
}) => {
  if (!data) return null;

  return (
    <div className="flex w-full justify-between rounded-lg border px-3 py-2 pr-2">
      <section className="w-full text-left">
        <section className="w-full flex justify-between items-center">
          <p className="text-xs text-black/70">Form {updateIndex + 1}</p>
          {data.isActive ? (
            <p className="flex items-center justify-center gap-1 rounded-full leading-none bg-green-600/10 px-2 py-1 text-[9px] font-medium text-green-600">
              <span className="min-w-[5px] h-[5px] rounded-full bg-green-600" />
              active
            </p>
          ) : (
            <p className="flex items-center justify-center gap-1 rounded-full leading-none bg-destructive/10 px-2 py-1 text-[9px] font-medium text-destructive">
              <span className="min-w-[5px] h-[5px] rounded-full bg-destructive" />
              not active
            </p>
          )}
        </section>
        <div className="flex w-full justify-between gap-9 mt-2">
          <p className="mt-1 line-clamp-1 text-sm font-medium leading-tight">
            {data.title}
          </p>
          <section className="flex items-center gap-2 leading-none">
            {data.formAmount === 0 ? (
              <p className="rounded-full bg-green-600/10 px-3 py-1 text-xs font-medium leading-none text-green-600">
                Free
              </p>
            ) : (
              <p className="text-sm font-medium leading-tight">
                ₹{data.formAmount}
              </p>
            )}
            <section className="flex gap-1">
              <RegistrationFormDialog
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
              <RegistrationFormDialog
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
        <section className="mt-1 flex justify-between">
          <Link
            href={data.formURL ?? "/"}
            className="line-clamp-1 text-sm leading-tight text-blue-500 hover:underline"
          >
            {data.formURL}
          </Link>
        </section>
      </section>
    </div>
  );
};
