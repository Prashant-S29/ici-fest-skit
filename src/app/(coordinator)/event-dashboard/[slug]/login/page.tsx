"use client";

// components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useParams } from "next/navigation";

const Login: React.FC = () => {
  const params: { slug: string } = useParams();

  return (
    <div className="flex h-screen w-full items-center justify-center px-[250px] py-[50px]">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Login</CardTitle>
          <CardDescription className="-mt-2">
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Event Id</Label>
                <Input
                  id="Event Id"
                  type="text"
                  placeholder="Event Id"
                  defaultValue={params.slug}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
