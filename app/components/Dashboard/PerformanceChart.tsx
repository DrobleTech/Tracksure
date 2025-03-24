
import React, { useState } from 'react';
import { Info, Eye, TrendingUp, TrendingDown, CircleCheck } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { cn } from '../../lib/utils';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

type ShippingMode = 'all' | 'custom' | 'auto';

interface PerformanceData {
  metric: string;
  all: string | number;
  custom: string | number;
  auto: string | number;
  info?: string;
  higherIsBetter?: boolean;
}

const performanceData: PerformanceData[] = [
  { 
    metric: 'Total Orders Shipped', 
    all: 156, 
    custom: 130, 
    auto: 120,
    info: 'The total number of orders processed in the selected period',
    higherIsBetter: false
  },
  { 
    metric: 'Est. Delivery Percentage (%)', 
    all: '55%', 
    custom: '70%', 
    auto: '78%',
    info: 'Estimated percentage of orders that will be successfully delivered',
    higherIsBetter: true
  },
  { 
    metric: 'Undelivered Orders', 
    all: 36, 
    custom: 15, 
    auto: 10,
    info: 'Orders that failed to deliver and were returned',
    higherIsBetter: false
  },
  { 
    metric: 'Inventory Saved', 
    all: 0, 
    custom: 11, 
    auto: 17,
    info: 'Amount of inventory saved by not shipping risky orders',
    higherIsBetter: true
  },
  { 
    metric: 'Total Upfront Cost', 
    all: 9000, 
    custom: 7000, 
    auto: 5000,
    info: 'Initial capital required to fulfill the orders',
    higherIsBetter: false
  },
  { 
    metric: 'Total Net Profit', 
    all: 10240, 
    custom: 11720, 
    auto: 12450,
    info: 'Estimated net profit after accounting for returns and costs',
    higherIsBetter: true
  },
  { 
    metric: 'Capital Efficiency', 
    all: 1.36, 
    custom: 1.49, 
    auto: 1.79,
    info: 'Return on capital invested (higher is better)',
    higherIsBetter: true
  },
  { 
    metric: 'Breakeven Days', 
    all: 16, 
    custom: 14, 
    auto: 13,
    info: 'Number of days until the investment is recovered',
    higherIsBetter: false
  },
  { 
    metric: 'Capital Saved', 
    all: 0, 
    custom: 2100, 
    auto: 2100,
    info: 'Amount of capital not tied up in risky orders',
    higherIsBetter: true
  },
];

interface PerformanceChartProps {
  className?: string;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ className }) => {
  const [activeMode, setActiveMode] = useState<ShippingMode>('all');
  
  const formatValue = (value: string | number) => {
    if (typeof value === 'number') {
      if (['Total Upfront Cost', 'Total Net Profit', 'Capital Saved'].includes(performanceData.find(d => d.all === value || d.custom === value || d.auto === value)?.metric || '')) {
        return `₹${value.toLocaleString()}`;
      }
      return value.toLocaleString();
    }
    return value;
  };
  
  const getBestMode = (metric: string): ShippingMode => {
    const data = performanceData.find(d => d.metric === metric);
    if (!data) return 'all';
    
    const higherIsBetter = data.higherIsBetter !== undefined ? data.higherIsBetter : true;
    
    const all = typeof data.all === 'string' ? parseFloat(data.all) : data.all;
    const custom = typeof data.custom === 'string' ? parseFloat(data.custom) : data.custom;
    const auto = typeof data.auto === 'string' ? parseFloat(data.auto) : data.auto;
    
    if (higherIsBetter) {
      if (auto >= custom && auto >= all) return 'auto';
      if (custom >= all && custom >= auto) return 'custom';
      return 'all';
    } else {
      if (auto <= custom && auto <= all) return 'auto';
      if (custom <= all && custom <= auto) return 'custom';
      return 'all';
    }
  };
  
  const getTrendIcon = (metric: string, mode: ShippingMode) => {
    const data = performanceData.find(d => d.metric === metric);
    if (!data) return null;
    
    const higherIsBetter = data.higherIsBetter !== undefined ? data.higherIsBetter : true;
    const bestMode = getBestMode(metric);
    
    if (bestMode === mode) {
      return higherIsBetter ? 
        <TrendingUp className="w-4 h-4 text-green-500 ml-1" /> : 
        <TrendingDown className="w-4 h-4 text-green-500 ml-1" />;
    }
    return null;
  };
  
  return (
    <div className={cn("p-6 animate-scale-in", className)}>
      <div className="flex mb-6 space-x-6 justify-center bg-slate-50 p-4 rounded-lg">
        <div 
          className={cn(
            "px-6 py-3 rounded-md cursor-pointer transition-all duration-200 flex flex-col items-center",
            activeMode === 'all' ? "bg-white shadow-sm border border-slate-200" : "hover:bg-white"
          )}
          onClick={() => setActiveMode('all')}
        >
          <div className="font-semibold text-sm uppercase text-slate-800 mb-1">ALL SHIPPING</div>
          <div className="text-xs text-slate-500">minimum optimization</div>
        </div>
        <div 
          className={cn(
            "px-6 py-3 rounded-md cursor-pointer transition-all duration-200 flex flex-col items-center",
            activeMode === 'custom' ? "bg-white shadow-sm border border-slate-200" : "hover:bg-white"
          )}
          onClick={() => setActiveMode('custom')}
        >
          <div className="font-semibold text-sm uppercase text-slate-800 mb-1">CUSTOM</div>
          <div className="text-xs text-slate-500">manual selection</div>
        </div>
        <div 
          className={cn(
            "px-6 py-3 rounded-md cursor-pointer transition-all duration-200 flex flex-col items-center",
            activeMode === 'auto' ? "bg-white shadow-sm border border-slate-200" : "hover:bg-white"
          )}
          onClick={() => setActiveMode('auto')}
        >
          <div className="font-semibold text-sm uppercase text-trackscore-blue mb-1">AUTO</div>
          <div className="text-xs text-slate-500">system optimization</div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-100">
            <TableRow>
              <TableHead className="py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-slate-900 w-1/4">
                Metric
              </TableHead>
              <TableHead 
                className={cn(
                  "px-4 py-3.5 text-center text-sm font-semibold w-1/4",
                  activeMode === 'all' ? "text-trackscore-blue bg-slate-50" : "text-slate-700"
                )}
              >
                ALL SHIPPING
              </TableHead>
              <TableHead 
                className={cn(
                  "px-4 py-3.5 text-center text-sm font-semibold w-1/4",
                  activeMode === 'custom' ? "text-trackscore-blue bg-slate-50" : "text-slate-700"
                )}
              >
                CUSTOM
              </TableHead>
              <TableHead 
                className={cn(
                  "px-4 py-3.5 text-center text-sm font-semibold w-1/4",
                  activeMode === 'auto' ? "text-trackscore-blue bg-slate-50" : "text-slate-700"
                )}
              >
                AUTO
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {performanceData.map((item, index) => {
              const bestMode = getBestMode(item.metric);
              
              return (
                <TableRow key={index} className={cn(
                  "hover:bg-slate-50 transition-colors duration-200",
                  index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                )}>
                  <TableCell className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-medium text-slate-900">
                    <div className="flex items-center">
                      {item.metric}
                      {item.info && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="ml-2">
                              <Info className="w-4 h-4 text-slate-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-sm">{item.info}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className={cn(
                    "whitespace-nowrap px-4 py-4 text-sm text-center",
                    bestMode === 'all' ? "font-semibold text-slate-900" : "text-slate-600"
                  )}>
                    <div className="flex items-center justify-center">
                      {formatValue(item.all)}
                      {getTrendIcon(item.metric, 'all')}
                    </div>
                  </TableCell>
                  <TableCell className={cn(
                    "whitespace-nowrap px-4 py-4 text-sm text-center",
                    bestMode === 'custom' ? "font-semibold text-slate-900" : "text-slate-600"
                  )}>
                    <div className="flex items-center justify-center">
                      {formatValue(item.custom)}
                      {getTrendIcon(item.metric, 'custom')}
                    </div>
                  </TableCell>
                  <TableCell className={cn(
                    "whitespace-nowrap px-4 py-4 text-sm text-center",
                    bestMode === 'auto' ? "font-semibold text-trackscore-blue" : "text-slate-600",
                    activeMode === 'auto' ? "bg-blue-50/50" : ""
                  )}>
                    <div className="flex items-center justify-center">
                      {formatValue(item.auto)}
                      {getTrendIcon(item.metric, 'auto')}
                      {bestMode === 'auto' && (
                        <CircleCheck className="w-4 h-4 text-green-500 ml-1" />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      
      <div className="mt-6 pt-4 border-t">
        <div className="flex justify-center">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 max-w-md text-center">
            <h4 className="font-semibold text-trackscore-blue mb-2">TrackScore AUTO Optimization</h4>
            <p className="text-sm text-slate-600">
              The AUTO mode provides the best balance of capital efficiency and profit, 
              with 17% less inventory usage and 22% higher profit compared to shipping all orders.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;
