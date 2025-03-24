
import React from 'react';
import { CalendarIcon, CheckIcon, X } from 'lucide-react';
import { format } from "date-fns";
import { cn } from '../../lib/utils';
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";

interface OrdersFiltersProps {
  threshold: number;
  filters: {
    dateRange: { from: Date | undefined; to: Date | undefined };
    onlyBelowThreshold: boolean;
    onlyAboveThreshold: boolean;
    orderStatus: string[];
    verificationStatus: string[];
    tags: string[];
  };
  onFilterChange: (filters: any) => void;
}

const OrdersFilters: React.FC<OrdersFiltersProps> = ({ 
  threshold,
  filters,
  onFilterChange
}) => {
  const handleReset = () => {
    onFilterChange({
      dateRange: { from: undefined, to: undefined },
      onlyBelowThreshold: false,
      onlyAboveThreshold: false,
      orderStatus: [],
      verificationStatus: [],
      tags: [],
    });
  };

  const toggleBelowThreshold = () => {
    onFilterChange({
      ...filters,
      onlyBelowThreshold: !filters.onlyBelowThreshold,
      // Can't have both below and above threshold at the same time
      onlyAboveThreshold: filters.onlyBelowThreshold ? filters.onlyAboveThreshold : false
    });
  };

  const toggleAboveThreshold = () => {
    onFilterChange({
      ...filters,
      onlyAboveThreshold: !filters.onlyAboveThreshold,
      // Can't have both below and above threshold at the same time
      onlyBelowThreshold: filters.onlyAboveThreshold ? filters.onlyBelowThreshold : false
    });
  };

  const updateOrderStatus = (status: string) => {
    const newStatus = filters.orderStatus.includes(status)
      ? filters.orderStatus.filter(s => s !== status)
      : [...filters.orderStatus, status];
    
    onFilterChange({
      ...filters,
      orderStatus: newStatus
    });
  };

  const updateVerificationStatus = (status: string) => {
    const newStatus = filters.verificationStatus.includes(status)
      ? filters.verificationStatus.filter(s => s !== status)
      : [...filters.verificationStatus, status];
    
    onFilterChange({
      ...filters,
      verificationStatus: newStatus
    });
  };

  const updateTags = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    
    onFilterChange({
      ...filters,
      tags: newTags
    });
  };

  return (
    <div className="glass-card p-5 mb-6 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-trackscore-text">Filters</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleReset}
          className="text-xs"
        >
          Reset All
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Date Range Filter */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1.5 block">Date Range</label>
          <div className="flex flex-col gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.dateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.from ? (
                    format(filters.dateRange.from, "PPP")
                  ) : (
                    <span>Start date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateRange.from}
                  onSelect={(date) => onFilterChange({
                    ...filters,
                    dateRange: { ...filters.dateRange, from: date }
                  })}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.dateRange.to && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.to ? (
                    format(filters.dateRange.to, "PPP")
                  ) : (
                    <span>End date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateRange.to}
                  onSelect={(date) => onFilterChange({
                    ...filters,
                    dateRange: { ...filters.dateRange, to: date }
                  })}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        {/* Quality Threshold Filter */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1.5 block">Quality Threshold ({threshold}%)</label>
          <div className="flex flex-col gap-2">
            <Button 
              variant={filters.onlyBelowThreshold ? "default" : "outline"}
              className="justify-start"
              onClick={toggleBelowThreshold}
            >
              {filters.onlyBelowThreshold && <CheckIcon className="mr-2 h-4 w-4" />}
              Below Threshold
            </Button>
            <Button 
              variant={filters.onlyAboveThreshold ? "default" : "outline"}
              className="justify-start"
              onClick={toggleAboveThreshold}
            >
              {filters.onlyAboveThreshold && <CheckIcon className="mr-2 h-4 w-4" />}
              Above Threshold
            </Button>
          </div>
        </div>
        
        {/* Order Status Filter */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1.5 block">Order Status</label>
          <div className="flex flex-wrap gap-2">
            {['Unshipped', 'Shipped', 'Delivered', 'Returned'].map((status) => (
              <Badge 
                key={status}
                variant={filters.orderStatus.includes(status) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => updateOrderStatus(status)}
              >
                {status}
                {filters.orderStatus.includes(status) && (
                  <X className="ml-1 h-3 w-3" onClick={(e) => {
                    e.stopPropagation();
                    updateOrderStatus(status);
                  }} />
                )}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Tags Filter */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1.5 block">Tags</label>
          <div className="flex flex-wrap gap-2">
            {['Fast Order', 'First Order', 'Second Order', 'Past Fraud'].map((tag) => (
              <Badge 
                key={tag}
                variant={filters.tags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => updateTags(tag)}
              >
                {tag}
                {filters.tags.includes(tag) && (
                  <X className="ml-1 h-3 w-3" onClick={(e) => {
                    e.stopPropagation();
                    updateTags(tag);
                  }} />
                )}
              </Badge>
            ))}
          </div>
        </div>
      </div>
      
      <Separator className="my-4" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Verification Status */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1.5 block">Verification Status</label>
          <div className="flex flex-wrap gap-2">
            {['OTP Verified', 'IVR Verified', 'Unverified'].map((status) => (
              <Badge 
                key={status}
                variant={filters.verificationStatus.includes(status) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => updateVerificationStatus(status)}
              >
                {status}
                {filters.verificationStatus.includes(status) && (
                  <X className="ml-1 h-3 w-3" onClick={(e) => {
                    e.stopPropagation();
                    updateVerificationStatus(status);
                  }} />
                )}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersFilters;
