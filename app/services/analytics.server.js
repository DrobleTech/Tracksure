// import { totalmem } from "os";
// import prisma from "../db.server";

// /**
//  * Updates the total orders count in the metrics table
//  * @returns {Promise<number>} The updated total orders count
//  */
// export const updateTotalOrders = async () => {
//   try {
//     const result = await prisma.metrics.update({
//       where: { id: "singleton" },
//       data: {
//         totalOrders: await prisma.$transaction(tx => tx.order.count())
//       },
//     });
//     return result.totalOrders;
//   } catch (error) {
//     console.error(error);
//     return 0;
//   }
// };

// /**
//  * Retrieves all analytics data from the database
//  * @returns {Promise<Object>} Combined analytics data with defaults if data is missing
//  */
// export async function getAnalytics() {
//   // Default values for analytics components
//   const defaultData = {
//     profitCurve: {
//       orderPoints: [],
//       profitValues: [],
//       optimalZone: { maxOrder: 0, maxProfit: 0 },
//     },
//     metrics: {
//       cutOffQuality: 0,
//       totalOrders: 0,
//       flaggedOrders: 0,
//       ordersToShip: 0,
//       tracksureDelivery: 0,
//     },
//     performanceMetrics: {
//       allShipping: { totalOrders: 0, deliveryPercentage: 0, undeliveredOrders: 0 },
//       trackscore: { totalOrders: 0, deliveryPercentage: 0, undeliveredOrders: 0 },
//     },
//     costs: {
//       allShipping: { revenue: 0, productCosts: 0, adCosts: 0, shippingCosts: 0, packingCosts: 0 },
//       trackscore: { revenue: 0, productCosts: 0, adCosts: 0, shippingCosts: 0, packingCosts: 0 },
//     },
//     summary: {
//       allShipping: { netProfit: 0, inventrySaved: 0, capitalUsed: 0, capitalSaved: 0, capitalEfficiency: 0, totalSavings: 0 },
//       trackscore: { netProfit: 0, inventrySaved: 0, capitalUsed: 0, capitalSaved: 0, capitalEfficiency: 0, totalSavings: 0 },
//     },
//   };

//   // Fetch all analytics components in parallel
//   const [profitCurve, metrics, performance, costs, summary] = await Promise.all([
//     prisma.profitCurve.findUnique({ where: { id: "singleton" } }),
//     prisma.metrics.findUnique({ where: { id: "singleton" } }),
//     prisma.performance.findUnique({ where: { id: "singleton" } }),
//     prisma.costs.findUnique({ where: { id: "singleton" } }),
//     prisma.summary.findUnique({ where: { id: "singleton" } }),
//   ]);

//   // Transform and combine the data, using defaults for missing data
//   return {
//     profitCurve: profitCurve ? {
//       orderPoints: JSON.parse(profitCurve.orderPoints),
//       profitValues: JSON.parse(profitCurve.profitValues),
//       optimalZone: {
//         maxOrder: profitCurve.maxOrder,
//         maxProfit: profitCurve.maxProfit,
//       },
//     } : defaultData.profitCurve,

//     metrics: metrics ? {
//       ...metrics,
//       totalOrders: await updateTotalOrders(),
//     } : defaultData.metrics,

//     performanceMetrics: performance ? {
//       allShipping: JSON.parse(performance.allShipping),
//       trackscore: JSON.parse(performance.trackscore),
//     } : defaultData.performanceMetrics,

//     costs: costs ? {
//       allShipping: JSON.parse(costs.allShipping),
//       trackscore: JSON.parse(costs.trackscore),
//     } : defaultData.costs,

//     summary: summary ? {
//       allShipping: JSON.parse(summary.allShipping),
//       trackscore: JSON.parse(summary.trackscore),
//     } : defaultData.summary,
//   };
// }

// /**
//  * Gets default values for analytics initialization
//  */
// function getDefaultAnalyticsData() {
//   return {
//     metrics: {
//       cutOffQuality: 70,
//       totalOrders: 156,
//       flaggedOrders: 10,
//       ordersToShip: 146,
//       tracksureDelivery: 10,
//     },
//     profitCurve: {
//       orderPoints: "[0, 20, 40, 60, 80, 100, 120, 140, 154]",
//       profitValues: "[0, 1000, 2800, 4500, 6800, 8200, 9100, 8800, 7500]",
//       maxOrder: 120,
//       maxProfit: 9100,
//     },
//     performance: {
//       allShipping: JSON.stringify({
//         totalOrders: 156,
//         deliveryPercentage: 55,
//         undeliveredOrders: 36,
//       }),
//       trackscore: JSON.stringify({
//         totalOrders: 120,
//         deliveryPercentage: 78,
//         undeliveredOrders: 10,
//       }),
//     },
//     costs: {
//       allShipping: JSON.stringify({
//         revenue: 3200,
//         productCosts: 10000,
//         adCosts: 8000,
//         shippingCosts: 5500,
//         packingCosts: 1020,
//       }),
//       trackscore: JSON.stringify({
//         revenue: 3100,
//         productCosts: 8400,
//         adCosts: 8000,
//         shippingCosts: 4620,
//         packingCosts: 660,
//       }),
//     },
//     summary: {
//       allShipping: JSON.stringify({
//         netProfit: 7480,
//         inventrySaved: 0,
//         capitalUsed: 24520,
//         capitalSaved: 0,
//         capitalEfficiency: 0,
//         totalSavings: 0,
//       }),
//       trackscore: JSON.stringify({
//         netProfit: 9320,
//         inventrySaved: 8,
//         capitalUsed: 21680,
//         capitalSaved: 2840,
//         capitalEfficiency: 0,
//         totalSavings: 4680,
//       }),
//     },
//   };
// }

// /**
//  * Checks if analytics data is already initialized
//  * @returns {Promise<{initialized: boolean, missingTables: string[]}>}
//  */
// async function isAnalyticsInitialized() {
//   const tables = {
//     metrics: prisma.metrics.findUnique({ where: { id: "singleton" } }),
//     profitCurve: prisma.profitCurve.findUnique({ where: { id: "singleton" } }),
//     performance: prisma.performance.findUnique({ where: { id: "singleton" } }),
//     costs: prisma.costs.findUnique({ where: { id: "singleton" } }),
//     summary: prisma.summary.findUnique({ where: { id: "singleton" } }),
//   };

//   const results = await Promise.all(Object.values(tables));
//   const missingTables = Object.keys(tables).filter((key, index) => !results[index]);
  
//   return {
//     initialized: missingTables.length === 0,
//     missingTables,
//   };
// }

// /**
//  * Initializes analytics data only if it hasn't been initialized before
//  * @returns {Promise<{success: boolean, message: string}>}
//  */
// export async function initializeAnalyticsData() {
//   try {
//     const { initialized, missingTables } = await isAnalyticsInitialized();
    
//     if (initialized) {
//       return { success: true, message: "Analytics data already initialized" };
//     }

//     // Only initialize missing tables
//     const defaultData = getDefaultAnalyticsData();
//     const initPromises = missingTables.map(table => {
//       return prisma[table].create({
//         data: {
//           id: "singleton",
//           ...defaultData[table],
//         },
//       });
//     });

//     await Promise.all(initPromises);
//     return { 
//       success: true, 
//       message: `Initialized missing analytics tables: ${missingTables.join(", ")}` 
//     };
//   } catch (error) {
//     console.error("Error initializing analytics data:", error);
//     return { success: false, message: error.message };
//   }
// }

// /**
//  * Updates analytics data while preserving existing values
//  */
// export async function updateAnalyticsData() {
//   const defaultData = getDefaultAnalyticsData();
  
//   // Get existing data first
//   const [existingMetrics, existingProfitCurve, existingPerformance, existingCosts, existingSummary] = 
//     await Promise.all([
//       prisma.metrics.findUnique({ where: { id: "singleton" } }),
//       prisma.profitCurve.findUnique({ where: { id: "singleton" } }),
//       prisma.performance.findUnique({ where: { id: "singleton" } }),
//       prisma.costs.findUnique({ where: { id: "singleton" } }),
//       prisma.summary.findUnique({ where: { id: "singleton" } }),
//     ]);

//   // Update each table while preserving existing data
//   await prisma.metrics.upsert({
//     where: { id: "singleton" },
//     update: {
//       ...existingMetrics,
//       // Add any new fields or updates here
//     },
//     create: {
//       id: "singleton",
//       ...defaultData.metrics,
//     },
//   });

//   await prisma.profitCurve.upsert({
//     where: { id: "singleton" },
//     update: {
//       ...existingProfitCurve,
//       // Add any new fields or updates here
//     },
//     create: {
//       id: "singleton",
//       ...defaultData.profitCurve,
//     },
//   });

//   try {
//     await prisma.performance.upsert({
//       where: { id: "singleton" },
//       update: {
//         ...existingPerformance,
//         // Add any new fields or updates here
//       },
//       create: {
//         id: "singleton",
//         ...defaultData.performance,
//       },
//     });

//     await prisma.costs.upsert({
//       where: { id: "singleton" },
//       update: {
//         ...existingCosts,
//         // Add any new fields or updates here
//       },
//       create: {
//         id: "singleton",
//         ...defaultData.costs,
//       },
//     });

//     await prisma.summary.upsert({
//       where: { id: "singleton" },
//       update: {
//         ...existingSummary,
//         // Add any new fields or updates here
//       },
//       create: {
//         id: "singleton",
//         ...defaultData.summary,
//       },
//     });

//     return { success: true, message: "Analytics data updated successfully" };
//   } catch (error) {
//     console.error("Error updating analytics data:", error);
//     return { success: false, message: error.message };
//   }
// }
