import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/Providers";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import Footer from "@/components/Footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SyncStack | The Developer Matchmaking Engine",
  description: "AI-driven team assembly for campus developers.",
  icons: { icon: "/logo.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased min-h-screen flex flex-col bg-background text-foreground`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Providers>
            {children}
            <Footer />
            <Toaster
              position="top-center"
              duration={2000}
              richColors
              theme="system"
              toastOptions={{
                className: "font-sans font-medium rounded-xl border p-4 shadow-lg backdrop-blur-md",
              }}
            />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}