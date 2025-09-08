"use client";

import type { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Next Auth
import { signIn, useSession } from "next-auth/react";
import { toast } from "sonner";
import { PageLoader } from "@/components/common/PageLoader";
import { useMounted } from "@/hooks";
import Link from "next/link";
import { AdminLoginSchema } from "@/schema/admin.schema";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Form data type inferred from Zod schema
type AdminLoginFormValues = z.infer<typeof AdminLoginSchema>;

const Login: React.FC = () => {
  const { status } = useSession();
  const mounted = useMounted();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AdminLoginFormValues>({
    resolver: zodResolver(AdminLoginSchema),
    defaultValues: {
      adminId: "",
      password: "",
    },
  });

  const onSubmit = async (data: AdminLoginFormValues) => {
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        adminId: data.adminId,
        password: data.password,
        redirect: false,
      });

      if (res?.error) {
        // Handle different error scenarios
        switch (res.error) {
          case "CredentialsSignin":
            // This is the generic error NextAuth returns when authorize() returns null
            toast.error("Invalid Admin ID or password");
            break;
          case "Configuration":
            toast.error("Server error, contact admin");
            break;
          case "AccessDenied":
            toast.error("Access denied");
            break;
          case "Verification":
            toast.error("Account verification failed");
            break;
          default:
            toast.error("Server error, contact admin");
        }
      } else if (res?.ok) {
        toast.success("Login successful");
        // redirect to admin dashboard
        router.push("/admin/dashboard");
      } else {
        // Fallback error
        toast.error("Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login failed", error);
      toast.error("Server error, contact admin");
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted)
    return (
      <div>
        <PageLoader />
      </div>
    );

  return (
    <>
      {status === "loading" ? (
        <PageLoader />
      ) : (
        <div className="flex h-screen w-full items-center justify-center px-[250px] py-[50px]">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Admin Login</CardTitle>
              <CardDescription className="-mt-2">
                Enter your Admin ID and Password to log in to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="flex flex-col gap-2">
                    <FormField
                      control={form.control}
                      name="adminId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admin ID</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Admin ID"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage>
                            {form.formState.errors.adminId?.message}
                          </FormMessage>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="password"
                              placeholder="Password"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage>
                            {form.formState.errors.password?.message}
                          </FormMessage>
                        </FormItem>
                      )}
                    />

                    <Button
                      loading={isLoading}
                      type="submit"
                      className="mt-2 w-full"
                      disabled={isLoading}
                    >
                      Login
                    </Button>

                    <Button
                      type="button"
                      className="w-full text-black"
                      variant="link"
                      disabled={isLoading}
                      asChild
                    >
                      <Link href="/">back to home</Link>
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default Login;
