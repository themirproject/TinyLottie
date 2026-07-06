import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const guides = [
  {
    slug: "webflow",
    question: "How to reduce Lottie file size in Webflow",
    answer: `Webflow automatically renders Lottie animations via its built-in Lottie player, but large JSON files can seriously impact your page load time and Core Web Vitals scores. Here's how to reduce Lottie size specifically for Webflow projects:

**Step 1 — Compress with TinyLottie before uploading.** Export your animation from After Effects using the Bodymovin plugin, then drag and drop the .json file into TinyLottie. TinyLottie strips layer names, metadata, and hidden elements — reducing file sizes by 50–98% without any visual difference.

**Step 2 — Convert to dotLottie format.** TinyLottie can output .lottie files (dotLottie), a zipped binary format that's typically 30–40% smaller than raw JSON. Webflow's Lottie player supports standard JSON, so keep the .json version for Webflow uploads; use the .lottie output for custom-code embeds.

**Step 3 — Lazy-load your animation.** In Webflow, wrap your Lottie element in a div with the "Start Animation" trigger set to "Scroll into view" instead of "Page load." This defers the Lottie parser until the element is actually visible, reducing initial page weight.

**Step 4 — Audit embedded images.** If your Lottie animation references embedded PNG or JPEG assets (common in character animations), TinyLottie converts them to WebP during optimization — cutting image asset size by an additional 30–60%.`,
  },
  {
    slug: "react-native",
    question: "Optimizing Lottie animations for React Native",
    answer: `React Native renders Lottie animations using the lottie-react-native library, which parses JSON on the JS thread. Large or complex animations can cause frame drops, janky transitions, and excessive memory usage on lower-end Android devices. Follow these steps to optimize:

**Why file size matters more on mobile.** Unlike browsers, React Native cannot cache and reuse parsed Lottie data across component remounts by default. Every screen navigation that mounts a Lottie component re-parses the full JSON. A 2MB animation file can add 150–300ms of CPU blocking time on mid-range devices.

**Step 1 — Run through TinyLottie first.** Upload your .json to TinyLottie and enable maximum compression. The optimizer removes nm (name) and mn (match name) properties — these are only needed by design tools, not at runtime. It also rounds float precision from 6 decimal places to 3, which has zero visual impact but cuts numeric payload significantly.

**Step 2 — Remove unused layers programmatically.** If you're showing only a portion of an animation (e.g., a progress state), delete unused layers before shipping. TinyLottie handles this automatically by stripping layers marked as hidden (hd: true).

**Step 3 — Cache parsed animations.** Use lottie-react-native's ref API with animationFinished callbacks and memoize animation sources with useMemo() or React.memo() to prevent redundant re-parsing.

**Step 4 — Prefer dotLottie on React Native.** The @lottiefiles/dotlottie-react-native package supports the binary .lottie format, which is parsed faster than JSON and transfers quicker over the network. TinyLottie outputs dotLottie files directly.`,
  },
  {
    slug: "after-effects",
    question: "How to compress After Effects JSON exports (Bodymovin / LottieFiles)",
    answer: `When you export a Lottie animation from After Effects using the Bodymovin extension or the LottieFiles AE plugin, the resulting JSON file contains a significant amount of data that is only useful during design — not at runtime. Here's how to compress After Effects exports effectively:

**Why AE exports are large by default.** The Bodymovin exporter includes layer names, composition names, match names, expression metadata, and guide layers in the output. On complex compositions with many layers, this metadata alone can account for 20–40% of total file size.

**Step 1 — Enable "Bodymovin glyphs only" and disable unnecessary options.** In the Bodymovin export dialog, uncheck "Original Asset Names" and "Slot IDs" if you don't use the LottieFiles theming API. Also enable "Glyph compression" for text-heavy animations.

**Step 2 — Run the export through TinyLottie.** TinyLottie's JSON optimizer strips all non-runtime properties: nm (layer name), mn (match name), cl (class), and hidden layer flags. For a typical AE character rig with 50–80 layers, this alone saves 15–35%.

**Step 3 — Reduce float precision.** AE's math engine stores keyframe values with 6–8 decimal places (e.g., 359.9999847). TinyLottie rounds all numeric values to 3 decimal places, which the Lottie runtime renders identically but at a fraction of the string length.

**Step 4 — Check for pre-comp redundancy.** Pre-compositions that are only used once add nesting overhead. Collapse single-use pre-comps before export when possible. TinyLottie will further clean the resulting JSON, but flatter composition structures always compress better.

**Step 5 — Convert embedded assets to WebP.** If your AE composition uses embedded raster layers (PNG logos, photo backgrounds), TinyLottie converts base64-encoded PNG/JPEG assets to WebP during optimization, often saving 40–70% on asset weight.`,
  },
  {
    slug: "figma",
    question: "How to optimize Lottie files exported from Figma",
    answer: `Figma's native animation export (via plugins like LottieFiles for Figma or Jitter) produces Lottie JSON that can be significantly larger than necessary due to how Figma represents vector paths. Here's how to optimize Figma-exported Lottie files:

**The Figma vector problem.** Figma stores shapes as bezier curves with many redundant anchor points. When exported to Lottie format, these translate into dense path data arrays. A simple icon animation exported from Figma can be 3–5x larger than the same animation created directly in After Effects.

**Step 1 — Simplify paths before export.** In Figma, use the "Flatten Selection" command (Cmd/Ctrl + E) on complex vector shapes before running the Lottie export plugin. This merges overlapping paths and removes invisible anchor points.

**Step 2 — Compress with TinyLottie after export.** Drag the exported .json into TinyLottie. The optimizer rounds bezier curve coordinates to 3 decimal places and strips metadata. For Figma exports specifically, users typically see 45–75% file size reductions.

**Step 3 — Remove hidden layers.** Figma plugins sometimes export hidden or masked layers that contribute to file size. TinyLottie automatically removes layers where hd (hidden) is true.

**Step 4 — Use dotLottie for web delivery.** TinyLottie can output the dotLottie (.lottie) format, which applies ZIP compression on top of JSON minification. For Figma exports with many path nodes, this can achieve 80%+ total reduction from the original export.`,
  },
  {
    slug: "nextjs",
    question: "Optimizing Lottie animations in Next.js (App Router & Pages Router)",
    answer: `Next.js applications have unique Lottie optimization challenges: server-side rendering compatibility, dynamic imports, and Core Web Vitals impact. Here's the definitive guide to Lottie optimization for Next.js:

**The SSR problem.** Lottie libraries use browser APIs (canvas, requestAnimationFrame) and cannot run on the server. Using lottie-react or @lottiefiles/react-lottie-player without dynamic imports will cause hydration errors in Next.js.

**Step 1 — Always use dynamic import with ssr: false.** In both App Router and Pages Router, import Lottie components dynamically:
\`\`\`
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });
\`\`\`

**Step 2 — Compress your JSON with TinyLottie first.** Before importing animation data into your Next.js project, run it through TinyLottie. Reducing a 500KB animation to 80KB means 420KB less JavaScript parsed on every page load — directly improving your LCP and INP scores.

**Step 3 — Store animations in /public and fetch lazily.** Instead of importing JSON directly (which bundles it into your JS), fetch from /public/animations/hero.json on the client. This splits animation data from your main bundle and allows browser caching.

**Step 4 — Use Intersection Observer for trigger.** Don't autoplay Lottie animations on mount. Start playback only when the element enters the viewport. This improves perceived performance and saves CPU cycles on initial page load.`,
  },
];

export function SEOGuides() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00DDB3]/10 border border-[#00DDB3]/20 text-[#00DDB3] text-xs font-semibold mb-4 tracking-wider uppercase">
            Platform Guides
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Lottie Optimization{" "}
            <span className="bg-gradient-to-r from-[#00DDB3] to-[#00C9A7] bg-clip-text text-transparent">
              for Every Platform
            </span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
            Step-by-step guides for reducing Lottie and dotLottie file sizes across Webflow, React Native, Next.js, After Effects, and Figma.
          </p>
        </div>

        <div className="space-y-3">
          {guides.map((guide, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={guide.slug}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  aria-expanded={isOpen}
                >
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white leading-snug">
                    {guide.question}
                  </h3>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="px-6 pb-6"
                  >
                    <div className="pt-1 border-t border-gray-100 dark:border-gray-800">
                      <div className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {guide.answer.split("\n\n").map((paragraph, pIdx) => {
                          // Bold **text** handling
                          const parts = paragraph.split(/(\*\*[^*]+\*\*)/g);
                          const rendered = parts.map((part, i) =>
                            part.startsWith("**") && part.endsWith("**") ? (
                              <strong key={i} className="text-gray-900 dark:text-white font-semibold">
                                {part.slice(2, -2)}
                              </strong>
                            ) : (
                              <span key={i}>{part}</span>
                            )
                          );
                          // Code block handling
                          if (paragraph.includes("```")) {
                            const code = paragraph.replace(/```[\s\S]*?```/g, (match) => {
                              return match.replace(/```[a-z]*/g, "").replace(/```/g, "").trim();
                            });
                            return (
                              <pre key={pIdx} className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3 text-xs overflow-x-auto font-mono text-gray-800 dark:text-gray-200">
                                {code.replace(/```[\s\S]*?```/g, "").replace(/```/g, "").trim()}
                              </pre>
                            );
                          }
                          return (
                            <p key={pIdx}>{rendered}</p>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
