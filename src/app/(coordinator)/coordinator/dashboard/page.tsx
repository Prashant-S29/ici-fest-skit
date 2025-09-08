"use client";

import { ResourceHandler } from "@/components/common";
import { PageLoader } from "@/components/common/PageLoader";
import { EventInfo } from "@/components/coordinator/feature";
import { useMounted } from "@/hooks";
import { useSession } from "next-auth/react";
import React from "react";

const CoordinatorDashboard: React.FC = () => {
  const { data, status } = useSession();
  const mounted = useMounted();

  if (!mounted) {
    return <PageLoader />;
  }

  if (status === "loading") {
    return <PageLoader />;
  }

  if (status === "unauthenticated" || !data?.user?.id) {
    return <ResourceHandler status="unauthorized" />;
  }

  return (
    <div className="min-h-screen w-full bg-[#f7f7f7]">
      <EventInfo eventId={data.user.id} />
    </div>
  );
};

export default CoordinatorDashboard;
