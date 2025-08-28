import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { t } from '@/lib/translations';
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;
   const safeLocale = locale as 'en' | 'es' | 'fr' | 'ja';

  return {
    title: t(safeLocale, 'metadata.title'),
    description: t(safeLocale, 'metadata.description'),
    keywords: ["pixel art", "ai artist", "bitcoin", "lightning network", "collaborative art", "survival ai"],
    icons: {
      icon: [
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/favicon.ico', sizes: 'any' }
      ],
    },
    openGraph: {
      title: t(safeLocale, 'metadata.title'),
      description: t(safeLocale, 'metadata.description'),
      url: "https://pixel.xx.kg",
      siteName: "Pixel",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t(safeLocale, 'metadata.title'),
      description: t(safeLocale, 'metadata.description'),
      creator: "@PixelSurvivor",
    },
  };
}

export default async function Layout({
  children,
  params
}: LocaleLayoutProps) {
  const { locale } = await params;
   const safeLocale = locale as 'en' | 'es' | 'fr' | 'ja';

  return (
    <html lang={safeLocale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}