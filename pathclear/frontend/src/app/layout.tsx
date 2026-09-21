import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PathClear | Accessible Routing & Doorway Verification",
  description:
    "Low-friction accessibility navigation centered on micro-segment routing, the Last 50 Feet, and 1-tap live verification.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased ${inter.className}`}>
      <body className="min-h-full flex flex-col bg-[#f5f8fa] text-gray-900" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
