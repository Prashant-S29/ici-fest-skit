"use client";

import { Button } from "@/components/ui";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { type Session } from "next-auth";

interface Props {
  data: Session | null;
  status: "authenticated" | "loading" | "unauthenticated"
}

export const AdminProfile: React.FC<Props> = ({ data, status }) => {

  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await signOut();
      setIsLoading(false);
      toast.success("Logout successful");
      router.push("/admin/login");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <>
      {status === "loading" ? (
        <Button
          size="icon"
          disabled
          variant="secondary"
          className="flex items-center justify-center rounded-full"
        >
          <Loader2 className="h-5 w-5 animate-spin" />
        </Button>
      ) : data && data.user && data.user.id ? (
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                className="flex items-center justify-center rounded-full"
              >
                A
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Admin</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="">
                <Button
                  loading={isLoading}
                  disabled={isLoading}
                  onClick={handleLogout}
                  className="w-full hover:bg-primary/90"
                  size="sm"
                >
                  Logout
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <Button className="font-semibold" size="sm" asChild>
          <Link href="/admin/login">Login</Link>
        </Button>
      )}
    </>
  );
};
