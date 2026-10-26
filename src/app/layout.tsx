import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
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

const playfair = Playfair_Display({
  variable: "--font-serif-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "BusinessHub India — B2B + B2C Marketplace with Live Map",
  description: "India's unified B2B + B2C marketplace. Find verified suppliers, wholesalers, manufacturers, retailers near you with live map location.",
  keywords: ["B2B marketplace", "India business directory", "wholesale suppliers", "live map", "verified businesses", "JustDial", "IndiaMART"],
  authors: [{ name: "BusinessHub India" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "BusinessHub India",
    description: "Find verified businesses near you with live map",
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
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
