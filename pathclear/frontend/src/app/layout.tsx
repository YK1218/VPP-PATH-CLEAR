import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
        {children}
      </body>
    </html>
  );
}
