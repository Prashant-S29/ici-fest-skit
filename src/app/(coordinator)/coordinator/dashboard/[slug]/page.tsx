"use client";

import { ResourceHandler } from "@/components/common";
import { PageLoader } from "@/components/common/PageLoader";
import { EventInfo } from "@/components/coordinator/feature";
import { useMounted } from "@/hooks";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import React from "react";

const CoordinatorDashboard: React.FC = () => {
  const { data, status } = useSession();
  const params: { slug: string } = useParams();

  const mounted = useMounted();

  if (!mounted) {
    return <PageLoader />;
  }

  if (status === "loading") {
    return <PageLoader />;
  }


  return (
    <>
      {data && data.user && data.user.role !== "ADMIN" ? (
        <ResourceHandler status="unauthorized" />
      ) : (
        <>
          {params.slug ? (
            <EventInfo eventId={params.slug} isAdmin />
          ) : (
            <ResourceHandler status="notFound" />
          )}
        </>
      )}
    </>
  );
};

export default CoordinatorDashboard;
