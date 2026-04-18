import { motion } from 'motion/react';
import { X, Zap, Check, Heart } from 'lucide-react';
import { Button } from './ui/button';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileSize: number;
}

export function PricingModal({ isOpen, onClose, fileSize }: PricingModalProps) {
  if (!isOpen) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleUpgrade = () => {
    window.open('https://www.shopier.com/themirproject/46280901', '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#00DDB3] to-[#00C9A7] p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Upgrade to Pro</h2>
          </div>
          <p className="text-white/90">
            Your file ({formatFileSize(fileSize)}) exceeds the free tier limit
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">$9</span>
              <span className="text-gray-600 dark:text-gray-400">/month</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Unlock unlimited file sizes and support the development of TinyLottie.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <div className="p-1 bg-[#00DDB3]/10 rounded-full mt-0.5">
                <Check className="w-4 h-4 text-[#00DDB3]" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Unlimited File Size</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Process files of any size without restrictions
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1 bg-[#00DDB3]/10 rounded-full mt-0.5">
                <Check className="w-4 h-4 text-[#00DDB3]" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Priority Support</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get help when you need it with dedicated support
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1 bg-[#00DDB3]/10 rounded-full mt-0.5">
                <Check className="w-4 h-4 text-[#00DDB3]" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Early Access to Features</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Be the first to try new features like batch processing, Figma plugin & API
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1 bg-[#00DDB3]/10 rounded-full mt-0.5">
                <Heart className="w-4 h-4 text-[#00DDB3]" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Support Development</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Help us build the future of Lottie optimization
                </p>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleUpgrade}
              className="w-full bg-[#00DDB3] hover:bg-[#00C9A7] text-white h-12 text-base font-semibold"
            >
              Upgrade to Pro
            </Button>
            <button
              onClick={onClose}
              className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
            >
              Maybe later
            </button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-4">
            Coming soon: Marketplace with ready-made optimized Lotties
          </p>
        </div>
      </motion.div>
    </div>
  );
}