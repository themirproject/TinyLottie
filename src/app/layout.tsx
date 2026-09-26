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
    default: "TinyLottie | Free Lottie & dotLottie Optimizer — Compress up to 98%",
    template: "%s | TinyLottie"
  },
  description: "Free browser-based Lottie JSON and dotLottie optimizer. Compress Lottie animations up to 98% instantly — no uploads, 100% private. Works with After Effects, Figma, Webflow, React Native, and Next.js.",
  keywords: [
    "Lottie optimizer",
    "Compress Lottie files",
    "dotLottie compressor",
    "Lottie JSON compression",
    "reduce Lottie file size",
    "Lottie file size reducer",
    "optimize Lottie animation",
    "Bodymovin optimizer",
    "After Effects JSON export compress",
    "Lottie Webflow optimization",
    "Lottie React Native optimize",
    "Lottie Next.js optimization",
    "Lottie Figma compress",
    "dotLottie converter",
    "free Lottie compression tool",
    "in-browser Lottie processing",
    "LottieFiles compressor",
    "Lottie JSON minify",
    "compress animation JSON",
    "TinyLottie",
    "Lottie performance optimization",
    "reduce dotLottie size",
    "Lottie bandwidth optimization",
    "web animation optimizer"
  ],
  authors: [{ name: "TinyLottie", url: "https://tinylottie.com" }],
  creator: "TinyLottie",
  publisher: "TinyLottie",
  alternates: {
    canonical: 'https://tinylottie.com',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "TinyLottie — Free Lottie & dotLottie Optimizer, Compress up to 98%",
    description: "Compress Lottie JSON and dotLottie animations up to 98% entirely in your browser. No uploads, 100% private. Works with After Effects, Figma, Webflow & React Native.",
    url: 'https://tinylottie.com',
    siteName: 'TinyLottie',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://tinylottie.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TinyLottie — Lottie & dotLottie Optimizer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@tinylottie',
    title: "TinyLottie — Free Lottie & dotLottie Optimizer",
    description: "Compress Lottie animations up to 98% in your browser. No uploads, 100% private. Free forever.",
    images: ['https://tinylottie.com/og-image.png'],
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
  category: 'technology',
  verification: {
    google: 'googled3fa8073ad49f808',
  },
};

import { AuthProvider } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://tinylottie.com/#website",
        "url": "https://tinylottie.com/",
        "name": "TinyLottie",
        "description": "Free browser-based Lottie JSON and dotLottie optimizer. Compress animations up to 98%.",
        "publisher": {
          "@id": "https://tinylottie.com/#organization"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://tinylottie.com/?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Organization",
        "@id": "https://tinylottie.com/#organization",
        "name": "TinyLottie",
        "url": "https://tinylottie.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://tinylottie.com/favicon.ico",
          "width": 32,
          "height": 32
        },
        "sameAs": [
          "https://twitter.com/tinylottie",
          "https://github.com/themirproject/TinyLottie"
        ]
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://tinylottie.com/#app",
        "name": "TinyLottie Optimizer",
        "url": "https://tinylottie.com",
        "operatingSystem": "Any",
        "applicationCategory": "UtilitiesApplication",
        "applicationSubCategory": "Animation Optimizer",
        "browserRequirements": "Requires a modern browser with WebAssembly and Canvas support",
        "featureList": [
          "Lottie JSON compression up to 98%",
          "dotLottie format conversion",
          "WebP image optimization for embedded assets",
          "Zero-upload 100% private in-browser processing",
          "After Effects Bodymovin export optimization",
          "Figma Lottie export optimization",
          "Webflow Lottie optimization",
          "React Native Lottie optimization",
          "Next.js Lottie optimization"
        ],
        "description": "Compress Lottie JSON and dotLottie animations instantly in your browser. No server uploads required. Supports After Effects, Figma, Webflow, React Native, and Next.js workflows.",
        "screenshot": "https://tinylottie.com/og-image.png",
        "offers": [
          {
            "@type": "Offer",
            "name": "Free Plan",
            "price": "0",
            "priceCurrency": "USD",
            "description": "Free forever for Lottie files up to 3MB"
          },
          {
            "@type": "Offer",
            "name": "Lifetime PRO",
            "price": "99",
            "priceCurrency": "USD",
            "description": "One-time payment for unlimited file sizes and lifetime access",
            "url": "https://tiny-lottie.lemonsqueezy.com/checkout/buy/c070366c-2fb4-41bf-ad9a-4af0cc94fab8"
          }
        ],
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "47",
          "bestRating": "5",
          "worstRating": "1"
        }
      },
      {
        "@type": "HowTo",
        "name": "How to compress a Lottie JSON file",
        "description": "Step-by-step guide to reducing Lottie animation file sizes using TinyLottie",
        "totalTime": "PT1M",
        "tool": { "@type": "HowToTool", "name": "TinyLottie" },
        "step": [
          {
            "@type": "HowToStep",
            "position": 1,
            "name": "Upload your Lottie file",
            "text": "Drag and drop your .json or .lottie file into TinyLottie at tinylottie.com. No account needed."
          },
          {
            "@type": "HowToStep",
            "position": 2,
            "name": "Click Optimize",
            "text": "TinyLottie automatically strips metadata, rounds float precision, and compresses embedded images to WebP. All processing happens in your browser."
          },
          {
            "@type": "HowToStep",
            "position": 3,
            "name": "Download your optimized file",
            "text": "Download the compressed Lottie JSON or convert to dotLottie format. Typical results: 50–98% file size reduction."
          }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Are my Lottie files uploaded to a server?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No. TinyLottie processes everything locally in your browser using JavaScript and WebAssembly. Your files never leave your device, ensuring 100% privacy."
            }
          },
          {
            "@type": "Question",
            "name": "What is dotLottie format?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "dotLottie is an open-source binary format that packages Lottie JSON and its assets into a single ZIP-compressed .lottie file. It is typically 30–40% smaller than raw Lottie JSON and is supported by LottieFiles, DotLottie players, and most modern animation libraries."
            }
          },
          {
            "@type": "Question",
            "name": "How do I reduce Lottie file size in Webflow?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Export your Lottie JSON from After Effects using Bodymovin, then upload it to TinyLottie at tinylottie.com. TinyLottie removes metadata, rounds coordinate precision, and compresses embedded images. After optimization, upload the smaller file to Webflow to improve Core Web Vitals scores."
            }
          },
          {
            "@type": "Question",
            "name": "How do I optimize Lottie animations for React Native?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Use TinyLottie to compress your Lottie JSON before bundling it in your React Native project. TinyLottie removes runtime-unnecessary properties (layer names, match names) and rounds float precision, reducing JS thread parse time. For best results, also consider the dotLottie output format supported by @lottiefiles/dotlottie-react-native."
            }
          },
          {
            "@type": "Question",
            "name": "How do I compress After Effects JSON exports?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "After exporting from After Effects using the Bodymovin plugin, upload the JSON file to TinyLottie. TinyLottie strips Bodymovin metadata (nm, mn, cl properties), rounds float precision from 6 to 3 decimal places, and converts embedded raster assets to WebP. Most AE exports see 50–85% file size reduction."
            }
          },
          {
            "@type": "Question",
            "name": "Is TinyLottie free?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. TinyLottie is free forever for Lottie and dotLottie files up to 3MB. A one-time Lifetime PRO upgrade ($99) unlocks unlimited file sizes with no subscriptions."
            }
          }
        ]
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
        <ThemeProvider>
          <AuthProvider>
            <Toaster />
            <AuthModal />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
      <GoogleAnalytics gaId="G-4CF9E7S9RK" />
      <Analytics />
    </html>
  );
}
