
import React from 'react';
import { TrendingUp, ArrowUp, BadgeDollarSign, Package, Truck, Box, RefreshCcw } from 'lucide-react';

interface BusinessImpactCardProps {
  flaggedOrders: number;
  scaleBusinessOrders?: string;
}

const BusinessImpactCard: React.FC<BusinessImpactCardProps> = ({ flaggedOrders, scaleBusinessOrders = "220" }) => {
  // Get flagged orders value from props
  const inventorySavedCount = flaggedOrders;
  
  // Cost constants
  const forwardShippingCost = 80; // per inventory
  const reverseShippingCost = 60; // per inventory
  const packagingCost = 30; // per inventory
  
  // Calculate individual savings based on flagged orders
  const forwardShippingSaved = Math.round(inventorySavedCount * forwardShippingCost);
  const reverseShippingSaved = Math.round(inventorySavedCount * reverseShippingCost);
  const packagingCostsSaved = Math.round(inventorySavedCount * packagingCost);
  
  // Individual savings metrics - reordered as requested
  const savingsData = [
    {
      label: "Inventory Saved",
      value: `${inventorySavedCount.toString()} units`,
      icon: <Package className="w-5 h-5 text-purple-500" />,
      positive: true
    },
    {
      label: "Forward Shipping Costs Saved",
      value: `₹${forwardShippingSaved.toLocaleString('en-IN')}`,
      icon: <Truck className="w-5 h-5 text-blue-500" />,
      positive: true
    },
    {
      label: "Reverse Shipping Costs Saved",
      value: `₹${reverseShippingSaved.toLocaleString('en-IN')}`,
      icon: <RefreshCcw className="w-5 h-5 text-red-500" />,
      positive: true
    },
    {
      label: "Packaging Costs Saved",
      value: `₹${packagingCostsSaved.toLocaleString('en-IN')}`,
      icon: <Box className="w-5 h-5 text-teal-500" />,
      positive: true
    }
  ];

  // Calculate total savings (sum of all shipping and packaging costs)
  const totalCostSavings = forwardShippingSaved + reverseShippingSaved + packagingCostsSaved;
  const totalSavings = `₹${totalCostSavings.toLocaleString('en-IN')}`;
  
  // Calculate monthly values (daily values * 30)
  const monthlySavingsValue = totalCostSavings * 30;
  const monthlySavingsFormatted = monthlySavingsValue >= 100000 
    ? `₹${(monthlySavingsValue / 100000).toFixed(2)} lakhs` 
    : `₹${monthlySavingsValue.toLocaleString('en-IN')}`;
  const monthlyInventorySaved = inventorySavedCount * 30;

  return (
    <div className="bg-white rounded-lg shadow-soft p-6">
      <h3 className="text-xl font-semibold text-slate-900 mb-3">Today's Guaranteed Impact</h3>
      
      {/* Impact Headline - Updated to use scaleBusinessOrders from props */}
      <div className="mb-6 bg-soft-orange/30 border border-orange-200 rounded-lg p-4">
        <h4 className="text-lg font-bold text-orange-700 mb-1">Impact:</h4>
        <p className="text-orange-800">
          This is as equal as <span className="font-bold">{scaleBusinessOrders} orders per day</span>, but without any penny spent on marketing. 
          <span className="italic block mt-1">Choose quality over quantity.</span>
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        {savingsData.map((metric, index) => (
          <div
            key={index}
            className="flex items-start space-x-4 p-5 rounded-lg bg-slate-50/50 border border-slate-100 hover:shadow-soft transition-all duration-250"
          >
            <div className="p-3 rounded-lg bg-white shadow-sm">
              {metric.icon}
            </div>
            
            <div>
              <p className="text-sm font-medium text-slate-600">{metric.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {metric.value}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Total Savings Box - Updated headline and subheadline, removed comparison */}
      <div className="p-6 bg-green-50 border border-green-100 rounded-lg hover:shadow-soft transition-all duration-250">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-white shadow-sm">
              <BadgeDollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-base font-medium text-green-800">
                <span className="font-bold">Direct today's profits</span>
              </p>
              <p className="text-2xl font-bold text-green-900">{`${totalSavings} + ${inventorySavedCount} inventory saved per day`}</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-green-700 mt-3 italic">
          *That's {monthlySavingsFormatted} + {monthlyInventorySaved} inventory saved per month
        </p>
      </div>
    </div>
  );
};

export default BusinessImpactCard;
