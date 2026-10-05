import { Upload, FileJson, ArrowRight, Zap, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface LottieDropZoneProps {
  onFileSelect: (file: File) => void;
}

export function LottieDropZone({ onFileSelect }: LottieDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.json') || file.name.endsWith('.lottie')) {
        onFileSelect(file);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-3xl p-8 sm:p-12 lg:p-16 transition-all duration-300 overflow-hidden
        ${isDragging
          ? 'border-[#00DDB3] bg-[#00DDB3]/10 scale-[1.01]'
          : 'border-gray-300 dark:border-gray-700 bg-gray-50/90 dark:bg-gray-900/90 hover:border-[#00DDB3] hover:bg-gray-100/80 dark:hover:bg-gray-800/80'
        }
      `}
    >
      {/* Background low-opacity animated glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : {
                  scale: isDragging ? [1, 1.25, 1] : [1, 1.08, 1],
                  opacity: isDragging ? 0.25 : [0.05, 0.12, 0.05],
                }
          }
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-96 h-96 bg-[#00DDB3] rounded-full blur-3xl"
        />
      </div>

      <input
        type="file"
        id="lottie-file-input"
        accept=".json,.lottie"
        onChange={handleFileInput}
        className="hidden"
      />

      <label
        htmlFor="lottie-file-input"
        className="flex flex-col items-center justify-center cursor-pointer relative z-10"
      >
        {/* Animated Drop Target Icon */}
        <motion.div
          className={`
            relative p-5 sm:p-6 lg:p-7 rounded-2xl sm:rounded-3xl mb-4 sm:mb-6 transition-all duration-300
            ${isDragging
              ? 'bg-[#00DDB3]/20 shadow-lg shadow-[#00DDB3]/20 scale-105'
              : 'bg-white dark:bg-gray-800 shadow-sm'
            }
            border-2 border-gray-200 dark:border-gray-700
          `}
          animate={
            isDragging && !shouldReduceMotion
              ? { y: [0, -6, 0] }
              : !shouldReduceMotion
              ? { y: [0, -3, 0] }
              : {}
          }
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          {isDragging ? (
            <Upload className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-[#00DDB3]" />
          ) : (
            <FileJson className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-[#00DDB3]" />
          )}

          {/* Micro pulsing spark */}
          <motion.div
            className="absolute -top-1 -right-1 w-5 h-5 bg-[#00DDB3] rounded-full flex items-center justify-center shadow-xs"
            animate={
              shouldReduceMotion
                ? {}
                : {
                    scale: [0.9, 1.15, 0.9],
                  }
            }
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Zap className="w-3 h-3 text-white fill-white" />
          </motion.div>
        </motion.div>

        <h3 className="text-xl sm:text-2xl mb-2 text-gray-900 dark:text-white font-bold text-center px-4 tracking-tight">
          Drag & drop your Lottie file here
        </h3>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 text-center">
          or click to browse from device
        </p>

        {/* Micro file reduction demonstration loop */}
        <div className="flex items-center gap-2 sm:gap-3 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 shadow-xs text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
          <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            Heavy JSON
          </span>
          <motion.div
            animate={
              shouldReduceMotion
                ? {}
                : {
                    x: [0, 3, 0],
                  }
            }
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowRight className="w-3.5 h-3.5 text-[#00DDB3]" />
          </motion.div>
          <span className="flex items-center gap-1 font-bold text-[#00DDB3]">
            <Sparkles className="w-3 h-3" />
            Up to 98% smaller
          </span>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <span className="text-gray-400 dark:text-gray-400 text-[11px] sm:text-xs">
            .json & .lottie
          </span>
        </div>
      </label>
    </motion.div>
  );
}