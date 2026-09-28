import type { Metadata } from "next";
import { LottieCompressorClient } from "@/components/LottieCompressorClient";

export const metadata: Metadata = {
  title: "Free Lottie Compressor — Optimize JSON & dotLottie | TinyLottie",
  description:
    "Compress Lottie JSON and dotLottie animations directly in your browser. Reduce file size, preview results and download optimized files.",
  alternates: {
    canonical: "https://tinylottie.com/lottie-compressor",
  },
  openGraph: {
    title: "Free Lottie Compressor — Optimize JSON & dotLottie | TinyLottie",
    description:
      "Compress Lottie JSON and dotLottie animations directly in your browser. Reduce file size, preview results and download optimized files.",
    url: "https://tinylottie.com/lottie-compressor",
    siteName: "TinyLottie",
    images: [
      {
        url: "https://tinylottie.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "TinyLottie Free Lottie Compressor",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Lottie Compressor — Optimize JSON & dotLottie | TinyLottie",
    description:
      "Compress Lottie JSON and dotLottie animations directly in your browser. Reduce file size, preview results and download optimized files.",
    images: ["https://tinylottie.com/og-image.png"],
  },
};

export default function LottieCompressorPage() {
  return <LottieCompressorClient />;
}
