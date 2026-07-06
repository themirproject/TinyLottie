import { motion } from "motion/react";
import { FileJson, Scissors, Image, Eye, Zap, Shield } from "lucide-react";

const tips = [
  {
    icon: Scissors,
    title: "Strip Metadata",
    description:
      "Remove layer names, match names, and expression metadata — only needed by design tools, not at runtime. Saves 10–30%.",
  },
  {
    icon: FileJson,
    title: "Round Coordinates",
    description:
      "Trim float precision from 6 to 3 decimal places. Invisible to the eye, but dramatically reduces numeric payload.",
  },
  {
    icon: Image,
    title: "WebP Asset Conversion",
    description:
      "Embedded PNG/JPEG images inside Lottie JSON convert to WebP automatically — often the biggest single win at 40–70% savings.",
  },
  {
    icon: Eye,
    title: "Remove Hidden Layers",
    description:
      "Layers with hd: true or 0% opacity throughout still add file weight. TinyLottie strips them automatically.",
  },
  {
    icon: FileJson,
    title: "Switch to dotLottie",
    description:
      "The .lottie binary format applies ZIP compression on top of JSON, cutting an additional 30–40% vs raw JSON.",
  },
];

export function BlogSection() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-12 px-4"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
            <span className="text-gray-900 dark:text-white">How to </span>
            <span className="bg-gradient-to-r from-[#00DDB3] to-[#00C9A7] bg-clip-text text-transparent">
              reduce Lottie file size
            </span>
            <span className="text-gray-900 dark:text-white">?</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Five techniques that matter most — TinyLottie applies all of them automatically.
          </p>
        </motion.div>

        {/* Horizontal list — compact, scannable */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 sm:gap-6 mt-8">
          {tips.map((tip, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.07 }}
              className="group bg-gray-50 dark:bg-gray-900/60 p-5 rounded-2xl border border-gray-200 dark:border-gray-800/80 flex flex-col gap-3 hover:border-[#00DDB3] hover:shadow-lg hover:shadow-[#00DDB3]/5 transition-all"
            >
              <div className="w-9 h-9 rounded-lg bg-[#00DDB3]/10 flex items-center justify-center group-hover:bg-[#00DDB3]/20 transition-colors">
                <tip.icon className="w-5 h-5 text-[#00DDB3]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  {tip.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {tip.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-6 text-center p-6 sm:p-8 bg-gradient-to-br from-[#00DDB3]/10 to-[#00C9A7]/10 rounded-2xl border border-[#00DDB3]/20"
        >
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
            TinyLottie applies all of this automatically
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Just drag and drop — no configuration needed.
          </p>
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#00DDB3]" /> 100% client-side
            </span>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#00DDB3]" /> No uploads
            </span>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <span className="flex items-center gap-1.5">
              <FileJson className="w-3.5 h-3.5 text-[#00DDB3]" /> Free forever
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
