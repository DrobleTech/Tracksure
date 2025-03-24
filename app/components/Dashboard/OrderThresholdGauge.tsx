
import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Slider } from '../ui/slider';
import { Card } from '../ui/card';
import { Sliders, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';

interface OrderThresholdGaugeProps {
  totalOrders: number;
  initialThreshold: number;
  onThresholdChange: (threshold: number) => void;
}

const OrderThresholdGauge: React.FC<OrderThresholdGaugeProps> = ({
  totalOrders,
  initialThreshold,
  onThresholdChange
}) => {
  const [mode, setMode] = useState<'set' | 'auto'>('auto');
  const [threshold, setThreshold] = useState(initialThreshold);
  
  // Transition point (optimal threshold) - this would come from an algorithm in a real app
  const optimalThreshold = 65;
  
  // Update parent when threshold changes
  useEffect(() => {
    onThresholdChange(threshold);
  }, [threshold, onThresholdChange]);
  
  // When mode changes, update threshold accordingly
  useEffect(() => {
    if (mode === 'auto') {
      setThreshold(optimalThreshold);
    }
  }, [mode, optimalThreshold]);
  
  // Calculate the order number based on percentage
  const getOrderNumber = (percentage: number) => {
    return Math.round((percentage / 100) * totalOrders);
  };
  
  // Handle slider value change
  const handleSliderChange = (value: number[]) => {
    setThreshold(value[0]);
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Order Threshold Selection</h3>
        <p className="text-sm text-slate-500">
          Set a threshold to filter out risky orders. Orders below the threshold will be flagged.
        </p>
      </div>
      
      <Tabs 
        defaultValue={mode} 
        onValueChange={(value) => setMode(value as 'set' | 'auto')}
        className="mb-6"
      >
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="set" className="flex items-center gap-1">
            <Sliders className="w-4 h-4" />
            <span>Set</span>
          </TabsTrigger>
          <TabsTrigger value="auto" className="flex items-center gap-1">
            <Zap className="w-4 h-4" />
            <span>Auto</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {mode === 'set' && (
        <div className="px-4 mb-6 max-w-md">
          <Slider
            value={[threshold]}
            max={100}
            step={1}
            onValueChange={handleSliderChange}
            className="w-full"
          />
        </div>
      )}
      
      <div className="w-full mb-2">
        {/* The gauge itself */}
        <div className="w-full h-8 relative mb-1">
          {/* Gradient background */}
          <div 
            className="absolute inset-0 rounded-md overflow-hidden"
            style={{
              background: 'linear-gradient(to right, #2ecc71 0%, #f1c40f 50%, #e74c3c 100%)'
            }}
          />
          
          {/* Threshold indicator */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-black"
            style={{
              left: `${threshold}%`,
              transform: 'translateX(-50%)',
              zIndex: 10
            }}
          />
          
          {/* Add a triangle pointer at the bottom */}
          <div 
            className="absolute bottom-0 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[8px] border-transparent border-b-black"
            style={{
              left: `${threshold}%`,
              transform: 'translateX(-50%)',
              zIndex: 10
            }}
          />
        </div>
        
        {/* Scale markers and labels */}
        <div className="flex justify-between items-center w-full">
          <div className="text-sm font-medium">
            <span className="block">0</span>
          </div>
          
          <div className="text-sm font-medium">
            <span className="block">{totalOrders}</span>
          </div>
        </div>
      </div>
      
      {/* Current value display */}
      <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="flex flex-col mb-4 sm:mb-0">
          <span className="text-sm text-slate-500">Current Threshold</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{threshold}%</span>
            <span className="text-lg text-slate-700">
              ({getOrderNumber(threshold)} orders)
            </span>
          </div>
        </div>
        
        <div className={cn(
          "px-4 py-2 rounded-full",
          threshold >= 80 ? "bg-green-100 text-green-800" : 
          threshold >= 60 ? "bg-yellow-100 text-yellow-800" : 
          "bg-red-100 text-red-800"
        )}>
          {threshold >= 80 ? "High Quality" : 
           threshold >= 60 ? "Medium Quality" : 
           "Low Quality"}
        </div>
      </div>
    </Card>
  );
};

export default OrderThresholdGauge;
