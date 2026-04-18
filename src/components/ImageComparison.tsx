import { Download, X } from 'lucide-react';
import { Button } from './ui/button';

interface ImageComparisonProps {
  originalUrl: string;
  optimizedUrl: string;
  originalSize: number;
  optimizedSize: number;
  onDownload: () => void;
  onReset: () => void;
}

export function ImageComparison({
  originalUrl,
  optimizedUrl,
  originalSize,
  optimizedSize,
  onDownload,
  onReset
}: ImageComparisonProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const savingsPercent = Math.round(((originalSize - optimizedSize) / originalSize) * 100);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl text-gray-800">Optimization Complete!</h2>
        <Button
          onClick={onReset}
          variant="ghost"
          size="sm"
          className="gap-2"
        >
          <X className="w-4 h-4" />
          Start Over
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Original Image */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="mb-4">
            <h3 className="text-lg mb-2 text-gray-700">Original</h3>
            <p className="text-sm text-gray-500">{formatFileSize(originalSize)}</p>
          </div>
          <div className="relative rounded-lg overflow-hidden bg-gray-100">
            <img
              src={originalUrl}
              alt="Original"
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Optimized Image */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="mb-4">
            <h3 className="text-lg mb-2 text-gray-700">Optimized</h3>
            <p className="text-sm text-gray-500">{formatFileSize(optimizedSize)}</p>
          </div>
          <div className="relative rounded-lg overflow-hidden bg-gray-100">
            <img
              src={optimizedUrl}
              alt="Optimized"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>

      {/* Stats & Download */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-3xl mb-1 text-green-600">
              {savingsPercent}% Smaller
            </p>
            <p className="text-gray-600">
              Saved {formatFileSize(originalSize - optimizedSize)}
            </p>
          </div>
          
          <Button
            onClick={onDownload}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-6 gap-2"
          >
            <Download className="w-5 h-5" />
            Download Optimized Image
          </Button>
        </div>
      </div>
    </div>
  );
}
