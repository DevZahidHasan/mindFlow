import type { Metadata } from "next";
import "@/styles/globals.css";
import { CustomCursor } from "@/components/shared/cursor";

export const metadata: Metadata = {
  title: "MINDSPACE — Your Knowledge Has a Shape",
  description:
    "An AI-powered visual knowledge operating system combining notes, timelines, and interactive semantic graphs in a premium mobile-first editorial interface.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "MINDSPACE — Your Knowledge Has a Shape",
    description:
      "An AI-powered visual knowledge operating system combining notes, timelines, and interactive semantic graphs in a premium mobile-first editorial interface.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "MINDSPACE — Your Knowledge Has a Shape",
    description:
      "An AI-powered visual knowledge operating system combining notes, timelines, and interactive semantic graphs in a premium mobile-first editorial interface.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col relative">
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
