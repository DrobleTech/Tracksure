import React, { useState, useEffect } from 'react';
import { Info, Calendar, Target, TrendingUp, TrendingDown, ArrowUp, CircleCheck } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer
} from 'recharts';
import {
  TooltipProvider,
  Tooltip as UITooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui/tooltip";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import { Progress } from "../ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { cn } from "../../lib/utils";

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

const loadFinancialData = () => {
  const storedData = localStorage.getItem('financialData');
  if (storedData) {
    try {
      return JSON.parse(storedData);
    } catch (error) {
      console.error('Error parsing financial data:', error);
    }
  }
  
  return {
    mrp: '1500',
    productCost: '900',
    marketingCost: '200',
    shippingCost: '80',
    packagingCost: '30',
    rtoCost: '120'
  };
};

const generateGoalBasedCashflowData = (ordersPerDay: number) => {
  const basePattern = [
    { day: 1, base: -20000 },
    { day: 2, base: -30000 },
    { day: 3, base: -35000 },
    { day: 4, base: -65000 },
    { day: 5, base: -40000 },
    { day: 6, base: -20000 },
    { day: 7, base: -15000 },
    { day: 8, base: -10000 },
    { day: 9, base: 30000 },
    { day: 10, base: 40000 },
    { day: 11, base: 65000 },
    { day: 12, base: 60000 },
    { day: 13, base: 60000 },
    { day: 14, base: 50000 },
    { day: 15, base: 110000 },
    { day: 16, base: 95000 },
    { day: 17, base: 90000 },
    { day: 18, base: 120000 },
    { day: 19, base: 140000 },
    { day: 20, base: 130000 },
    { day: 21, base: 110000 },
    { day: 22, base: 175000 },
    { day: 23, base: 165000 },
    { day: 24, base: 150000 },
    { day: 25, base: 170000 },
    { day: 26, base: 210000 },
    { day: 27, base: 205000 },
    { day: 28, base: 200000 },
    { day: 29, base: 190000 },
    { day: 30, base: 240000 },
  ];

  const scaleFactor = (ordersPerDay / 100);
  const financialData = loadFinancialData();
  
  const successfulOrderProfit = financialData.mrp - financialData.productCost - 
                              financialData.marketingCost - financialData.shippingCost - 
                              financialData.packagingCost;
  
  const failedOrderLoss = financialData.shippingCost + financialData.rtoCost + 
                         financialData.packagingCost + financialData.marketingCost;
                         
  const trackscoreDeliveryRate = 0.92; // 92% with TrackScore vs 75% normal
  const trackscoreShippingDiscount = 0.85; // 15% less shipping cost
  
  return basePattern.map(item => {
    if (item.base < 0) {
      const normalValue = Math.round(item.base * scaleFactor);
      const goalValue = Math.round(normalValue * (0.75 + Math.random() * 0.1));
      return {
        day: item.day,
        normal: normalValue,
        goal: goalValue,
        isRemittanceDay: (item.day - 2) % 7 === 0 || (item.day - 5) % 7 === 0
      };
    } else {
      const normalValue = Math.round(item.base * scaleFactor);
      const profitMultiplier = 1.15 + (trackscoreDeliveryRate - 0.75) + (1 - trackscoreShippingDiscount);
      const goalValue = Math.round(normalValue * (profitMultiplier + Math.random() * 0.1));
      return {
        day: item.day,
        normal: normalValue,
        goal: goalValue, 
        isRemittanceDay: (item.day - 2) % 7 === 0 || (item.day - 5) % 7 === 0
      };
    }
  });
};

const calculateGoalMetrics = (ordersPerDay: number) => {
  const financialData = loadFinancialData();
  
  const breakeven = Math.max(10, Math.round(18 - (ordersPerDay - 100) / 25));
  
  const inventoryRequired = Math.round(financialData.productCost * ordersPerDay * 2); // 2 days of inventory
  
  const successfulOrderProfit = financialData.mrp - financialData.productCost - 
                              financialData.marketingCost - financialData.shippingCost - 
                              financialData.packagingCost;
  
  const failedOrderLoss = financialData.shippingCost + financialData.rtoCost + 
                         financialData.packagingCost + financialData.marketingCost;
                         
  const profit15Days = (ordersPerDay * 15 * 0.75 * successfulOrderProfit) - 
                     (ordersPerDay * 15 * 0.25 * failedOrderLoss) - 
                     (inventoryRequired * 0.5); // Half of inventory cost
  
  const profit30Days = (ordersPerDay * 30 * 0.75 * successfulOrderProfit) - 
                     (ordersPerDay * 30 * 0.25 * failedOrderLoss) - 
                     inventoryRequired; // Full inventory cost
  
  return [
    {
      metric: 'Breakeven Day',
      normal: '18 days',
      goal: `${breakeven} days`,
      improvement: 18 - breakeven,
      info: 'Number of days to recover initial investment'
    },
    {
      metric: 'Inventory Required',
      normal: formatCurrency(200000),
      goal: formatCurrency(inventoryRequired),
      improvement: inventoryRequired - 200000,
      info: 'Capital tied up in inventory'
    },
    {
      metric: 'Net Profit (15 days)',
      normal: formatCurrency(-80000),
      goal: formatCurrency(Math.round(profit15Days)),
      improvement: Math.round(profit15Days) - (-80000),
      info: 'Profit/loss after 15 days'
    },
    {
      metric: 'Net Profit (30 days)',
      normal: formatCurrency(450000),
      goal: formatCurrency(Math.round(profit30Days)),
      improvement: Math.round(profit30Days) - 450000,
      info: 'Profit/loss after 30 days'
    },
  ];
};

const calculateBusinessImpact = (ordersPerDay: number) => {
  const financialData = loadFinancialData();
  const scaleFactor = ordersPerDay / 100;
  
  const inventorySavedPercentage = 0.36; // 36% inventory reduction
  const shippingCostSavingPercentage = 0.15; // 15% shipping cost reduction
  const rtoReductionPercentage = 0.50; // 50% RTO reduction
  
  const inventorySaved = Math.round(ordersPerDay * inventorySavedPercentage);
  const forwardShipping = Math.round(financialData.shippingCost * ordersPerDay * shippingCostSavingPercentage);
  const reverseShipping = Math.round(financialData.rtoCost * ordersPerDay * 0.25 * rtoReductionPercentage); // 25% normal RTO rate
  const packagingCosts = Math.round(financialData.packagingCost * ordersPerDay * 0.25 * rtoReductionPercentage); // Packaging saved from RTO reduction
  
  return {
    inventorySaved,
    forwardShipping,
    reverseShipping,
    packagingCosts,
    totalSavings: forwardShipping + reverseShipping + packagingCosts
  };
};

const CashflowGoalForecast: React.FC = () => {
  const [ordersPerDay, setOrdersPerDay] = useState<number>(100);
  const [tempOrdersPerDay, setTempOrdersPerDay] = useState<string>("100");
  const [cashflowData, setCashflowData] = useState(generateGoalBasedCashflowData(100));
  const [metrics, setMetrics] = useState(calculateGoalMetrics(100));
  const [businessImpact, setBusinessImpact] = useState(calculateBusinessImpact(100));
  const [financialData, setFinancialData] = useState(loadFinancialData());
  
  const normalDeliveryRate = 75; // 75% without TrackScore
  const trackscoreDeliveryRate = 92; // 92% with TrackScore
  
  useEffect(() => {
    setFinancialData(loadFinancialData());
    setCashflowData(generateGoalBasedCashflowData(ordersPerDay));
    setMetrics(calculateGoalMetrics(ordersPerDay));
    setBusinessImpact(calculateBusinessImpact(ordersPerDay));
    
    const handleStorageChange = () => {
      setFinancialData(loadFinancialData());
      setCashflowData(generateGoalBasedCashflowData(ordersPerDay));
      setMetrics(calculateGoalMetrics(ordersPerDay));
      setBusinessImpact(calculateBusinessImpact(ordersPerDay));
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [ordersPerDay]);
  
  const normalColor = "#ea384c";
  const goalColor = "#33C3F0";
  
  const handleOrdersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempOrdersPerDay(e.target.value);
  };
  
  const handleSliderChange = (value: number[]) => {
    const newValue = value[0];
    setOrdersPerDay(newValue);
    setTempOrdersPerDay(newValue.toString());
    setCashflowData(generateGoalBasedCashflowData(newValue));
    setMetrics(calculateGoalMetrics(newValue));
    setBusinessImpact(calculateBusinessImpact(newValue));
  };
  
  const applyOrdersGoal = () => {
    const newValue = parseInt(tempOrdersPerDay) || 100;
    const clampedValue = Math.max(50, Math.min(10000, newValue));
    setOrdersPerDay(clampedValue);
    setTempOrdersPerDay(clampedValue.toString());
    setCashflowData(generateGoalBasedCashflowData(clampedValue));
    setMetrics(calculateGoalMetrics(clampedValue));
    setBusinessImpact(calculateBusinessImpact(clampedValue));
  };
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dayData = cashflowData.find(d => d.day === label);
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-md shadow-md">
          <p className="font-semibold">Day {label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey === 'normal' ? 'All Shipping: ' : 'TrackScore: '}
              <span className="font-medium">{formatCurrency(entry.value)}</span>
            </p>
          ))}
          {dayData?.isRemittanceDay && (
            <p className="text-xs mt-1 text-blue-600 font-medium">COD Remittance Day</p>
          )}
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="glass-card p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold text-trackscore-text">Goal-Based Cashflow Forecast</h2>
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger className="ml-2">
                <Info className="w-4 h-4 text-slate-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm max-w-xs">
                  Set a daily order goal to see how it impacts your cashflow. The forecast is based on your current patterns but scaled to meet your goal.
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
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center">
            <Target className="w-4 h-4 mr-2 text-orange-500" />
            Set Order Goal
          </CardTitle>
          <CardDescription>
            Define your daily orders target to see the projected cashflow impact
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex items-center gap-2 w-full md:w-1/3">
                <Input
                  type="number"
                  value={tempOrdersPerDay}
                  onChange={handleOrdersChange}
                  className="w-full"
                  min={50}
                  max={10000}
                />
                <span className="text-sm whitespace-nowrap">orders/day</span>
                <Button 
                  onClick={applyOrdersGoal} 
                  size="sm" 
                  className="whitespace-nowrap"
                >
                  Apply
                </Button>
              </div>
              
              <div className="w-full md:w-2/3 px-2">
                <Slider
                  value={[ordersPerDay]}
                  onValueChange={handleSliderChange}
                  min={50}
                  max={10000}
                  step={50}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>50</span>
                  <span>5,000</span>
                  <span>10,000</span>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-orange-50 border border-orange-100 rounded-md">
              <p className="text-sm text-orange-700 flex items-center">
                <ArrowUp className="w-4 h-4 mr-2 text-orange-500" />
                <span>
                  Current goal is set to <strong>{ordersPerDay.toLocaleString()} orders per day</strong>, which is <strong>{Math.round(ordersPerDay/100*100)}%</strong> of your baseline (100 orders/day).
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="h-96 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={cashflowData}
            margin={{
              top: 10,
              right: 30,
              left: 20,
              bottom: 10,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="day" 
              label={{ value: 'Days', position: 'insideBottomRight', offset: -10 }}
            />
            <YAxis 
              label={{ value: 'Cashflow (₹)', angle: -90, position: 'insideLeft' }}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <ReferenceLine y={0} stroke="#000" strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey="normal"
              stroke={normalColor}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 8 }}
              name="All Shipping"
            />
            <Line
              type="monotone"
              dataKey="goal"
              stroke={goalColor}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 8 }}
              name="TrackScore"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex justify-between items-center px-4 py-2 bg-slate-50 rounded-lg mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: normalColor }} />
          <span className="text-sm font-medium">All Shipping</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: goalColor }} />
          <span className="text-sm font-medium">TrackScore ({ordersPerDay} orders/day)</span>
        </div>
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
      
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Business Impact at {ordersPerDay} Orders/Day</CardTitle>
          <CardDescription>
            Projected savings and resources optimized at your target order volume
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-full bg-purple-100">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                </div>
                <div className="text-sm text-slate-500">Inventory Saved</div>
              </div>
              <div className="text-2xl font-bold text-purple-700">{businessImpact.inventorySaved}</div>
              <div className="text-xs text-slate-400 mt-1">units per day</div>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-full bg-blue-100">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-sm text-slate-500">Forward Shipping Saved</div>
              </div>
              <div className="text-2xl font-bold text-blue-700">₹{businessImpact.forwardShipping.toLocaleString()}</div>
              <div className="text-xs text-slate-400 mt-1">per day</div>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-full bg-red-100">
                  <TrendingUp className="w-4 h-4 text-red-500" />
                </div>
                <div className="text-sm text-slate-500">Reverse Shipping Saved</div>
              </div>
              <div className="text-2xl font-bold text-red-700">₹{businessImpact.reverseShipping.toLocaleString()}</div>
              <div className="text-xs text-slate-400 mt-1">per day</div>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-full bg-teal-100">
                  <TrendingUp className="w-4 h-4 text-teal-500" />
                </div>
                <div className="text-sm text-slate-500">Packaging Costs Saved</div>
              </div>
              <div className="text-2xl font-bold text-teal-700">₹{businessImpact.packagingCosts.toLocaleString()}</div>
              <div className="text-xs text-slate-400 mt-1">per day</div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-lg">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center gap-3 mb-2 md:mb-0">
                <div className="p-2 rounded-full bg-green-100">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-green-700">Total Daily Savings</div>
                  <div className="text-2xl font-bold text-green-800">
                    ₹{businessImpact.totalSavings.toLocaleString()} + {businessImpact.inventorySaved} inventory units
                  </div>
                </div>
              </div>
              <div className="bg-white px-4 py-2 rounded-full border border-green-200">
                <span className="text-sm font-semibold text-green-700">
                  {Math.round((ordersPerDay/100 - 1) * 100)}% {ordersPerDay >= 100 ? 'increase' : 'decrease'} from baseline
                </span>
              </div>
            </div>
            <p className="text-sm text-green-700 mt-3 italic">
              *That's approximately ₹{(businessImpact.totalSavings * 30).toLocaleString()} value saved + {businessImpact.inventorySaved * 30} inventory units saved per month
            </p>
          </div>
        </CardContent>
      </Card>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-100">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900">
                Metric
              </th>
              <th scope="col" className="px-4 py-3.5 text-center text-sm font-semibold text-slate-700">
                CURRENT
              </th>
              <th scope="col" className="px-4 py-3.5 text-center text-sm font-semibold text-orange-500">
                GOAL FORECAST
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {metrics.map((item, index) => (
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
                    {item.goal}
                    {item.metric === 'Breakeven Day' ? (
                      <TrendingDown className="w-4 h-4 text-green-500 ml-1" />
                    ) : item.metric === 'Inventory Required' ? (
                      <TrendingUp className="w-4 h-4 text-blue-500 ml-1" />
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
            <h4 className="font-semibold text-orange-500 mb-2">Goal-Based Forecast Impact</h4>
            <p className="text-sm text-slate-600">
              Setting a goal of {ordersPerDay} orders per day would {ordersPerDay > 100 ? 'increase' : 'decrease'} your profit after 30 days 
              to approximately ₹{Math.round(450000 * (ordersPerDay / 100)).toLocaleString()}, which is {ordersPerDay > 100 ? `${Math.round((ordersPerDay - 100))}% more than` : `${Math.round((100 - ordersPerDay))}% less than`} your current projection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashflowGoalForecast;
