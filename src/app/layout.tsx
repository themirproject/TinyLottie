import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from '@next/third-parties/google';
import { Analytics } from "@vercel/analytics/next";
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
  title: "TinyLottie - Fast Lottie Optimizer",
  description: "Compress Lottie and dotLottie animations instantly right in your browser.",
  keywords: ["Lottie JSON optimizer", "Compress Lottie files", "dotLottie compressor", "JSON animation compression", "AfterEffects Lottie"],
  icons: {
    icon: "/icon.png",
  },
};

import { AuthProvider } from "@/contexts/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "name": "TinyLottie",
        "url": "https://tinylottie.com",
        "logo": "https://tinylottie.com/icon.png"
      },
      {
        "@type": "SoftwareApplication",
        "name": "TinyLottie Optimizer",
        "operatingSystem": "Any",
        "applicationCategory": "UtilitiesApplication",
        "description": "Compress Lottie and dotLottie animations instantly right in your browser.",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        }
      }
    ]
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
      <GoogleAnalytics gaId="G-4CF9E7S9RK" />
      <Analytics />
    </html>
  );
}
