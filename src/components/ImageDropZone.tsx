import { Upload } from 'lucide-react';
import { useState } from 'react';

interface ImageDropZoneProps {
  onImageSelect: (file: File) => void;
}

export function ImageDropZone({ onImageSelect }: ImageDropZoneProps) {
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
      if (file.type.startsWith('image/')) {
        onImageSelect(file);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onImageSelect(files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-xl p-12 transition-all duration-300
        ${isDragging 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
        }
      `}
    >
      <input
        type="file"
        id="file-input"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />
      
      <label
        htmlFor="file-input"
        className="flex flex-col items-center justify-center cursor-pointer"
      >
        <div className={`
          p-6 rounded-full mb-4 transition-colors
          ${isDragging ? 'bg-blue-100' : 'bg-gray-100'}
        `}>
          <Upload className={`
            w-12 h-12 transition-colors
            ${isDragging ? 'text-blue-600' : 'text-gray-600'}
          `} />
        </div>
        
        <h3 className="text-xl mb-2 text-gray-800">
          Drop your image here
        </h3>
        <p className="text-gray-500 mb-4">
          or click to browse
        </p>
        <p className="text-sm text-gray-400">
          Supports JPG, PNG, WebP (max 50MB)
        </p>
      </label>
    </div>
  );
}
