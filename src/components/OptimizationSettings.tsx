import { Slider } from './ui/slider';
import { Label } from './ui/label';

export interface OptimizationOptions {
  quality: number;
  maxWidth: number;
}

interface OptimizationSettingsProps {
  options: OptimizationOptions;
  onChange: (options: OptimizationOptions) => void;
}

export function OptimizationSettings({ options, onChange }: OptimizationSettingsProps) {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 max-w-md mx-auto mb-8">
      <h3 className="text-lg mb-4 text-gray-800">Optimization Settings</h3>
      
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label htmlFor="quality-slider" className="text-gray-700">
              Quality
            </Label>
            <span className="text-sm text-gray-600">{options.quality}%</span>
          </div>
          <Slider
            id="quality-slider"
            min={10}
            max={100}
            step={5}
            value={[options.quality]}
            onValueChange={(value: number[]) => onChange({ ...options, quality: value[0] })}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-2">
            Higher quality = larger file size
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <Label htmlFor="width-slider" className="text-gray-700">
              Max Width
            </Label>
            <span className="text-sm text-gray-600">
              {options.maxWidth === 4000 ? 'Original' : `${options.maxWidth}px`}
            </span>
          </div>
          <Slider
            id="width-slider"
            min={800}
            max={4000}
            step={200}
            value={[options.maxWidth]}
            onValueChange={(value: number[]) => onChange({ ...options, maxWidth: value[0] })}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-2">
            Images will be resized if larger than this width
          </p>
        </div>
      </div>
    </div>
  );
}
