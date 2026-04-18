import { motion } from 'motion/react';
import {
  FileJson,
  Scissors,
  Image,
  Layers,
  Eye,
  Sparkles,
  TrendingDown,
  Zap,
  Shield
} from 'lucide-react';

export function BlogSection() {
  const tips = [
    {
      icon: TrendingDown,
      title: 'Precision Reduction',
      description: 'Round coordinate values to fewer decimal places. Most animations work perfectly with 1-2 decimals instead of 5-6, reducing file size by 20-40%.'
    },
    {
      icon: Scissors,
      title: 'Remove Unnecessary Data',
      description: 'Strip out metadata, layer names, comments, and expression metadata that aren\'t needed for playback. This can save 10-30% file size.'
    },
    {
      icon: Sparkles,
      title: 'Path Simplification',
      description: 'Simplify complex paths and reduce keyframes. Remove redundant points in bezier curves without affecting visual quality.'
    },
    {
      icon: Image,
      title: 'Compress Embedded Images',
      description: 'If your Lottie contains embedded images, compress them or convert to WebP format. This is often the biggest opportunity for size reduction.'
    },
    {
      icon: FileJson,
      title: 'Use .lottie Format',
      description: 'The .lottie format uses gzip compression and can be 50-80% smaller than .json files while maintaining perfect quality.'
    },
    {
      icon: Eye,
      title: 'Remove Hidden Layers',
      description: 'Delete layers that are never visible or have 0% opacity throughout the animation. These add unnecessary bloat.'
    },
    {
      icon: Layers,
      title: 'Merge Similar Layers',
      description: 'Combine layers with identical properties and timing. This reduces the overall structure complexity of your animation.'
    },
    {
      icon: Zap,
      title: 'Best Practices for Designers',
      description: 'Design with optimization in mind: use fewer layers, avoid overly complex shapes, and reuse assets where possible. Simple is better.'
    }
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-12 lg:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 px-4">
            <span className="text-gray-900 dark:text-white">How to </span>
            <span className="bg-gradient-to-r from-[#00DDB3] to-[#00C9A7] bg-clip-text text-transparent">
              reduce Lottie file size
            </span>
            <span className="text-gray-900 dark:text-white">?</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto px-4">
            Master these optimization techniques to create lightning-fast animations without sacrificing quality.
            TinyLottie handles most of these automatically!
          </p>
        </motion.div>

        {/* Tips Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {tips.map((tip, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="h-full p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-[#00DDB3] dark:hover:border-[#00DDB3] transition-all hover:shadow-lg hover:shadow-[#00DDB3]/10">
                {/* Icon */}
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#00DDB3] to-[#00C9A7] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <tip.icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {tip.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
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
          className="mt-8 sm:mt-10 lg:mt-12 text-center p-6 sm:p-8 bg-gradient-to-br from-[#00DDB3]/10 to-[#00C9A7]/10 rounded-2xl border border-[#00DDB3]/20"
        >
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
            Let TinyLottie do the heavy lifting
          </h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 max-w-2xl mx-auto px-4">
            Our intelligent optimization engine automatically applies these techniques and more,
            giving you the smallest possible file size while preserving perfect visual quality.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#00DDB3]" />
              <span>100% client-side processing</span>
            </div>
            <span className="hidden sm:inline text-gray-400">•</span>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#00DDB3]" />
              <span>No server uploads</span>
            </div>
            <span className="hidden sm:inline text-gray-400">•</span>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#00DDB3]" />
              <span>Privacy guaranteed</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
