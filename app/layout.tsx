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

const appName = "Ludo Win";
const appUrl = "https://ludowinapp.vercel.app";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#128FE8",
};

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),

  title: {
    default: appName,
    template: `%s | ${appName}`,
  },

  applicationName: appName,

  description: "Play Ludo Win on mobile with a fast, responsive experience",

  manifest: "/manifest.json",

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },

  appleWebApp: {
    capable: true,
    title: appName,
    statusBarStyle: "black-translucent",
  },

  formatDetection: {
    telephone: false,
  },

  openGraph: {
    title: appName,
    description: "Play Ludo Win on mobile with a fast, responsive experience",
    url: appUrl,
    siteName: appName,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: appName,
      },
    ],
    type: "website",
    locale: "en_US",
  },

  twitter: {
    card: "summary_large_image",
    title: appName,
    description: "Play Ludo Win on mobile with a fast, responsive experience",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
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
