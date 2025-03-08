import { totalmem } from "os";
import prisma from "../db.server";

/**
 * Updates the total orders count in the metrics table
 * @returns {Promise<number>} The updated total orders count
 */
export const updateTotalOrders = async () => {
  try {
    const result = await prisma.metrics.update({
      where: { id: "singleton" },
      data: {
        totalOrders: await prisma.$transaction(tx => tx.order.count())
      },
    });
    return result.totalOrders;
  } catch (error) {
    console.error(error);
    return 0;
  }
};

/**
 * Retrieves all analytics data from the database
 * @returns {Promise<Object>} Combined analytics data with defaults if data is missing
 */
export async function getAnalytics() {
  // Default values for analytics components
  const defaultData = {
    profitCurve: {
      orderPoints: [],
      profitValues: [],
      optimalZone: { maxOrder: 0, maxProfit: 0 },
    },
    metrics: {
      cutOffQuality: 0,
      totalOrders: 0,
      flaggedOrders: 0,
      ordersToShip: 0,
      tracksureDelivery: 0,
    },
    performanceMetrics: {
      allShipping: { totalOrders: 0, deliveryPercentage: 0, undeliveredOrders: 0 },
      trackscore: { totalOrders: 0, deliveryPercentage: 0, undeliveredOrders: 0 },
    },
    costs: {
      allShipping: { revenue: 0, productCosts: 0, adCosts: 0, shippingCosts: 0, packingCosts: 0 },
      trackscore: { revenue: 0, productCosts: 0, adCosts: 0, shippingCosts: 0, packingCosts: 0 },
    },
    summary: {
      allShipping: { netProfit: 0, inventrySaved: 0, capitalUsed: 0, capitalSaved: 0, capitalEfficiency: 0, totalSavings: 0 },
      trackscore: { netProfit: 0, inventrySaved: 0, capitalUsed: 0, capitalSaved: 0, capitalEfficiency: 0, totalSavings: 0 },
    },
  };

  // Fetch all analytics components in parallel
  const [profitCurve, metrics, performance, costs, summary] = await Promise.all([
    prisma.profitCurve.findUnique({ where: { id: "singleton" } }),
    prisma.metrics.findUnique({ where: { id: "singleton" } }),
    prisma.performance.findUnique({ where: { id: "singleton" } }),
    prisma.costs.findUnique({ where: { id: "singleton" } }),
    prisma.summary.findUnique({ where: { id: "singleton" } }),
  ]);

  // Transform and combine the data, using defaults for missing data
  return {
    profitCurve: profitCurve ? {
      orderPoints: JSON.parse(profitCurve.orderPoints),
      profitValues: JSON.parse(profitCurve.profitValues),
      optimalZone: {
        maxOrder: profitCurve.maxOrder,
        maxProfit: profitCurve.maxProfit,
      },
    } : defaultData.profitCurve,

    metrics: metrics ? {
      ...metrics,
      totalOrders: await updateTotalOrders(),
    } : defaultData.metrics,

    performanceMetrics: performance ? {
      allShipping: JSON.parse(performance.allShipping),
      trackscore: JSON.parse(performance.trackscore),
    } : defaultData.performanceMetrics,

    costs: costs ? {
      allShipping: JSON.parse(costs.allShipping),
      trackscore: JSON.parse(costs.trackscore),
    } : defaultData.costs,

    summary: summary ? {
      allShipping: JSON.parse(summary.allShipping),
      trackscore: JSON.parse(summary.trackscore),
    } : defaultData.summary,
  };
}

// Example usage
// const result = await updateAnalyticsData();
// if (result.success) {
//   console.log(result.message);
// } else {
//   console.error(result.message);
// } 


// export async function updateAnalyticsData() {
//   try {
//     // Update Performance Metrics
//     await prisma.performance.upsert({
//       where: { id: "singleton" },
//       update: {
//         allShipping: JSON.stringify({
//           totalOrders: 156,
//           deliveryPercentage: 55,
//           undeliveredOrders: 36,
//         }),
//         trackscore: JSON.stringify({
//           totalOrders: 120,
//           deliveryPercentage: 78,
//           undeliveredOrders: 10,
//         }),
//       },
//       create: {
//         id: "singleton",
//         allShipping: JSON.stringify({
//           totalOrders: 156,
//           deliveryPercentage: 55,
//           undeliveredOrders: 36,
//         }),
//         trackscore: JSON.stringify({
//           totalOrders: 120,
//           deliveryPercentage: 78,
//           undeliveredOrders: 10,
//         }),
//       },
//     });

//     // Update Costs
//     await prisma.costs.upsert({
//       where: { id: "singleton" },
//       update: {
//         allShipping: JSON.stringify({
//           revenue: 3200,
//           productCosts: 10000,
//           adCosts: 8000,
//           shippingCosts: 5500,
//           packingCosts: 1020,
//         }),
//         trackscore: JSON.stringify({
//           revenue: 3100,
//           productCosts: 8400,
//           adCosts: 8000,
//           shippingCosts: 4620,
//           packingCosts: 660,
//         }),
//       },
//       create: {
//         id: "singleton",
//         allShipping: JSON.stringify({
//           revenue: 3200,
//           productCosts: 10000,
//           adCosts: 8000,
//           shippingCosts: 5500,
//           packingCosts: 1020,
//         }),
//         trackscore: JSON.stringify({
//           revenue: 3100,
//           productCosts: 8400,
//           adCosts: 8000,
//           shippingCosts: 4620,
//           packingCosts: 660,
//         }),
//       },
//     });

//     // Update Summary
//     await prisma.summary.upsert({
//       where: { id: "singleton" },
//       update: {
//         allShipping: JSON.stringify({
//           netProfit: 7480,
//           inventrySaved: 0,
//           capitalUsed: 24520,
//           capitalSaved: 0,
//           capitalEfficiency: 0,
//           totalSavings: 0,
//         }),
//         trackscore: JSON.stringify({
//           netProfit: 9320,
//           inventrySaved: 8,
//           capitalUsed: 21680,
//           capitalSaved: 2840,
//           capitalEfficiency: 0,
//           totalSavings: 4680,
//         }),
//       },
//       create: {
//         id: "singleton",
//         allShipping: JSON.stringify({
//           netProfit: 7480,
//           inventrySaved: 0,
//           capitalUsed: 24520,
//           capitalSaved: 0,
//           capitalEfficiency: 0,
//           totalSavings: 0,
//         }),
//         trackscore: JSON.stringify({
//           netProfit: 9320,
//           inventrySaved: 8,
//           capitalUsed: 21680,
//           capitalSaved: 2840,
//           capitalEfficiency: 0,
//           totalSavings: 4680,
//         }),
//       },
//     });

//     return { success: true, message: "Analytics data updated successfully" };
//   } catch (error) {
//     console.error("Error updating analytics data:", error);
//     return { success: false, message: error.message };
//   }
// }
