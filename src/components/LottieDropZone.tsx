import { Upload, FileJson } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'motion/react';

interface LottieDropZoneProps {
  onFileSelect: (file: File) => void;
}

export function LottieDropZone({ onFileSelect }: LottieDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

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
        relative border-2 border-dashed rounded-2xl p-8 sm:p-12 lg:p-16 transition-all duration-300
        ${isDragging
          ? 'border-[#00DDB3] bg-[#00DDB3]/10 scale-[1.02]'
          : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:border-[#00DDB3] hover:bg-gray-100 dark:hover:bg-gray-800'
        }
      `}
    >
      <input
        type="file"
        id="lottie-file-input"
        accept=".json,.lottie"
        onChange={handleFileInput}
        className="hidden"
      />

      <label
        htmlFor="lottie-file-input"
        className="flex flex-col items-center justify-center cursor-pointer"
      >
        <motion.div
          className={`
            p-5 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl mb-4 sm:mb-6 transition-all duration-300
            ${isDragging
              ? 'bg-[#00DDB3]/20 scale-110'
              : 'bg-white dark:bg-gray-800'
            }
            border-2 border-gray-200 dark:border-gray-700
          `}
          animate={isDragging ? { rotate: [0, -10, 10, -10, 0] } : {}}
          transition={{ duration: 0.5 }}
        >
          {isDragging ? (
            <Upload className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-[#00DDB3]" />
          ) : (
            <FileJson className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-[#00DDB3]" />
          )}
        </motion.div>

        <h3 className="text-xl sm:text-2xl mb-2 sm:mb-3 text-gray-900 dark:text-white font-semibold text-center px-4">
          Drag & drop your Lottie file here
        </h3>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-2 text-center">
          or click to browse
        </p>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 bg-white dark:bg-gray-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-gray-200 dark:border-gray-700">
          Supports .json and .lottie files
        </p>
      </label>
    </motion.div>
  );
}