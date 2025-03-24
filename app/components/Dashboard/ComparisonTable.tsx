
import React, { useState } from 'react';
import { ArrowUp, TrendingUp, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface MetricRowProps {
  impact: string;
  description: string;
  icon?: React.ReactNode;
}

const MetricRow: React.FC<MetricRowProps> = ({ impact, description, icon }) => {
  return (
    <tr className="hover:bg-slate-50 transition-colors duration-200">
      <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-medium text-slate-900 flex items-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center">
                <span className="font-medium text-slate-900">
                  {impact}
                </span>
                {icon || <TrendingUp className="w-4 h-4 text-trackscore-success ml-1.5" />}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </td>
    </tr>
  );
};

const ComparisonTable: React.FC = () => {
  const [dateRange, setDateRange] = useState<string>("today");
  
  const getTimeframeLabel = () => {
    switch(dateRange) {
      case "yesterday": return "per day";
      case "7days": return "per week";
      case "30days": return "per month";
      case "lifetime": return "lifetime";
      default: return "per day";
    }
  };

  const timeframeLabel = getTimeframeLabel();
  
  const data = [
    {
      impact: `Reduced RTO by 10% (${timeframeLabel})`,
      description: "Decreased from 25% to 15%, significantly improving delivery success rate",
      icon: <TrendingUp className="w-4 h-4 text-trackscore-success ml-1.5" />
    },
    {
      impact: `Saved ₹60,000 in RTO reverse costs (${timeframeLabel})`,
      description: "Reduced from ₹1,50,000/month to ₹90,000/month in reverse logistics costs",
      icon: <ArrowUp className="w-4 h-4 text-trackscore-success ml-1.5" />
    },
    {
      impact: `Reduced inventory usage by 750 units (${timeframeLabel})`,
      description: "Optimized from 3000 units to 2250 units through better order selection",
      icon: <TrendingUp className="w-4 h-4 text-trackscore-success ml-1.5" />
    },
    {
      impact: `Freed up capital of ₹1,50,000 (${timeframeLabel})`,
      description: "Released capital from ₹6,00,000 to ₹4,50,000 tied in inventory",
      icon: <ArrowUp className="w-4 h-4 text-trackscore-success ml-1.5" />
    },
    {
      impact: `Increased net profit by ₹40/order (${timeframeLabel})`,
      description: "Improved from ₹100/order to ₹140/order through reduced returns",
      icon: <TrendingUp className="w-4 h-4 text-trackscore-success ml-1.5" />
    }
  ];

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Business Impact</h3>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="yesterday">Yesterday</SelectItem>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="lifetime">Lifetime</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="overflow-x-auto -mx-6">
        <div className="inline-block min-w-full align-middle px-6">
          <div className="overflow-hidden border border-slate-200 rounded-lg">
            <table className="min-w-full divide-y divide-slate-200">
              <tbody className="divide-y divide-slate-200 bg-white">
                {data.map((item, index) => (
                  <MetricRow 
                    key={index}
                    impact={item.impact}
                    description={item.description}
                    icon={item.icon}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonTable;
