export interface DashboardSettings {
  id: string;
  initialThreshold: number;
  totalOrders: number;
  flaggedOrders: number;
  ordersToShip: number;
  deliveryRate: number;
  previousDeliveryRate: number;
  dailySavings: number;
}

export interface DashboardCosts {
  id: string;
  forwardShipping: number;
  reverseShipping: number;
  packaging: number;
  storage: number;
  averageStorageDays: number;
  inventoryCostPerOrder: number;
  marketingCostPerOrder: number;
  operationsCostPerOrder: number;
}

export interface BusinessMetrics {
  id: string;
  type: 'BASE' | 'SHIP_ALL';
  profit: number;
  percentage: number;
  upfrontCost: number;
  capitalEfficiency: number;
  rtoRate: number;
}

export interface DashboardData {
  settings: DashboardSettings;
  costs: DashboardCosts;
  baseMetrics: BusinessMetrics;
  shipAllMetrics: BusinessMetrics;
}