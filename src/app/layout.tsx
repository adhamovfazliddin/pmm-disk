import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import NextTopLoader from 'nextjs-toploader';
import { Providers } from "@/components/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Andijon viloyati pedagogik mahorat markazi",
  description: "Andijon viloyati pedagogik mahorat markazi raqamli platformasi",
  icons: {
    icon: '/logo.png?v=2',
    shortcut: '/logo.png?v=2',
    apple: '/logo.png?v=2',
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="uz"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-[#0B0F17] dark:text-slate-100 transition-colors duration-200 relative">
        {/* Ambient soft glow at the top */}
        <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-blue-50/80 via-slate-50/20 to-transparent pointer-events-none dark:hidden z-0" />
        <NextTopLoader color="#3b82f6" height={3} showSpinner={false} shadow="0 0 10px #3b82f6,0 0 5px #3b82f6" />
        <Providers>
          <div className="relative z-10 flex flex-col flex-1">
            {children}
          </div>
          <Toaster position="top-right" richColors closeButton />
        </Providers>
      </body>
    </html>
  );
}
