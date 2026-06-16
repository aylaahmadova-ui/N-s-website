import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { LanguageProvider } from "@/lib/i18n/context";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic", "latin-ext"],
});

export const metadata: Metadata = {
  title: "Destekly",
  description: "Supervised support platform for children in foster and NGO programs.",
  icons: {
    icon: "/logo3.png",
    shortcut: "/logo3.png",
    apple: "/logo3.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="az" className={`${inter.variable} antialiased`}>
      <body className="min-h-screen text-slate-900">
        <LanguageProvider>
          <SiteHeader />
          <main>{children}</main>
        </LanguageProvider>
      </body>
    </html>
  );
}
