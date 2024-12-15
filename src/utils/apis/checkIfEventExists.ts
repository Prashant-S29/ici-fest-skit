"use server";

import { api } from "@/trpc/server";

export const checkIfEventExists = async ({ slug }: { slug: string }) => {
  const event = await api.event.getEventBySlug({ slug: slug });
  if (event) {
    return true;
  }

  return false;
};
