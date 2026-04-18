import { motion } from 'motion/react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';

interface OptimizationErrorProps {
  onRetry: () => void;
}

export function OptimizationError({ onRetry }: OptimizationErrorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full h-full flex items-center justify-center p-8"
    >
      <div className="text-center max-w-sm">
        {/* Error Icon with Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
          }}
          className="inline-flex items-center justify-center mb-6"
        >
          <div className="relative">
            {/* Pulsing background */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.1, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 bg-red-500/20 rounded-full blur-xl"
            />
            
            {/* Icon container */}
            <div className="relative p-4 bg-red-50 dark:bg-red-950/30 rounded-full">
              <AlertCircle className="w-12 h-12 text-red-500" strokeWidth={2} />
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Optimization Failed
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Something went wrong while optimizing your file. 
            This might be due to an invalid file format or network issue.
          </p>
        </motion.div>

        {/* Retry Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={onRetry}
            className="bg-[#00DDB3] hover:bg-[#00C9A7] text-white"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </motion.div>

        {/* Help Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xs text-gray-500 dark:text-gray-500 mt-4"
        >
          Make sure your file is a valid Lottie JSON or dotLottie format
        </motion.p>
      </div>
    </motion.div>
  );
}
