import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { FeatureMotionIcon } from './motion/FeatureMotionIcon';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
  variant?: "ast" | "dotlottie" | "privacy" | "webp" | "download" | "vitals";
}

export function FeatureCard({ icon: Icon, title, description, index, variant }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700 hover:border-[#00DDB3] dark:hover:border-[#00DDB3] transition-all duration-300 hover:shadow-lg hover:shadow-[#00DDB3]/5"
    >
      <div className="relative">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#00DDB3] to-[#00C9A7] rounded-xl flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-105 group-hover:shadow-md group-hover:shadow-[#00DDB3]/20 transition-all duration-300">
          <FeatureMotionIcon icon={Icon} variant={variant} />
        </div>

        <h3 className="text-lg sm:text-xl mb-2 sm:mb-3 text-gray-900 dark:text-white font-semibold">
          {title}
        </h3>

        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
}