import DisableZoom from "@/components/DisableZoom";
import MaintenanceGate from "@/components/MaintenanceGate";
import SocketProvider from "@/providers/SocketProvider";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Toaster } from "react-hot-toast";
import "./globals.css";

import StoreProvider from "./StoreProvider";
import Providers from "./providers";

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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Ludo Party",
  description: "Play Ludo Party on mobile with a fast, responsive experience",
  openGraph: {
    title: "Ludo Party",
    description: "Play Ludo Party on mobile with a fast, responsive experience",
    url: "https://sw999.bet",
    siteName: "Ludo Party",
    images: [
      {
        url: "https://sw999.bet/og-image.png",
        width: 1200,
        height: 630,
        alt: "Ludo Party",
      },
    ],
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased app-default-bg`}
        suppressHydrationWarning={true}
      >
        <DisableZoom />
        <StoreProvider>
          <SocketProvider>
            <Providers>
              <MaintenanceGate>{children}</MaintenanceGate>
            </Providers>
          </SocketProvider>
        </StoreProvider>

        <Toaster />
      </body>
    </html>
  );
}
