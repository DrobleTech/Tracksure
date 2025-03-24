
import React, { useState, useEffect } from 'react';
import { Sliders, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Slider } from '../ui/slider';

interface QualityScoreGaugeProps {
  initialScore?: number;
  optimizedScore?: number;
  onScoreChange?: (score: number) => void;
}

const QualityScoreGauge: React.FC<QualityScoreGaugeProps> = ({
  initialScore = 78,
  optimizedScore = 85,
  onScoreChange,
}) => {
  const [score, setScore] = useState(initialScore);
  const [mode, setMode] = useState<'set' | 'optimized'>('optimized');
  
  // Update score when mode changes
  useEffect(() => {
    if (mode === 'optimized') {
      setScore(optimizedScore);
      onScoreChange?.(optimizedScore);
    }
  }, [mode, optimizedScore, onScoreChange]);
  
  // Handle slider change
  const handleSliderChange = (value: number[]) => {
    const newScore = value[0];
    setScore(newScore);
    onScoreChange?.(newScore);
  };
  
  // Determine quality level
  const getQualityLevel = (score: number) => {
    if (score >= 80) return { text: 'Excellent', color: 'text-green-600' };
    if (score >= 65) return { text: 'Good', color: 'text-emerald-600' };
    if (score >= 50) return { text: 'Average', color: 'text-yellow-600' };
    if (score >= 35) return { text: 'Fair', color: 'text-orange-600' };
    return { text: 'Poor', color: 'text-red-600' };
  };
  
  const quality = getQualityLevel(score);
  
  // Calculate position and rotation for the gauge
  const calculateDegrees = (value: number) => {
    // Map score from 0-100 to -120 to 120 degrees (240 degree arc)
    return (value / 100) * 240 - 120;
  };
  
  const rotation = calculateDegrees(score);
  const indicatorStyle = {
    transform: `rotate(${rotation}deg)`,
    transformOrigin: 'bottom center',
  };

  return (
    <div className="flex flex-col items-center bg-white rounded-2xl p-6 shadow-soft">
      <h3 className="text-lg font-semibold text-slate-900 mb-2">Order Quality Score</h3>
      
      <Tabs 
        defaultValue={mode} 
        onValueChange={(value) => setMode(value as 'set' | 'optimized')}
        className="mb-4"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="set" className="flex items-center gap-1">
            <Sliders className="w-4 h-4" />
            <span>Set</span>
          </TabsTrigger>
          <TabsTrigger value="optimized" className="flex items-center gap-1">
            <Zap className="w-4 h-4" />
            <span>Optimized</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="w-full relative mb-2">
        {mode === 'set' && (
          <div className="px-4 mb-6">
            <Slider
              defaultValue={[score]}
              max={100}
              step={1}
              onValueChange={handleSliderChange}
              className="w-full"
            />
          </div>
        )}
      </div>
      
      <div className="relative w-full max-w-xs aspect-[2/1] mb-4">
        {/* Gauge background */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-full rounded-t-full"
            style={{
              background: 'linear-gradient(90deg, #e74c3c 0%, #f39c12 40%, #2ecc71 100%)',
              opacity: 0.2
            }}
          />
        </div>
        
        {/* Gauge foreground - colored part */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-full rounded-t-full"
            style={{
              background: 'linear-gradient(90deg, #e74c3c 0%, #f39c12 40%, #2ecc71 100%)',
              clipPath: `polygon(0% 100%, 100% 100%, 100% ${100 - score}%, 0% ${100 - score}%)`,
            }}
          />
        </div>
        
        {/* Gauge ticks */}
        <div className="absolute inset-0">
          {[0, 20, 40, 60, 80, 100].map((tick) => (
            <div 
              key={tick}
              className="absolute bottom-0 w-1 h-3 bg-white"
              style={{
                left: `${tick}%`,
                transform: 'translateX(-50%)',
              }}
            />
          ))}
        </div>
        
        {/* Gauge pointer */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-[85%] origin-bottom" style={indicatorStyle}>
          <div className="w-0 h-0 mx-auto border-l-[6px] border-r-[6px] border-b-[12px] border-l-transparent border-r-transparent border-b-black" />
        </div>
        
        {/* Score display */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-full text-center">
          <span className="text-4xl font-bold">{score}</span>
        </div>
      </div>
      
      <div className="w-full flex justify-between text-xs text-gray-500 mb-3 px-1">
        <span>300</span>
        <span>500</span>
        <span>700</span>
        <span>850</span>
      </div>
      
      <div className="text-center mt-2">
        <div className={cn(
          "inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full",
          score >= 80 ? "bg-green-50" : 
          score >= 65 ? "bg-emerald-50" : 
          score >= 50 ? "bg-yellow-50" : 
          score >= 35 ? "bg-orange-50" : "bg-red-50"
        )}>
          <span className={cn("text-sm font-medium", quality.color)}>
            {quality.text} Quality
          </span>
        </div>
        
        <p className="text-sm text-slate-500 mt-2">
          {score > 70 ? 
            "Your order quality is above average" : 
            "Consider optimizing your threshold"
          }
        </p>
      </div>
    </div>
  );
};

export default QualityScoreGauge;
