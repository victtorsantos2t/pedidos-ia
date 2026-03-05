import type { Metadata, Viewport } from "next";
import "@fontsource/sora";
import "./globals.css";
export const metadata: Metadata = {
  title: "RDOS - Restaurant Digital Ordering System",
  description: "Peça sua comida de forma rápida e premium.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

import { BottomNav } from "@/components/layout/BottomNav";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`font-sans antialiased bg-background text-foreground`}>
        {children}
        <BottomNav />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
