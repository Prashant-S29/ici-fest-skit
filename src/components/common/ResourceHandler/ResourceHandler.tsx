import { Button } from "@/components/ui";
import Link from "next/link";
import React from "react";

interface Props {
  status: "unauthorized" | "notFound";
}

export const ResourceHandler: React.FC<Props> = ({ status }) => {
  let statusCode: number;
  let message: string;
  let description: string;

  switch (status) {
    case "unauthorized":
      statusCode = 401;
      message = "Unauthorized";
      description = "You are not authorized to access this resource";
      break;
    case "notFound":
      statusCode = 404;
      message = "Not Found";
      description = "The resource you are looking for does not exist";
      break;
    default:
      statusCode = 500;
      message = "Internal Server Error";
      description = "An error occurred while processing your request";
      break;
  }

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <section className="text-center leading-tight">
        <h1 className="text-4xl font-bold text-destructive">{statusCode}</h1>
        <h1 className="text-2xl font-bold text-destructive">{message}</h1>
        <p>{description}</p>

        <p className="mt-2 text-sm text-black/50">
          {statusCode === 500
            ? "Please report this error "
            : "If you think this is a bug, please report it"}{" "}
          <Link
            href="mailto:prashant.s2922@gmail.com"
            className="font-medium text-blue-600"
          >
            here
          </Link>
        </p>

        <Button size="sm" variant="secondary" asChild className="mt-4">
          <Link href="/">Back to Home</Link>
        </Button>
      </section>
    </div>
  );
};
