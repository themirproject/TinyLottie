import { motion } from 'motion/react';
import { FileJson, Zap, Download, TrendingDown } from 'lucide-react';
import { FloatingElement } from './FloatingElement';

export function HeroVisual() {
  return (
    <div className="relative w-full h-[280px] flex items-center justify-center">
      {/* Background Glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[400px] h-[400px] bg-[#00DDB3]/10 dark:bg-[#00DDB3]/5 rounded-full blur-3xl" />
      </div>

      {/* Floating Elements */}
      <FloatingElement icon={FileJson} x={15} y={20} delay={0} duration={3} size="md" />
      <FloatingElement icon={Zap} x={85} y={25} delay={0.5} duration={3.5} size="sm" />
      <FloatingElement icon={Download} x={10} y={65} delay={1} duration={4} size="sm" />
      <FloatingElement text="98% Smaller" x={80} y={70} delay={0.3} duration={3.2} />
      <FloatingElement text="Zero Upload" x={20} y={45} delay={0.8} duration={3.8} />
      <FloatingElement icon={TrendingDown} x={75} y={45} delay={1.2} duration={3.3} size="md" />

      {/* Central Visual - File Compression Animation */}
      <div className="relative z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative"
        >
          {/* Left File (Original) */}
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
            className="absolute -left-24 top-1/2 -translate-y-1/2"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-3 w-20 h-20 flex flex-col items-center justify-center backdrop-blur-sm">
              <FileJson className="w-8 h-8 text-gray-400 dark:text-gray-600 mb-1" />
              <span className="text-xs font-bold text-gray-900 dark:text-white">450KB</span>
            </div>
          </motion.div>

          {/* Center Arrow/Bar */}
          <div className="relative w-28 h-2">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-300 via-[#00DDB3] to-[#00DDB3] dark:from-gray-700 dark:via-[#00DDB3] dark:to-[#00DDB3] rounded-full" />
            <motion.div
              animate={{
                x: [0, 105, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute top-1/2 -translate-y-1/2 left-0"
            >
              <div className="w-5 h-5 bg-[#00DDB3] rounded-full shadow-lg flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </div>
            </motion.div>
          </div>

          {/* Right File (Optimized) */}
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
              delay: 0.5,
            }}
            className="absolute -right-24 top-1/2 -translate-y-1/2"
          >
            <div className="bg-gradient-to-br from-[#00DDB3] to-[#00C9A7] rounded-xl shadow-xl p-3 w-20 h-20 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
              <FileJson className="w-8 h-8 text-white mb-1 relative z-10" />
              <span className="text-xs font-bold text-white relative z-10">9KB</span>
            </div>
          </motion.div>

          {/* Success Checkmark */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 1.5,
              duration: 0.5,
              repeat: Infinity,
              repeatDelay: 2,
            }}
            className="absolute -top-6 left-1/2 -translate-x-1/2"
          >
            <div className="bg-[#00DDB3] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg mx-[0px] mt-[-12px] mb-[0px]">
              -98%
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}