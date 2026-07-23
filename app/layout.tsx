import DisableZoom from "@/components/DisableZoom";
import MaintenanceGate from "@/components/MaintenanceGate";
import AttributionCapture from "@/components/marketing/attribution-capture";
import MetaPixel from "@/components/marketing/meta-pixel";
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
const appUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ludowin365.com";
const shareImage = "/icons/icon-512.png";

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

  alternates: {
    canonical: "/",
  },

  icons: {
    icon: [
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
        url: shareImage,
        width: 512,
        height: 512,
        alt: appName,
      },
    ],
    type: "website",
    locale: "en_US",
  },

  twitter: {
    card: "summary",
    title: appName,
    description: "Play Ludo Win on mobile with a fast, responsive experience",
    images: [shareImage],
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
        <MetaPixel />
        <AttributionCapture />

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
