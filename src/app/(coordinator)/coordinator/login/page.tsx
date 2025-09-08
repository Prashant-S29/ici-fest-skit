"use client";

import { type z } from "zod";
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
import { CoordinatorLoginSchema } from "@/schema/admin.schema";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Form data type inferred from Zod schema
type CoordinatorLoginFormValues = z.infer<typeof CoordinatorLoginSchema>;

const Login: React.FC = () => {
  const { status } = useSession();
  const mounted = useMounted();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CoordinatorLoginFormValues>({
    resolver: zodResolver(CoordinatorLoginSchema),
    defaultValues: {
      coordinatorEmail: "",
      eventId: "",
      password: "",
    },
  });

  const onSubmit = async (data: CoordinatorLoginFormValues) => {
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        coordinatorEmail: data.coordinatorEmail,
        eventId: data.eventId,
        password: data.password,
        redirect: false,
      });

      if (res?.error) {
        switch (res.error) {
          case "CredentialsSignin":
            try {
              toast.error("Invalid email or password");
            } catch (checkError: unknown) {
              console.error(checkError);
              toast.error("Account not found");
            }
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
        // redirect to coordinator dashboard
        router.push("/coordinator/dashboard");
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
              <CardTitle className="text-xl">Coordinator Login</CardTitle>
              <CardDescription className="-mt-2">
                Enter your Event ID and Password to log in to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="flex flex-col gap-2">
                    <FormField
                      control={form.control}
                      name="coordinatorEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Coordinator Email</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Coordinator Email"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage>
                            {form.formState.errors.coordinatorEmail?.message}
                          </FormMessage>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="eventId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event ID</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Event ID"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage>
                            {form.formState.errors.eventId?.message}
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
