import { Button } from "@/components/ui";
import React from "react";

const IS_ADMIN_LOGIN = false;

export const AdminProfile: React.FC = () => {
  return (
    <>
      {IS_ADMIN_LOGIN ? (
        <div>
          <div className="size-[30px] rounded-full bg-primary" />
        </div>
      ) : (
        <div>
          <Button className="font-semibold" size="sm"> Login</Button>
        </div>
      )}
    </>
  );
};
