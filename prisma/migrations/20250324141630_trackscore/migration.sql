-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" DATETIME,
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false
);

-- CreateTable
CREATE TABLE "Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "state" TEXT,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderDate" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "productName" TEXT,
    "payment" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "customerId" TEXT,
    "riskVerification" TEXT NOT NULL,
    "tags" TEXT,
    "paymentValue" REAL,
    "otp" TEXT NOT NULL,
    "ivr" TEXT NOT NULL,
    "shipmentStatus" TEXT NOT NULL,
    "qualityScore" REAL,
    "tierCity" TEXT,
    "deliveryTime" TEXT,
    "cancelledAt" TEXT,
    "closed" BOOLEAN,
    "flagged" BOOLEAN,
    "shippable" BOOLEAN,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CancelOrder" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "refund" BOOLEAN NOT NULL DEFAULT false,
    "restock" BOOLEAN NOT NULL DEFAULT true,
    "reason" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DashboardSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "initialThreshold" REAL NOT NULL DEFAULT 75,
    "totalOrders" INTEGER NOT NULL DEFAULT 156,
    "flaggedOrders" INTEGER NOT NULL DEFAULT 36,
    "ordersToShip" INTEGER NOT NULL DEFAULT 120,
    "deliveryRate" REAL NOT NULL DEFAULT 78,
    "previousDeliveryRate" REAL NOT NULL DEFAULT 56,
    "dailySavings" REAL NOT NULL DEFAULT 27000,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DashboardCosts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "forwardShipping" REAL NOT NULL DEFAULT 80,
    "reverseShipping" REAL NOT NULL DEFAULT 60,
    "packaging" REAL NOT NULL DEFAULT 30,
    "storage" REAL NOT NULL DEFAULT 10,
    "averageStorageDays" INTEGER NOT NULL DEFAULT 15,
    "inventoryCostPerOrder" REAL NOT NULL DEFAULT 1200,
    "marketingCostPerOrder" REAL NOT NULL DEFAULT 200,
    "operationsCostPerOrder" REAL NOT NULL DEFAULT 150,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BusinessMetrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "profit" REAL NOT NULL,
    "percentage" REAL NOT NULL,
    "upfrontCost" REAL NOT NULL,
    "capitalEfficiency" REAL NOT NULL,
    "rtoRate" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CutoffMode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "modeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "threshold" REAL NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "lastOrderSync" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderId_key" ON "Order"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "CancelOrder_orderId_key" ON "CancelOrder"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessMetrics_type_key" ON "BusinessMetrics"("type");

-- CreateIndex
CREATE INDEX "BusinessMetrics_type_idx" ON "BusinessMetrics"("type");

-- CreateIndex
CREATE UNIQUE INDEX "CutoffMode_modeId_key" ON "CutoffMode"("modeId");

-- CreateIndex
CREATE INDEX "CutoffMode_isActive_idx" ON "CutoffMode"("isActive");
