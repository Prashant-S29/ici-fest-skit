import Link from "next/link";
import React from "react";

export const Hero: React.FC = () => {


  

  return (
    <div className="flex h-screen w-full items-center justify-center bg-white">
      {/* <p className="" data-highlighted-text>Video goes here</p> */}
      <p>
        Go To Admin Pane - <Link href="/admin/dashboard">here</Link>
      </p>
    </div>
  );
};
