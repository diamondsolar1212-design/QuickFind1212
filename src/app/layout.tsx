import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BusinessHub India — B2B Marketplace & Local Business Directory",
  description: "India's unified B2B + B2C marketplace. Find verified suppliers, wholesalers, manufacturers, retailers near you with live map location. Get best price quotes instantly.",
  keywords: ["B2B marketplace", "India business directory", "wholesale suppliers", "manufacturers India", "live map", "verified businesses", "get best price", "send inquiry"],
  authors: [{ name: "BusinessHub India" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "BusinessHub India",
    description: "Find verified businesses near you with live map. Get best price quotes.",
    siteName: "BusinessHub India",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BusinessHub India",
    description: "India's B2B + B2C marketplace with live map",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
