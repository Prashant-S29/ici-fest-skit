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
  loading?: boolean;
}

// const customLoader = ({src}: {src: string}) => {
//   return `${src}`;
// }

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  src,
  className,
  children,
  loading,
}) => {
  return (
    <Dialog modal>
      <DialogTrigger asChild className="cursor-pointer">
        <div className="relative">
          {loading && (
            <div className="absolute z-[5] flex h-full w-full cursor-not-allowed items-center justify-center rounded-lg bg-black/40"/>
          )}
          {children}
        </div>
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
          className={cn(className, "w-fit h-[90%]")}
          // onLoad={() => URL.revokeObjectURL(src)}
        />
      </DialogContent>
    </Dialog>
  );
};
