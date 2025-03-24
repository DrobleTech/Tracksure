import { PrismaClient } from "@prisma/client";
import { DASHBOARD_DATA } from "../constants/dashboardData";

const prisma = new PrismaClient();

const DEFAULT_MODES = [
  {
    modeId: 'aggressive',
    name: 'Aggressive Growth',
    description: 'Focuses on high revenue and only removes critical orders, keeps the maximum volume.',
    threshold: 85,
    isActive: false
  },
  {
    modeId: 'balanced',
    name: 'Balanced Profit',
    description: 'Maintains balance between aggressive and maximum profit.',
    threshold: 70,
    isActive: true
  },
  {
    modeId: 'maximum',
    name: 'Maximum Profit',
    description: 'Focuses on maintaining low upfront costs and maximizing net profit.',
    threshold: 50,
    isActive: false
  }
];

export async function initializeDashboardData() {
  // Initialize Dashboard Settings
  const existingSettings = await prisma.dashboardSettings.findFirst();
  if (!existingSettings) {
    await prisma.dashboardSettings.create({
      data: {
        initialThreshold: DASHBOARD_DATA.INITIAL_THRESHOLD,
        totalOrders: DASHBOARD_DATA.METRICS.TOTAL_ORDERS,
        flaggedOrders: DASHBOARD_DATA.METRICS.FLAGGED_ORDERS,
        ordersToShip: DASHBOARD_DATA.METRICS.ORDERS_TO_SHIP,
        deliveryRate: DASHBOARD_DATA.METRICS.DELIVERY_RATE,
        previousDeliveryRate: DASHBOARD_DATA.METRICS.PREVIOUS_DELIVERY_RATE,
        dailySavings: DASHBOARD_DATA.DAILY_SAVINGS,
      },
    });
  }

  // Initialize Dashboard Costs
  const existingCosts = await prisma.dashboardCosts.findFirst();
  if (!existingCosts) {
    await prisma.dashboardCosts.create({
      data: {
        forwardShipping: DASHBOARD_DATA.COSTS.FORWARD_SHIPPING,
        reverseShipping: DASHBOARD_DATA.COSTS.REVERSE_SHIPPING,
        packaging: DASHBOARD_DATA.COSTS.PACKAGING,
        storage: DASHBOARD_DATA.COSTS.STORAGE,
        averageStorageDays: DASHBOARD_DATA.COSTS.AVERAGE_STORAGE_DAYS,
        inventoryCostPerOrder: DASHBOARD_DATA.COSTS.INVENTORY_COST_PER_ORDER,
        marketingCostPerOrder: DASHBOARD_DATA.COSTS.MARKETING_COST_PER_ORDER,
        operationsCostPerOrder: DASHBOARD_DATA.COSTS.OPERATIONS_COST_PER_ORDER,
      },
    });
  }

  // Initialize Business Metrics
  const existingBaseMetrics = await prisma.businessMetrics.findUnique({
    where: { type: 'BASE' },
  });
  if (!existingBaseMetrics) {
    await prisma.businessMetrics.create({
      data: {
        type: 'BASE',
        profit: DASHBOARD_DATA.BASE_METRICS.PROFIT,
        percentage: DASHBOARD_DATA.BASE_METRICS.PERCENTAGE,
        upfrontCost: DASHBOARD_DATA.BASE_METRICS.UPFRONT_COST,
        capitalEfficiency: DASHBOARD_DATA.BASE_METRICS.CAPITAL_EFFICIENCY,
        rtoRate: DASHBOARD_DATA.BASE_METRICS.RTO_RATE,
      },
    });
  }

  const existingShipAllMetrics = await prisma.businessMetrics.findUnique({
    where: { type: 'SHIP_ALL' },
  });
  if (!existingShipAllMetrics) {
    await prisma.businessMetrics.create({
      data: {
        type: 'SHIP_ALL',
        profit: DASHBOARD_DATA.SHIP_ALL_METRICS.PROFIT,
        percentage: DASHBOARD_DATA.SHIP_ALL_METRICS.PERCENTAGE,
        upfrontCost: DASHBOARD_DATA.SHIP_ALL_METRICS.UPFRONT_COST,
        capitalEfficiency: DASHBOARD_DATA.SHIP_ALL_METRICS.CAPITAL_EFFICIENCY,
        rtoRate: DASHBOARD_DATA.SHIP_ALL_METRICS.RTO_RATE,
      },
    });
  }

  // Initialize Cutoff Modes
  const existingModes = await prisma.cutoffMode.findMany();
  if (existingModes.length === 0) {
    await Promise.all(
      DEFAULT_MODES.map(mode =>
        prisma.cutoffMode.create({
          data: mode
        }
      )
      )
    );
  }
}

export async function getDashboardData() {
  const [settings, costs, baseMetrics, shipAllMetrics] = await Promise.all([
    prisma.dashboardSettings.findFirst(),
    prisma.dashboardCosts.findFirst(),
    prisma.businessMetrics.findUnique({ where: { type: 'BASE' } }),
    prisma.businessMetrics.findUnique({ where: { type: 'SHIP_ALL' } }),
  ]);

  return {
    settings,
    costs,
    baseMetrics,
    shipAllMetrics,
  };
}

export async function updateDashboardSettings(data) {
  return prisma.dashboardSettings.update({
    where: { id: data.id },
    data
  });
}

export async function updateDashboardCosts(data) {
  return prisma.dashboardCosts.update({
    where: { id: data.id },
    data
  });
}

export async function updateBusinessMetrics(type, data) {
  return prisma.businessMetrics.update({
    where: { type },
    data
  });
}

export async function updateCutoffMode(modeId) {
  // Deactivate all modes
  await prisma.cutoffMode.updateMany({
    data: { isActive: false }
  });
  
  // Activate the selected mode
  return prisma.cutoffMode.update({
    where: { modeId },
    data: { isActive: true }
  });
}

export async function getCutoffModes() {
  return prisma.cutoffMode.findMany({
    orderBy: { threshold: 'desc' }
  });
}