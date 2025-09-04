import type { Metadata } from "next";
import "./globals.css";
import SwRegistrar from "./SwRegistrar";
import type { Viewport } from "next";
export const viewport: Viewport = {
  themeColor: "#4f46e5",
};

// PWA + App metadata
export const metadata: Metadata = {
  title: "Gyrilogic — Applied Default Human Logic Layer",
  description: "Safe, clear, culturally intelligent writing for everyone.",
  applicationName: "Gyrilogic",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Gyrilogic",
  },
};

// Simple SW registrar (kept from your version)

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* Explicit PWA tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4f46e5" />
      </head>
      <body>
        <SwRegistrar />
        {children}
      </body>
    </html>
  );
}
