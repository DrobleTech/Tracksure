
import React from 'react';
import { Input } from '../ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { PaintBucket } from 'lucide-react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

const ColorPicker = ({ value, onChange }: ColorPickerProps) => {
  // Predefined color options
  const colorOptions = [
    '#F5F8FF', '#E5DEFF', '#FFDEE2', '#F2FCE2', 
    '#FEF7CD', '#FDE1D3', '#D3E4FD', '#F1F0FB'
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button 
          className="p-1 rounded-md hover:bg-slate-100 transition-colors"
          aria-label="Change background color"
        >
          <PaintBucket className="h-4 w-4 text-slate-500" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Background Color</h4>
          <div className="flex flex-wrap gap-2 mb-3">
            {colorOptions.map((color) => (
              <button
                key={color}
                onClick={() => onChange(color)}
                className="w-6 h-6 rounded-full border border-slate-200 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-10 h-10 p-1 cursor-pointer"
            />
            <Input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 h-9"
              placeholder="#RRGGBB"
              maxLength={7}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ColorPicker;
