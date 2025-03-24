import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { InfoIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface CutoffMode {
  modeId: string;
  name: string;
  description: string;
  threshold: number;
  isActive: boolean;
}

interface CutOffQualityProps {
  initialValue?: number;
  initialMode: string;
  modes: CutoffMode[];
  onValueChange: (value: number) => void;
  onModeChange?: (mode: string) => void;
  isLoading?: boolean;
}

const CutOffQuality: React.FC<CutOffQualityProps> = ({ 
  initialValue = 75,
  initialMode = 'balanced',
  modes,
  onValueChange,
  onModeChange,
  isLoading = false
}) => {
  const [quality, setQuality] = useState(initialValue);
  const [selectedMode, setSelectedMode] = useState(initialMode);

  const handleModeChange = (modeId: string) => {
    setSelectedMode(modeId);
    const mode = modes.find(m => m.modeId === modeId);
    if (mode) {
      setQuality(mode.threshold);
      onValueChange(mode.threshold);
      onModeChange?.(modeId);
    }
  };

  return (
    <div className="glass-card p-4 flex flex-col h-full animate-scale-in">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-trackscore-text text-center">Choose Mode</h2>
      </div>
      
      <div className="space-y-3 mb-4">
        {modes.map(mode => (
          <div 
            key={mode.modeId}
            className={cn(
              "relative p-3 rounded-lg cursor-pointer border-2 transition-all",
              selectedMode === mode.modeId 
                ? "border-trackscore-blue bg-slate-50" 
                : "border-slate-200 hover:border-slate-300"
            )}
            onClick={() => handleModeChange(mode.modeId)}
          >
            <div className="flex items-center justify-between">
              <h3 className={cn(
                "font-medium",
                selectedMode === mode.modeId ? "text-trackscore-blue" : "text-slate-700"
              )}>
                {mode.name}
              </h3>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="h-4 w-4 text-slate-400" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="z-50">
                    <p className="w-60 text-sm">{mode.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="mt-1 text-xs text-slate-500 line-clamp-1">
              {mode.description}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-center my-3">
        <div className="relative">
          <span className="text-4xl font-bold text-trackscore-blue">{quality}</span>
          <span className="text-2xl font-bold text-trackscore-blue">%</span>
        </div>
      </div>
    </div>
  );
};

export default CutOffQuality;
