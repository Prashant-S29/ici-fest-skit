/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
"use client";

// Hooks
import { useMounted } from "@/hooks";

// Schema
import {
  CreateEventCoordinatorSchema,
  type CreateEventSchema,
} from "@/schema/event.schema";

// Zod and RHF
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { useForm } from "react-hook-form";

import type {
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFieldArrayUpdate,
} from "react-hook-form";

// Icons
import { Plus } from "lucide-react";

// Components
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { useEffect, useState } from "react";
import { COORDINATOR_FORM_DEFAULTS } from "@/global/formDefaults";
import { BranchOptions } from "./data";

interface Props {
  append?: UseFieldArrayAppend<
    z.infer<typeof CreateEventSchema>,
    "coordinators"
  >;
  update?: UseFieldArrayUpdate<
    z.infer<typeof CreateEventSchema>,
    "coordinators"
  >;
  remove?: UseFieldArrayRemove;
  updateIndex?: number;
  removeIndex?: number;
  data?: z.infer<typeof CreateEventCoordinatorSchema>;
  state: "CREATE" | "UPDATE" | "DELETE";
  trigger?: React.ReactNode;
  isFormSubmitting: boolean;
}

export const CoordinatorFormDialog: React.FC<Props> = ({
  append,
  update,
  remove,
  updateIndex,
  removeIndex,
  data,
  state,
  trigger,
  isFormSubmitting,
}) => {
  const [open, setOpen] = useState(false);

  const isMounted = useMounted();

  type CreateEventCoordinatorData = z.infer<
    typeof CreateEventCoordinatorSchema
  >;
  const form = useForm<CreateEventCoordinatorData>({
    resolver: zodResolver(CreateEventCoordinatorSchema),
    defaultValues: data ? data : COORDINATOR_FORM_DEFAULTS,
  });

  useEffect(() => {
    if (!data) return;
    form.reset(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // add form data
  const handleAddForm = (formData: CreateEventCoordinatorData) => {
    if (append) {
      append(formData);
      // form.
      form.reset(COORDINATOR_FORM_DEFAULTS);
      setOpen(false);
    }
  };

  const handleUpdateForm = (formData: CreateEventCoordinatorData) => {
    if (update && updateIndex !== undefined) {
      update(updateIndex, formData);
      form.reset(COORDINATOR_FORM_DEFAULTS);
      setOpen(false);
    } else {
      console.warn("Update function or index is missing");
    }
  };

  const handleFormRemove = () => {
    if (remove && removeIndex !== undefined) {
      remove(removeIndex);
      setOpen(false);
    } else {
      console.warn("Remove function or index is missing");
    }
  };

  // const handleFormHide = () => {
  //   if (update && updateIndex !== undefined && data) {
  //     update(updateIndex, {
  //       ...data,
  //       status: data.status === 1 ? 0 : 1,
  //     });
  //     form.reset(COORDINATOR_FORM_DEFAULTS);
  //     setOpen(false);
  //   } else {
  //     console.warn(
  //       "Update function, index, or data is missing for hide action",
  //     );
  //   }
  // };

  // Determine submit handler based on state
  const submitHandler = (() => {
    switch (state) {
      case "CREATE":
        return handleAddForm;
      case "UPDATE":
        return handleUpdateForm;
      case "DELETE":
        return handleFormRemove;
      default:
        return handleAddForm;
    }
  })();
  // const validateForm = () => {
  //   const data = form.getValues();

  //   if (!data.title) {
  //     form.setError("title", {
  //       message: "Title is required",
  //     });

  //     return;
  //   }

  //   if (!data.formURL?.includes("http")) {
  //     form.setError("formURL", {
  //       message: "Title is required",
  //     });
  //   }
  // };

  if (!isMounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen} modal>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button variant="default" size="sm" disabled={isFormSubmitting}>
            <Plus className="h-4 w-4" /> Add Coordinator
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className={`max-w-[400px]`}>
        <DialogHeader>
          <DialogTitle>
            {state === "DELETE"
              ? "Delete Coordinator Form"
              : state === "CREATE"
                ? "New Coordinator Form"
                : "Edit Coordinator Form"}
          </DialogTitle>
          <DialogDescription>
            {/* Fill the below details for add a coordinator */}
            {state === "DELETE" ? (
              <span>
                <span className="font-semibold">
                  This action can&apos;t be undone.
                </span>{" "}
                Are you sure you want to delete{" "}
                <span className="font-semibold">{data?.name}</span>
              </span>
            ) : state === "CREATE" ? (
              "Fill the below details for add a new coordinator"
            ) : (
              <span>
                Fill the below details for update{" "}
                <span className="font-semibold">{data?.name}</span>
              </span>
            )}
            <br />
          </DialogDescription>
        </DialogHeader>

        {state === "DELETE" ? (
          <div className="-mt-2">
            <section className="mt-3 flex justify-end gap-2">
              <DialogClose asChild>
                <Button size="sm" variant="ghost">
                  Cancel
                </Button>
              </DialogClose>

              <Button
                size="sm"
                variant="destructive"
                onClick={handleFormRemove}
              >
                Delete
              </Button>
            </section>
          </div>
        ) : (
          <Form {...form}>
            <form className="space-y-3">
              <div className="flex flex-col gap-4">
                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="gap-[50px] space-y-0">
                      <div className="leading-tight">
                        <FormLabel className="leading-tight">Name</FormLabel>
                        <FormDescription className="text-xs text-black/70">
                          Name of the coordinator
                        </FormDescription>
                      </div>
                      <FormControl>
                        <div className="w-full">
                          <Input
                            placeholder="Name"
                            className="mt-2 px-5 py-5 font-medium"
                            {...field}
                          />
                          <FormMessage className="mt-1 px-1" />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Phone Number */}
                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem className="gap-[50px] space-y-0">
                      <div className="leading-tight">
                        <FormLabel className="leading-tight">
                          Phone Number
                        </FormLabel>
                        <FormDescription className="text-xs text-black/70">
                          Phone number of the coordinator. Write the number
                          without the country code.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <div className="w-full">
                          <Input
                            placeholder="Phone Number"
                            className="mt-2 px-5 py-5 font-medium"
                            {...field}
                          />
                          <FormMessage className="mt-1 px-1" />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Branch */}
                <FormField
                  control={form.control}
                  name="branch"
                  render={({ field: { value, onChange } }) => (
                    <FormItem className="gap-[50px] space-y-2">
                      <div className="leading-tight">
                        <FormLabel className="leading-tight">Branch</FormLabel>
                        <FormDescription className="text-xs text-black/70">
                          Branch of the coordinator
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Select
                          onValueChange={onChange}
                          defaultValue={value.toString()}
                        >
                          <SelectTrigger className="h-[44px] px-5">
                            <SelectValue placeholder="Select a branch" />
                          </SelectTrigger>
                          <SelectContent>
                            {BranchOptions.map((option, index) => (
                              <SelectItem key={index} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Year */}
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field: { onChange, value, ...fieldProps } }) => (
                    <FormItem className="gap-[50px] space-y-0">
                      <div className="leading-tight">
                        <FormLabel className="leading-tight">Year</FormLabel>
                        <FormDescription className="text-xs text-black/70">
                          Year of Study
                        </FormDescription>
                      </div>
                      <FormControl>
                        <div className="w-full">
                          <Input
                            placeholder="Name"
                            className="mt-2 px-5 py-5 font-medium"
                            min={0}
                            max={4}
                            {...fieldProps}
                            value={value ?? 1}
                            onChange={(e) => {
                              const numValue =
                                e.target.value === ""
                                  ? 1
                                  : Number(e.target.value);
                              onChange(numValue);
                            }}
                          />
                          <FormMessage className="mt-1 px-1" />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <div className="flex gap-2">
                  <DialogClose asChild>
                    <Button variant="secondary" size="sm">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    variant="default"
                    size="sm"
                    type="button"
                    form="registrationFormDialogForm"
                    className={`${state === "UPDATE" ? "bg-green-600 hover:bg-green-600/90" : ""}`}
                    onClick={form.handleSubmit(submitHandler)}
                  >
                    {state === "CREATE" ? "Add" : "Update"}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};
