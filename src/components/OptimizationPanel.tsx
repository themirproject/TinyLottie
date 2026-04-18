import { Download, FileJson, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { motion } from 'motion/react';

interface OptimizationPanelProps {
  fileName: string;
  originalSize: number;
  optimizedSize: number | null;
  isOptimizing: boolean;
  outputFormat: 'json' | 'lottie';
  onOptimize: () => void;
  onDownload: () => void;
  onFormatChange: (format: 'json' | 'lottie') => void;
}

export function OptimizationPanel({
  fileName,
  originalSize,
  optimizedSize,
  isOptimizing,
  outputFormat,
  onOptimize,
  onDownload,
  onFormatChange,
}: OptimizationPanelProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const savingsPercent = optimizedSize 
    ? Math.round(((originalSize - optimizedSize) / originalSize) * 100)
    : 0;

  // Show minimal version when optimized (for bottom section)
  if (optimizedSize) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8"
      >
        {/* File Size Comparison with Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-900 rounded-lg">
                <FileJson className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Original
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {formatFileSize(originalSize)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white text-right">
                  Optimized
                </p>
                <p className="text-xs text-[#00DDB3] text-right">
                  {formatFileSize(optimizedSize)}
                </p>
              </div>
              <div className="p-2 bg-[#00DDB3]/10 rounded-lg">
                <FileJson className="w-5 h-5 text-[#00DDB3]" />
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${100 - savingsPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute left-0 top-0 h-full bg-[#00DDB3] rounded-full"
            />
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Saved {formatFileSize(originalSize - optimizedSize)}
            </p>
            <p className="text-sm font-bold text-[#00DDB3]">
              {savingsPercent}% smaller
            </p>
          </div>
        </div>

        {/* Download Button */}
        <Button
          onClick={onDownload}
          className="w-full bg-[#00DDB3] hover:bg-[#00C9A7] text-white h-12 text-base font-semibold"
        >
          <Download className="w-5 h-5 mr-2" />
          Download Optimized File
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 h-full flex flex-col justify-between w-full"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="p-3 bg-[#00DDB3]/10 rounded-xl">
          <FileJson className="w-6 h-6 text-[#00DDB3]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate mb-1">
            {fileName}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Original size: {formatFileSize(originalSize)}
          </p>
        </div>
      </div>

      <div className="space-y-6 flex-1 flex flex-col justify-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Output Format
          </label>
          <Select value={outputFormat} onValueChange={onFormatChange}>
            <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="json">Lottie JSON</SelectItem>
              <SelectItem value="lottie">dotLottie</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onOptimize}
            disabled={isOptimizing}
            className="flex-1 bg-[#00DDB3] hover:bg-[#00C9A7] text-white h-12 text-base font-semibold"
          >
            {isOptimizing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <FileJson className="w-5 h-5 mr-2" />
                Optimize
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}