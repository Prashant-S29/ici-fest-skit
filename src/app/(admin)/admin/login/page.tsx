"use client";

import { z } from "zod";
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


// Form data type inferred from Zod schema
type AdminLoginFormValues = z.infer<typeof AdminLoginSchema>;

const Login: React.FC = () => {
  const { status } = useSession();

  const mounted = useMounted();

  const form = useForm<AdminLoginFormValues>({
    resolver: zodResolver(AdminLoginSchema),
    defaultValues: {
      adminId: "",
      password: "",
    },
  });

  const onSubmit = async (data: AdminLoginFormValues) => {
    try {
      const res = await signIn("credentials", {
        adminId: data.adminId,
        password: data.password,
        redirect: true,
      });

      if (res?.ok) {
        toast.success("Login successful");
      }
    } catch (error) {
      console.error("Login failed", error);
      alert("Invalid credentials"); // Replace with proper error handling
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
                              disabled={form.formState.isSubmitting}
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
                              disabled={form.formState.isSubmitting}
                            />
                          </FormControl>
                          <FormMessage>
                            {form.formState.errors.password?.message}
                          </FormMessage>
                        </FormItem>
                      )}
                    />

                    <Button
                      loading={form.formState.isSubmitting}
                      type="submit"
                      className="mt-2 w-full"
                      disabled={form.formState.isSubmitting}
                    >
                      Login
                    </Button>

                    <Button
                      type="submit"
                      className="w-full text-black"
                      variant="link"
                      disabled={form.formState.isSubmitting}
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
