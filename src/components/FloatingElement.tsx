import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface FloatingElementProps {
  icon?: LucideIcon;
  text?: string;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function FloatingElement({
  icon: Icon,
  text,
  delay = 0,
  duration = 3,
  x = 0,
  y = 0,
  size = 'md',
}: FloatingElementProps) {
  const sizeClasses = {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: [0, 1, 1, 1],
        y: [20, 0, -10, 0],
      }}
      transition={{
        duration: duration,
        delay: delay,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut',
      }}
      className="absolute"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      {Icon ? (
        <div
          className={`${sizeClasses[size]} bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 backdrop-blur-sm`}
        >
          <Icon className={`${iconSizes[size]} text-[#00DDB3]`} />
        </div>
      ) : text ? (
        <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
            {text}
          </span>
        </div>
      ) : null}
    </motion.div>
  );
}
