"use client";

import React from "react";
import Image from "next/image";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ImagePreviewProps {
  src: string;
  children: React.ReactNode;
  className?: string;
}

// const customLoader = ({src}: {src: string}) => {
//   return `${src}`;
// }

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  src,
  className,
  children,
}) => {
  return (
    <Dialog modal>
      <DialogTrigger asChild className="cursor-pointer">
        {children}
      </DialogTrigger>
      <DialogContent
        className={`flex h-screen min-w-full items-center justify-center rounded-none border-none bg-black/10 p-0 shadow-none`}
      >
        <DialogTitle className="hidden"></DialogTitle>
        <Image
          src={src}
          alt="preview"
          // loader={src}
          unoptimized
          width={600}
          height={800}
          className={cn(className, "max-w-[700px]")}
          // onLoad={() => URL.revokeObjectURL(src)}
        />
      </DialogContent>
    </Dialog>
  );
};
