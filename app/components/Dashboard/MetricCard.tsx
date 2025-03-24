
import React from 'react';
import { Info } from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface MetricCardProps {
  title: string;
  value: number | string;
  suffix?: string;
  variant?: 'default' | 'highlight' | 'warning' | 'success';
  showInfoButton?: boolean;
  infoText?: string;
  className?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  change?: number;
  previousValue?: number;
  children?: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  suffix,
  variant = 'default',
  showInfoButton = false,
  infoText = 'Additional information',
  className,
  onClick,
  icon,
  change,
  previousValue,
  children
}) => {
  const variantStyles = {
    default: 'bg-white text-slate-700',
    highlight: 'bg-white text-trackscore-blue',
    warning: 'bg-white text-trackscore-warning',
    success: 'bg-white text-trackscore-success',
  };
  
  return (
    <div 
      className={cn(
        "glass-card relative p-5 flex flex-col justify-between animate-slide-up",
        variantStyles[variant],
        onClick && "cursor-pointer hover:shadow-medium",
        className
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <h3 className="text-sm text-slate-500 font-medium uppercase tracking-wide mb-1">{title}</h3>
        
        {icon && (
          <div className="flex-shrink-0 mr-2">
            {icon}
          </div>
        )}
      </div>
      
      <div className="flex items-baseline mt-3">
        <span className="text-4xl font-bold tracking-tight">
          {value}
        </span>
        {suffix && (
          <span className="ml-1 text-xl text-slate-500">{suffix}</span>
        )}
      </div>
      
      {/* Display change if provided */}
      {change !== undefined && previousValue !== undefined && (
        <div className="flex items-center mt-2">
          <span className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
          <span className="ml-2 text-xs text-slate-500">vs. {previousValue}{suffix}</span>
        </div>
      )}
      
      {/* Render children if provided */}
      {children}
      
      {showInfoButton && (
        <button className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors duration-200">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-5 h-5" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">{infoText}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </button>
      )}
      
      {onClick && !children && (
        <button className="mt-4 text-sm font-medium text-trackscore-blue hover:text-trackscore-highlight transition-colors duration-200">
          SHOW INFO
        </button>
      )}
    </div>
  );
};

export default MetricCard;
