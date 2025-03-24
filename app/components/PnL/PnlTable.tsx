
import React, { useState } from 'react';
import { format, getDaysInMonth } from 'date-fns';
import { Check, Circle, Eye } from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Button } from "../ui/button";
import PnlDetails from './PnlDetails';
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";

interface PnlTableProps {
  currentDate: Date;
}

// Helper function to get dates for the current month
const getDatesInMonth = (date: Date) => {
  const daysInMonth = getDaysInMonth(date);
  const year = date.getFullYear();
  const month = date.getMonth();
  
  return Array.from({ length: daysInMonth }, (_, i) => {
    return new Date(year, month, i + 1);
  });
};

// Mock data generation - in a real app this would come from an API
const generateData = (date: Date) => {
  const dayNumber = date.getDate();
  
  // Make dates verified through March 30th
  const isVerified = date.getDate() <= 30 && date.getMonth() === 2; // March is month 2 (0-indexed)
  
  // TrackScore is active for dates from March 15th to 30th (just as an example)
  const isTrackScoreActive = isVerified && date.getDate() >= 15;
  
  // Define metrics based on TrackScore activation status
  const deliveryRate = isTrackScoreActive ? 65 : 56;
  const netProfit = isTrackScoreActive ? 19000 : 15000;
  const inventoryUsed = isTrackScoreActive ? 35 : 50;
  
  // Generate detailed mock data for the full PnL view
  const detailedData = {
    ordersShipped: 1000 + (dayNumber * 10),
    deliveredOrders: isVerified ? Math.round((1000 + (dayNumber * 10)) * (deliveryRate/100)) : null,
    rtoOrders: isVerified ? Math.round((1000 + (dayNumber * 10)) * ((100-deliveryRate)/100)) : null,
    deliveryPercentage: isVerified ? deliveryRate : null,
    rtoRate: 100 - deliveryRate,
    mrp: 1000,
    productCost: 200,
    shippingCost: 80,
    packagingCost: 20,
    costOfRto: 60,
    totalRevenue: (1000 + (dayNumber * 10)) * 1000,
    totalProductCost: (1000 + (dayNumber * 10)) * 200,
    totalShippingCost: (1000 + (dayNumber * 10)) * 80,
    totalPackagingCost: (1000 + (dayNumber * 10)) * 20,
    totalCostOfRto: isVerified ? Math.round((1000 + (dayNumber * 10)) * ((100-deliveryRate)/100)) * 60 : null,
    totalCogs: isVerified ? 
      ((1000 + (dayNumber * 10)) * 200) + 
      ((1000 + (dayNumber * 10)) * 80) + 
      ((1000 + (dayNumber * 10)) * 20) + 
      (Math.round((1000 + (dayNumber * 10)) * ((100-deliveryRate)/100)) * 60) : null,
    grossProfit: isVerified ? 
      ((1000 + (dayNumber * 10)) * 1000) - 
      (((1000 + (dayNumber * 10)) * 200) + 
      ((1000 + (dayNumber * 10)) * 80) + 
      ((1000 + (dayNumber * 10)) * 20) + 
      (Math.round((1000 + (dayNumber * 10)) * ((100-deliveryRate)/100)) * 60)) : null,
    netProfit: isVerified ? netProfit : null,
    netProfitPerOrder: isVerified ? 
      (netProfit) / (1000 + (dayNumber * 10)) : null,
    inventoryUsed: isVerified ? inventoryUsed : null,
  };
  
  return {
    date,
    deliveryRate,
    netProfit,
    inventoryUsed,
    isVerified,
    isTrackScoreActive,
    detailedData
  };
};

const PnlTable: React.FC<PnlTableProps> = ({ currentDate }) => {
  const dates = getDatesInMonth(currentDate);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Generate table data and sort in descending order by date (latest first)
  const tableData = dates
    .map(date => generateData(date))
    .sort((a, b) => b.date.getTime() - a.date.getTime());
  
  const handleShowPnl = (date: Date) => {
    setSelectedDate(date);
  };
  
  const handleClosePnl = () => {
    setSelectedDate(null);
  };

  // Check if there's any TrackScore active data
  const hasActiveData = tableData.some(data => data.isTrackScoreActive && data.isVerified);
  
  // Calculate improvement percentages if we have both active and non-active data
  const calculateImprovements = () => {
    const activeData = tableData.find(data => data.isTrackScoreActive && data.isVerified);
    const nonActiveData = tableData.find(data => !data.isTrackScoreActive && data.isVerified);
    
    if (activeData && nonActiveData) {
      const profitImprovement = ((activeData.netProfit - nonActiveData.netProfit) / nonActiveData.netProfit) * 100;
      const inventorySavings = ((nonActiveData.inventoryUsed - activeData.inventoryUsed) / nonActiveData.inventoryUsed) * 100;
      
      return {
        profitImprovement: Math.round(profitImprovement),
        inventorySavings: Math.round(inventorySavings)
      };
    }
    
    return null;
  };
  
  const improvements = calculateImprovements();

  // Calculate month summary stats
  const calculateMonthSummary = () => {
    const activeItems = tableData.filter(data => data.isTrackScoreActive && data.isVerified);
    const nonActiveItems = tableData.filter(data => !data.isTrackScoreActive && data.isVerified);
    
    if (activeItems.length > 0 && nonActiveItems.length > 0) {
      const totalExtraProfit = activeItems.reduce((sum, item) => sum + (item.netProfit - 15000), 0);
      const totalInventorySaved = activeItems.reduce((sum, item) => sum + (50 - item.inventoryUsed), 0);
      const averageDeliveryRateActive = activeItems.reduce((sum, item) => sum + item.deliveryRate, 0) / activeItems.length;
      const averageDeliveryRateNonActive = nonActiveItems.reduce((sum, item) => sum + item.deliveryRate, 0) / nonActiveItems.length;
      const deliveryRateImprovement = averageDeliveryRateActive - averageDeliveryRateNonActive;
      
      return {
        extraProfit: totalExtraProfit,
        inventorySaved: totalInventorySaved,
        deliveryRateImprovement: Math.round(deliveryRateImprovement)
      };
    }
    
    return null;
  };

  const monthSummary = calculateMonthSummary();
  
  return (
    <>
      {selectedDate && (
        <PnlDetails 
          data={tableData.find(data => data.date.getTime() === selectedDate.getTime())?.detailedData} 
          date={selectedDate}
          onClose={handleClosePnl}
        />
      )}
      
      {!hasActiveData && (
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <AlertTitle className="text-blue-700">Data Availability Note</AlertTitle>
          <AlertDescription className="text-blue-600">
            Yet to arrive data will be filled when orders are actually delivered on the date of delivery.
          </AlertDescription>
        </Alert>
      )}
      
      {improvements && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <AlertTitle className="text-green-700 font-bold text-lg">Congratulations!</AlertTitle>
          <AlertDescription className="text-green-600">
            You are making {improvements.profitImprovement}% more profit and using {improvements.inventorySavings}% less inventory. Kudos!
          </AlertDescription>
        </Alert>
      )}
      
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm mb-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Delivery Rate %
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Net Profit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Inventory Used
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {tableData.map((data) => (
                <tr key={format(data.date, 'yyyy-MM-dd')} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {format(data.date, 'dd MMM yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {data.isVerified ? (
                      <div className="font-medium text-green-500">
                        {data.deliveryRate}%
                      </div>
                    ) : (
                      <span className="text-slate-400">Yet to arrive</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {data.isVerified ? (
                      <div className="font-medium text-blue-600">
                        ₹{data.netProfit.toLocaleString()}
                      </div>
                    ) : (
                      <span className="text-slate-400">Yet to arrive</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {data.isVerified ? (
                      <div className="font-medium text-purple-600">
                        {data.inventoryUsed} units
                      </div>
                    ) : (
                      <span className="text-slate-400">Yet to arrive</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex items-center">
                            {data.isVerified ? (
                              data.isTrackScoreActive ? (
                                <Circle className={cn("w-4 h-4 text-green-500 fill-green-500")} />
                              ) : (
                                <Circle className={cn("w-4 h-4 text-red-500 fill-red-500")} />
                              )
                            ) : (
                              <Circle className="w-4 h-4 text-slate-300" />
                            )}
                            <span className="ml-2">{data.isVerified ? (data.isTrackScoreActive ? 'TrackScore Active' : 'TrackScore Not Active') : 'Pending'}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {data.isVerified 
                              ? (data.isTrackScoreActive 
                                ? 'TrackScore is active and optimizing your orders' 
                                : 'TrackScore is not active. Download the application to activate')
                              : 'Waiting for delivery confirmation'
                            }
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleShowPnl(data.date)}
                      className="flex items-center text-blue-600"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Show Full PnL
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default PnlTable;

