
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS "products" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "barcode" text,
    "sku" text,
    "name" text,
    "category" text,
    "location" text,
    "specification" text,
    "unit" text,
    "stock" numeric DEFAULT 0,
    "expiryDate" text,
    "mfgDate" text,
    "shelfLife" numeric,
    "status" text,
    "imageUrl" text,
    "standardPrice" numeric DEFAULT 0,
    "wholesalePrice" numeric DEFAULT 0,
    "wholesalePrice2" numeric DEFAULT 0,
    "purchasePrice" numeric DEFAULT 0,
    "origin" text,
    "brand" text,
    "warehouse" text,
    "createdAt" timestamptz DEFAULT now(),
    "updatedAt" timestamptz DEFAULT now(),
    "updatedBy" text,
    "description" text,
    "expiryLogs" jsonb DEFAULT '[]'::jsonb,
    "relevantBatch" text,
    "relevantQty" numeric
);

-- 2. INVENTORY TABLE (Item level tracking)
CREATE TABLE IF NOT EXISTS "inventory" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "productId" uuid,
    "productCode" text,
    "productName" text,
    "location" text,
    "quantity" numeric DEFAULT 0,
    "warehouse" text,
    "category" text,
    "updatedAt" timestamptz DEFAULT now(),
    "expiryDate" text,
    "batchNumber" text
);

-- 3. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS "transactions" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "type" text,
    "productId" uuid,
    "productName" text,
    "fromLocation" text,
    "toLocation" text,
    "quantity" numeric,
    "timestamp" timestamptz DEFAULT now(),
    "user" text,
    "referenceId" text
);

-- 4. SHELF LOGS TABLE
CREATE TABLE IF NOT EXISTS "shelf_logs" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "productId" uuid,
    "productName" text,
    "barcode" text,
    "sku" text,
    "oldLocation" text,
    "newLocation" text,
    "timestamp" timestamptz DEFAULT now(),
    "operator" text,
    "method" text
);

-- 5. WAREHOUSES TABLE
CREATE TABLE IF NOT EXISTS "warehouses" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" text,
    "code" text,
    "type" text,
    "isMain" boolean DEFAULT false,
    "status" text
);

-- 6. TASKS TABLE
CREATE TABLE IF NOT EXISTS "tasks" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "title" text,
    "isCompleted" boolean DEFAULT false,
    "dueDate" text,
    "priority" text,
    "createdAt" timestamptz DEFAULT now()
);

-- 7. ADJUSTMENT BILLS TABLE
CREATE TABLE IF NOT EXISTS "adjustment_bills" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "serialNumber" text,
    "createdAt" timestamptz DEFAULT now(),
    "createdBy" text,
    "items" jsonb DEFAULT '[]'::jsonb,
    "note" text,
    "status" text,
    "reviewedBy" text,
    "reviewedAt" timestamptz
);

-- 8. USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS "user_profiles" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" text,
    "username" text,
    "email" text,
    "phone" text,
    "plateNumber" text,
    "employmentType" text,
    "role" text,
    "avatar" text,
    "status" text,
    "permissions" jsonb DEFAULT '[]'::jsonb,
    "landingPage" text,
    "country" text,
    "notificationSettings" jsonb,
    "password" text,
    "customConfig" jsonb
);

-- 9. ROLE CONFIGS TABLE
CREATE TABLE IF NOT EXISTS "role_configs" (
    "role" text PRIMARY KEY,
    "config" jsonb
);

-- 10. DISTRIBUTION ORDERS TABLE
CREATE TABLE IF NOT EXISTS "distribution_orders" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "orderNumber" text,
    "receivingBranch" text,
    "receivingBranchCode" text,
    "status" text,
    "salesman" text,
    "department" text,
    "shippingWarehouse" text,
    "remarks" text,
    "dispatchDate" text,
    "paymentDate" text,
    "items" jsonb DEFAULT '[]'::jsonb,
    "createTime" timestamptz DEFAULT now(),
    "creator" text,
    "branchBalance" numeric,
    "creditLimit" numeric,
    "currentCreditBalance" numeric,
    "deliveryDetails" jsonb,
    "assignedDriverId" text,
    "driverNote" text,
    "assignedAt" timestamptz,
    "geoVerified" boolean,
    "geofenceVerified" boolean,
    "distanceToOutlet" numeric,
    "proofOfDelivery" text,
    "signature" text,
    "deliveryTimestamp" timestamptz,
    "scheduledBy" text,
    "scheduledAt" timestamptz,
    "pickedCompletedBy" text,
    "pickedByUserId" text,
    "pickedByName" text
);

-- 11. OUTLETS TABLE
CREATE TABLE IF NOT EXISTS "outlets" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "recipient" text,
    "phone" text,
    "deliveryMethod" text,
    "postCode" text,
    "address" text,
    "unit" text,
    "deliveryTime" text,
    "sendPeriod" text,
    "latitude" numeric,
    "longitude" numeric,
    "geofenceRadius" numeric
);

-- 12. DRIVERS TABLE
CREATE TABLE IF NOT EXISTS "drivers" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" text,
    "phone" text,
    "plateNumber" text,
    "type" text,
    "vehicleType" text,
    "deliveryMethods" jsonb DEFAULT '[]'::jsonb,
    "maxPacks" numeric,
    "currentPacks" numeric,
    "avatar" text
);

-- 13. PURCHASE ORDERS TABLE
CREATE TABLE IF NOT EXISTS "purchase_orders" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "poNumber" text,
    "supplier" text,
    "orderDate" text,
    "expectedDate" text,
    "status" text,
    "totalAmount" numeric,
    "items" jsonb DEFAULT '[]'::jsonb,
    "createdBy" text
);

-- 14. RECEIVING ORDERS TABLE
CREATE TABLE IF NOT EXISTS "receiving_orders" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "receivingSerial" text,
    "purchaseSerial" text,
    "supplierName" text,
    "receivingBranch" text,
    "receiptDate" text,
    "reviewStatus" text,
    "creator" text,
    "createTime" timestamptz DEFAULT now(),
    "modificationTime" timestamptz,
    "reviewer" text,
    "reviewTime" timestamptz,
    "numberOfPieces" numeric,
    "orderStatus" text,
    "remarks" text,
    "items" jsonb DEFAULT '[]'::jsonb,
    "receivingWarehouse" text,
    "department" text
);

-- 15. DISCREPANCY REPORTS TABLE
CREATE TABLE IF NOT EXISTS "discrepancy_reports" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "packageNo" text,
    "orderNumber" text,
    "branchName" text,
    "receivedPerson" text,
    "reportDate" text,
    "status" text,
    "items" jsonb DEFAULT '[]'::jsonb,
    "createdAt" timestamptz DEFAULT now(),
    "approvalRemark" text,
    "approvedBy" text,
    "approvedAt" timestamptz
);

-- 16. SHELF LANES TABLE (Added for persistence)
CREATE TABLE IF NOT EXISTS "shelf_lanes" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "laneCode" text,
    "sortOrder" numeric,
    "shelfCount" numeric,
    "shelfRows" numeric,
    "shelfCols" numeric,
    "warehouseId" text,
    "warehouseName" text,
    "warehouseCode" text,
    "areaName" text,
    "areaCode" text,
    "storageNum" numeric
);

-- MIGRATION: Add columns if they don't exist (for existing databases)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='discrepancy_reports' AND column_name='approvalRemark') THEN
        ALTER TABLE "discrepancy_reports" ADD COLUMN "approvalRemark" text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='discrepancy_reports' AND column_name='approvedBy') THEN
        ALTER TABLE "discrepancy_reports" ADD COLUMN "approvedBy" text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='discrepancy_reports' AND column_name='approvedAt') THEN
        ALTER TABLE "discrepancy_reports" ADD COLUMN "approvedAt" timestamptz;
    END IF;
END $$;

-- ENABLE ROW LEVEL SECURITY AND ADD PUBLIC ACCESS POLICIES
DO $$ 
DECLARE 
    tbl text;
BEGIN
    FOR tbl IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Enable all access" ON %I;', tbl);
        EXECUTE format('CREATE POLICY "Enable all access" ON %I FOR ALL USING (true) WITH CHECK (true);', tbl);
    END LOOP;
END $$;
