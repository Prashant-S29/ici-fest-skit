import "@/styles/globals.css";

// import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";

// Font
import { montserrat } from "@/fonts";


export const metadata: Metadata = {
  title: "Create T3 App",
  description: "Generated by create-t3-app",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function SuperAdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {

  return (
    <html lang="en" className={`${montserrat.className}`}>
      <body>{children}</body>
    </html>
  );
}
