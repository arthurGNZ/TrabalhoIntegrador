'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Pula o primeiro render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Só recarrega nas mudanças subsequentes
    window.location.reload();
  }, [pathname]);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}