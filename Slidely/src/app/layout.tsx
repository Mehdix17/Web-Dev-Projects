import type { Metadata } from "next";
import localFont from "next/font/local";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AppCursor } from "@/components/ui/AppCursor";
import { ScrollSmoother } from "@/components/ui/ScrollSmoother";
import { SplashLoader } from "@/components/animations/SplashLoader";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Slidely | Strategic Presentation Design",
  description: "Elevating presentations through strategic design.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} antialiased min-h-screen flex flex-col`}
      >
        <SplashLoader />
        <ScrollSmoother />
        <AppCursor />
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
