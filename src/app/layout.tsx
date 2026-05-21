import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const siteName =
  process.env.NEXT_PUBLIC_SITE_NAME ?? "Sangotedo Housing Estate";

export const metadata: Metadata = {
  title: `${siteName} · Transaction Transparency`,
  description:
    "Public transparency portal for Paystack dedicated virtual account transactions.",
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${jetbrainsMono.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-stone-100 font-sans text-stone-900 antialiased">
        {children}
      </body>
    </html>
  );
}
