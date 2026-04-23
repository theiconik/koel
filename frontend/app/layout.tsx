import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "koel",
  description: "AI voice-powered surveys.",
  icons: {
    icon: "/koel-logo.svg",
    apple: "/koel-logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full">
        <body className="min-h-full">{children}</body>
      </html>
    </ClerkProvider>
  );
}
