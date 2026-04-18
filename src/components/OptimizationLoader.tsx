import { motion } from 'motion/react';
import { Zap, Layers, FileJson } from 'lucide-react';

export function OptimizationLoader() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Central Glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-32 h-32 bg-[#00DDB3]/20 dark:bg-[#00DDB3]/10 rounded-full blur-2xl"
        />
      </div>

      {/* Floating Icons */}
      <motion.div
        animate={{
          y: [0, -15, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/4 left-1/4"
      >
        <div className="p-3 bg-[#00DDB3]/10 dark:bg-[#00DDB3]/20 rounded-xl backdrop-blur-sm border border-[#00DDB3]/20">
          <FileJson className="w-6 h-6 text-[#00DDB3]" />
        </div>
      </motion.div>

      <motion.div
        animate={{
          y: [0, 15, 0],
          rotate: [0, -5, 0],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
        className="absolute top-1/4 right-1/4"
      >
        <div className="p-3 bg-[#00DDB3]/10 dark:bg-[#00DDB3]/20 rounded-xl backdrop-blur-sm border border-[#00DDB3]/20">
          <Layers className="w-6 h-6 text-[#00DDB3]" />
        </div>
      </motion.div>

      <motion.div
        animate={{
          y: [0, -12, 0],
          rotate: [0, 8, 0],
        }}
        transition={{
          duration: 2.8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute bottom-1/4 left-1/3"
      >
        <div className="p-3 bg-[#00DDB3]/10 dark:bg-[#00DDB3]/20 rounded-xl backdrop-blur-sm border border-[#00DDB3]/20">
          <Zap className="w-6 h-6 text-[#00DDB3]" />
        </div>
      </motion.div>

      {/* Central Spinner */}
      <div className="relative z-10">
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
          className="w-16 h-16 border-4 border-[#00DDB3]/20 border-t-[#00DDB3] rounded-full"
        />
        
        {/* Inner pulse */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-8 h-8 bg-[#00DDB3]/30 rounded-full" />
        </motion.div>
      </div>

      {/* Status Text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-8 text-center"
      >
        <p className="text-sm font-medium text-[#00DDB3]">
          Optimizing...
        </p>
        <motion.p
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="text-xs text-gray-500 dark:text-gray-400 mt-1"
        >
          Compressing your animation
        </motion.p>
      </motion.div>
    </div>
  );
}
