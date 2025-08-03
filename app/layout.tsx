import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DiscordContextProvider } from "@/contexts/DiscordContext";
import { ClerkProvider } from "@clerk/nextjs";
import SupabaseProvider from "@/components/providers/SupabaseProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Discord Clone",
  description: "Powered by Stream Chat",
};

import { ThemeProvider } from "@/components/providers/ThemeProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} bg-white dark:bg-gray-900`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            storageKey="discord-theme"
          >
            <SupabaseProvider>
              <DiscordContextProvider>{children}</DiscordContextProvider>
            </SupabaseProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
