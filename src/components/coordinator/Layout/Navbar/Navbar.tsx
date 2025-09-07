"use client";
import React from "react";
import { useSession, signOut } from "next-auth/react";

import Link from "next/link";

import {
  Button,
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
import { Session } from "next-auth";

export const Navbar: React.FC = () => {
  const { data: session, status } = useSession();

  return (
    <header className="fixed top-0 z-20 flex w-full items-center justify-between border-b bg-white px-[250px] py-5">
      <div className="flex gap-5">
        <p className="text-2xl font-bold">
          <span data-highlighted-text>ICI</span> Fest
        </p>
      </div>

      {session && <CoordinatorProfile data={session} status={status} />}
    </header>
  );
};

interface Props {
  data: Session | null;
  status: "authenticated" | "loading" | "unauthenticated";
}

export const CoordinatorProfile: React.FC<Props> = ({ data, status }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await signOut();
      setIsLoading(false);
      toast.success("Logout successful");
      router.push("/coordinator/login");
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
                {data.user.role === "COORDINATOR" ? "C" : "A"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>
                {data.user.role === "COORDINATOR" ? "Coordinator" : "Admin"}
              </DropdownMenuLabel>
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
