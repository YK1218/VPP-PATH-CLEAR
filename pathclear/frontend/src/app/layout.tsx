import type { Metadata } from "next";
import { Atkinson_Hyperlegible } from "next/font/google";
import "./globals.css";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { VoiceAgentProvider } from "@/contexts/VoiceAgentContext";
import { MapProvider } from "@/contexts/MapContext";
import VoiceAgentPanel from "@/components/voice/VoiceAgentPanel";

const atkinson = Atkinson_Hyperlegible({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-atkinson",
});

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
    <html lang="en" className={`h-full antialiased ${atkinson.variable}`}>
      <body className="min-h-full flex flex-col bg-[#f5f8fa] text-gray-900 font-sans" suppressHydrationWarning>
        <ProfileProvider>
          <AuthProvider>
            <VoiceAgentProvider>
              <MapProvider>
                {children}
                <VoiceAgentPanel />
              </MapProvider>
            </VoiceAgentProvider>
          </AuthProvider>
        </ProfileProvider>
      </body>
    </html>
  );
}