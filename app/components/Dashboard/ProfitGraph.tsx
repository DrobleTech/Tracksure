
import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import { cn } from '../../lib/utils';
import { InfoIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from '../ui/button';

interface ProfitGraphProps {
  threshold: number;
  onAutoThresholdChange: (value: number) => void;
}

const ProfitGraph: React.FC<ProfitGraphProps> = ({ threshold, onAutoThresholdChange }) => {
  // Generate data based on a bell curve to simulate profit optimization
  const [data, setData] = useState<{ orders: number; profit: number; }[]>([]);
  const [optimalThreshold, setOptimalThreshold] = useState(120);
  
  useEffect(() => {
    const generateData = () => {
      const totalOrders = 156;
      const peak = 120; // Optimal threshold
      const newData = [];
      
      // Start with 0,0 to ensure graph starts from origin
      newData.push({ orders: 0, profit: 0 });
      
      // Create a smoother bell curve for profit
      for (let i = 5; i <= totalOrders; i += 5) {
        let profit;
        
        // Using a more mathematical bell curve formula for smoothness
        // This is a modified Gaussian function
        const standardDeviation = 50;
        const amplitude = 100;
        profit = Math.round(amplitude * Math.exp(-Math.pow(i - peak, 2) / (2 * Math.pow(standardDeviation, 2))));
        
        newData.push({ orders: i, profit });
      }
      
      setData(newData);
      setOptimalThreshold(peak);
    };
    
    generateData();
  }, []); // We don't want the graph to regenerate when threshold changes
  
  const calculateThresholdPosition = () => {
    const totalOrders = 156;
    return Math.round(threshold * totalOrders / 100);
  };
  
  // Get maximum profit value from the data array
  const getMaxProfit = () => {
    if (data.length === 0) return 0;
    return Math.max(...data.map(item => item.profit));
  };

  // Example data for the how it works dialog
  const generateLeftPeakData = () => {
    const totalOrders = 156;
    const peak = 40; // Peak shifted left
    const result = [{ orders: 0, profit: 0 }]; // Start with 0,0
    
    for (let i = 5; i <= totalOrders; i += 5) {
      const orders = i;
      const standardDeviation = 50;
      const amplitude = 100;
      const profit = Math.round(amplitude * Math.exp(-Math.pow(orders - peak, 2) / (2 * Math.pow(standardDeviation, 2))));
      result.push({ orders, profit });
    }
    return result;
  };

  const generateRightPeakData = () => {
    const totalOrders = 156;
    const peak = 120; // Peak shifted right
    const result = [{ orders: 0, profit: 0 }]; // Start with 0,0
    
    for (let i = 5; i <= totalOrders; i += 5) {
      const orders = i;
      const standardDeviation = 50;
      const amplitude = 100;
      const profit = Math.round(amplitude * Math.exp(-Math.pow(orders - peak, 2) / (2 * Math.pow(standardDeviation, 2))));
      result.push({ orders, profit });
    }
    return result;
  };
  
  return (
    <div className="glass-card p-6 h-full flex flex-col animate-scale-in">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Personalized Customer Quality Graph</h3>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <InfoIcon className="h-4 w-4" /> How It Works
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Understanding Customer Quality Graphs</DialogTitle>
              <DialogDescription>
                These graphs help determine where to set your threshold for optimal profit.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2 text-red-600">Poor Customer Quality</h4>
                <p className="text-sm text-slate-600 mb-3">
                  When the peak is toward the left, it indicates poor customer quality. This means you need to remove many low-quality orders to achieve optimal profit.
                </p>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={generateLeftPeakData()} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorProfitLeft" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#10B981" stopOpacity={0.8} />
                          <stop offset="30%" stopColor="#F97316" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#ea384c" stopOpacity={0.8} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="orders" />
                      <YAxis />
                      <ReferenceLine x={40} stroke="#10B981" strokeWidth={2} label={{ value: 'PEAK', position: 'top', fill: '#10B981' }} />
                      <Area type="monotone" dataKey="profit" stroke="url(#colorProfitLeft)" fill="url(#colorProfitLeft)" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-sm text-red-500 mt-2 font-medium">
                  After the peak, shipping more orders decreases profit
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2 text-green-600">Better Customer Quality</h4>
                <p className="text-sm text-slate-600 mb-3">
                  When the peak is toward the right, it indicates better customer quality. You need to remove fewer orders to achieve optimal profit.
                </p>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={generateRightPeakData()} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorProfitRight" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#10B981" stopOpacity={0.8} />
                          <stop offset="70%" stopColor="#F97316" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#ea384c" stopOpacity={0.8} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="orders" />
                      <YAxis />
                      <ReferenceLine x={120} stroke="#10B981" strokeWidth={2} label={{ value: 'PEAK', position: 'top', fill: '#10B981' }} />
                      <Area type="monotone" dataKey="profit" stroke="url(#colorProfitRight)" fill="url(#colorProfitRight)" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-sm text-red-500 mt-2 font-medium">
                  After the peak, shipping more orders decreases profit
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex-grow" style={{ minHeight: "200px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.8} />
                <stop offset={`${optimalThreshold / 156 * 100}%`} stopColor="#10B981" stopOpacity={0.8} />
                <stop offset={`${(optimalThreshold / 156 * 100) + 5}%`} stopColor="#F97316" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#ea384c" stopOpacity={0.8} />
              </linearGradient>
              <linearGradient id="colorProfitFill" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset={`${optimalThreshold / 156 * 100}%`} stopColor="#10B981" stopOpacity={0.3} />
                <stop offset={`${(optimalThreshold / 156 * 100) + 5}%`} stopColor="#F97316" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#ea384c" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="orders" 
              label={{ 
                value: 'Orders Shipped', 
                position: 'insideBottomRight', 
                offset: -5 
              }}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              label={{ 
                value: 'Profit', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value) => [`${value}`, 'Profit']}
              labelFormatter={(value) => `Orders: ${value}`}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #E5E7EB',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                zIndex: 50
              }}
            />
            <ReferenceLine 
              y={getMaxProfit()} 
              stroke="#10B981" 
              strokeWidth={1.5}
              strokeDasharray="5 5"
              label={{ 
                value: 'Our Profit', 
                position: 'right',
                fill: '#10B981',
                fontSize: 12
              }} 
            />
            <ReferenceLine 
              y={getMaxProfit() * 0.5} 
              stroke="#64748B" 
              strokeWidth={1.5}
              strokeDasharray="5 5"
              label={{ 
                value: 'All Shipping Profit', 
                position: 'right',
                fill: '#64748B',
                fontSize: 12
              }} 
            />
            <ReferenceLine 
              x={optimalThreshold} 
              stroke="#10B981" 
              strokeWidth={2} 
              label={{ 
                value: 'OPTIMAL', 
                position: 'top',
                fill: '#10B981',
                fontSize: 12
              }} 
            />
            <ReferenceLine 
              x={calculateThresholdPosition()} 
              stroke="#F97316" 
              strokeWidth={2} 
              strokeDasharray="3 3"
            />
            <Area 
              type="monotone" 
              dataKey="profit" 
              stroke="url(#colorProfit)" 
              fillOpacity={1} 
              fill="url(#colorProfitFill)" 
              strokeWidth={2}
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProfitGraph;
