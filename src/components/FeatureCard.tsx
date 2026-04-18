import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
}

export function FeatureCard({ icon: Icon, title, description, index }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700 hover:border-[#00DDB3] dark:hover:border-[#00DDB3] transition-all duration-300 hover:shadow-lg"
    >
      <div className="relative">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#00DDB3] rounded-xl flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
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