
import React from 'react';
import { format } from 'date-fns';

interface PnlSummaryProps {
  currentDate: Date;
}

const PnlSummary: React.FC<PnlSummaryProps> = ({ currentDate }) => {
  // Calculate month statistics based on TrackScore activation
  // In a real app, this would come from an API
  const calculateMonthStats = () => {
    // Sample data for March 2025
    if (currentDate.getMonth() === 2 && currentDate.getFullYear() === 2025) {
      return {
        totalExtraProfit: 64000,
        inventorySaved: 240,
        deliveryRateImprovement: 9
      };
    }
    
    // Default fallback data for other months
    return {
      totalExtraProfit: 50000,
      inventorySaved: 200,
      deliveryRateImprovement: 8
    };
  };
  
  const monthStats = calculateMonthStats();
  
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-800">
          Real Profit and Loss Sheet
        </h2>
        <p className="text-slate-500 mt-1">
          Track your performance with TrackScore and without TrackScore
        </p>
      </div>
      
      <h3 className="text-xl font-semibold text-trackscore-text">
        Monthly Summary: {format(currentDate, 'MMMM yyyy')}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg border border-green-100 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Total Extra Net Profit</h3>
          <p className="text-2xl font-bold text-green-600">₹{monthStats.totalExtraProfit.toLocaleString()}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Total Inventory Saved</h3>
          <p className="text-2xl font-bold text-blue-600">{monthStats.inventorySaved} units</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-purple-100 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Delivery Rate Improvement</h3>
          <p className="text-2xl font-bold text-purple-600">+{monthStats.deliveryRateImprovement}%</p>
        </div>
      </div>
    </div>
  );
};

export default PnlSummary;
