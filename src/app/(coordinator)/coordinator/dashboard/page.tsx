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

  return (
    <>
      {data && data.user && data.user.id ? (
        <div className="min-h-screen w-full bg-[#f7f7f7]">
          <EventInfo eventId={data.user.id} />
        </div>
      ) : (
        <ResourceHandler status="notFound" />
      )}
    </>
  );
};

export default CoordinatorDashboard;
