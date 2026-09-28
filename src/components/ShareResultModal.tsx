"use client";

import { useRef, useState, useEffect } from "react";
import { X, Download, Copy, Check, Share2, Sparkles, Shield, ArrowRight, FileJson } from "lucide-react";
import { toast } from "sonner";
import { trackOptimizationResultShared } from "@/lib/analytics";

interface ShareResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalSizeBytes: number;
  optimizedSizeBytes: number;
  formatFileSize: (bytes: number) => string;
  sourceRoute?: string;
}

export function ShareResultModal({
  isOpen,
  onClose,
  originalSizeBytes,
  optimizedSizeBytes,
  formatFileSize,
  sourceRoute = "/",
}: ShareResultModalProps) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const reductionPct = Math.max(
    0,
    Math.round(((originalSizeBytes - optimizedSizeBytes) / originalSizeBytes) * 100)
  );
  const savedBytes = Math.max(0, originalSizeBytes - optimizedSizeBytes);

  const originalSizeFormatted = formatFileSize(originalSizeBytes);
  const optimizedSizeFormatted = formatFileSize(optimizedSizeBytes);
  const savedSizeFormatted = formatFileSize(savedBytes);

  const defaultCaption = `I optimized a Lottie animation with TinyLottie.\n\nOriginal: ${originalSizeFormatted}\nOptimized: ${optimizedSizeFormatted}\nReduction: ${reductionPct}%\n\nBrowser-based optimization · No file uploads\nTry it: https://tinylottie.com/`;
  const [captionText, setCaptionText] = useState(defaultCaption);

  useEffect(() => {
    setCaptionText(defaultCaption);
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      setCanNativeShare(true);
    }
  }, [defaultCaption]);

  // Helper to dynamically scale font size so text never overflows card bounds
  const getScaledFontSize = (
    ctx: CanvasRenderingContext2D,
    text: string,
    maxFontSize: number,
    maxWidth: number
  ): number => {
    let size = maxFontSize;
    ctx.font = `bold ${size}px system-ui, -apple-system, sans-serif`;
    while (ctx.measureText(text).width > maxWidth && size > 18) {
      size -= 2;
      ctx.font = `bold ${size}px system-ui, -apple-system, sans-serif`;
    }
    return size;
  };

  // Draw 1200 x 630 px branded card onto canvas
  const drawCardToCanvas = (): HTMLCanvasElement | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    canvas.width = 1200;
    canvas.height = 630;

    // 1. Dark Gradient Background
    const bgGradient = ctx.createLinearGradient(0, 0, 1200, 630);
    bgGradient.addColorStop(0, "#080C14");
    bgGradient.addColorStop(0.5, "#0D1524");
    bgGradient.addColorStop(1, "#090E18");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 1200, 630);

    // 2. Subtle Teal Ambient Glow in Top Right & Bottom Left
    const glow1 = ctx.createRadialGradient(1000, 100, 10, 1000, 100, 450);
    glow1.addColorStop(0, "rgba(0, 221, 179, 0.18)");
    glow1.addColorStop(1, "rgba(0, 221, 179, 0)");
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, 1200, 630);

    const glow2 = ctx.createRadialGradient(200, 550, 10, 200, 550, 350);
    glow2.addColorStop(0, "rgba(0, 201, 167, 0.12)");
    glow2.addColorStop(1, "rgba(0, 201, 167, 0)");
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, 1200, 630);

    // 3. Card Outer Border
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, 1120, 550);

    // Inner Corner Accent Lines
    ctx.strokeStyle = "rgba(0, 221, 179, 0.4)";
    ctx.lineWidth = 3;
    // Top-left corner
    ctx.beginPath();
    ctx.moveTo(40, 80);
    ctx.lineTo(40, 40);
    ctx.lineTo(80, 40);
    ctx.stroke();

    // Top-right corner
    ctx.beginPath();
    ctx.moveTo(1120, 40);
    ctx.lineTo(1160, 40);
    ctx.lineTo(1160, 80);
    ctx.stroke();

    // 4. Header: Logo & Branding
    // Logo Icon Box (Teal rounded square)
    ctx.fillStyle = "#00DDB3";
    ctx.beginPath();
    ctx.roundRect(80, 80, 48, 48, 12);
    ctx.fill();

    // Document glyph inside icon (TinyLottie document branding)
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.moveTo(94, 91);
    ctx.lineTo(108, 91);
    ctx.lineTo(115, 98);
    ctx.lineTo(115, 117);
    ctx.lineTo(94, 117);
    ctx.closePath();
    ctx.fill();

    // Folded corner
    ctx.fillStyle = "#D1FAF0";
    ctx.beginPath();
    ctx.moveTo(108, 91);
    ctx.lineTo(108, 98);
    ctx.lineTo(115, 98);
    ctx.closePath();
    ctx.fill();

    // Document lines inside
    ctx.strokeStyle = "#00B894";
    ctx.lineWidth = 1.75;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(98, 104);
    ctx.lineTo(111, 104);
    ctx.moveTo(98, 109);
    ctx.lineTo(107, 109);
    ctx.stroke();

    // Brand Text
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 32px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText("TinyLottie", 144, 114);

    // Pill badge: "Browser-based optimization"
    ctx.fillStyle = "rgba(0, 221, 179, 0.12)";
    ctx.beginPath();
    ctx.roundRect(880, 80, 280, 42, 21);
    ctx.fill();
    ctx.strokeStyle = "rgba(0, 221, 179, 0.3)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#00DDB3";
    ctx.font = "600 16px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Browser-based optimization", 1020, 107);
    ctx.textAlign = "left";

    // 5. Headline
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 56px system-ui, -apple-system, sans-serif";
    ctx.fillText("Smaller file. Same workflow.", 80, 225);

    ctx.fillStyle = "#94A3B8";
    ctx.font = "400 22px system-ui, -apple-system, sans-serif";
    ctx.fillText("Measured Lottie animation compression result", 80, 265);

    // 6. Center Stat Blocks (Original vs Optimized)
    // Box 1: Original
    ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
    ctx.beginPath();
    ctx.roundRect(80, 310, 300, 160, 20);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#64748B";
    ctx.font = "bold 15px system-ui, -apple-system, sans-serif";
    ctx.fillText("ORIGINAL FILE", 110, 350);

    const origFontSize = getScaledFontSize(ctx, originalSizeFormatted, 44, 240);
    ctx.fillStyle = "#E2E8F0";
    ctx.font = `bold ${origFontSize}px system-ui, -apple-system, sans-serif`;
    ctx.fillText(originalSizeFormatted, 110, 410);

    ctx.fillStyle = "#64748B";
    ctx.font = "400 15px system-ui, -apple-system, sans-serif";
    ctx.fillText("Full export payload", 110, 442);

    // Arrow in the middle
    ctx.fillStyle = "rgba(0, 221, 179, 0.2)";
    ctx.beginPath();
    ctx.arc(420, 390, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#00DDB3";
    ctx.font = "bold 24px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("→", 420, 398);
    ctx.textAlign = "left";

    // Box 2: Optimized
    ctx.fillStyle = "rgba(0, 221, 179, 0.05)";
    ctx.beginPath();
    ctx.roundRect(480, 310, 340, 160, 20);
    ctx.fill();
    ctx.strokeStyle = "rgba(0, 221, 179, 0.4)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#00DDB3";
    ctx.font = "bold 15px system-ui, -apple-system, sans-serif";
    ctx.fillText("OPTIMIZED FILE", 510, 350);

    const optFontSize = getScaledFontSize(ctx, optimizedSizeFormatted, 44, 280);
    ctx.fillStyle = "#00DDB3";
    ctx.font = `bold ${optFontSize}px system-ui, -apple-system, sans-serif`;
    ctx.fillText(optimizedSizeFormatted, 510, 410);

    ctx.fillStyle = "#94A3B8";
    ctx.font = "400 15px system-ui, -apple-system, sans-serif";
    ctx.fillText(`Saved ${savedSizeFormatted}`, 510, 442);

    // Box 3: Savings Pill Highlight
    ctx.fillStyle = "rgba(0, 221, 179, 0.1)";
    ctx.beginPath();
    ctx.roundRect(850, 310, 270, 160, 20);
    ctx.fill();
    ctx.strokeStyle = "rgba(0, 221, 179, 0.25)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#64748B";
    ctx.font = "bold 15px system-ui, -apple-system, sans-serif";
    ctx.fillText("TOTAL REDUCTION", 880, 350);

    const redFontSize = getScaledFontSize(ctx, `-${reductionPct}%`, 52, 210);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `extrabold ${redFontSize}px system-ui, -apple-system, sans-serif`;
    ctx.fillText(`-${reductionPct}%`, 880, 415);

    ctx.fillStyle = "#00DDB3";
    ctx.font = "600 15px system-ui, -apple-system, sans-serif";
    ctx.fillText("No file uploads", 880, 442);

    // 7. Footer
    ctx.fillStyle = "#64748B";
    ctx.font = "500 18px system-ui, -apple-system, sans-serif";
    ctx.fillText("tinylottie.com", 80, 545);

    ctx.fillStyle = "#475569";
    ctx.font = "400 16px system-ui, -apple-system, sans-serif";
    ctx.fillText("· Browser-based optimization · No file uploads", 205, 545);

    return canvas;
  };

  const handleDownloadPng = () => {
    const canvas = drawCardToCanvas();
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `tinylottie-savings-${reductionPct}pct.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    trackOptimizationResultShared({
      action: "download_png",
      reductionPct,
      originalSizeKb: originalSizeBytes / 1024,
      optimizedSizeKb: optimizedSizeBytes / 1024,
      sourceRoute,
    });

    toast.success("1200×630 image card downloaded!");
  };

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(captionText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);

      trackOptimizationResultShared({
        action: "copy_caption",
        reductionPct,
        originalSizeKb: originalSizeBytes / 1024,
        optimizedSizeKb: optimizedSizeBytes / 1024,
        sourceRoute,
      });

      toast.success("Suggested caption copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy caption.");
    }
  };

  const handleNativeShare = async () => {
    if (!canNativeShare) return;

    try {
      const canvas = drawCardToCanvas();
      let sharedWithFile = false;

      if (canvas && navigator.canShare) {
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/png")
        );
        if (blob) {
          const file = new File([blob], `tinylottie-${reductionPct}pct.png`, {
            type: "image/png",
          });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: "TinyLottie Optimization",
              text: captionText,
              files: [file],
            });
            sharedWithFile = true;
          }
        }
      }

      if (!sharedWithFile) {
        await navigator.share({
          title: "TinyLottie Optimization",
          text: captionText,
          url: "https://tinylottie.com/",
        });
      }

      trackOptimizationResultShared({
        action: "native_share_completed",
        reductionPct,
        originalSizeKb: originalSizeBytes / 1024,
        optimizedSizeKb: optimizedSizeBytes / 1024,
        sourceRoute,
      });
      toast.success("Share sheet completed!");
    } catch (err: any) {
      if (err.name === "AbortError") {
        trackOptimizationResultShared({
          action: "native_share_cancelled",
          reductionPct,
          originalSizeKb: originalSizeBytes / 1024,
          optimizedSizeKb: optimizedSizeBytes / 1024,
          sourceRoute,
        });
      } else {
        console.warn("Share failed:", err);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#00DDB3]/10 text-[#00DDB3] rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg">
                Share Optimization Result
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Export a high-resolution social card (1200×630 px) or copy a suggested post.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden offscreen canvas for 1200x630 rendering */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Responsive In-Modal Preview Card (1200x630 Aspect Ratio) */}
        <div className="relative w-full aspect-[1200/630] rounded-2xl overflow-hidden bg-gradient-to-br from-[#080C14] via-[#0D1524] to-[#090E18] border border-gray-800 p-4 sm:p-6 flex flex-col justify-between shadow-inner select-none">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#00DDB3]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Card Top */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-[#00DDB3] flex items-center justify-center text-white">
                <FileJson className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
                TinyLottie
              </span>
            </div>
            <span className="text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#00DDB3]/10 text-[#00DDB3] border border-[#00DDB3]/30">
              Browser-based
            </span>
          </div>

          {/* Card Center */}
          <div className="relative z-10 my-auto text-center space-y-2 sm:space-y-3">
            <h4 className="text-base sm:text-2xl font-extrabold text-white tracking-tight">
              Smaller file. Same workflow.
            </h4>

            <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
              <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white/5 border border-white/10 text-left">
                <span className="text-[9px] sm:text-[10px] uppercase font-bold text-gray-400 block">
                  Original
                </span>
                <span className="text-xs sm:text-base font-bold text-gray-200">
                  {originalSizeFormatted}
                </span>
              </div>

              <span className="text-xs sm:text-sm text-[#00DDB3] font-bold">→</span>

              <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#00DDB3]/10 border border-[#00DDB3]/30 text-left">
                <span className="text-[9px] sm:text-[10px] uppercase font-bold text-[#00DDB3] block">
                  Optimized
                </span>
                <span className="text-xs sm:text-base font-bold text-[#00DDB3]">
                  {optimizedSizeFormatted}
                </span>
              </div>

              <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#00DDB3] text-gray-950 font-black text-xs sm:text-base shadow-sm">
                -{reductionPct}%
              </div>
            </div>
          </div>

          {/* Card Bottom */}
          <div className="relative z-10 flex items-center justify-between text-[9px] sm:text-xs text-gray-400">
            <span>tinylottie.com</span>
            <span className="text-gray-500">Browser-based optimization · No file uploads</span>
          </div>
        </div>

        {/* Suggested Caption Textarea */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Suggested Caption (Editable):
            </label>
            <span className="text-[10px] text-gray-400">Ready for LinkedIn & Twitter</span>
          </div>
          <textarea
            rows={4}
            value={captionText}
            onChange={(e) => setCaptionText(e.target.value)}
            className="w-full p-3 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/80 text-gray-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#00DDB3]/40"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
            <Shield className="w-3.5 h-3.5 text-[#00DDB3]" />
            <span>Zero file contents or PII are shared.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {canNativeShare && (
              <button
                onClick={handleNativeShare}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share
              </button>
            )}

            <button
              onClick={handleCopyCaption}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#00DDB3]" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy Caption"}
            </button>

            <button
              onClick={handleDownloadPng}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#00DDB3] hover:bg-[#00C9A7] text-white shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download PNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
