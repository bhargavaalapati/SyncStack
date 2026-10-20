import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/Providers";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import Footer from "@/components/Footer";
import { GlobalChatDrawer } from "@/components/GlobalChatDrawer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SyncStack Enterprise | Autonomous Project Architecture & Workforce Matchmaking",
  description:
    "AI-driven system architecture generation, live GitHub skill telemetry verification, and multi-vector team matchmaking powered by Gemini 2.5 Flash.",
  keywords: [
    "SyncStack",
    "AI Project Architect",
    "GitHub Skill Verifier",
    "Developer Matchmaking",
    "Next.js 16",
    "FastAPI",
    "Gemini 2.5 Flash",
  ],
  icons: { icon: "/logo.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased min-h-screen flex flex-col bg-background text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Providers>
            {children}
            <GlobalChatDrawer />
            <Footer />
            <Toaster
              position="top-center"
              duration={2000}
              richColors
              theme="system"
              toastOptions={{
                className:
                  "font-sans font-medium rounded-xl border p-4 shadow-lg backdrop-blur-md",
              }}
            />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}