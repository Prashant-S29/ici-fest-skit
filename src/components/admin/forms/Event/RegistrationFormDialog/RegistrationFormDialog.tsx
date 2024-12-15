/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
"use client";

// Hooks
import { useMounted } from "@/hooks";

// Schema
import {
  CreateEventRegistrationFormSchema,
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
  Switch,
} from "@/components/ui";
import { useEffect, useState } from "react";
import { REGISTRATION_FORM_DEFAULTS } from "@/global/formDefaults";

export const RegistrationFormDialog = ({
  append,
  update,
  remove,
  updateIndex,
  removeIndex,
  data,
  state,
  trigger,
  isFormSubmitting,
}: {
  append?: UseFieldArrayAppend<
    z.infer<typeof CreateEventSchema>,
    "registrationForm"
  >;
  update?: UseFieldArrayUpdate<
    z.infer<typeof CreateEventSchema>,
    "registrationForm"
  >;
  remove?: UseFieldArrayRemove;
  updateIndex?: number;
  removeIndex?: number;
  data?: z.infer<typeof CreateEventRegistrationFormSchema>;
  state: "CREATE" | "UPDATE" | "DELETE";
  trigger?: React.ReactNode;
  isFormSubmitting: boolean;
}) => {
  const [open, setOpen] = useState(false);

  const isMounted = useMounted();

  type CreateEventRegistrationData = z.infer<
    typeof CreateEventRegistrationFormSchema
  >;
  const form = useForm<CreateEventRegistrationData>({
    resolver: zodResolver(CreateEventRegistrationFormSchema),
    defaultValues: data ? data : REGISTRATION_FORM_DEFAULTS,
  });

  useEffect(() => {
    if (!data) return;
    form.reset(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // add form data
  const handleAddForm = (formData: CreateEventRegistrationData) => {
    if (append) {
      append(formData);
      // form.
      form.reset(REGISTRATION_FORM_DEFAULTS);
      setOpen(false);
    }
  };

  const handleUpdateForm = (formData: CreateEventRegistrationData) => {
    if (update && updateIndex !== undefined) {
      update(updateIndex, formData);
      form.reset(REGISTRATION_FORM_DEFAULTS);
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
            <Plus className="h-4 w-4" /> Add Form
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className={`max-w-[500px]`}>
        <DialogHeader>
          <DialogTitle>
            {state === "DELETE"
              ? "Delete Registration Form"
              : state === "CREATE"
                ? "New Registration Form"
                : "Edit Registration Form"}
          </DialogTitle>
          <DialogDescription>
            {/* Fill the below details for add a registration form */}
            {state === "DELETE" ? (
              <span>
                <span className="font-medium">
                  This action can&apos;t be undone.
                </span>{" "}
                Are you sure you want to delete{" "}
                <span className="font-medium">{data?.title}</span>
              </span>
            ) : state === "CREATE" ? (
              "Fill the below details for add a registration form"
            ) : (
              <span>
                Fill the below details for update{" "}
                <span className="font-medium">{data?.title}</span>
              </span>
            )}
            <br />
          </DialogDescription>
        </DialogHeader>

        {state === "DELETE" ? (
          <div className="flex justify-end">
            <DialogClose asChild>
              <Button size="sm" variant="ghost">
                Cancel
              </Button>
            </DialogClose>

            <Button size="sm" variant="destructive" onClick={handleFormRemove}>
              Delete this form
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form
              // id="registrationFormDialogForm"
              // onSubmit={form.handleSubmit(submitHandler)}
              // onSubmit={(e) => {
              //   e.stopPropagation();
              //   e.preventDefault();

              //   // the void is for eslint because `handleSubmit` returns a promise.
              //   submitHandler(form.getValues());
              // }}
              className="space-y-3"
            >
              <div className="flex flex-col gap-4">
                {/* Form Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="gap-[50px] space-y-0">
                      <div className="leading-tight">
                        <FormLabel className="leading-tight">Title</FormLabel>
                        <FormDescription className="text-xs text-black/70">
                          This is the title of your form. It will be visible to
                          all the participants who are registering.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <div className="w-full">
                          <Input
                            placeholder="Form Title"
                            className="mt-2 px-5 py-5 font-medium"
                            {...field}
                          />
                          <FormMessage className="mt-1 px-1" />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Form URL */}
                <FormField
                  control={form.control}
                  name="formURL"
                  render={({ field }) => (
                    <FormItem className="gap-[50px] space-y-0">
                      <div className="leading-tight">
                        <FormLabel className="leading-tight">URL</FormLabel>
                        <FormDescription className="text-xs text-black/70">
                          URL of your form. This can either be a link for a{" "}
                          <span className="font-semibold">Google Form</span> or
                          a{" "}
                          <span className="font-semibold">
                            ERP generated form
                          </span>
                        </FormDescription>
                      </div>
                      <FormControl>
                        <div className="w-full">
                          <Input
                            placeholder="Form URL"
                            className="mt-2 px-5 py-5 font-medium"
                            {...field}
                          />
                          <FormMessage className="mt-1 px-1" />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Form Amount */}
                <FormField
                  control={form.control}
                  name="formAmount"
                  render={({ field: { onChange, value, ...fieldProps } }) => (
                    <FormItem className="gap-[50px] space-y-0">
                      <div className="leading-tight">
                        <FormLabel className="leading-tight">Amount</FormLabel>
                        <FormDescription className="text-xs text-black/70">
                          This is the registration amount.{" "}
                          <span className="font-semibold">
                            Enter 0 if there is no registration fee.
                          </span>
                        </FormDescription>
                      </div>
                      <FormControl>
                        <div className="w-full">
                          <Input
                            type="number"
                            placeholder="Amount"
                            className="mt-2 px-5 py-5 font-medium"
                            min={0}
                            {...fieldProps}
                            value={value ?? 0}
                            onChange={(e) => {
                              const numValue =
                                e.target.value === ""
                                  ? 0
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

                {/* Active Status */}
                <div className="rounded-lg border px-3 py-2">
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>Registration Status</FormLabel>
                          <FormDescription>
                            Is this form is still accepting registration
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(e) => {
                              field.onChange(e);
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <DialogFooter>
                <div className="flex gap-2">
                  <DialogClose asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        form.reset(REGISTRATION_FORM_DEFAULTS);
                      }}
                    >
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
