import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from '@next/third-parties/google';
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/components/ui/sonner";
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
  metadataBase: new URL('https://tinylottie.com'),
  title: {
    default: "TinyLottie | Blazing Fast Lottie & dotLottie Optimizer",
    template: "%s | TinyLottie"
  },
  description: "Optimize and compress Lottie (JSON) and dotLottie animations up to 98% instantly. Zero uploads, 100% private in-browser tool for designers and developers.",
  keywords: [
    "Lottie optimizer", "Compress Lottie files", "dotLottie compressor", 
    "Lottie JSON compression", "Web animation optimizer", "AfterEffects Lottie", 
    "Bodymovin optimizer", "In-browser Lottie processing", "Free Lottie compression",
    "TinyLottie", "Reduce Lottie file size"
  ],
  authors: [{ name: "Emir", url: "https://tinylottie.com" }],
  creator: "TinyLottie",
  publisher: "TinyLottie",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "TinyLottie | Blazing Fast Lottie & dotLottie Optimizer",
    description: "Compress and optimize Lottie (JSON) and dotLottie animations up to 98% entirely in your browser. Zero uploads, 100% privacy guarantee.",
    url: 'https://tinylottie.com',
    siteName: 'TinyLottie',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "TinyLottie | Blazing Fast Lottie & dotLottie Optimizer",
    description: "Compress and optimize Lottie (JSON) and dotLottie animations up to 98% entirely in your browser. Zero uploads, 100% privacy guarantee.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
          <Toaster />
          {children}
        </AuthProvider>
      </body>
      <GoogleAnalytics gaId="G-4CF9E7S9RK" />
      <Analytics />
    </html>
  );
}
