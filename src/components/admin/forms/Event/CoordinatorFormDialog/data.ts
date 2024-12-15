import type { BranchTypeSchema } from "@/schema/event.schema";
import type { z } from "zod";

export const BranchOptions: {
  label: string;
  value: z.infer<typeof BranchTypeSchema>;
}[] = [
  {
    label: "CSE",
    value: "CSE",
  },
  {
    label: "CSE-AI",
    value: "CSE_AI",
  },
  {
    label: "CSE-DS",
    value: "CSE_DS",
  },
  {
    label: "CSE-IOT",
    value: "CSE_IOT",
  },
  {
    label: "IT",
    value: "IT",
  },
  {
    label: "ECE",
    value: "ECE",
  },
  {
    label: "CE",
    value: "CE",
  },
  {
    label: "EE",
    value: "EE",
  },
  {
    label: "ME",
    value: "ME",
  },
];
