
import React from 'react';
import { X } from 'lucide-react';

interface PnlData {
  revenue: number;
  orders: number;
  rtoCount: number;
  rtoRate: number;
  costs: {
    inventoryCost: number;
    forwardShipping: number;
    reverseShipping: number;
    packaging: number;
    storage: number;
    marketingCost: number;
    operationsCost: number;
    total: number;
  };
  totalCosts: number;
  profit: number;
  profitMargin: number;
}

interface PnlBreakdownProps {
  data: {
    shippingAll?: PnlData;
    scalingBusiness?: PnlData;
    trackscoreShipping?: PnlData;
  };
  selectedColumn: 'shippingAll' | 'scalingBusiness' | 'trackscoreShipping';
  onClose: () => void;
}

const PnlBreakdown: React.FC<PnlBreakdownProps> = ({ data, selectedColumn, onClose }) => {
  // Get the selected data
  const selectedData = data[selectedColumn];
  if (!selectedData) return null;
  
  // Format currency values
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Get column title
  const getColumnTitle = () => {
    switch (selectedColumn) {
      case 'shippingAll':
        return 'Ship All Orders';
      case 'scalingBusiness':
        return 'Scale Business (Better)';
      case 'trackscoreShipping':
        return 'TrackScore Shipping (Best)';
      default:
        return '';
    }
  };
  
  // Get theme color based on column
  const getThemeColor = () => {
    switch (selectedColumn) {
      case 'shippingAll':
        return 'blue';
      case 'scalingBusiness':
        return 'purple';
      case 'trackscoreShipping':
        return 'green';
      default:
        return 'blue';
    }
  };
  
  const themeColor = getThemeColor();
  
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-auto">
        <div className={`px-6 py-4 border-b flex justify-between items-center bg-${themeColor}-50`}>
          <h2 className={`text-xl font-bold text-${themeColor}-700`}>
            {getColumnTitle()} - Detailed PnL Breakdown
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 transition-all"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Business Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Orders per Day:</span>
                  <span className="font-semibold">{selectedData.orders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">RTO Count:</span>
                  <span className="font-semibold">{selectedData.rtoCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">RTO Rate:</span>
                  <span className="font-semibold">{selectedData.rtoRate}%</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                  <span className="text-slate-600">Average Order Value:</span>
                  <span className="font-semibold">{formatCurrency(selectedData.revenue / selectedData.orders)}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Revenue & Profit</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Revenue:</span>
                  <span className="font-semibold">{formatCurrency(selectedData.revenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Costs:</span>
                  <span className="font-semibold text-red-600">{formatCurrency(selectedData.totalCosts)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                  <span className="text-slate-600">Net Profit:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(selectedData.profit)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Profit Margin:</span>
                  <span className="font-semibold text-green-600">{selectedData.profitMargin}%</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Detailed Cost Breakdown</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="text-left p-3 border border-slate-200">Cost Category</th>
                  <th className="text-right p-3 border border-slate-200">Amount</th>
                  <th className="text-right p-3 border border-slate-200">% of Revenue</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3 border border-slate-200">Inventory Cost</td>
                  <td className="text-right p-3 border border-slate-200">{formatCurrency(selectedData.costs.inventoryCost)}</td>
                  <td className="text-right p-3 border border-slate-200">
                    {Math.round((selectedData.costs.inventoryCost / selectedData.revenue) * 100)}%
                  </td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 border border-slate-200">Forward Shipping</td>
                  <td className="text-right p-3 border border-slate-200">{formatCurrency(selectedData.costs.forwardShipping)}</td>
                  <td className="text-right p-3 border border-slate-200">
                    {Math.round((selectedData.costs.forwardShipping / selectedData.revenue) * 100)}%
                  </td>
                </tr>
                <tr>
                  <td className="p-3 border border-slate-200">Reverse Shipping (RTO)</td>
                  <td className="text-right p-3 border border-slate-200">{formatCurrency(selectedData.costs.reverseShipping)}</td>
                  <td className="text-right p-3 border border-slate-200">
                    {Math.round((selectedData.costs.reverseShipping / selectedData.revenue) * 100)}%
                  </td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 border border-slate-200">Packaging</td>
                  <td className="text-right p-3 border border-slate-200">{formatCurrency(selectedData.costs.packaging)}</td>
                  <td className="text-right p-3 border border-slate-200">
                    {Math.round((selectedData.costs.packaging / selectedData.revenue) * 100)}%
                  </td>
                </tr>
                <tr>
                  <td className="p-3 border border-slate-200">Storage</td>
                  <td className="text-right p-3 border border-slate-200">{formatCurrency(selectedData.costs.storage)}</td>
                  <td className="text-right p-3 border border-slate-200">
                    {Math.round((selectedData.costs.storage / selectedData.revenue) * 100)}%
                  </td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 border border-slate-200">Marketing</td>
                  <td className="text-right p-3 border border-slate-200">{formatCurrency(selectedData.costs.marketingCost)}</td>
                  <td className="text-right p-3 border border-slate-200">
                    {Math.round((selectedData.costs.marketingCost / selectedData.revenue) * 100)}%
                  </td>
                </tr>
                <tr>
                  <td className="p-3 border border-slate-200">Operations</td>
                  <td className="text-right p-3 border border-slate-200">{formatCurrency(selectedData.costs.operationsCost)}</td>
                  <td className="text-right p-3 border border-slate-200">
                    {Math.round((selectedData.costs.operationsCost / selectedData.revenue) * 100)}%
                  </td>
                </tr>
                <tr className="bg-slate-100 font-semibold">
                  <td className="p-3 border border-slate-200">Total Costs</td>
                  <td className="text-right p-3 border border-slate-200">{formatCurrency(selectedData.costs.total)}</td>
                  <td className="text-right p-3 border border-slate-200">
                    {Math.round((selectedData.costs.total / selectedData.revenue) * 100)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Summary Analysis</h3>
            <p className="text-slate-700">
              {selectedColumn === 'shippingAll' && (
                <>
                  This model represents your current business approach of shipping all orders without any quality filtering.
                  With {selectedData.orders} orders per day and an RTO rate of {selectedData.rtoRate}%, 
                  you're achieving a {selectedData.profitMargin}% profit margin. The high RTO rate significantly impacts your
                  reverse logistics costs and overall profitability.
                </>
              )}
              
              {selectedColumn === 'scalingBusiness' && (
                <>
                  The Scale Business model focuses on increasing order volume to {selectedData.orders} orders per day
                  to match the profit of selective shipping. However, it requires significantly more upfront capital
                  and maintains the same {selectedData.rtoRate}% RTO rate, resulting in higher operational costs
                  despite the increased revenue.
                </>
              )}
              
              {selectedColumn === 'trackscoreShipping' && (
                <>
                  The TrackScore approach is the most capital efficient, focusing on quality over quantity.
                  By selecting only {selectedData.orders} high-quality orders per day, you reduce your RTO rate to just {selectedData.rtoRate}%,
                  significantly cutting reverse logistics costs and improving your profit margin to {selectedData.profitMargin}%.
                  This approach delivers the same profit as scaling but with much less capital required.
                </>
              )}
            </p>
          </div>
        </div>
        
        <div className="border-t px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 rounded-md hover:bg-slate-300 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PnlBreakdown;
