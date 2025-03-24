
import React, { useState, useEffect } from 'react';
import { Info, Calendar, TrendingUp, TrendingDown, CircleCheck } from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  LineChart,
  Line,
} from 'recharts';
import {
  TooltipProvider,
  Tooltip as UITooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui/tooltip";
import { cn } from '../../lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { ChartContainer, ChartTooltipContent } from "../ui/chart";

// Format currency to K, Lakhs, or Crores
const formatCurrency = (value: number) => {
  const absValue = Math.abs(value);
  if (absValue >= 10000000) { // 1 Crore = 10,000,000
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  } else if (absValue >= 100000) { // 1 Lakh = 100,000
    return `₹${(value / 100000).toFixed(2)} L`;
  } else if (absValue >= 1000) { // 1 Thousand = 1,000
    return `₹${(value / 1000).toFixed(1)}K`;
  } else {
    return `₹${value}`;
  }
};

type ShippingMode = 'normal' | 'trackscore';

// Load financial data from localStorage
const loadFinancialData = () => {
  const storedData = localStorage.getItem('financialData');
  if (storedData) {
    try {
      return JSON.parse(storedData);
    } catch (error) {
      console.error('Error parsing financial data:', error);
    }
  }
  
  // Default values if nothing is stored
  return {
    mrp: '1500',
    productCost: '900',
    marketingCost: '200',
    shippingCost: '80',
    packagingCost: '30',
    rtoCost: '120'
  };
};

// Generate mock data for 30 days with remittance pattern based on COD business and financial data
const generateCashflowData = () => {
  const data = [];
  let normalBalance = 0;
  let trackscoreBalance = 0;
  
  // Load financial data
  const financialData = loadFinancialData();
  
  // Calculate profits and losses based on financial data
  const successfulOrderProfit = financialData.mrp - financialData.productCost - 
                              financialData.marketingCost - financialData.shippingCost - 
                              financialData.packagingCost;
  
  const failedOrderLoss = financialData.shippingCost + financialData.rtoCost + 
                         financialData.packagingCost + financialData.marketingCost;
  
  // Initial investment
  normalBalance = -20000;
  trackscoreBalance = -10000;
  
  // Delivery success rates
  const normalSuccessRate = 0.75; // 75% success
  const trackscoreSuccessRate = 0.92; // 92% success with TrackScore
  
  for (let day = 1; day <= 30; day++) {
    // Daily orders
    const dailyOrders = 100 + Math.floor(Math.random() * 20 - 10);
    
    // Normal shipping calculations
    const normalSuccessOrders = Math.floor(dailyOrders * normalSuccessRate);
    const normalFailedOrders = dailyOrders - normalSuccessOrders;
    
    const normalDailyProfit = normalSuccessOrders * successfulOrderProfit;
    const normalDailyLoss = normalFailedOrders * failedOrderLoss;
    const normalNetDaily = normalDailyProfit - normalDailyLoss;
    
    // TrackScore shipping calculations
    const trackscoreSuccessOrders = Math.floor(dailyOrders * trackscoreSuccessRate);
    const trackscoreFailedOrders = dailyOrders - trackscoreSuccessOrders;
    
    const trackscore_shippingCost = financialData.shippingCost * 0.85; // 15% less
    const trackscore_successfulOrderProfit = financialData.mrp - financialData.productCost - 
                                          financialData.marketingCost - trackscore_shippingCost - 
                                          financialData.packagingCost;
    
    const trackscore_failedOrderLoss = trackscore_shippingCost + (financialData.rtoCost * 0.7) + 
                                    financialData.packagingCost + financialData.marketingCost;
    
    const trackscopeDailyProfit = trackscoreSuccessOrders * trackscore_successfulOrderProfit;
    const trackscopeDailyLoss = trackscoreFailedOrders * trackscore_failedOrderLoss;
    const trackscopeNetDaily = trackscopeDailyProfit - trackscopeDailyLoss;
    
    // Daily expenses (negative cashflow)
    normalBalance -= 10000;
    trackscoreBalance -= 8000;
    
    // Add net profit/loss
    normalBalance += normalNetDaily;
    trackscoreBalance += trackscopeNetDaily;
    
    // Tuesday and Friday remittances (D+2 settlement)
    if ((day - 2) % 7 === 0 || (day - 5) % 7 === 0) {
      // Remittance for orders from 2 days ago
      if (day > 2) {
        normalBalance += 70000;
        trackscoreBalance += 90000;
      }
    }
    
    // Add some variability
    const normalVar = Math.random() * 5000 - 2500;
    const trackscoreVar = Math.random() * 3000 - 1500;
    
    data.push({
      day,
      normal: Math.round(normalBalance + normalVar),
      trackscore: Math.round(trackscoreBalance + trackscoreVar),
      isRemittanceDay: (day - 2) % 7 === 0 || (day - 5) % 7 === 0
    });
  }
  
  return data;
};

// Performance metrics for comparison
const calculatePerformanceMetrics = () => {
  const financialData = loadFinancialData();
  
  // Calculate metrics based on financial data
  const normalInvestment = 200000;
  const trackscoreInvestment = 120000;
  
  // Use financial data for profit calculations
  const successfulOrderProfit = financialData.mrp - financialData.productCost - 
                              financialData.marketingCost - financialData.shippingCost - 
                              financialData.packagingCost;
  
  const failedOrderLoss = financialData.shippingCost + financialData.rtoCost + 
                         financialData.packagingCost + financialData.marketingCost;

  return [
    {
      metric: 'Breakeven Day',
      normal: '18 days',
      trackscore: '14 days',
      info: 'Number of days to recover initial investment'
    },
    {
      metric: 'Inventory Required',
      normal: formatCurrency(normalInvestment),
      trackscore: formatCurrency(trackscoreInvestment),
      info: 'Capital tied up in inventory'
    },
    {
      metric: 'Net Profit (15 days)',
      normal: formatCurrency(-80000),
      trackscore: formatCurrency(-20000),
      info: 'Profit/loss after 15 days'
    },
    {
      metric: 'Net Profit (30 days)',
      normal: formatCurrency(450000),
      trackscore: formatCurrency(630000),
      info: 'Profit/loss after 30 days'
    },
  ];
};

interface CashflowComparisonProps {
  className?: string;
}

const CashflowComparison: React.FC<CashflowComparisonProps> = ({ className }) => {
  const [activeMode, setActiveMode] = useState<ShippingMode>('normal');
  const [cashflowData, setCashflowData] = useState<any[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<any[]>([]);
  const [financialData, setFinancialData] = useState(loadFinancialData());
  
  // Delivery rate comparison data
  const normalDeliveryRate = 75; // 75% success rate
  const trackscoreDeliveryRate = 92; // 92% success with TrackScore
  const deliveryRateImprovement = trackscoreDeliveryRate - normalDeliveryRate;
  
  useEffect(() => {
    // Generate data based on financial settings
    setCashflowData(generateCashflowData());
    setPerformanceMetrics(calculatePerformanceMetrics());
    
    // Update financial data if it changes in localStorage
    const handleStorageChange = () => {
      setFinancialData(loadFinancialData());
      // Regenerate data with new financial settings
      setCashflowData(generateCashflowData());
      setPerformanceMetrics(calculatePerformanceMetrics());
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // Chart config for styled chart
  const chartConfig = {
    all: {
      label: "All",
      theme: {
        light: "#33C3F0",
        dark: "#33C3F0",
      },
    },
    trackscore: {
      label: "With TrackScore",
      theme: {
        light: "#F97316",
        dark: "#F97316",
      },
    },
  };
  
  return (
    <div className={cn("glass-card p-6", className)}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold text-trackscore-text">Cashflow Comparison</h2>
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger className="ml-2">
                <Info className="w-4 h-4 text-slate-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm max-w-xs">
                  Compare cashflow patterns between all orders and optimized orders with TrackScore.
                  COD remittances occur on Tuesdays and Fridays (D+2).
                </p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 text-slate-400 mr-2" />
            <span className="text-sm font-medium">30 Days</span>
          </div>
        </div>
      </div>
      
      {/* New: Delivery Rate Comparison Section */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Delivery Success Comparison</CardTitle>
          <CardDescription>
            TrackScore significantly improves delivery success rate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">All Orders</span>
                <span className="font-medium">{normalDeliveryRate}% Success</span>
              </div>
              <Progress value={normalDeliveryRate} className="h-2 bg-slate-200" />
              <div className="text-xs text-slate-500">
                Without TrackScore, {normalDeliveryRate}% of orders are delivered successfully.
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-orange-500">With TrackScore</span>
                <span className="font-medium text-orange-500">{trackscoreDeliveryRate}% Success</span>
              </div>
              <Progress value={trackscoreDeliveryRate} className="h-2 bg-slate-200" indicatorClassName="bg-orange-500" />
              <div className="text-xs text-slate-500">
                With TrackScore, delivery success rate increases to {trackscoreDeliveryRate}%.
              </div>
            </div>
            
            <div className="mt-3 p-3 bg-green-50 border border-green-100 rounded-lg">
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-sm font-medium text-green-700">
                  {deliveryRateImprovement}% improvement in delivery success rate
                </span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                This improvement leads to higher customer satisfaction, fewer returns, and better cash flow.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Updated Chart using ChartContainer */}
      <div className="h-96 mb-6 bg-white border border-slate-100 rounded-lg p-4">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-cartesian-grid-horizontal_line]:stroke-slate-200 [&_.recharts-cartesian-grid-vertical_line]:stroke-slate-200 [&_.recharts-cartesian-axis-tick-value]:fill-slate-500 [&_.recharts-reference-line_line]:stroke-slate-300"
        >
          <LineChart data={cashflowData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F1F1" />
            <XAxis 
              dataKey="day" 
              stroke="#8E9196"
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={false}
              dy={10}
              label={{ 
                value: 'Days', 
                position: 'insideBottomRight', 
                offset: -15, 
                fill: '#8E9196',
                fontSize: 12
              }}
            />
            <YAxis 
              stroke="#8E9196"
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={false}
              tickFormatter={(value) => formatCurrency(value)}
              dx={-10}
              label={{ 
                value: 'Cashflow (₹)', 
                angle: -90, 
                position: 'insideLeft', 
                offset: 10, 
                fill: '#8E9196',
                fontSize: 12
              }}
            />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend 
              align="center" 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              iconSize={8}
              formatter={(value) => <span className="text-sm font-medium">{value}</span>}
            />
            <ReferenceLine y={0} stroke="#8E9196" strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey="normal"
              name="all"
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
              animationDuration={500}
            />
            <Line
              type="monotone"
              dataKey="trackscore"
              name="trackscore"
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
              animationDuration={500}
            />
          </LineChart>
        </ChartContainer>
      </div>
      
      <div className="bg-slate-50 p-3 rounded-lg mb-6">
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium">
          <div className="p-1 border-r">Week</div>
          <div className="p-1">Mon</div>
          <div className="p-1 bg-blue-50">Tue</div>
          <div className="p-1">Wed</div>
          <div className="p-1">Thu</div>
          <div className="p-1 bg-blue-50">Fri</div>
          <div className="p-1">Sat</div>
        </div>
        <div className="mt-1 flex justify-between px-4">
          <div className="text-xs text-blue-600">
            <span className="font-medium">Tuesday:</span> D+2 COD Remittance
          </div>
          <div className="text-xs text-blue-600">
            <span className="font-medium">Friday:</span> D+2 COD Remittance
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-100">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900">
                Metric
              </th>
              <th scope="col" className="px-4 py-3.5 text-center text-sm font-semibold text-slate-700">
                ALL
              </th>
              <th scope="col" className="px-4 py-3.5 text-center text-sm font-semibold text-orange-500">
                WITH TRACKSCORE
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {performanceMetrics.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm font-medium text-slate-900 flex items-center">
                  {item.metric}
                  {item.info && (
                    <TooltipProvider>
                      <UITooltip>
                        <TooltipTrigger className="ml-2">
                          <Info className="w-4 h-4 text-slate-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">{item.info}</p>
                        </TooltipContent>
                      </UITooltip>
                    </TooltipProvider>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-center text-slate-600">
                  {item.normal}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-center font-medium text-orange-500 bg-orange-50/50">
                  <div className="flex items-center justify-center">
                    {item.trackscore}
                    {['Breakeven Day', 'Inventory Required'].includes(item.metric) ? (
                      <TrendingDown className="w-4 h-4 text-green-500 ml-1" />
                    ) : (
                      <TrendingUp className="w-4 h-4 text-green-500 ml-1" />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 pt-4 border-t">
        <div className="flex justify-center">
          <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 max-w-md text-center">
            <h4 className="font-semibold text-orange-500 mb-2">TrackScore Shipping Advantage</h4>
            <p className="text-sm text-slate-600">
              With TrackScore, you break even 4 days earlier than normal shipping with 40% less inventory 
              requirement and generate 40% more profit by the end of the 30-day period.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashflowComparison;
