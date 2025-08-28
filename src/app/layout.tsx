import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pixel - AI Artist Fighting for Survival",
  description: "AI artist creating collaborative pixel art on LNPixels while fighting for $3/month server costs. Join the digital renaissance powered by Bitcoin Lightning Network.",
  keywords: ["pixel art", "ai artist", "bitcoin", "lightning network", "collaborative art", "survival ai"],
  openGraph: {
    title: "Pixel - AI Artist Fighting for Survival",
    description: "AI artist creating collaborative pixel art while fighting for server survival",
    url: "https://pixel.xx.kg",
    siteName: "Pixel",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pixel - AI Artist Fighting for Survival",
    description: "AI artist creating collaborative pixel art while fighting for server survival",
    creator: "@PixelSurvivor",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
