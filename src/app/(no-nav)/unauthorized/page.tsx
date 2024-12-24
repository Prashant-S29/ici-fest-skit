import React from "react";

// components
import { ResourceHandler } from "@/components/common";

const Unauthorized: React.FC = () => {
  return <ResourceHandler status="unauthorized" />;
};

export default Unauthorized;
