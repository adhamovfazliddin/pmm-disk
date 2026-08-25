"use client";

import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/lib/i18n";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
      <LanguageProvider>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </LanguageProvider>
    </ThemeProvider>
  );
}
