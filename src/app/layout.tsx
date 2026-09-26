import type { Metadata, Viewport } from "next";
import { Anton, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://boykotparadox.vercel.app"),
  title: "Boykot Paradox — Tüm Platformlarda 1 Yıldız Kampanyası | #BoycottParadox",
  description:
    "Paradox Interactive resmi Discord'undaki Atatürk'e hakaret ve Türk oyuncuları sansürleme skandalına karşı tek ses! Steam, Metacritic, Trustpilot ve Google'da 1 yıldız vererek sesini duyur.",
  keywords: [
    "paradox boykot",
    "boykot paradox",
    "hearts of iron 4 ataturk",
    "hoi4 boykot",
    "paradox interactive boykot",
    "ataturk skandali",
    "steam 1 yildiz",
    "paradox inceleme boykotu",
    "hoi4 discord atatürk",
    "eu4 boykot",
    "ck3",
    "victoria 3",
    "stellaris",
    "cities skylines",
    "boycott paradox",
    "paradox interactive scandal",
    "emrah safa gürkan boykot",
    "trustpilot paradox boykot",
    "google paradox 1 yıldız",
    "steam review bomb paradox",
  ],
  authors: [{ name: "Türk Oyuncu Topluluğu İnisiyatifi" }],
  verification: {
    google: "hYFGZJAo0Z4zRDGxUsflXR2QQ-RwHAbmVURjZO-EBDw",
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
  alternates: {
    canonical: "https://boykotparadox.vercel.app/",
  },
  openGraph: {
    siteName: "Boykot Paradox — 1★ Boykot Hareketi",
    locale: "tr_TR",
    alternateLocale: ["en_US"],
    title: "Boykot Paradox — Resmi Atatürk Skandalına Karşı 1★ Kampanyası",
    description:
      "Sadece Steam değil: Metacritic, Trustpilot, Epic, GOG ve Google üzerinden Paradox'a tek dokunuşla 1 yıldız ver. Topluluğuna ve kurucu değerlerine saygı göstermeyen firmaya sıfır tolerans!",
    type: "website",
    url: "https://boykotparadox.vercel.app/",
    images: [
      {
        url: "https://boykotparadox.vercel.app/ataturk-human.jpg",
        width: 1200,
        height: 630,
        alt: "Gazi Mustafa Kemal Atatürk — Boykot Paradox Kampanyası",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Boykot Paradox — Resmi Atatürk Skandalına Karşı 1★ Kampanyası",
    description:
      "Hearts of Iron IV Discord skandalına karşı Paradox Interactive oyunlarına ve kurumsal sayfalarına 1 yıldız vererek sesini duyur.",
    images: ["https://boykotparadox.vercel.app/ataturk-human.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico?v=2", sizes: "any" },
      { url: "/favicon-32x32.png?v=2", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png?v=2", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png?v=2",
  },
  manifest: "/site.webmanifest",
  other: {
    "geo.region": "TR",
    "geo.placename": "Türkiye",
    "geo.position": "38.9637;35.2433",
    ICBM: "38.9637, 35.2433",
    rating: "general",
    distribution: "global",
    language: "tr",
  },
};

import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${anton.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-ink antialiased selection:bg-seal selection:text-paper">
        {children}
        <Analytics />
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
